const express = require('express');
const router = express.Router();
const Question = require('../models/Question');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Admin middleware
const requireAdmin = async (req, res, next) => {
  if (req.user.role === 'admin') return next();

  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    const user = await User.findById(userId);
    if (user && user.role === 'admin') {
      req.user.role = 'admin';
      return next();
    }
    return res.status(403).json({ error: 'Admin access required' });
  } catch (error) {
    return res.status(500).json({ error: 'Authorization check failed' });
  }
};

// GET /api/questions - Fetch all questions (Admin only)
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const questions = await Question.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      data: questions
    });
  } catch (error) {
    console.error('Error fetching questions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch questions',
      error: error.message
    });
  }
});

// POST /api/questions - Create a new question
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { questionText, options, category, difficulty, explanation } = req.body;
    
    const newQuestion = new Question({
      questionText,
      options,
      category,
      difficulty,
      explanation
    });

    await newQuestion.save();
    
    res.status(201).json({
      success: true,
      data: newQuestion
    });
  } catch (error) {
    console.error('Error creating question:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create question',
      error: error.message
    });
  }
});

// PUT /api/questions/:id - Update a question
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid question ID' });
    }

    const updatedQuestion = await Question.findByIdAndUpdate(id, updateData, { new: true });

    if (!updatedQuestion) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }

    res.status(200).json({
      success: true,
      data: updatedQuestion
    });
  } catch (error) {
    console.error('Error updating question:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update question',
      error: error.message
    });
  }
});

// DELETE /api/questions/:id - Delete a question
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid question ID' });
    }

    const deletedQuestion = await Question.findByIdAndDelete(id);

    if (!deletedQuestion) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Question deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting question:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete question',
      error: error.message
    });
  }
});

module.exports = router;
