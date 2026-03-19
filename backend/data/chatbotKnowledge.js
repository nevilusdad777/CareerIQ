const KNOWLEDGE_BASE = {
  // --- GREETINGS ---
  greetings: {
    keywords: ["hello", "hi", "hey", "greetings", "good morning", "good afternoon", "morning"],
    response: "Welcome to CareerIQ. I am your dedicated Profile Consultant. How may I assist you in optimizing your career trajectory today?"
  },
  thanks: {
    keywords: ["thank", "thanks", "helpful", "appreciated"],
    response: "It is my pleasure to assist you. I am committed to your professional growth. Do you have any further inquiries regarding your career development?"
  },

  // --- CORE PLATFORM FEATURES ---
  predictor: {
    keywords: ["predictor", "chance", "placement", "probability"],
    response: "The 'CareerIQ Placement Predictor' utilizes sophisticated data modeling to evaluate your market readiness. We recommend enhancing your technical portfolio to secure a 'High' probability rating for elite roles."
  },
  roadmap: {
    keywords: ["roadmap", "mastery path", "journey", "what to learn"],
    response: "Our 'Mastery Paths' are strategic blueprints designed to align your skills with global industry standards. Each roadmap is curated to transform you from a practitioner to an industry leader."
  },
  resume_builder: {
    keywords: ["builder", "create resume", "make cv", "resume tool"],
    response: "Our 'AI Resume Architect' leverages ATS-optimized templates to ensure your profile reaches top-tier hiring managers. You can access this tool via your professional dashboard."
  },
  job_board: {
    keywords: ["job board", "find jobs", "openings", "vacancies"],
    response: "The 'Global Job Exchange' features high-impact opportunities from across the industry. We suggest using targeted filters to identify roles that align with your long-term career objectives."
  },
  skill_gap: {
    keywords: ["skill gap", "missing skills", "analysis", "what i lack"],
    response: "The 'Skill-Gap Audit' performs a rigorous comparison between your current capabilities and the requirements of your target seniority level, providing a precise learning agenda."
  },
  mock_interview: {
    keywords: ["mock", "practice interview", "live interview", "ai interviewer"],
    response: "The 'AI Interview Simulator' provides a high-stakes environment to refine your delivery. We encourage you to utilize it for mastering both technical precision and behavioral presence."
  },

  // --- JOB SEARCH & CAREER ---
  resume_tips: {
    keywords: ["resume tips", "cv advice", "quantify", "action verbs"],
    response: "To achieve elite-level resume impact, you must transcend mere task lists. Utilize specific metrics (e.g., 'Optimized query efficiency by 40%') to demonstrate tangible business value."
  },
  interview_prep: {
    keywords: ["interview tips", "prepar", "star method", "behavioral questions"],
    response: "Successful interviewing is the art of strategic storytelling. Utilize the S.T.A.R. framework (Situation, Task, Action, Result) to provide evidence-based proof of your competencies."
  },
  networking: {
    keywords: ["networking", "linkedin tips", "referrals", "connect"],
    response: "Strategic networking is the cornerstone of the modern career. Focus on building meaningful professional capital rather than transactional connections to access the hidden job market."
  },
  salary_neg: {
    keywords: ["negotiate", "salary talk", "counter offer", "pay rise"],
    response: "Salary negotiation is a critical professional skill. Always base your requests on objective market data and the unique ROI you bring to the organization."
  },
  remote_work: {
    keywords: ["remote", "work from home", "wfh", "digital nomad"],
    response: "Remote excellence is defined by disciplined autonomy and exceptional asynchronous communication. Highlight these traits as core assets when applying for global positions."
  },
  freelance: {
    keywords: ["freelance", "upwork", "fiverr", "gig economy"],
    response: "Freelancing requires a shift from an 'employee' mindset to a 'consultant' mindset. Prioritize project quality and client testimonials to build a scalable professional brand."
  },
  internships: {
    keywords: ["internship", "stipend", "trainee", "first steps"],
    response: "Internships are essential for contextualizing academic knowledge. They provide the professional seasoning required to transition seamlessly into senior-level roles."
  },

  // --- FRONTEND DEVELOPMENT ---
  javascript: {
    keywords: ["javascript", "js", "es6", "async"],
    response: "JavaScript mastery is the foundation of modern web engineering. Deep understanding of closures, prototypical inheritance, and the event loop is required for senior engineering roles."
  },
  react: {
    keywords: ["react", "hooks", "redux", "state management"],
    response: "React has redefined UI architecture. Focus on Mastering Hooks and sophisticated state management patterns to build scalable, high-performance web applications."
  },
  html_css: {
    keywords: ["html", "css", "flexbox", "grid", "responsive"],
    response: "Structural integrity starts with semantic HTML5 and sophisticated CSS3. Mastery of Flexbox and CSS Grid is essential for creating high-fidelity, responsive user interfaces."
  },
  typescript: {
    keywords: ["typescript", "ts", "static typing"],
    response: "TypeScript provides the enterprise-grade type safety required for complex codebases. It is a mandatory skill for developers aiming for top-tier engineering teams."
  },
  nextjs: {
    keywords: ["next.js", "nextjs", "ssr", "server side rendering"],
    response: "Next.js represents the pinnacle of React development, offering sophisticated Server-Side Rendering (SSR) and Static Site Generation (SSG) for SEO-conscious applications."
  },
  frontend_perf: {
    keywords: ["frontend performance", "lighthouse", "web vitals"],
    response: "Frontend performance is a critical business metric. Focus on optimizing Core Web Vitals and minimizing bundle sizes to ensure a premium user experience."
  },

  // --- BACKEND DEVELOPMENT ---
  node_js: {
    keywords: ["node", "express", "backend js", "npm"],
    response: "Node.js offers an exceptionally scalable environment for high-throughput applications. Mastery of asynchronous patterns and Express.js middleware is essential for backend architects."
  },
  python: {
    keywords: ["python", "django", "flask", "fastapi"],
    response: "Python's versatility makes it a pillar of modern tech. Utilize Django for robust enterprise monoliths or FastAPI for high-speed, asynchronous microservices."
  },
  java: {
    keywords: ["java", "spring boot", "jpa", "microservices"],
    response: "Java remains the standard for large-scale enterprise resilience. Spring Boot is the essential framework for building scalable, production-ready microservice systems."
  },
  sql_databases: {
    keywords: ["sql", "mysql", "postgres", "database", "query"],
    response: "Relational database proficiency is non-negotiable. Master complex query optimization, indexing strategies, and normalized schema design for high-performance data systems."
  },
  mongodb: {
    keywords: ["mongodb", "nosql", "documents", "mongoose"],
    response: "MongoDB is the gold standard for NoSQL document storage, offering the flexibility and horizontal scalability required for rapid-growth web applications."
  },
  apis: {
    keywords: ["rest", "graphql", "api design", "json"],
    response: "Sophisticated API design is the glue of modern architecture. Familiarity with RESTful constraints and the flexibility of GraphQL is required for full-stack excellence."
  },

  // --- DATA SCIENCE & AI ---
  machine_learning: {
    keywords: ["machine learning", "ml", "scikit", "models"],
    response: "Machine Learning is the centerpiece of modern data-driven decision making. Mastering the mathematical foundations of regression and classification is key for data scientists."
  },
  deep_learning: {
    keywords: ["deep learning", "tensorflow", "pytorch", "neural"],
    response: "Deep Learning pushes the boundaries of computation. Mastery of Neural Networks and frameworks like PyTorch is required for high-level AI research and development."
  },
  data_viz: {
    keywords: ["data visualization", "tableau", "power bi", "matplotlib"],
    response: "Data visualization is the bridge between analysis and business strategy. Effectively communicating insights through interactive dashboards is a senior data leadership skill."
  },
  big_data: {
    keywords: ["big data", "hadoop", "spark", "large datasets"],
    response: "Managing massive datasets requires specialized distributed computing skills. Apache Spark is the current industry leader for data-intensive processing tasks."
  },
  nlp: {
    keywords: ["nlp", "natural language", "transformers", "llm"],
    response: "Natural Language Processing is redefining human-computer interaction. Understanding the architecture of Large Language Models (LLMs) is a high-value competency today."
  },
  gen_ai: {
    keywords: ["generative ai", "prompt engineering", "openai", "claude"],
    response: "Generative AI is a paradigm shift in productivity. Developers with prompt engineering and LLM integration skills are in high demand across the industry."
  },

  // --- CLOUD & DEVOPS ---
  aws: {
    keywords: ["aws", "amazon web", "ec2", "s3", "lambda"],
    response: "AWS proficiency is the standard for modern cloud engineering. We recommend mastering EC2, S3, and serverless Lambda functions for robust cloud-native architecture."
  },
  docker: {
    keywords: ["docker", "container", "images", "deployment"],
    response: "Containerization is essential for environment parity. Docker allows you to encapsulate your application lifecycle, ensuring seamless deployment across all stages."
  },
  kubernetes: {
    keywords: ["kubernetes", "k8s", "orchestration", "clusters"],
    response: "Kubernetes is the pinnacle of infrastructure orchestration. It is a critical skill for managing complex, container-based microservice environments at scale."
  },
  cicd: {
    keywords: ["ci/cd", "jenkins", "github actions", "pipeline"],
    response: "Automated CI/CD pipelines are the heartbeat of modern software delivery. Mastering tools like GitHub Actions is essential for maintaining high deployment benchmarks."
  },
  linux: {
    keywords: ["linux", "bash", "shell", "terminal", "command line"],
    response: "The Linux command line is the native tongue of the developer. Professional proficiency in bash scripting and OS internals is required for high-level backend roles."
  },
  git: {
    keywords: ["git", "version control", "github", "gitlab"],
    response: "Git is the absolute standard for collaborative version control. Professional mastery of rebase workflows and merge conflict resolution is essential for all developers."
  },

  // --- MOBILE DEVELOPMENT ---
  react_native: {
    keywords: ["react native", "cross platform", "mobile js"],
    response: "React Native allows for highly efficient multi-platform delivery. Its ability to combine native performance with the speed of web development makes it a top startup choice."
  },
  flutter: {
    keywords: ["flutter", "dart", "google mobile"],
    response: "Flutter offers unparalleled UI consistency across platforms. Its 'Hot Reload' and high-performance rendering engine make it a favorite for modern mobile UX."
  },
  ios_dev: {
    keywords: ["ios", "swift", "xcode", "apple dev"],
    response: "Native iOS development with Swift and SwiftUI provides the highest level of performance and platform integration for the premium Apple ecosystem."
  },
  android_dev: {
    keywords: ["android dev", "kotlin", "jetpack compose"],
    response: "Kotlin is the first-choice language for Android. Leveraging Jetpack Compose for declarative UI development is the current industry standard for modern Android apps."
  },

  // --- CYBERSECURITY ---
  security_basics: {
    keywords: ["cybersecurity", "security", "encryption", "firewall"],
    response: "Security must be baked into the architecture from day one. Professional engineers must be fluent in the OWASP Top 10 and secure authentication protocols."
  },
  pentesting: {
    keywords: ["hacking", "pentest", "ethical hacking", "vulnerability"],
    response: "Ethical hacking is the rigorous practice of finding and mitigating systemic weaknesses. It requires an advanced understanding of networking and system logic."
  },

  // --- DESIGN & PRODUCT ---
  ui_ux: {
    keywords: ["ui", "ux", "design", "user experience"],
    response: "Premium UX is the result of disciplined research and empathetic design. Focus on creating seamless user flows that reduce friction and maximize conversion."
  },
  figma: {
    keywords: ["figma", "prototyping", "wireframes"],
    response: "Figma is the definitive collaboration tool for the design-to-development pipeline. Master advanced components and prototyping to build high-fidelity interface specs."
  },
  product_management: {
    keywords: ["product management", "pm", "agile", "scrum"],
    response: "Product Management is the strategic intersection of business, technology, and design. Success requires mastery of data-driven roadmapping and Agile methodologies."
  },

  // --- SOFT SKILLS ---
  communication: {
    keywords: ["communication", "public speaking", "writing", "presentation"],
    response: "Exceptional communication is a core leadership trait in tech. The ability to translate complex technical concepts into strategic business insights is invaluable."
  },
  leadership: {
    keywords: ["leadership", "management", "mentoring", "teamwork"],
    response: "Professional leadership is about empowering your team through mentorship and strategic vision. True leaders elevate the entire technical organization."
  },
  problem_solving: {
    keywords: ["critical thinking", "logic", "problem solving"],
    response: "Analytical problem solving is the primary product of an engineer. Developing a systematic approach to debugging and architectural design is a sign of seniority."
  },
  time_management: {
    keywords: ["productivity", "time management", "focus", "pomodoro"],
    response: "Time management is about ruthless prioritization. Focus on protecting your 'Deep Work' time blocks to achieve the highest level of technical productivity."
  },

  // --- OTHER TRENDS ---
  blockchain: {
    keywords: ["blockchain", "web3", "crypto", "smart contracts"],
    response: "Blockchain technologies represent a shift toward decentralized trust. Expertise in Solidity and smart contract security is a premier skill in the Web3 sector."
  },
  metaverse: {
    keywords: ["metaverse", "vr", "ar", "unity", "unreal"],
    response: "Immersive technologies (AR/VR) are expanding the boundaries of digital space. Proficiency in Unity or Unreal Engine is required for building Next-Gen interfaces."
  },
  iot: {
    keywords: ["iot", "internet of things", "hardware", "arduino"],
    response: "The Internet of Things (IoT) requires a sophisticated balance of embedded firmware development and cloud-scale data management."
  },
  career_change: {
    keywords: ["career change", "switching", "non-tech to tech"],
    response: "Transitioning to a technical career is a strategic move that requires a disciplined roadmap. Focus on building a technical portfolio that proves your capabilities to employers."
  },
  mental_health: {
    keywords: ["burnout", "stress", "mental health", "work-life balance"],
    response: "Sustainable performance requires proactive stress management. Balancing intensive technical sprints with adequate recovery is essential for long-term career resilience."
  },

  // --- SPECIFIC JOB ROLES ---
  swe: {
    keywords: ["swe", "software engineer", "dev role"],
    response: "Software Engineering is about building and maintaining scalable systems. Focus on writing clean code, designing solid architectures, and understanding system tradeoffs."
  },
  data_analyst: {
    keywords: ["data analyst", "excel", "powerbi"],
    response: "Data Analysts bridge the gap between raw information and strategic action. Master SQL, Data Visualization, and statistical modeling to provide high-impact business insights."
  },
  qa_testing: {
    keywords: ["qa", "testing", "automation testing", "selenium"],
    response: "Automated QA ensures the integrity of the delivery pipeline. Mastery of Cypress or Playwright for end-to-end testing is a highly valued competency."
  },
  devops_role: {
    keywords: ["devops engineer", "sre", "reliability"],
    response: "DevOps Engineers are the architects of the application lifecycle. Focus on Infrastructure as Code (IaC), cloud automation, and site reliability benchmarks."
  },

  // --- ADVICE ON LEARNING ---
  how_to_learn: {
    keywords: ["how to learn", "best way", "tutorial hell"],
    response: "The most effective learning paradigm is 'Project-Based Mastery'. Transition quickly from passive consumption to active building to solidify your technical expertise."
  },
  open_source: {
    keywords: ["open source", "contribute", "hacktoberfest"],
    response: "Contributing to Open Source is the ultimate credential in software development. It demonstrates your ability to collaborate on high-stakes, production-grade code."
  },

  // --- MORE DETAILED TECH ---
  sql_vs_nosql: {
    keywords: ["sql vs nosql", "which database", "relational"],
    response: "Database selection depends on your data integrity needs. SQL provides robust ACID compliance, while NoSQL offers horizontal scalability for non-relational datasets."
  },
  microservices: {
    keywords: ["monolith", "microservices", "modular"],
    response: "Microservice architectures provide high-level scaling and independent deployment, though they require sophisticated orchestration and service discovery mechanisms."
  },
  serverless: {
    keywords: ["serverless", "faaS", "lambda functions"],
    response: "Serverless architecture abstracts infrastructure management, allowing for high scalability and cost-efficiency through an event-driven execution model."
  },
  testing_types: {
    keywords: ["unit test", "integration test", "jest", "mocha"],
    response: "A comprehensive testing suite is the hallmark of professional software. Maintain high code coverage with unit tests and ensure system cohesion with integration tests."
  },
  algorithms: {
    keywords: ["algorithms", "dsa", "sorting", "searching"],
    response: "Algorithms and Data Structures (DSA) are the foundations of computational efficiency. Proficiency in space and time complexity analysis is required for Big Tech roles."
  },
  low_code: {
    keywords: ["low code", "no code", "bubble", "webflow"],
    response: "Low-code platforms accelerate initial prototyping. However, custom engineering remains indispensable for complex, enterprise-ready application requirements."
  },
  ui_libraries: {
    keywords: ["tailwind", "bootstrap", "material ui", "mui"],
    response: "Modern UI libraries like Tailwind CSS provide a utility-first approach for rapid development, while MUI offers a comprehensive suite of professional components."
  },

  // --- PLATFORM NAV ---
  how_to_start: {
    keywords: ["start", "where to begin", "first step"],
    response: "We suggest you begin by completing your Professional Profile. Then, utilize our 'Skill Audit' to map your personal trajectory toward your target career milestones."
  },
  technical_support: {
    keywords: ["contact", "support", "admin", "report"],
    response: "For prioritized technical support, please contact our administrative board via the standardized inquiry form in the platform footer."
  },

  // --- CAREER MILESTONES ---
  first_job: {
    keywords: ["first job", "entry level", "fresher"],
    response: "Your initial role should be selected for its learning environment and mentorship quality. Prioritize foundational skill acquisition to build a resilient long-term career."
  },
  promotion: {
    keywords: ["promotion", "senior role", "growth"],
    response: "Advancement to senior levels requires a shift toward systemic thinking and cross-team leadership. Proactively solving organizational challenges is the key to promotion."
  },
  resigned: {
    keywords: ["resign", "leaving", "notice period"],
    response: "Professional transitions should be managed with diplomatic precision. Your legacy at an organization is solidified by your grace and thorough hand-off during your notice period."
  },

  // --- MOTIVATION ---
  motivation: {
    keywords: ["unmotivated", "give up", "hard", "stuck"],
    response: "Technical growth is non-linear. Plateaus are often a sign that you are on the verge of a breakthrough. We recommend a strategic break followed by a return to foundational principles."
  },
  imposter_syndrome: {
    keywords: ["imposter", "not good enough", "everyone is smarter"],
    response: "Imposter syndrome is a typical occurrence among high-achieving professionals. It reflects your awareness of the vastness of the field and your commitment to continuous learning."
  },

  // --- EXPANDED SOFT SKILLS ---
  conflict_resolution: {
    keywords: ["conflict", "argument", "peer", "office politics"],
    response: "Professional conflict should be approached as a collaborative problem to be solved. Focus on shared objectives and use objective data to achieve consensus among peers."
  },
  emotional_intelligence: {
    keywords: ["eq", "emotional", "empathy"],
    response: "High Emotional Intelligence (EQ) is a core component of senior leadership. It allows for effective navigation of complex social dynamics within a technical team."
  },

  // --- FINAL FALLBACK ---
  default: {
    keywords: [],
    response: "I recognize the importance of your inquiry. While this specific topic is being integrated into my core intelligence, I can immediately provide expert guidance on resumes, interview strategies, or technical skill audits. Which area shall we prioritize?"
  }
};

module.exports = { KNOWLEDGE_BASE };
