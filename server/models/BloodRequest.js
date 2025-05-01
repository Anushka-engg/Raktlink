// server/models/BloodRequest.js
const mongoose = require('mongoose');

const BloodRequestSchema = new mongoose.Schema({
  requester: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  patient: {
    name: {
      type: String,
      required: [true, 'Patient name is required']
    },
    age: {
      type: Number,
      required: [true, 'Patient age is required']
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
      required: [true, 'Patient gender is required']
    }
  },
  bloodGroup: {
    type: String,
    required: [true, 'Blood group is required'],
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
  },
  units: {
    type: Number,
    required: [true, 'Number of units required'],
    min: 1,
    max: 10
  },
  urgency: {
    type: String,
    enum: ['critical', 'high', 'medium', 'low'],
    default: 'medium'
  },
  hospital: {
    name: {
      type: String,
      required: [true, 'Hospital name is required']
    },
    location: {
      type: {
        type: String,
        default: 'Point',
        enum: ['Point']
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true
      },
      address: {
        type: String,
        required: true
      }
    }
  },
  reason: {
    type: String,
    required: [true, 'Reason for blood request is required']
  },
  status: {
    type: String,
    enum: ['active', 'fulfilled', 'cancelled', 'expired'],
    default: 'active'
  },
  donors: [{
    donor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'declined', 'completed'],
      default: 'pending'
    },
    respondedAt: {
      type: Date,
      default: Date.now
    },
    completedAt: {
      type: Date,
      default: null
    }
  }],
  notifiedDonors: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  expiresAt: {
    type: Date,
    default: function() {
      const now = new Date();
      // Default expiry time is 24 hours from creation
      now.setHours(now.getHours() + 24);
      return now;
    }
  },
  additionalNotes: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create a geospatial index for hospital location
BloodRequestSchema.index({ 'hospital.location': '2dsphere' });

// Method to check if request is expired
BloodRequestSchema.methods.isExpired = function() {
  return this.expiresAt <= new Date() || this.status === 'expired';
};

// Method to get compatible blood groups for a specific blood group
BloodRequestSchema.statics.getCompatibleDonors = function(bloodGroup) {
  // Blood group compatibility chart
  const compatibility = {
    'A+': ['A+', 'A-', 'O+', 'O-'],
    'A-': ['A-', 'O-'],
    'B+': ['B+', 'B-', 'O+', 'O-'],
    'B-': ['B-', 'O-'],
    'AB+': ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    'AB-': ['A-', 'B-', 'AB-', 'O-'],
    'O+': ['O+', 'O-'],
    'O-': ['O-']
  };
  
  return compatibility[bloodGroup] || [];
};

// Method to count fulfilled units
BloodRequestSchema.methods.getFulfilledUnits = function() {
  return this.donors.filter(donor => donor.status === 'completed').length;
};

// Set request to expired if past expiry date
BloodRequestSchema.pre('save', function(next) {
  if (this.isExpired() && this.status === 'active') {
    this.status = 'expired';
  }
  next();
});

module.exports = mongoose.model('BloodRequest', BloodRequestSchema);