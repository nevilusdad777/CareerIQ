const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Job = require("../models/Job");

// Toggle bookmark for a job
router.post("/bookmark", async (req, res) => {
  try {
    const { userId, jobId } = req.body;
    
    if (!userId || !jobId) {
      return res.status(400).json({ success: false, message: "Missing userId or jobId" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const isBookmarked = user.savedJobs.includes(jobId);
    
    if (isBookmarked) {
      // Remove from bookmarks
      user.savedJobs = user.savedJobs.filter(id => id.toString() !== jobId);
    } else {
      // Add to bookmarks
      user.savedJobs.push(jobId);
    }

    await user.save();
    
    res.json({ 
      success: true, 
      isBookmarked: !isBookmarked,
      savedJobs: user.savedJobs 
    });
  } catch (error) {
    console.error("Bookmark error:", error);
    res.status(500).json({ success: false, message: "Server error toggling bookmark" });
  }
});

// Get user's saved jobs
router.get("/saved-jobs/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).populate("savedJobs");
    
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({ success: true, savedJobs: user.savedJobs });
  } catch (error) {
    console.error("Fetch saved jobs error:", error);
    res.status(500).json({ success: false, message: "Server error fetching saved jobs" });
  }
});

module.exports = router;
