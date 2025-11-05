import React from 'react';
import { Link } from 'react-router-dom';
import { Grid, Home } from 'lucide-react';

const Categories = () => {
  return (
    <div className="container py-8">
      <div className="max-w-4xl mx-auto text-center">
        <Grid className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Categories Page
        </h1>
        <p className="text-gray-600 mb-6">
          This page will display all available categories with detailed information,
          question counts, and category management features. Implementation coming soon!
        </p>
        <Link to="/dashboard" className="btn btn-primary">
          <Home className="w-4 h-4" />
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default Categories;