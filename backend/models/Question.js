const mongoose = require("mongoose");

const QuestionSchema = new mongoose.Schema({
  questionText: {
    type: String,
    required: true,
    trim: true
  },
  options: [{
    text: {
      type: String,
      required: true
    },
    weight: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    }
  }],
  category: {
    type: String,
    required: true,
    default: "General"
  },
  difficulty: {
    type: String,
    required: true,
    enum: ["beginner", "intermediate", "advanced"]
  },
  explanation: {
    type: String,
    required: false,
    trim: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model("Question", QuestionSchema);
