import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { FaYoutube, FaCheck, FaLock, FaPlay } from "react-icons/fa";
import axios from "axios";
import { API_BASE_URL } from '../../utils/constants';
import "./Roadmap.css";

export default function Roadmap() {
  const location = useLocation();
  const [activeRole, setActiveRole] = useState("frontend");
  const [completedVideos, setCompletedVideos] = useState([]);
  const [learningStreak, setLearningStreak] = useState(0);
  const [totalWatchTime, setTotalWatchTime] = useState(0);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);

  // Initialize and Fetch Progress from Backend
  useEffect(() => {
    const fetchProgress = async () => {
      try {
        setLoading(true);
        // Assuming user data is stored in localStorage after login
        const storedUser = JSON.parse(localStorage.getItem("user"));
        const currentUserId = storedUser?._id || storedUser?.id || "guest_user";
        setUserId(currentUserId);

        const response = await axios.get(`${API_BASE_URL}/roadmap/user-roadmaps`);
        
        if (response.data.success && response.data.data) {
          const roleData = response.data.data.roleProgress?.[activeRole];
          if (roleData) {
            setCompletedVideos(roleData.completedVideos || []);
            setLearningStreak(roleData.learningStreak || 0);
            setTotalWatchTime(roleData.totalWatchTime || 0);
          } else {
            setCompletedVideos([]);
            setLearningStreak(0);
            setTotalWatchTime(0);
          }
        } else {
          setCompletedVideos([]);
          setLearningStreak(0);
          setTotalWatchTime(0);
        }
      } catch (error) {
        console.error("Error fetching progress:", error);
      } finally {
        setLoading(false);
      }
    };

    if (location.state?.roadmap === "fullstack") {
      setActiveRole("fullstack");
    }
    
    fetchProgress();
  }, [activeRole, location.state]);

  // Save Progress to Backend when it changes
  const saveProgressToBackend = async (newCompletedVideos, newWatchTime, newStreak) => {
    if (!userId) return;
    try {
      await axios.post("http://localhost:5000/api/roadmap/save", {
        userId,
        roleId: activeRole,
        completedVideos: newCompletedVideos,
        learningStreak: newStreak,
        totalWatchTime: newWatchTime
      });
    } catch (error) {
      console.error("Error saving progress:", error);
    }
  };

  const calculateRoleProgress = (roleId) => {
    const roleDataMap = roadmapData[roleId];
    if (!roleDataMap) return 0;
    const allVideos = [
      ...roleDataMap.beginner,
      ...roleDataMap.intermediate,
      ...roleDataMap.advanced,
      ...roleDataMap.tools
    ];
    // We don't have completed videos for arbitrary roles loaded in state simultaneously right now.
    // As an optimization, we return 0 for non-active roles, or we could fetch whole progress object.
    // For now, only calculate active roll correctly dynamically.
    if(roleId !== activeRole) return 0;
    const completed = allVideos.filter(v => completedVideos.includes(v.title)).length;
    return Math.round((completed / allVideos.length) * 100);
  };

  const parseDuration = (duration) => {
    const hours = duration.match(/(\d+)h/);
    const minutes = duration.match(/(\d+)m/);
    return (hours ? parseInt(hours[1]) * 60 : 0) + (minutes ? parseInt(minutes[1]) : 0);
  };

  const toggleComplete = (videoTitle, duration) => {
    let newCompleted;
    let newWatchTime = totalWatchTime;
    let newStreak = learningStreak;

    const minutes = parseDuration(duration);

    if (completedVideos.includes(videoTitle)) {
      newCompleted = completedVideos.filter(v => v !== videoTitle);
      newWatchTime = Math.max(0, newWatchTime - minutes);
    } else {
      newCompleted = [...completedVideos, videoTitle];
      newWatchTime = newWatchTime + minutes;
      
      // Simple streak increment logic for demo (usually you compare dates)
      if (newCompleted.length === 1 || newCompleted.length % 3 === 0) {
        newStreak += 1;
      }
    }

    setCompletedVideos(newCompleted);
    setTotalWatchTime(newWatchTime);
    setLearningStreak(newStreak);

    // Persist to DB
    saveProgressToBackend(newCompleted, newWatchTime, newStreak);
  };

  const formatWatchTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const calculateProgress = () => {
    const allVideos = [
      ...roadmapData[activeRole].beginner,
      ...roadmapData[activeRole].intermediate,
      ...roadmapData[activeRole].advanced,
      ...roadmapData[activeRole].tools
    ];
    const completed = allVideos.filter(v => completedVideos.includes(v.title)).length;
    return Math.round((completed / allVideos.length) * 100);
  };

  const getNextMilestone = () => {
    const progress = calculateProgress();
    if (progress >= 100) return "Course Complete!";
    if (progress >= 75) return "Almost there!";
    if (progress >= 50) return "Halfway done!";
    if (progress >= 25) return "Keep going!";
    return "Just started!";
  };

  const getDifficultyBadge = (difficulty) => {
    const colors = {
      Easy: "badge-easy",
      Medium: "badge-medium",
      Hard: "badge-hard"
    };
    return colors[difficulty] || "badge-easy";
  };

  const roles = [
    { id: "frontend", label: "Frontend Dev", icon: "fas fa-code" },
    { id: "backend", label: "Backend Dev", icon: "fas fa-server" },
    { id: "fullstack", label: "Full Stack Dev", icon: "fas fa-layer-group" },
    { id: "react", label: "React Dev", icon: "fab fa-react" },
    { id: "javascript", label: "JavaScript Dev", icon: "fab fa-js" },
    { id: "uiux", label: "UI/UX Designer", icon: "fas fa-palette" },
    { id: "devops", label: "DevOps Engineer", icon: "fas fa-cogs" },
    { id: "python", label: "Python Dev", icon: "fab fa-python" },
    { id: "mobile", label: "Mobile App Dev", icon: "fas fa-mobile-alt" },
    { id: "datasci", label: "Data Science", icon: "fas fa-chart-line" },
    { id: "cloud", label: "Cloud Engineer", icon: "fas fa-cloud" },
    { id: "cyber", label: "Cyber Security", icon: "fas fa-user-shield" },
    { id: "aiml", label: "AI & ML Engineer", icon: "fas fa-brain" },
    { id: "blockchain", label: "Blockchain Dev", icon: "fas fa-link" },
    { id: "game", label: "Game Developer", icon: "fas fa-gamepad" },
    { id: "qa", label: "QA Engineer", icon: "fas fa-vials" },
    { id: "dataanalyst", label: "Data Analyst", icon: "fas fa-chart-bar" },
    { id: "pm", label: "Project Manager", icon: "fas fa-tasks" },
    { id: "hacker", label: "Ethical Hacker", icon: "fas fa-user-secret" },
    { id: "architect", label: "Systems Architect", icon: "fas fa-sitemap" },
    { id: "embedded", label: "Embedded Systems", icon: "fas fa-microchip" },
  ];

  const roadmapData = {
    frontend: {
      beginner: [
        { title: "HTML Full Course – CodeWithHarry", link: "https://youtu.be/BsDoLVMnmZs", duration: "3h 30m", difficulty: "Easy" },
        { title: "CSS Full Course – CodeWithHarry", link: "https://youtu.be/Edsxf_NBFrw", duration: "4h 00m", difficulty: "Easy" },
        { title: "Responsive Web Design Crash Course", link: "https://youtu.be/nu_pCVPKzTk", duration: "1h 45m", difficulty: "Easy" },
        { title: "CSS Animations", link: "https://youtu.be/cmt-1uQn4Ng", duration: "2h 00m", difficulty: "Medium" },
        { title: "Bootstrap 5 Full Course", link: "https://youtu.be/5GcQtLDGXy8", duration: "3h 15m", difficulty: "Easy" },
        { title: "Flexbox Crash Course", link: "https://youtu.be/yfoY53QXEnI", duration: "1h 20m", difficulty: "Easy" },
        { title: "CSS Grid Layout", link: "https://youtu.be/9zBsdzdE4sM", duration: "1h 30m", difficulty: "Medium" },
        { title: "HTML Forms & Tables", link: "https://youtu.be/1Rs2ND1ryYc", duration: "2h 10m", difficulty: "Easy" },
      ],
      intermediate: [
        { title: "JavaScript Basics – freeCodeCamp", link: "https://youtu.be/PkZNo7MFNFg", duration: "3h 30m", difficulty: "Medium" },
        { title: "DOM Manipulation", link: "https://youtu.be/hdI2bqOjy3c", duration: "2h 15m", difficulty: "Medium" },
        { title: "JavaScript Full Course", link: "https://youtu.be/jS4aFq5-91M", duration: "8h 00m", difficulty: "Medium" },
        { title: "JS Projects", link: "https://youtu.be/MkESyVB4oUw", duration: "4h 30m", difficulty: "Medium" },
        { title: "ES6 Crash Course", link: "https://youtu.be/NCwa_xi0Uuc", duration: "1h 50m", difficulty: "Medium" },
        { title: "Async JS & Promises", link: "https://youtu.be/PoRJizFvM7s", duration: "2h 30m", difficulty: "Hard" },
        { title: "Array & Object Methods", link: "https://youtu.be/R8rmfD9Y5-c", duration: "1h 40m", difficulty: "Medium" },
      ],
      advanced: [
        { title: "React Full Course – freeCodeCamp", link: "https://youtu.be/bMknfKXIFA8", duration: "11h 00m", difficulty: "Hard" },
        { title: "React Hooks", link: "https://youtu.be/SqcY0GlETPk", duration: "3h 00m", difficulty: "Hard" },
        { title: "React Router Tutorial", link: "https://youtu.be/Law7wfdg_ls", duration: "2h 30m", difficulty: "Hard" },
        { title: "React Projects", link: "https://youtu.be/F2JCjVSZlG0", duration: "5h 00m", difficulty: "Hard" },
        { title: "React Context API", link: "https://youtu.be/9U3IhLAnSxM", duration: "2h 00m", difficulty: "Hard" },
        { title: "React Performance Optimization", link: "https://youtu.be/0mVbNp1ol_w", duration: "1h 45m", difficulty: "Hard" },
      ],
      tools: [
        { title: "Git & GitHub Crash Course", link: "https://youtu.be/SWYqp7iY_Tc", duration: "1h 30m", difficulty: "Easy" },
        { title: "VS Code Productivity Tips", link: "https://youtu.be/ZfQFUJhPqMM", duration: "45m", difficulty: "Easy" },
        { title: "Web Performance Optimization", link: "https://youtu.be/3nLTB_E6XAM", duration: "2h 00m", difficulty: "Medium" },
        { title: "Frontend Interview Prep", link: "https://youtu.be/Tt08KmFfIYQ", duration: "3h 00m", difficulty: "Hard" },
      ],
    },
    backend: {
      beginner: [
        { title: "Node.js Full Course – freeCodeCamp", link: "https://youtu.be/pKd0Rpw7O48", duration: "8h 30m", difficulty: "Medium" },
        { title: "Express.js Crash Course", link: "https://youtu.be/Oe421EPjeBE", duration: "1h 15m", difficulty: "Easy" },
        { title: "REST API Concepts", link: "https://youtu.be/ENrzD9HAZK4", duration: "2h 00m", difficulty: "Easy" },
        { title: "MongoDB Full Course", link: "https://youtu.be/fgTGADljAeg", duration: "5h 00m", difficulty: "Medium" },
        { title: "Authentication with Node.js", link: "https://youtu.be/L72fhGm1tfE", duration: "3h 30m", difficulty: "Medium" },
        { title: "Node.js Project Tutorial", link: "https://youtu.be/1NrHkjlWVhM", duration: "4h 00m", difficulty: "Medium" },
      ],
      intermediate: [
        { title: "Node.js File System & Async", link: "https://youtu.be/1NrHkjlWVhM", duration: "2h 45m", difficulty: "Medium" },
        { title: "API Error Handling", link: "https://youtu.be/1yWfUVxeK5Q", duration: "1h 30m", difficulty: "Medium" },
        { title: "MongoDB Advanced Queries", link: "https://youtu.be/L72fhGm1tfE", duration: "3h 00m", difficulty: "Hard" },
        { title: "Express Middleware Deep Dive", link: "https://youtu.be/Oe421EPjeBE", duration: "2h 00m", difficulty: "Medium" },
      ],
      advanced: [
        { title: "GraphQL with Node.js", link: "https://youtu.be/y1RQGV4CzDY", duration: "4h 30m", difficulty: "Hard" },
        { title: "Socket.IO & Real-time Apps", link: "https://youtu.be/edN8FvcY5GU", duration: "3h 15m", difficulty: "Hard" },
        { title: "Node.js Project Best Practices", link: "https://youtu.be/pKd0Rpw7O48", duration: "2h 30m", difficulty: "Hard" },
      ],
      tools: [
        { title: "Docker for Beginners", link: "https://youtu.be/3nLTB_E6XAM", duration: "3h 00m", difficulty: "Medium" },
        { title: "Postman API Testing", link: "https://youtu.be/jHOl05i4Ydk", duration: "1h 15m", difficulty: "Easy" },
        { title: "Git & GitHub for Backend", link: "https://youtu.be/SWYqp7iY_Tc", duration: "1h 30m", difficulty: "Easy" },
      ],
    },
    fullstack: {
      beginner: [
        { title: "MERN Full Course – freeCodeCamp", link: "https://youtu.be/4UZrsTqkcW4", duration: "12h 00m", difficulty: "Hard" },
        { title: "React + Node.js Crash Course", link: "https://youtu.be/7CqJlxBYj-M", duration: "4h 30m", difficulty: "Medium" },
        { title: "HTML, CSS & JS Basics", link: "https://youtu.be/BsDoLVMnmZs", duration: "5h 00m", difficulty: "Easy" },
      ],
      intermediate: [
        { title: "REST API Design", link: "https://youtu.be/ENrzD9HAZK4", duration: "3h 00m", difficulty: "Medium" },
        { title: "React Hooks & Context", link: "https://youtu.be/Ke90Tje7VS0", duration: "2h 45m", difficulty: "Medium" },
        { title: "Database Integration", link: "https://youtu.be/fgTGADljAeg", duration: "4h 00m", difficulty: "Medium" },
      ],
      advanced: [
        { title: "Full Stack Projects", link: "https://youtu.be/F2JCjVSZlG0", duration: "8h 00m", difficulty: "Hard" },
        { title: "Authentication & Authorization", link: "https://youtu.be/1NrHkjlWVhM", duration: "3h 30m", difficulty: "Hard" },
      ],
      tools: [
        { title: "CI/CD Concepts", link: "https://youtu.be/Tt08KmFfIYQ", duration: "2h 00m", difficulty: "Medium" },
      ],
    },
    react: {
      beginner: [
        { title: "React Full Course", link: "https://youtu.be/bMknfKXIFA8", duration: "11h 00m", difficulty: "Medium" },
        { title: "React Crash Course", link: "https://youtu.be/Ke90Tje7VS0", duration: "2h 00m", difficulty: "Easy" },
      ],
      intermediate: [
        { title: "React Hooks", link: "https://youtu.be/SqcY0GlETPk", duration: "3h 00m", difficulty: "Medium" },
        { title: "State Management with Context", link: "https://youtu.be/9U3IhLAnSxM", duration: "2h 00m", difficulty: "Medium" },
      ],
      advanced: [
        { title: "React Projects", link: "https://youtu.be/F2JCjVSZlG0", duration: "5h 00m", difficulty: "Hard" },
      ],
      tools: [
        { title: "Git & GitHub for React", link: "https://youtu.be/SWYqp7iY_Tc", duration: "1h 30m", difficulty: "Easy" },
      ],
    },
    javascript: {
      beginner: [
        { title: "JavaScript Basics", link: "https://youtu.be/PkZNo7MFNFg", duration: "3h 30m", difficulty: "Easy" },
      ],
      intermediate: [
        { title: "JavaScript Projects", link: "https://youtu.be/MkESyVB4oUw", duration: "4h 30m", difficulty: "Medium" },
      ],
      advanced: [
        { title: "Async JS & Promises", link: "https://youtu.be/PoRJizFvM7s", duration: "2h 30m", difficulty: "Hard" },
      ],
      tools: [
        { title: "Coding Interview JS", link: "https://youtu.be/HxySrSbSY7o", duration: "4h 00m", difficulty: "Hard" },
      ],
    },
    uiux: {
      beginner: [{ title: "Figma UX Design Basics", link: "https://youtu.be/kbZejnPXyLM", duration: "2h 30m", difficulty: "Easy" }],
      intermediate: [{ title: "High Fidelity UI/UX in Figma", link: "https://youtu.be/FBDVzr0peO4", duration: "3h 15m", difficulty: "Medium" }],
      advanced: [{ title: "Design System in Figma", link: "https://youtu.be/opTANvl9G1g", duration: "4h 30m", difficulty: "Hard" }],
      tools: [{ title: "Adobe XD Mastery", link: "https://youtu.be/KBQlMFNXcb4", duration: "5h 00m", difficulty: "Medium" }],
    },
    devops: {
      beginner: [{ title: "DevOps Full Course", link: "https://youtu.be/0a9Xzp9JjJQ", duration: "8h 00m", difficulty: "Medium" }],
      intermediate: [{ title: "Docker & Kubernetes", link: "https://youtu.be/3nLTB_E6XAM", duration: "6h 00m", difficulty: "Hard" }],
      advanced: [{ title: "Infrastructure as Code", link: "https://youtu.be/0a9Xzp9JjJQ", duration: "5h 00m", difficulty: "Hard" }],
      tools: [{ title: "Git Crash Course", link: "https://youtu.be/SWYqp7iY_Tc", duration: "1h 30m", difficulty: "Easy" }],
    },
    python: {
      beginner: [{ title: "Python Full Course", link: "https://youtu.be/_uQrJ0TkZlc", duration: "4h 30m", difficulty: "Easy" }],
      intermediate: [{ title: "Python Projects", link: "https://youtu.be/4F2m91eKmts", duration: "5h 00m", difficulty: "Medium" }],
      advanced: [{ title: "Django Full Course", link: "https://youtu.be/JxzZxdht-XY", duration: "10h 00m", difficulty: "Hard" }],
      tools: [{ title: "Python Best Practices", link: "https://youtu.be/H1elmMBnykA", duration: "2h 00m", difficulty: "Medium" }],
    },
    mobile: {
      beginner: [{ title: "Android Dev for Beginners", link: "https://youtu.be/fis26HvvDII", duration: "9h 00m", difficulty: "Medium" }],
      intermediate: [{ title: "Flutter Full Course", link: "https://youtu.be/x0uinJvhNxI", duration: "12h 00m", difficulty: "Hard" }],
      advanced: [{ title: "React Native Full Course", link: "https://youtu.be/0-S5a0eXPoc", duration: "11h 00m", difficulty: "Hard" }],
      tools: [{ title: "Mobile UI/UX Basics", link: "https://youtu.be/FBDVzr0peO4", duration: "3h 00m", difficulty: "Medium" }],
    },
    datasci: {
      beginner: [{ title: "Data Science Full Course", link: "https://youtu.be/ua-CiDNNj30", duration: "10h 00m", difficulty: "Medium" }],
      intermediate: [{ title: "Machine Learning Tutorial", link: "https://youtu.be/GwIo3gDZCVQ", duration: "8h 00m", difficulty: "Hard" }],
      advanced: [{ title: "Deep Learning Basics", link: "https://youtu.be/tPYj3fFJGjk", duration: "7h 00m", difficulty: "Hard" }],
      tools: [{ title: "Data Science Tools Overview", link: "https://youtu.be/VMW4bG355rE", duration: "2h 30m", difficulty: "Medium" }],
    },
    cloud: {
      beginner: [{ title: "AWS Cloud Practitioner", link: "https://youtu.be/M988_fsOSWo", duration: "13h 00m", difficulty: "Medium" }],
      intermediate: [{ title: "Cloud Architecture Tutorial", link: "https://youtu.be/E_v5hhetIrQ", duration: "4h 30m", difficulty: "Medium" }],
      advanced: [{ title: "Advanced AWS Services", link: "https://youtu.be/M988_fsOSWo", duration: "8h 00m", difficulty: "Hard" }],
      tools: [{ title: "IAM & Security Basics", link: "https://youtu.be/o-CJ8ozJ3Jk", duration: "2h 00m", difficulty: "Medium" }],
    },
    cyber: {
      beginner: [{ title: "Cyber Security Full Course", link: "https://youtu.be/U_P23SqJaDc", duration: "12h 00m", difficulty: "Medium" }],
      intermediate: [{ title: "Network Security Basics", link: "https://youtu.be/rLFS27z6Y0I", duration: "5h 00m", difficulty: "Medium" }],
      advanced: [{ title: "Pentesting Full Course", link: "https://youtu.be/3Kq1MIfTWCE", duration: "10h 00m", difficulty: "Hard" }],
      tools: [{ title: "Metasploit Tutorial", link: "https://youtu.be/8lR27r8Y_7Y", duration: "3h 00m", difficulty: "Medium" }],
    },
    aiml: {
      beginner: [{ title: "Machine Learning Concepts", link: "https://youtu.be/GwIo3gDZCVQ", duration: "8h 00m", difficulty: "Medium" }],
      intermediate: [{ title: "Deep Learning with PyTorch", link: "https://youtu.be/V_xro1bcAuA", duration: "10h 00m", difficulty: "Hard" }],
      advanced: [{ title: "Natural Language Processing", link: "https://youtu.be/CMrHM8a3hqw", duration: "6h 00m", difficulty: "Hard" }],
      tools: [{ title: "TensorFlow Essentials", link: "https://youtu.be/tPYj3fFJGjk", duration: "5h 00m", difficulty: "Medium" }],
    },
    blockchain: {
      beginner: [{ title: "Blockchain for Beginners", link: "https://youtu.be/gyMwXuJrbvo", duration: "4h 00m", difficulty: "Easy" }],
      intermediate: [{ title: "Solidity & Smart Contracts", link: "https://youtu.be/M576WGiDBdQ", duration: "12h 00m", difficulty: "Hard" }],
      advanced: [{ title: "dApp Development Tutorial", link: "https://youtu.be/coQ5dg8wM2o", duration: "10h 00m", difficulty: "Hard" }],
      tools: [{ title: "Web3.js & Ethers.js", link: "https://youtu.be/YK0mPAn_uAs", duration: "3h 00m", difficulty: "Hard" }],
    },
    game: {
      beginner: [{ title: "Unity Game Dev Course", link: "https://youtu.be/gB1F9G0JXOo", duration: "9h 00m", difficulty: "Medium" }],
      intermediate: [{ title: "C# for Unity Development", link: "https://youtu.be/mXmGY6n5KkQ", duration: "5h 00m", difficulty: "Medium" }],
      advanced: [{ title: "Unreal Engine 5 Graphics", link: "https://youtu.be/gQmiqmxnM4A", duration: "11h 00m", difficulty: "Hard" }],
      tools: [{ title: "Blender 3D Modeling", link: "https://youtu.be/nIoXOplUvww", duration: "4h 00m", difficulty: "Medium" }],
    },
    qa: {
      beginner: [{ title: "Software Testing Basics", link: "https://youtu.be/8fS26U3uA6Y", duration: "4h 00m", difficulty: "Easy" }],
      intermediate: [{ title: "Selenium Automation Course", link: "https://youtu.be/XOC9W98EaN0", duration: "8h 00m", difficulty: "Medium" }],
      advanced: [{ title: "Cypress Testing Framework", link: "https://youtu.be/u8vMu7mIook", duration: "5h 00m", difficulty: "Hard" }],
      tools: [{ title: "JMeter Performance Testing", link: "https://youtu.be/wXN4B6FvD_s", duration: "3h 00m", difficulty: "Medium" }],
    },
    dataanalyst: {
      beginner: [{ title: "SQL for Data Science", link: "https://youtu.be/7S_kzvWud88", duration: "4h 00m", difficulty: "Medium" }],
      intermediate: [{ title: "Tableau Data Visualization", link: "https://youtu.be/6mDua_7L2fU", duration: "5h 00m", difficulty: "Medium" }],
      advanced: [{ title: "PowerBI Analytics Course", link: "https://youtu.be/TmhQCQr_DqM", duration: "8h 00m", difficulty: "Hard" }],
      tools: [{ title: "Excel for Data Analysis", link: "https://youtu.be/Ox90Yk5m-eM", duration: "3h 00m", difficulty: "Easy" }],
    },
    pm: {
      beginner: [{ title: "Project Management Basics", link: "https://youtu.be/9_LAbZ_r1XQ", duration: "5h 00m", difficulty: "Easy" }],
      intermediate: [{ title: "Agile & Scrum Tutorial", link: "https://youtu.be/2u77K929qYg", duration: "3h 00m", difficulty: "Medium" }],
      advanced: [{ title: "PMP Exam Prep Guide", link: "https://youtu.be/R9N_uY9oU-s", duration: "10h 00m", difficulty: "Hard" }],
      tools: [{ title: "Jira for Beginners", link: "https://youtu.be/C6p47rA9K9o", duration: "2h 00m", difficulty: "Easy" }],
    },
    hacker: {
      beginner: [{ title: "Ethical Hacking Intro", link: "https://youtu.be/3Kq1MIfTWCE", duration: "10h 00m", difficulty: "Medium" }],
      intermediate: [{ title: "Web Hacking Techniques", link: "https://youtu.be/8lR27r8Y_7Y", duration: "5h 00m", difficulty: "Hard" }],
      advanced: [{ title: "Bug Bounty Hunting Course", link: "https://youtu.be/zZ28sH95PTo", duration: "12h 00m", difficulty: "Hard" }],
      tools: [{ title: "Burp Suite Masterclass", link: "https://youtu.be/WSTvT79C_Xk", duration: "4h 00m", difficulty: "Hard" }],
    },
    architect: {
      beginner: [{ title: "System Design Essentials", link: "https://youtu.be/m8Icp_Cid5o", duration: "6h 00m", difficulty: "Medium" }],
      intermediate: [{ title: "Microservices Architecture", link: "https://youtu.be/CdBtNQZH8a4", duration: "8h 00m", difficulty: "Hard" }],
      advanced: [{ title: "High Level System Design", link: "https://youtu.be/SqcXycl_Pew", duration: "10h 00m", difficulty: "Hard" }],
      tools: [{ title: "UML Diagramming Tutorial", link: "https://youtu.be/Wn_Y8w_J-7Y", duration: "2h 00m", difficulty: "Medium" }],
    },
    embedded: {
      beginner: [{ title: "Embedded Systems Basics", link: "https://youtu.be/B6hI9S8Y_6o", duration: "5h 00m", difficulty: "Medium" }],
      intermediate: [{ title: "Arduino Programming Course", link: "https://youtu.be/mC7ne5m6080", duration: "8h 00m", difficulty: "Medium" }],
      advanced: [{ title: "RTOS Concepts & Real-time", link: "https://youtu.be/L72fhGm1tfE", duration: "10h 00m", difficulty: "Hard" }],
      tools: [{ title: "PCB Design for Beginners", link: "https://youtu.be/7-vV_8K-R_M", duration: "4h 00m", difficulty: "Medium" }],
    },
  };

  const currentRole = roles.find(r => r.id === activeRole);
  const progressPercent = calculateProgress();

  if (loading) {
    return <div className="roadmap-loading">Loading Roadmap Data...</div>;
  }

  // Combine stages into one straight path
  const stages = [
    { title: "Foundation", data: roadmapData[activeRole].beginner },
    { title: "Core Skills", data: roadmapData[activeRole].intermediate },
    { title: "Advanced", data: roadmapData[activeRole].advanced },
    { title: "Tools & Extras", data: roadmapData[activeRole].tools }
  ];

  return (
    <main className="roadmap-container">
      {/* Sidebar Role Selection */}
      <aside className="roadmap-sidebar">
        <h2 className="sidebar-title">Career Tracks</h2>
        <div className="role-list">
          {roles.map((role) => (
            <button
              key={role.id}
              className={`role-item ${activeRole === role.id ? 'active' : ''}`}
              onClick={() => setActiveRole(role.id)}
            >
              <i className={role.icon}></i>
              <span>{role.label}</span>
              {activeRole === role.id && calculateRoleProgress(role.id) > 0 && (
                <span className="mini-progress">{calculateRoleProgress(role.id)}%</span>
              )}
            </button>
          ))}
        </div>
      </aside>

      {/* Main Roadmap Area */}
      <section className="roadmap-main">
        {/* Header Dashboard */}
        <div className="roadmap-header">
          <div className="header-info">
            <h1>{currentRole.label} Path</h1>
            <p className="milestone-text">{getNextMilestone()}</p>
          </div>
          
          <div className="progress-dashboard">
            <div className="progress-stat">
              <span className="stat-label">Progress</span>
              <span className="stat-value">{progressPercent}%</span>
              <div className="mini-bar"><div className="fill" style={{width: `${progressPercent}%`}}></div></div>
            </div>
            <div className="progress-stat">
              <span className="stat-label">Watch Time</span>
              <span className="stat-value">{formatWatchTime(totalWatchTime)}</span>
            </div>
            <div className="progress-stat">
              <span className="stat-label">Streak</span>
              <span className="stat-value">{learningStreak} <span>🔥</span></span>
            </div>
          </div>
        </div>

        {/* Vertical Realistic Roadmap Timeline */}
        <div className="roadmap-timeline">
          {stages.map((stage, stageIndex) => (
            <div key={stageIndex} className="timeline-stage">
              <h3 className="stage-title">{stage.title}</h3>
              <div className="stage-nodes">
                {stage.data.map((item, idx) => {
                  const isCompleted = completedVideos.includes(item.title);
                  // Calculate if this node is "active" (meaning previous ones are done)
                  // For a simple UX, they are all clickable, but we style completed vs uncompleted.
                  return (
                    <div key={idx} className={`node-item ${isCompleted ? 'completed' : 'pending'}`}>
                      {/* Drawing the connecting line */}
                      <div className="node-line"></div>
                      
                      {/* The dot / icon */}
                      <button 
                        className="node-circle" 
                        onClick={() => toggleComplete(item.title, item.duration)}
                        title={isCompleted ? "Mark uncompleted" : "Mark completed"}
                      >
                        {isCompleted ? <FaCheck /> : <FaLock className="lock-icon"/>}
                      </button>

                      {/* Content Card */}
                      <div className="node-content">
                        <div className="node-header">
                          <span className={`badge ${getDifficultyBadge(item.difficulty)}`}>{item.difficulty}</span>
                          <span className="duration"><i className="fas fa-clock"></i> {item.duration}</span>
                        </div>
                        <h4>{item.title}</h4>
                        <a href={item.link} target="_blank" rel="noopener noreferrer" className="watch-btn" onClick={(e) => e.stopPropagation()}>
                          <FaYoutube className="yt-icon" /> Watch Video
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}