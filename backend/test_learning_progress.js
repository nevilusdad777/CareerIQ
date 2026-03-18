const axios = require('axios');

async function testApi() {
  try {
    console.log('Testing /api/analytics/learning-progress');
    // Using a random but valid looking ObjectId for userId, e.g. "65bb2c7b5b5b5b5b5b5b5b5b"
    // Or just "testuser" since Profile model can have strings
    const res = await axios.get('http://localhost:5000/api/analytics/learning-progress?userId=testuser123');
    console.log('Success:', res.data);
  } catch (error) {
    console.error('Error status:', error.response?.status);
    console.error('Error data:', error.response?.data);
    console.error('Error message:', error.message);
  }
}

testApi();
