const mongoose = require("mongoose");

// Test MongoDB Atlas connection independently
const testMongoConnection = async () => {
  console.log("🧪 MongoDB Atlas Connection Test");
  console.log("================================");
  
  // Your current MONGO_URI (masked for security)
  const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://mkaswala1311_db_user:careeriq123@careeriq-cluster.x1ifxl0.mongodb.net/careeriq?retryWrites=true&w=majority";
  
  console.log("📍 Testing URI:", MONGO_URI.replace(/:([^:@]+)@/, ':***@'));
  
  try {
    console.log("\n🔍 Step 1: Testing basic connection...");
    
    const conn = await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4,
      bufferMaxEntries: 0,
      bufferCommands: false
    });
    
    console.log("✅ Step 1: Basic connection successful");
    
    console.log("\n🔍 Step 2: Testing database access...");
    console.log(`📍 Database: ${conn.connection.name}`);
    console.log(`🌐 Host: ${conn.connection.host}`);
    console.log(`🔌 Port: ${conn.connection.port}`);
    
    console.log("\n🔍 Step 3: Testing admin ping...");
    await conn.connection.db.admin().ping();
    console.log("✅ Step 3: Admin ping successful");
    
    console.log("\n🔍 Step 4: Testing database operations...");
    const testCollection = conn.connection.db.collection('test');
    await testCollection.insertOne({ test: 'connection', timestamp: new Date() });
    console.log("✅ Step 4: Write operation successful");
    
    await testCollection.deleteMany({ test: 'connection' });
    console.log("✅ Step 4: Delete operation successful");
    
    console.log("\n🎉 ALL TESTS PASSED - MongoDB Atlas connection is working!");
    
    await mongoose.disconnect();
    console.log("🔌 Disconnected successfully");
    
  } catch (error) {
    console.error("\n❌ CONNECTION TEST FAILED");
    console.error("================================");
    console.error("🔍 Error Type:", error.name);
    console.error("📋 Error Message:", error.message);
    
    // Detailed error analysis
    if (error.name === 'MongooseServerSelectionError') {
      console.error("\n🚨 SERVER SELECTION ERROR");
      console.error("This usually means:");
      console.error("1. IP not whitelisted in MongoDB Atlas");
      console.error("2. Cluster is paused/suspended");
      console.error("3. Network connectivity issues");
      console.error("4. DNS resolution problems");
      
      console.error("\n🔧 QUICK FIXES:");
      console.error("• Add your IP to Atlas whitelist: https://cloud.mongodb.com/");
      console.error("• Check cluster status in Atlas dashboard");
      console.error("• Try different network (mobile hotspot)");
      console.error("• Disable VPN/firewall temporarily");
    }
    
    if (error.message.includes('Authentication failed')) {
      console.error("\n🚨 AUTHENTICATION ERROR");
      console.error("This usually means:");
      console.error("1. Wrong username/password");
      console.error("2. User doesn't exist");
      console.error("3. User lacks database permissions");
      
      console.error("\n🔧 QUICK FIXES:");
      console.error("• Verify credentials in .env file");
      console.error("• Check user exists in Atlas dashboard");
      console.error("• Ensure user has read/write permissions");
    }
    
    process.exit(1);
  }
};

// Load environment variables
require('dotenv').config();

// Run the test
testMongoConnection();
