const mongoose = require('mongoose');

const userAnalyticsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true
  },
  placementProbability: {
    type: Number,
    default: 0
  },
  bestRoleMatch: {
    type: String,
    default: "Not Available"
  },
  totalSkills: {
    type: Number,
    default: 0
  },
  profileStrengthLabel: {
    type: String,
    default: "Very Bad"
  },
  confidenceLevel: {
    type: Number,
    default: 0
  },
  skillGapAnswers: [{
    type: Boolean
  }],
  predictorInputs: {
    type: Object
  },
  // XP and Streak tracking fields
  totalXP: {
    type: Number,
    default: 100
  },
  currentStreak: {
    type: Number,
    default: 1
  },
  lastActive: {
    type: Date,
    default: Date.now
  },
  recentActivity: [{
    action: {
      type: String,
      required: true
    },
    points: {
      type: Number,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  updatedAt: {
    type: Date,
    default: Date.now
  },
  achievements: [{
    title: {
      type: String,
      required: true
    },
    icon: {
      type: String,
      required: true
    },
    unlocked: {
      type: Boolean,
      default: false
    },
    description: {
      type: String,
      required: true
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    }
  }]
}, {
  timestamps: false
});

// Remove the timestamps option to avoid conflicts
userAnalyticsSchema.set('timestamps', false);

// Performance Indexes for Leaderboards and Analytics
userAnalyticsSchema.index({ totalXP: -1 }); // Fast leaderboard queries
userAnalyticsSchema.index({ currentStreak: -1 }); // Fast streak leaders
userAnalyticsSchema.index({ lastActive: -1 }); // Active user tracking

module.exports = mongoose.model('UserAnalytics', userAnalyticsSchema);
