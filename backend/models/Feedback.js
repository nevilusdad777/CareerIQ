const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  userName: {
    type: String,
    required: false
  },
  userEmail: {
    type: String,
    required: false
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  message: {
    type: String,
    required: true,
    minlength: 10
  },
  category: {
    type: String,
    enum: ['general', 'bug', 'feature'],
    default: 'general'
  },
  status: {
    type: String,
    enum: ['pending', 'reviewed'],
    default: 'pending'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'normal'],
    default: 'normal'
  },
  anonymous: {
    type: Boolean,
    default: false
  },
  bugDetails: {
    pageName: String,
    errorType: String,
    browserInfo: String,
    steps: String
  },
  reviewedAt: {
    type: Date
  }
}, { timestamps: true });

module.exports = mongoose.model('Feedback', feedbackSchema);
