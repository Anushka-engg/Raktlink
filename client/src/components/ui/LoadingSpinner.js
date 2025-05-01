// client/src/components/ui/LoadingSpinner.js
import React from 'react';

const LoadingSpinner = ({ size = 40, color = 'red' }) => {
  return (
    <div className="flex justify-center items-center">
      <div
        className={`spinner-border animate-spin inline-block w-${size / 8} h-${size / 8} border-4 rounded-full`}
        style={{
          borderColor: color === 'red' ? '#ef4444' : '#4f46e5',
          borderRightColor: 'transparent',
          width: `${size}px`,
          height: `${size}px`
        }}
        role="status"
      >
        <span className="sr-only">Loading...</span>
      </div>
    </div>
  );
};

export default LoadingSpinner;