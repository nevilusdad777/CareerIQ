const express = require("express");
const router = express.Router();
const Resume = require("../models/Resume");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// GET /api/resume/:userId
// Fetch user's saved resume data
router.get("/:userId", async (req, res) => {
  try {
    const resume = await Resume.findOne({ userId: req.params.userId });
    if (!resume) {
      return res.status(404).json({ message: "Resume not found" });
    }
    res.json(resume);
  } catch (error) {
    console.error("Error fetching resume:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// POST /api/resume
// Save or update resume data
router.post("/", async (req, res) => {
  const { userId, personalInfo, education, experience, projects, skills } = req.body;

  if (!userId) {
    return res.status(400).json({ error: "userId is required" });
  }

  try {
    let resume = await Resume.findOne({ userId });

    if (resume) {
      // Update existing
      resume.personalInfo = personalInfo || resume.personalInfo;
      resume.education = education || resume.education;
      resume.experience = experience || resume.experience;
      resume.projects = projects || resume.projects;
      resume.skills = skills || resume.skills;
      await resume.save();
    } else {
      // Create new
      resume = new Resume({
        userId,
        personalInfo,
        education,
        experience,
        projects,
        skills
      });
      await resume.save();
    }

    res.json({ success: true, resume });
  } catch (error) {
    console.error("Error saving resume:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// POST /api/resume/enhance
// Uses Gemini AI to rewrite experience/project descriptions.
router.post("/enhance", async (req, res) => {
  const { text, type } = req.body; // type can be 'experience' or 'project'

  if (!text) {
    return res.status(400).json({ error: "Text is required for enhancement" });
  }

  if (!process.env.GEMINI_API_KEY) {
    console.warn("⚠️ GEMINI_API_KEY is missing");
    return res.status(500).json({ 
      error: "AI Configuration missing." 
    });
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
    
    const systemPrompt = `
You are an expert resume writer and career coach.
Your task is to take the user's drafted ${type === 'project' ? 'project description' : 'work experience'} and enhance it.
Make it sound highly professional, impactful, and action-oriented.
Focus on achievements, metrics (if implied), and strong action verbs.
Provide ONLY the enhanced text, with no conversational filler or markdown formatting (unless it's simple bullet points if requested, but a single clear paragraph/bullet is best). Do not enclose it in quotes.
`;
    
    // We use generateContent for simple text completion instead of startChat since no history is needed
    const result = await model.generateContent(`${systemPrompt}\n\nUser's Draft:\n${text}`);
    const response = await result.response;
    const enhancedText = response.text().trim();

    res.json({ success: true, enhancedText });
  } catch (error) {
    console.error("Gemini API Error in enhance:", error);
    res.status(500).json({ error: "Failed to enhance text" });
  }
});

module.exports = router;
