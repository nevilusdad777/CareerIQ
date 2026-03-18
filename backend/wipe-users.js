const mongoose = require("mongoose");
const User = require("./models/User");
const UserAnalytics = require("./models/UserAnalytics");
const RoadmapProgress = require("./models/RoadmapProgress");
require('dotenv').config();

const wipeUsers = async () => {
  console.log("🧹 Starting User Database Wipe...");
  
  const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://mkaswala1311_db_user:careeriq123@careeriq-cluster.x1ifxl0.mongodb.net/careeriq?retryWrites=true&w=majority";
  
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Count before
    const countBefore = await User.countDocuments({ role: "user" });
    console.log(`📊 Found ${countBefore} non-admin users to delete.`);

    if (countBefore === 0) {
      console.log("ℹ️ No users to delete.");
    } else {
      // Find user IDs to delete analytics and roadmap too
      const usersToDelete = await User.find({ role: "user" }).select("_id");
      const userIds = usersToDelete.map(u => u._id);

      // Perform deletions
      const userResult = await User.deleteMany({ _id: { $in: userIds } });
      const analyticsResult = await UserAnalytics.deleteMany({ userId: { $in: userIds } });
      const roadmapResult = await RoadmapProgress.deleteMany({ userId: { $in: userIds } });

      console.log(`✅ Successfully deleted ${userResult.deletedCount} users.`);
      console.log(`✅ Successfully deleted ${analyticsResult.deletedCount} analytics records.`);
      console.log(`✅ Successfully deleted ${roadmapResult.deletedCount} roadmap progress records.`);
    }

    const adminCount = await User.countDocuments({ role: "admin" });
    console.log(`🛡️  Admin users remaining: ${adminCount}`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Error during wipe:", error);
    process.exit(1);
  }
};

wipeUsers();
