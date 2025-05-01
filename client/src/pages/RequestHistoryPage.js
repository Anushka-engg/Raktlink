// client/src/pages/RequestHistoryPage.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const statusColors = {
  active: 'bg-green-100 text-green-800',
  fulfilled: 'bg-blue-100 text-blue-800',
  cancelled: 'bg-gray-100 text-gray-800',
  expired: 'bg-yellow-100 text-yellow-800',
  pending: 'bg-yellow-100 text-yellow-800'
};

const RequestHistoryPage = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalRequests: 0,
    successfulRequests: 0,
    pendingRequests: 0
  });

  useEffect(() => {
    const fetchRequestHistory = async () => {
      try {
        setLoading(true);
        
        // Fetch request history
        const historyRes = await axios.get('/api/users/request-history');
        setRequests(historyRes.data);
        
        // Fetch user stats
        const statsRes = await axios.get('/api/users/stats');
        
        setStats({
          totalRequests: statsRes.data.requestCount || 0,
          successfulRequests: statsRes.data.successfulRequestCount || 0,
          pendingRequests: (statsRes.data.requestCount || 0) - (statsRes.data.successfulRequestCount || 0)
        });
      } catch (err) {
        console.error('Fetch request history error:', err);
        setError(err.response?.data?.message || 'Failed to load request history');
      } finally {
        setLoading(false);
      }
    };

    fetchRequestHistory();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <LoadingSpinner size={60} />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Blood Request History</h1>
        <Link
          to="/dashboard"
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        >
          Back to Dashboard
        </Link>
      </div>
      
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
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
      
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 mb-8">
        {/* Total Requests Card */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">
              Total Requests
            </dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">
              {stats.totalRequests}
            </dd>
          </div>
        </div>
        
        {/* Successful Requests Card */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">
              Fulfilled Requests
            </dt>
            <dd className="mt-1 text-3xl font-semibold text-green-600">
              {stats.successfulRequests}
            </dd>
          </div>
        </div>
        
        {/* Pending Requests Card */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">
              Pending/Other Requests
            </dt>
            <dd className="mt-1 text-3xl font-semibold text-yellow-600">
              {stats.pendingRequests}
            </dd>
          </div>
        </div>
      </div>
      
      {/* Request History Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="px-4 py-5 sm:px-6 bg-gray-50">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Request Records
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Your complete blood request history
          </p>
        </div>
        
        {requests.length === 0 ? (
          <div className="px-4 py-5 sm:p-6 text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1"
                d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No blood requests</h3>
            <p className="mt-1 text-sm text-gray-500">
              You haven't made any blood requests yet.
            </p>
            <div className="mt-6">
              <Link
                to="/create-request"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Create Blood Request
              </Link>
            </div>
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
                    Requested On
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Donors
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">View</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {requests.map((request) => (
                  <tr key={request.requestId?._id || request._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-lg font-semibold text-red-600">
                        {request.requestId?.bloodGroup || 'Unknown'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{request.requestId?.hospital?.name || 'Unknown'}</div>
                      <div className="text-sm text-gray-500">{request.requestId?.hospital?.location?.address || ''}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(request.requestedAt || request.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[request.status] || statusColors[request.requestId?.status] || 'bg-gray-100 text-gray-800'}`}>
                        {(request.status || request.requestId?.status || 'Unknown').charAt(0).toUpperCase() + (request.status || request.requestId?.status || 'Unknown').slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {request.requestId?.donors?.length || 0} donors
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {request.requestId?._id && (
                        <Link
                          to={`/requests/${request.requestId._id}`}
                          className="text-red-600 hover:text-red-900"
                        >
                          View
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {/* Call to Action */}
      <div className="mt-8 flex justify-center">
        <Link
          to="/create-request"
          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        >
          Create New Blood Request
        </Link>
      </div>
    </div>
  );
};

export default RequestHistoryPage;