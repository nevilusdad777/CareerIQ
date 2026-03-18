const axios = require('axios');

async function testLogin() {
  try {
    console.log('Testing login endpoint...');
    
    // Test with sample user data
    const testData = {
      email: 'test@example.com',
      password: 'password123'
    };
    
    console.log('Sending request with data:', testData);
    
    const response = await axios.post('http://localhost:5000/api/auth/login', testData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Login Response:', response.data);
    console.log('Status:', response.status);
    
  } catch (error) {
    console.error('Login Error:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

testLogin();
