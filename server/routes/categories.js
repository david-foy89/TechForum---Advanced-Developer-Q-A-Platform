const express = require('express');
const { getDB } = require('../config/database');
const { auth, authorize } = require('../middleware/auth');
const { validateCategory } = require('../middleware/validation');

const router = express.Router();

// @route   GET /api/categories
// @desc    Get all categories
// @access  Public
router.get('/', async (req, res) => {
  try {
    const db = getDB();
    const includeInactive = req.query.includeInactive === 'true';
    
    const filter = includeInactive ? {} : { isActive: { $ne: false } };
    
    const categories = await db.collection('categories')
      .find(filter)
      .sort({ order: 1, name: 1 })
      .toArray();
    
    // Update question counts
    for (const category of categories) {
      const questionCount = await db.collection('questions').countDocuments({
        categoryId: category._id
      });
      
      if (questionCount !== category.questionCount) {
        await db.collection('categories').updateOne(
          { _id: category._id },
          { $set: { questionCount } }
        );
        category.questionCount = questionCount;
      }
    }
    
    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching categories'
    });
  }
});

// @route   GET /api/categories/:categoryId
// @desc    Get category by ID
// @access  Public
router.get('/:categoryId', async (req, res) => {
  try {
    const { categoryId } = req.params;
    const db = getDB();
    
    const category = await db.collection('categories').findOne({ _id: categoryId });
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }
    
    // Get category statistics
    const [questionCount, recentQuestions] = await Promise.all([
      db.collection('questions').countDocuments({ categoryId }),
      db.collection('questions')
        .find({ categoryId })
        .sort({ createdAt: -1 })
        .limit(5)
        .project({ title: 1, createdAt: 1, userId: 1, votes: 1 })
        .toArray()
    ]);
    
    res.json({
      success: true,
      data: {
        ...category,
        questionCount,
        recentQuestions
      }
    });
  } catch (error) {
    console.error('Get category error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching category'
    });
  }
});

// @route   POST /api/categories
// @desc    Create new category
// @access  Private (admin only)
router.post('/', auth, authorize('admin'), validateCategory, async (req, res) => {
  try {
    const { name, description, color, icon } = req.body;
    const db = getDB();
    
    // Check if category name already exists
    const existingCategory = await db.collection('categories').findOne({ name });
    
    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: 'Category name already exists'
      });
    }
    
    // Generate category ID
    const categoryId = `cat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Get max order for positioning
    const lastCategory = await db.collection('categories')
      .findOne({}, { sort: { order: -1 } });
    
    const newCategory = {
      _id: categoryId,
      name,
      description,
      color,
      icon: icon || 'category',
      createdAt: new Date(),
      updatedAt: new Date(),
      questionCount: 0,
      isActive: true,
      order: (lastCategory?.order || 0) + 1
    };
    
    await db.collection('categories').insertOne(newCategory);
    
    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: newCategory
    });
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating category'
    });
  }
});

// @route   PUT /api/categories/:categoryId
// @desc    Update category
// @access  Private (admin only)
router.put('/:categoryId', auth, authorize('admin'), validateCategory, async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { name, description, color, icon, isActive, order } = req.body;
    const db = getDB();
    
    // Check if category name already exists (excluding current category)
    if (name) {
      const existingCategory = await db.collection('categories').findOne({
        name,
        _id: { $ne: categoryId }
      });
      
      if (existingCategory) {
        return res.status(400).json({
          success: false,
          message: 'Category name already exists'
        });
      }
    }
    
    // Build update object
    const updateData = {
      updatedAt: new Date()
    };
    
    if (name) updateData.name = name;
    if (description) updateData.description = description;
    if (color) updateData.color = color;
    if (icon) updateData.icon = icon;
    if (typeof isActive === 'boolean') updateData.isActive = isActive;
    if (typeof order === 'number') updateData.order = order;
    
    const result = await db.collection('categories').updateOne(
      { _id: categoryId },
      { $set: updateData }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }
    
    // Get updated category
    const updatedCategory = await db.collection('categories').findOne({ _id: categoryId });
    
    res.json({
      success: true,
      message: 'Category updated successfully',
      data: updatedCategory
    });
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating category'
    });
  }
});

// @route   DELETE /api/categories/:categoryId
// @desc    Delete category
// @access  Private (admin only)
router.delete('/:categoryId', auth, authorize('admin'), async (req, res) => {
  try {
    const { categoryId } = req.params;
    const db = getDB();
    
    // Check if category has questions
    const questionCount = await db.collection('questions').countDocuments({ categoryId });
    
    if (questionCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete category that contains questions'
      });
    }
    
    const result = await db.collection('categories').deleteOne({ _id: categoryId });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting category'
    });
  }
});

// @route   GET /api/categories/:categoryId/questions
// @desc    Get questions in a category
// @access  Public
router.get('/:categoryId/questions', async (req, res) => {
  try {
    const { categoryId } = req.params;
    const db = getDB();
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 10, 50);
    const skip = (page - 1) * limit;
    const sortBy = req.query.sortBy || 'newest'; // newest, oldest, votes, answers
    
    // Build sort object
    let sort = { createdAt: -1 }; // default: newest first
    
    switch (sortBy) {
      case 'oldest':
        sort = { createdAt: 1 };
        break;
      case 'votes':
        sort = { votes: -1, createdAt: -1 };
        break;
      case 'answers':
        sort = { 'answers.length': -1, createdAt: -1 };
        break;
      case 'updated':
        sort = { updatedAt: -1 };
        break;
    }
    
    const questions = await db.collection('questions')
      .find({ categoryId })
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .toArray();
    
    // Get user info for each question
    const userIds = [...new Set(questions.map(q => q.userId))];
    const users = await db.collection('users')
      .find({ _id: { $in: userIds } })
      .project({ _id: 1, username: 1, 'profile.avatar': 1 })
      .toArray();
    
    const userMap = users.reduce((map, user) => {
      map[user._id] = user;
      return map;
    }, {});
    
    // Add user info to questions
    const questionsWithUsers = questions.map(question => ({
      ...question,
      user: userMap[question.userId] || null
    }));
    
    const total = await db.collection('questions').countDocuments({ categoryId });
    
    res.json({
      success: true,
      data: questionsWithUsers,
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
    console.error('Get category questions error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching category questions'
    });
  }
});

module.exports = router;