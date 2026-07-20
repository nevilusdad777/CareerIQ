import { useState, useEffect } from "react";
import axios from "axios";
import "./MarketIntel.css";

export default function MarketIntel() {
  const [selectedRole, setSelectedRole] = useState(null);
  const [compareRoles, setCompareRoles] = useState([null, null]);
  const [selectedLocation, setSelectedLocation] = useState("Bangalore");
  const [userSkills, setUserSkills] = useState(["HTML", "CSS", "JavaScript"]);
  const [experience, setExperience] = useState(1);
  const [selectedSkills, setSelectedSkills] = useState([]);

  function findSkillGap() {
    if (!selectedRole || !selectedRole.skills) return [];
    const requiredSkills = selectedRole.skills;
    const missingSkills = requiredSkills.filter(skill => !userSkills.includes(skill));
    return missingSkills;
  }
  const [educationLevel, setEducationLevel] = useState("Bachelor's");
  const [locationPreference, setLocationPreference] = useState("Bangalore");
  const [industryType, setIndustryType] = useState("Product");
  const [jobType, setJobType] = useState("Full-time");

  const [marketData, setMarketData] = useState([]);
  const [skillDemandData, setSkillDemandData] = useState([]);
  const [trendingSkills, setTrendingSkills] = useState([]);
  const [locationDemand, setLocationDemand] = useState({});
  const [lastUpdated, setLastUpdated] = useState(null);
  const [loading, setLoading] = useState(true);

  // New features state
  const [savedAnalyses, setSavedAnalyses] = useState([]);
  const [marketInsights, setMarketInsights] = useState([]);
  const [selectedTimeRange, setSelectedTimeRange] = useState("6months");
  const [showDetailedAnalysis, setShowDetailedAnalysis] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalRole, setModalRole] = useState(null);

  useEffect(() => {
    fetchMarketIntel();
  }, []);

  const fetchMarketIntel = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:5000/api/market-intel");
      if (res.data.success && res.data.data) {
        setMarketData(res.data.data.jobRoles || []);
        setSkillDemandData(res.data.data.skillDemands || []);
        setTrendingSkills(res.data.data.trendingSkills || []);
        setLocationDemand(res.data.data.locationDemands || {});
        setLastUpdated(res.data.data.lastUpdated);
        if (res.data.data.jobRoles && res.data.data.jobRoles.length > 0) {
          setSelectedRole(res.data.data.jobRoles[0]);
        }
      }
    } catch (error) {
      console.error("Failed to fetch market intel data:", error);
    } finally {
      setLoading(false);
    }
  };

  const careerPath = [
    { stage: "Current", role: "Student / Fresher", duration: "Now", icon: "fa-user-graduate" },
    { stage: "Entry", role: "Junior Developer", duration: "0-2 years", icon: "fa-code" },
    { stage: "Mid", role: "Senior Developer", duration: "2-5 years", icon: "fa-laptop-code" },
    { stage: "Senior", role: "Tech Lead", duration: "5-8 years", icon: "fa-users" },
    { stage: "Expert", role: "Engineering Manager", duration: "8+ years", icon: "fa-crown" },
  ];

  const learningResources = {
    React: [
      { platform: "YouTube", link: "https://youtu.be/bMknfKXIFA8", icon: "fa-youtube", brand: true },
      { platform: "Coursera", link: "https://coursera.org", icon: "fa-graduation-cap", brand: false },
      { platform: "freeCodeCamp", link: "https://freecodecamp.org", icon: "fa-free-code-camp", brand: true },
    ],
    Python: [
      { platform: "YouTube", link: "https://youtu.be/_uQrJ0TkZlc", icon: "fa-youtube", brand: true },
      { platform: "Codecademy", link: "https://codecademy.com", icon: "fa-laptop-code", brand: false },
      { platform: "Udemy", link: "https://udemy.com", icon: "fa-university", brand: false },
    ],
    "Node.js": [
      { platform: "YouTube", link: "https://youtu.be/pKd0Rpw7O48", icon: "fa-youtube", brand: true },
      { platform: "Udemy", link: "https://udemy.com", icon: "fa-graduation-cap", brand: false },
      { platform: "LinkedIn Learning", link: "https://linkedin.com/learning", icon: "fa-linkedin", brand: true },
    ],
    JavaScript: [
      { platform: "YouTube", link: "https://youtu.be/hdI2bqOjy3c", icon: "fa-youtube", brand: true },
      { platform: "MDN Web Docs", link: "https://developer.mozilla.org", icon: "fa-firefox-browser", brand: true },
      { platform: "freeCodeCamp", link: "https://freecodecamp.org", icon: "fa-free-code-camp", brand: true },
    ],
    TypeScript: [
      { platform: "YouTube", link: "https://youtu.be/gieEQFIfg74", icon: "fa-youtube", brand: true },
      { platform: "Official Docs", link: "https://typescriptlang.org", icon: "fa-file-code", brand: false },
    ],
    SQL: [
      { platform: "W3Schools", link: "https://w3schools.com/sql", icon: "fa-database", brand: false },
      { platform: "Mode SQL", link: "https://mode.com/sql-tutorial", icon: "fa-table", brand: false },
    ]
  };

  const getSkillWeight = (skill) => {
    const weights = {
      "Kubernetes": 1.8, "Docker": 1.5, "AWS": 1.6, "Azure": 1.5, "GCP": 1.5, "Terraform": 1.6,
      "React": 1.3, "Node.js": 1.3, "TypeScript": 1.2, "GraphQL": 1.2, "Redis": 1.4,
      "Python": 1.2, "MongoDB": 1.1, "Jenkins": 1.2, "Ansible": 1.2,
      "SQL": 0.8, "Git": 0.7, "Linux": 0.9, "Communication": 0.6
    };
    return weights[skill] || 1.0;
  };

  const calculateSalary = () => {
    if (selectedSkills.length === 0) return "0";
    
    // 1. Base Salary by Role (Start at 4 LPA baseline)
    let base = 4.5;
    
    // 2. Skill-based value (Weighted sum)
    const skillValue = selectedSkills.reduce((acc, skill) => acc + getSkillWeight(skill), 0) * 1.2;
    
    // 3. Experience Multiplier (Logarithmic-style scaling to prevent astronomical numbers)
    // First 3 years have higher impact than late years
    const expValue = experience <= 3 ? experience * 2.5 : 7.5 + (experience - 3) * 1.5;
    
    // 4. Industry/Type Multipliers
    const indMultipliers = {
      "Product": 1.3, "Startup": 1.2, "Enterprise": 1.25, 
      "Service": 0.85, "Consulting": 1.0, "Government": 0.9
    };
    const industryFact = indMultipliers[industryType] || 1.0;
    
    const jobMultipliers = {
      "Full-time": 1.1, "Part-time": 0.5, "Contract": 1.3, 
      "Freelance": 1.2, "Internship": 0.2
    };
    const jobFact = jobMultipliers[jobType] || 1.0;
    
    // 5. Final Assembly
    let total = (base + skillValue + expValue) * industryFact * jobFact;
    
    // 6. Education Bonus (Percentage of total)
    const eduBonus = { "PhD": 0.35, "Master's": 0.2, "Bachelor's": 0.1, "Bootcamp": 0.05 };
    total *= (1 + (eduBonus[educationLevel] || 0));
    
    // 7. Location Factor (Additive or Multiplicative impact)
    const locBonus = { 
      "Bangalore": 1.25, "Mumbai": 1.25, "Hyderabad": 1.15, 
      "Remote": 1.2, "International": 1.5 
    };
    total *= (locBonus[locationPreference] || 1.1);

    return total.toFixed(1);
  };


  const getSmartTip = () => {
    const allSkills = ["React", "Node.js", "Python", "SQL", "AWS", "Docker", "TypeScript", "MongoDB", "Redis", "GraphQL", "Kubernetes", "Jenkins", "Terraform"];
    const suggestion = allSkills
      .filter(s => !selectedSkills.includes(s))
      .map(s => ({ skill: s, weight: getSkillWeight(s) }))
      .sort((a, b) => b.weight - a.weight)[0];
      
    if (!suggestion) return null;
    return `Learning ${suggestion.skill} could boost your LPA by ~${(suggestion.weight * 2.5).toFixed(1)}!`;
  };

  const calculateSalaryRange = () => {
    const base = parseFloat(calculateSalary());
    if (base === 0) return "0 - 0 LPA";
    return `${(base * 0.85).toFixed(1)} - ${(base * 1.15).toFixed(1)} LPA`;
  };

  const calculateConfidence = () => {
    if (selectedSkills.length < 3) return { level: "Refining", color: "#94a3b8" };
    if (selectedSkills.length < 6) return { level: "Stable", color: "#3b82f6" };
    return { level: "High", color: "#10b981" };
  };

  const getLocationFactor = () => {
    const factors = {
      "Bangalore": "+30%",
      "Hyderabad": "+20%",
      "Delhi": "+15%",
      "Pune": "+18%",
      "Remote": "+25%",
      "International": "+35%"
    };
    return factors[locationPreference] || "+15%";
  };

  const getDemandColor = (demand) => {
    if (demand === "Very High" || demand === "High") return "#10b981";
    if (demand === "Medium") return "#f59e0b";
    return "#ef4444";
  };

  const calculatePlacementProbability = () => {
    if (!selectedRole) return 0;
    
    // Calculate based on actual skill gap
    const userSkillSet = new Set(userSkills.map(s => s.toLowerCase()));
    const requiredSkillSet = new Set(selectedRole.skills.map(s => s.toLowerCase()));
    
    // Find matching skills
    const matchingSkills = userSkills.filter(skill => 
      requiredSkillSet.has(skill.toLowerCase())
    );
    
    // Calculate skill match percentage
    const skillMatchPercent = (matchingSkills.length / selectedRole.skills.length) * 100;
    
    // Factor in experience
    const experienceBonus = Math.min(experience * 5, 20);
    
    // Factor in education level
    const educationBonus = educationLevel === "PhD" ? 15 : 
                         educationLevel === "Master's" ? 10 : 
                         educationLevel === "Bachelor's" ? 8 : 5;
    
    // Calculate final probability
    let baseProbability = skillMatchPercent * 0.6; // 60% weight to skills
    baseProbability += experienceBonus; // Add experience bonus
    baseProbability += educationBonus; // Add education bonus
    
    return Math.min(Math.round(baseProbability), 95);
  };

  const handleCompareRole = (index, role) => {
    const newCompare = [...compareRoles];
    newCompare[index] = role;
    setCompareRoles(newCompare);
  };

  const saveCurrentAnalysis = () => {
    if (!selectedRole) return;
    
    // Create a unique key for the role/skill combination
    const analysisKey = `${selectedRole.role}-${selectedSkills.sort().join(",")}`;
    
    // Check for duplicates
    if (savedAnalyses.some(a => a.key === analysisKey)) {
      alert("This analysis is already saved!");
      return;
    }
    
    const analysis = {
      id: Date.now(),
      key: analysisKey,
      role: selectedRole.role,
      roleData: selectedRole,
      matchScore: calculatePlacementProbability(),
      salaryRange: calculateSalaryRange(),
      date: new Date(),
      userSkills: [...selectedSkills],
      experience: experience,
      education: educationLevel,
      location: locationPreference,
      industry: industryType
    };
    
    setSavedAnalyses([analysis, ...savedAnalyses]);
    
    // Show success message
    const successMsg = document.createElement('div');
    successMsg.className = 'save-success-message';
    successMsg.innerHTML = `<i class="fas fa-check-circle"></i> Analysis saved successfully!`;
    document.body.appendChild(successMsg);
    
    setTimeout(() => {
      if (document.body.contains(successMsg)) {
        document.body.removeChild(successMsg);
      }
    }, 3000);
  };

  const generateMarketInsights = () => {
    const insights = [];
    
    // Top skills by demand
    const topSkills = [...skillDemandData]
      .sort((a, b) => b.demandPercent - a.demandPercent)
      .slice(0, 5);
    
    // High growth locations
    const highGrowthLocations = Object.entries(locationDemand)
      .filter(([_, data]) => data.growth && data.growth.includes('+'))
      .slice(0, 3);
    
    // Trending analysis
    const avgGrowth = trendingSkills.reduce((acc, skill) => {
      const growthNum = parseInt(skill.growth.replace(/\D/g, ''));
      return acc + growthNum;
    }, 0) / trendingSkills.length;
    
    insights.push(
      { type: 'skill', title: 'Most In-Demand Skills', data: topSkills },
      { type: 'location', title: 'Fastest Growing Locations', data: highGrowthLocations },
      { type: 'trend', title: 'Average Skill Growth', data: `${avgGrowth}%` }
    );
    
    setMarketInsights(insights);
  };

  // Load saved analyses on mount
  useEffect(() => {
    const saved = localStorage.getItem("career_iq_market_analyses");
    if (saved) {
      try {
        setSavedAnalyses(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse saved analyses", e);
      }
    }
  }, []);

  // Sync saved analyses to localStorage
  useEffect(() => {
    localStorage.setItem("career_iq_market_analyses", JSON.stringify(savedAnalyses));
  }, [savedAnalyses]);

  // Generate insights on component mount
  useEffect(() => {
    generateMarketInsights();
  }, [skillDemandData, locationDemand, trendingSkills]);

  const deleteAnalysis = (id) => {
    if (window.confirm("Are you sure you want to delete this analysis?")) {
      setSavedAnalyses(savedAnalyses.filter(a => a.id !== id));
    }
  };

  const loadSavedAnalysis = (analysis) => {
    setSelectedRole(analysis.roleData);
    setSelectedSkills(analysis.userSkills || []);
    setExperience(analysis.experience || 0);
    setEducationLevel(analysis.education || "Bachelor's");
    setLocationPreference(analysis.location || "Bangalore");
    setIndustryType(analysis.industry || "Product");
    
    // Smooth scroll to results
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Show loading indicator briefly for UX feel
    const loadMsg = document.createElement('div');
    loadMsg.className = 'save-success-message'; // Reusing style
    loadMsg.innerHTML = `<i class="fas fa-sync fa-spin"></i> Restoring Analysis...`;
    document.body.appendChild(loadMsg);
    
    setTimeout(() => {
      if (document.body.contains(loadMsg)) {
        document.body.removeChild(loadMsg);
      }
    }, 1500);
  };

  const clearAllAnalyses = () => {
    if (window.confirm("Are you sure you want to clear all saved analyses? This cannot be undone.")) {
      setSavedAnalyses([]);
    }
  };

  const handleOpenModal = (role) => {
    setModalRole(role);
    setIsModalOpen(true);
    document.body.style.overflow = 'hidden'; // Prevent scroll
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    document.body.style.overflow = 'auto';
  };

  const runMatchForModalRole = () => {
    setSelectedRole(modalRole);
    handleCloseModal();
    // Scroll to salary predictor/match area
    const predictorSection = document.querySelector('.salary-predictor');
    if (predictorSection) {
      predictorSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (loading) return <div className="market-intel-loading">Loading Market Trends...</div>;

  return (
    <main className="market-intel">
      {/* Header */}
      <div className="market-header">
        <div className="header-title-wrapper">
          <h2>
            <i className="fas fa-globe"></i> Market Intelligence
          </h2>
          {lastUpdated && (
            <span className="last-updated-badge">
              <i className="fas fa-lightbulb"></i> Last Updated: {new Date(lastUpdated).toLocaleDateString()}
            </span>
          )}
        </div>
        <p>Real-world job market trends based on current industry demand</p>
      </div>

      {/* Location Filter */}
      <section className="location-section">
        <h3><i className="fas fa-map-marker-alt"></i> Location-Based Demand</h3>
        <div className="location-tabs">
          {Object.keys(locationDemand).map((location) => (
            <button
              key={location}
              className={`location-tab ${selectedLocation === location ? 'active' : ''}`}
              onClick={() => setSelectedLocation(location)}
            >
              {location}
            </button>
          ))}
        </div>
          {locationDemand && Object.keys(locationDemand).length > 0 ? (
            <div className="location-stats">
              <div className="location-stat">
                <i className="fas fa-fire"></i>
                <div>
                  <strong>Demand Level</strong>
                  <span>{locationDemand[selectedLocation]?.demand || "N/A"}</span>
                </div>
              </div>
              <div className="location-stat">
                <i className="fas fa-briefcase"></i>
                <div>
                  <strong>Available Jobs</strong>
                  <span>{locationDemand[selectedLocation]?.jobs || 0}+</span>
                </div>
              </div>
              <div className="location-stat">
                <i className="fas fa-rupee-sign"></i>
                <div>
                  <strong>Avg Salary</strong>
                  <span>{locationDemand[selectedLocation]?.avgSalary || "N/A"}</span>
                </div>
              </div>
              <div className="location-stat">
                <i className="fas fa-chart-line"></i>
                <div>
                  <strong>Growth Rate</strong>
                  <span>{locationDemand[selectedLocation]?.growth || "N/A"}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="no-data-msg">No location data available yet.</div>
          )}
      </section>

      {/* Skill Demand Heatmap */}
      <section className="heatmap-section">
        <h3><i className="fas fa-fire"></i> Skill Demand Heatmap</h3>
        <div className="heatmap-grid">
          {skillDemandData.map((item, index) => (
            <div key={index} className="heatmap-card">
              <div className="heatmap-header">
                <span className="heatmap-icon">{item.icon}</span>
                <h4>{item.skill}</h4>
              </div>
              <div className="heatmap-bar">
                <div 
                  className="heatmap-fill" 
                  style={{ 
                    width: `${item.demandPercent}%`,
                    backgroundColor: item.demand === "High" ? "#10b981" : item.demand === "Medium" ? "#f59e0b" : "#ef4444"
                  }}
                ></div>
              </div>
              <div className="heatmap-footer">
                <span className="demand-badge">{item.demand}</span>
                <span className="growth-badge">{item.growth}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Trending Skills */}
      <section className="trending-section">
        <h3><i className="fas fa-rocket"></i> Trending Skills (Last 6 Months)</h3>
        <div className="trending-grid">
          {trendingSkills.map((item, index) => (
            <div key={index} className="trending-card">
              <div className="trending-header">
                <h4>{item.skill}</h4>
                <span className="trend-badge">{item.trend}</span>
              </div>
              <div className="trending-stats">
                <div className="trending-stat">
                  <i className="fas fa-arrow-up"></i>
                  <span>Growth: {item.growth}</span>
                </div>
                <div className="trending-stat">
                  <i className="fas fa-briefcase"></i>
                  <span>{item.jobs} jobs</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Job Roles */}
      <section className="roles-section">
        <h3><i className="fas fa-briefcase"></i> Available Job Roles</h3>
        <div className="roles-grid">
          {marketData.map((item, index) => (
            <div key={index} className="role-card">
              <div className="role-header">
                <h4>
                  <i className="fas fa-briefcase"></i> {item.role}
                </h4>
                <span 
                  className="demand-indicator"
                  style={{ backgroundColor: getDemandColor(item.demand) }}
                >
                  {item.demand}
                </span>
              </div>
              <div className="role-stats">
                <div className="role-stat">
                  <i className="fas fa-chart-line"></i>
                  <span>{item.growth}</span>
                </div>
                <div className="role-stat">
                  <i className="fas fa-rupee-sign"></i>
                  <span>{item.avgSalary}</span>
                </div>
                <div className="role-stat">
                  <i className="fas fa-percentage"></i>
                  <span>{item.placementChance}% placement</span>
                </div>
              </div>
              <div className="role-demand-bar">
                <div 
                  className="demand-fill" 
                  style={{ width: `${item.demandLevel}%` }}
                ></div>
              </div>
              <button 
                className="view-skills-btn" 
                onClick={() => handleOpenModal(item)}
              >
                <i className="fas fa-info-circle"></i> View Details
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Role Comparison */}
      <section className="comparison-section">
        <h3><i className="fas fa-balance-scale"></i> Compare Job Roles</h3>
        <div className="comparison-selectors">
          <select 
            onChange={(e) => handleCompareRole(0, marketData.find(r => r.role === e.target.value))}
            className="comparison-select"
          >
            <option value="">Select Role 1</option>
            {marketData.map((role, i) => (
              <option key={i} value={role.role}>{role.role}</option>
            ))}
          </select>
          <span className="vs-text">VS</span>
          <select 
            onChange={(e) => handleCompareRole(1, marketData.find(r => r.role === e.target.value))}
            className="comparison-select"
          >
            <option value="">Select Role 2</option>
            {marketData.map((role, i) => (
              <option key={i} value={role.role}>{role.role}</option>
            ))}
          </select>
        </div>

        {compareRoles[0] && compareRoles[1] && (
          <div className="comparison-table">
            <div className="comparison-row header">
              <div>Feature</div>
              <div>{compareRoles[0].role}</div>
              <div>{compareRoles[1].role}</div>
            </div>
            <div className="comparison-row">
              <div>Demand</div>
              <div>{compareRoles[0].demand}</div>
              <div>{compareRoles[1].demand}</div>
            </div>
            <div className="comparison-row">
              <div>Growth</div>
              <div>{compareRoles[0].growth}</div>
              <div>{compareRoles[1].growth}</div>
            </div>
            <div className="comparison-row">
              <div>Salary</div>
              <div>{compareRoles[0].avgSalary}</div>
              <div>{compareRoles[1].avgSalary}</div>
            </div>
            <div className="comparison-row">
              <div>Placement %</div>
              <div>{compareRoles[0].placementChance}%</div>
              <div>{compareRoles[1].placementChance}%</div>
            </div>
            <div className="comparison-row">
              <div>Key Skills</div>
              <div>{compareRoles[0].skills.slice(0, 3).join(", ")}</div>
              <div>{compareRoles[1].skills.slice(0, 3).join(", ")}</div>
            </div>
            <div className="comparison-row">
              <div>Work-Life Balance</div>
              <div>{compareRoles[0].workLifeBalance || "Good"}</div>
              <div>{compareRoles[1].workLifeBalance || "Moderate"}</div>
            </div>
            <div className="comparison-row">
              <div>Learning Curve</div>
              <div>{compareRoles[0].learningCurve || "Medium"}</div>
              <div>{compareRoles[1].learningCurve || "Steep"}</div>
            </div>
            <div className="comparison-row">
              <div>Remote Work</div>
              <div>{compareRoles[0].remoteWork || "High"}</div>
              <div>{compareRoles[1].remoteWork || "Medium"}</div>
            </div>
            <div className="comparison-row">
              <div>Top Companies</div>
              <div>{compareRoles[0].topCompanies.slice(0, 2).join(", ")}</div>
              <div>{compareRoles[1].topCompanies.slice(0, 2).join(", ")}</div>
            </div>
            <div className="comparison-row">
              <div>Experience Required</div>
              <div>{compareRoles[0].experienceRequired || "2-3 years"}</div>
              <div>{compareRoles[1].experienceRequired || "3-5 years"}</div>
            </div>
            <div className="comparison-row">
              <div>Job Security</div>
              <div>{compareRoles[0].jobSecurity || "High"}</div>
              <div>{compareRoles[1].jobSecurity || "Medium"}</div>
            </div>
            <div className="comparison-row">
              <div>Career Growth</div>
              <div>{compareRoles[0].careerGrowth || "Fast"}</div>
              <div>{compareRoles[1].careerGrowth || "Moderate"}</div>
            </div>
          </div>
        )}
      </section>

      {/* Salary Predictor Overhaul */}
      <section className="salary-predictor dashboard-v2">
        <div className="predictor-header-main">
          <h3><i className="fas fa-chart-pie"></i> Career Intelligence Dashboard</h3>
          <p>Real-time salary estimation & market positioning engine</p>
        </div>

        <div className="dashboard-layout">
          {/* Left Panel: Parameters */}
          <div className="parameters-panel">
            <div className="param-group">
              <label><i className="fas fa-layer-group"></i> Core Skillset</label>
              <div className="skills-grid-v2">
                {["React", "Node.js", "Python", "SQL", "AWS", "Docker", "TypeScript", "MongoDB", "Redis", "GraphQL", "Kubernetes", "Jenkins", "Terraform", "Git", "Linux", "Communication"].map((skill) => (
                  <button 
                    key={skill}
                    className={`skill-pill-v2 ${selectedSkills.includes(skill) ? 'active' : ''}`}
                    onClick={() => {
                      if (selectedSkills.includes(skill)) {
                        setSelectedSkills(selectedSkills.filter(s => s !== skill));
                      } else {
                        setSelectedSkills([...selectedSkills, skill]);
                      }
                    }}
                  >
                    {skill}
                  </button>
                ))}
              </div>
            </div>

            <div className="param-grid-row">
              <div className="param-group">
                <label><i className="fas fa-user-clock"></i> Experience</label>
                <div className="experience-control">
                  <input
                    type="range" min="0" max="15" step="1"
                    value={experience}
                    onChange={(e) => setExperience(Number(e.target.value))}
                  />
                  <span className="exp-value">{experience} Years</span>
                </div>
              </div>

              <div className="param-group">
                <label><i className="fas fa-university"></i> Education</label>
                <select value={educationLevel} onChange={(e) => setEducationLevel(e.target.value)}>
                  <option value="High School">High School</option>
                  <option value="Bachelor's">Bachelor's Degree</option>
                  <option value="Master's">Master's Degree</option>
                  <option value="PhD">PhD Holder</option>
                </select>
              </div>
            </div>

            <div className="param-grid-row">
              <div className="param-group">
                <label><i className="fas fa-map-marker-alt"></i> Location</label>
                <select value={locationPreference} onChange={(e) => setLocationPreference(e.target.value)}>
                  {["Bangalore", "Mumbai", "Delhi", "Hyderabad", "Pune", "Remote", "International"].map(loc => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
              </div>

              <div className="param-group">
                <label><i className="fas fa-building"></i> Industry</label>
                <select value={industryType} onChange={(e) => setIndustryType(e.target.value)}>
                  {["Product", "Service", "Startup", "Enterprise", "Consulting"].map(ind => (
                    <option key={ind} value={ind}>{ind}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Right Panel: Intelligence Results */}
          <div className="intelligence-panel">
            <div className="main-prediction-card highlight-glow">
              <span className="prediction-label">Estimated Annual LPA</span>
              <div className="odometer-value">{calculateSalary()}</div>
              <div className="prediction-range">Market Range: {calculateSalaryRange()}</div>
              
              <div className="confidence-meter">
                <div className="meter-label">
                  <span>Data Confidence</span>
                  <span style={{ color: calculateConfidence().color }}>{calculateConfidence().level}</span>
                </div>
                <div className="meter-bar">
                  <div className="meter-fill" style={{ 
                    width: selectedSkills.length > 8 ? '100%' : `${(selectedSkills.length / 8) * 100}%`,
                    backgroundColor: calculateConfidence().color 
                  }}></div>
                </div>
              </div>
            </div>

            <div className="intelligence-grid">
              <div className="intel-box">
                <i className="fas fa-bolt"></i>
                <div>
                  <span className="intel-label">Smart Tip</span>
                  <p className="intel-text">{getSmartTip()}</p>
                </div>
              </div>
              
              <div className="intel-box">
                <i className="fas fa-chart-line"></i>
                <div>
                  <span className="intel-label">Growth Factor</span>
                  <p className="intel-text">Positioning in top 15% tier</p>
                </div>
              </div>
            </div>

            <button className="save-analysis-btn-pulse" onClick={saveCurrentAnalysis}>
              <i className="fas fa-save"></i> Persistent Save This Result
            </button>
          </div>
        </div>
      </section>

      {/* Career Path */}
      <section className="career-path-section">
        <h3><i className="fas fa-route"></i> Career Path Recommendation</h3>
        <div className="career-path">
          {careerPath.map((stage, index) => (
            <div key={index} className="career-stage">
              <div className="stage-icon">
                <i className={`fas ${stage.icon}`}></i>
              </div>
              <h4>{stage.role}</h4>
              <p>{stage.duration}</p>
              <span className="stage-label">{stage.stage}</span>
              {index < careerPath.length - 1 && (
                <div className="stage-arrow">
                  <i className="fas fa-arrow-right"></i>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Selected Role Details */}
      {selectedRole && (
        <>
          {/* Skill Gap Analysis */}
          <section className="skill-gap-section">
            <h3><i className="fas fa-exclamation-triangle"></i> Your Skill Gap Analysis</h3>
            <div className="gap-analysis">
              <div className="gap-card">
                <h4>You Know</h4>
                <div className="gap-skills">
                  {userSkills.map((skill, i) => (
                    <span key={i} className="gap-skill known">
                      <i className="fas fa-check"></i> {skill}
                    </span>
                  ))}
                </div>
              </div>
              <div className="gap-card">
                <h4>Market Needs</h4>
                <div className="gap-skills">
                  {selectedRole && selectedRole.skills && selectedRole.skills.map((skill, i) => (
                    <span key={i} className="gap-skill required">
                      <i className="fas fa-star"></i> {skill}
                    </span>
                  ))}
                </div>
              </div>
              <div className="gap-card missing">
                <h4>Missing Skills</h4>
                <div className="gap-skills">
                  {findSkillGap() && findSkillGap().length > 0 ? (
                    findSkillGap().map((skill, i) => (
                      <span key={i} className="gap-skill miss">
                        <i className="fas fa-times"></i> {skill}
                      </span>
                    ))
                  ) : (
                    <span className="no-gap">🎉 Perfect Match!</span>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Placement Probability */}
          <section className="placement-probability">
            <h3><i className="fas fa-chart-pie"></i> Placement Probability</h3>
            <div className="probability-meter">
              <div className="probability-circle">
                <svg width="150" height="150" viewBox="0 0 150 150">
                  <circle cx="75" cy="75" r="60" fill="none" stroke="#e5e7eb" strokeWidth="15" />
                  <circle
                    cx="75"
                    cy="75"
                    r="60"
                    fill="none"
                    stroke={calculatePlacementProbability() >= 70 ? "#10b981" : calculatePlacementProbability() >= 50 ? "#f59e0b" : "#ef4444"}
                    strokeWidth="15"
                    strokeDasharray="377"
                    strokeDashoffset={377 - (377 * calculatePlacementProbability()) / 100}
                    strokeLinecap="round"
                    transform="rotate(-90 75 75)"
                  />
                </svg>
                <div className="probability-text">
                  <span className="probability-value">{calculatePlacementProbability()}%</span>
                  <span className="probability-label">Match</span>
                </div>
              </div>
              <div className="probability-info">
                <h4>Profile Analysis</h4>
                <p>
                  {calculatePlacementProbability() >= 70
                    ? "✅ HIGH - You're well-prepared for this role!"
                    : calculatePlacementProbability() >= 50
                    ? "⚠️ MEDIUM - Learn missing skills to improve chances"
                    : "❌ LOW - Focus on building required skills first"}
                </p>
              </div>
            </div>
          </section>

                <section className="insights-section">
        <h3><i className="fas fa-lightbulb"></i> Market Insights</h3>
        <div className="time-range-selector">
          <label>Time Range:</label>
          <select 
            value={selectedTimeRange} 
            onChange={(e) => setSelectedTimeRange(e.target.value)}
            className="time-range-select"
          >
            <option value="1month">Last Month</option>
            <option value="3months">Last 3 Months</option>
            <option value="6months">Last 6 Months</option>
            <option value="1year">Last Year</option>
          </select>
        </div>
        <div className="insights-grid">
          <div className="insight-card">
            <h4><i className="fas fa-trending-up"></i> Top Growing Skills</h4>
            <div className="insight-content">
              {trendingSkills.slice(0, 3).map((skill, i) => (
                <div key={i} className="insight-item skill">
                  <span className="insight-label">{skill.skill}</span>
                  <span className="insight-badge growth">
                    <i className="fas fa-arrow-up"></i> {skill.growth}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="insight-card">
            <h4><i className="fas fa-map-marked-alt"></i> Hot Locations</h4>
            <div className="insight-content">
              {Object.entries(locationDemand).slice(0, 3).map(([location, data], i) => (
                <div key={i} className="insight-item location">
                  <span className="insight-label">{location}</span>
                  <span className={`insight-badge demand ${data.demand.toLowerCase()}`}>
                    {data.demand}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="insight-card">
            <h4><i className="fas fa-chart-pie"></i> Market Demand</h4>
            <div className="insight-content">
              <div className="demand-summary-grid">
                <div className="demand-summary-item high">
                  <span className="summary-label">High</span>
                  <strong className="summary-value">{skillDemandData.filter(s => s.demand === "High").length}</strong>
                </div>
                <div className="demand-summary-item medium">
                  <span className="summary-label">Medium</span>
                  <strong className="summary-value">{skillDemandData.filter(s => s.demand === "Medium").length}</strong>
                </div>
                <div className="demand-summary-item low">
                  <span className="summary-label">Low</span>
                  <strong className="summary-value">{skillDemandData.filter(s => s.demand === "Low").length}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Saved Analyses */}
      <section className="saved-analyses-section">
        <div className="section-header-flex">
          <h3><i className="fas fa-bookmark"></i> Your Saved Analyses</h3>
          {savedAnalyses.length > 0 && (
            <button className="clear-all-btn" onClick={clearAllAnalyses}>
              <i className="fas fa-trash-alt"></i> Clear All
            </button>
          )}
        </div>
        
        <div className="saved-analyses-grid">
          {savedAnalyses.length === 0 ? (
            <div className="no-analyses">
              <div className="no-analyses-icon">
                <i className="fas fa-folder-open"></i>
              </div>
              <p>No saved analyses yet. Start analyzing roles to build your career insights!</p>
            </div>
          ) : (
            savedAnalyses.map((analysis) => (
              <div 
                key={analysis.id} 
                className="analysis-card"
                style={{ borderLeft: `6px solid ${analysis.matchScore >= 70 ? '#10b981' : analysis.matchScore >= 50 ? '#f59e0b' : '#ef4444'}` }}
              >
                <div className="analysis-card-header">
                  <div className="analysis-title-group">
                    <h4>{analysis.role}</h4>
                    <span className="analysis-date">
                      <i className="far fa-calendar-alt"></i> {new Date(analysis.date).toLocaleDateString()}
                    </span>
                  </div>
                  <button className="delete-analysis-btn" onClick={() => deleteAnalysis(analysis.id)} title="Remove Analysis">
                    <i className="fas fa-times"></i>
                  </button>
                </div>
                
                <div className="analysis-card-body">
                  <div className="analysis-data-grid">
                    <div className="analysis-data-item">
                      <span className="data-label">Match Score</span>
                      <span className="data-value score">{analysis.matchScore}%</span>
                    </div>
                    <div className="analysis-data-item">
                      <span className="data-label">Experience</span>
                      <span className="data-value">{analysis.experience} Year(s)</span>
                    </div>
                    <div className="analysis-data-item">
                      <span className="data-label">Salary Range</span>
                      <span className="data-value salary">{analysis.salaryRange}</span>
                    </div>
                    <div className="analysis-data-item">
                      <span className="data-label">Loc/Ind</span>
                      <span className="data-value">{analysis.location} / {analysis.industry}</span>
                    </div>
                  </div>
                </div>

                <div className="analysis-card-footer">
                  <button className="view-saved-details-btn" onClick={() => loadSavedAnalysis(analysis)}>
                    <i className="fas fa-external-link-alt"></i> Load Analysis Results
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
        
        <div className="save-action-wrapper">
          <button className="save-analysis-btn" onClick={saveCurrentAnalysis}>
            <i className="fas fa-save"></i> Save Current Analysis Result
          </button>
        </div>
      </section>

      {/* Learning Resources */}
          <section className="resources-section">
            <h3><i className="fas fa-graduation-cap"></i> Learning Resources</h3>
            <div className="resources-grid">
              {selectedRole.skills.slice(0, 3).map((skill) => (
                learningResources[skill] && (
                  <div key={skill} className="resource-card">
                    <div className="resource-links">
                      {learningResources[skill].map((resource, i) => (
                        <a 
                          key={i} 
                          href={resource.link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className={`resource-link ${resource.platform.toLowerCase().replace(/\s+/g, '-')}`}
                        >
                          <i className={`${resource.brand ? 'fab' : 'fas'} ${resource.icon}`}></i>
                          <span>{resource.platform}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )
              ))}
            </div>
          </section>
        </>
      )}

      {/* Role Detail Modal */}
      {isModalOpen && modalRole && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="role-modal" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={handleCloseModal}>
              <i className="fas fa-times"></i>
            </button>
            <div className="modal-header">
              <div className="modal-title-area">
                <div className="modal-icon-bg">
                  <i className="fas fa-briefcase"></i>
                </div>
                <div>
                  <h2>{modalRole.role}</h2>
                  <div className="modal-badges">
                    <span className="badge demand" style={{ background: getDemandColor(modalRole.demand) }}>
                      {modalRole.demand} Demand
                    </span>
                    <span className="badge placement">
                      {modalRole.placementChance}% Success Rate
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-body">
              <div className="modal-grid">
                <div className="modal-main">
                  <section className="modal-section">
                    <h3><i className="fas fa-list-ul"></i> Required Skills Matrix</h3>
                    <div className="modal-skills-grid">
                      {modalRole.skills.map((skill, i) => (
                        <div key={i} className="skill-pill">
                          <i className="fas fa-check-circle"></i> {skill}
                        </div>
                      ))}
                    </div>
                  </section>

                  <section className="modal-section">
                    <h3><i className="fas fa-building"></i> Top Hiring Companies</h3>
                    <div className="companies-list">
                      {modalRole.topCompanies.map((company, i) => (
                        <div key={i} className="company-tag">
                          <i className="fas fa-city"></i> {company}
                        </div>
                      ))}
                    </div>
                  </section>

                  <section className="modal-section career">
                    <h3><i className="fas fa-road"></i> Career Progression</h3>
                    <div className="career-timeline">
                      <div className="timeline-item">
                        <span className="timeline-point"></span>
                        <div className="timeline-content">
                          <p className="stage">Entry Level</p>
                          <p className="role">Junior {modalRole.role}</p>
                        </div>
                      </div>
                      <div className="timeline-item">
                        <span className="timeline-point active"></span>
                        <div className="timeline-content">
                          <p className="stage">Mid Level</p>
                          <p className="role">Senior {modalRole.role}</p>
                        </div>
                      </div>
                      <div className="timeline-item">
                        <span className="timeline-point"></span>
                        <div className="timeline-content">
                          <p className="stage">Leadership</p>
                          <p className="role">{modalRole.role} Lead / Architect</p>
                        </div>
                      </div>
                    </div>
                  </section>
                </div>

                <div className="modal-sidebar">
                  <div className="sidebar-card salary">
                    <h4>Market Salary</h4>
                    <div className="salary-display">
                      <i className="fas fa-rupee-sign"></i>
                      <span className="amount">{modalRole.avgSalary}</span>
                    </div>
                    <p>Average annual compensation in India</p>
                  </div>

                  <div className="sidebar-card growth">
                    <h4>Market Growth</h4>
                    <div className="growth-display">
                      <i className="fas fa-chart-line"></i>
                      <span className="percent">{modalRole.growth}</span>
                    </div>
                    <p>Projected 12-month demand increase</p>
                  </div>

                  <button className="run-analysis-btn" onClick={runMatchForModalRole}>
                    <i className="fas fa-bolt"></i> Analyze My Profile
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}