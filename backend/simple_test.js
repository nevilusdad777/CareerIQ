const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");

dotenv.config();

async function simpleTest() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  
  try {
    console.log("Testing gemini-pro-latest with new API key...");
    const model = genAI.getGenerativeModel({ model: "gemini-pro-latest" });
    const result = await model.generateContent("Hello, can you respond with a simple greeting?");
    const response = await result.response;
    console.log("✅ SUCCESS!");
    console.log("Response:", response.text());
  } catch (error) {
    console.log("❌ FAILED:");
    console.log(error.message);
    
    if (error.message.includes("quota")) {
      console.log("\n💡 QUOTA ISSUE DETECTED");
      console.log("Please enable billing in Google Cloud Console or wait for quota reset.");
    }
  }
}

simpleTest();
