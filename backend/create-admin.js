const axios = require('axios');

async function createAdminUser() {
  try {
    console.log('Creating admin user...');
    
    const adminData = {
      name: 'Admin User',
      email: 'admin@careeriq.com',
      password: 'admin@123'
    };
    
    console.log('Sending admin registration request:', adminData);
    
    const response = await axios.post('http://localhost:5000/api/auth/register', adminData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Admin Registration Response:', response.data);
    console.log('Status:', response.status);
    
    if (response.data.success) {
      console.log('✅ Admin user created successfully!');
      // Now test admin login
      await testAdminLogin();
    }
    
  } catch (error) {
    console.error('Admin Registration Error:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

async function testAdminLogin() {
  try {
    console.log('\nTesting admin login...');
    
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
      console.log('\n🎯 ADMIN LOGIN CREDENTIALS:');
      console.log('Email: admin@careeriq.com');
      console.log('Password: admin@123');
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

createAdminUser();
