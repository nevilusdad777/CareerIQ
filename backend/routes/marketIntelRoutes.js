const express = require("express");
const MarketIntelData = require("../models/MarketIntelData");

const router = express.Router();

// @route   GET /api/market-intel
// @desc    Get the global market intel data
// @access  Public (or authenticated depending on needs)
router.get("/", async (req, res) => {
  try {
    let intelData = await MarketIntelData.findOne();
    
    if (!intelData) {
      // If none exists, create an empty one or return default 
      // The frontend will handle fallbacks or initial state
      intelData = new MarketIntelData({
        jobRoles: [],
        skillDemands: [],
        trendingSkills: [],
        locationDemands: {}
      });
      await intelData.save();
    }
    
    res.json({ success: true, data: intelData });
  } catch (error) {
    console.error("Error fetching market intel data:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

// @route   PUT /api/market-intel
// @desc    Update global market intel data
// @access  Admin only (Assuming backend admin middleware or simple check)
router.put("/", async (req, res) => {
  try {
    const { jobRoles, skillDemands, trendingSkills, locationDemands } = req.body;
    
    let intelData = await MarketIntelData.findOne();
    
    if (!intelData) {
      intelData = new MarketIntelData();
    }
    
    // Update fields
    if (jobRoles) intelData.jobRoles = jobRoles;
    if (skillDemands) intelData.skillDemands = skillDemands;
    if (trendingSkills) intelData.trendingSkills = trendingSkills;
    if (locationDemands) intelData.locationDemands = locationDemands;
    
    intelData.lastUpdated = Date.now();
    await intelData.save();

    res.json({ success: true, data: intelData, message: "Market Intel Data updated successfully" });
  } catch (error) {
    console.error("Error updating market intel data:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

module.exports = router;
