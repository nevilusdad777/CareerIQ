const axios = require('axios');

// Test the data flow from admin to user
async function testDataFlow() {
  try {
    console.log('=== Current Market Intel Data ===');
    
    // Get current data
    const getResponse = await axios.get('http://localhost:5000/api/market-intel');
    console.log('Current data:', JSON.stringify(getResponse.data.data, null, 2));
    
    // Add sample skill demands if they don't exist
    const currentData = getResponse.data.data;
    const sampleSkillDemands = [
      {
        skill: "React",
        demand: "Very High",
        icon: "⚛️",
        demandPercent: 85,
        growth: "+25%"
      },
      {
        skill: "Python",
        demand: "High", 
        icon: "🐍",
        demandPercent: 75,
        growth: "+20%"
      },
      {
        skill: "AWS",
        demand: "High",
        icon: "☁️", 
        demandPercent: 70,
        growth: "+18%"
      }
    ];
    
    const sampleTrendingSkills = [
      {
        skill: "React",
        trend: "🔥 Hot",
        growth: "+25%",
        jobs: 2500
      },
      {
        skill: "TypeScript",
        trend: "📈 Rising",
        growth: "+30%", 
        jobs: 1800
      },
      {
        skill: "Docker",
        trend: "🚀 Trending",
        growth: "+22%",
        jobs: 1200
      }
    ];
    
    // Update with sample data
    const updateData = {
      ...currentData,
      skillDemands: sampleSkillDemands,
      trendingSkills: sampleTrendingSkills
    };
    
    console.log('\n=== Updating with sample data ===');
    const updateResponse = await axios.put('http://localhost:5000/api/market-intel', updateData);
    console.log('Update successful:', updateResponse.data.success);
    
    // Verify the update
    console.log('\n=== Verifying updated data ===');
    const verifyResponse = await axios.get('http://localhost:5000/api/market-intel');
    console.log('Skill Demands:', verifyResponse.data.data.skillDemands);
    console.log('Trending Skills:', verifyResponse.data.data.trendingSkills);
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testDataFlow();
