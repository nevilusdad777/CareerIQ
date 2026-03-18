const axios = require('axios');

async function testAdminLogin() {
  try {
    console.log('Testing admin login...');
    
    // First, let's check if admin user exists in database
    console.log('Step 1: Checking if admin user exists...');
    
    const loginData = {
      email: 'admin@careeriq.com',
      password: 'admin@123'
    };
    
    console.log('Sending admin login request:', loginData);
    
    const response = await axios.post('http://localhost:5000/api/auth/login', loginData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Admin Login Response:', response.data);
    console.log('Status:', response.status);
    
    if (response.data.success) {
      console.log('✅ ADMIN LOGIN SUCCESSFUL!');
      console.log('Token:', response.data.data.token);
      console.log('User:', response.data.data.user);
    } else {
      console.log('❌ Admin login failed:', response.data.message);
    }
    
  } catch (error) {
    console.error('Admin Login Error:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

testAdminLogin();
