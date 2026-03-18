const mongoose = require('mongoose');
const Skill = require('../models/Skill');
const Question = require('../models/Question');
require('dotenv').config();

const skills = [
  { name: 'JavaScript', description: 'Core programming language for the web' },
  { name: 'React', description: 'Popular frontend library for building UI' },
  { name: 'Node.js', description: 'JavaScript runtime for backend development' },
  { name: 'Python', description: 'Versatile language for AI, data science, and web' },
  { name: 'Java', description: 'Robust enterprise-level programming language' },
  { name: 'SQL', description: 'Language for managing relational databases' },
  { name: 'MongoDB', description: 'Popular NoSQL document database' },
  { name: 'Docker', description: 'Platform for containerizing applications' },
  { name: 'AWS', description: 'Leading cloud computing platform' },
  { name: 'Git', description: 'Distributed version control system' },
  { name: 'System Design', description: 'Design of scalable computer systems' },
  { name: 'Communication', description: 'Essential soft skill for professional success' }
];

const questions = [
  // 1. JavaScript
  { questionText: "What is the result of '2' + 2 in JavaScript?", options: [{ text: "'22'", weight: 5 }, { text: "4", weight: 1 }, { text: "NaN", weight: 1 }, { text: "TypeError", weight: 1 }], category: "JavaScript", difficulty: "beginner", explanation: "JavaScript performs string concatenation when one of the operands is a string." },
  { questionText: "Which of the following is not a primitive data type in JavaScript?", options: [{ text: "Boolean", weight: 1 }, { text: "Number", weight: 1 }, { text: "String", weight: 1 }, { text: "Object", weight: 5 }], category: "JavaScript", difficulty: "beginner", explanation: "Objects are reference types, not primitive types." },
  { questionText: "What does the 'typeof' operator return for 'null'?", options: [{ text: "'null'", weight: 1 }, { text: "'undefined'", weight: 1 }, { text: "'object'", weight: 5 }, { text: "'primitive'", weight: 1 }], category: "JavaScript", difficulty: "intermediate", explanation: "Historically, 'typeof null' returns 'object' in JavaScript." },

  // 2. React
  { questionText: "Which hook is used for side effects in React?", options: [{ text: "useState", weight: 1 }, { text: "useContext", weight: 1 }, { text: "useEffect", weight: 5 }, { text: "useReducer", weight: 1 }], category: "React", difficulty: "beginner", explanation: "useEffect is the standard hook for handling side effects like data fetching or DOM manipulation." },
  { questionText: "What is the purpose of React Fragments?", options: [{ text: "To create a new DOM element", weight: 1 }, { text: "To group elements without adding extra nodes to the DOM", weight: 5 }, { text: "To improve React performance", weight: 1 }, { text: "To handle state", weight: 1 }], category: "React", difficulty: "beginner", explanation: "Fragments allow grouping of children without adding extra nodes to the DOM." },
  { questionText: "How do you pass data from a parent component to a child in React?", options: [{ text: "Using state", weight: 1 }, { text: "Using props", weight: 5 }, { text: "Using Context", weight: 1 }, { text: "Using refs", weight: 1 }], category: "React", difficulty: "beginner", explanation: "Props are the standard way to pass data down the component tree." },

  // 3. Node.js
  { questionText: "Which core module is used for handling file paths in Node.js?", options: [{ text: "fs", weight: 1 }, { text: "path", weight: 5 }, { text: "http", weight: 1 }, { text: "os", weight: 1 }], category: "Node.js", difficulty: "beginner", explanation: "The 'path' module provides utilities for working with file and directory paths." },
  { questionText: "What is the default package manager for Node.js?", options: [{ text: "yarn", weight: 1 }, { text: "pnpm", weight: 1 }, { text: "npm", weight: 5 }, { text: "composer", weight: 1 }], category: "Node.js", difficulty: "beginner", explanation: "npm (Node Package Manager) is bundled with Node.js by default." },
  { questionText: "Which of the following describes the Node.js event loop?", options: [{ text: "Multi-threaded blocking", weight: 1 }, { text: "Single-threaded non-blocking", weight: 5 }, { text: "Single-threaded blocking", weight: 1 }, { text: "Multi-threaded non-blocking", weight: 1 }], category: "Node.js", difficulty: "intermediate", explanation: "Node.js uses an event-driven, non-blocking I/O model." },

  // 4. Python
  { questionText: "Which data type is used to store multiple items in a single variable in Python?", options: [{ text: "list", weight: 5 }, { text: "int", weight: 1 }, { text: "float", weight: 1 }, { text: "bool", weight: 1 }], category: "Python", difficulty: "beginner", explanation: "Lists are used to store collections of items." },
  { questionText: "How do you start a comment in Python?", options: [{ text: "//", weight: 1 }, { text: "/*", weight: 1 }, { text: "#", weight: 5 }, { text: "--", weight: 1 }], category: "Python", difficulty: "beginner", explanation: "The '#' symbol is used for single-line comments in Python." },
  { questionText: "What is the correct way to define a function in Python?", options: [{ text: "func my_function():", weight: 1 }, { text: "def my_function():", weight: 5 }, { text: "function my_function():", weight: 1 }, { text: "void my_function():", weight: 1 }], category: "Python", difficulty: "beginner", explanation: "The 'def' keyword is used to start a function definition." },

  // 5. Java
  { questionText: "Which keyword is used to inherit a class in Java?", options: [{ text: "implements", weight: 1 }, { text: "extends", weight: 5 }, { text: "inherits", weight: 1 }, { text: "using", weight: 1 }], category: "Java", difficulty: "beginner", explanation: "The 'extends' keyword is used for class inheritance." },
  { questionText: "What is the entry point of a Java application?", options: [{ text: "start()", weight: 1 }, { text: "init()", weight: 1 }, { text: "main()", weight: 5 }, { text: "run()", weight: 1 }], category: "Java", difficulty: "beginner", explanation: "The 'public static void main(String[] args)' method is the entry point." },
  { questionText: "Which Java collection allows storing key-value pairs?", options: [{ text: "ArrayList", weight: 1 }, { text: "HashSet", weight: 1 }, { text: "HashMap", weight: 5 }, { text: "LinkedList", weight: 1 }], category: "Java", difficulty: "beginner", explanation: "HashMap implements the Map interface and stores entries as key-value pairs." },

  // 6. SQL
  { questionText: "What does SQL stand for?", options: [{ text: "Structured Query Language", weight: 5 }, { text: "Stylish Question Language", weight: 1 }, { text: "Statement Query Logic", weight: 1 }, { text: "Standard Query List", weight: 1 }], category: "SQL", difficulty: "beginner", explanation: "SQL is the standard language for dealing with Relational Databases." },
  { questionText: "Which SQL clause is used to filter records?", options: [{ text: "GROUP BY", weight: 1 }, { text: "ORDER BY", weight: 1 }, { text: "WHERE", weight: 5 }, { text: "HAVING", weight: 1 }], category: "SQL", difficulty: "beginner", explanation: "The WHERE clause is used to filter records based on a specified condition." },
  { questionText: "Which command is used to remove all records from a table without deleting the table structure?", options: [{ text: "DELETE", weight: 1 }, { text: "DROP", weight: 1 }, { text: "TRUNCATE", weight: 5 }, { text: "REMOVE", weight: 1 }], category: "SQL", difficulty: "beginner", explanation: "TRUNCATE removes all rows from a table, but the table structure remains." },

  // 7. MongoDB
  { questionText: "What format does MongoDB use to store data?", options: [{ text: "XML", weight: 1 }, { text: "JSON", weight: 1 }, { text: "BSON", weight: 5 }, { text: "CSV", weight: 1 }], category: "MongoDB", difficulty: "beginner", explanation: "MongoDB stores data in Binary JSON (BSON) format." },
  { questionText: "Which command is used to insert a document in MongoDB?", options: [{ text: "db.collection.add()", weight: 1 }, { text: "db.collection.insert()", weight: 5 }, { text: "db.collection.save()", weight: 1 }, { text: "db.collection.put()", weight: 1 }], category: "MongoDB", difficulty: "beginner", explanation: "The insert() or insertOne() methods are used to add documents." },
  { questionText: "What is a 'collection' in MongoDB equivalent to in SQL?", options: [{ text: "Database", weight: 1 }, { text: "Row", weight: 1 }, { text: "Table", weight: 5 }, { text: "Column", weight: 1 }], category: "MongoDB", difficulty: "beginner", explanation: "A collection in NoSQL is analogous to a table in relational databases." },

  // 8. Docker
  { questionText: "What is a Docker container?", options: [{ text: "A virtual machine", weight: 1 }, { text: "A lightweight, standalone, executable package", weight: 5 }, { text: "A physical server", weight: 1 }, { text: "A code repository", weight: 1 }], category: "Docker", difficulty: "beginner", explanation: "Docker containers wrap up software in a complete filesystem that contains everything it needs to run." },
  { questionText: "Which file is used to define the instructions for building a Docker image?", options: [{ text: "docker.config", weight: 1 }, { text: "Dockerfile", weight: 5 }, { text: "docker-compose.yml", weight: 1 }, { text: "image.spec", weight: 1 }], category: "Docker", difficulty: "beginner", explanation: "A Dockerfile is a text document that contains all the commands a user could call on the command line to assemble an image." },
  { questionText: "What command is used to run a Docker container?", options: [{ text: "docker run", weight: 5 }, { text: "docker start", weight: 1 }, { text: "docker build", weight: 1 }, { text: "docker up", weight: 1 }], category: "Docker", difficulty: "beginner", explanation: "The 'docker run' command creates and starts a container." },

  // 9. AWS
  { questionText: "What does EC2 stand for in AWS?", options: [{ text: "Elastic Cloud Compute", weight: 5 }, { text: "Easy Computer Center", weight: 1 }, { text: "Electronic Cloud 2", weight: 1 }, { text: "Elastic Cloud Connection", weight: 1 }], category: "AWS", difficulty: "beginner", explanation: "Amazon Elastic Compute Cloud (EC2) provides scalable computing capacity." },
  { questionText: "Which AWS service is used for storage?", options: [{ text: "RDS", weight: 1 }, { text: "S3", weight: 5 }, { text: "Lambda", weight: 1 }, { text: "CloudFront", weight: 1 }], category: "AWS", difficulty: "beginner", explanation: "Amazon S3 (Simple Storage Service) is an object storage service." },
  { questionText: "What is AWS Lambda?", options: [{ text: "A database service", weight: 1 }, { text: "A serverless computing service", weight: 5 }, { text: "A CDN service", weight: 1 }, { text: "A container orchestration service", weight: 1 }], category: "AWS", difficulty: "beginner", explanation: "AWS Lambda lets you run code without provisioning or managing servers." },

  // 10. Git
  { questionText: "What command is used to copy a repository from a remote source?", options: [{ text: "git copy", weight: 1 }, { text: "git clone", weight: 5 }, { text: "git fork", weight: 1 }, { text: "git pull", weight: 1 }], category: "Git", difficulty: "beginner", explanation: "git clone is used to create a local copy of a remote repository." },
  { questionText: "How do you stage all changes for a commit?", options: [{ text: "git commit -a", weight: 1 }, { text: "git add .", weight: 5 }, { text: "git stage all", weight: 1 }, { text: "git prepare", weight: 1 }], category: "Git", difficulty: "beginner", explanation: "The '.' wildcard adds all modified files to the staging area." },
  { questionText: "Which command shows the commit history?", options: [{ text: "git status", weight: 1 }, { text: "git list", weight: 1 }, { text: "git log", weight: 5 }, { text: "git show", weight: 1 }], category: "Git", difficulty: "beginner", explanation: "git log displays the history of commits in the current branch." },

  // 11. System Design
  { questionText: "What is horizontal scaling?", options: [{ text: "Adding more power to an existing server", weight: 1 }, { text: "Adding more servers to the pool", weight: 5 }, { text: "Optimizing code performance", weight: 1 }, { text: "Using a faster database", weight: 1 }], category: "System Design", difficulty: "intermediate", explanation: "Horizontal scaling means scaling by adding more machines into your pool of resources." },
  { questionText: "What is a Load Balancer?", options: [{ text: "A tool to monitor traffic", weight: 1 }, { text: "A device that distributes network traffic across multiple servers", weight: 5 }, { text: "A database backup system", weight: 1 }, { text: "A compiler optimization", weight: 1 }], category: "System Design", difficulty: "beginner", explanation: "Load balancers distribute incoming traffic to prevent any single server from becoming overwhelmed." },
  { questionText: "What is latency?", options: [{ text: "The amount of data transferred per second", weight: 1 }, { text: "The time it takes for data to travel from source to destination", weight: 5 }, { text: "The number of concurrent users", weight: 1 }, { text: "The storage capacity of a server", weight: 1 }], category: "System Design", difficulty: "beginner", explanation: "Latency is the delay before a transfer of data begins following an instruction for its transfer." },

  // 12. Communication
  { questionText: "What is active listening?", options: [{ text: "Listening while doing something else", weight: 1 }, { text: "Fully concentrating on what is being said", weight: 5 }, { text: "Wait for your turn to speak", weight: 1 }, { text: "Recording a conversation", weight: 1 }], category: "Communication", difficulty: "beginner", explanation: "Active listening involves fully engaging with the speaker both verbally and non-verbally." },
  { questionText: "Which of the following is a key element of effective communication?", options: [{ text: "Clarity", weight: 5 }, { text: "Complexity", weight: 1 }, { text: "Length", weight: 1 }, { text: "Volume", weight: 1 }], category: "Communication", difficulty: "beginner", explanation: "Clear and concise messaging is essential for ensuring the audience understands the intent." },
  { questionText: "What is non-verbal communication?", options: [{ text: "Written emails", weight: 1 }, { text: "Spoken words", weight: 1 }, { text: "Body language and facial expressions", weight: 5 }, { text: "Formal reports", weight: 1 }], category: "Communication", difficulty: "beginner", explanation: "Non-verbal communication includes gestures, posture, and facial expressions." }
];

async function seed() {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/careeriq';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Clear existing (optional, but good for clean seed)
    // await Skill.deleteMany({});
    // await Question.deleteMany({});

    for (const skillData of skills) {
      await Skill.findOneAndUpdate(
        { name: skillData.name },
        skillData,
        { upsert: true, new: true }
      );
    }
    console.log('Skills seeded successfully');

    for (const q of questions) {
      await Question.findOneAndUpdate(
        { questionText: q.questionText },
        q,
        { upsert: true, new: true }
      );
    }
    console.log('Questions seeded successfully');

    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
}

seed();
