// client/src/pages/CreateRequestPage.js
import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import AuthContext from '../context/AuthContext';
import LocationContext from '../context/LocationContext';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const urgencyLevels = [
  { value: 'low', label: 'Low (Within 24 hours)' },
  { value: 'medium', label: 'Medium (Within 12 hours)' },
  { value: 'high', label: 'High (Within 6 hours)' },
  { value: 'critical', label: 'Critical (Within 3 hours)' }
];

const CreateRequestPage = () => {
  const { user } = useContext(AuthContext);
  const { location, address, getCurrentLocation, getCoordinatesFromAddress } = useContext(LocationContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    patientName: '',
    patientAge: '',
    patientGender: 'male',
    bloodGroup: user?.bloodGroup || '',
    units: 1,
    urgency: 'medium',
    hospitalName: '',
    hospitalAddress: '',
    reason: '',
    additionalNotes: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [hospitalLocation, setHospitalLocation] = useState(null);

  useEffect(() => {
    // If we don't have user's location yet, try to get it
    if (!location) {
      try {
        getCurrentLocation();
      } catch (err) {
        console.error('Failed to get location:', err);
      }
    }
  }, [location, getCurrentLocation]);

  const { 
    patientName, 
    patientAge, 
    patientGender, 
    bloodGroup, 
    units, 
    urgency, 
    hospitalName, 
    hospitalAddress, 
    reason, 
    additionalNotes 
  } = formData;

  const onChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'units') {
      // Ensure units is between 1 and 10
      const unitsValue = parseInt(value);
      if (unitsValue < 1) {
        setFormData({ ...formData, [name]: 1 });
      } else if (unitsValue > 10) {
        setFormData({ ...formData, [name]: 10 });
      } else {
        setFormData({ ...formData, [name]: unitsValue });
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
    
    // Clear field-specific error when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: null });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Patient name validation
    if (!patientName) {
      newErrors.patientName = 'Patient name is required';
    }

    // Patient age validation
    if (!patientAge) {
      newErrors.patientAge = 'Patient age is required';
    } else if (isNaN(patientAge) || patientAge <= 0 || patientAge > 120) {
      newErrors.patientAge = 'Please enter a valid age between 1 and 120';
    }

    // Blood group validation
    if (!bloodGroup) {
      newErrors.bloodGroup = 'Blood group is required';
    }

    // Units validation
    if (!units) {
      newErrors.units = 'Number of units is required';
    } else if (units < 1 || units > 10) {
      newErrors.units = 'Number of units must be between 1 and 10';
    }

    // Hospital name validation
    if (!hospitalName) {
      newErrors.hospitalName = 'Hospital name is required';
    }

    // Hospital address validation
    if (!hospitalAddress) {
      newErrors.hospitalAddress = 'Hospital address is required';
    }

    // Reason validation
    if (!reason) {
      newErrors.reason = 'Reason for blood request is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleDetectLocation = async () => {
    setIsLocating(true);
    try {
      const locData = await getCurrentLocation();
      setHospitalLocation(locData);
      setFormData({ ...formData, hospitalAddress: locData.address });
      setIsLocating(false);
    } catch (err) {
      setIsLocating(false);
      toast.error('Failed to detect location. Please enter address manually.');
    }
  };

  const handleAddressSearch = async () => {
    if (!hospitalAddress) {
      setErrors({ ...errors, hospitalAddress: 'Please enter an address to search' });
      return;
    }

    setIsLocating(true);
    try {
      const locData = await getCoordinatesFromAddress(hospitalAddress);
      if (locData) {
        setHospitalLocation(locData);
        setFormData({ ...formData, hospitalAddress: locData.address });
      }
    } catch (err) {
      toast.error('Failed to find location from address. Please try again.');
    } finally {
      setIsLocating(false);
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      window.scrollTo(0, 0); // Scroll to top to show errors
      return;
    }

    if (!hospitalLocation) {
      try {
        // Try to get coordinates from the address before submission
        const locData = await getCoordinatesFromAddress(hospitalAddress);
        if (!locData) {
          setErrors({ ...errors, hospitalAddress: 'Could not determine location from address. Please be more specific or use detect location.' });
          return;
        }
        setHospitalLocation(locData);
      } catch (err) {
        setErrors({ ...errors, hospitalAddress: 'Failed to validate address. Please try again.' });
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const requestData = {
        patient: {
          name: patientName,
          age: parseInt(patientAge),
          gender: patientGender
        },
        bloodGroup,
        units: parseInt(units),
        urgency,
        hospital: {
          name: hospitalName,
          location: {
            type: 'Point',
            coordinates: [hospitalLocation.lng, hospitalLocation.lat], // MongoDB uses [longitude, latitude]
            address: hospitalAddress
          }
        },
        reason,
        additionalNotes
      };

      const response = await axios.post('/api/requests', requestData);

      toast.success('Blood request created successfully!');
      navigate(`/requests/${response.data._id}`);
    } catch (err) {
      console.error('Create request error:', err);
      toast.error(err.response?.data?.message || 'Failed to create blood request. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6 bg-red-700 text-white">
          <h2 className="text-xl font-semibold">Create Blood Request</h2>
          <p className="mt-1 text-sm">Please fill in all the details to send out a blood request</p>
        </div>
        
        <div className="px-4 py-5 sm:p-6">
          {Object.keys(errors).length > 0 && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              <h3 className="text-sm font-medium text-red-800">Please correct the following errors:</h3>
              <ul className="mt-1.5 list-disc list-inside text-sm">
                {Object.values(errors).map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}
          
          <form onSubmit={onSubmit}>
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              {/* Patient Information Section */}
              <div className="sm:col-span-6">
                <h3 className="text-lg font-medium text-gray-900 mb-3">Patient Information</h3>
                <div className="border-t border-gray-200 pt-3 space-y-4">
                  <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                    <div className="sm:col-span-3">
                      <label htmlFor="patientName" className="block text-sm font-medium text-gray-700">
                        Patient Name <span className="text-red-500">*</span>
                      </label>
                      <div className="mt-1">
                        <input
                          type="text"
                          name="patientName"
                          id="patientName"
                          value={patientName}
                          onChange={onChange}
                          className={`shadow-sm focus:ring-red-500 focus:border-red-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                            errors.patientName ? 'border-red-300' : ''
                          }`}
                        />
                      </div>
                      {errors.patientName && (
                        <p className="mt-2 text-sm text-red-600">{errors.patientName}</p>
                      )}
                    </div>

                    <div className="sm:col-span-3">
                      <label htmlFor="patientAge" className="block text-sm font-medium text-gray-700">
                        Patient Age <span className="text-red-500">*</span>
                      </label>
                      <div className="mt-1">
                        <input
                          type="number"
                          name="patientAge"
                          id="patientAge"
                          min="1"
                          max="120"
                          value={patientAge}
                          onChange={onChange}
                          className={`shadow-sm focus:ring-red-500 focus:border-red-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                            errors.patientAge ? 'border-red-300' : ''
                          }`}
                        />
                      </div>
                      {errors.patientAge && (
                        <p className="mt-2 text-sm text-red-600">{errors.patientAge}</p>
                      )}
                    </div>

                    <div className="sm:col-span-3">
                      <label htmlFor="patientGender" className="block text-sm font-medium text-gray-700">
                        Patient Gender <span className="text-red-500">*</span>
                      </label>
                      <div className="mt-1">
                        <select
                          id="patientGender"
                          name="patientGender"
                          value={patientGender}
                          onChange={onChange}
                          className="shadow-sm focus:ring-red-500 focus:border-red-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        >
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    </div>

                    <div className="sm:col-span-3">
                      <label htmlFor="bloodGroup" className="block text-sm font-medium text-gray-700">
                        Blood Group <span className="text-red-500">*</span>
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
                  </div>
                </div>
              </div>

              {/* Request Details Section */}
              <div className="sm:col-span-6">
                <h3 className="text-lg font-medium text-gray-900 mb-3">Request Details</h3>
                <div className="border-t border-gray-200 pt-3 space-y-4">
                  <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                    <div className="sm:col-span-3">
                      <label htmlFor="units" className="block text-sm font-medium text-gray-700">
                        Number of Units <span className="text-red-500">*</span>
                      </label>
                      <div className="mt-1">
                        <input
                          type="number"
                          name="units"
                          id="units"
                          min="1"
                          max="10"
                          value={units}
                          onChange={onChange}
                          className={`shadow-sm focus:ring-red-500 focus:border-red-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                            errors.units ? 'border-red-300' : ''
                          }`}
                        />
                      </div>
                      {errors.units && (
                        <p className="mt-2 text-sm text-red-600">{errors.units}</p>
                      )}
                      <p className="mt-2 text-xs text-gray-500">Between 1 and 10 units</p>
                    </div>

                    <div className="sm:col-span-3">
                      <label htmlFor="urgency" className="block text-sm font-medium text-gray-700">
                        Urgency Level <span className="text-red-500">*</span>
                      </label>
                      <div className="mt-1">
                        <select
                          id="urgency"
                          name="urgency"
                          value={urgency}
                          onChange={onChange}
                          className="shadow-sm focus:ring-red-500 focus:border-red-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        >
                          {urgencyLevels.map(level => (
                            <option key={level.value} value={level.value}>{level.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="sm:col-span-6">
                      <label htmlFor="reason" className="block text-sm font-medium text-gray-700">
                        Reason for Blood Request <span className="text-red-500">*</span>
                      </label>
                      <div className="mt-1">
                        <textarea
                          id="reason"
                          name="reason"
                          rows="3"
                          value={reason}
                          onChange={onChange}
                          className={`shadow-sm focus:ring-red-500 focus:border-red-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                            errors.reason ? 'border-red-300' : ''
                          }`}
                          placeholder="e.g. Surgery, Accident, etc."
                        ></textarea>
                      </div>
                      {errors.reason && (
                        <p className="mt-2 text-sm text-red-600">{errors.reason}</p>
                      )}
                    </div>

                    <div className="sm:col-span-6">
                      <label htmlFor="additionalNotes" className="block text-sm font-medium text-gray-700">
                        Additional Notes (Optional)
                      </label>
                      <div className="mt-1">
                        <textarea
                          id="additionalNotes"
                          name="additionalNotes"
                          rows="2"
                          value={additionalNotes}
                          onChange={onChange}
                          className="shadow-sm focus:ring-red-500 focus:border-red-500 block w-full sm:text-sm border-gray-300 rounded-md"
                          placeholder="Any additional information that might be helpful"
                        ></textarea>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Hospital Location Section */}
              <div className="sm:col-span-6">
                <h3 className="text-lg font-medium text-gray-900 mb-3">Hospital Location</h3>
                <div className="border-t border-gray-200 pt-3 space-y-4">
                  <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                    <div className="sm:col-span-6">
                      <label htmlFor="hospitalName" className="block text-sm font-medium text-gray-700">
                        Hospital Name <span className="text-red-500">*</span>
                      </label>
                      <div className="mt-1">
                        <input
                          type="text"
                          name="hospitalName"
                          id="hospitalName"
                          value={hospitalName}
                          onChange={onChange}
                          className={`shadow-sm focus:ring-red-500 focus:border-red-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                            errors.hospitalName ? 'border-red-300' : ''
                          }`}
                        />
                      </div>
                      {errors.hospitalName && (
                        <p className="mt-2 text-sm text-red-600">{errors.hospitalName}</p>
                      )}
                    </div>

                    <div className="sm:col-span-6">
                      <label htmlFor="hospitalAddress" className="block text-sm font-medium text-gray-700">
                        Hospital Address <span className="text-red-500">*</span>
                      </label>
                      <div className="mt-1 flex rounded-md shadow-sm">
                        <input
                          type="text"
                          name="hospitalAddress"
                          id="hospitalAddress"
                          value={hospitalAddress}
                          onChange={onChange}
                          className={`flex-1 focus:ring-red-500 focus:border-red-500 block w-full min-w-0 rounded-none rounded-l-md sm:text-sm border-gray-300 ${
                            errors.hospitalAddress ? 'border-red-300' : ''
                          }`}
                        />
                        <button
                          type="button"
                          onClick={handleAddressSearch}
                          disabled={isLocating}
                          className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 rounded-r-md bg-gray-50 text-gray-500 sm:text-sm hover:bg-gray-100"
                        >
                          {isLocating ? (
                            <LoadingSpinner size={16} />
                          ) : (
                            "Search"
                          )}
                        </button>
                      </div>
                      {errors.hospitalAddress && (
                        <p className="mt-2 text-sm text-red-600">{errors.hospitalAddress}</p>
                      )}
                    </div>

                    <div className="sm:col-span-6">
                      <button
                        type="button"
                        onClick={handleDetectLocation}
                        disabled={isLocating}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
                      >
                        {isLocating ? (
                          <LoadingSpinner size={16} color="white" />
                        ) : (
                          <>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5 mr-2"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                                clipRule="evenodd"
                              />
                            </svg>
                            Detect Current Location
                          </>
                        )}
                      </button>
                    </div>

                    {hospitalLocation && (
                      <div className="sm:col-span-6">
                        <div className="bg-green-50 border border-green-200 rounded-md p-4">
                          <div className="flex">
                            <div className="flex-shrink-0">
                              <svg
                                className="h-5 w-5 text-green-400"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </div>
                            <div className="ml-3">
                              <h3 className="text-sm font-medium text-green-800">Location Detected</h3>
                              <div className="mt-2 text-sm text-green-700">
                                <p>{hospitalAddress}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 mr-3"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:bg-red-300"
              >
                {isSubmitting ? (
                  <LoadingSpinner size={20} color="white" />
                ) : (
                  'Create Request'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateRequestPage;