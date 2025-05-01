// client/src/context/AuthContext.js
import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Set up axios defaults
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  // Load user on mount or when token changes
  useEffect(() => {
    const loadUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await axios.get('/api/auth/profile');
        setUser(res.data);
        setIsAuthenticated(true);
      } catch (err) {
        console.error('Load user error:', err);
        localStorage.removeItem('token');
        setToken(null);
        setError(err.response?.data?.message || 'Authentication failed');
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [token]);

  // Register user
  const register = async (formData) => {
    try {
      setLoading(true);
      const res = await axios.post('/api/auth/register', formData);
      setToken(res.data.token);
      localStorage.setItem('token', res.data.token);
      setUser(res.data);
      setIsAuthenticated(true);
      toast.success('Registration successful!');
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
      toast.error(err.response?.data?.message || 'Registration failed');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Login user
  const login = async (email, password) => {
    try {
      setLoading(true);
      const res = await axios.post('/api/auth/login', { email, password });
      setToken(res.data.token);
      localStorage.setItem('token', res.data.token);
      setUser(res.data);
      setIsAuthenticated(true);
      toast.success('Login successful!');
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
      toast.error(err.response?.data?.message || 'Login failed');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Logout user
  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    toast.info('Logged out successfully');
  };

  // Update user profile
  const updateProfile = async (formData) => {
    try {
      setLoading(true);
      const res = await axios.put('/api/auth/profile', formData);
      setUser(res.data);
      toast.success('Profile updated successfully!');
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'Profile update failed');
      toast.error(err.response?.data?.message || 'Profile update failed');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Update donor status
  const updateDonorStatus = async (isDonor) => {
    try {
      setLoading(true);
      const res = await axios.put('/api/users/donor-status', { isDonor });
      setUser({
        ...user,
        isDonor: res.data.isDonor
      });
      toast.success(res.data.message);
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update donor status');
      toast.error(err.response?.data?.message || 'Failed to update donor status');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Clear errors
  const clearErrors = () => {
    setError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        loading,
        error,
        register,
        login,
        logout,
        updateProfile,
        updateDonorStatus,
        clearErrors
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;