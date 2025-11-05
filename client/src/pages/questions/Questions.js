import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Search, 
  Filter, 
  Plus, 
  Eye, 
  ThumbsUp, 
  MessageCircle, 
  Clock,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const Questions = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [filters, setFilters] = useState({
    search: '',
    categoryId: '',
    sortBy: 'newest',
    tags: ''
  });

  useEffect(() => {
    // Parse URL parameters
    const params = new URLSearchParams(location.search);
    setFilters({
      search: params.get('search') || '',
      categoryId: params.get('categoryId') || '',
      sortBy: params.get('sortBy') || 'newest',
      tags: params.get('tags') || ''
    });
  }, [location.search]);

  useEffect(() => {
    fetchQuestions();
    fetchCategories();
  }, [filters]);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (filters.search) params.append('search', filters.search);
      if (filters.categoryId) params.append('categoryId', filters.categoryId);
      if (filters.sortBy) params.append('sortBy', filters.sortBy);
      if (filters.tags) params.append('tags', filters.tags);
      
      const response = await axios.get(`/questions?${params.toString()}`);
      setQuestions(response.data.data || []);
      setPagination(response.data.pagination || {});
    } catch (error) {
      console.error('Error fetching questions:', error);
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get('/categories');
      setCategories(response.data.data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const updateFilters = (newFilters) => {
    const params = new URLSearchParams();
    Object.entries({ ...filters, ...newFilters }).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });
    navigate(`/questions?${params.toString()}`);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const searchValue = e.target.search.value.trim();
    updateFilters({ search: searchValue });
  };

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Questions</h1>
          <p className="text-gray-600">
            {pagination.total ? `${pagination.total} questions` : 'Browse all questions'} 
            {filters.categoryId && categories.find(c => c._id === filters.categoryId) && 
              ` in ${categories.find(c => c._id === filters.categoryId).name}`}
          </p>
        </div>
        <Link to="/ask" className="btn btn-primary">
          <Plus className="w-4 h-4" />
          Ask Question
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="card mb-8">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                name="search"
                type="text"
                placeholder="Search questions..."
                className="form-input pl-10 pr-4"
                defaultValue={filters.search}
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 btn btn-primary btn-sm"
              >
                Search
              </button>
            </div>
          </form>

          {/* Category Filter */}
          <div className="flex gap-4">
            <select
              value={filters.categoryId}
              onChange={(e) => updateFilters({ categoryId: e.target.value })}
              className="form-select min-w-48"
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category._id} value={category._id}>
                  {category.name} ({category.questionCount})
                </option>
              ))}
            </select>

            {/* Sort Filter */}
            <select
              value={filters.sortBy}
              onChange={(e) => updateFilters({ sortBy: e.target.value })}
              className="form-select min-w-32"
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="votes">Most Votes</option>
              <option value="answers">Most Answers</option>
              <option value="views">Most Views</option>
              <option value="updated">Recently Updated</option>
            </select>
          </div>
        </div>

        {/* Active Filters */}
        {(filters.search || filters.categoryId || filters.tags) && (
          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-200">
            <span className="text-sm text-gray-600">Active filters:</span>
            {filters.search && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary-100 text-primary-800 rounded text-sm">
                Search: "{filters.search}"
                <button 
                  onClick={() => updateFilters({ search: '' })}
                  className="ml-1 text-primary-600 hover:text-primary-800"
                >
                  ×
                </button>
              </span>
            )}
            {filters.categoryId && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary-100 text-primary-800 rounded text-sm">
                Category: {categories.find(c => c._id === filters.categoryId)?.name}
                <button 
                  onClick={() => updateFilters({ categoryId: '' })}
                  className="ml-1 text-primary-600 hover:text-primary-800"
                >
                  ×
                </button>
              </span>
            )}
            <button
              onClick={() => updateFilters({ search: '', categoryId: '', tags: '' })}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Questions List */}
      {loading ? (
        <LoadingSpinner text="Loading questions..." />
      ) : questions.length === 0 ? (
        <div className="text-center py-12">
          <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No questions found</h3>
          <p className="text-gray-600 mb-4">
            {filters.search || filters.categoryId 
              ? 'Try adjusting your search or filters' 
              : 'Be the first to ask a question!'}
          </p>
          <Link to="/ask" className="btn btn-primary">
            <Plus className="w-4 h-4" />
            Ask a Question
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {questions.map((question) => (
            <div key={question._id} className="card hover:shadow-md transition-shadow">
              <div className="flex gap-6">
                {/* Stats */}
                <div className="flex flex-col items-center gap-2 text-sm text-gray-600 min-w-20">
                  <div className="text-center">
                    <div className="font-medium text-gray-900">{question.votes}</div>
                    <div>votes</div>
                  </div>
                  <div className="text-center">
                    <div className={`font-medium ${question.isResolved ? 'text-green-600' : 'text-gray-900'}`}>
                      {question.answerCount}
                    </div>
                    <div>answers</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium text-gray-900">{question.views}</div>
                    <div>views</div>
                  </div>
                </div>

                {/* Question Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <Link
                      to={`/questions/${question._id}`}
                      className="block group flex-1"
                    >
                      <h3 className="text-lg font-medium text-gray-900 group-hover:text-primary-600 line-clamp-2">
                        {question.title}
                      </h3>
                    </Link>
                    {question.isResolved && (
                      <span className="flex-shrink-0 inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                        Resolved
                      </span>
                    )}
                  </div>

                  {/* Content preview */}
                  <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                    {question.content.substring(0, 150)}
                    {question.content.length > 150 && '...'}
                  </p>

                  {/* Tags */}
                  {question.tags && question.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {question.tags.map((tag) => (
                        <Link
                          key={tag}
                          to={`/questions?tags=${tag}`}
                          className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700 hover:bg-gray-200"
                        >
                          {tag}
                        </Link>
                      ))}
                    </div>
                  )}

                  {/* Meta info */}
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center gap-4">
                      {question.category && (
                        <Link
                          to={`/questions?categoryId=${question.category._id}`}
                          className="flex items-center gap-1 hover:text-primary-600"
                        >
                          <div
                            className="w-3 h-3 rounded"
                            style={{ backgroundColor: question.category.color }}
                          />
                          {question.category.name}
                        </Link>
                      )}
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {new Date(question.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center text-white text-xs font-medium">
                        {question.user?.username?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <Link
                        to={`/profile/${question.user?._id}`}
                        className="hover:text-primary-600"
                      >
                        {question.user?.username || 'Unknown'}
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between mt-8">
          <div className="text-sm text-gray-600">
            Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} questions
          </div>
          <div className="flex gap-2">
            {pagination.hasPrev && (
              <button
                onClick={() => updateFilters({ page: pagination.page - 1 })}
                className="btn btn-outline btn-sm"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>
            )}
            {pagination.hasNext && (
              <button
                onClick={() => updateFilters({ page: pagination.page + 1 })}
                className="btn btn-outline btn-sm"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Questions;