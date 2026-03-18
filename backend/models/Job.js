const mongoose = require("mongoose");

const JobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  company: {
    type: String,
    required: true,
    trim: true
  },
  location: {
    type: String,
    required: true
  },
  salary: {
    type: String,
    required: true
  },
  jobType: {
    type: String,
    required: true,
    enum: ["Full-time", "Part-time", "Contract", "Remote", "Internship"]
  },
  experience: {
    type: String,
    required: true,
    enum: ["Entry Level", "Mid-Senior", "Expert", "Any Experience"],
    default: "Any Experience"
  },
  skills: {
    type: [String],
    default: []
  },
  description: {
    type: String
  },
  applyLink: {
    type: String,
    required: true
  },
  postedDate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model("Job", JobSchema);
