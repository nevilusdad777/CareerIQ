const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '.env') });

async function reproduce() {
  try {
    console.log('--- Repro Start ---');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB');

    const User = require('./models/User');
    const user = await User.findOne({ email: 'admin@careeriq.com' });
    if (!user) {
      console.error('User admin@careeriq.com not found. Please register it first.');
      process.exit(1);
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role || 'user' },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '1h' }
    );

    console.log('Generated Token:', token.substring(0, 20) + '...');

    const Question = require('./models/Question');
    const questions = await Question.aggregate([{ $sample: { size: 12 } }]);
    
    const answers = questions.map(q => ({
      questionId: q._id.toString(),
      selectedOptionIndex: 0
    }));

    console.log('Sending submission...');
    try {
      const response = await axios.post('http://localhost:5000/api/skillgap/submit', { answers }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log('✅ Success:', response.data.success);
    } catch (apiErr) {
      console.error('❌ API Error Status:', apiErr.response?.status);
      console.error('❌ API Error Data:', JSON.stringify(apiErr.response?.data, null, 2));
    }

    process.exit(0);
  } catch (err) {
    console.error('Reproduction failed:', err);
    process.exit(1);
  }
}

reproduce();
