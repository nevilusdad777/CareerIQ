const mongoose = require('mongoose');

const ProfileSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true
  },
  personalInfo: {
    name: String,
    email: String,
    phone: String,
    college: String,
    degree: String,
    year: String,
    role: String,
    bio: String,
    location: String,
    address: String,
    birthday: String,
    gender: String
  },
  socialLinks: {
    github: String,
    linkedin: String,
    portfolio: String
  },
  skills: [{
    name: String,
    level: Number
  }],
  experience: [{
    company: String,
    role: String,
    duration: String,
    description: String
  }],
  projects: [{
    name: String,
    tech: [String],
    status: String,
    link: String
  }],
  certifications: [{
    title: String,
    platform: String,
    date: String
  }],
  courses: [{
    name: String,
    status: String,
    progress: Number
  }],
  goals: [{
    goal: String,
    deadline: String,
    completed: Boolean
  }],
  achievements: [{
    title: String,
    icon: String,
    date: String
  }],
  profilePhoto: String,
  profileCompletion: Number,
  createdAt: String,
  updatedAt: String
});

module.exports = mongoose.model('Profile', ProfileSchema);
