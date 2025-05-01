// server/routes/auth.js
const express = require('express');
const router = express.Router();
const { 
  register, 
  login, 
  getUserProfile, 
  updateUserProfile 
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Register a new user
router.post('/register', register);

// Login user
router.post('/login', login);

// Get user profile (protected route)
router.get('/profile', protect, getUserProfile);

// Update user profile (protected route)
router.put('/profile', protect, updateUserProfile);

module.exports = router;