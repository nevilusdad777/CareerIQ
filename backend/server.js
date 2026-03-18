const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

dotenv.config();

const app = express();

// CORS Configuration
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:3000', 'http://localhost:5174'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']
}));


app.use(express.json());

// Health Check Endpoint
app.get("/api/health", (req, res) => {
  res.json({ 
    status: "OK", 
    timestamp: new Date().toISOString(),
    server: "CareerIQ Backend",
    port: process.env.PORT || 5000,
    database: "MongoDB Atlas",
    version: "1.0.0"
  });
});

// Test Endpoint
app.get("/api/test", (req, res) => {
  res.json({
    success: true,
    message: "Backend is working!",
    timestamp: new Date().toISOString()
  });
});

// Root Endpoint
app.get("/", (req, res) => {
  res.send("CareerIQ API running ");
});

// Load Routes After DB Connection
const loadRoutes = async () => {
  try {
    console.log(" Loading API routes...");
    
    const applicationRoutes = require("./routes/applicationRoutes");
    const authRoutes = require("./routes/auth");
    const skillGapRoutes = require("./routes/skillGapRoutes");
    const adminRoutes = require("./routes/adminRoutes");
    const adminSkillsRoutes = require("./routes/adminSkillsRoutes");
    const analyticsRoutes = require("./routes/analyticsRoutes");
    const profileRoutes = require("./routes/profileRoutes");
    const notificationRoutes = require("./routes/notificationRoutes");
    const eventRoutes = require("./routes/eventRoutes");
    const roadmapRoutes = require("./routes/roadmapRoutes");
    const marketIntelRoutes = require("./routes/marketIntelRoutes");
    const feedbackRoutes = require("./routes/feedbackRoutes");
    const interviewRoutes = require("./routes/interviewRoutes");
    const jobRoutes = require("./routes/jobRoutes");
    const questionRoutes = require("./routes/questionRoutes");
    const skillRoutes = require("./routes/skillRoutes");
    const chatRoutes = require("./routes/chatRoutes");
    const userRoutes = require("./routes/userRoutes");
    const resumeRoutes = require("./routes/resumeRoutes");
    
    app.use("/api/applications", applicationRoutes);
    app.use("/api/auth", authRoutes);
    app.use("/api/skillgap", skillGapRoutes);
    app.use("/api/admin", adminRoutes);
    app.use("/api/admin", adminSkillsRoutes);
    app.use("/api/analytics", analyticsRoutes);
    app.use("/api/profile", profileRoutes);
    app.use("/api/notifications", notificationRoutes);
    app.use("/api/events", eventRoutes);
    app.use("/api/roadmap", roadmapRoutes);
    app.use("/api/market-intel", marketIntelRoutes);
    app.use("/api/feedback", feedbackRoutes);
    app.use("/api/interview", interviewRoutes);
    app.use("/api/jobs", jobRoutes);
    app.use("/api/questions", questionRoutes);
    app.use("/api/skills", skillRoutes);
    app.use("/api/chat", chatRoutes);
    app.use("/api/users", userRoutes);
    app.use("/api/resume", resumeRoutes);
    
    console.log(" All routes loaded successfully");
    
  } catch (error) {
    console.error(" Routes loading error:", error.message);
  }
};

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  console.log(" Starting CareerIQ Backend");
  console.log("=====================================");
  
  try {
    // Connect to MongoDB first
    await connectDB();
    
    // Load routes after successful DB connection
    await loadRoutes();
    
    // Start server
    app.listen(PORT, '0.0.0.0', () => {
      console.log("\n CAREERIQ BACKEND RUNNING SUCCESSFULLY!");
      console.log("=====================================");
      console.log(` Server: http://localhost:${PORT}`);
      console.log(` Health: http://localhost:${PORT}/api/health`);
      console.log(` Frontend: http://localhost:5173`);
      console.log(" Database: MongoDB Atlas");
      console.log("=====================================");
      console.log(" Ready to accept connections");
    });
    
  } catch (error) {
    console.error(" Failed to start server:", error.message);
    process.exit(1);
  }
};

// Error Handling
process.on('unhandledRejection', (reason, promise) => {
  console.error(' Unhandled Promise Rejection:', reason);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error(' Uncaught Exception:', error);
  process.exit(1);
});

// Graceful Shutdown
process.on('SIGTERM', () => {
  console.log(' SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log(' SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Start Server
startServer();