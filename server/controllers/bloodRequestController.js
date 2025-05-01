// server/controllers/bloodRequestController.js
const BloodRequest = require('../models/BloodRequest');
const User = require('../models/User');

// @desc    Create a new blood request
// @route   POST /api/requests
// @access  Private
exports.createBloodRequest = async (req, res) => {
  try {
    const {
      patient,
      bloodGroup,
      units,
      urgency,
      hospital,
      reason,
      additionalNotes
    } = req.body;

    // Create the blood request
    const bloodRequest = await BloodRequest.create({
      requester: req.user._id,
      patient,
      bloodGroup,
      units,
      urgency,
      hospital,
      reason,
      additionalNotes,
      // Sets expiresAt based on urgency
      expiresAt: getExpiryDate(urgency)
    });

    if (bloodRequest) {
      // Find potential donors in the area
      const potentialDonors = await findPotentialDonors(
        bloodGroup,
        hospital.location.coordinates,
        getRadiusByUrgency(urgency)
      );

      // Add to notified donors
      bloodRequest.notifiedDonors = potentialDonors.map(donor => donor._id);
      await bloodRequest.save();

      // Notify potential donors via socket.io
      notifyDonors(potentialDonors, bloodRequest);

      res.status(201).json({
        _id: bloodRequest._id,
        requester: bloodRequest.requester,
        patient: bloodRequest.patient,
        bloodGroup: bloodRequest.bloodGroup,
        units: bloodRequest.units,
        urgency: bloodRequest.urgency,
        hospital: bloodRequest.hospital,
        reason: bloodRequest.reason,
        status: bloodRequest.status,
        expiresAt: bloodRequest.expiresAt,
        potentialDonorsCount: potentialDonors.length
      });
    } else {
      res.status(400).json({ message: 'Invalid blood request data' });
    }
  } catch (error) {
    console.error('Create blood request error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all blood requests
// @route   GET /api/requests
// @access  Private
exports.getBloodRequests = async (req, res) => {
  try {
    const { status, bloodGroup, location, radius } = req.query;
    const filter = {};

    // Filter by status
    if (status) filter.status = status;
    
    // Filter by blood group
    if (bloodGroup) filter.bloodGroup = bloodGroup;
    
    // Filter by location if provided
    if (location && location.coordinates && radius) {
      const [longitude, latitude] = location.coordinates.map(parseFloat);
      filter['hospital.location'] = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [longitude, latitude]
          },
          $maxDistance: parseInt(radius) * 1000 // Convert km to meters
        }
      };
    }

    const bloodRequests = await BloodRequest.find(filter)
      .populate('requester', 'name phone')
      .sort({ createdAt: -1 });

    res.json(bloodRequests);
  } catch (error) {
    console.error('Get blood requests error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get a single blood request
// @route   GET /api/requests/:id
// @access  Private
exports.getBloodRequestById = async (req, res) => {
  try {
    const bloodRequest = await BloodRequest.findById(req.params.id)
      .populate('requester', 'name phone email')
      .populate('donors.donor', 'name phone email bloodGroup');

    if (bloodRequest) {
      res.json(bloodRequest);
    } else {
      res.status(404).json({ message: 'Blood request not found' });
    }
  } catch (error) {
    console.error('Get blood request by ID error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update a blood request
// @route   PUT /api/requests/:id
// @access  Private
exports.updateBloodRequest = async (req, res) => {
  try {
    const bloodRequest = await BloodRequest.findById(req.params.id);

    if (!bloodRequest) {
      return res.status(404).json({ message: 'Blood request not found' });
    }

    // Check if user is the requester
    if (bloodRequest.requester.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized to update this request' });
    }

    // Don't allow updates if request is fulfilled or cancelled
    if (bloodRequest.status === 'fulfilled' || bloodRequest.status === 'cancelled' || bloodRequest.status === 'expired') {
      return res.status(400).json({ message: `Cannot update a request with status: ${bloodRequest.status}` });
    }

    // Update fields
    bloodRequest.patient = req.body.patient || bloodRequest.patient;
    bloodRequest.bloodGroup = req.body.bloodGroup || bloodRequest.bloodGroup;
    bloodRequest.units = req.body.units || bloodRequest.units;
    bloodRequest.urgency = req.body.urgency || bloodRequest.urgency;
    bloodRequest.hospital = req.body.hospital || bloodRequest.hospital;
    bloodRequest.reason = req.body.reason || bloodRequest.reason;
    bloodRequest.additionalNotes = req.body.additionalNotes || bloodRequest.additionalNotes;

    // If urgency changed, update expiry date
    if (req.body.urgency && req.body.urgency !== bloodRequest.urgency) {
      bloodRequest.expiresAt = getExpiryDate(req.body.urgency);
    }

    const updatedRequest = await bloodRequest.save();
    res.json(updatedRequest);
  } catch (error) {
    console.error('Update blood request error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Cancel a blood request
// @route   PUT /api/requests/:id/cancel
// @access  Private
exports.cancelBloodRequest = async (req, res) => {
  try {
    const bloodRequest = await BloodRequest.findById(req.params.id);

    if (!bloodRequest) {
      return res.status(404).json({ message: 'Blood request not found' });
    }

    // Check if user is the requester
    if (bloodRequest.requester.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized to cancel this request' });
    }

    // Don't allow cancellations if request is fulfilled or already cancelled
    if (bloodRequest.status === 'fulfilled' || bloodRequest.status === 'cancelled') {
      return res.status(400).json({ message: `Cannot cancel a request with status: ${bloodRequest.status}` });
    }

    bloodRequest.status = 'cancelled';
    const updatedRequest = await bloodRequest.save();

    // Notify donors that the request has been cancelled
    notifyDonorsOfCancellation(bloodRequest);

    res.json({
      _id: updatedRequest._id,
      status: updatedRequest.status,
      message: 'Blood request cancelled successfully'
    });
  } catch (error) {
    console.error('Cancel blood request error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Respond to a blood request (accept/decline)
// @route   POST /api/requests/:id/respond
// @access  Private
exports.respondToBloodRequest = async (req, res) => {
  try {
    const { response } = req.body; // 'accept' or 'decline'
    
    if (!['accept', 'decline'].includes(response)) {
      return res.status(400).json({ message: 'Invalid response. Must be accept or decline' });
    }

    const bloodRequest = await BloodRequest.findById(req.params.id);

    if (!bloodRequest) {
      return res.status(404).json({ message: 'Blood request not found' });
    }

    // Check if request is still active
    if (bloodRequest.status !== 'active') {
      return res.status(400).json({ message: `Cannot respond to a request with status: ${bloodRequest.status}` });
    }

    // Check if user is eligible to donate
    if (response === 'accept') {
      const user = await User.findById(req.user._id);
      if (!user.checkDonationEligibility()) {
        return res.status(400).json({ message: 'You are not eligible to donate at this time' });
      }
    }

    // Check if user has already responded to this request
    const existingResponse = bloodRequest.donors.find(
      donor => donor.donor.toString() === req.user._id.toString()
    );

    if (existingResponse) {
      // Update existing response
      existingResponse.status = response === 'accept' ? 'accepted' : 'declined';
      existingResponse.respondedAt = Date.now();
    } else {
      // Add new response
      bloodRequest.donors.push({
        donor: req.user._id,
        status: response === 'accept' ? 'accepted' : 'declined',
        respondedAt: Date.now()
      });
    }

    // Check if all units are fulfilled
    const acceptedDonors = bloodRequest.donors.filter(d => d.status === 'accepted' || d.status === 'completed');
    if (response === 'accept' && acceptedDonors.length >= bloodRequest.units) {
      bloodRequest.status = 'fulfilled';
    }

    await bloodRequest.save();

    // Notify requester about the response
    notifyRequesterOfResponse(bloodRequest, req.user._id, response);

    res.json({
      _id: bloodRequest._id,
      message: `Successfully ${response === 'accept' ? 'accepted' : 'declined'} the blood request`,
      status: bloodRequest.status
    });
  } catch (error) {
    console.error('Respond to blood request error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Mark donation as completed
// @route   PUT /api/requests/:id/complete
// @access  Private
exports.completeDonation = async (req, res) => {
  try {
    const { donorId } = req.body;
    
    const bloodRequest = await BloodRequest.findById(req.params.id);

    if (!bloodRequest) {
      return res.status(404).json({ message: 'Blood request not found' });
    }

    // Check if user is the requester
    if (bloodRequest.requester.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized to mark completion for this request' });
    }

    // Find the donor in the request
    const donorIndex = bloodRequest.donors.findIndex(
      donor => donor.donor.toString() === donorId && donor.status === 'accepted'
    );

    if (donorIndex === -1) {
      return res.status(404).json({ message: 'Donor not found or not in accepted status' });
    }

    // Update donor status to completed
    bloodRequest.donors[donorIndex].status = 'completed';
    bloodRequest.donors[donorIndex].completedAt = Date.now();

    // Update the donor's last donation date
    await User.findByIdAndUpdate(donorId, {
      lastDonation: Date.now(),
      $push: {
        donationHistory: {
          requestId: bloodRequest._id,
          recipientId: bloodRequest.requester
        }
      }
    });

    // Update requester's request history
    await User.findByIdAndUpdate(bloodRequest.requester, {
      $push: {
        requestHistory: {
          requestId: bloodRequest._id,
          status: 'fulfilled'
        }
      }
    });

    // Check if all needed donors have completed their donations
    const completedDonations = bloodRequest.donors.filter(d => d.status === 'completed').length;
    
    if (completedDonations >= bloodRequest.units) {
      bloodRequest.status = 'fulfilled';
    }

    await bloodRequest.save();

    res.json({
      _id: bloodRequest._id,
      message: 'Donation marked as completed successfully',
      status: bloodRequest.status
    });
  } catch (error) {
    console.error('Complete donation error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Helper function to get expiry date based on urgency
const getExpiryDate = (urgency) => {
  const now = new Date();
  
  switch (urgency) {
    case 'critical':
      now.setHours(now.getHours() + 3); // 3 hours
      break;
    case 'high':
      now.setHours(now.getHours() + 6); // 6 hours
      break;
    case 'medium':
      now.setHours(now.getHours() + 12); // 12 hours
      break;
    default: // 'low'
      now.setHours(now.getHours() + 24); // 24 hours
  }
  
  return now;
};

// Helper function to get search radius based on urgency
const getRadiusByUrgency = (urgency) => {
  switch (urgency) {
    case 'critical':
      return 10; // 10 km
    case 'high':
      return 7; // 7 km
    case 'medium':
      return 5; // 5 km
    default: // 'low'
      return 3; // 3 km
  }
};

// Helper function to find potential donors
const findPotentialDonors = async (bloodGroup, coordinates, maxDistance) => {
  // Get compatible blood groups for the requested type
  const compatibleGroups = BloodRequest.getCompatibleDonors(bloodGroup);
  
  // Find eligible donors within the specified radius
  const donors = await User.find({
    bloodGroup: { $in: compatibleGroups },
    isDonor: true,
    isEligibleToDonate: true,
    'location.coordinates': {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates
        },
        $maxDistance: maxDistance * 1000 // Convert km to meters
      }
    }
  }).select('_id name phone email bloodGroup location');
  
  return donors;
};

// Helper function to notify donors about a new request
const notifyDonors = (donors, bloodRequest) => {
  const io = require('../utils/socket').getIO();
  
  if (!io) return;
  
  // Simplified request data to send to donors
  const requestData = {
    _id: bloodRequest._id,
    bloodGroup: bloodRequest.bloodGroup,
    urgency: bloodRequest.urgency,
    hospital: {
      name: bloodRequest.hospital.name,
      address: bloodRequest.hospital.location.address
    },
    expiresAt: bloodRequest.expiresAt
  };
  
  // Notify each donor individually
  donors.forEach(donor => {
    io.to(donor._id.toString()).emit('new_blood_request', requestData);
  });
};

// Helper function to notify requester about donor response
const notifyRequesterOfResponse = (bloodRequest, donorId, response) => {
  const io = require('../utils/socket').getIO();
  
  if (!io) return;
  
  io.to(bloodRequest.requester.toString()).emit('donor_response', {
    requestId: bloodRequest._id,
    donorId,
    response
  });
};

// Helper function to notify donors about request cancellation
const notifyDonorsOfCancellation = (bloodRequest) => {
  const io = require('../utils/socket').getIO();
  
  if (!io) return;
  
  // Notify each previously notified donor
  bloodRequest.notifiedDonors.forEach(donorId => {
    io.to(donorId.toString()).emit('request_cancelled', {
      requestId: bloodRequest._id
    });
  });
};