const mongoose = require("mongoose");

const MarketIntelDataSchema = new mongoose.Schema({
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  jobRoles: [
    {
      role: String,
      demand: String,
      demandLevel: Number,
      growth: String,
      avgSalary: String,
      minSalary: Number,
      maxSalary: Number,
      skills: [String],
      topCompanies: [String],
      placementChance: Number,
      workLifeBalance: String,
      learningCurve: String,
      remoteWork: String,
      experienceRequired: String,
      jobSecurity: String,
      careerGrowth: String
    }
  ],
  skillDemands: [
    {
      skill: String,
      demand: String,
      icon: String,
      demandPercent: Number,
      growth: String
    }
  ],
  trendingSkills: [
    {
      skill: String,
      trend: String,
      growth: String,
      jobs: Number
    }
  ],
  locationDemands: {
    type: Map,
    of: new mongoose.Schema({
      demand: String,
      jobs: Number,
      avgSalary: String,
      growth: String
    })
  }
}, { timestamps: true });

// Optimize pulling the "latest" market intel data
MarketIntelDataSchema.index({ lastUpdated: -1 });

module.exports = mongoose.model("MarketIntelData", MarketIntelDataSchema);
