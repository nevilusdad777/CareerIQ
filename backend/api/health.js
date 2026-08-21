const connectDB = require('../config/db');

module.exports = async (req, res) => {
  try {
    await connectDB().catch(() => {});
    const mongoose = require("mongoose");
    const dbStates = ["disconnected", "connected", "connecting", "disconnecting"];
    const dbState = mongoose.connection.readyState;
    return res.status(200).json({
      status: "ok",
      message: "CareerIQ API is running",
      timestamp: new Date().toISOString(),
      server: "CareerIQ Backend",
      version: "1.0.0",
      db: dbStates[dbState] ?? "unknown"
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
};
