const express = require('express');
const { getDB } = require('../config/database');
const { auth } = require('../middleware/auth');
const { validateAnswer } = require('../middleware/validation');

const router = express.Router();

// @route   GET /api/answers/:answerId
// @desc    Get answer by ID
// @access  Public
router.get('/:answerId', async (req, res) => {
  try {
    const { answerId } = req.params;
    const db = getDB();
    
    const answer = await db.collection('answers').findOne({ _id: answerId });
    
    if (!answer) {
      return res.status(404).json({
        success: false,
        message: 'Answer not found'
      });
    }
    
    // Get user info
    const user = await db.collection('users').findOne(
      { _id: answer.userId },
      { projection: { _id: 1, username: 1, 'profile.avatar': 1, role: 1 } }
    );
    
    res.json({
      success: true,
      data: {
        ...answer,
        user
      }
    });
  } catch (error) {
    console.error('Get answer error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching answer'
    });
  }
});

// @route   POST /api/answers
// @desc    Create new answer
// @access  Private
router.post('/', auth, validateAnswer, async (req, res) => {
  try {
    const { content, questionId } = req.body;
    const db = getDB();
    
    // Verify question exists and is not locked
    const question = await db.collection('questions').findOne({ _id: questionId });
    if (!question) {
      return res.status(400).json({
        success: false,
        message: 'Question not found'
      });
    }
    
    if (question.isLocked) {
      return res.status(400).json({
        success: false,
        message: 'Question is locked and cannot accept new answers'
      });
    }
    
    // Generate answer ID
    const answerId = `a_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const newAnswer = {
      _id: answerId,
      content,
      questionId,
      userId: req.user._id,
      votes: 0,
      isAccepted: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      votes_detail: {
        upvotes: [],
        downvotes: []
      }
    };
    
    await db.collection('answers').insertOne(newAnswer);
    
    // Update question with new answer
    await db.collection('questions').updateOne(
      { _id: questionId },
      { 
        $push: { answers: answerId },
        $set: { updatedAt: new Date() }
      }
    );
    
    // Update user stats
    await db.collection('users').updateOne(
      { _id: req.user._id },
      { $inc: { 'stats.answersGiven': 1 } }
    );
    
    // Get user info for response
    const user = await db.collection('users').findOne(
      { _id: req.user._id },
      { projection: { _id: 1, username: 1, 'profile.avatar': 1, role: 1 } }
    );
    
    res.status(201).json({
      success: true,
      message: 'Answer created successfully',
      data: {
        ...newAnswer,
        user
      }
    });
  } catch (error) {
    console.error('Create answer error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating answer'
    });
  }
});

// @route   PUT /api/answers/:answerId
// @desc    Update answer
// @access  Private (owner or admin)
router.put('/:answerId', auth, validateAnswer, async (req, res) => {
  try {
    const { answerId } = req.params;
    const { content } = req.body;
    const db = getDB();
    
    const answer = await db.collection('answers').findOne({ _id: answerId });
    
    if (!answer) {
      return res.status(404).json({
        success: false,
        message: 'Answer not found'
      });
    }
    
    // Check if user can update this answer
    if (answer.userId !== req.user._id && req.user.role !== 'admin' && req.user.role !== 'moderator') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this answer'
      });
    }
    
    await db.collection('answers').updateOne(
      { _id: answerId },
      { 
        $set: { 
          content,
          updatedAt: new Date()
        }
      }
    );
    
    // Update question's updatedAt
    await db.collection('questions').updateOne(
      { _id: answer.questionId },
      { $set: { updatedAt: new Date() } }
    );
    
    const updatedAnswer = await db.collection('answers').findOne({ _id: answerId });
    
    res.json({
      success: true,
      message: 'Answer updated successfully',
      data: updatedAnswer
    });
  } catch (error) {
    console.error('Update answer error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating answer'
    });
  }
});

// @route   DELETE /api/answers/:answerId
// @desc    Delete answer
// @access  Private (owner or admin)
router.delete('/:answerId', auth, async (req, res) => {
  try {
    const { answerId } = req.params;
    const db = getDB();
    
    const answer = await db.collection('answers').findOne({ _id: answerId });
    
    if (!answer) {
      return res.status(404).json({
        success: false,
        message: 'Answer not found'
      });
    }
    
    // Check if user can delete this answer
    if (answer.userId !== req.user._id && req.user.role !== 'admin' && req.user.role !== 'moderator') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this answer'
      });
    }
    
    // If this answer is accepted, unmark the question as resolved
    if (answer.isAccepted) {
      await db.collection('questions').updateOne(
        { _id: answer.questionId },
        { $set: { isResolved: false } }
      );
    }
    
    // Remove answer from question's answers array
    await db.collection('questions').updateOne(
      { _id: answer.questionId },
      { 
        $pull: { answers: answerId },
        $set: { updatedAt: new Date() }
      }
    );
    
    // Delete the answer
    await db.collection('answers').deleteOne({ _id: answerId });
    
    // Update user stats
    await db.collection('users').updateOne(
      { _id: answer.userId },
      { $inc: { 'stats.answersGiven': -1 } }
    );
    
    res.json({
      success: true,
      message: 'Answer deleted successfully'
    });
  } catch (error) {
    console.error('Delete answer error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting answer'
    });
  }
});

// @route   POST /api/answers/:answerId/vote
// @desc    Vote on answer (upvote/downvote)
// @access  Private
router.post('/:answerId/vote', auth, async (req, res) => {
  try {
    const { answerId } = req.params;
    const { voteType } = req.body; // 'upvote' or 'downvote'
    const db = getDB();
    
    if (!['upvote', 'downvote'].includes(voteType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid vote type'
      });
    }
    
    const answer = await db.collection('answers').findOne({ _id: answerId });
    
    if (!answer) {
      return res.status(404).json({
        success: false,
        message: 'Answer not found'
      });
    }
    
    // Can't vote on own answer
    if (answer.userId === req.user._id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot vote on your own answer'
      });
    }
    
    const userId = req.user._id;
    const upvotes = answer.votes_detail?.upvotes || [];
    const downvotes = answer.votes_detail?.downvotes || [];
    
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
    
    await db.collection('answers').updateOne({ _id: answerId }, updateQuery);
    
    const updatedAnswer = await db.collection('answers').findOne({ _id: answerId });
    
    res.json({
      success: true,
      message: 'Vote recorded successfully',
      data: {
        votes: updatedAnswer.votes,
        userVote: hasUpvoted && voteType !== 'upvote' ? null : 
                 hasDownvoted && voteType !== 'downvote' ? null : voteType
      }
    });
  } catch (error) {
    console.error('Vote answer error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error recording vote'
    });
  }
});

// @route   POST /api/answers/:answerId/accept
// @desc    Accept/unaccept answer
// @access  Private (question owner or admin)
router.post('/:answerId/accept', auth, async (req, res) => {
  try {
    const { answerId } = req.params;
    const db = getDB();
    
    const answer = await db.collection('answers').findOne({ _id: answerId });
    
    if (!answer) {
      return res.status(404).json({
        success: false,
        message: 'Answer not found'
      });
    }
    
    // Get the question to check ownership
    const question = await db.collection('questions').findOne({ _id: answer.questionId });
    
    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }
    
    // Check if user can accept this answer (question owner or admin)
    if (question.userId !== req.user._id && req.user.role !== 'admin' && req.user.role !== 'moderator') {
      return res.status(403).json({
        success: false,
        message: 'Only the question owner can accept answers'
      });
    }
    
    const newAcceptedState = !answer.isAccepted;
    
    if (newAcceptedState) {
      // Accepting this answer - unaccept any other accepted answers for this question
      await db.collection('answers').updateMany(
        { questionId: answer.questionId, _id: { $ne: answerId } },
        { $set: { isAccepted: false } }
      );
    }
    
    // Update this answer
    await db.collection('answers').updateOne(
      { _id: answerId },
      { $set: { isAccepted: newAcceptedState } }
    );
    
    // Update question resolved status
    await db.collection('questions').updateOne(
      { _id: answer.questionId },
      { $set: { isResolved: newAcceptedState } }
    );
    
    res.json({
      success: true,
      message: newAcceptedState ? 'Answer accepted successfully' : 'Answer unaccepted successfully',
      data: {
        isAccepted: newAcceptedState,
        questionResolved: newAcceptedState
      }
    });
  } catch (error) {
    console.error('Accept answer error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error accepting answer'
    });
  }
});

module.exports = router;