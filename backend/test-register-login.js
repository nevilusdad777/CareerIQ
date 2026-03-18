const axios = require('axios');

async function createTestUser() {
  try {
    console.log('Creating test user...');
    
    const userData = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123'
    };
    
    console.log('Sending registration request:', userData);
    
    const response = await axios.post('http://localhost:5000/api/auth/register', userData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Registration Response:', response.data);
    console.log('Status:', response.status);
    
    // Now try to login
    await testLogin();
    
  } catch (error) {
    console.error('Registration Error:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

async function testLogin() {
  try {
    console.log('\nTesting login endpoint...');
    
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
      console.log('✅ LOGIN SUCCESSFUL!');
      console.log('Token:', response.data.data.token);
      console.log('User:', response.data.data.user);
    }
    
  } catch (error) {
    console.error('Login Error:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

createTestUser();
