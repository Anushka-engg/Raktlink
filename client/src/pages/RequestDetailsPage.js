// client/src/pages/RequestDetailsPage.js
import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import AuthContext from '../context/AuthContext';
import SocketContext from '../context/SocketContext';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const RequestDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { respondToRequest } = useContext(SocketContext);
  
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isUserRequester, setIsUserRequester] = useState(false);
  const [isCompletingDonation, setIsCompletingDonation] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [showDonorDetails, setShowDonorDetails] = useState({});

  useEffect(() => {
    const fetchRequestDetails = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/requests/${id}`);
        setRequest(response.data);
        
        // Check if the current user is the requester
        if (user?._id === response.data.requester._id) {
          setIsUserRequester(true);
        }
      } catch (err) {
        console.error('Fetch request details error:', err);
        setError(err.response?.data?.message || 'Failed to load request details');
      } finally {
        setLoading(false);
      }
    };

    fetchRequestDetails();
  }, [id, user]);

  const handleRespond = async (response) => {
    const success = await respondToRequest(id, response);
    if (success) {
      toast.success(`You have ${response === 'accept' ? 'accepted' : 'declined'} the blood request`);
      navigate('/dashboard');
    }
  };

  const handleCompleteDonation = async (donorId) => {
    try {
      setIsCompletingDonation(true);
      await axios.put(`/api/requests/${id}/complete`, { donorId });
      
      // Update the donor status in the request object
      setRequest(prevRequest => ({
        ...prevRequest,
        donors: prevRequest.donors.map(donor => 
          donor.donor._id === donorId 
            ? { ...donor, status: 'completed', completedAt: new Date() }
            : donor
        )
      }));
      
      toast.success('Donation marked as completed!');
    } catch (err) {
      console.error('Complete donation error:', err);
      toast.error(err.response?.data?.message || 'Failed to mark donation as completed');
    } finally {
      setIsCompletingDonation(false);
    }
  };

  const handleCancelRequest = async () => {
    try {
      setIsCancelling(true);
      await axios.put(`/api/requests/${id}/cancel`);
      setRequest(prevRequest => ({
        ...prevRequest,
        status: 'cancelled'
      }));
      toast.success('Blood request cancelled successfully');
    } catch (err) {
      console.error('Cancel request error:', err);
      toast.error(err.response?.data?.message || 'Failed to cancel request');
    } finally {
      setIsCancelling(false);
    }
  };

  const toggleDonorDetails = (donorId) => {
    setShowDonorDetails(prevState => ({
      ...prevState,
      [donorId]: !prevState[donorId]
    }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <LoadingSpinner size={60} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
              <div className="mt-4">
                <button
                  type="button"
                  onClick={() => navigate('/dashboard')}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Go back to dashboard
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!request) {
    return null;
  }

  const statusColor = 
    request.status === 'active' ? 'bg-green-100 text-green-800' :
    request.status === 'fulfilled' ? 'bg-blue-100 text-blue-800' :
    request.status === 'cancelled' ? 'bg-gray-100 text-gray-800' :
    'bg-yellow-100 text-yellow-800';

  const urgencyColor = 
    request.urgency === 'critical' ? 'bg-red-100 text-red-800' :
    request.urgency === 'high' ? 'bg-orange-100 text-orange-800' :
    request.urgency === 'medium' ? 'bg-yellow-100 text-yellow-800' :
    'bg-green-100 text-green-800';

  const acceptedDonors = request.donors.filter(d => d.status === 'accepted' || d.status === 'completed');
  const completedDonors = request.donors.filter(d => d.status === 'completed');
  const pendingUnits = request.units - completedDonors.length;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-gray-900"
        >
          <svg className="mr-1 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          Back
        </button>
      </div>
      
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 bg-red-700 text-white flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold">Blood Request Details</h2>
            <p className="mt-1 text-sm">{request.hospital.name}</p>
          </div>
          <div>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColor}`}>
              {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
            </span>
          </div>
        </div>
        
        <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="col-span-1">
              <div className="bg-gray-50 px-4 py-5 rounded-lg shadow-sm">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Blood Details</h3>
                <div className="mt-5">
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <p>Blood Group:</p>
                    <p className="font-semibold text-xl text-red-600">{request.bloodGroup}</p>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-sm text-gray-500">
                    <p>Units Required:</p>
                    <p className="font-medium">{request.units}</p>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-sm text-gray-500">
                    <p>Pending Units:</p>
                    <p className="font-medium">{pendingUnits}</p>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-sm text-gray-500">
                    <p>Urgency:</p>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${urgencyColor}`}>
                      {request.urgency.charAt(0).toUpperCase() + request.urgency.slice(1)}
                    </span>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-sm text-gray-500">
                    <p>Created:</p>
                    <p className="font-medium">{new Date(request.createdAt).toLocaleString()}</p>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-sm text-gray-500">
                    <p>Expires:</p>
                    <p className="font-medium">{new Date(request.expiresAt).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="col-span-1">
              <div className="bg-gray-50 px-4 py-5 rounded-lg shadow-sm">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Patient Details</h3>
                <div className="mt-5">
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <p>Name:</p>
                    <p className="font-medium">{request.patient.name}</p>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-sm text-gray-500">
                    <p>Age:</p>
                    <p className="font-medium">{request.patient.age} years</p>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-sm text-gray-500">
                    <p>Gender:</p>
                    <p className="font-medium capitalize">{request.patient.gender}</p>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-sm text-gray-500">
                    <p>Reason:</p>
                  </div>
                  <div className="mt-1 text-sm text-gray-500">
                    <p>{request.reason}</p>
                  </div>
                  {request.additionalNotes && (
                    <>
                      <div className="mt-3 flex items-center justify-between text-sm text-gray-500">
                        <p>Additional Notes:</p>
                      </div>
                      <div className="mt-1 text-sm text-gray-500">
                        <p>{request.additionalNotes}</p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
            
            <div className="col-span-1">
              <div className="bg-gray-50 px-4 py-5 rounded-lg shadow-sm">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Hospital Details</h3>
                <div className="mt-5">
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <p>Name:</p>
                    <p className="font-medium">{request.hospital.name}</p>
                  </div>
                  <div className="mt-3 flex items-center text-sm text-gray-500">
                    <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                    <p>{request.hospital.location.address}</p>
                  </div>
                  <div className="mt-3">
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(request.hospital.location.address)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      <svg className="-ml-0.5 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M12 1.586l-4 4V2a1 1 0 10-2 0v5a1 1 0 001 1h5a1 1 0 100-2H8.414l4-4a1 1 0 00-1.414-1.414z" clipRule="evenodd" />
                      </svg>
                      Open in Maps
                    </a>
                  </div>
                </div>
                
                <div className="mt-6">
                  <h4 className="text-sm font-medium text-gray-500">Requester Details</h4>
                  <div className="mt-2 text-sm text-gray-500">
                    <p>Name: {request.requester.name}</p>
                    {isUserRequester || request.status === 'fulfilled' ? (
                      <>
                        <p className="mt-1">Phone: {request.requester.phone}</p>
                        <p className="mt-1">Email: {request.requester.email}</p>
                      </>
                    ) : (
                      <p className="mt-1 text-xs text-gray-400">Contact details available after accepting the request</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Donor Response Section */}
          {!isUserRequester && user?.isDonor && request.status === 'active' && (
            <div className="mt-8 border-t border-gray-200 pt-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Respond to this Blood Request</h3>
              <div className="mt-4 flex space-x-3">
                <button
                  onClick={() => handleRespond('accept')}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  Accept Request
                </button>
                <button
                  onClick={() => handleRespond('decline')}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Decline
                </button>
              </div>
            </div>
          )}
          
          {/* Donors List Section */}
          {acceptedDonors.length > 0 && (
            <div className="mt-8 border-t border-gray-200 pt-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Donors ({acceptedDonors.length})
              </h3>
              <div className="mt-4 space-y-4">
                {acceptedDonors.map(donor => (
                  <div key={donor.donor._id} className="bg-gray-50 rounded-lg p-4 shadow-sm">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">{donor.donor.name}</h4>
                        <p className="text-sm text-gray-500">Blood Group: {donor.donor.bloodGroup}</p>
                        <p className="text-sm text-gray-500">Status: 
                          <span className={`ml-1 ${donor.status === 'completed' ? 'text-green-600' : 'text-blue-600'}`}>
                            {donor.status.charAt(0).toUpperCase() + donor.status.slice(1)}
                          </span>
                        </p>
                        <p className="text-sm text-gray-500">Responded: {new Date(donor.respondedAt).toLocaleString()}</p>
                        {donor.status === 'completed' && donor.completedAt && (
                          <p className="text-sm text-gray-500">Completed: {new Date(donor.completedAt).toLocaleString()}</p>
                        )}
                      </div>
                      
                      <div>
                        {isUserRequester && donor.status === 'accepted' && (
                          <button
                            onClick={() => toggleDonorDetails(donor.donor._id)}
                            className="text-sm text-blue-600 hover:text-blue-800 focus:outline-none"
                          >
                            {showDonorDetails[donor.donor._id] ? 'Hide Details' : 'View Contact'}
                          </button>
                        )}
                      </div>
                    </div>
                    
                    {showDonorDetails[donor.donor._id] && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <p className="text-sm text-gray-500">Phone: {donor.donor.phone}</p>
                        <p className="text-sm text-gray-500">Email: {donor.donor.email}</p>
                        
                        {donor.status !== 'completed' && (
                          <button
                            onClick={() => handleCompleteDonation(donor.donor._id)}
                            disabled={isCompletingDonation}
                            className="mt-3 inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-green-300"
                          >
                            {isCompletingDonation ? 'Processing...' : 'Mark as Completed'}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Actions Section for Requester */}
          {isUserRequester && request.status === 'active' && (
            <div className="mt-8 border-t border-gray-200 pt-6">
              <div className="flex justify-end">
                <button
                  onClick={handleCancelRequest}
                  disabled={isCancelling}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  {isCancelling ? 'Cancelling...' : 'Cancel Request'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RequestDetailsPage;