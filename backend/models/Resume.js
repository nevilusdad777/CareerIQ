const mongoose = require("mongoose");

const resumeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  personalInfo: {
    fullName: { type: String, default: "" },
    email: { type: String, default: "" },
    phone: { type: String, default: "" },
    linkedin: { type: String, default: "" },
    github: { type: String, default: "" },
    location: { type: String, default: "" },
    portfolio: { type: String, default: "" }
  },
  education: [
    {
      institution: { type: String },
      degree: { type: String },
      startYear: { type: String },
      endYear: { type: String },
      description: { type: String }
    }
  ],
  experience: [
    {
      company: { type: String },
      role: { type: String },
      duration: { type: String },
      description: { type: String }
    }
  ],
  projects: [
    {
      title: { type: String },
      link: { type: String },
      description: { type: String }
    }
  ],
  skills: { type: [String], default: [] }
}, { timestamps: true });

module.exports = mongoose.model("Resume", resumeSchema);
