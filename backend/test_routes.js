const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';
const userId = '69b9053fe64ac9d792af6231';

const endpoints = [
  `/analytics/dashboard-stats/${userId}`,
  `/analytics/my-dashboard?userId=${userId}`,
  `/analytics/user-stats?userId=${userId}`,
  `/analytics/learning-activity?userId=${userId}`,
  `/analytics/achievements?userId=${userId}`,
  `/analytics/learning-progress?userId=${userId}`,
  `/analytics/${userId}`,
  `/skillgap/status`,
  `/skillgap/questions`
];

async function testRoutes() {
  console.log('--- Testing Routes ---');
  for (const endpoint of endpoints) {
    try {
      const response = await axios.get(`${BASE_URL}${endpoint}`);
      console.log(`✅ [${endpoint}] Status: ${response.status}`);
    } catch (error) {
      if (error.response) {
        if (error.response.status === 404) {
          console.log(`❌ [${endpoint}] Status: 404 (FAILED)`);
        } else {
          // 401/403 are expected for routes requiring auth if we don't provide a token
          console.log(`⚠️  [${endpoint}] Status: ${error.response.status} (Not 404, likely OK if auth required)`);
        }
      } else {
        console.log(`❌ [${endpoint}] Error: ${error.message}`);
      }
    }
  }
}

testRoutes();
