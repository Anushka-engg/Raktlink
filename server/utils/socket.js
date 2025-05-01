// server/utils/socket.js

/**
 * Socket.io utility module for managing real-time communication
 */

let io;

/**
 * Initialize Socket.io with the HTTP server
 * @param {Object} httpServer - The HTTP server instance
 */
exports.init = (httpServer) => {
  io = require('socket.io')(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:3000',
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);
    
    // User joins their own room for private messages
    socket.on('join', (userId) => {
      if (userId) {
        socket.join(userId);
        console.log(`User ${userId} joined their room`);
      }
    });
    
    // User sends their location update
    socket.on('update_location', (data) => {
      if (data.userId) {
        socket.join(`location_${data.userId}`);
        console.log(`User ${data.userId} updated location`);
      }
    });
    
    // Handle blood request created event
    socket.on('blood_request_created', (data) => {
      // Broadcast to all potential donors
      if (data.notifiedDonors && data.notifiedDonors.length > 0) {
        data.notifiedDonors.forEach(donorId => {
          io.to(donorId).emit('new_blood_request', {
            requestId: data.requestId,
            bloodGroup: data.bloodGroup,
            urgency: data.urgency,
            hospital: data.hospital
          });
        });
      }
    });
    
    // Handle donor response event
    socket.on('donor_response', (data) => {
      if (data.requesterId) {
        io.to(data.requesterId).emit('donor_response_update', {
          requestId: data.requestId,
          donorId: data.donorId,
          status: data.status
        });
      }
    });
    
    // Handle request status update event
    socket.on('request_status_update', (data) => {
      if (data.notifiedDonors && data.notifiedDonors.length > 0) {
        data.notifiedDonors.forEach(donorId => {
          io.to(donorId).emit('request_status_changed', {
            requestId: data.requestId,
            status: data.status
          });
        });
      }
    });
    
    // Handle direct message event
    socket.on('direct_message', (data) => {
      if (data.recipientId) {
        io.to(data.recipientId).emit('new_message', {
          senderId: data.senderId,
          message: data.message,
          timestamp: new Date()
        });
      }
    });
  
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });
  
  return io;
};

/**
 * Get the Socket.io instance
 * @returns {Object} Socket.io instance
 */
exports.getIO = () => {
  if (!io) {
    console.error('Socket.io not initialized. Call init() first.');
    return null;
  }
  return io;
};

/**
 * Send a notification to a specific user
 * @param {String} userId - User ID to send notification to
 * @param {String} type - Type of notification
 * @param {Object} data - Notification data
 */
exports.sendNotification = (userId, type, data) => {
  if (!io) {
    console.error('Socket.io not initialized. Call init() first.');
    return;
  }
  
  io.to(userId).emit('notification', {
    type,
    data,
    timestamp: new Date()
  });
};

/**
 * Broadcast a notification to all connected users
 * @param {String} type - Type of notification
 * @param {Object} data - Notification data
 */
exports.broadcastNotification = (type, data) => {
  if (!io) {
    console.error('Socket.io not initialized. Call init() first.');
    return;
  }
  
  io.emit('notification', {
    type,
    data,
    timestamp: new Date()
  });
};