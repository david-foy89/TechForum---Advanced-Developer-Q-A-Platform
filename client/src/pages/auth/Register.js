import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAuth } from '../../contexts/AuthContext';
import { MessageSquare, Eye, EyeOff, Check, X } from 'lucide-react';

const schema = yup.object({
  username: yup
    .string()
    .required('Username is required')
    .min(3, 'Username must be at least 3 characters')
    .max(50, 'Username must be less than 50 characters')
    .matches(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  email: yup
    .string()
    .required('Email is required')
    .email('Please enter a valid email address'),
  password: yup
    .string()
    .required('Password is required')
    .min(6, 'Password must be at least 6 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  confirmPassword: yup
    .string()
    .required('Please confirm your password')
    .oneOf([yup.ref('password')], 'Passwords must match'),
  terms: yup
    .boolean()
    .oneOf([true], 'You must accept the terms and conditions')
});

const Register = () => {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
    setError
  } = useForm({
    resolver: yupResolver(schema)
  });

  const watchPassword = watch('password', '');

  const getPasswordStrength = (password) => {
    if (!password) return { score: 0, text: '', color: 'gray' };
    
    let score = 0;
    if (password.length >= 6) score++;
    if (password.length >= 10) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;

    if (score <= 2) return { score, text: 'Weak', color: 'red' };
    if (score <= 4) return { score, text: 'Fair', color: 'yellow' };
    return { score, text: 'Strong', color: 'green' };
  };

  const passwordStrength = getPasswordStrength(watchPassword);

  const onSubmit = async (data) => {
    const { confirmPassword, terms, ...userData } = data;
    const result = await registerUser(userData);
    
    if (result.success) {
      navigate('/dashboard');
    } else {
      // Handle specific validation errors
      if (result.error.includes('username')) {
        setError('username', { 
          type: 'manual', 
          message: result.error 
        });
      } else if (result.error.includes('email')) {
        setError('email', { 
          type: 'manual', 
          message: result.error 
        });
      } else {
        setError('username', { 
          type: 'manual', 
          message: result.error 
        });
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-6 px-4 sm:py-12 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center items-center gap-2 mb-4">
            <MessageSquare className="w-10 h-10 sm:w-12 sm:h-12 text-primary-600" />
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">TechForum</h1>
          </div>
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-medium text-primary-600 hover:text-primary-500 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded"
            >
              Sign in here
            </Link>
          </p>
        </div>

        {/* Registration Form */}
        <form className="registration-form mt-6 sm:mt-8 space-y-4 sm:space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            {/* Username Field */}
            <div className="relative">
              <label htmlFor="username" className="form-label">
                Username *
              </label>
              <div className="flex gap-2">
                <div className="flex-1">
                  <input
                    id="username"
                    type="text"
                    autoComplete="username"
                    className={`form-input w-full ${errors.username ? 'border-red-300 focus:border-red-500' : ''}`}
                    placeholder="Choose a unique username"
                    {...register('username')}
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    3-50 characters, letters, numbers and underscores only
                  </p>
                </div>
                {errors.username && (
                  <div className="flex-shrink-0 w-48">
                    <p className="form-error-box">
                      {errors.username.message}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Email Field */}
            <div className="relative">
              <label htmlFor="email" className="form-label">
                Email Address *
              </label>
              <div className="flex gap-2">
                <div className="flex-1">
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    className={`form-input w-full ${errors.email ? 'border-red-300 focus:border-red-500' : ''}`}
                    placeholder="Enter your email address"
                    {...register('email')}
                  />
                </div>
                {errors.email && (
                  <div className="flex-shrink-0 w-48">
                    <p className="form-error-box">
                      {errors.email.message}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Password Field */}
            <div className="relative">
              <label htmlFor="password" className="form-label">
                Password *
              </label>
              <div className="flex gap-2">
                <div className="flex-1">
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      className={`form-input pr-10 w-full ${errors.password ? 'border-red-300 focus:border-red-500' : ''}`}
                      placeholder="Create a strong password"
                      {...register('password')}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>
                {errors.password && (
                  <div className="flex-shrink-0 w-48">
                    <p className="form-error-box">
                      {errors.password.message}
                    </p>
                  </div>
                )}
              </div>
              
              <div className="flex-1">
                {/* Password Strength Indicator */}
                {watchPassword && (
                  <div className="mt-2">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${
                            passwordStrength.color === 'red' ? 'bg-red-500' :
                            passwordStrength.color === 'yellow' ? 'bg-yellow-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${(passwordStrength.score / 6) * 100}%` }}
                        />
                      </div>
                      <span className={`text-xs font-medium ${
                        passwordStrength.color === 'red' ? 'text-red-600' :
                        passwordStrength.color === 'yellow' ? 'text-yellow-600' : 'text-green-600'
                      }`}>
                        {passwordStrength.text}
                      </span>
                    </div>
                  </div>
                )}
                
                {/* Password Requirements */}
                <div className="mt-2 space-y-1">
                  <p className="text-xs text-gray-600">Password must contain:</p>
                  <div className="space-y-1">
                    {[
                      { test: watchPassword.length >= 6, text: 'At least 6 characters' },
                      { test: /[a-z]/.test(watchPassword), text: 'One lowercase letter' },
                      { test: /[A-Z]/.test(watchPassword), text: 'One uppercase letter' },
                      { test: /\d/.test(watchPassword), text: 'One number' }
                    ].map((requirement, index) => (
                      <div key={index} className="flex items-center gap-1">
                        {requirement.test ? (
                          <Check className="w-3 h-3 text-green-500" />
                        ) : (
                          <X className="w-3 h-3 text-gray-400" />
                        )}
                        <span className={`text-xs ${requirement.test ? 'text-green-600' : 'text-gray-500'}`}>
                          {requirement.text}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Confirm Password Field */}
            <div className="relative">
              <label htmlFor="confirmPassword" className="form-label">
                Confirm Password *
              </label>
              <div className="flex gap-2">
                <div className="flex-1">
                  <div className="relative">
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      className={`form-input pr-10 w-full ${errors.confirmPassword ? 'border-red-300 focus:border-red-500' : ''}`}
                      placeholder="Confirm your password"
                      {...register('confirmPassword')}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>
                {errors.confirmPassword && (
                  <div className="flex-shrink-0 w-48">
                    <p className="form-error-box">
                      {errors.confirmPassword.message}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Terms and Conditions */}
            <div className="relative">
              <div className="flex gap-2">
                <div className="flex-1">
                  <div className="flex items-start gap-2">
                    <input
                      id="terms"
                      type="checkbox"
                      className={`mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500 rounded transition-colors ${
                        errors.terms ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'
                      }`}
                      {...register('terms')}
                    />
                    <label htmlFor="terms" className={`text-sm transition-colors ${
                      errors.terms ? 'text-red-700' : 'text-gray-700'
                    }`}>
                      I accept the{' '}
                      <button
                        type="button"
                        className={`font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 rounded transition-colors ${
                          errors.terms 
                            ? 'text-red-600 hover:text-red-500 focus:ring-red-500' 
                            : 'text-primary-600 hover:text-primary-500 focus:ring-primary-500'
                        }`}
                        onClick={() => alert('Terms of Service would be displayed here')}
                      >
                        Terms of Service
                      </button>{' '}
                      and{' '}
                      <button
                        type="button"
                        className={`font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 rounded transition-colors ${
                          errors.terms 
                            ? 'text-red-600 hover:text-red-500 focus:ring-red-500' 
                            : 'text-primary-600 hover:text-primary-500 focus:ring-primary-500'
                        }`}
                        onClick={() => alert('Privacy Policy would be displayed here')}
                      >
                        Privacy Policy
                      </button>
                    </label>
                  </div>
                </div>
                {errors.terms && (
                  <div className="flex-shrink-0 w-48">
                    <p className="form-error-box">
                      {errors.terms.message}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full btn btn-primary ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="loading-spinner w-4 h-4"></div>
                  Creating account...
                </div>
              ) : (
                'Create account'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;