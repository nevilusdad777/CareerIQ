const axios = require('axios');

async function testUserLogin() {
  try {
    console.log('Testing user login with test@example.com...');
    
    const loginData = {
      email: 'test@example.com',
      password: 'password123'
    };
    
    console.log('Sending login request:', loginData);
    
    const response = await axios.post('http://localhost:5000/api/auth/login', loginData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Login Response:', response.data);
    console.log('Status:', response.status);
    
    if (response.data.success) {
      console.log('✅ USER LOGIN SUCCESSFUL!');
      console.log('Token:', response.data.data.token);
      console.log('User:', response.data.data.user);
      console.log('\n🎯 You can now login with:');
      console.log('Email: test@example.com');
      console.log('Password: password123');
    }
    
  } catch (error) {
    console.error('Login Error:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

testUserLogin();
