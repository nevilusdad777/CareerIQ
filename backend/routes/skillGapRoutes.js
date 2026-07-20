const express = require('express');
const router = express.Router();
const Question = require('../models/Question');
const SkillAttempt = require('../models/SkillAttempt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const fs = require('fs');
const path = require('path');

// Logger for submission debugging
const logFile = path.join(__dirname, '../submission_debug.log');
const debugLog = (msg) => {
  const line = `[${new Date().toISOString()}] ${msg}\n`;
  fs.appendFileSync(logFile, line);
  console.log(line);
};

const difficultyMultipliers = {
  beginner: 1,
  intermediate: 1.3,
  advanced: 1.6
};

// Middleware to verify JWT token
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    // Fetch user from database to get role
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    req.user = {
      id: user._id,
      role: user.role || 'user'
    };
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(403).json({ error: 'Invalid token' });
    } else if (error.name === 'TokenExpiredError') {
      return res.status(403).json({ error: 'Token expired' });
    }
    return res.status(500).json({ error: 'Server error' });
  }
};

// Admin middleware
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// GET /api/skillgap/status - Check if user can take exam
router.get('/status', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Find the most recent completed attempt
    const lastAttempt = await SkillAttempt.findOne({ userId, status: 'completed' })
      .sort({ createdAt: -1 });
      
    if (!lastAttempt) {
      return res.json({ canTakeExam: true });
    }
    
    // Calculate time since last attempt (in milliseconds)
    const timeSinceLastAttempt = Date.now() - new Date(lastAttempt.createdAt).getTime();
    const oneWeekInMs = 7 * 24 * 60 * 60 * 1000;
    
    if (timeSinceLastAttempt >= oneWeekInMs) {
      return res.json({ canTakeExam: true });
    }
    
    // Calculate next allowed date
    const nextAllowedDate = new Date(new Date(lastAttempt.createdAt).getTime() + oneWeekInMs);
    
    res.json({ 
      canTakeExam: false, 
      nextAllowedDate,
      message: `You can take the next assessment on ${nextAllowedDate.toLocaleDateString()}`
    });
  } catch (error) {
    console.error('Status check error:', error);
    res.status(500).json({ error: 'Failed to check exam status' });
  }
});

// GET /api/skillgap/questions - Get 12 random questions from DB
router.get('/questions', async (req, res) => {
  try {
    console.log('📚 Fetching random questions from DB...');
    
    // Fetch 12 random questions from the database
    const questions = await Question.aggregate([
      { $sample: { size: 12 } }
    ]);

    if (!questions || questions.length === 0) {
      console.warn('⚠️ No questions found in DB');
      return res.status(404).json({
        success: false,
        message: 'No questions available in the database'
      });
    }
    
    res.json({
      success: true,
      data: questions
    });
  } catch (error) {
    console.error('Error fetching questions:', error);
    res.status(500).json({ error: 'Failed to fetch questions' });
  }
});

// GET /api/skillgap/test - Test endpoint
router.get('/test', (req, res) => {
  console.log('🧪 Test endpoint called');
  res.json({ 
    success: true, 
    message: 'Backend is working!',
    timestamp: new Date().toISOString()
  });
});

const UserAnalytics = require('../models/UserAnalytics');
const { calculatePlacementProbability, calculateBestRole, calculateProfileStrength } = require('../utils/analyticsLogic');
const Profile = require('../models/Profile');

