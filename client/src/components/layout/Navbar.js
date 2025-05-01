// client/src/components/layout/Navbar.js
import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';
import SocketContext from '../../context/SocketContext';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useContext(AuthContext);
  const { notifications } = useContext(SocketContext);
  const [isOpen, setIsOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // Count unread notifications
  const unreadCount = notifications.filter(n => !n.read).length;

  // Toggle mobile menu
  const toggleMenu = () => {
    setIsOpen(!isOpen);
    if (showNotifications) setShowNotifications(false);
  };

  // Toggle notifications panel
  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
    if (isOpen) setIsOpen(false);
  };

  // Guest links
  const guestLinks = (
    <>
      <Link
        to="/login"
        className="text-white hover:text-red-200 px-3 py-2 rounded-md text-sm font-medium"
        onClick={() => setIsOpen(false)}
      >
        Login
      </Link>
      <Link
        to="/register"
        className="bg-red-600 text-white hover:bg-red-700 px-3 py-2 rounded-md text-sm font-medium"
        onClick={() => setIsOpen(false)}
      >
        Register
      </Link>
    </>
  );

  // Auth links
  const authLinks = (
    <>
      <Link
        to="/dashboard"
        className="text-white hover:text-red-200 px-3 py-2 rounded-md text-sm font-medium"
        onClick={() => setIsOpen(false)}
      >
        Dashboard
      </Link>
      <Link
        to="/create-request"
        className="text-white hover:text-red-200 px-3 py-2 rounded-md text-sm font-medium"
        onClick={() => setIsOpen(false)}
      >
        Request Blood
      </Link>
      <div className="relative">
        <button
          onClick={toggleNotifications}
          className="text-white hover:text-red-200 px-3 py-2 rounded-md text-sm font-medium flex items-center"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-1"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
          </svg>
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {/* Notifications Panel */}
        {showNotifications && (
          <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg overflow-hidden z-20">
            <div className="py-2 px-3 bg-gray-100 border-b flex justify-between items-center">
              <h3 className="text-sm font-semibold text-gray-700">Notifications</h3>
              <button
                onClick={() => setShowNotifications(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
            <div className="max-h-60 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="py-4 px-3 text-sm text-gray-500 text-center">
                  No notifications
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`py-2 px-3 border-b hover:bg-gray-50 ${
                      !notification.read ? 'bg-blue-50' : ''
                    }`}
                  >
                    <p className="text-sm text-gray-800">{notification.message}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(notification.timestamp).toLocaleTimeString()} · {new Date(notification.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                ))
              )}
            </div>
            {notifications.length > 0 && (
              <div className="py-2 px-3 bg-gray-100 text-center">
                <button
                  onClick={() => {
                    setShowNotifications(false);
                  }}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Mark all as read
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      <div className="relative group">
        <button className="text-white hover:text-red-200 px-3 py-2 rounded-md text-sm font-medium flex items-center">
          <span className="mr-1">{user?.name?.split(' ')[0] || 'Account'}</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg overflow-hidden z-20 hidden group-hover:block">
          <Link
            to="/profile"
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            onClick={() => setIsOpen(false)}
          >
            Profile
          </Link>
          <Link
            to="/donation-history"
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            onClick={() => setIsOpen(false)}
          >
            Donation History
          </Link>
          <Link
            to="/request-history"
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            onClick={() => setIsOpen(false)}
          >
            Request History
          </Link>
          <button
            onClick={() => {
              logout();
              setIsOpen(false);
            }}
            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            Logout
          </button>
        </div>
      </div>
    </>
  );

  return (
    <nav className="bg-red-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <img
                className="h-8 w-auto mr-2"
                src="/logo.png"
                alt="Raktlink Logo"
              />
              <span className="text-white font-bold text-xl">Raktlink</span>
            </Link>
            <div className="hidden md:block ml-10">
              <div className="flex items-baseline space-x-4">
                <Link
                  to="/"
                  className="text-white hover:text-red-200 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Home
                </Link>
                {isAuthenticated ? authLinks : guestLinks}
              </div>
            </div>
          </div>
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="bg-red-800 inline-flex items-center justify-center p-2 rounded-md text-red-200 hover:text-white hover:bg-red-600 focus:outline-none"
            >
              <svg
                className={`${isOpen ? 'hidden' : 'block'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
              <svg
                className={`${isOpen ? 'block' : 'hidden'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`${isOpen ? 'block' : 'hidden'} md:hidden`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          <Link
            to="/"
            className="text-white hover:text-red-200 block px-3 py-2 rounded-md text-base font-medium"
            onClick={() => setIsOpen(false)}
          >
            Home
          </Link>
          {isAuthenticated ? (
            <>
              <Link
                to="/dashboard"
                className="text-white hover:text-red-200 block px-3 py-2 rounded-md text-base font-medium"
                onClick={() => setIsOpen(false)}
              >
                Dashboard
              </Link>
              <Link
                to="/create-request"
                className="text-white hover:text-red-200 block px-3 py-2 rounded-md text-base font-medium"
                onClick={() => setIsOpen(false)}
              >
                Request Blood
              </Link>
              <Link
                to="/profile"
                className="text-white hover:text-red-200 block px-3 py-2 rounded-md text-base font-medium"
                onClick={() => setIsOpen(false)}
              >
                Profile
              </Link>
              <Link
                to="/donation-history"
                className="text-white hover:text-red-200 block px-3 py-2 rounded-md text-base font-medium"
                onClick={() => setIsOpen(false)}
              >
                Donation History
              </Link>
              <Link
                to="/request-history"
                className="text-white hover:text-red-200 block px-3 py-2 rounded-md text-base font-medium"
                onClick={() => setIsOpen(false)}
              >
                Request History
              </Link>
              <button
                onClick={() => {
                  logout();
                  setIsOpen(false);
                }}
                className="text-white hover:text-red-200 block w-full text-left px-3 py-2 rounded-md text-base font-medium"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-white hover:text-red-200 block px-3 py-2 rounded-md text-base font-medium"
                onClick={() => setIsOpen(false)}
              >
                Login
              </Link>
              <Link
                to="/register"
                className="text-white hover:text-red-200 block px-3 py-2 rounded-md text-base font-medium"
                onClick={() => setIsOpen(false)}
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;