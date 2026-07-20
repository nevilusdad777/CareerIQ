import { useState, useEffect } from "react";
import axios from "axios";
import "./Predictor.css";

export default function Predictor() {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // User Profile State
  const [userProfile, setUserProfile] = useState({
    education: undefined,
    experience: 0,
    projects: 0,
    internships: 0,
    certifications: 0,
    cgpa: 0,
    communication: undefined,
    location: '',
    targetRole: ''
  });
  
  // Enhanced Skills State
  const [skills, setSkills] = useState({
    // Frontend Skills
    HTML: 0,
    CSS: 0,
    JavaScript: 0,
    React: 0,
    Angular: 0,
    Vue: 0,
    // Backend Skills
    NodeJS: 0,
    Python: 0,
    Java: 0,
    DotNet: 0,
    PHP: 0,
    Ruby: 0,
    // Database Skills
    MongoDB: 0,
    MySQL: 0,
    PostgreSQL: 0,
    Oracle: 0,
    Redis: 0,
    // DevOps Skills
    Docker: 0,
    Kubernetes: 0,
    Jenkins: 0,
    Git: 0,
    CI_CD: 0,
    AWS: 0,
    Azure: 0,
    GCP: 0,
    // Mobile Skills
    ReactNative: 0,
    Flutter: 0,
    Swift: 0,
    Kotlin: 0,
    // Soft Skills
    Communication: 0,
    Teamwork: 0,
    Leadership: 0,
    ProblemSolving: 0,
    TimeManagement: 0,
    Adaptability: 0,
    // Additional Skills
    DSA: 0,
    Aptitude: 0,
    SystemDesign: 0,
    Testing: 0,
    Security: 0,
    Performance: 0
  });
  
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  // Enhanced target roles with required skills (25+ roles)
  const targetRoles = [
    {
      name: "Frontend Developer",
      requiredSkills: { HTML: 70, CSS: 70, JavaScript: 75, React: 70, Communication: 65 },
      salaryRange: { min: 45000, max: 120000 },
      demandLevel: "High",
      category: "Frontend"
    },
    {
      name: "Backend Developer",
      requiredSkills: { JavaScript: 70, NodeJS: 75, MongoDB: 70, Python: 60, DSA: 70 },
      salaryRange: { min: 55000, max: 140000 },
      demandLevel: "High",
      category: "Backend"
    },
    {
      name: "Full Stack Developer",
      requiredSkills: { HTML: 65, CSS: 65, JavaScript: 80, React: 70, NodeJS: 70, MongoDB: 65, DSA: 65 },
      salaryRange: { min: 65000, max: 160000 },
      demandLevel: "Very High",
      category: "Full Stack"
    },
    {
      name: "Python Developer",
      requiredSkills: { Python: 80, DSA: 70, MongoDB: 60, Communication: 60 },
      salaryRange: { min: 60000, max: 130000 },
      demandLevel: "High",
      category: "Backend"
    },
    {
      name: "Data Analyst",
      requiredSkills: { Python: 75, DSA: 60, Aptitude: 70, Communication: 65 },
      salaryRange: { min: 55000, max: 120000 },
      demandLevel: "Medium",
      category: "Data"
    },
    {
      name: "Software Engineer",
      requiredSkills: { JavaScript: 75, DSA: 80, Python: 70, Communication: 70, Aptitude: 75 },
      salaryRange: { min: 70000, max: 150000 },
      demandLevel: "Very High",
      category: "General"
    },
    {
      name: "DevOps Engineer",
      requiredSkills: { Docker: 80, Kubernetes: 70, Jenkins: 60, CI_CD: 70, Git: 70 },
      salaryRange: { min: 75000, max: 180000 },
      demandLevel: "Very High",
      category: "DevOps"
    },
    {
      name: "Mobile Developer",
      requiredSkills: { ReactNative: 70, Flutter: 70, JavaScript: 60, React: 60 },
      salaryRange: { min: 55000, max: 130000 },
      demandLevel: "High",
      category: "Mobile"
    },
    {
      name: "Data Scientist",
      requiredSkills: { Python: 85, DSA: 80, MongoDB: 70, ProblemSolving: 80, Communication: 60 },
      salaryRange: { min: 85000, max: 200000 },
      demandLevel: "Very High",
      category: "Data"
    },
    {
      name: "Cloud Engineer",
      requiredSkills: { AWS: 85, Azure: 80, GCP: 80, Docker: 75, Kubernetes: 80 },
      salaryRange: { min: 80000, max: 220000 },
      demandLevel: "Very High",
      category: "Cloud"
    },
    {
      name: "UI/UX Designer",
      requiredSkills: { HTML: 80, CSS: 85, JavaScript: 60, Communication: 80, Adaptability: 70 },
      salaryRange: { min: 45000, max: 110000 },
      demandLevel: "Medium",
      category: "Design"
    },
    {
      name: "Machine Learning Engineer",
      requiredSkills: { Python: 90, DSA: 85, MongoDB: 75, ProblemSolving: 85, SystemDesign: 70 },
      salaryRange: { min: 90000, max: 250000 },
      demandLevel: "Very High",
      category: "AI/ML"
    },
    {
      name: "React Developer",
      requiredSkills: { HTML: 75, CSS: 70, JavaScript: 80, React: 85, Communication: 65 },
      salaryRange: { min: 50000, max: 130000 },
      demandLevel: "High",
      category: "Frontend"
    },
    {
      name: "Angular Developer",
      requiredSkills: { HTML: 70, CSS: 70, JavaScript: 75, Angular: 85, Communication: 65 },
      salaryRange: { min: 48000, max: 125000 },
      demandLevel: "Medium",
      category: "Frontend"
    },
    {
      name: "Vue.js Developer",
      requiredSkills: { HTML: 70, CSS: 70, JavaScript: 75, Vue: 85, Communication: 65 },
      salaryRange: { min: 46000, max: 120000 },
      demandLevel: "Medium",
      category: "Frontend"
    },
    {
      name: "Java Developer",
      requiredSkills: { Java: 85, DSA: 75, MySQL: 70, Communication: 60, SystemDesign: 65 },
      salaryRange: { min: 65000, max: 140000 },
      demandLevel: "High",
      category: "Backend"
    },
    {
      name: ".NET Developer",
      requiredSkills: { DotNet: 85, DSA: 70, MySQL: 70, Communication: 60, SystemDesign: 65 },
      salaryRange: { min: 62000, max: 135000 },
      demandLevel: "Medium",
      category: "Backend"
    },
    {
      name: "PHP Developer",
      requiredSkills: { PHP: 85, MySQL: 75, JavaScript: 60, Communication: 60 },
      salaryRange: { min: 45000, max: 110000 },
      demandLevel: "Low",
      category: "Backend"
    },
    {
      name: "Ruby Developer",
      requiredSkills: { Ruby: 85, MySQL: 70, JavaScript: 60, Communication: 60 },
      salaryRange: { min: 48000, max: 115000 },
      demandLevel: "Low",
      category: "Backend"
    },
    {
      name: "Database Administrator",
      requiredSkills: { MySQL: 85, PostgreSQL: 80, MongoDB: 75, Oracle: 70, Security: 65 },
      salaryRange: { min: 60000, max: 130000 },
      demandLevel: "Medium",
      category: "Database"
    },
    {
      name: "QA Engineer",
      requiredSkills: { Testing: 85, Communication: 75, ProblemSolving: 70, Attention: 80 },
      salaryRange: { min: 50000, max: 110000 },
      demandLevel: "Medium",
      category: "Testing"
    },
    {
      name: "Security Engineer",
      requiredSkills: { Security: 90, Network: 80, ProblemSolving: 75, Communication: 70 },
      salaryRange: { min: 80000, max: 180000 },
      demandLevel: "Very High",
      category: "Security"
    },
    {
      name: "Performance Engineer",
      requiredSkills: { Performance: 90, Testing: 75, ProblemSolving: 80, SystemDesign: 70 },
      salaryRange: { min: 70000, max: 150000 },
      demandLevel: "High",
      category: "Performance"
    },
    {
      name: "iOS Developer",
      requiredSkills: { Swift: 85, iOS: 80, Communication: 65, ProblemSolving: 70 },
      salaryRange: { min: 60000, max: 140000 },
      demandLevel: "Medium",
      category: "Mobile"
    },
    {
      name: "Android Developer",
      requiredSkills: { Kotlin: 85, Android: 80, Communication: 65, ProblemSolving: 70 },
      salaryRange: { min: 58000, max: 135000 },
      demandLevel: "Medium",
      category: "Mobile"
    },
    {
      name: "Flutter Developer",
      requiredSkills: { Flutter: 85, Dart: 80, Mobile: 75, Communication: 65 },
      salaryRange: { min: 55000, max: 130000 },
      demandLevel: "Medium",
      category: "Mobile"
    },
    {
      name: "Site Reliability Engineer",
      requiredSkills: { Kubernetes: 85, Docker: 80, Monitoring: 75, ProblemSolving: 80, Communication: 70 },
      salaryRange: { min: 85000, max: 190000 },
      demandLevel: "Very High",
      category: "DevOps"
    },
    {
      name: "Technical Lead",
      requiredSkills: { Leadership: 85, Communication: 80, SystemDesign: 80, ProblemSolving: 75, Teamwork: 80 },
      salaryRange: { min: 90000, max: 200000 },
      demandLevel: "High",
      category: "Leadership"
    },
    {
      name: "Engineering Manager",
      requiredSkills: { Leadership: 90, Communication: 85, Teamwork: 85, TimeManagement: 80, ProblemSolving: 75 },
      salaryRange: { min: 100000, max: 250000 },
      demandLevel: "High",
      category: "Leadership"
    }
  ];

  const [selectedRole, setSelectedRole] = useState(null);
  const [roleRequirements, setRoleRequirements] = useState({});

  // Enhanced industry demand with levels
  const industryDemand = {
    // Frontend Skills
    HTML: { level: 95, demand: "Very High" },
    CSS: { level: 90, demand: "Very High" },
    JavaScript: { level: 95, demand: "Very High" },
    React: { level: 85, demand: "Very High" },
    Angular: { level: 75, demand: "High" },
    Vue: { level: 70, demand: "Medium" },
    
    // Backend Skills
    NodeJS: { level: 85, demand: "Very High" },
    Python: { level: 90, demand: "Very High" },
    Java: { level: 80, demand: "High" },
    DotNet: { level: 70, demand: "Medium" },
    PHP: { level: 60, demand: "Medium" },
    Ruby: { level: 50, demand: "Low" },
    
    // Database Skills
    MongoDB: { level: 75, demand: "High" },
    MySQL: { level: 80, demand: "High" },
    PostgreSQL: { level: 75, demand: "High" },
    Oracle: { level: 65, demand: "Medium" },
    Redis: { level: 70, demand: "Medium" },
    
    // DevOps Skills
    Docker: { level: 80, demand: "Very High" },
    Kubernetes: { level: 75, demand: "High" },
    Jenkins: { level: 70, demand: "Medium" },
    Git: { level: 90, demand: "Very High" },
    CI_CD: { level: 75, demand: "High" },
    AWS: { level: 85, demand: "Very High" },
    Azure: { level: 75, demand: "High" },
    GCP: { level: 70, demand: "Medium" },
    
    // Mobile Skills
    ReactNative: { level: 70, demand: "Medium" },
    Flutter: { level: 65, demand: "Medium" },
    Swift: { level: 60, demand: "Medium" },
    Kotlin: { level: 65, demand: "Medium" },
    
    // Soft Skills
    Communication: { level: 85, demand: "Very High" },
    Teamwork: { level: 80, demand: "Very High" },
    Leadership: { level: 75, demand: "High" },
    ProblemSolving: { level: 90, demand: "Very High" },
    TimeManagement: { level: 75, demand: "High" },
    Adaptability: { level: 80, demand: "Very High" },
    
    // Additional Skills
    DSA: { level: 85, demand: "Very High" },
    Aptitude: { level: 75, demand: "High" },
    SystemDesign: { level: 80, demand: "High" },
    Testing: { level: 70, demand: "Medium" },
    Security: { level: 75, demand: "High" },
    Performance: { level: 70, demand: "Medium" }
  };

  // Load history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("predictionHistory");
    if (saved) {
      setHistory(JSON.parse(saved));
    }
  }, []);

  // Handle slider change
  const handleChange = (skill, value) => {
    setSkills({ ...skills, [skill]: Number(value) });
  };

  // Handle profile change
  const handleProfileChange = (field, value) => {
    setUserProfile({ ...userProfile, [field]: value });
    
    // If target role is changed, update role requirements and load default skill levels
    if (field === 'targetRole') {
      const role = targetRoles.find(r => r.name === value);
      setSelectedRole(role);
      if (role) {
        setRoleRequirements(role.requiredSkills);
        loadRoleBasedSkills(role.requiredSkills);
      } else {
        setRoleRequirements({});
        // Reset skills to 0 if no role selected
        const resetSkills = Object.keys(skills).reduce((acc, key) => {
          acc[key] = 0;
          return acc;
        }, {});
        setSkills(resetSkills);
      }
    }
  };

  // Load role-based default skill levels
  const loadRoleBasedSkills = (requiredSkills) => {
    // Create a copy of current skills to update
    const updatedSkills = { ...skills };
    
    // Set skill levels based on role requirements
    Object.keys(updatedSkills).forEach(skill => {
      if (requiredSkills[skill]) {
        // Set to 70% of required level as a starting point
        updatedSkills[skill] = Math.round(requiredSkills[skill] * 0.7);
      } else {
        // Set non-required skills to a lower default (30%)
        updatedSkills[skill] = 30;
      }
    });
    
    setSkills(updatedSkills);
  };

  // Reset skills to role defaults
  const resetToRoleDefaults = () => {
    if (selectedRole && Object.keys(roleRequirements).length > 0) {
      loadRoleBasedSkills(roleRequirements);
    }
  };

  // Validate current step
  const validateStep = () => {
    if (currentStep === 1) {
      return userProfile.education && userProfile.communication && userProfile.location && userProfile.targetRole;
    }
    return true;
  };

  // Next step
  const nextStep = () => {
    if (validateStep()) {
      setCurrentStep(currentStep + 1);
    } else {
      alert('Please fill in all required fields');
    }
  };

  // Previous step
  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  // Reset form
  const resetForm = () => {
    setCurrentStep(1);
    setUserProfile({
      education: '',
      experience: 0,
      projects: 0,
      internships: 0,
      certifications: 0,
      cgpa: 0,
      communication: '',
      location: '',
      targetRole: ''
    });
    const resetSkills = Object.keys(skills).reduce((acc, key) => {
      acc[key] = 0;
      return acc;
    }, {});
    setSkills(resetSkills);
    setResult(null);
  };

  // Calculate role matches
  const calculateRoleMatches = (skillSet) => {
    return targetRoles.map((role) => {
      const matches = Object.keys(role.requiredSkills).map((skill) => {
        const required = role.requiredSkills[skill];
        const current = skillSet[skill] || 0;
        return Math.min((current / required) * 100, 100);
      });
      const avgMatch = matches.reduce((a, b) => a + b, 0) / matches.length;
      return { 
        name: role.name, 
        match: Math.round(avgMatch),
        salaryRange: role.salaryRange,
        demandLevel: role.demandLevel,
        category: role.category
      };
    }).sort((a, b) => b.match - a.match);
  };

  // Generate improvement roadmap
  const generateRoadmap = (weaknesses) => {
    const roadmapData = {
      HTML: { videos: 3, days: 5, priority: "Low" },
      CSS: { videos: 4, days: 7, priority: "Low" },
      JavaScript: { videos: 8, days: 20, priority: "High" },
      React: { videos: 6, days: 15, priority: "High" },
      NodeJS: { videos: 5, days: 12, priority: "Medium" },
      MongoDB: { videos: 4, days: 10, priority: "Medium" },
      Python: { videos: 6, days: 18, priority: "High" },
      DSA: { videos: 10, days: 30, priority: "Very High" },
      Communication: { videos: 5, days: 14, priority: "High" },
      Aptitude: { videos: 7, days: 21, priority: "High" },
    };

    return weaknesses.map((skill) => ({
      skill,
      ...(roadmapData[skill] || { videos: 5, days: 14, priority: "Medium" }),
    }));
  };

  // YouTube learning links for each skill
  const youtubeLinks = {
    HTML: "https://youtu.be/BsDoLVMnmZs",
    CSS: "https://youtu.be/Edsxf_NBFrw",
    JavaScript: "https://youtu.be/PkZNo7MFNFg",
    React: "https://youtu.be/bMknfKXIFA8",
    NodeJS: "https://youtu.be/pKd0Rpw7O48",
    MongoDB: "https://youtu.be/fgTGADljAeg",
    Python: "https://youtu.be/_uQrJ0TkZlc",
    DSA: "https://youtu.be/RBSGKlAvoiM",
    Communication: "https://youtu.be/cEYzMaKsyns",
    Aptitude: "https://youtu.be/7HyKEZWZ4bU",
  };

  // Redirect to roadmap page with specific skill filter
  const handleStartLearning = (skill) => {
    // Open YouTube link in new tab
    const youtubeUrl = youtubeLinks[skill];
    if (youtubeUrl) {
      window.open(youtubeUrl, '_blank');
    }
  };

  // Enhanced prediction logic
  const predictPlacement = async () => {
    setLoading(true);
    
    // Calculate skill average
    const values = Object.values(skills);
    const total = values.reduce((a, b) => a + b, 0);
    const avg = total / values.length;
    
    // Calculate enhanced placement probability based on multiple factors
    const experienceBonus = Math.min(userProfile.experience * 2, 20);
    const educationBonus = userProfile.education === "PhD" ? 15 : userProfile.education === "Master's" ? 10 : userProfile.education === "Bachelor's" ? 5 : 2;
    const projectBonus = Math.min(userProfile.projects * 1.5, 15);
    const certificationBonus = Math.min(userProfile.certifications * 1, 10);
    const cgpaBonus = userProfile.cgpa >= 8 ? 10 : userProfile.cgpa >= 7 ? 5 : userProfile.cgpa >= 6 ? 2 : 0;
    
    const baseScore = avg + experienceBonus + educationBonus + projectBonus + certificationBonus + cgpaBonus;
    const placementProbability = Math.min(Math.round(baseScore * 0.9), 95);
    
    let probability = "";
    let level = "";
    let readinessScore = 0;
    let readinessLevel = "";
    let color = "";
    let salaryExpectation = 0;
    let timeToPlacement = "";

    if (placementProbability >= 85) {
      probability = "Very High (85% - 95%)";
      level = "Excellent";
      readinessScore = 95;
      readinessLevel = "Highly Ready";
      color = "#10b981";
      timeToPlacement = "0-1 months";
      salaryExpectation = 80000 + (placementProbability - 85) * 2000;
    } else if (placementProbability >= 75) {
      probability = "High (75% - 85%)";
      level = "Very Good";
      readinessScore = 85;
      readinessLevel = "Placement Ready";
      color = "#10b981";
      timeToPlacement = "1-3 months";
      salaryExpectation = 65000 + (placementProbability - 75) * 1500;
    } else if (placementProbability >= 60) {
      probability = "Medium (60% - 75%)";
      level = "Good";
      readinessScore = 70;
      readinessLevel = "Almost Ready";
      color = "#f59e0b";
      timeToPlacement = "3-6 months";
      salaryExpectation = 50000 + (placementProbability - 60) * 1000;
    } else if (placementProbability >= 45) {
      probability = "Low (45% - 60%)";
      level = "Average";
      readinessScore = 55;
      readinessLevel = "Needs Training";
      color = "#2563eb"; // Blue
      timeToPlacement = "6-12 months";
      salaryExpectation = 40000 + (placementProbability - 45) * 500;
    } else {
      probability = "Very Low (< 45%)";
      level = "Needs Improvement";
      readinessScore = 35;
      readinessLevel = "Not Ready";
      color = "#ef4444";
      timeToPlacement = "12+ months";
      salaryExpectation = 30000 + placementProbability * 200;
    }

    const strengths = Object.keys(skills).filter((s) => skills[s] >= 75);
    const weaknesses = Object.keys(skills).filter((s) => skills[s] < 60);
    
    // Calculate skill gaps based on the selected target role requirements
    let skillGaps = [];
    if (selectedRole && Object.keys(roleRequirements).length > 0) {
      skillGaps = Object.keys(roleRequirements).filter(
        (skill) => (skills[skill] || 0) < roleRequirements[skill]
      );
    } else {
      skillGaps = weaknesses;
    }
    
    const roleMatches = calculateRoleMatches(skills);
    const roadmap = generateRoadmap(skillGaps);

    const predictionResult = {
      avg: avg.toFixed(1),
      probability,
      level,
      readinessScore,
      readinessLevel,
      color,
      roleMatches,
      strengths,
      weaknesses,
      roadmap,
      salaryExpectation,
      timeToPlacement,
      userProfile,
      date: new Date().toLocaleDateString("en-IN"),
    };

    setResult(predictionResult);

    // Save to history
    const newHistory = [...history, { ...predictionResult, skills: { ...skills } }];
    setHistory(newHistory);
    localStorage.setItem("predictionHistory", JSON.stringify(newHistory));

    // Navigate to results page (Step 3)
    setCurrentStep(3);

    // Save to backend
    try {
      const currentUser = JSON.parse(sessionStorage.getItem("currentUser"));
      if (!currentUser || !currentUser.id) {
        console.log("User not logged in, saving locally only");
      } else {
        // Prepare enhanced predictor inputs for analytics
        const predictorInputs = {
          ...userProfile,
          skills: skills,
          overallScore: avg,
          placementProbability,
          targetRole: userProfile.targetRole,
          strengths,
          weaknesses,
          roleMatches: roleMatches.slice(0, 3),
          salaryExpectation,
          timeToPlacement
        };
        
        const response = await axios.post("http://localhost:5000/api/analytics/predictor", {
          userId: currentUser.id,
          predictorInputs
        });

        if (response.data.success) {
          console.log("Predictor data saved to analytics:", response.data.data);
        }
      }
    } catch (error) {
      console.error("Error saving predictor data:", error);
    } finally {
      setLoading(false);
    }
  };

  const resetSkills = () => {
    const resetSkills = Object.keys(skills).reduce((acc, key) => {
      acc[key] = 0;
      return acc;
    }, {});
    setSkills(resetSkills);
    setResult(null);
  };

  const deleteHistory = () => {
    setHistory([]);
    localStorage.removeItem("predictionHistory");
  };

  const getDemandColor = (demand) => {
    if (demand === "Very High") return "#ef4444";
    if (demand === "High") return "#f59e0b";
    return "#3b82f6";
  };

  return (
    <main className="predictor">
      {/* Header */}
      <div className="predictor-header">
        <h2>AI Placement Predictor</h2>
        <p>Rate your skills honestly to get accurate placement predictions</p>
        <div className="header-actions">
          <button className="history-btn" onClick={() => setShowHistory(!showHistory)}>
            View History ({history.length})
          </button>
          <button className="reset-btn" onClick={resetSkills}>
            Reset
          </button>
        </div>
      </div>

      {/* History Modal */}
      {showHistory && (
        <div className="history-modal">
          <div className="history-content">
            <div className="history-header">
              <h3>Prediction History</h3>
              <button className="close-btn" onClick={() => setShowHistory(false)}>
                ×
              </button>
            </div>
            {history.length === 0 ? (
              <p className="no-history">No predictions yet. Take your first test!</p>
            ) : (
              <>
                <div className="history-list">
                  {history.map((item, index) => (
                    <div className="history-item" key={index}>
                      <div className="history-info">
                        <span className="history-date">{item.date}</span>
                        <span className="history-score">Score: {item.avg}</span>
                        <span className={`history-level ${(item.readinessLevel || "").toLowerCase().replace(" ", "-")}`}>
                          {item.readinessLevel}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <button className="delete-history-btn" onClick={deleteHistory}>
                  Clear All History
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Step 1: User Profile */}
      {currentStep === 1 && (
        <section className="profile-section">
          <h3>Your Profile Information</h3>
          <div className="profile-grid">
            <div className="form-group">
              <label>Education Level *</label>
              <select value={userProfile.education || ''} onChange={(e) => handleProfileChange('education', e.target.value)} required>
                <option value="">Select Education</option>
                <option value="High School">High School</option>
                <option value="Diploma">Diploma</option>
                <option value="Bachelor's">Bachelor's</option>
                <option value="Master's">Master's</option>
                <option value="PhD">PhD</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label>Years of Experience</label>
              <input type="number" min="0" max="30" value={userProfile.experience} onChange={(e) => handleProfileChange('experience', e.target.value)} />
            </div>

            <div className="form-group">
              <label>Number of Projects</label>
              <input type="number" min="0" max="50" value={userProfile.projects} onChange={(e) => handleProfileChange('projects', e.target.value)} />
            </div>

            <div className="form-group">
              <label>Number of Internships</label>
              <input type="number" min="0" max="10" value={userProfile.internships} onChange={(e) => handleProfileChange('internships', e.target.value)} />
            </div>

            <div className="form-group">
              <label>Number of Certifications</label>
              <input type="number" min="0" max="20" value={userProfile.certifications} onChange={(e) => handleProfileChange('certifications', e.target.value)} />
            </div>

            <div className="form-group">
              <label>CGPA (0-10)</label>
              <input type="number" min="0" max="10" step="0.1" value={userProfile.cgpa} onChange={(e) => handleProfileChange('cgpa', e.target.value)} />
            </div>

            <div className="form-group">
              <label>Communication Skills *</label>
              <select value={userProfile.communication || ''} onChange={(e) => handleProfileChange('communication', e.target.value)} required>
                <option value="">Select Level</option>
                <option value="Poor">Poor</option>
                <option value="Average">Average</option>
                <option value="Good">Good</option>
                <option value="Excellent">Excellent</option>
              </select>
            </div>

            <div className="form-group">
              <label>Location *</label>
              <input type="text" value={userProfile.location} onChange={(e) => handleProfileChange('location', e.target.value)} placeholder="City, Country" required />
            </div>

            <div className="form-group">
              <label>Target Role *</label>
              <select value={userProfile.targetRole} onChange={(e) => handleProfileChange('targetRole', e.target.value)} required>
                <option value="">Select Target Role</option>
                {targetRoles.map((role) => (
                  <option key={role.name} value={role.name}>
                    {role.name} ({role.category}) - ${role.salaryRange.min.toLocaleString()}-${role.salaryRange.max.toLocaleString()}
                  </option>
                ))}
              </select>
            </div>

            {/* Role Requirements Display */}
            {selectedRole && Object.keys(roleRequirements).length > 0 && (
              <div className="form-group role-requirements">
                <label>Required Skills for {selectedRole.name}</label>
                <div className="requirements-grid">
                  {Object.entries(roleRequirements).map(([skill, level]) => (
                    <div className="requirement-item" key={skill}>
                      <span className="requirement-skill">
                        {skill}
                      </span>
                      <span className="requirement-level">{level}%</span>
                    </div>
                  ))}
                </div>
                <div className="role-info">
                  <span className={`demand-badge ${(selectedRole?.demandLevel || "").toLowerCase()}`}>
                    {selectedRole.demandLevel} Demand
                  </span>
                  <span className="salary-info">
                    ${selectedRole.salaryRange.min.toLocaleString()} - ${selectedRole.salaryRange.max.toLocaleString()}
                  </span>
                </div>
              </div>
            )}
          </div>
          <div className="navigation-buttons">
            <button className="next-btn" onClick={nextStep}>
              Next →
            </button>
          </div>
        </section>
      )}

      {/* Step 2: Skills Assessment */}
      {currentStep === 2 && (
      <section className="skills-section">
        <h3>Rate Your Skills (0 - 100)</h3>
        
        {/* Target Role Skills Highlight */}
        {selectedRole && Object.keys(roleRequirements).length > 0 && (
          <div className="role-skills-highlight">
            <div className="highlight-header">
              <span>Focus on these skills for {selectedRole.name}</span>
              <button 
                className="reset-role-btn" 
                onClick={resetToRoleDefaults}
                title="Reset skills to role defaults"
              >
                Reset to Defaults
              </button>
            </div>
            <div className="highlight-skills">
              {Object.entries(roleRequirements).map(([skill, required]) => {
                const current = skills[skill] || 0;
                const percentage = Math.min((current / required) * 100, 100);
                const status = percentage >= 100 ? 'met' : percentage >= 70 ? 'close' : 'needs-work';
                
                return (
                  <div className={`highlight-skill ${status}`} key={skill}>
                    <div className="skill-info">
                      <span>{skill}</span>
                    </div>
                    <div className="skill-progress">
                      <div className="progress-bar">
                        <div 
                          className="progress-fill" 
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <span className="skill-percentage">{current}%/{required}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="role-defaults-info">
              <p>Skills have been automatically set to 70% of required levels for your selected role. Adjust as needed and use "Reset to Defaults" to restore these values.</p>
            </div>
          </div>
        )}
        <div className="skills-grid">
          {selectedRole && Object.keys(roleRequirements).length > 0 ? (
            // Show only required skills for the selected role
            Object.keys(roleRequirements).map((skill) => (
              <div className="skill-slider required-skill" key={skill}>
                <div className="skill-header">
                  <div className="skill-info">
                    <span className="skill-name">{skill}</span>
                    <span className="skill-required-badge">Required</span>
                  </div>
                  <span className="skill-value">{skills[skill]}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={skills[skill]}
                  onChange={(e) => handleChange(skill, e.target.value)}
                  className="slider"
                  style={{
                    background: `linear-gradient(to right, #2563eb 0%, #2563eb ${skills[skill]}%, #e5e7eb ${skills[skill]}%, #e5e7eb 100%)`
                  }}
                />
                <div className="skill-marks">
                  <span>0</span>
                  <span>{roleRequirements[skill]}%</span>
                  <span>100</span>
                </div>
              </div>
            ))
          ) : (
            // Show all skills when no role is selected
            Object.keys(skills).map((skill) => (
              <div className="skill-slider" key={skill}>
                <div className="skill-header">
                  <div className="skill-info">
                    <span className="skill-name">{skill}</span>
                  </div>
                  <span className="skill-value">{skills[skill]}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={skills[skill]}
                  onChange={(e) => handleChange(skill, e.target.value)}
                  className="slider"
                  style={{
                    background: `linear-gradient(to right, #2563eb 0%, #2563eb ${skills[skill]}%, #e5e7eb ${skills[skill]}%, #e5e7eb 100%)`
                  }}
                />
                <div className="skill-marks">
                  <span>0</span>
                  <span>50</span>
                  <span>100</span>
                </div>
              </div>
            ))
          )}
        </div>
        <button className="predict-btn" onClick={predictPlacement} disabled={loading}>
          {loading ? (
            <>
              Analyzing...
            </>
          ) : (
            <>
              Predict My Placement Chances
            </>
          )}
        </button>
        <div className="navigation-buttons">
          <button className="prev-btn" onClick={prevStep}>
            ← Previous
          </button>
        </div>
      </section>
      )}

      {/* Step 3: Results */}
      {currentStep === 3 && result && (
        <>
          {/* Enhanced Results with Salary and Timeline */}
          <section className="readiness-section">
            <h3>Placement Readiness Score</h3>
            <div className="readiness-meter">
              <div className="meter-container">
                <svg width="200" height="200" viewBox="0 0 200 200">
                  <circle
                    cx="100"
                    cy="100"
                    r="80"
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="20"
                  />
                  <circle
                    cx="100"
                    cy="100"
                    r="80"
                    fill="none"
                    stroke={result.color}
                    strokeWidth="20"
                    strokeDasharray="502"
                    strokeDashoffset={502 - (502 * result.readinessScore) / 100}
                    strokeLinecap="round"
                    transform="rotate(-90 100 100)"
                    style={{ transition: "stroke-dashoffset 1.5s ease" }}
                  />
                </svg>
                <div className="meter-text">
                  <span className="meter-score">{result.readinessScore}</span>
                  <span className="meter-label">{result.readinessLevel}</span>
                </div>
              </div>
              <div className="readiness-details">
                <div className="detail-item">
                  <div>
                    <strong>Average Score</strong>
                    <span>{result.avg}%</span>
                  </div>
                </div>
                <div className="detail-item">
                  <div>
                    <strong>Placement Probability</strong>
                    <span>{result.probability}</span>
                  </div>
                </div>
                <div className="detail-item">
                  <div>
                    <strong>Overall Level</strong>
                    <span>{result.level}</span>
                  </div>
                </div>
                <div className="detail-item">
                  <div>
                    <strong>Salary Expectation</strong>
                    <span>${result.salaryExpectation.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="stats-grid">
              <div className="stat-card primary">
                <div className="stat-icon"><i className="fa-solid fa-chart-pie"></i></div>
                <div className="stat-content">
                  <h4>Placement Score</h4>
                  <div className="stat-value">{result.readinessScore}%</div>
                  <div className="stat-change positive">+{Math.round(result.readinessScore - 50)}%</div>
                </div>
              </div>
              <div className="stat-card success">
                <div className="stat-icon"><i className="fa-solid fa-bullseye"></i></div>
                <div className="stat-content">
                  <h4>Skills Mastered</h4>
                  <div className="stat-value">{result.strengths.length}</div>
                  <div className="stat-change">Total skills above 75%</div>
                </div>
              </div>
              <div className="stat-card warning">
                <div className="stat-icon"><i className="fa-solid fa-triangle-exclamation"></i></div>
                <div className="stat-content">
                  <h4>Skills to Improve</h4>
                  <div className="stat-value">{result.weaknesses.length}</div>
                  <div className="stat-change">Focus areas identified</div>
                </div>
              </div>
              <div className="stat-card info">
                <div className="stat-icon"><i className="fa-solid fa-calendar-check"></i></div>
                <div className="stat-content">
                  <h4>Assessments Taken</h4>
                  <div className="stat-value">{history.length}</div>
                  <div className="stat-change">Career progress tracked</div>
                </div>
              </div>
            </div>
          </section>

          {/* Learning Progress Tracker */}
          <section className="learning-progress-section">
            <h3><i className="fa-solid fa-book-open text-blue-500 mr-2"></i> Learning Progress Tracker</h3>
            <div className="progress-overview">
              <div className="progress-stats">
                <div className="progress-stat">
                  <div className="progress-stat-header">
                    <span className="progress-label">Overall Progress</span>
                    <span className="progress-percentage">{result.readinessScore}% Complete</span>
                  </div>
                  <div className="progress-bar-container">
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${result.readinessScore}%` }}></div>
                    </div>
                  </div>
                </div>
                
                <div className="progress-stat">
                  <div className="progress-stat-header">
                    <span className="progress-label">Skills Average</span>
                    <span className="progress-percentage">{result.avg}% Average</span>
                  </div>
                  <div className="progress-bar-container">
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${result.avg}%` }}></div>
                    </div>
                  </div>
                </div>
                
                <div className="progress-stat">
                  <div className="progress-stat-header">
                    <span className="progress-label">Target Role Match</span>
                    <span className="progress-percentage">
                      {selectedRole && result.roleMatches.find(r => r.name === selectedRole.name) 
                        ? `${result.roleMatches.find(r => r.name === selectedRole.name).match}% Match` 
                        : '0% Match'}
                    </span>
                  </div>
                  <div className="progress-bar-container">
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ 
                        width: `${selectedRole && result.roleMatches.find(r => r.name === selectedRole.name) ? result.roleMatches.find(r => r.name === selectedRole.name).match : 0}%` 
                      }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Industry Insights */}
          <section className="insights-section">
            <h3><i className="fa-solid fa-magnifying-glass text-blue-500 mr-2"></i> Industry Insights</h3>
            <div className="insights-grid">
              <div className="insight-card">
                <h4><i className="fa-solid fa-chart-column text-blue-500 mr-2"></i> Market Demand</h4>
                <div className="insight-content">
                  <div className="insight-metric">
                    <span className="metric-value">High</span>
                    <span className="metric-label">Current Market</span>
                  </div>
                  <p>Software development roles are in high demand with 85% growth rate</p>
                </div>
              </div>
              <div className="insight-card">
                <h4><i className="fa-solid fa-sack-dollar text-green-500 mr-2"></i> Salary Trends</h4>
                <div className="insight-content">
                  <div className="insight-metric">
                    <span className="metric-value">${Math.round(result.salaryExpectation).toLocaleString()}</span>
                    <span className="metric-label">Your Potential</span>
                  </div>
                  <p>Average salary for your skill level in target markets</p>
                </div>
              </div>
              <div className="insight-card">
                <h4><i className="fa-solid fa-bullseye text-red-500 mr-2"></i> Success Rate</h4>
                <div className="insight-content">
                  <div className="insight-metric">
                    <span className="metric-value">{result.readinessScore >= 75 ? 'High' : result.readinessScore >= 60 ? 'Medium' : 'Low'}</span>
                    <span className="metric-label">Based on Profile</span>
                  </div>
                  <p>Users with similar profiles achieve placement within {result.timeToPlacement}</p>
                </div>
              </div>
              <div className="insight-card">
                <h4><i className="fa-solid fa-arrow-trend-up text-blue-500 mr-2"></i> Growth Potential</h4>
                <div className="insight-content">
                  <div className="insight-metric">
                    <span className="metric-value">+{Math.round((result.readinessScore - 35) * 1.5)}%</span>
                    <span className="metric-label">With Focus</span>
                  </div>
                  <p>Potential improvement with targeted skill development</p>
                </div>
              </div>
            </div>
          </section>

          {/* Achievements & Badges */}
          <section className="achievements-section">
            <h3><i className="fa-solid fa-trophy text-yellow-500 mr-2"></i> Achievements & Badges</h3>
            <div className="achievements-grid">
              <div className={`achievement-badge ${result.readinessScore >= 85 ? 'earned' : 'locked'}`}>
                <div className="badge-icon"><i className="fa-solid fa-bullseye"></i></div>
                <div className="badge-content">
                  <h4>Placement Ready</h4>
                  <p>Achieve 85%+ readiness score</p>
                </div>
              </div>
              <div className={`achievement-badge ${result.strengths.length >= 5 ? 'earned' : 'locked'}`}>
                <div className="badge-icon"><i className="fa-solid fa-dumbbell"></i></div>
                <div className="badge-content">
                  <h4>Skill Master</h4>
                  <p>Master 5+ skills at 75%+</p>
                </div>
              </div>
              <div className={`achievement-badge ${userProfile.projects >= 3 ? 'earned' : 'locked'}`}>
                <div className="badge-icon"><i className="fa-solid fa-rocket"></i></div>
                <div className="badge-content">
                  <h4>Project Builder</h4>
                  <p>Complete 3+ portfolio projects</p>
                </div>
              </div>
              <div className={`achievement-badge ${userProfile.certifications >= 2 ? 'earned' : 'locked'}`}>
                <div className="badge-icon"><i className="fa-solid fa-scroll"></i></div>
                <div className="badge-content">
                  <h4>Certified</h4>
                  <p>Earn 2+ industry certifications</p>
                </div>
              </div>
            </div>
          </section>

          {/* Comprehensive Placement Analysis */}
          <section className="analysis-section">
            <h3><i className="fa-solid fa-magnifying-glass-chart mr-2"></i> Comprehensive Placement Analysis</h3>
            <div className="analysis-grid">
              <div className="analysis-card">
                <h4><i className="fa-solid fa-chart-column mr-2"></i> Your Placement Probability</h4>
                <div className="probability-display">
                  <div className="probability-score" style={{ color: result.color }}>
                    {result.probability}
                  </div>
                  <div className="probability-details">
                    <p><strong>Analysis:</strong> Based on your skills, experience, and profile, you have a {(result.level || "").toLowerCase()} chance of getting placed.</p>
                    <div className="probability-factors">
                      <h5>Key Factors:</h5>
                      <ul>
                        <li><strong>Skills Average:</strong> {result.avg}%</li>
                        <li><strong>Experience:</strong> {userProfile.experience} years ({Math.min(userProfile.experience * 2, 20)}% bonus)</li>
                        <li><strong>Education:</strong> {userProfile.education} ({userProfile.education === "PhD" ? "15%" : userProfile.education === "Master's" ? "10%" : userProfile.education === "Bachelor's" ? "5%" : "2%"} bonus)</li>
                        <li><strong>Projects:</strong> {userProfile.projects} projects ({Math.min(userProfile.projects * 1.5, 15)}% bonus)</li>
                        <li><strong>Certifications:</strong> {userProfile.certifications} certifications ({Math.min(userProfile.certifications * 1, 10)}% bonus)</li>
                        <li><strong>CGPA:</strong> {userProfile.cgpa}/10 ({userProfile.cgpa >= 8 ? "10%" : userProfile.cgpa >= 7 ? "5%" : userProfile.cgpa >= 6 ? "2%" : "0%"} bonus)</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div className="analysis-card">
                <h4><i className="fa-solid fa-sack-dollar mr-2"></i> Salary Expectation</h4>
                <div className="salary-display">
                  <div className="salary-amount">${result.salaryExpectation.toLocaleString()}</div>
                  <div className="salary-range">
                    <p><strong>Expected Range:</strong> ${Math.round(result.salaryExpectation * 0.8).toLocaleString()} - ${Math.round(result.salaryExpectation * 1.2).toLocaleString()}</p>
                    <p><strong>Time to Placement:</strong> {result.timeToPlacement}</p>
                  </div>
                </div>
              </div>

              <div className="analysis-card">
                <h4><i className="fa-solid fa-bullseye mr-2"></i> Target Role Analysis</h4>
                <div className="target-role-analysis">
                  <p><strong>Selected Role:</strong> {userProfile.targetRole || "Not specified"}</p>
                  {selectedRole && (
                    <div className="role-analysis-details">
                      <p><strong>Category:</strong> {selectedRole.category}</p>
                      <p><strong>Demand Level:</strong> <span className={`demand-badge ${(selectedRole?.demandLevel || "").toLowerCase()}`}>{selectedRole.demandLevel}</span></p>
                      <p><strong>Required Skills Match:</strong> 
                        {Object.keys(roleRequirements).length > 0 ? (
                          <span> {Object.keys(roleRequirements).filter(skill => skills[skill] >= roleRequirements[skill]).length}/{Object.keys(roleRequirements).length} skills met</span>
                        ) : (
                          <span> No specific requirements</span>
                        )}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="analysis-card">
                <h4><i className="fa-solid fa-arrow-trend-up mr-2"></i> Improvement Suggestions</h4>
                <div className="suggestions-list">
                  {result.readinessScore >= 85 ? (
                    <div className="suggestion-item excellent">
                      <h5><i className="fa-solid fa-star text-yellow-500 mr-2"></i> Excellent Performance!</h5>
                      <p>You're in the top tier! Consider:</p>
                      <ul>
                        <li>Apply to top-tier companies and startups</li>
                        <li>Negotiate for higher salary packages</li>
                        <li>Consider leadership or senior roles</li>
                        <li>Maintain your skill level with continuous learning</li>
                      </ul>
                    </div>
                  ) : result.readinessScore >= 75 ? (
                    <div className="suggestion-item good">
                      <h5><i className="fa-solid fa-thumbs-up text-blue-500 mr-2"></i> Good Performance!</h5>
                      <p>Strong position! To improve further:</p>
                      <ul>
                        <li>Focus on {result.weaknesses.slice(0, 2).join(" and ")} skills</li>
                        <li>Add 2-3 more projects to your portfolio</li>
                        <li>Get 1-2 more certifications</li>
                        <li>Practice communication and interview skills</li>
                      </ul>
                    </div>
                  ) : result.readinessScore >= 60 ? (
                    <div className="suggestion-item moderate">
                      <h5><i className="fa-solid fa-book-open text-orange-500 mr-2"></i> Room for Improvement</h5>
                      <p>Decent foundation! Key recommendations:</p>
                      <ul>
                        <li>Improve {result.weaknesses.slice(0, 3).join(", ")} skills</li>
                        <li>Build at least 3-5 strong projects</li>
                        <li>Get relevant certifications in your field</li>
                        <li>Gain internship or freelance experience</li>
                        <li>Improve CGPA if still studying</li>
                      </ul>
                    </div>
                  ) : (
                    <div className="suggestion-item needs-work">
                      <h5><i className="fa-solid fa-rocket text-red-500 mr-2"></i> Action Plan Needed</h5>
                      <p>Let's build your foundation! Focus on:</p>
                      <ul>
                        <li>Master core skills: {result.weaknesses.slice(0, 4).join(", ")}</li>
                        <li>Complete 5+ projects for portfolio</li>
                        <li>Get 3+ industry certifications</li>
                        <li>Gain internship experience (6+ months preferred)</li>
                        <li>Improve academic performance if applicable</li>
                        <li>Practice coding problems and system design</li>
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>
          {/* Role Matches with Salary Info */}
          <section className="roles-section">
            <h3><i className="fa-solid fa-briefcase mr-2"></i> Best Suitable Roles</h3>
            <div className="roles-grid">
              {result.roleMatches?.slice(0, 6).map((role, index) => (
                role && (
                  <div className="role-card" key={index}>
                    <div className="role-rank">#{index + 1}</div>
                    <h4>{role.name}</h4>
                    <div className="role-match">
                      <div className="match-bar">
                        <div
                          className="match-fill"
                          style={{
                            width: `${role.match}%`,
                            backgroundColor: role.match >= 70 ? "#10b981" : role.match >= 50 ? "#f59e0b" : "#ef4444"
                          }}
                        ></div>
                      </div>
                      <span className="match-percentage">{role.match}% Match</span>
                    </div>
                    <div className="role-details">
                      <p><strong>Category:</strong> <span className="category-badge">{role.category}</span></p>
                      <p><strong>Demand:</strong> <span className={`demand-badge ${(role?.demandLevel || "").toLowerCase()}`}>{role.demandLevel}</span></p>
                      <p><strong>Salary:</strong> ${role.salaryRange.min.toLocaleString()} - ${role.salaryRange.max.toLocaleString()}</p>
                    </div>
                  </div>
                )
              ))}
            </div>
          </section>



          {/* Strengths & Weaknesses */}
          <div className="strengths-weaknesses">
            <section className="strengths-section">
              <h3>Your Strengths</h3>
              {result.strengths.length > 0 ? (
                <div className="strength-list">
                  {result.strengths.map((skill, index) => (
                    <div className="strength-item" key={index}>
                      <span>{skill}</span>
                      <span className="skill-badge">{skills[skill]}%</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="no-data">No strong skills yet. Keep improving!</p>
              )}
            </section>
          </div>

          {/* Improvement Roadmap */}
          {result.roadmap.length > 0 && (
            <section className="roadmap-section">
              <h3>Personalized Improvement Roadmap {userProfile.targetRole ? `for ${userProfile.targetRole}` : ""}</h3>
              <div className="roadmap-grid">
                {result.roadmap.map((item, index) => (
                  <div className="roadmap-card" key={index}>
                    <div className="roadmap-header">
                      <h4>
                        {item.skill}
                      </h4>
                      <span className={`priority-badge priority-${(item?.priority || "").toLowerCase().replace(" ", "-")}`}>
                        {item.priority}
                      </span>
                    </div>
                    <div className="roadmap-details">
                      <div className="roadmap-detail">
                        <span>{item.videos} videos to watch</span>
                      </div>
                      <div className="roadmap-detail">
                        <span>{item.days} days plan</span>
                      </div>
                    </div>
                    <button className="start-learning-btn" onClick={() => handleStartLearning(item.skill)}>
                      Start Learning
                    </button>
                  </div>
                ))}
              </div>
            </section>
          )}
        </>
      )}

      {/* New Assessment Button */}
      {currentStep === 3 && (
        <div className="navigation-buttons">
          <button className="new-assessment-btn" onClick={resetForm}>
            + New Assessment
          </button>
        </div>
      )}
    </main>
  );
}