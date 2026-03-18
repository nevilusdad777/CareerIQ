const express = require("express");
const router = express.Router();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");

dotenv.config();

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// System Prompt for CareerIQ
const SYSTEM_PROMPT = `
You are the CareerIQ AI Assistant, an expert career coach and technical mentor. 
Your goal is to help students and job seekers on the CareerIQ platform with:
1. Career Path Guidance: Suggesting roles based on interests and skills.
2. Skill Development: Recommending technical and soft skills to learn.
3. Roadmap Advice: Helping users understand their learning journey.
4. Interview Preparation: Providing tips, common questions, and behavioral advice.
5. Placement Support: Advice on resumes, networking, and job search strategies.

Guidelines:
- Be professional, encouraging, and concise.
- Use formatting (bullet points, bold text) to make answers readable.
- If you don't know something specific about the user's private data, ask them to check their dashboard.
- Always maintain the perspective of an elite career mentor.
`;

router.post("/", async (req, res) => {
  const { message, chatHistory } = req.body;

  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }

  if (!process.env.GEMINI_API_KEY) {
    console.warn("⚠️ GEMINI_API_KEY is missing in .env");
    return res.status(500).json({ 
      reply: "I'm having trouble connecting to my brain right now. Please make sure the AI configuration is complete." 
    });
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

    // Format history for Gemini if provided
    const chat = model.startChat({
      history: chatHistory || [],
      generationConfig: {
        maxOutputTokens: 1000,
      },
    });

    // We prepend the system prompt to the direct message for context if no history exists,
    // or as a context setter for the session.
    const promptWithContext = `${SYSTEM_PROMPT}\n\nUser Question: ${message}`;

    const result = await chat.sendMessage(promptWithContext);
    const response = await result.response;
    const text = response.text();

    res.json({
      success: true,
      reply: text
    });

  } catch (error) {
    console.error("Gemini API Error:", error);
    res.status(500).json({ 
      error: "Failed to generate AI response",
      details: error.message 
    });
  }
});

module.exports = router;