// POST /api/skillgap/submit - Submit answers and save attempt
router.post('/submit', authenticateToken, async (req, res) => {
  console.log('🚀 Submit endpoint called - START');
  try {
    console.log('🚀 Submit endpoint called');
    console.log('📝 Request body:', req.body);
    
    const { answers } = req.body;

    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({ success: false, error: 'Answers array is required' });
    }

    debugLog(`🚀 Processing submission for user: ${req.user.id} - ${answers.length} answers`);

    // Fetch all relevant questions from DB
    const questionIds = answers.map(a => a.questionId);
    const dbQuestions = await Question.find({ _id: { $in: questionIds } });

    // Calculate scores
    let correctAnswers = 0;
    let totalWeight = 0;
    let earnedWeight = 0;
    const categoryStats = {};

    const detailedAnswers = answers.map(answer => {
      const question = dbQuestions.find(q => q._id.toString() === answer.questionId);
      if (!question) return null;

      const weights = question.options.map(opt => opt.weight);
      const maxWeight = Math.max(...weights);
      const selectedOption = question.options[answer.selectedOptionIndex];
      const selectedWeight = selectedOption ? selectedOption.weight : 0;
      
      // Safety check for weights
      const correctOptionIndex = weights.length > 0 ? weights.indexOf(maxWeight) : 0;
      const isCorrect = selectedWeight === maxWeight && weights.length > 0;

      if (isCorrect) correctAnswers++;
      totalWeight += maxWeight;
      earnedWeight += selectedWeight;

      // Track categories
      let cat = question.category || "General";
      // Fix Mongoose Map dot key restriction
      if (cat === "Node.js") cat = "NodeJS";
      if (!categoryStats[cat]) {
        categoryStats[cat] = { earned: 0, total: 0 };
      }
      categoryStats[cat].earned += selectedWeight;
      categoryStats[cat].total += maxWeight;

      // Defensive access to correct option text
      const correctOptionText = (question.options && question.options[correctOptionIndex]) 
        ? question.options[correctOptionIndex].text 
        : "N/A";

      return {
        questionId: question._id,
        questionText: question.questionText,
        selectedOptionIndex: answer.selectedOptionIndex,
        selectedOptionText: selectedOption ? selectedOption.text : "Not selected",
        correctOptionIndex: correctOptionIndex,
        correctOptionText: correctOptionText,
        allOptions: question.options.map(opt => ({ text: opt.text, weight: opt.weight })),
        correctWeight: maxWeight,
        selectedWeight: selectedWeight,
        isCorrect,
        category: cat,
        difficulty: question.difficulty,
        timeSpent: Math.floor(Math.random() * 40) + 10,
        confidenceLevel: isCorrect ? 5 : 2
      };
    }).filter(Boolean);

    // Final calculations
    const overallScore = totalWeight > 0 ? Math.round((earnedWeight / totalWeight) * 100) : 0;
    const categoryScores = {};
    Object.keys(categoryStats).forEach(cat => {
      const stats = categoryStats[cat];
      categoryScores[cat] = stats.total > 0 ? Math.round((stats.earned / stats.total) * 100) : 0;
    });
    
    // Determine strengths and weaknesses
    const strengths = Object.entries(categoryScores)
      .filter(([_, score]) => score >= 75)
      .map(([cat]) => cat);
      
    const weaknesses = Object.entries(categoryScores)
      .filter(([_, score]) => score < 50)
      .map(([cat]) => cat);

    // Generate result object
    const resultData = {
      userId: req.user.id,
      overallScore,
      intelligenceIndex: Math.round(overallScore * 0.95),
      advancedCapabilityScore: Math.round(overallScore * 0.85),
      categoryScores,
      strengths,
      weaknesses: weaknesses.length ? weaknesses : ["Mixed skills identified"],
      predictedRole: overallScore > 80 ? "Senior Architect Path" : overallScore > 50 ? "Full Stack Engineer" : "Associate Developer",
      bestCareerMatch: overallScore > 80 ? "Elite Systems Design" : "Modern Web Development",
      answers: detailedAnswers,
      status: 'completed'
    };

    // Save to database
    // Find and delete previous completed attempt for this user due to unique index
    await SkillAttempt.findOneAndDelete({ userId: req.user.id, status: 'completed' });
    
    const attempt = new SkillAttempt(resultData);
    await attempt.save();

    // Calculate profile strength if profile exists
    let profileStrengthLabel = "Very Bad";
    let placementProb = Math.round(overallScore * 0.7); // Dynamic baseline from assessment
    
    try {
      // Profile.userId is a String in schema, so use toString()
      const userProfile = await Profile.findOne({ userId: req.user.id.toString() });
      if (userProfile) {
        profileStrengthLabel = calculateProfileStrength(userProfile);
        // If profile is good, boost probability
        if (profileStrengthLabel === "Very Good") placementProb += 15;
        else if (profileStrengthLabel === "Good") placementProb += 10;
      }
    } catch (profileError) {
      debugLog(`Note: Profile fetch error: ${profileError.message}`);
    }

    placementProb = Math.min(placementProb, 98); // Cap at 98 until predictor run

    // Update UserAnalytics for dashboard
    let newStreak = 1;
    const earnedXP = Math.round(overallScore / 2);
    const now = new Date();

    try {
      const existingAnalytics = await UserAnalytics.findOne({ userId: req.user.id });
      if (existingAnalytics && existingAnalytics.lastActive) {
        const lastActive = new Date(existingAnalytics.lastActive);
        const today = new Date(now).setHours(0, 0, 0, 0);
        const lastDate = new Date(lastActive).setHours(0, 0, 0, 0);
        const diffDays = Math.round((today - lastDate) / (1000 * 60 * 60 * 24));

        if (diffDays === 0) {
          newStreak = existingAnalytics.currentStreak || 1;
        } else if (diffDays === 1) {
          newStreak = (existingAnalytics.currentStreak || 0) + 1;
        } else {
          newStreak = 1;
        }
      }
    } catch (err) {
      console.error("Streak calculation error:", err);
    }

    await UserAnalytics.findOneAndUpdate(
      { userId: req.user.id },
      {
        $set: {
          totalSkills: Object.keys(categoryScores).length,
          bestRoleMatch: resultData.predictedRole,
          confidenceLevel: overallScore,
          placementProbability: Math.min(placementProb, 98),
          profileStrengthLabel: profileStrengthLabel,
          currentStreak: newStreak,
          lastActive: now,
          updatedAt: now
        },
        $inc: { totalXP: earnedXP },
        $push: {
          recentActivity: {
            action: "skill_assessment",
            points: earnedXP,
            timestamp: now
          }
        }
      },
      { upsert: true, new: true }
    );

    res.json({ success: true, data: resultData });

  } catch (error) {
    debugLog(`❌ ERROR in submit route: ${error.message}`);
    debugLog(`❌ Stack: ${error.stack}`);
    
    // Handle specifically duplicate key error for SkillAttempt
    if (error.code === 11000) {
      debugLog(`⚠️ Duplicate submission detected for user ${req.user.id}`);
      return res.status(409).json({
        success: false,
        error: 'Duplicate submission',
        message: 'You have already submitted an assessment recently.'
      });
    }

    res.status(500).json({ 
      success: false,
      error: 'Server error',
      message: 'Failed to submit answers',
      details: error.message
    });
  }
});

