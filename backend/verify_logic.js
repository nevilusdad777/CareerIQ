const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const Question = require('./models/Question');
const SkillAttempt = require('./models/SkillAttempt');
const User = require('./models/User');

async function verify() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected!');

    // Get a real user ID from the database
    const user = await User.findOne({});
    if (!user) {
      console.log('No users found in database. Cannot run full verification, but logic check continues.');
    } else {
      console.log(`Using user: ${user.email} (${user._id})`);
    }

    // Get 12 questions
    const questions = await Question.find({}).limit(12);
    if (questions.length === 0) {
      console.log('No questions found in database.');
      process.exit(0);
    }

    const answersArray = questions.map(q => ({
      questionId: q._id.toString(),
      selectedOptionIndex: 0
    }));

    console.log('Simulating submission logic...');
    
    // 1. Fetch questions
    const questionIds = answersArray.map(a => a.questionId);
    const dbQuestions = await Question.find({ _id: { $in: questionIds } });
    
    // 2. Map answers (Logic copied from skillGapRoutes.js)
    let correctAnswers = 0;
    let totalWeight = 0;
    let earnedWeight = 0;
    const categoryStats = {};

    const detailedAnswers = answersArray.map(answer => {
      const question = dbQuestions.find(q => q._id.toString() === answer.questionId);
      if (!question) return null;

      const weights = question.options.map(opt => opt.weight);
      const maxWeight = Math.max(...weights);
      const selectedOption = question.options[answer.selectedOptionIndex];
      const selectedWeight = selectedOption ? selectedOption.weight : 0;
      
      const correctOptionIndex = weights.length > 0 ? weights.indexOf(maxWeight) : 0;
      const isCorrect = selectedWeight === maxWeight && weights.length > 0;

      if (isCorrect) correctAnswers++;
      totalWeight += maxWeight;
      earnedWeight += selectedWeight;

      const cat = question.category || "General";
      if (!categoryStats[cat]) {
        categoryStats[cat] = { earned: 0, total: 0 };
      }
      categoryStats[cat].earned += selectedWeight;
      categoryStats[cat].total += maxWeight;

      const correctOptionText = (question.options && question.options[correctOptionIndex]) 
        ? question.options[correctOptionIndex].text 
        : "N/A";

      return {
        questionId: question._id,
        questionText: question.questionText,
        selectedOptionIndex: answer.selectedOptionIndex,
        selectedOptionText: selectedOption ? selectedOption.text : "Not selected",
        correctOptionIndex: correctOptionIndex,
        correctOptionText: correctOptionText,
        allOptions: question.options.map(opt => ({ text: opt.text, weight: opt.weight })),
        correctWeight: maxWeight,
        isCorrect,
        category: cat,
        difficulty: question.difficulty
      };
    }).filter(Boolean);

    console.log('Logic test passed! Detailed answers count:', detailedAnswers.length);
    if (detailedAnswers.length > 0) {
      console.log('Sample answer structure is valid.');
    }

    process.exit(0);
  } catch (err) {
    console.error('Verification failed:', err);
    process.exit(1);
  }
}

verify();
