// client/src/pages/DashboardPage.js
import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import LocationContext from '../context/LocationContext';
import SocketContext from '../context/SocketContext';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const DashboardPage = () => {
  const { user } = useContext(AuthContext);
  const { location, getCurrentLocation } = useContext(LocationContext);
  const { pendingRequests, respondToRequest } = useContext(SocketContext);
  
  const [activeRequests, setActiveRequests] = useState([]);
  const [userStats, setUserStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Update location if needed
        if (!location) {
          try {
            await getCurrentLocation();
          } catch (err) {
            console.error('Failed to get location:', err);
          }
        }
        
        // Fetch active blood requests
        const requestsRes = await axios.get('/api/requests', {
          params: {
            status: 'active'
          }
        });
        
        // Fetch user statistics
        const statsRes = await axios.get('/api/users/stats');
        
        setActiveRequests(requestsRes.data);
        setUserStats(statsRes.data);
      } catch (err) {
        console.error('Dashboard data fetch error:', err);
        setError(err.response?.data?.message || 'Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [location, getCurrentLocation]);

  const handleRespondToRequest = async (requestId, response) => {
    const success = await respondToRequest(requestId, response);
    if (success) {
      // Update active requests list
      setActiveRequests(prevRequests => 
        prevRequests.filter(req => req._id !== requestId)
      );
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <LoadingSpinner size={60} />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Dashboard</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6">
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      
      {/* Welcome Section */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          Welcome, {user?.name || 'User'}!
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-gray-600 mb-4">
              Blood Group: <span className="font-semibold text-red-600">{user?.bloodGroup}</span>
            </p>
            <p className="text-gray-600 mb-4">
              Donor Status: 
              <span 
                className={`ml-2 px-2 py-1 text-xs font-semibold rounded-full ${
                  user?.isDonor ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}
              >
                {user?.isDonor ? 'Active Donor' : 'Not a Donor'}
              </span>
            </p>
            
            {user?.isDonor && (
              <p className="text-gray-600 mb-4">
                Donation Eligibility: 
                <span 
                  className={`ml-2 px-2 py-1 text-xs font-semibold rounded-full ${
                    user?.isEligibleToDonate ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}
                >
                  {user?.isEligibleToDonate ? 'Eligible to Donate' : 'Not Eligible'}
                </span>
              </p>
            )}
            
            {userStats && userStats.lastDonation && (
              <p className="text-gray-600 mb-4">
                Last Donation: {new Date(userStats.lastDonation).toLocaleDateString()}
              </p>
            )}
          </div>
          
          <div>
            {userStats && (
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-red-50 p-4 rounded-md text-center">
                  <p className="text-3xl font-bold text-red-600">{userStats.donationCount}</p>
                  <p className="text-sm text-gray-600">Total Donations</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-md text-center">
                  <p className="text-3xl font-bold text-blue-600">{userStats.requestCount}</p>
                  <p className="text-sm text-gray-600">Total Requests</p>
                </div>
                {!user?.isEligibleToDonate && userStats.daysUntilEligible > 0 && (
                  <div className="col-span-2 bg-yellow-50 p-4 rounded-md text-center">
                    <p className="text-sm text-yellow-700">
                      You will be eligible to donate again in <span className="font-bold">{userStats.daysUntilEligible} days</span>
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        
        <div className="flex flex-wrap gap-3 mt-6">
          <Link
            to="/create-request"
            className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-md transition duration-150 ease-in-out flex items-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"
                clipRule="evenodd"
              />
            </svg>
            Create Blood Request
          </Link>
          <Link
            to="/search-donors"
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition duration-150 ease-in-out flex items-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                clipRule="evenodd"
              />
            </svg>
            Search Donors
          </Link>
          <Link
            to="/donation-history"
            className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md transition duration-150 ease-in-out flex items-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                clipRule="evenodd"
              />
            </svg>
            Donation History
          </Link>
        </div>
      </div>
      
      {/* Pending Donation Requests Section */}
      {user?.isDonor && pendingRequests.length > 0 && (
        <div className="bg-white shadow-md rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-red-500 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Pending Donation Requests Near You
            <span className="ml-2 px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
              {pendingRequests.length}
            </span>
          </h2>
          
          <div className="space-y-4">
            {pendingRequests.map(request => (
              <div key={request._id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-lg text-gray-800">
                      {request.bloodGroup} Blood Needed
                    </h3>
                    <p className="text-gray-600 text-sm">
                      Hospital: {request.hospital.name}
                    </p>
                    <p className="text-gray-600 text-sm">
                      Location: {request.hospital.address}
                    </p>
                    <p className="text-gray-600 text-sm">
                      Urgency: 
                      <span 
                        className={`ml-1 ${
                          request.urgency === 'critical' ? 'text-red-600 font-semibold' : 
                          request.urgency === 'high' ? 'text-orange-600 font-semibold' :
                          request.urgency === 'medium' ? 'text-yellow-600' : 'text-green-600'
                        }`}
                      >
                        {request.urgency.charAt(0).toUpperCase() + request.urgency.slice(1)}
                      </span>
                    </p>
                    <p className="text-gray-600 text-sm">
                      Expires: {new Date(request.expiresAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleRespondToRequest(request._id, 'accept')}
                      className="bg-green-500 hover:bg-green-600 text-white py-1 px-3 rounded-md text-sm"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleRespondToRequest(request._id, 'decline')}
                      className="bg-gray-300 hover:bg-gray-400 text-gray-800 py-1 px-3 rounded-md text-sm"
                    >
                      Decline
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Active Blood Requests Section */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Active Blood Requests
        </h2>
        
        {activeRequests.length === 0 ? (
          <div className="text-center py-8">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 text-gray-400 mx-auto mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
            <p className="text-gray-500">No active blood requests at the moment.</p>
            <Link
              to="/create-request"
              className="mt-4 inline-block bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-md transition duration-150 ease-in-out"
            >
              Create a Blood Request
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Blood Group
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hospital
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Urgency
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {activeRequests.map(request => (
                  <tr key={request._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-lg font-semibold text-red-600">{request.bloodGroup}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{request.hospital.name}</div>
                      <div className="text-sm text-gray-500">{request.hospital.location.address}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span 
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          request.urgency === 'critical' ? 'bg-red-100 text-red-800' : 
                          request.urgency === 'high' ? 'bg-orange-100 text-orange-800' :
                          request.urgency === 'medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {request.urgency.charAt(0).toUpperCase() + request.urgency.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(request.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Active
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link 
                        to={`/requests/${request._id}`}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {/* Blood Donation Tips */}
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Blood Donation Tips
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
            <h3 className="text-md font-semibold text-gray-800 mb-2">Before Donation</h3>
            <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
              <li>Eat a healthy meal before your donation</li>
              <li>Drink plenty of fluids</li>
              <li>Wear a shirt with sleeves that can be rolled up</li>
              <li>Bring your ID and donor card (if you have one)</li>
              <li>Get a good night's sleep before the donation</li>
            </ul>
          </div>
          <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
            <h3 className="text-md font-semibold text-gray-800 mb-2">After Donation</h3>
            <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
              <li>Drink extra fluids for the next 48 hours</li>
              <li>Avoid strenuous physical activity for 24 hours</li>
              <li>If you feel dizzy, lie down with your feet elevated</li>
              <li>Keep the bandage on for at least 4 hours</li>
              <li>Eat iron-rich foods to help replace the lost iron</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;