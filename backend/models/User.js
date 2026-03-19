const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email address']
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user"
  },
  savedJobs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Job"
  }],
  completedRoadmaps: [{
    roadmapId: { type: mongoose.Schema.Types.ObjectId, ref: 'Roadmap' },
    competencyName: String,
    completedAt: { type: Date, default: Date.now }
  }],
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
});

// Add indexing for commonly queried fields
UserSchema.index({ role: 1 });

module.exports = mongoose.model("User", UserSchema);