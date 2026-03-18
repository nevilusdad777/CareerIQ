const express = require('express');
const router = express.Router();
const SkillAttempt = require('../models/SkillAttempt');
const Question = require('../models/Question');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

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

  // Fallback: Check DB if role is missing in token
  try {
    const user = await User.findById(req.user.userId);
    if (user && user.role === 'admin') {
      req.user.role = 'admin';
      return next();
    }
    return res.status(403).json({ error: 'Admin access required' });
  } catch (error) {
    return res.status(500).json({ error: 'Authorization check failed' });
  }
};

// GET /api/admin/userskills - Get all user skill attempts with detailed answers
router.get('/userskills', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { search, sortBy = 'createdAt', page = 1, limit = 10 } = req.query;
    
    // Build search filter
    let searchFilter = { status: 'completed' };
    
    if (search) {
      const users = await User.find({
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ]
      }).select('_id');
      
      const userIds = users.map(u => u._id);
      searchFilter.userId = { $in: userIds };
    }

    // Build sort filter
    const sortOptions = {};
    switch (sortBy) {
      case 'score':
        sortOptions.overallScore = -1;
        break;
      case 'intelligence':
        sortOptions.intelligenceIndex = -1;
        break;
      case 'advanced':
        sortOptions.advancedCapabilityScore = -1;
        break;
      default:
        sortOptions.createdAt = -1;
    }

    // Get total count for pagination
    const totalCount = await SkillAttempt.countDocuments(searchFilter);

    // Get paginated results
    const attempts = await SkillAttempt.find(searchFilter)
      .populate('userId', 'name email')
    .sort(sortOptions)
    .limit(limit * 1)
    .skip((page - 1) * limit);

    // Get detailed answers for each attempt
    const results = await Promise.all(attempts.map(async (attempt) => {
      const questionIds = attempt.answers.map(a => a.questionId);
      const questions = await Question.find({ _id: { $in: questionIds } });
      const questionMap = new Map(questions.map(q => [q._id.toString(), q]));

      const detailedAnswers = attempt.answers.map(answer => {
        const question = questionMap.get(answer.questionId.toString());
        const selectedOption = question?.options[answer.selectedOptionIndex];
        const correctOption = question?.options.reduce((max, option) => 
          option.weight > max.weight ? option : max
        , question?.options[0]);

        return {
          questionText: question?.questionText || 'Question not found',
          selectedAnswerText: selectedOption?.text || 'No answer selected',
          correctAnswerText: correctOption?.text || 'Correct answer not found',
          isCorrect: answer.isCorrect,
          category: answer.category,
          difficulty: answer.difficulty
        };
      });

      return {
        name: attempt.userId.name,
        userName: attempt.userId.name,
        email: attempt.userId.email,
        overallScore: attempt.overallScore,
        intelligenceIndex: attempt.intelligenceIndex,
        advancedCapabilityScore: attempt.advancedCapabilityScore,
        predictedRole: attempt.predictedRole,
        bestCareerMatch: attempt.bestCareerMatch,
        totalQuestions: attempt.answers.length,
        correctAnswers: attempt.answers.filter(a => a.isCorrect).length,
        incorrectAnswers: attempt.answers.filter(a => !a.isCorrect).length,
        createdAt: attempt.createdAt,
        answers: detailedAnswers
      };
    }));

    res.json({
      success: true,
      data: results,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalResults: totalCount,
        hasNextPage: page < Math.ceil(totalCount / limit),
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching user skills:', error);
    res.status(500).json({ error: 'Failed to fetch user skills data' });
  }
});

// GET /api/admin/userskills/export - Export user skills data
router.get('/userskills/export', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const attempts = await SkillAttempt.find({ status: 'completed' })
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });

    const csvData = attempts.map(attempt => ({
      'User Name': attempt.userId.name,
      'Email': attempt.userId.email,
      'Overall Score': `${attempt.overallScore}%`,
      'Intelligence Index': attempt.intelligenceIndex,
      'Advanced Capability': attempt.advancedCapabilityScore,
      'Predicted Role': attempt.predictedRole,
      'Best Career Match': attempt.bestCareerMatch,
      'Correct Answers': attempt.answers.filter(a => a.isCorrect).length,
      'Incorrect Answers': attempt.answers.filter(a => !a.isCorrect).length,
      'Test Date': new Date(attempt.createdAt).toLocaleDateString()
    }));

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=user-skills-data.csv');
    
    // Convert to CSV string
    const headers = Object.keys(csvData[0]);
    const csvHeaders = headers.join(',');
    const csvRows = csvData.map(row => 
      headers.map(header => `"${row[header]}"`).join(',')
    );
    
    res.send([csvHeaders, ...csvRows].join('\n'));
  } catch (error) {
    console.error('Error exporting data:', error);
    res.status(500).json({ error: 'Failed to export data' });
  }
});

module.exports = router;
