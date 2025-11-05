const express = require('express');
const { getDB } = require('../config/database');
const { auth, optionalAuth } = require('../middleware/auth');
const { validateQuestion } = require('../middleware/validation');

const router = express.Router();

// @route   GET /api/questions
// @desc    Get all questions (paginated)
// @access  Public
router.get('/', optionalAuth, async (req, res) => {
  try {
    const db = getDB();
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 10, 50);
    const skip = (page - 1) * limit;
    const search = req.query.search || '';
    const categoryId = req.query.categoryId;
    const sortBy = req.query.sortBy || 'newest';
    const tags = req.query.tags ? req.query.tags.split(',') : [];
    
    // Build filter
    const filter = {};
    
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }
    
    if (categoryId) {
      filter.categoryId = categoryId;
    }
    
    if (tags.length > 0) {
      filter.tags = { $in: tags };
    }
    
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
      case 'views':
        sort = { views: -1, createdAt: -1 };
        break;
    }
    
    const questions = await db.collection('questions')
      .find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .toArray();
    
    // Get additional data for each question
    const userIds = [...new Set(questions.map(q => q.userId))];
    const categoryIds = [...new Set(questions.map(q => q.categoryId))];
    
    const [users, categories] = await Promise.all([
      db.collection('users')
        .find({ _id: { $in: userIds } })
        .project({ _id: 1, username: 1, 'profile.avatar': 1 })
        .toArray(),
      db.collection('categories')
        .find({ _id: { $in: categoryIds } })
        .project({ _id: 1, name: 1, color: 1 })
        .toArray()
    ]);
    
    const userMap = users.reduce((map, user) => {
      map[user._id] = user;
      return map;
    }, {});
    
    const categoryMap = categories.reduce((map, cat) => {
      map[cat._id] = cat;
      return map;
    }, {});
    
    // Enrich questions with user and category info
    const enrichedQuestions = questions.map(question => ({
      ...question,
      user: userMap[question.userId] || null,
      category: categoryMap[question.categoryId] || null,
      answerCount: question.answers ? question.answers.length : 0
    }));
    
    const total = await db.collection('questions').countDocuments(filter);
    
    res.json({
      success: true,
      data: enrichedQuestions,
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
    console.error('Get questions error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching questions'
    });
  }
});

// @route   GET /api/questions/:questionId
// @desc    Get question by ID
// @access  Public
router.get('/:questionId', optionalAuth, async (req, res) => {
  try {
    const { questionId } = req.params;
    const db = getDB();
    
    const question = await db.collection('questions').findOne({ _id: questionId });
    
    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }
    
    // Increment view count (but not for the question owner)
    if (!req.user || req.user._id !== question.userId) {
      await db.collection('questions').updateOne(
        { _id: questionId },
        { $inc: { views: 1 } }
      );
      question.views += 1;
    }
    
    // Get user, category, and answers info
    const [user, category, answers] = await Promise.all([
      db.collection('users').findOne(
        { _id: question.userId },
        { projection: { _id: 1, username: 1, 'profile.avatar': 1, role: 1 } }
      ),
      db.collection('categories').findOne(
        { _id: question.categoryId },
        { projection: { _id: 1, name: 1, color: 1 } }
      ),
      db.collection('answers')
        .find({ questionId })
        .sort({ isAccepted: -1, votes: -1, createdAt: -1 })
        .toArray()
    ]);
    
    // Get users for answers
    const answerUserIds = [...new Set(answers.map(a => a.userId))];
    const answerUsers = await db.collection('users')
      .find({ _id: { $in: answerUserIds } })
      .project({ _id: 1, username: 1, 'profile.avatar': 1, role: 1 })
      .toArray();
    
    const answerUserMap = answerUsers.reduce((map, user) => {
      map[user._id] = user;
      return map;
    }, {});
    
    // Add user info to answers
    const enrichedAnswers = answers.map(answer => ({
      ...answer,
      user: answerUserMap[answer.userId] || null
    }));
    
    res.json({
      success: true,
      data: {
        ...question,
        user,
        category,
        answers: enrichedAnswers,
        answerCount: enrichedAnswers.length
      }
    });
  } catch (error) {
    console.error('Get question error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching question'
    });
  }
});

