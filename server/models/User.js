// server/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');


const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6,
    select: false // Don't return password in queries by default
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    match: [/^[0-9]{10}$/, 'Please provide a valid 10-digit phone number']
  },
  bloodGroup: {
    type: String,
    required: [true, 'Blood group is required'],
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
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
  },
  isDonor: {
    type: Boolean,
    default: true
  },
  lastDonation: {
    type: Date,
    default: null
  },
  donationHistory: [{
    requestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BloodRequest'
    },
    donatedAt: {
      type: Date,
      default: Date.now
    },
    recipientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  requestHistory: [{
    requestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BloodRequest'
    },
    requestedAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['pending', 'fulfilled', 'cancelled'],
      default: 'pending'
    }
  }],
  isEligibleToDonate: {
    type: Boolean,
    default: true
  },
  avatar: {
    type: String,
    default: 'default-avatar.png'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create a geospatial index for location-based queries
// UserSchema.index({ location: '2dsphere' });
UserSchema.index({ 'location.coordinates': '2dsphere' });

// Hash password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to check if password matches
UserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Method to check if user is eligible to donate based on last donation date
UserSchema.methods.checkDonationEligibility = function() {
  if (!this.lastDonation) return true;
  
  // Standard eligibility: 3 months (90 days) since last donation
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setDate(threeMonthsAgo.getDate() - 90);
  
  return this.lastDonation < threeMonthsAgo;
};

module.exports = mongoose.model('User', UserSchema);