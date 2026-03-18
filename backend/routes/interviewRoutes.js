const express = require("express");
const router = express.Router();
const InterviewPrep = require("../models/InterviewPrep");

// Get all interview questions
router.get("/", async (req, res) => {
  try {
    const questions = await InterviewPrep.find().sort({ createdAt: -1 });
    res.json({ success: true, data: questions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Admin: Add a new question
router.post("/", async (req, res) => {
  try {
    const newQuestion = new InterviewPrep(req.body);
    const saved = await newQuestion.save();
    res.json({ success: true, data: saved });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Admin: Update a question
router.put("/:id", async (req, res) => {
  try {
    const updated = await InterviewPrep.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Admin: Delete a question
router.delete("/:id", async (req, res) => {
  try {
    await InterviewPrep.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Question deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
