const axios = require('axios');

async function testSkillGap() {
  try {
    const response = await axios.post('http://localhost:5000/api/analytics/skill-gap', {
      userId: '507f1f1f1f1f1f1f1f1',
      answers: [true, false, true, false, true, false, true, false, true, false, true, false, true, false]
    });
    
    console.log('Response:', response.data);
    console.log('Status:', response.status);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testSkillGap();
