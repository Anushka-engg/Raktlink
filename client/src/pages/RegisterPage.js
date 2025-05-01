// client/src/pages/RegisterPage.js
import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import LocationContext from '../context/LocationContext';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    bloodGroup: '',
    isDonor: true
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [locationStep, setLocationStep] = useState(false);

  const { register, error, clearErrors, isAuthenticated } = useContext(AuthContext);
  const { location, address, getCurrentLocation, locationError, hasLocationPermission } = useContext(LocationContext);
  
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
    
    // Clear any existing errors
    clearErrors();
  }, [isAuthenticated, navigate, clearErrors]);

  // Check for auth errors
  useEffect(() => {
    if (error) {
      setErrors({ api: error });
      setIsSubmitting(false);
    }
  }, [error]);

  // Check for location errors
  useEffect(() => {
    if (locationError) {
      setErrors({ location: locationError });
      setIsLocating(false);
    }
  }, [locationError]);

  const { name, email, password, confirmPassword, phone, bloodGroup, isDonor } = formData;

  const onChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
    
    // Clear field-specific error when user starts typing
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: null });
    }
  };

  const validateFormStep1 = () => {
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

    // Password validation
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    // Confirm password validation
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleDetectLocation = async () => {
    setIsLocating(true);
    try {
      await getCurrentLocation();
      setIsLocating(false);
    } catch (err) {
      setIsLocating(false);
      // Error is already handled by the LocationContext
    }
  };

  const onNextStep = (e) => {
    e.preventDefault();
    
    if (validateFormStep1()) {
      setLocationStep(true);
    }
  };

  const onPrevStep = (e) => {
    e.preventDefault();
    setLocationStep(false);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    
    if (!location || !address) {
      setErrors({ location: 'Location is required. Please detect your location or enter it manually.' });
      return;
    }

    setIsSubmitting(true);
    
    const userData = {
      name,
      email,
      password,
      phone,
      bloodGroup,
      isDonor,
      location: {
        type: 'Point',
        coordinates: [location.lng, location.lat], // MongoDB uses [longitude, latitude]
        address
      }
    };

    const success = await register(userData);
    if (success) {
      navigate('/dashboard');
    } else {
      setIsSubmitting(false);
    }
  };

  if (locationStep) {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-md">
          <div>
            <div className="flex justify-center">
              <img 
                className="h-12 w-auto" 
                src="/logo.png" 
                alt="Raktlink Logo" 
              />
            </div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Set Your Location
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Your location helps us connect you with nearby donors or recipients
            </p>
          </div>

          {errors.api && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
              <span className="block sm:inline">{errors.api}</span>
            </div>
          )}

          <form className="mt-8 space-y-6" onSubmit={onSubmit}>
            <div>
              <button
                type="button"
                onClick={handleDetectLocation}
                disabled={isLocating}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300 mb-4"
              >
                {isLocating ? (
                  <LoadingSpinner size={24} color="white" />
                ) : (
                  <>
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className="h-5 w-5 mr-2" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" 
                      />
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" 
                      />
                    </svg>
                    Detect My Location
                  </>
                )}
              </button>

              {hasLocationPermission === false && (
                <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative mb-4">
                  <span className="block sm:inline">
                    Location permission denied. Please enable location services in your browser settings or enter your address manually.
                  </span>
                </div>
              )}

              {errors.location && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
                  <span className="block sm:inline">{errors.location}</span>
                </div>
              )}

              {location && address && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4">
                  <p className="font-bold">Location detected:</p>
                  <p>{address}</p>
                </div>
              )}

              <div className="flex items-center justify-between mt-8">
                <button
                  type="button"
                  onClick={onPrevStep}
                  className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !location || !address}
                  className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:bg-red-300"
                >
                  {isSubmitting ? (
                    <LoadingSpinner size={24} color="white" />
                  ) : (
                    'Complete Registration'
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-md">
        <div>
          <div className="flex justify-center">
            <img 
              className="h-12 w-auto" 
              src="/logo.png" 
              alt="Raktlink Logo" 
            />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create a new account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link to="/login" className="font-medium text-red-600 hover:text-red-500">
              sign in to your existing account
            </Link>
          </p>
        </div>

        {errors.api && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
            <span className="block sm:inline">{errors.api}</span>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={onNextStep}>
          <div>
            <div className="mb-4">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                value={name}
                onChange={onChange}
                className={`mt-1 block w-full px-3 py-2 border ${
                  errors.name ? 'border-red-300' : 'border-gray-300'
                } rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm`}
              />
              {errors.name && (
                <p className="mt-2 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={onChange}
                className={`mt-1 block w-full px-3 py-2 border ${
                  errors.email ? 'border-red-300' : 'border-gray-300'
                } rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm`}
              />
              {errors.email && (
                <p className="mt-2 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            <div className="mb-4">
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                value={phone}
                onChange={onChange}
                className={`mt-1 block w-full px-3 py-2 border ${
                  errors.phone ? 'border-red-300' : 'border-gray-300'
                } rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm`}
              />
              {errors.phone && (
                <p className="mt-2 text-sm text-red-600">{errors.phone}</p>
              )}
            </div>

            <div className="mb-4">
              <label htmlFor="bloodGroup" className="block text-sm font-medium text-gray-700">
                Blood Group
              </label>
              <select
                id="bloodGroup"
                name="bloodGroup"
                value={bloodGroup}
                onChange={onChange}
                className={`mt-1 block w-full px-3 py-2 border ${
                  errors.bloodGroup ? 'border-red-300' : 'border-gray-300'
                } rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm`}
              >
                <option value="">Select Blood Group</option>
                {bloodGroups.map(group => (
                  <option key={group} value={group}>
                    {group}
                  </option>
                ))}
              </select>
              {errors.bloodGroup && (
                <p className="mt-2 text-sm text-red-600">{errors.bloodGroup}</p>
              )}
            </div>

            <div className="mb-4">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={onChange}
                className={`mt-1 block w-full px-3 py-2 border ${
                  errors.password ? 'border-red-300' : 'border-gray-300'
                } rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm`}
              />
              {errors.password && (
                <p className="mt-2 text-sm text-red-600">{errors.password}</p>
              )}
            </div>

            <div className="mb-4">
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={onChange}
                className={`mt-1 block w-full px-3 py-2 border ${
                  errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                } rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm`}
              />
              {errors.confirmPassword && (
                <p className="mt-2 text-sm text-red-600">{errors.confirmPassword}</p>
              )}
            </div>

            <div className="mb-4">
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
              <p className="mt-1 text-xs text-gray-500">
                You can change this setting anytime in your profile.
              </p>
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Next: Set Location
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;