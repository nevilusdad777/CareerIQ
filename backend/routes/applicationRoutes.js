const express = require("express");
const router = express.Router();
const JobApplication = require("../models/JobApplication");

// Submit a new application
router.post("/", async (req, res) => {
  try {
    const { jobId, userId, message, name, email } = req.body;
    if (!jobId || !userId || !message) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const newApplication = new JobApplication({
      jobId,
      userId,
      message,
      name,
      email
    });

    const saved = await newApplication.save();
    res.json({ success: true, data: saved });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Admin: Get all applications with populated job and user details
router.get("/", async (req, res) => {
  try {
    const applications = await JobApplication.find()
      .populate("jobId", "title company")
      .populate("userId", "name email")
      .sort({ appliedDate: -1 });
    res.json({ success: true, data: applications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Admin: Update application status
router.put("/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    const updated = await JobApplication.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

module.exports = router;
