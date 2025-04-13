import React from 'react';
import { Link } from 'react-router-dom';

const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">404 - Page Not Found</h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          The page you are looking for does not exist.
        </p>
        <div className="mt-5">
          <Link
            to="/dashboard"
            className="font-medium text-indigo-600 hover:text-indigo-500"
          >
            Return to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;