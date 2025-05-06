// server/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Middleware to protect routes that require authentication
 * It verifies the JWT token and attaches the user to the request
 */
exports.protect = async (req, res, next) => {
  let token;
  
  // Check if token exists in the Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];
      
      // Verify token
      const decoded = jwt.verify(token, 'cbcba5e2a8b2466b4bf23ad863085a998994443d6d18bac4ff519bb5ace34605');
      
      // Get user from the token
      req.user = await User.findById(decoded.id).select('-password');
      
      next();
    } catch (error) {
      console.error('Authentication error:', error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }
  
  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

/**
 * Middleware to check if user is a donor
 * Must be used after the protect middleware
 */
exports.isDonor = (req, res, next) => {
  if (req.user && req.user.isDonor) {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as a donor' });
  }
};

/**
 * Middleware to check if user is eligible to donate
 * Must be used after the protect middleware
 */
exports.isEligibleToDonate = (req, res, next) => {
  if (req.user && req.user.checkDonationEligibility()) {
    next();
  } else {
    res.status(403).json({ message: 'Not eligible to donate at this time' });
  }
};

/**
 * Middleware to update user's location
 * If location is provided in the request, updates the user's location
 * Must be used after the protect middleware
 */
exports.updateLocation = async (req, res, next) => {
  try {
    if (req.body.location && req.body.location.coordinates) {
      await User.findByIdAndUpdate(req.user._id, {
        'location.coordinates': req.body.location.coordinates,
        'location.address': req.body.location.address || req.user.location.address
      });
    }
    next();
  } catch (error) {
    console.error('Location update error:', error);
    next(); // Continue even if location update fails
  }
};