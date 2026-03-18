const mongoose = require("mongoose");

const RoadmapProgressSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true
  },
  roleProgress: {
    type: Map,
    of: new mongoose.Schema({
      completedVideos: [String],
      learningStreak: { type: Number, default: 0 },
      totalWatchTime: { type: Number, default: 0 },
      lastActive: { type: Date, default: Date.now }
    }),
    default: {}
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Middleware to update the updatedAt field
RoadmapProgressSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  if (typeof next === 'function') next();
});

module.exports = mongoose.model("RoadmapProgress", RoadmapProgressSchema);
