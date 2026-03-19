const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");

dotenv.config();

async function checkAvailableModels() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  
  console.log("Testing different model formats...");
  
  // Test various model name formats that might work
  const modelNames = [
    "gemini-1.5-flash",
    "gemini-1.5-flash-001", 
    "gemini-1.5-pro",
    "gemini-1.5-pro-001",
    "gemini-pro-latest",
    "gemini-pro-vision",
    "text-bison-001",
    "chat-bison-001"
  ];
  
  for (const modelName of modelNames) {
    try {
      console.log(`Testing ${modelName}...`);
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent("Hello");
      const response = await result.response;
      console.log(`✅ ${modelName} - SUCCESS`);
      console.log(`Response: ${response.text().substring(0, 100)}...`);
    } catch (error) {
      console.log(`❌ ${modelName} - FAILED: ${error.message}`);
    }
    console.log("---");
  }
}

checkAvailableModels();
