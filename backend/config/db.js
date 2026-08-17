const mongoose = require("mongoose");

// Disable mongoose buffering
mongoose.set("bufferCommands", false);

const connectDB = async () => {
  try {
    console.log("🔍 Connecting to MongoDB Atlas...");
    console.log("📍 Database: careeriq");
    console.log("🌐 Cluster: careeriq-cluster.x1ifxl0.mongodb.net");
    
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4,
      maxPoolSize: 10,
      autoIndex: process.env.NODE_ENV !== 'production', // Build indexes in dev, manual in prod
    });
    
    console.log("✅ MongoDB Atlas Connected Successfully!");
    console.log(`📍 Database: ${conn.connection.name}`);
    console.log(`🌐 Host: ${conn.connection.host}`);
    console.log(`🔌 Port: ${conn.connection.port}`);
    console.log(`📊 Ready State: Connected`);
    
    // Verify connection
    await conn.connection.db.admin().ping();
    console.log("✅ Database ping successful");
    
    // Test write operation
    const testCollection = conn.connection.db.collection('connection_test');
    await testCollection.insertOne({ 
      connected: true, 
      timestamp: new Date(),
      server: "CareerIQ Backend"
    });
    await testCollection.deleteMany({ connected: true });
    console.log("✅ Database operations verified");
    
    // Connection Events
    mongoose.connection.on('error', err => {
      console.error('❌ Mongoose connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️ Mongoose disconnected from Atlas');
    });

    // Graceful Shutdown Mechanism
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('🛑 Mongoose connection closed due to app termination (SIGINT)');
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      await mongoose.connection.close();
      console.log('🛑 Mongoose connection closed due to app termination (SIGTERM)');
      process.exit(0);
    });

    return conn;
    
  } catch (error) {
    console.error("\n❌ MongoDB Connection Failed");
    console.error("=====================================");
    console.error("🔍 Error Type:", error.name);
    console.error("📋 Error Message:", error.message);
    
    if (error.name === 'MongooseServerSelectionError') {
      console.error("\n🚨 MONGODB ATLAS IP WHITELIST ISSUE");
      console.error("🔧 SOLUTION:");
      console.error("1. Go to: https://cloud.mongodb.com/");
      console.error("2. Click: Network Access → IP Whitelist");
      console.error("3. Click: Add IP Address → Add Current IP");
      console.error("4. Save and wait 2-3 minutes");
    }
    
    // In serverless environments, never call process.exit() — it crashes the
    // entire function instance and causes ALL routes (including /api/health)
    // to return 500. Throw instead so the caller can handle it gracefully.
    throw error;
  }
};

module.exports = connectDB;