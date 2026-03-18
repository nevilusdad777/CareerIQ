const mongoose = require('mongoose');

const SkillSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  learningPath: [{
    title: {
      type: String,
      required: true
    },
    url: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['video', 'article', 'course', 'documentation'],
      default: 'video'
    },
    duration: {
      type: String,
      placeholder: 'e.g. 10 mins, 2 hours'
    }
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Skill', SkillSchema);
