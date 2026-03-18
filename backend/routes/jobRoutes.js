const express = require("express");
const router = express.Router();
const Job = require("../models/Job");

// Get all jobs
router.get("/", async (req, res) => {
  try {
    const jobs = await Job.find().sort({ postedDate: -1 });
    res.json({ success: true, data: jobs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Admin: Add a new job
router.post("/", async (req, res) => {
  try {
    const newJob = new Job(req.body);
    const saved = await newJob.save();
    res.json({ success: true, data: saved });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Admin: Update a job
router.put("/:id", async (req, res) => {
  try {
    const updated = await Job.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Admin: Delete a job
router.delete("/:id", async (req, res) => {
  try {
    await Job.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Job deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
