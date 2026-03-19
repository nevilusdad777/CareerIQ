const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");

dotenv.config();

async function testAlternativeModels() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  
  // Try different model versions that might have separate quotas
  const models = [
    "gemini-pro",
    "gemini-1.0-pro",
    "gemini-1.5-pro",
    "gemini-1.5-flash",
    "gemini-pro-vision"
  ];
  
  for (const modelName of models) {
    try {
      console.log(`\n🧪 Testing ${modelName}...`);
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent("Hello");
      const response = await result.response;
      console.log(`✅ ${modelName} SUCCESS!`);
      console.log(`Response: ${response.text().substring(0, 100)}...`);
      return modelName; // Return the first working model
    } catch (error) {
      if (error.message.includes("quota")) {
        console.log(`❌ ${modelName} - QUOTA EXCEEDED`);
      } else if (error.message.includes("404")) {
        console.log(`❌ ${modelName} - NOT FOUND`);
      } else {
        console.log(`❌ ${modelName} - ERROR: ${error.message}`);
      }
    }
  }
  
  console.log("\n❌ No working models found. All have quota or availability issues.");
}

testAlternativeModels();
