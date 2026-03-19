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

// Handle preflight - removed problematic line

app.use(express.json());

app.use((req, res, next) => {
  console.log(`🌐 [${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
  if (req.method === 'POST') console.log('📦 Body:', JSON.stringify(req.body).substring(0, 100));
  next();
});

// Health Check Endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    server: "CareerIQ Backend",
    version: "1.0.0"
  });
});

// Import routes directly
const loadRoutes = async () => {
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

// Start Server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Wait for DB connection
    await connectDB();
    
    // Load routes after successful DB connection
    await loadRoutes();
    
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`
=====================================
 CAREERIQ BACKEND RUNNING SUCCESSFULLY!
=====================================
 Server: http://localhost:${PORT}
 Health: http://localhost:${PORT}/api/health
 Frontend: http://localhost:5173
 Database: MongoDB Atlas
=====================================
 Ready to accept connections
`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();