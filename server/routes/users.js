const express = require('express');
const { getDB } = require('../config/database');
const { auth, optionalAuth } = require('../middleware/auth');
const { validateUserUpdate } = require('../middleware/validation');

const router = express.Router();

// @route   GET /api/users
// @desc    Get all users (paginated)
// @access  Public
router.get('/', optionalAuth, async (req, res) => {
  try {
    const db = getDB();
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 10, 50);
    const skip = (page - 1) * limit;
    const search = req.query.search || '';
    
    // Build search filter
    const filter = search ? {
      $or: [
        { username: { $regex: search, $options: 'i' } },
        { 'profile.firstName': { $regex: search, $options: 'i' } },
        { 'profile.lastName': { $regex: search, $options: 'i' } }
      ]
    } : {};
    
    // Add active filter
    filter.isActive = true;
    
    const users = await db.collection('users')
      .find(filter, { 
        projection: { 
          password: 0,
          email: req.user?.role === 'admin' ? 1 : 0 // Only admin can see emails
        } 
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();
    
    const total = await db.collection('users').countDocuments(filter);
    
    res.json({
      success: true,
      data: users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching users'
    });
  }
});

// @route   GET /api/users/:userId
// @desc    Get user by ID
// @access  Public
router.get('/:userId', optionalAuth, async (req, res) => {
  try {
    const { userId } = req.params;
    const db = getDB();
    
    const user = await db.collection('users').findOne(
      { _id: userId, isActive: true },
      { 
        projection: { 
          password: 0,
          email: req.user?.role === 'admin' || req.user?._id === userId ? 1 : 0
        }
      }
    );
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Get user statistics
    const [questionsCount, answersCount] = await Promise.all([
      db.collection('questions').countDocuments({ userId }),
      db.collection('answers').countDocuments({ userId })
    ]);
    
    // Get recent questions and answers
    const [recentQuestions, recentAnswers] = await Promise.all([
      db.collection('questions')
        .find({ userId })
        .sort({ createdAt: -1 })
        .limit(5)
        .project({ title: 1, createdAt: 1, votes: 1, categoryId: 1 })
        .toArray(),
      db.collection('answers')
        .find({ userId })
        .sort({ createdAt: -1 })
        .limit(5)
        .project({ content: 1, createdAt: 1, votes: 1, isAccepted: 1, questionId: 1 })
        .toArray()
    ];
    
    res.json({
      success: true,
      data: {
        ...user,
        stats: {
          ...user.stats,
          questionsAsked: questionsCount,
          answersGiven: answersCount
        },
        recentActivity: {
          questions: recentQuestions,
          answers: recentAnswers
        }
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching user'
    });
  }
});

// @route   PUT /api/users/:userId
// @desc    Update user profile
// @access  Private (own profile or admin)
router.put('/:userId', auth, validateUserUpdate, async (req, res) => {
  try {
    const { userId } = req.params;
    const db = getDB();
    
    // Check if user can update this profile
    if (req.user._id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this profile'
      });
    }
    
    const { email, profile } = req.body;
    
    // Check if email is already taken
    if (email) {
      const existingUser = await db.collection('users').findOne({
        email,
        _id: { $ne: userId }
      });
      
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email already exists'
        });
      }
    }
    
    // Build update object
    const updateData = {
      updatedAt: new Date()
    };
    
    if (email) updateData.email = email;
    if (profile) {
      Object.keys(profile).forEach(key => {
        if (profile[key] !== undefined) {
          updateData[`profile.${key}`] = profile[key];
        }
      });
    }
    
    const result = await db.collection('users').updateOne(
      { _id: userId },
      { $set: updateData }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Get updated user
    const updatedUser = await db.collection('users').findOne(
      { _id: userId },
      { projection: { password: 0 } }
    );
    
    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedUser
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating user'
    });
  }
});

// @route   DELETE /api/users/:userId
// @desc    Delete/Deactivate user
// @access  Private (admin or own account)
router.delete('/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    const db = getDB();
    
    // Check if user can delete this account
    if (req.user._id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this account'
      });
    }
    
    // Soft delete - just deactivate the user
    const result = await db.collection('users').updateOne(
      { _id: userId },
      { 
        $set: { 
          isActive: false,
          deactivatedAt: new Date(),
          updatedAt: new Date()
        }
      }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Account deactivated successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting user'
    });
  }
});

// @route   GET /api/users/:userId/questions
// @desc    Get user's questions
// @access  Public
router.get('/:userId/questions', async (req, res) => {
  try {
    const { userId } = req.params;
    const db = getDB();
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 10, 50);
    const skip = (page - 1) * limit;
    
    const questions = await db.collection('questions')
      .find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();
    
    const total = await db.collection('questions').countDocuments({ userId });
    
    res.json({
      success: true,
      data: questions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get user questions error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching user questions'
    });
  }
});

// @route   GET /api/users/:userId/answers
// @desc    Get user's answers
// @access  Public
router.get('/:userId/answers', async (req, res) => {
  try {
    const { userId } = req.params;
    const db = getDB();
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 10, 50);
    const skip = (page - 1) * limit;
    
    const answers = await db.collection('answers')
      .find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();
    
    const total = await db.collection('answers').countDocuments({ userId });
    
    res.json({
      success: true,
      data: answers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get user answers error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching user answers'
    });
  }
});

module.exports = router;