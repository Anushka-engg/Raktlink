// client/src/pages/DonorSearchPage.js
import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import LocationContext from '../context/LocationContext';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const DonorSearchPage = () => {
  const { user } = useContext(AuthContext);
  const { location, address, getCurrentLocation } = useContext(LocationContext);
  
  const [searchParams, setSearchParams] = useState({
    bloodGroup: user?.bloodGroup || '',
    distance: 5
  });
  const [donors, setDonors] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [error, setError] = useState(null);

  const { bloodGroup, distance } = searchParams;

  useEffect(() => {
    // If user has no location, try to get it
    if (!location) {
      handleDetectLocation();
    }
  }, [location]);

  const onChange = (e) => {
    setSearchParams({ ...searchParams, [e.target.name]: e.target.value });
  };

  const handleDetectLocation = async () => {
    setIsLocating(true);
    setError(null);
    try {
      await getCurrentLocation();
    } catch (err) {
      console.error('Get location error:', err);
      setError('Failed to detect your location. Please try again or enter your location manually.');
    } finally {
      setIsLocating(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!bloodGroup) {
      setError('Please select a blood group');
      return;
    }
    
    if (!location) {
      setError('Location is required. Please detect your location or enter it manually.');
      return;
    }
    
    setIsSearching(true);
    setError(null);
    
    try {
      const response = await axios.get('/api/users/donors', {
        params: {
          bloodGroup,
          longitude: location.lng,
          latitude: location.lat,
          distance
        }
      });
      
      setDonors(response.data);
      setShowResults(true);
    } catch (err) {
      console.error('Search donors error:', err);
      setError(err.response?.data?.message || 'Failed to search for donors');
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6 bg-red-700 text-white">
          <h2 className="text-xl font-semibold">Search Blood Donors</h2>
          <p className="mt-1 text-sm">Find potential donors based on blood group and location</p>
        </div>
        
        <div className="px-4 py-5 sm:p-6">
          {error && (
            <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}
          
          <form onSubmit={handleSearch}>
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
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
                    className="shadow-sm focus:ring-red-500 focus:border-red-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  >
                    <option value="">Select Blood Group</option>
                    {bloodGroups.map(group => (
                      <option key={group} value={group}>{group}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="sm:col-span-3">
                <label htmlFor="distance" className="block text-sm font-medium text-gray-700">
                  Search Radius (km)
                </label>
                <div className="mt-1">
                  <select
                    id="distance"
                    name="distance"
                    value={distance}
                    onChange={onChange}
                    className="shadow-sm focus:ring-red-500 focus:border-red-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  >
                    <option value="2">2 km</option>
                    <option value="5">5 km</option>
                    <option value="10">10 km</option>
                    <option value="20">20 km</option>
                  </select>
                </div>
              </div>
              
              <div className="sm:col-span-6">
                <label className="block text-sm font-medium text-gray-700">
                  Your Location
                </label>
                <div className="mt-1">
                  {location ? (
                    <div className="bg-green-50 border border-green-200 rounded-md p-3">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3 flex-1 md:flex md:justify-between">
                          <p className="text-sm text-green-700">{address}</p>
                          <p className="mt-3 text-sm md:mt-0 md:ml-6">
                            <button
                              type="button"
                              onClick={handleDetectLocation}
                              disabled={isLocating}
                              className="text-green-700 hover:text-green-500 focus:outline-none"
                            >
                              {isLocating ? 'Detecting...' : 'Update location'}
                            </button>
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={handleDetectLocation}
                      disabled={isLocating}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:bg-red-300"
                    >
                      {isLocating ? (
                        <span className="flex items-center">
                          <LoadingSpinner size={16} color="white" />
                          <span className="ml-2">Detecting location...</span>
                        </span>
                      ) : (
                        <span className="flex items-center">
                          <svg className="mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                          </svg>
                          Detect my location
                        </span>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
            
            <div className="mt-6">
              <button
                type="submit"
                disabled={isSearching || !location}
                className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:bg-red-300"
              >
                {isSearching ? (
                  <span className="flex items-center">
                    <LoadingSpinner size={16} color="white" />
                    <span className="ml-2">Searching...</span>
                  </span>
                ) : (
                  'Search Donors'
                )}
              </button>
            </div>
          </form>
          
          {/* Results Section */}
          {showResults && (
            <div className="mt-8 border-t border-gray-200 pt-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Search Results ({donors.length})
              </h3>
              
              {donors.length === 0 ? (
                <div className="mt-4 bg-yellow-50 border-l-4 border-yellow-400 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-yellow-700">
                        No donors found matching your criteria. Try increasing the search radius or selecting a different blood group.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {donors.map(donor => (
                    <div key={donor._id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">{donor.name}</h4>
                          <p className="text-sm text-gray-500">Blood Group: <span className="font-semibold text-red-600">{donor.bloodGroup}</span></p>
                          {donor.location && donor.location.address && (
                            <p className="text-sm text-gray-500 mt-1">
                              <span className="flex items-start">
                                <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                </svg>
                                {donor.location.address}
                              </span>
                            </p>
                          )}
                          {donor.lastDonation && (
                            <p className="text-xs text-gray-500 mt-1">
                              Last donation: {new Date(donor.lastDonation).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="mt-6 bg-blue-50 p-4 rounded-md">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3 flex-1 md:flex md:justify-between">
                    <p className="text-sm text-blue-700">
                      To contact donors, please create a blood request. Donors will be notified based on proximity and blood group compatibility.
                    </p>
                    <p className="mt-3 text-sm md:mt-0 md:ml-6">
                      <a href="/create-request" className="whitespace-nowrap font-medium text-blue-700 hover:text-blue-600">
                        Create Request <span aria-hidden="true">&rarr;</span>
                      </a>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DonorSearchPage;