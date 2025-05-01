// client/src/components/routes/PublicRoute.js
import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';
import LoadingSpinner from '../ui/LoadingSpinner';

const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <LoadingSpinner size={60} />
      </div>
    );
  }

  return isAuthenticated ? <Navigate to="/dashboard" /> : children;
};

export default PublicRoute;