const axios = require('axios');

async function testApi() {
  try {
    const payload = {
      title: 'Test Empty Location',
      description: 'A test description',
      date: new Date('2026-03-12T10:00:00').toISOString(),
      type: 'meeting',
      location: '', // Frontend sends empty string if unmodified
      isVirtual: false,
      isGlobal: true
    };
    console.log('Sending payload:', payload);
    const res = await axios.post('http://localhost:5000/api/events/admin/global', payload);
    console.log('Success:', res.data);
  } catch (error) {
    console.error('Error status:', error.response?.status);
    console.error('Error data:', JSON.stringify(error.response?.data, null, 2));
    console.error('Error message:', error.message);
  }
}

testApi();
