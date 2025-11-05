import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Plus, X, HelpCircle } from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const schema = yup.object({
  title: yup
    .string()
    .required('Title is required')
    .min(10, 'Title must be at least 10 characters')
    .max(200, 'Title must be less than 200 characters'),
  content: yup
    .string()
    .required('Question content is required')
    .min(20, 'Content must be at least 20 characters'),
  categoryId: yup
    .string()
    .required('Please select a category'),
  tags: yup
    .array()
    .min(1, 'Please add at least one tag')
    .max(5, 'Maximum 5 tags allowed')
});

const AskQuestion = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState([]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      tags: []
    }
  });

  const watchContent = watch('content', '');

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    setValue('tags', tags);
  }, [tags, setValue]);

  const fetchCategories = async () => {
    try {
      const response = await axios.get('/categories');
      setCategories(response.data.data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to load categories');
    } finally {
      setLoadingCategories(false);
    }
  };

  const addTag = (e) => {
    if (e.key === 'Enter' && tagInput.trim() && tags.length < 5) {
      e.preventDefault();
      const newTag = tagInput.trim().toLowerCase();
      if (!tags.includes(newTag)) {
        setTags([...tags, newTag]);
        setTagInput('');
      }
    }
  };

  const removeTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const onSubmit = async (data) => {
    try {
      const response = await axios.post('/questions', {
        ...data,
        tags: tags
      });

      toast.success('Question posted successfully!');
      navigate(`/questions/${response.data.data._id}`);
    } catch (error) {
      console.error('Error posting question:', error);
      toast.error(error.response?.data?.message || 'Failed to post question');
    }
  };

  if (loadingCategories) {
    return <LoadingSpinner text="Loading categories..." />;
  }

  return (
    <div className="container py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Ask a Question</h1>
          <p className="text-gray-600">
            Get help from the community by asking a well-structured question
          </p>
        </div>

        {/* Guidelines */}
        <div className="card bg-blue-50 border-blue-200 mb-8">
          <div className="flex items-start gap-3">
            <HelpCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-blue-900 mb-2">Writing a good question</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Be specific and clear in your title</li>
                <li>• Provide context and explain what you've tried</li>
                <li>• Include relevant code, error messages, or examples</li>
                <li>• Choose appropriate tags to help others find your question</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Question Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Question Details</h2>
            </div>

            <div className="space-y-6">
              {/* Title */}
              <div className="form-group">
                <label htmlFor="title" className="form-label">
                  Question Title *
                </label>
                <input
                  id="title"
                  type="text"
                  className={`form-input ${errors.title ? 'border-red-300' : ''}`}
                  placeholder="e.g., How to handle async/await in JavaScript?"
                  {...register('title')}
                />
                {errors.title && (
                  <p className="form-error">{errors.title.message}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Be specific and clear. This is what others will see first.
                </p>
              </div>

              {/* Category */}
              <div className="form-group">
                <label htmlFor="categoryId" className="form-label">
                  Category *
                </label>
                <select
                  id="categoryId"
                  className={`form-select ${errors.categoryId ? 'border-red-300' : ''}`}
                  {...register('categoryId')}
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.name} - {category.description}
                    </option>
                  ))}
                </select>
                {errors.categoryId && (
                  <p className="form-error">{errors.categoryId.message}</p>
                )}
              </div>

              {/* Content */}
              <div className="form-group">
                <label htmlFor="content" className="form-label">
                  Question Content *
                </label>
                <textarea
                  id="content"
                  rows={10}
                  className={`form-textarea ${errors.content ? 'border-red-300' : ''}`}
                  placeholder="Describe your question in detail. Include what you've tried, any error messages, and relevant code..."
                  {...register('content')}
                />
                {errors.content && (
                  <p className="form-error">{errors.content.message}</p>
                )}
                <div className="flex justify-between items-center mt-1">
                  <p className="text-xs text-gray-500">
                    Provide as much detail as possible to get better answers.
                  </p>
                  <span className="text-xs text-gray-400">
                    {watchContent.length} characters
                  </span>
                </div>
              </div>

              {/* Tags */}
              <div className="form-group">
                <label className="form-label">
                  Tags * ({tags.length}/5)
                </label>
                
                {/* Tag input */}
                <input
                  type="text"
                  className="form-input"
                  placeholder="Add a tag and press Enter"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={addTag}
                  disabled={tags.length >= 5}
                />
                
                {/* Current tags */}
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-primary-100 text-primary-800 rounded text-sm"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="text-primary-600 hover:text-primary-800"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                
                {errors.tags && (
                  <p className="form-error">{errors.tags.message}</p>
                )}
                
                <p className="text-xs text-gray-500 mt-1">
                  Add up to 5 relevant tags to help others find your question (e.g., javascript, react, nodejs)
                </p>
              </div>
            </div>
          </div>

          {/* Submit Actions */}
          <div className="flex items-center justify-end gap-4">
            <button
              type="button"
              onClick={() => navigate('/questions')}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="loading-spinner w-4 h-4"></div>
                  Posting...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Post Question
                </div>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AskQuestion;