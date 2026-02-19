import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-primary-800 flex items-center justify-center text-white">
      <div className="text-center px-4">
        <div className="text-8xl font-black text-primary-600 mb-4">404</div>
        <h1 className="text-3xl font-bold mb-4">Page Not Found</h1>
        <p className="text-primary-200 text-lg mb-8 max-w-md mx-auto">
          The page you're looking for doesn't exist or you don't have permission to access it.
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link to="/" className="bg-white text-primary-800 px-6 py-3 rounded-lg font-semibold hover:bg-primary-50 transition-colors">
            🏠 Go Home
          </Link>
          <Link to="/verify" className="bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors">
            🔍 Verify Plate
          </Link>
          <Link to="/login" className="bg-secondary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-secondary-700 transition-colors">
            🔐 Staff Login
          </Link>
        </div>
      </div>
    </div>
  );
}
