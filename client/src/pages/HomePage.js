// client/src/pages/HomePage.js
import React from 'react';
import { Link } from 'react-router-dom';

const HomePage = () => {
  return (
    <div>
      {/* Hero Section */}
      <section className="bg-red-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
                Saving Lives Through Quick Connections
              </h1>
              <p className="mt-6 text-xl max-w-3xl">
                Raktlink connects blood donors with those in need, using location-based technology to ensure timely help during emergencies.
              </p>
              <div className="mt-10 flex space-x-4">
                <Link
                  to="/register"
                  className="bg-white text-red-700 px-5 py-3 rounded-md font-medium shadow-md hover:bg-gray-100 transition duration-150 ease-in-out"
                >
                  Become a Donor
                </Link>
                <Link
                  to="/create-request"
                  className="bg-red-600 text-white px-5 py-3 rounded-md font-medium shadow-md hover:bg-red-800 transition duration-150 ease-in-out"
                >
                  Request Blood
                </Link>
              </div>
            </div>
            <div className="hidden md:block">
              <img
                src="/images/hero-image.png"
                alt="Blood donation"
                className="max-w-full h-auto rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              How Raktlink Works
            </h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              Our platform simplifies the blood donation process through a few easy steps.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="bg-gray-50 p-6 rounded-lg shadow-md">
              <div className="flex justify-center">
                <div className="bg-red-100 rounded-full p-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-10 w-10 text-red-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
              </div>
              <h3 className="mt-4 text-xl font-semibold text-gray-900 text-center">
                Register
              </h3>
              <p className="mt-2 text-gray-600 text-center">
                Create your profile with your blood group, contact details, and location information.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-gray-50 p-6 rounded-lg shadow-md">
              <div className="flex justify-center">
                <div className="bg-red-100 rounded-full p-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-10 w-10 text-red-600"
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
                </div>
              </div>
              <h3 className="mt-4 text-xl font-semibold text-gray-900 text-center">
                Request or Donate
              </h3>
              <p className="mt-2 text-gray-600 text-center">
                Create a blood request with necessary details or respond to requests based on your location.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-gray-50 p-6 rounded-lg shadow-md">
              <div className="flex justify-center">
                <div className="bg-red-100 rounded-full p-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-10 w-10 text-red-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>
              <h3 className="mt-4 text-xl font-semibold text-gray-900 text-center">
                Connect & Save Lives
              </h3>
              <p className="mt-2 text-gray-600 text-center">
                Get notified of matching donors, communicate securely, and complete the donation process.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Why Choose Raktlink?
            </h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              Our platform offers several advantages over traditional blood donation methods.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {/* Benefit 1 */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-red-600 mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900">
                Real-Time Matching
              </h3>
              <p className="mt-2 text-gray-600">
                Our system instantly connects requesters with compatible donors in their vicinity, reducing critical response time.
              </p>
            </div>

            {/* Benefit 2 */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-red-600 mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8"
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
              </div>
              <h3 className="text-xl font-semibold text-gray-900">
                Location-Based Services
              </h3>
              <p className="mt-2 text-gray-600">
                Using GPS technology, we identify donors within a specified radius, making the process faster and more efficient.
              </p>
            </div>

            {/* Benefit 3 */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-red-600 mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900">
                Privacy & Security
              </h3>
              <p className="mt-2 text-gray-600">
                Contact details are only shared after mutual approval, ensuring user privacy and preventing misuse.
              </p>
            </div>

            {/* Benefit 4 */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-red-600 mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900">
                Donation History
              </h3>
              <p className="mt-2 text-gray-600">
                Track your donation activities, maintain eligibility status, and ensure safe donation intervals.
              </p>
            </div>

            {/* Benefit 5 */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-red-600 mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900">
                Real-Time Notifications
              </h3>
              <p className="mt-2 text-gray-600">
                Receive instant alerts about nearby blood requests or donor responses via our notification system.
              </p>
            </div>

            {/* Benefit 6 */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-red-600 mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900">
                User-Friendly Interface
              </h3>
              <p className="mt-2 text-gray-600">
                Our intuitive design makes it easy to create requests, find donors, and manage your donation activities.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-red-700 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold sm:text-4xl">
              Ready to Make a Difference?
            </h2>
            <p className="mt-4 text-lg max-w-3xl mx-auto">
              Join our community of donors today and help save lives with just a few clicks. Your contribution can make a world of difference to someone in need.
            </p>
            <div className="mt-8 flex justify-center space-x-4">
              <Link
                to="/register"
                className="bg-white text-red-700 px-6 py-3 rounded-md font-medium shadow-md hover:bg-gray-100 transition duration-150 ease-in-out"
              >
                Register Now
              </Link>
              <Link
                to="/login"
                className="bg-transparent border-2 border-white text-white px-6 py-3 rounded-md font-medium hover:bg-red-600 transition duration-150 ease-in-out"
              >
                Login
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Frequently Asked Questions
            </h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              Find answers to common questions about blood donation and using our platform.
            </p>
          </div>

          <div className="mt-12 max-w-3xl mx-auto">
            <div className="space-y-8">
              {/* FAQ Item 1 */}
              <div className="bg-gray-50 p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-gray-900">
                  Who can donate blood?
                </h3>
                <p className="mt-2 text-gray-600">
                  Generally, anyone who is in good health, aged between 18-65 years, and weighs more than 50kg can donate blood. However, specific criteria may vary based on local regulations and medical guidelines.
                </p>
              </div>

              {/* FAQ Item 2 */}
              <div className="bg-gray-50 p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-gray-900">
                  How often can I donate blood?
                </h3>
                <p className="mt-2 text-gray-600">
                  Most healthy donors can give blood every 3 months (90 days). This interval allows your body to replenish the donated red blood cells. The Raktlink system helps track your donation history and eligibility status.
                </p>
              </div>

              {/* FAQ Item 3 */}
              <div className="bg-gray-50 p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-gray-900">
                  Is my data secure on Raktlink?
                </h3>
                <p className="mt-2 text-gray-600">
                  Yes, we take data security very seriously. Your contact information is only shared with requesters after you approve a donation request. All data is encrypted and stored securely according to industry standards.
                </p>
              </div>

              {/* FAQ Item 4 */}
              <div className="bg-gray-50 p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-gray-900">
                  How does the location-based matching work?
                </h3>
                <p className="mt-2 text-gray-600">
                  When a blood request is created, our system searches for compatible donors within a specified radius (2-10 km based on urgency). Identified donors receive notifications about the request and can choose to respond.
                </p>
              </div>
            </div>

            <div className="mt-8 text-center">
              <Link
                to="#"
                className="text-red-600 font-medium hover:text-red-800"
              >
                View all FAQs
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;