// GET /api/skillgap/result - Get user's result with detailed answers
router.get('/result', authenticateToken, async (req, res) => {
  try {
    const attempt = await SkillAttempt.findOne({ 
      userId: req.user.id, 
      status: 'completed' 
    }).populate('userId', 'name email').sort({ createdAt: -1 });

    if (!attempt) {
      return res.status(404).json({ error: 'No completed attempt found' });
    }

    // Calculate additional metrics
    const totalTimeSpent = attempt.answers.reduce((sum, answer) => sum + (answer.timeSpent || 0), 0);
    const averageTimePerQuestion = Math.round(totalTimeSpent / attempt.answers.length);
    const averageConfidence = (attempt.answers.reduce((sum, answer) => sum + (answer.confidenceLevel || 3), 0) / attempt.answers.length).toFixed(1);
    
    // Category breakdown with detailed metrics
    const categoryBreakdown = {};
    attempt.answers.forEach(answer => {
      if (!categoryBreakdown[answer.category]) {
        categoryBreakdown[answer.category] = {
          total: 0,
          correct: 0,
          totalTime: 0,
          avgConfidence: 0,
          questions: []
        };
      }
      
      const cat = categoryBreakdown[answer.category];
      cat.total++;
      if (answer.isCorrect) cat.correct++;
      cat.totalTime += answer.timeSpent || 0;
      cat.avgConfidence += answer.confidenceLevel || 3;
      cat.questions.push({
        questionText: answer.questionText,
        isCorrect: answer.isCorrect,
        timeSpent: answer.timeSpent,
        confidence: answer.confidenceLevel,
        difficulty: answer.difficulty
      });
    });
    
    // Calculate averages for each category
    Object.keys(categoryBreakdown).forEach(category => {
      const cat = categoryBreakdown[category];
      cat.avgConfidence = (cat.avgConfidence / cat.total).toFixed(1);
      cat.avgTime = Math.round(cat.totalTime / cat.total);
      cat.accuracy = Math.round((cat.correct / cat.total) * 100);
    });

    res.json({
      success: true,
      data: {
        overallScore: `${attempt.overallScore}%`,
        intelligenceIndex: attempt.intelligenceIndex,
        advancedCapabilityScore: attempt.advancedCapabilityScore,
        predictedRole: attempt.predictedRole,
        bestCareerMatch: attempt.bestCareerMatch,
        strengths: attempt.strengths,
        weaknesses: attempt.weaknesses,
        categoryScores: attempt.categoryScores,
        correctAnswers: attempt.answers.filter(a => a.isCorrect).length,
        incorrectAnswers: attempt.answers.filter(a => !a.isCorrect).length,
        scoreFormat: `${attempt.answers.filter(a => a.isCorrect).length}/${attempt.answers.length}`,
        totalTimeSpent,
        averageTimePerQuestion,
        averageConfidence,
        categoryBreakdown,
        detailedAnswers: attempt.answers.map(answer => ({
          questionId: answer.questionId,
          questionText: answer.questionText,
          selectedOption: answer.selectedOptionText,
          correctOption: answer.correctOptionText,
          isCorrect: answer.isCorrect,
          category: answer.category,
          difficulty: answer.difficulty,
          timeSpent: answer.timeSpent,
          confidenceLevel: answer.confidenceLevel,
          answeredAt: answer.answeredAt,
          explanation: answer.isCorrect ? 
            "Correct! This demonstrates strong understanding of the concept." : 
            `Incorrect. The better approach would be: ${answer.correctOptionText}`,
          allOptions: answer.allOptions
        })),
        createdAt: attempt.createdAt
      }
    });
  } catch (error) {
    console.error('Error fetching result:', error);
    res.status(500).json({ error: 'Failed to fetch result' });
  }
});

module.exports = router;
