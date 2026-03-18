const mongoose = require("mongoose");

const InterviewPrepSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
    trim: true
  },
  answer: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ["Behavioral", "Technical", "HR", "System Design"]
  },
  tips: {
    type: String
  },
  difficulty: {
    type: String,
    enum: ["Beginner", "Intermediate", "Advanced"],
    default: "Intermediate"
  }
}, {
  timestamps: true
});

module.exports = mongoose.model("InterviewPrep", InterviewPrepSchema);
