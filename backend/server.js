// Fix DNS resolution issues on Windows/certain networks for MongoDB Atlas
const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

dotenv.config();

const app = express();

// CORS Configuration
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Enable pre-flight for all routes
// app.use(cors()) handles OPTIONS requests automatically

app.use(express.json());

app.use((req, res, next) => {
  console.log(`ðŸŒ [${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
  if (req.method === 'POST') console.log('ðŸ“¦ Body:', JSON.stringify(req.body).substring(0, 100));
  next();
});

// Health Check Endpoint â€” always returns 200 so keep-alive cron jobs never fail
const healthCheckHandler = (req, res) => {
  const mongoose = require("mongoose");
  const dbStates = ["disconnected", "connected", "connecting", "disconnecting"];
  const dbState = mongoose.connection.readyState;
  res.status(200).json({
    status: "ok",
    message: "CareerIQ API is running",
    timestamp: new Date().toISOString(),
    server: "CareerIQ Backend",
    version: "1.0.0",
    db: dbStates[dbState] ?? "unknown"
  });
};

app.get("/", healthCheckHandler);
app.get("/health", healthCheckHandler);
app.get("/api/health", healthCheckHandler);

// Import routes directly
const loadRoutes = () => {
  try {
    console.log("Loading API routes...");
    const adminRoutes = require("./routes/adminRoutes");
    const roadmapRoutes = require("./routes/roadmapRoutes");
    const skillRoutes = require("./routes/skillRoutes");
    const authRoutes = require("./routes/auth");
    const chatRoutes = require("./routes/chatRoutes");
    const profileRoutes = require("./routes/profileRoutes");
    const notificationRoutes = require("./routes/notificationRoutes");
    const eventRoutes = require("./routes/eventRoutes");
    const feedbackRoutes = require("./routes/feedbackRoutes");
    const predictorRoutes = require("./routes/skillGapRoutes");
    const jobRoutes = require("./routes/jobRoutes");
    const interviewRoutes = require("./routes/interviewRoutes");
    const analyticsRoutes = require("./routes/analyticsRoutes");
    const marketIntelRoutes = require("./routes/marketIntelRoutes");
    const userRoutes = require("./routes/userRoutes");
    const applicationRoutes = require("./routes/applicationRoutes");
    const adminSkillsRoutes = require("./routes/adminSkillsRoutes");

    app.use("/api/admin", adminRoutes);
    app.use("/api/roadmap", roadmapRoutes);
    app.use("/api/skills", skillRoutes);
    app.use("/api/auth", authRoutes);
    app.use("/api/chat", chatRoutes);
    app.use("/api/profile", profileRoutes);
    app.use("/api/notifications", notificationRoutes);
    app.use("/api/events", eventRoutes);
    app.use("/api/feedback", feedbackRoutes);
    app.use("/api/predictor", predictorRoutes);
    app.use("/api/skillgap", predictorRoutes);
    app.use("/api/jobs", jobRoutes);
    app.use("/api/interview", interviewRoutes);
    app.use("/api/analytics", analyticsRoutes);
    app.use("/api/market-intel", marketIntelRoutes);
    app.use("/api/users", userRoutes);
    app.use("/api/applications", applicationRoutes);
    app.use("/api/admin", adminSkillsRoutes);

    console.log("All routes loaded successfully");
  } catch (error) {
    console.error("Error loading routes:", error);
  }
};

// Initialize DB connection and load routes
connectDB().catch(err => {
  console.error("Database connection failed on startup:", err);
});
loadRoutes();

// Export the app for Vercel Serverless Functions
module.exports = app;

// Start Server locally if not running on Vercel
if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`
=====================================
 CAREERIQ BACKEND RUNNING LOCALLY!
=====================================
 Server: http://localhost:${PORT}
 Health: http://localhost:${PORT}/api/health
 Database: MongoDB Atlas
=====================================
 Ready to accept connections
`);
  });
}
