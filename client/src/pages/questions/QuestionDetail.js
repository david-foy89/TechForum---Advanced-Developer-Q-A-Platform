import React from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, Home } from 'lucide-react';

const QuestionDetail = () => {
  return (
    <div className="container py-8">
      <div className="max-w-4xl mx-auto text-center">
        <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Question Detail Page
        </h1>
        <p className="text-gray-600 mb-6">
          This page will show detailed question content, answers, and allow users to post new answers.
          Implementation coming soon!
        </p>
        <Link to="/questions" className="btn btn-primary">
          <Home className="w-4 h-4" />
          Back to Questions
        </Link>
      </div>
    </div>
  );
};

export default QuestionDetail;