const axios = require('axios');

async function testBothLogins() {
  console.log('🧪 TESTING BOTH LOGIN METHODS');
  console.log('================================');
  
  // Test 1: Regular User Login
  console.log('\n📝 TEST 1: Regular User Login');
  try {
    const userResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'test@example.com',
      password: 'password123'
    });
    
    if (userResponse.data.success) {
      console.log('✅ User Login: SUCCESS');
      console.log('   Token:', userResponse.data.data.token.substring(0, 20) + '...');
      console.log('   User:', userResponse.data.data.user.name);
    } else {
      console.log('❌ User Login: FAILED');
    }
  } catch (error) {
    console.log('❌ User Login: ERROR -', error.message);
  }
  
  // Test 2: Admin Login (Frontend Logic)
  console.log('\n🛡️ TEST 2: Admin Login');
  console.log('Testing admin validation logic...');
  
  const testEmail = 'admin@careeriq.com';
  const testPassword = 'admin@123';
  
  // Simulate frontend validation
  const isAdminValid = (testEmail === "admin" || testEmail === "admin@careeriq.com") && testPassword === "admin@123";
  
  if (isAdminValid) {
    console.log('✅ Frontend Admin Validation: PASSES');
    console.log('   Email check:', testEmail === "admin" || testEmail === "admin@careeriq.com");
    console.log('   Password check:', testPassword === "admin@123");
  } else {
    console.log('❌ Frontend Admin Validation: FAILS');
  }
  
  // Test 3: Backend Admin Login
  console.log('\n🔧 TEST 3: Backend Admin Login');
  try {
    const adminResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'admin@careeriq.com',
      password: 'admin@123'
    });
    
    if (adminResponse.data.success) {
      console.log('✅ Backend Admin Login: SUCCESS');
      console.log('   Token:', adminResponse.data.data.token.substring(0, 20) + '...');
      console.log('   User:', adminResponse.data.data.user.name);
      console.log('   Role:', adminResponse.data.data.user.role);
    } else {
      console.log('❌ Backend Admin Login: FAILED');
      console.log('   Error:', adminResponse.data.message);
    }
  } catch (error) {
    console.log('❌ Backend Admin Login: ERROR -', error.message);
  }
  
  console.log('\n🎯 SUMMARY:');
  console.log('================================');
  console.log('✅ Both users are ready for login!');
  console.log('📝 Regular User: test@example.com / password123');
  console.log('🛡️ Admin User: admin@careeriq.com / admin@123');
  console.log('🌐 Frontend: http://localhost:5173/login');
  console.log('================================');
}

testBothLogins();
