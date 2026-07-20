# 🎓 CareerIQ: Smart Placement Predictor & Career Guidance Platform

CareerIQ is an end-to-end, AI-powered career counseling, placement readiness prediction, and learning management platform. It acts as an intelligent bridge between academic learning and corporate expectations by analyzing student skills, predicting placement probabilities, and providing personalized growth pathways.

---

## 🚀 Key Features & Capabilities

### 1. 🧠 Smart Placement Predictor & Skill Gap Analysis
* **Readiness Scoring:** Uses advanced algorithms to analyze a student's technical skills, academic performance, project experience, and mock interview scores to predict their placement probability.
* **Skill Gap Identification:** Highlights exactly which skills are missing for a target job role (e.g., React, System Design, Data Structures) compared to active industry demands.

### 2. 🗺️ AI-Generated Learning Roadmaps
* **Gemini AI Integration:** Generates step-by-step learning roadmaps tailored to the student's identified skill gaps.
* **Progress Tracking:** Interactive progress bars that visually guide students through core learning milestones.

### 3. 🎤 Interactive Mock Interviews & Prep
* **Practice Question Banks:** Offers standard tech questions filtered by role, difficulty, and category.
* **AI Mock Interviews:** Conduct mock sessions to evaluate communication and technical performance with real-time score feedback.

### 4. 💼 Job Board & Application Tracker
* **Explore Jobs:** Live listings of internships and entry-level positions.
* **Application Tracker:** Kanban-style or list-based status updates (Applied, Interviewing, Offered, Rejected) so students never miss a deadline.

### 5. 📊 Market Intelligence & Dashboard Analytics
* **Interactive Graphs:** Dynamic charts (powered by Chart.js and Recharts) visualizing student analytics, popular industry skills, and salary benchmarks.
* **Global Market Insights:** Real-time data on industry trends, enabling students to select hot career tracks.

### 6. 💬 Real-Time Community Chat
* **Live Discussions:** Group chat rooms powered by WebSockets (Socket.io) where students can share interview experiences, study materials, and career tips instantly.

### 7. 🛡️ Comprehensive Admin Dashboard
* **User Management:** Oversee student profiles, track their skill growth, and monitor placement metrics.
* **Platform Operations:** Management interfaces to update skill banks, add mock questions, post job opportunities, and read user feedback.

---

## 🛠️ Technology Stack

| Component | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | React (v19) + Vite | Single Page Application framework with fast hot module reloading. |
| **Routing** | React Router DOM (v7) | Fast client-side routing. |
| **Charts** | Chart.js & Recharts | Visualization of skill gaps, analytics, and prediction scores. |
| **Sockets** | Socket.io-client | Real-time chat messaging and system-wide notifications. |
| **PDF Tools** | html2canvas & jsPDF | Exporting placement reports and roadmaps to PDF. |
| **Backend** | Node.js + Express.js | High-performance API server. |
| **Database** | MongoDB Atlas | Cloud-hosted NoSQL database (Mongoose ORM). |
| **Security** | JWT & bcryptjs | Secure stateless authentication and hashed passwords. |
| **Sockets** | Socket.io | Server-side WebSocket server for live communications. |
| **AI Engine** | Google Generative AI API | Powers automated roadmaps and smart profile predictions (Gemini). |

---

## 📁 System Architecture

```text
CareerIQ/
├── Documents/            # Local Word, PDF, and PPT presentations for Viva
├── Frontend/             # React client-side code
│   ├── src/
│   │   ├── Admin/        # Admin layouts, pages, and components
│   │   ├── components/   # Shared UI components (Charts, Loaders, Sidebar)
│   │   ├── context/      # Global Authentication and User Contexts
│   │   ├── pages/        # Client pages (Dashboard, PlacementPredictor, SkillGap, Chat, etc.)
│   │   ├── services/     # API services mapping (axios)
│   │   ├── styles/       # Global styles and CSS modules
│   │   └── utils/        # Business logic and validation helper functions
├── Backend/              # Express backend code
│   ├── config/           # Database configuration
│   ├── controllers/      # Route controllers (Event, Notifications, etc.)
│   ├── models/           # Mongoose Database schemas (User, Resume, Roadmap, etc.)
│   ├── routes/           # REST API endpoints mapping
│   ├── scripts/          # Database seeding and migration tools
│   ├── utils/            # Shared backend utilities
│   └── server.js         # Main server entrypoint
```

---

## 🔒 Security & Authentication
* **Password Hashing:** Passwords are never stored as plain text. The system hashes them securely using `bcryptjs` before inserting them into MongoDB.
* **Token-Based Sessions:** Employs JSON Web Tokens (JWT) for authentication. Once logged in, the token is passed in authorization headers to validate access to private features like the Admin Panel, Skill Assessment, and Job Board.
