const mongoose = require('mongoose');

const skillAttemptSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  answers: [{
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Question',
      required: true
    },
    questionText: {
      type: String,
      required: true
    },
    selectedOptionIndex: {
      type: Number,
      required: true,
      min: 0,
      max: 4
    },
    selectedOptionText: {
      type: String,
      required: true
    },
    correctOptionIndex: {
      type: Number,
      required: true
    },
    correctOptionText: {
      type: String,
      required: true
    },
    allOptions: [{
      text: String,
      weight: Number
    }],
    correctWeight: {
      type: Number,
      required: true
    },
    selectedWeight: {
      type: Number,
      required: true
    },
    isCorrect: {
      type: Boolean,
      required: true
    },
    category: {
      type: String,
      required: true
    },
    difficulty: {
      type: String,
      required: true,
      enum: ['beginner', 'intermediate', 'advanced']
    },
    timeSpent: {
      type: Number,
      required: true,
      default: 0 // in seconds
    },
    confidenceLevel: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
      default: 3
    },
    answeredAt: {
      type: Date,
      required: true,
      default: Date.now
    }
  }],
  overallScore: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  intelligenceIndex: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  advancedCapabilityScore: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  categoryScores: {
    type: Map,
    of: Number,
    required: true
  },
  predictedRole: {
    type: String,
    required: true
  },
  bestCareerMatch: {
    type: String,
    required: true
  },
  strengths: [{
    type: String
  }],
  weaknesses: [{
    type: String
  }],
  status: {
    type: String,
    required: true,
    enum: ['completed'],
    default: 'completed'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create compound index to prevent duplicate attempts
skillAttemptSchema.index({ userId: 1, status: 1 }, { unique: true });

// Performance indexing for retrieving user skill profile history fast
skillAttemptSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('SkillAttempt', skillAttemptSchema);
