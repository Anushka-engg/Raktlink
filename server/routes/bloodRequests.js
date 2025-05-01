// server/routes/bloodRequests.js
const express = require('express');
const router = express.Router();
const { 
  createBloodRequest,
  getBloodRequests,
  getBloodRequestById,
  updateBloodRequest,
  cancelBloodRequest,
  respondToBloodRequest,
  completeDonation
} = require('../controllers/bloodRequestController');
const { 
  protect, 
  isDonor,
  isEligibleToDonate, 
  updateLocation 
} = require('../middleware/authMiddleware');

// Create a new blood request
router.post('/', protect, updateLocation, createBloodRequest);

// Get all blood requests (with optional filters)
router.get('/', protect, getBloodRequests);

// Get a specific blood request by ID
router.get('/:id', protect, getBloodRequestById);

// Update a blood request
router.put('/:id', protect, updateBloodRequest);

// Cancel a blood request
router.put('/:id/cancel', protect, cancelBloodRequest);

// Respond to a blood request (accept/decline)
router.post('/:id/respond', protect, isDonor, isEligibleToDonate, respondToBloodRequest);

// Mark donation as completed
router.put('/:id/complete', protect, completeDonation);

module.exports = router;