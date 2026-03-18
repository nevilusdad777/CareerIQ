const mongoose = require('mongoose');
require('dotenv').config({ path: './Backend/.env' });

async function debugData() {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/careeriq';
    await mongoose.connect(mongoUri);
    console.log('--- DB Content Debug ---');

    const User = require('./Backend/models/User');
    const UserAnalytics = require('./Backend/models/UserAnalytics');
    const SkillAttempt = require('./Backend/models/SkillAttempt');

    const users = await User.find({}, 'name email role');
    console.log(`\nUsers (${users.length}):`);
    users.forEach(u => console.log(`- ${u.name} (${u.email}) ID: ${u._id}`));

    const analytics = await UserAnalytics.find({});
    console.log(`\nUserAnalytics (${analytics.length}):`);
    analytics.forEach(a => {
      console.log(`- UserID: ${a.userId} | Prob: ${a.placementProbability}% | Role: ${a.bestRoleMatch} | Updated: ${a.updatedAt}`);
    });

    const attempts = await SkillAttempt.find({});
    console.log(`\nSkillAttempts (${attempts.length}):`);
    attempts.forEach(att => {
      console.log(`- UserID: ${att.userId} | Score: ${att.overallScore}% | Date: ${att.createdAt}`);
    });

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

debugData();
