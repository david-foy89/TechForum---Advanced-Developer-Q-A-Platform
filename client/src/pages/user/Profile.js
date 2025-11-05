import React from 'react';
import { Link } from 'react-router-dom';
import { User, Home } from 'lucide-react';

const Profile = () => {
  return (
    <div className="container py-8">
      <div className="max-w-4xl mx-auto text-center">
        <User className="w-16 h-16 text-blue-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          User Profile Page
        </h1>
        <p className="text-gray-600 mb-6">
          This page will display user profile information, questions asked, answers given, 
          and allow profile editing. Implementation coming soon!
        </p>
        <Link to="/dashboard" className="btn btn-primary">
          <Home className="w-4 h-4" />
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default Profile;