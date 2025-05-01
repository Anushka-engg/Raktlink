// client/src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Context Providers
import { AuthProvider } from './context/AuthContext';
import { LocationProvider } from './context/LocationContext';
import { SocketProvider } from './context/SocketContext';

// Layout Components
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import CreateRequestPage from './pages/CreateRequestPage';
import RequestDetailsPage from './pages/RequestDetailsPage';
import DonorSearchPage from './pages/DonorSearchPage';
import DonationHistoryPage from './pages/DonationHistoryPage';
import RequestHistoryPage from './pages/RequestHistoryPage';
import NotFoundPage from './pages/NotFoundPage';

// Routes
import PrivateRoute from './components/routes/PrivateRoute';
import PublicRoute from './components/routes/PublicRoute';

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <LocationProvider>
          <SocketProvider>
            <div className="flex flex-col min-h-screen bg-gray-50">
              <Navbar />
              <main className="flex-grow container mx-auto px-4 py-8">
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<HomePage />} />
                  <Route 
                    path="/login" 
                    element={
                      <PublicRoute>
                        <LoginPage />
                      </PublicRoute>
                    } 
                  />
                  <Route 
                    path="/register" 
                    element={
                      <PublicRoute>
                        <RegisterPage />
                      </PublicRoute>
                    } 
                  />
                  
                  {/* Private Routes */}
                  <Route 
                    path="/dashboard" 
                    element={
                      <PrivateRoute>
                        <DashboardPage />
                      </PrivateRoute>
                    } 
                  />
                  <Route 
                    path="/profile" 
                    element={
                      <PrivateRoute>
                        <ProfilePage />
                      </PrivateRoute>
                    } 
                  />
                  <Route 
                    path="/create-request" 
                    element={
                      <PrivateRoute>
                        <CreateRequestPage />
                      </PrivateRoute>
                    } 
                  />
                  <Route 
                    path="/requests/:id" 
                    element={
                      <PrivateRoute>
                        <RequestDetailsPage />
                      </PrivateRoute>
                    } 
                  />
                  <Route 
                    path="/search-donors" 
                    element={
                      <PrivateRoute>
                        <DonorSearchPage />
                      </PrivateRoute>
                    } 
                  />
                  <Route 
                    path="/donation-history" 
                    element={
                      <PrivateRoute>
                        <DonationHistoryPage />
                      </PrivateRoute>
                    } 
                  />
                  <Route 
                    path="/request-history" 
                    element={
                      <PrivateRoute>
                        <RequestHistoryPage />
                      </PrivateRoute>
                    } 
                  />
                  
                  {/* 404 Page */}
                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </main>
              <Footer />
            </div>
            
            <ToastContainer position="top-right" autoClose={5000} />
          </SocketProvider>
        </LocationProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;  // Ensure this line is present