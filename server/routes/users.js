// server/routes/users.js
const express = require('express');
const router = express.Router();
const { 
  getUserProfile, 
  updateUserProfile 
} = require('../controllers/authController');
const { protect, updateLocation } = require('../middleware/authMiddleware');
const User = require('../models/User');
const BloodRequest = require('../models/BloodRequest');

// Get current user profile
router.get('/profile', protect, getUserProfile);

// Update user profile
router.put('/profile', protect, updateUserProfile);

// Get nearby donors based on location and blood group
router.get('/donors', protect, async (req, res) => {
  try {
    const { bloodGroup, longitude, latitude, distance = 5 } = req.query;
    
    if (!bloodGroup || !longitude || !latitude) {
      return res.status(400).json({ 
        message: 'Blood group, longitude, and latitude are required' 
      });
    }
    
    // Get compatible blood groups
    const compatibleGroups = BloodRequest.getCompatibleDonors(bloodGroup);
    
    // Find donors within the specified radius
    const donors = await User.find({
      bloodGroup: { $in: compatibleGroups },
      isDonor: true,
      isEligibleToDonate: true,
      'location.coordinates': {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)]
          },
          $maxDistance: parseInt(distance) * 1000 // Convert km to meters
        }
      }
    }).select('name bloodGroup location lastDonation');
    
    res.json(donors);
  } catch (error) {
    console.error('Get nearby donors error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get user donation history
router.get('/donation-history', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate({
        path: 'donationHistory.requestId',
        select: 'bloodGroup hospital createdAt'
      })
      .populate({
        path: 'donationHistory.recipientId',
        select: 'name phone'
      });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user.donationHistory);
  } catch (error) {
    console.error('Get donation history error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get user request history
router.get('/request-history', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate({
        path: 'requestHistory.requestId',
        select: 'bloodGroup hospital createdAt status donors',
        populate: {
          path: 'donors.donor',
          select: 'name phone bloodGroup'
        }
      });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user.requestHistory);
  } catch (error) {
    console.error('Get request history error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update user donor status
router.put('/donor-status', protect, async (req, res) => {
  try {
    const { isDonor } = req.body;
    
    if (typeof isDonor !== 'boolean') {
      return res.status(400).json({ message: 'isDonor must be a boolean value' });
    }
    
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { isDonor },
      { new: true }
    );
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({
      _id: user._id,
      isDonor: user.isDonor,
      message: `Successfully ${isDonor ? 'enabled' : 'disabled'} donor status`
    });
  } catch (error) {
    console.error('Update donor status error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update user location
router.put('/location', protect, async (req, res) => {
  try {
    const { coordinates, address } = req.body;
    
    if (!coordinates || !coordinates.length || coordinates.length !== 2) {
      return res.status(400).json({ message: 'Valid coordinates are required [longitude, latitude]' });
    }
    
    if (!address) {
      return res.status(400).json({ message: 'Address is required' });
    }
    
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { 
        'location.coordinates': coordinates,
        'location.address': address
      },
      { new: true }
    );
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({
      _id: user._id,
      location: user.location,
      message: 'Location updated successfully'
    });
  } catch (error) {
    console.error('Update location error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get user statistics
router.get('/stats', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Get donation count
    const donationCount = user.donationHistory.length;
    
    // Get request count
    const requestCount = user.requestHistory.length;
    
    // Get successful request count
    const successfulRequestCount = user.requestHistory.filter(
      req => req.status === 'fulfilled'
    ).length;
    
    // Calculate donation frequency (donations per year)
    let donationFrequency = 0;
    if (donationCount > 0) {
      const firstDonation = user.donationHistory.sort(
        (a, b) => a.donatedAt - b.donatedAt
      )[0].donatedAt;
      
      const yearsSinceFirstDonation = (new Date() - firstDonation) / (1000 * 60 * 60 * 24 * 365);
      
      if (yearsSinceFirstDonation > 0) {
        donationFrequency = donationCount / yearsSinceFirstDonation;
      } else {
        donationFrequency = donationCount; // Less than a year
      }
    }
    
    // Check eligibility status
    const isEligible = user.checkDonationEligibility();
    
    // If not eligible, calculate days until eligible
    let daysUntilEligible = 0;
    if (!isEligible && user.lastDonation) {
      const threeMonthsFromLastDonation = new Date(user.lastDonation);
      threeMonthsFromLastDonation.setDate(threeMonthsFromLastDonation.getDate() + 90);
      
      daysUntilEligible = Math.ceil(
        (threeMonthsFromLastDonation - new Date()) / (1000 * 60 * 60 * 24)
      );
    }
    
    res.json({
      donationCount,
      requestCount,
      successfulRequestCount,
      donationFrequency: donationFrequency.toFixed(2),
      isEligible,
      daysUntilEligible: isEligible ? 0 : daysUntilEligible,
      lastDonation: user.lastDonation
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;