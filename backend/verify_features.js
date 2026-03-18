const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function testInterviewRoutes() {
  console.log('--- Testing Interview Routes ---');
  try {
    // 1. Create a question
    console.log('Testing Create...');
    const createRes = await axios.post(`${BASE_URL}/interview`, {
      question: "TEST_QUESTION: What is the capital of France?",
      answer: "Paris",
      category: "Technical",
      difficulty: "Beginner",
      tips: "Just a test tip"
    });
    const questionId = createRes.data.data._id;
    console.log('Created ID:', questionId);

    // 2. Fetch all questions
    console.log('Testing Read...');
    const fetchRes = await axios.get(`${BASE_URL}/interview`);
    const found = fetchRes.data.data.find(q => q._id === questionId);
    console.log('Found in list:', !!found);

    // 3. Delete the question
    console.log('Testing Delete...');
    await axios.delete(`${BASE_URL}/interview/${questionId}`);
    
    // 4. Verify deletion
    const finalFetch = await axios.get(`${BASE_URL}/interview`);
    const stillExists = finalFetch.data.data.find(q => q._id === questionId);
    console.log('Deleted successfully:', !stillExists);

  } catch (err) {
    console.error('Interview Route Test Failed:', err.message);
  }
}

async function testJobRoutes() {
  console.log('\n--- Testing Job Routes ---');
  try {
    // 1. Create a job
    console.log('Testing Create...');
    const createRes = await axios.post(`${BASE_URL}/jobs`, {
      title: "TEST_JOB: AI Tester",
      company: "Google",
      location: "San Francisco",
      salary: "100k",
      jobType: "Full-time",
      skills: ["Testing", "AI"],
      description: "Test description",
      applyLink: "https://google.com"
    });
    const jobId = createRes.data.data._id;
    console.log('Created ID:', jobId);

    // 2. Fetch all jobs
    console.log('Testing Read...');
    const fetchRes = await axios.get(`${BASE_URL}/jobs`);
    const found = fetchRes.data.data.find(j => j._id === jobId);
    console.log('Found in list:', !!found);

    // 3. Delete the job
    console.log('Testing Delete...');
    await axios.delete(`${BASE_URL}/jobs/${jobId}`);
    
    // 4. Verify deletion
    const finalFetch = await axios.get(`${BASE_URL}/jobs`);
    const stillExists = finalFetch.data.data.find(j => j._id === jobId);
    console.log('Deleted successfully:', !stillExists);

  } catch (err) {
    console.error('Job Route Test Failed:', err.message);
  }
}

async function runTests() {
  console.log('Starting API Verification...');
  await testInterviewRoutes();
  await testJobRoutes();
  console.log('\nVerification Complete.');
}

runTests();
