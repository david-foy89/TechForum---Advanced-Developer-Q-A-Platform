import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { 
  MessageSquare, 
  Users, 
  TrendingUp, 
  Clock, 
  Eye,
  ThumbsUp,
  MessageCircle,
  Plus,
  Tag
} from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';

const Dashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    categories: [],
    recentQuestions: [],
    stats: {},
    popularTags: []
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [categoriesRes, questionsRes] = await Promise.all([
        axios.get('/categories'),
        axios.get('/questions?limit=5&sortBy=newest')
      ]);

      // Mock stats for now
      const stats = {
        totalQuestions: questionsRes.data.pagination?.total || 0,
        totalUsers: 120,
        answeredQuestions: 45,
        myQuestions: 5
      };

      // Mock popular tags
      const popularTags = [
        'javascript', 'react', 'nodejs', 'mongodb', 'express'
      ];

      setData({
        categories: categoriesRes.data.data || [],
        recentQuestions: questionsRes.data.data || [],
        stats,
        popularTags
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading dashboard..." />;
  }

  return (
    <div className="container py-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back, {user?.username}!
        </h1>
        <p className="text-gray-600">
          Ready to explore the latest discussions and share your knowledge?
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="card bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Total Questions</p>
              <p className="text-2xl font-bold">{data.stats.totalQuestions}</p>
            </div>
            <MessageSquare className="w-8 h-8 text-blue-200" />
          </div>
        </div>

        <div className="card bg-gradient-to-r from-green-500 to-green-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Active Users</p>
              <p className="text-2xl font-bold">{data.stats.totalUsers}</p>
            </div>
            <Users className="w-8 h-8 text-green-200" />
          </div>
        </div>

        <div className="card bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Answered</p>
              <p className="text-2xl font-bold">{data.stats.answeredQuestions}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-purple-200" />
          </div>
        </div>

        <div className="card bg-gradient-to-r from-orange-500 to-orange-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">My Questions</p>
              <p className="text-2xl font-bold">{data.stats.myQuestions}</p>
            </div>
            <MessageCircle className="w-8 h-8 text-orange-200" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Categories Section */}
        <div className="lg:col-span-1">
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Categories</h2>
              <p className="text-sm text-gray-600 mt-1">
                Browse questions by topic
              </p>
            </div>

            <div className="space-y-3">
              {data.categories.map((category) => (
                <Link
                  key={category._id}
                  to={`/questions?categoryId=${category._id}`}
                  className="block p-3 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-all duration-200 group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: category.color }}
                      />
                      <div>
                        <h3 className="font-medium text-gray-900 group-hover:text-primary-600">
                          {category.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {category.questionCount} questions
                        </p>
                      </div>
                    </div>
                    <MessageSquare className="w-4 h-4 text-gray-400 group-hover:text-primary-500" />
                  </div>
                </Link>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <Link
                to="/categories"
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                View all categories →
              </Link>
            </div>
          </div>
        </div>

        {/* Recent Questions */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="card-header flex items-center justify-between">
              <div>
                <h2 className="card-title">Recent Questions</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Latest discussions from the community
                </p>
              </div>
              <Link
                to="/ask"
                className="btn btn-primary btn-sm"
              >
                <Plus className="w-4 h-4" />
                Ask Question
              </Link>
            </div>

            <div className="space-y-4">
              {data.recentQuestions.map((question) => (
                <div key={question._id} className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <Link
                        to={`/questions/${question._id}`}
                        className="block group"
                      >
                        <h3 className="font-medium text-gray-900 group-hover:text-primary-600 truncate">
                          {question.title}
                        </h3>
                      </Link>
                      
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          {question.views} views
                        </div>
                        <div className="flex items-center gap-1">
                          <ThumbsUp className="w-4 h-4" />
                          {question.votes} votes
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageCircle className="w-4 h-4" />
                          {question.answerCount} answers
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {new Date(question.createdAt).toLocaleDateString()}
                        </div>
                      </div>

                      {/* Tags */}
                      {question.tags && question.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {question.tags.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700"
                            >
                              {tag}
                            </span>
                          ))}
                          {question.tags.length > 3 && (
                            <span className="text-xs text-gray-500">
                              +{question.tags.length - 3} more
                            </span>
                          )}
                        </div>
                      )}

                      {/* User info */}
                      <div className="flex items-center gap-2 mt-2">
                        <div className="w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center text-white text-xs font-medium">
                          {question.user?.username?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <span className="text-sm text-gray-600">
                          by {question.user?.username || 'Unknown'}
                        </span>
                        {question.category && (
                          <>
                            <span className="text-gray-300">•</span>
                            <span className="text-sm text-gray-600">
                              in {question.category.name}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Status indicator */}
                    {question.isResolved && (
                      <div className="flex-shrink-0">
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                          Resolved
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-gray-200 text-center">
              <Link
                to="/questions"
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                View all questions →
              </Link>
            </div>
          </div>

          {/* Popular Tags */}
          <div className="card mt-6">
            <div className="card-header">
              <h2 className="card-title flex items-center gap-2">
                <Tag className="w-5 h-5" />
                Popular Tags
              </h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {data.popularTags.map((tag) => (
                <Link
                  key={tag}
                  to={`/questions?tags=${tag}`}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800 hover:bg-primary-200 transition-colors"
                >
                  {tag}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;