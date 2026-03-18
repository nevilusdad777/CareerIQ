const mongoose = require('mongoose');
const Question = require('../models/Question');
require('dotenv').config();

const questions = [
  {
    questionText: "What is the time complexity of binary search algorithm?",
    options: [
      { text: "O(n)", weight: 1 },
      { text: "O(log n)", weight: 5 },
      { text: "O(n²)", weight: 1 },
      { text: "O(1)", weight: 2 }
    ],
    category: "Programming Logic",
    difficulty: "intermediate"
  },
  {
    questionText: "Which data structure would be best for implementing a priority queue?",
    options: [
      { text: "Array", weight: 2 },
      { text: "Linked List", weight: 5 },
      { text: "Heap", weight: 1 },
      { text: "Binary Search Tree", weight: 2 }
    ],
    category: "Data Structures",
    difficulty: "intermediate"
  },
  {
    questionText: "What is the purpose of the Same-Origin Policy in web browsers?",
    options: [
      { text: "Prevent CSRF attacks", weight: 5 },
      { text: "Allow cross-origin requests", weight: 1 },
      { text: "Block malicious scripts", weight: 2 },
      { text: "Control cookie access", weight: 1 }
    ],
    category: "Web Development",
    difficulty: "intermediate"
  },
  {
    questionText: "What is database normalization?",
    options: [
      { text: "Eliminate data redundancy", weight: 5 },
      { text: "Ensure data integrity", weight: 1 },
      { text: "Organize data efficiently", weight: 2 },
      { text: "Reduce anomalies", weight: 1 }
    ],
    category: "Backend Knowledge",
    difficulty: "intermediate"
  },
  {
    questionText: "What is the difference between debugging and testing?",
    options: [
      { text: "Debugging finds defects", weight: 5 },
      { text: "Testing validates functionality", weight: 1 },
      { text: "Debugging is reactive", weight: 2 },
      { text: "Testing is proactive", weight: 1 }
    ],
    category: "Debugging",
    difficulty: "intermediate"
  },
  {
    questionText: "What is the primary goal of information security?",
    options: [
      { text: "Confidentiality", weight: 5 },
      { text: "Integrity", weight: 1 },
      { text: "Availability", weight: 2 },
      { text: "Authentication", weight: 1 }
    ],
    category: "Security Basics",
    difficulty: "intermediate"
  },
  {
    questionText: "What is the most important aspect of effective technical communication?",
    options: [
      { text: "Clarity and conciseness", weight: 5 },
      { text: "Active listening", weight: 1 },
      { text: "Proper documentation", weight: 2 },
      { text: "Appropriate technical level", weight: 1 }
    ],
    category: "Communication",
    difficulty: "intermediate"
  },
  {
    questionText: "What is the primary goal of system design?",
    options: [
      { text: "Scalability", weight: 5 },
      { text: "Reliability", weight: 1 },
      { text: "Performance", weight: 2 },
      { text: "Maintainability", weight: 1 }
    ],
    category: "System Design",
    difficulty: "intermediate"
  },
  {
    questionText: "How would you optimize a recursive function that causes stack overflow?",
    options: [
      { text: "Add more memory", weight: 1 },
      { text: "Convert to iterative", weight: 5 },
      { text: "Use setTimeout", weight: 2 },
      { text: "Ignore the error", weight: 1 }
    ],
    category: "Programming Logic",
    difficulty: "advanced"
  },
  {
    questionText: "What is the main advantage of a B-tree over a binary search tree?",
    options: [
      { text: "Better disk I/O", weight: 2 },
      { text: "Faster range queries", weight: 5 },
      { text: "Self-balancing", weight: 1 },
      { text: "Reduced height", weight: 2 }
    ],
    category: "Data Structures",
    difficulty: "advanced"
  },
  {
    questionText: "How do you prevent XSS attacks in web applications?",
    options: [
      { text: "Input validation", weight: 5 },
      { text: "Output encoding", weight: 1 },
      { text: "Content Security Policy", weight: 2 },
      { text: "Sanitize user input", weight: 1 }
    ],
    category: "Web Development",
    difficulty: "advanced"
  },
  {
    questionText: "When should you use NoSQL vs SQL databases?",
    options: [
      { text: "Flexible schema", weight: 5 },
      { text: "Horizontal scaling", weight: 1 },
      { text: "Unstructured data", weight: 2 },
      { text: "Complex queries", weight: 1 }
    ],
    category: "Backend Knowledge",
    difficulty: "advanced"
  },
  {
    questionText: "Which tool would you use for debugging memory leaks in JavaScript?",
    options: [
      { text: "Chrome DevTools", weight: 5 },
      { text: "Memory profiler", weight: 1 },
      { text: "Heap snapshot", weight: 2 },
      { text: "Performance monitoring", weight: 1 }
    ],
    category: "Debugging",
    difficulty: "advanced"
  },
  {
    questionText: "What is the most secure way to store passwords?",
    options: [
      { text: "Hashing with salt", weight: 5 },
      { text: "Bcrypt", weight: 1 },
      { text: "PBKDF2", weight: 2 },
      { text: "Plain text", weight: 1 }
    ],
    category: "Security Basics",
    difficulty: "advanced"
  },
  {
    questionText: "How do you effectively communicate technical concepts to non-technical stakeholders?",
    options: [
      { text: "Use analogies", weight: 5 },
      { text: "Visual aids", weight: 1 },
      { text: "Executive summaries", weight: 2 },
      { text: "Interactive demos", weight: 1 }
    ],
    category: "Communication",
    difficulty: "advanced"
  },
  {
    questionText: "What is the difference between monolithic and microservices architecture?",
    options: [
      { text: "Single deployment unit", weight: 5 },
      { text: "Independent scaling", weight: 1 },
      { text: "Technology diversity", weight: 2 },
      { text: "Team coordination", weight: 1 }
    ],
    category: "System Design",
    difficulty: "advanced"
  }
];

async function seedQuestions() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    
    // Clear existing questions
    await Question.deleteMany({});
    console.log('Cleared existing questions');
    
    // Insert new questions
    await Question.insertMany(questions);
    console.log(`Successfully seeded ${questions.length} questions`);
    
    // Verify category counts
    const categoryCounts = {};
    questions.forEach(q => {
      categoryCounts[q.category] = (categoryCounts[q.category] || 0) + 1;
    });
    
    console.log('Questions by category:');
    Object.entries(categoryCounts).forEach(([category, count]) => {
      console.log(`  ${category}: ${count} questions`);
    });
    
    await mongoose.disconnect();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error seeding questions:', error);
  } finally {
    process.exit(0);
  }
}

seedQuestions();
