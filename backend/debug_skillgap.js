const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const Question = require('./models/Question');
const SkillAttempt = require('./models/SkillAttempt');
const UserAnalytics = require('./models/UserAnalytics');

async function debug() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected!');

    console.log('\n--- Checking Questions ---');
    const questions = await Question.find({});
    console.log(`Total questions: ${questions.length}`);

    const invalidQuestions = questions.filter(q => {
      const hasOptions = q.options && q.options.length > 0;
      const validDifficulty = ['beginner', 'intermediate', 'advanced'].includes(q.difficulty);
      return !hasOptions || !validDifficulty;
    });

    if (invalidQuestions.length > 0) {
      console.log(`Found ${invalidQuestions.length} invalid questions:`);
      invalidQuestions.forEach(q => {
        console.log(`- ID: ${q._id}, Difficulty: ${q.difficulty}, Options count: ${q.options?.length}`);
      });
    } else {
      console.log('All questions have valid difficulty and options.');
    }

    console.log('\n--- Checking SkillAttempts ---');
    const attempts = await SkillAttempt.find({});
    console.log(`Total attempts: ${attempts.length}`);
    
    // Check for potential unique index issues
    const userGroups = {};
    attempts.forEach(a => {
      if (a.status === 'completed') {
        userGroups[a.userId] = (userGroups[a.userId] || 0) + 1;
      }
    });
    
    const duplicates = Object.entries(userGroups).filter(([_, count]) => count > 1);
    if (duplicates.length > 0) {
      console.log('Found users with multiple completed attempts (should be impossible due to unique index):');
      duplicates.forEach(([userId, count]) => console.log(`- User: ${userId}, Count: ${count}`));
    } else {
      console.log('No duplicate completed attempts found.');
    }

    console.log('\n--- Checking Sample Question Structure ---');
    if (questions.length > 0) {
      const q = questions[0];
      console.log('Sample question options weights:', q.options.map(o => o.weight));
    }

    process.exit(0);
  } catch (err) {
    console.error('Debug failed:', err);
    process.exit(1);
  }
}

debug();
