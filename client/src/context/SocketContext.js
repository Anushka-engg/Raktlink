// client/src/context/SocketContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import { io } from 'socket.io-client';
import { toast } from 'react-toastify';
import AuthContext from './AuthContext';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { user, isAuthenticated } = useContext(AuthContext);
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [notifications, setNotifications] = useState([]);

  // Initialize socket connection
  useEffect(() => {
    if (isAuthenticated && user?._id) {
      // Create socket connection
      const socketInstance = io(process.env.REACT_APP_API_URL || '', {
        query: { userId: user._id }
      });

      // Set up event listeners
      socketInstance.on('connect', () => {
        console.log('Socket connected');
        setIsConnected(true);
        
        // Join user's personal room for private messages
        socketInstance.emit('join', user._id);
      });

      socketInstance.on('disconnect', () => {
        console.log('Socket disconnected');
        setIsConnected(false);
      });

      socketInstance.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        setIsConnected(false);
      });

      // Listen for new blood requests
      socketInstance.on('new_blood_request', (request) => {
        setPendingRequests((prevRequests) => {
          // Check if request already exists
          const exists = prevRequests.some(req => req._id === request._id);
          if (exists) return prevRequests;
          
          // Add new request to the beginning of the array
          return [request, ...prevRequests];
        });
        
        // Show notification
        toast.info(`New blood request: ${request.bloodGroup} needed at ${request.hospital.name}`);
        
        // Add to notifications
        addNotification({
          type: 'new_request',
          message: `New blood request: ${request.bloodGroup} needed at ${request.hospital.name}`,
          data: request,
          read: false
        });
      });

      // Listen for donor responses
      socketInstance.on('donor_response', (response) => {
        const responseType = response.response === 'accept' ? 'accepted' : 'declined';
        
        // Show notification
        toast.info(`A donor has ${responseType} your blood request`);
        
        // Add to notifications
        addNotification({
          type: 'donor_response',
          message: `A donor has ${responseType} your blood request`,
          data: response,
          read: false
        });
      });

      // Listen for request status updates
      socketInstance.on('request_status_changed', (data) => {
        // Update pending requests
        setPendingRequests((prevRequests) => 
          prevRequests.filter(req => req._id !== data.requestId)
        );
        
        // Show notification
        toast.info(`Blood request status changed to: ${data.status}`);
        
        // Add to notifications
        addNotification({
          type: 'status_update',
          message: `Blood request status changed to: ${data.status}`,
          data,
          read: false
        });
      });

      // Listen for direct messages
      socketInstance.on('new_message', (message) => {
        // Show notification
        toast.info(`New message from ${message.senderName || 'a user'}`);
        
        // Add to notifications
        addNotification({
          type: 'message',
          message: `New message from ${message.senderName || 'a user'}: ${message.message.substring(0, 30)}${message.message.length > 30 ? '...' : ''}`,
          data: message,
          read: false
        });
      });

      // Save socket instance
      setSocket(socketInstance);

      // Cleanup on unmount
      return () => {
        if (socketInstance) {
          socketInstance.disconnect();
        }
      };
    }
  }, [isAuthenticated, user]);

  // Add notification
  const addNotification = (notification) => {
    setNotifications((prevNotifications) => [
      {
        id: Date.now(),
        timestamp: new Date(),
        ...notification
      },
      ...prevNotifications
    ]);
  };

  // Mark notification as read
  const markNotificationAsRead = (notificationId) => {
    setNotifications((prevNotifications) =>
      prevNotifications.map(notification =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  // Mark all notifications as read
  const markAllNotificationsAsRead = () => {
    setNotifications((prevNotifications) =>
      prevNotifications.map(notification => ({ ...notification, read: true }))
    );
  };

  // Clear notification
  const clearNotification = (notificationId) => {
    setNotifications((prevNotifications) =>
      prevNotifications.filter(notification => notification.id !== notificationId)
    );
  };

  // Clear all notifications
  const clearAllNotifications = () => {
    setNotifications([]);
  };

  // Remove pending request
  const removePendingRequest = (requestId) => {
    setPendingRequests((prevRequests) =>
      prevRequests.filter(request => request._id !== requestId)
    );
  };

  // Send response to blood request
  const respondToRequest = (requestId, response) => {
    if (!socket || !isConnected) {
      toast.error('Socket not connected. Please try again.');
      return false;
    }

    socket.emit('donor_response', {
      requestId,
      donorId: user._id,
      response,
      requesterId: null // Will be filled on server side
    });

    // Remove from pending requests
    removePendingRequest(requestId);
    
    return true;
  };

  // Update location
  const updateLocation = (coordinates) => {
    if (!socket || !isConnected) return;

    socket.emit('update_location', {
      userId: user._id,
      coordinates
    });
  };

  // Send direct message
  const sendMessage = (recipientId, message) => {
    if (!socket || !isConnected) {
      toast.error('Socket not connected. Please try again.');
      return false;
    }

    socket.emit('direct_message', {
      senderId: user._id,
      senderName: user.name,
      recipientId,
      message
    });
    
    return true;
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        pendingRequests,
        notifications,
        respondToRequest,
        updateLocation,
        sendMessage,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        clearNotification,
        clearAllNotifications,
        removePendingRequest
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export default SocketContext;