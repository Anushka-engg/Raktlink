// client/src/pages/DonationHistoryPage.js
import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const DonationHistoryPage = () => {
  const { user } = useContext(AuthContext);
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalDonations: 0,
    lastDonation: null,
    nextEligibleDate: null
  });

  useEffect(() => {
    const fetchDonationHistory = async () => {
      try {
        setLoading(true);
        
        // Fetch donation history
        const historyRes = await axios.get('/api/users/donation-history');
        setDonations(historyRes.data);
        
        // Fetch user stats
        const statsRes = await axios.get('/api/users/stats');
        
        // Calculate next eligible date if user is not eligible
        let nextEligibleDate = null;
        if (!user.isEligibleToDonate && statsRes.data.lastDonation) {
          const lastDonationDate = new Date(statsRes.data.lastDonation);
          nextEligibleDate = new Date(lastDonationDate);
          nextEligibleDate.setDate(nextEligibleDate.getDate() + 90); // 3 months
        }
        
        setStats({
          totalDonations: statsRes.data.donationCount || 0,
          lastDonation: statsRes.data.lastDonation,
          nextEligibleDate
        });
      } catch (err) {
        console.error('Fetch donation history error:', err);
        setError(err.response?.data?.message || 'Failed to load donation history');
      } finally {
        setLoading(false);
      }
    };

    fetchDonationHistory();
  }, [user]);

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
        <h1 className="text-2xl font-bold text-gray-900">Donation History</h1>
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
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 mb-8">
        {/* Total Donations Card */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">
              Total Donations
            </dt>
            <dd className="mt-1 text-3xl font-semibold text-red-600">
              {stats.totalDonations}
            </dd>
          </div>
        </div>
        
        {/* Last Donation Card */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">
              Last Donation
            </dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">
              {stats.lastDonation ? new Date(stats.lastDonation).toLocaleDateString() : 'None'}
            </dd>
          </div>
        </div>
        
        {/* Eligibility Status Card */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">
              Donation Eligibility
            </dt>
            <dd className="mt-1 flex items-center">
              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                user.isEligibleToDonate ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {user.isEligibleToDonate ? 'Eligible to Donate' : 'Not Eligible'}
              </span>
              
              {!user.isEligibleToDonate && stats.nextEligibleDate && (
                <span className="ml-2 text-sm text-gray-500">
                  Eligible from: {stats.nextEligibleDate.toLocaleDateString()}
                </span>
              )}
            </dd>
          </div>
        </div>
      </div>
      
      {/* Donation History Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="px-4 py-5 sm:px-6 bg-gray-50">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Donation Records
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Your complete blood donation history
          </p>
        </div>
        
        {donations.length === 0 ? (
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
            <h3 className="mt-2 text-sm font-medium text-gray-900">No donations</h3>
            <p className="mt-1 text-sm text-gray-500">
              You haven't made any blood donations yet.
            </p>
            <div className="mt-6">
              <Link
                to="/dashboard"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Go to Dashboard
              </Link>
            </div>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {donations.map((donation, index) => (
              <li key={donation._id || index}>
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="bg-red-100 rounded-full p-2 mr-3">
                        <svg className="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-red-600">{donation.requestId?.bloodGroup || 'Unknown'} Blood Donation</p>
                        <p className="text-sm text-gray-500">
                          Donated on {new Date(donation.donatedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div>
                      {donation.requestId?._id && (
                        <Link
                          to={`/requests/${donation.requestId._id}`}
                          className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                          View Details
                        </Link>
                      )}
                    </div>
                  </div>
                  <div className="mt-2 sm:flex sm:justify-between">
                    <div className="sm:flex">
                      <p className="flex items-center text-sm text-gray-500">
                        <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                        Recipient: {donation.recipientId?.name || 'Unknown'}
                      </p>
                    </div>
                    <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                      <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                      <p>
                        {donation.requestId?.hospital?.name || 'Unknown Hospital'}
                      </p>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      
      {/* Information Card */}
      <div className="mt-8 bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Blood Donation Eligibility</h3>
          <div className="mt-2 max-w-xl text-sm text-gray-500">
            <p>
              Most healthy adults are eligible to donate blood every 3 months (90 days). After each donation, your body needs time to replenish the red blood cells that were donated.
            </p>
          </div>
          <div className="mt-5">
            <a
              href="https://www.redcrossblood.org/donate-blood/how-to-donate/eligibility-requirements.html"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Learn more about eligibility
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DonationHistoryPage;