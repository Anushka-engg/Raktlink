// client/src/pages/ProfilePage.js
import React, { useState, useContext, useEffect } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import LocationContext from '../context/LocationContext';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const ProfilePage = () => {
  const { user, updateProfile, updateDonorStatus, logout } = useContext(AuthContext);
  const { getCurrentLocation } = useContext(LocationContext);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    bloodGroup: '',
    isDonor: true,
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [isUpdatingLocation, setIsUpdatingLocation] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Initialize form data from user context
  useEffect(() => {
    if (user) {
      setFormData({
        ...formData,
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        bloodGroup: user.bloodGroup || '',
        isDonor: user.isDonor || false
      });
    }
  }, [user]);

  const { 
    name, 
    email, 
    phone, 
    bloodGroup, 
    isDonor, 
    currentPassword, 
    newPassword, 
    confirmPassword 
  } = formData;

  const onChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
    
    // Clear field-specific error when user starts typing
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: null });
    }
  };

  const handleUpdateLocation = async () => {
    setIsUpdatingLocation(true);
    try {
      const locationData = await getCurrentLocation();
      
      if (locationData) {
        await axios.put('/api/users/location', {
          coordinates: [locationData.lng, locationData.lat],
          address: locationData.address
        });
        
        toast.success('Location updated successfully!');
      }
    } catch (error) {
      console.error('Update location error:', error);
      toast.error('Failed to update location. Please try again.');
    } finally {
      setIsUpdatingLocation(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Name validation
    if (!name) {
      newErrors.name = 'Name is required';
    }

    // Email validation
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
    }

    // Phone validation
    if (!phone) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\d{10}$/.test(phone)) {
      newErrors.phone = 'Phone number must be 10 digits';
    }

    // Blood group validation
    if (!bloodGroup) {
      newErrors.bloodGroup = 'Blood group is required';
    }

    // Password validation (only if user is changing password)
    if (newPassword || confirmPassword) {
      if (!currentPassword) {
        newErrors.currentPassword = 'Current password is required to change password';
      }
      
      if (newPassword && newPassword.length < 6) {
        newErrors.newPassword = 'New password must be at least 6 characters';
      }
      
      if (newPassword !== confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleToggleDonorStatus = async () => {
    const success = await updateDonorStatus(!isDonor);
    if (success) {
      setFormData({ ...formData, isDonor: !isDonor });
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await axios.delete('/api/users/profile');
      logout();
      toast.success('Your account has been deleted successfully.');
    } catch (error) {
      console.error('Delete account error:', error);
      toast.error(error.response?.data?.message || 'Failed to delete account. Please try again.');
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    const updateData = {
      name,
      email,
      phone,
      bloodGroup,
      isDonor
    };

    // Only include password fields if user is changing password
    if (newPassword) {
      updateData.currentPassword = currentPassword;
      updateData.password = newPassword;
    }

    const success = await updateProfile(updateData);
    
    if (success) {
      setEditMode(false);
      // Clear password fields
      setFormData({
        ...formData,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    }
    
    setIsSubmitting(false);
  };

  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <LoadingSpinner size={60} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 bg-red-700 text-white">
          <h2 className="text-xl font-semibold">Profile Information</h2>
          <p className="mt-1 text-sm">Personal details and account settings</p>
        </div>
        
        {editMode ? (
          <div className="px-4 py-5 sm:p-6">
            <form onSubmit={onSubmit}>
              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div className="sm:col-span-3">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Full Name
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="name"
                      id="name"
                      value={name}
                      onChange={onChange}
                      className={`shadow-sm focus:ring-red-500 focus:border-red-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                        errors.name ? 'border-red-300' : ''
                      }`}
                    />
                  </div>
                  {errors.name && (
                    <p className="mt-2 text-sm text-red-600">{errors.name}</p>
                  )}
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email address
                  </label>
                  <div className="mt-1">
                    <input
                      type="email"
                      name="email"
                      id="email"
                      value={email}
                      onChange={onChange}
                      className={`shadow-sm focus:ring-red-500 focus:border-red-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                        errors.email ? 'border-red-300' : ''
                      }`}
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-2 text-sm text-red-600">{errors.email}</p>
                  )}
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                    Phone Number
                  </label>
                  <div className="mt-1">
                    <input
                      type="tel"
                      name="phone"
                      id="phone"
                      value={phone}
                      onChange={onChange}
                      className={`shadow-sm focus:ring-red-500 focus:border-red-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                        errors.phone ? 'border-red-300' : ''
                      }`}
                    />
                  </div>
                  {errors.phone && (
                    <p className="mt-2 text-sm text-red-600">{errors.phone}</p>
                  )}
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="bloodGroup" className="block text-sm font-medium text-gray-700">
                    Blood Group
                  </label>
                  <div className="mt-1">
                    <select
                      id="bloodGroup"
                      name="bloodGroup"
                      value={bloodGroup}
                      onChange={onChange}
                      className={`shadow-sm focus:ring-red-500 focus:border-red-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                        errors.bloodGroup ? 'border-red-300' : ''
                      }`}
                    >
                      <option value="">Select Blood Group</option>
                      {bloodGroups.map(group => (
                        <option key={group} value={group}>{group}</option>
                      ))}
                    </select>
                  </div>
                  {errors.bloodGroup && (
                    <p className="mt-2 text-sm text-red-600">{errors.bloodGroup}</p>
                  )}
                </div>

                <div className="sm:col-span-6">
                  <div className="flex items-center">
                    <input
                      id="isDonor"
                      name="isDonor"
                      type="checkbox"
                      checked={isDonor}
                      onChange={onChange}
                      className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                    />
                    <label htmlFor="isDonor" className="ml-2 block text-sm text-gray-700">
                      Register as a blood donor
                    </label>
                  </div>
                </div>

                <div className="sm:col-span-6 border-t border-gray-200 pt-5">
                  <h3 className="text-lg font-medium text-gray-900">Change Password</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Leave blank if you don't want to change your password
                  </p>
                </div>

                <div className="sm:col-span-6">
                  <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
                    Current Password
                  </label>
                  <div className="mt-1">
                    <input
                      type="password"
                      name="currentPassword"
                      id="currentPassword"
                      value={currentPassword}
                      onChange={onChange}
                      className={`shadow-sm focus:ring-red-500 focus:border-red-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                        errors.currentPassword ? 'border-red-300' : ''
                      }`}
                    />
                  </div>
                  {errors.currentPassword && (
                    <p className="mt-2 text-sm text-red-600">{errors.currentPassword}</p>
                  )}
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                    New Password
                  </label>
                  <div className="mt-1">
                    <input
                      type="password"
                      name="newPassword"
                      id="newPassword"
                      value={newPassword}
                      onChange={onChange}
                      className={`shadow-sm focus:ring-red-500 focus:border-red-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                        errors.newPassword ? 'border-red-300' : ''
                      }`}
                    />
                  </div>
                  {errors.newPassword && (
                    <p className="mt-2 text-sm text-red-600">{errors.newPassword}</p>
                  )}
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                    Confirm New Password
                  </label>
                  <div className="mt-1">
                    <input
                      type="password"
                      name="confirmPassword"
                      id="confirmPassword"
                      value={confirmPassword}
                      onChange={onChange}
                      className={`shadow-sm focus:ring-red-500 focus:border-red-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                        errors.confirmPassword ? 'border-red-300' : ''
                      }`}
                    />
                  </div>
                  {errors.confirmPassword && (
                    <p className="mt-2 text-sm text-red-600">{errors.confirmPassword}</p>
                  )}
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  onClick={() => setEditMode(false)}
                  className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 mr-3"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:bg-red-300"
                >
                  {isSubmitting ? <LoadingSpinner size={20} color="white" /> : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
            <dl className="sm:divide-y sm:divide-gray-200">
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Full name</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{user.name}</dd>
              </div>
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Email address</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{user.email}</dd>
              </div>
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Phone number</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{user.phone}</dd>
              </div>
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Blood group</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  <span className="font-semibold text-red-600">{user.bloodGroup}</span>
                </dd>
              </div>
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Donor status</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  <span 
                    className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      user.isDonor ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {user.isDonor ? 'Active Donor' : 'Not a Donor'}
                  </span>
                  <button
                    onClick={handleToggleDonorStatus}
                    className="ml-4 text-xs text-blue-600 hover:text-blue-800 focus:outline-none"
                  >
                    {user.isDonor ? 'Disable donor status' : 'Become a donor'}
                  </button>
                </dd>
              </div>
              {user.isDonor && (
                <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Donation eligibility</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    <span 
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        user.isEligibleToDonate ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {user.isEligibleToDonate ? 'Eligible to Donate' : 'Not Eligible'}
                    </span>
                    {!user.isEligibleToDonate && user.lastDonation && (
                      <span className="ml-2 text-gray-500">
                        Last donation: {new Date(user.lastDonation).toLocaleDateString()}
                      </span>
                    )}
                  </dd>
                </div>
              )}
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Location</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {user.location && user.location.address ? (
                    <div className="flex items-center">
                      <span>{user.location.address}</span>
                      <button
                        onClick={handleUpdateLocation}
                        disabled={isUpdatingLocation}
                        className="ml-4 text-xs text-blue-600 hover:text-blue-800 focus:outline-none"
                      >
                        {isUpdatingLocation ? 'Updating...' : 'Update location'}
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <span className="text-gray-500">No location set</span>
                      <button
                        onClick={handleUpdateLocation}
                        disabled={isUpdatingLocation}
                        className="ml-4 text-xs text-blue-600 hover:text-blue-800 focus:outline-none"
                      >
                        {isUpdatingLocation ? 'Detecting...' : 'Detect location'}
                      </button>
                    </div>
                  )}
                </dd>
              </div>
            </dl>
            
            <div className="py-4 px-6 flex justify-between border-t border-gray-200">
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="text-sm text-red-600 hover:text-red-800 focus:outline-none"
              >
                Delete Account
              </button>
              <button
                onClick={() => setEditMode(true)}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Edit Profile
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Delete Account Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <svg className="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Delete Account
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Are you sure you want to delete your account? All of your data will be permanently removed. This action cannot be undone.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleDeleteAccount}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Delete
                </button>
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;