// @route   POST /api/questions
// @desc    Create new question
// @access  Private
router.post('/', auth, validateQuestion, async (req, res) => {
  try {
    const { title, content, categoryId, tags } = req.body;
    const db = getDB();
    
    // Verify category exists
    const category = await db.collection('categories').findOne({ _id: categoryId });
    if (!category) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category'
      });
    }
    
    // Generate question ID
    const questionId = `q_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const newQuestion = {
      _id: questionId,
      title,
      content,
      userId: req.user._id,
      categoryId,
      tags: tags.map(tag => tag.toLowerCase()),
      views: 0,
      votes: 0,
      answers: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      isResolved: false,
      isPinned: false,
      isLocked: false,
      votes_detail: {
        upvotes: [],
        downvotes: []
      }
    };
    
    await db.collection('questions').insertOne(newQuestion);
    
    // Update user stats
    await db.collection('users').updateOne(
      { _id: req.user._id },
      { $inc: { 'stats.questionsAsked': 1 } }
    );
    
    // Update category question count
    await db.collection('categories').updateOne(
      { _id: categoryId },
      { $inc: { questionCount: 1 } }
    );
    
    // Get the complete question with user and category info
    const [user, categoryInfo] = await Promise.all([
      db.collection('users').findOne(
        { _id: req.user._id },
        { projection: { _id: 1, username: 1, 'profile.avatar': 1 } }
      ),
      db.collection('categories').findOne(
        { _id: categoryId },
        { projection: { _id: 1, name: 1, color: 1 } }
      )
    ]);
    
    res.status(201).json({
      success: true,
      message: 'Question created successfully',
      data: {
        ...newQuestion,
        user,
        category: categoryInfo,
        answerCount: 0
      }
    });
  } catch (error) {
    console.error('Create question error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating question'
    });
  }
});

// @route   PUT /api/questions/:questionId
// @desc    Update question
// @access  Private (owner or admin)
router.put('/:questionId', auth, validateQuestion, async (req, res) => {
  try {
    const { questionId } = req.params;
    const { title, content, categoryId, tags } = req.body;
    const db = getDB();
    
    const question = await db.collection('questions').findOne({ _id: questionId });
    
    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }
    
    // Check if user can update this question
    if (question.userId !== req.user._id && req.user.role !== 'admin' && req.user.role !== 'moderator') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this question'
      });
    }
    
    // Verify category exists
    if (categoryId && categoryId !== question.categoryId) {
      const category = await db.collection('categories').findOne({ _id: categoryId });
      if (!category) {
        return res.status(400).json({
          success: false,
          message: 'Invalid category'
        });
      }
    }
    
    // Build update object
    const updateData = {
      updatedAt: new Date()
    };
    
    if (title) updateData.title = title;
    if (content) updateData.content = content;
    if (categoryId && categoryId !== question.categoryId) {
      updateData.categoryId = categoryId;
      
      // Update category counts
      await Promise.all([
        db.collection('categories').updateOne(
          { _id: question.categoryId },
          { $inc: { questionCount: -1 } }
        ),
        db.collection('categories').updateOne(
          { _id: categoryId },
          { $inc: { questionCount: 1 } }
        )
      ]);
    }
    if (tags) updateData.tags = tags.map(tag => tag.toLowerCase());
    
    await db.collection('questions').updateOne(
      { _id: questionId },
      { $set: updateData }
    );
    
    // Get updated question
    const updatedQuestion = await db.collection('questions').findOne({ _id: questionId });
    
    res.json({
      success: true,
      message: 'Question updated successfully',
      data: updatedQuestion
    });
  } catch (error) {
    console.error('Update question error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating question'
    });
  }
});

// @route   DELETE /api/questions/:questionId
// @desc    Delete question
// @access  Private (owner or admin)
router.delete('/:questionId', auth, async (req, res) => {
  try {
    const { questionId } = req.params;
    const db = getDB();
    
    const question = await db.collection('questions').findOne({ _id: questionId });
    
    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }
    
    // Check if user can delete this question
    if (question.userId !== req.user._id && req.user.role !== 'admin' && req.user.role !== 'moderator') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this question'
      });
    }
    
    // Delete all answers for this question
    await db.collection('answers').deleteMany({ questionId });
    
    // Delete the question
    await db.collection('questions').deleteOne({ _id: questionId });
    
    // Update user stats
    await db.collection('users').updateOne(
      { _id: question.userId },
      { $inc: { 'stats.questionsAsked': -1 } }
    );
    
    // Update category question count
    await db.collection('categories').updateOne(
      { _id: question.categoryId },
      { $inc: { questionCount: -1 } }
    );
    
    res.json({
      success: true,
      message: 'Question deleted successfully'
    });
  } catch (error) {
    console.error('Delete question error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting question'
    });
  }
});

// @route   POST /api/questions/:questionId/vote
// @desc    Vote on question (upvote/downvote)
// @access  Private
router.post('/:questionId/vote', auth, async (req, res) => {
  try {
    const { questionId } = req.params;
    const { voteType } = req.body; // 'upvote' or 'downvote'
    const db = getDB();
    
    if (!['upvote', 'downvote'].includes(voteType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid vote type'
      });
    }
    
    const question = await db.collection('questions').findOne({ _id: questionId });
    
    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }
    
    // Can't vote on own question
    if (question.userId === req.user._id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot vote on your own question'
      });
    }
    
    const userId = req.user._id;
    const upvotes = question.votes_detail?.upvotes || [];
    const downvotes = question.votes_detail?.downvotes || [];
    
    const hasUpvoted = upvotes.includes(userId);
    const hasDownvoted = downvotes.includes(userId);
    
    let voteChange = 0;
    const updateQuery = {};
    
    if (voteType === 'upvote') {
      if (hasUpvoted) {
        // Remove upvote
        updateQuery.$pull = { 'votes_detail.upvotes': userId };
        voteChange = -1;
      } else {
        // Add upvote, remove downvote if exists
        updateQuery.$addToSet = { 'votes_detail.upvotes': userId };
        if (hasDownvoted) {
          updateQuery.$pull = { 'votes_detail.downvotes': userId };
          voteChange = 2;
        } else {
          voteChange = 1;
        }
      }
    } else { // downvote
      if (hasDownvoted) {
        // Remove downvote
        updateQuery.$pull = { 'votes_detail.downvotes': userId };
        voteChange = 1;
      } else {
        // Add downvote, remove upvote if exists
        updateQuery.$addToSet = { 'votes_detail.downvotes': userId };
        if (hasUpvoted) {
          updateQuery.$pull = { 'votes_detail.upvotes': userId };
          voteChange = -2;
        } else {
          voteChange = -1;
        }
      }
    }
    
    updateQuery.$inc = { votes: voteChange };
    
    await db.collection('questions').updateOne({ _id: questionId }, updateQuery);
    
    const updatedQuestion = await db.collection('questions').findOne({ _id: questionId });
    
    res.json({
      success: true,
      message: 'Vote recorded successfully',
      data: {
        votes: updatedQuestion.votes,
        userVote: hasUpvoted && voteType !== 'upvote' ? null : 
                 hasDownvoted && voteType !== 'downvote' ? null : voteType
      }
    });
  } catch (error) {
    console.error('Vote question error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error recording vote'
    });
  }
});

module.exports = router;