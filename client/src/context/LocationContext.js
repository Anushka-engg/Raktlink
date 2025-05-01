// client/src/context/LocationContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import AuthContext from './AuthContext';

const LocationContext = createContext();

export const LocationProvider = ({ children }) => {
  const { user, isAuthenticated } = useContext(AuthContext);
  const [location, setLocation] = useState(null);
  const [address, setAddress] = useState('');
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState(null);
  const [hasLocationPermission, setHasLocationPermission] = useState(null);

  // Initialize location from user data if available
  useEffect(() => {
    if (user && user.location && user.location.coordinates) {
      setLocation({
        lat: user.location.coordinates[1],
        lng: user.location.coordinates[0]
      });
      setAddress(user.location.address);
    }
  }, [user]);

  // Get current location
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser');
      toast.error('Geolocation is not supported by your browser');
      setHasLocationPermission(false);
      return Promise.reject('Geolocation not supported');
    }

    setIsLocating(true);
    setLocationError(null);

    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const newLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          
          setLocation(newLocation);
          setHasLocationPermission(true);
          
          try {
            // Get address from coordinates using reverse geocoding
            const address = await getAddressFromCoordinates(
              newLocation.lat,
              newLocation.lng
            );
            setAddress(address);
            
            // Update user location in database if authenticated
            if (isAuthenticated) {
              updateUserLocation(newLocation, address);
            }
            
            setIsLocating(false);
            resolve({ ...newLocation, address });
          } catch (error) {
            setLocationError('Error getting address from coordinates');
            setIsLocating(false);
            reject(error);
          }
        },
        (error) => {
          let errorMessage = 'Failed to get your location';
          
          if (error.code === 1) {
            errorMessage = 'Location permission denied';
            setHasLocationPermission(false);
          } else if (error.code === 2) {
            errorMessage = 'Location unavailable';
          } else if (error.code === 3) {
            errorMessage = 'Location request timed out';
          }
          
          setLocationError(errorMessage);
          toast.error(errorMessage);
          setIsLocating(false);
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    });
  };

  // Get address from coordinates using reverse geocoding
  const getAddressFromCoordinates = async (lat, lng) => {
    try {
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}`
      );

      if (response.data.status === 'OK' && response.data.results.length > 0) {
        return response.data.results[0].formatted_address;
      } else {
        throw new Error('No address found for these coordinates');
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      return 'Unknown location';
    }
  };

  // Get coordinates from address using geocoding
  const getCoordinatesFromAddress = async (addressText) => {
    try {
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(addressText)}&key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}`
      );

      if (response.data.status === 'OK' && response.data.results.length > 0) {
        const { lat, lng } = response.data.results[0].geometry.location;
        setLocation({ lat, lng });
        setAddress(response.data.results[0].formatted_address);
        
        // Update user location in database if authenticated
        if (isAuthenticated) {
          updateUserLocation({ lat, lng }, response.data.results[0].formatted_address);
        }
        
        return { lat, lng, address: response.data.results[0].formatted_address };
      } else {
        throw new Error('No coordinates found for this address');
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      setLocationError('Error getting coordinates from address');
      toast.error('Could not find location from address');
      return null;
    }
  };

  // Update user location in database
  const updateUserLocation = async (locationCoords, addressText) => {
    try {
      if (!isAuthenticated) return;
      
      await axios.put('/api/users/location', {
        coordinates: [locationCoords.lng, locationCoords.lat], // MongoDB uses [longitude, latitude]
        address: addressText
      });
    } catch (error) {
      console.error('Update location error:', error);
      // Don't show error toast here as it's a background operation
    }
  };

  // Set custom location
  const setCustomLocation = async (locationCoords, addressText) => {
    setLocation(locationCoords);
    setAddress(addressText);
    
    // Update user location in database if authenticated
    if (isAuthenticated) {
      await updateUserLocation(locationCoords, addressText);
    }
    
    return { ...locationCoords, address: addressText };
  };

  // Clear location
  const clearLocation = () => {
    setLocation(null);
    setAddress('');
    setLocationError(null);
  };

  // Calculate distance between two coordinates in kilometers
  const calculateDistance = (coord1, coord2) => {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = (coord2.lat - coord1.lat) * Math.PI / 180;
    const dLon = (coord2.lng - coord1.lng) * Math.PI / 180;
    
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(coord1.lat * Math.PI / 180) * Math.cos(coord2.lat * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c; // Distance in kilometers
    
    return distance;
  };

  return (
    <LocationContext.Provider
      value={{
        location,
        address,
        isLocating,
        locationError,
        hasLocationPermission,
        getCurrentLocation,
        getAddressFromCoordinates,
        getCoordinatesFromAddress,
        setCustomLocation,
        clearLocation,
        calculateDistance
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export default LocationContext;