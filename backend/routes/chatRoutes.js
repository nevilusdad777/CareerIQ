const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");
const { KNOWLEDGE_BASE } = require("../data/chatbotKnowledge");

const LOG_FILE = path.join(__dirname, "../chat_debug.log");
const logToFile = (msg) => {
  try {
    const entry = `[${new Date().toISOString()}] ${msg}\n`;
    fs.appendFileSync(LOG_FILE, entry);
  } catch (err) {
    console.error("Failed to write to chat_debug.log:", err.message);
  }
};

const getLocalResponse = (message) => {
  const msg = message.toLowerCase();
  
  // High-priority exact matches or keyword broad search
  for (const category in KNOWLEDGE_BASE) {
    if (category === 'default') continue;
    const { keywords, response } = KNOWLEDGE_BASE[category];
    if (keywords.some(keyword => msg.includes(keyword))) {
      return response;
    }
  }

  // Final fallback from knowledge base
  return KNOWLEDGE_BASE.default.response;
};

// --- API Route ---
router.post("/", async (req, res) => {
  logToFile(`📨 (Heavy) Request: ${JSON.stringify(req.body)}`);
  const { message } = req.body;

  if (!message || typeof message !== 'string' || message.trim() === '') {
    return res.status(400).json({ error: "Message is required" });
  }

  try {
    // Artificial slight delay for natural feel
    await new Promise(resolve => setTimeout(resolve, 500));

    const reply = getLocalResponse(message);
    logToFile(`✅ (Heavy) Response generated`);

    res.json({
      success: true,
      reply: reply,
      isLocal: true,
      commandCount: Object.keys(KNOWLEDGE_BASE).length
    });
  } catch (error) {
    logToFile(`❌ (Heavy) Error: ${error.message}`);
    res.status(500).json({ 
      error: "Failed to process large knowledge base",
      details: error.message 
    });
  }
});

module.exports = router;
