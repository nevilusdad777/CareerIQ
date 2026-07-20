import { useState, useEffect } from "react";
import axios from "axios";
import ProgressRing from "../../components/ProgressRing";
import StatCard from "../../components/StatCard";
import "./Profile.css";

export default function Profile() {
  const [photo, setPhoto] = useState("https://i.pravatar.cc/200?img=12");
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  const [createdAt] = useState(
    new Date().toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    })
  );

  const [user, setUser] = useState({
    name: "",
    email: "",
    phone: "",
    college: "",
    degree: "",
    year: "",
    role: "Student",
    bio: "",
    github: "",
    linkedin: "",
    portfolio: "",
    location: "",
    address: "",
    birthday: "",
    gender: ""
  });

  const [skills, setSkills] = useState([]);
  const [newSkill, setNewSkill] = useState("");
  const [newSkillLevel, setNewSkillLevel] = useState(50);

  const [certifications, setCertifications] = useState([]);
  const [newCert, setNewCert] = useState({ title: "", platform: "", date: "" });
  const [showAddCert, setShowAddCert] = useState(false);

  const [projects, setProjects] = useState([]);
  const [newProject, setNewProject] = useState({ name: "", tech: "", status: "In Progress", link: "" });
  const [showAddProject, setShowAddProject] = useState(false);

  const [achievements, setAchievements] = useState([]);
  const [newAchievement, setNewAchievement] = useState({ title: "", icon: "fa-trophy", date: "" });
  const [showAddAchievement, setShowAddAchievement] = useState(false);

  const [goals, setGoals] = useState([]);
  const [newGoal, setNewGoal] = useState({ goal: "", deadline: "" });
  const [showAddGoal, setShowAddGoal] = useState(false);

  const [courses, setCourses] = useState([]);
  const [newCourse, setNewCourse] = useState({ name: "", status: "In Progress", progress: 0 });
  const [showAddCourse, setShowAddCourse] = useState(false);

  const [experience, setExperience] = useState([]);
  const [newExperience, setNewExperience] = useState({ 
    company: "", 
    role: "", 
    duration: "", 
    description: "" 
  });
  const [showAddExperience, setShowAddExperience] = useState(false);

  const [activity, setActivity] = useState([
    { action: "Profile created", icon: "fa-check-circle", date: createdAt }
  ]);

  // Calculate profile completion
  const calculateProfileCompletion = () => {
    let completion = 0;
    const totalFields = 8;
    
    if (user.name) completion += 12.5;
    if (user.email) completion += 12.5;
    if (user.phone) completion += 12.5;
    if (user.college) completion += 12.5;
    if (user.degree) completion += 12.5;
    if (user.bio) completion += 12.5;
    if (user.github) completion += 12.5;
    if (user.linkedin) completion += 12.5;
    
    return Math.round(completion);
  };

  const profileCompletion = calculateProfileCompletion();

  // Calculate stats
  const completedCourses = courses.filter(c => c.status === "Completed").length;
  const totalCourses = courses.length;
  const progress = totalCourses > 0 ? Math.round((completedCourses / totalCourses) * 100) : 0;

  const [animatedStats, setAnimatedStats] = useState({
    completedCourses: 0,
    totalCourses: 0,
    progress: 0,
    profileCompletion: 0
  });

  // Animate stats on mount and when values change
  useEffect(() => {
    const duration = 1500;
    const steps = 60;
    const stepDuration = duration / steps;
    
    let currentStep = 0;
    const timer = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      
      setAnimatedStats({
        completedCourses: Math.round(completedCourses * progress),
        totalCourses: Math.round(totalCourses * progress),
        progress: Math.round(progress * 100),
        profileCompletion: Math.round(profileCompletion * progress)
      });
      
      if (currentStep >= steps) {
        clearInterval(timer);
        setAnimatedStats({
          completedCourses,
          totalCourses,
          progress,
          profileCompletion
        });
      }
    }, stepDuration);
    
    return () => clearInterval(timer);
  }, [completedCourses, totalCourses, progress, profileCompletion]);

  const completedGoals = goals.filter(g => g.completed).length;
  const totalGoals = goals.length;
  const goalProgress = totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0;

  /* PHOTO CHANGE */
  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhoto(URL.createObjectURL(file));
      setActivity([{ action: "Updated profile photo", icon: "fa-camera", date: "Just now" }, ...activity]);
    }
  };

  /* INPUT CHANGE */
  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  /* SAVE PROFILE */
  const saveProfile = async () => {
    if (!user.name || !user.email) {
      alert("Please fill name and email!");
      return;
    }

    try {
      const currentUser = JSON.parse(sessionStorage.getItem("currentUser"));
      if (!currentUser || !currentUser.id) {
        alert("User not logged in!");
        return;
      }

      // Prepare complete profile data for database
      const profileData = {
        userId: currentUser.id,
        personalInfo: {
          name: user.name,
          email: user.email,
          phone: user.phone,
          college: user.college,
          degree: user.degree,
          year: user.year,
          role: user.role,
          bio: user.bio,
          location: user.location,
          address: user.address,
          birthday: user.birthday,
          gender: user.gender
        },
        socialLinks: {
          github: user.github,
          linkedin: user.linkedin,
          portfolio: user.portfolio
        },
        skills: skills,
        experience: experience,
        projects: projects,
        certifications: certifications,
        courses: courses,
        goals: goals,
        achievements: achievements,
        profilePhoto: photo,
        profileCompletion: profileCompletion,
        createdAt: createdAt,
        updatedAt: new Date().toISOString()
      };

      console.log("Saving complete profile data:", profileData);

      // Save complete profile to database
      const response = await axios.post("http://localhost:5000/api/profile/save", profileData);

      if (response.data.success) {
        alert("Profile saved successfully!");
        setActivity([{ action: "Profile saved to database", icon: "fa-save", date: "Just now" }, ...activity]);
        setIsEditing(false);
        
        // Update session storage with saved data
        sessionStorage.setItem("userProfile", JSON.stringify(profileData));
      } else {
        alert("Profile save failed: " + (response.data.message || "Unknown error"));
      }
    } catch (error) {
      console.error("Error saving profile:", error);
      alert("Error saving profile: " + (error.response?.data?.message || error.message));
    }
  };

  /* UPDATE PROFILE */
  const updateProfile = () => {
    if (!user.name || !user.email) {
      alert("Please fill name and email!");
      return;
    }
    alert("Profile updated successfully ");
    setActivity([{ action: "Updated profile information", icon: "fa-edit", date: "Just now" }, ...activity]);
  };

  /* ADD SKILL */
  const addSkill = () => {
    if (newSkill.trim()) {
      setSkills([...skills, { name: newSkill, level: newSkillLevel }]);
      setNewSkill("");
      setNewSkillLevel(50);
      setActivity([{ action: `Added ${newSkill} skill`, icon: "fa-plus-circle", date: "Just now" }, ...activity]);
    }
  };

  /* REMOVE SKILL */
  const removeSkill = (skillName) => {
    setSkills(skills.filter((s) => s.name !== skillName));
  };

  /* ADD PROJECT */
  const addProject = () => {
    if (newProject.name.trim()) {
      setProjects([...projects, { ...newProject, tech: newProject.tech.split(",").map(t => t.trim()) }]);
      setNewProject({ name: "", tech: "", status: "In Progress", link: "" });
      setShowAddProject(false);
      setActivity([{ action: `Added project: ${newProject.name}`, icon: "fa-folder-plus", date: "Just now" }, ...activity]);
    }
  };

  /* DELETE PROJECT */
  const deleteProject = (index) => {
    const updated = projects.filter((_, i) => i !== index);
    setProjects(updated);
  };

  /* ADD CERTIFICATION */
  const addCertification = () => {
    if (newCert.title.trim() && newCert.platform.trim()) {
      setCertifications([...certifications, newCert]);
      setNewCert({ title: "", platform: "", date: "" });
      setShowAddCert(false);
      setActivity([{ action: `Added certification: ${newCert.title}`, icon: "fa-certificate", date: "Just now" }, ...activity]);
    }
  };

  /* DELETE CERTIFICATION */
  const deleteCertification = (index) => {
    const updated = certifications.filter((_, i) => i !== index);
    setCertifications(updated);
  };

  /* ADD GOAL */
  const addGoal = () => {
    if (newGoal.goal.trim() && newGoal.deadline) {
      setGoals([...goals, { ...newGoal, completed: false }]);
      setNewGoal({ goal: "", deadline: "" });
      setShowAddGoal(false);
      setActivity([{ action: `Set new goal: ${newGoal.goal}`, icon: "fa-bullseye", date: "Just now" }, ...activity]);
    }
  };

  /* TOGGLE GOAL */
  const toggleGoal = (index) => {
    const updated = [...goals];
    updated[index].completed = !updated[index].completed;
    setGoals(updated);
    if (updated[index].completed) {
      setActivity([{ action: `Completed goal: ${updated[index].goal}`, icon: "fa-check-circle", date: "Just now" }, ...activity]);
    }
  };

  /* DELETE GOAL */
  const deleteGoal = (index) => {
    const updated = goals.filter((_, i) => i !== index);
    setGoals(updated);
  };

  /* ADD COURSE */
  const addCourse = () => {
    if (newCourse.name.trim()) {
      setCourses([...courses, newCourse]);
      setNewCourse({ name: "", status: "In Progress", progress: 0 });
      setShowAddCourse(false);
      setActivity([{ action: `Started course: ${newCourse.name}`, icon: "fa-book", date: "Just now" }, ...activity]);
    }
  };

  /* DELETE COURSE */
  const deleteCourse = (index) => {
    const updated = courses.filter((_, i) => i !== index);
    setCourses(updated);
  };

  /* ADD EXPERIENCE */
  const addExperience = () => {
    if (newExperience.company.trim() && newExperience.role.trim()) {
      setExperience([...experience, newExperience]);
      setNewExperience({ company: "", role: "", duration: "", description: "" });
      setShowAddExperience(false);
      setActivity([{ action: `Added experience at ${newExperience.company}`, icon: "fa-briefcase", date: "Just now" }, ...activity]);
    }
  };

  /* DELETE EXPERIENCE */
  const deleteExperience = (index) => {
    const updated = experience.filter((_, i) => i !== index);
    setExperience(updated);
  };

  /* ADD ACHIEVEMENT */
  const addAchievement = () => {
    if (newAchievement.title.trim()) {
      setAchievements([...achievements, newAchievement]);
      setNewAchievement({ title: "", icon: "fa-trophy", date: "" });
      setShowAddAchievement(false);
      setActivity([{ action: `Unlocked achievement: ${newAchievement.title}`, icon: "fa-star", date: "Just now" }, ...activity]);
    }
  };

  // Load existing profile data on component mount
  useEffect(() => {
    const loadProfileData = async () => {
      try {
        const currentUser = JSON.parse(sessionStorage.getItem("currentUser"));
        if (!currentUser || !currentUser.id) {
          console.log("User not logged in, using empty profile");
          return;
        }

        // Load profile from database
        const response = await axios.get(`http://localhost:5000/api/profile/${currentUser.id}`);
        
        if (response.data.success && response.data.profile) {
          const profile = response.data.profile;
          
          // Set user data
          setUser({
            name: profile.personalInfo?.name || "",
            email: profile.personalInfo?.email || "",
            phone: profile.personalInfo?.phone || "",
            college: profile.personalInfo?.college || "",
            degree: profile.personalInfo?.degree || "",
            year: profile.personalInfo?.year || "",
            role: profile.personalInfo?.role || "Student",
            bio: profile.personalInfo?.bio || "",
            github: profile.socialLinks?.github || "",
            linkedin: profile.socialLinks?.linkedin || "",
            portfolio: profile.socialLinks?.portfolio || "",
            location: profile.personalInfo?.location || "",
            address: profile.personalInfo?.address || "",
            birthday: profile.personalInfo?.birthday || "",
            gender: profile.personalInfo?.gender || ""
          });
          
          // Set other data
          setSkills(profile.skills || []);
          setExperience(profile.experience || []);
          setProjects(profile.projects || []);
          setCertifications(profile.certifications || []);
          setCourses(profile.courses || []);
          setGoals(profile.goals || []);
          setAchievements(profile.achievements || []);
          
          if (profile.profilePhoto) {
            setPhoto(profile.profilePhoto);
          }
          
          console.log("Profile loaded successfully");
        }
      } catch (error) {
        console.error("Error loading profile:", error);
      }
    };
    
    loadProfileData();
  }, []);

  /* DELETE ACHIEVEMENT */
  const deleteAchievement = (index) => {
    const updated = achievements.filter((_, i) => i !== index);
    setAchievements(updated);
  };

  return (
    <>
      <main className="profile">

        {/* HEADER */}
        <div className="profile-header">
          <div className="header-content">
            <h2>
              <i className="fas fa-user-graduate"></i> Student Profile
            </h2>
            <div className="profile-date-container">
              <i className="fas fa-calendar-alt"></i> Profile created on{" "}
              <span 
                className="profile-date-value" 
                style={{
                  color: '#ffffff',
                  fill: '#ffffff',
                  WebkitTextFillColor: '#ffffff'
                }}
              >
                {createdAt}
              </span>
            </div>
          </div>
          <button 
            className={`edit-toggle-btn ${isEditing ? 'editing' : ''}`}
            onClick={isEditing ? saveProfile : () => setIsEditing(true)}
          >
            <i className={`fas ${isEditing ? 'fa-save' : 'fa-edit'}`}></i>
            {isEditing ? 'Save Profile' : 'Edit Profile'}
          </button>
        </div>

        {/* PROFILE OVERVIEW CARD */}
        <section className="profile-overview-card">
          <div className="profile-top">
            {/* LEFT COLUMN - Profile Info */}
            <div className="profile-left">
              <div className="profile-avatar-container">
                <div className="profile-avatar">
                  <img src={photo} alt="User" />
                  <label className="upload-btn">
                    <i className="fas fa-camera"></i>
                    <input
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={handlePhotoChange}
                    />
                  </label>
                </div>
                <div className="progress-ring-container">
                  <ProgressRing 
                    progress={animatedStats.profileCompletion} 
                    size={140}
                    strokeWidth={8}
                    primaryColor="#3b82f6"
                    secondaryColor="#8b5cf6"
                    animated={true}
                    className="profile-completion-ring"
                  />
                </div>
              </div>

              <div className="profile-info">
                <h3>{user.name || "Your Name"}</h3>
                <p className="role-badge">
                  <i className="fas fa-id-badge"></i> {user.role}
                </p>
                {user.bio && <p className="bio">{user.bio}</p>}
              </div>
            </div>

            {/* RIGHT COLUMN - Stats Cards */}
            <div className="profile-right">
              <div className="stats-cards-grid">
                <StatCard
                  icon="fas fa-code"
                  title="Projects"
                  value={projects.length}
                  color="#3b82f6"
                  bgColor="#f0f4ff"
                  size="medium"
                />
                <StatCard
                  icon="fas fa-certificate"
                  title="Certifications"
                  value={certifications.length}
                  color="#10b981"
                  bgColor="#f0fdf4"
                  size="medium"
                />
                <StatCard
                  icon="fas fa-brain"
                  title="Skills"
                  value={skills.length}
                  color="#8b5cf6"
                  bgColor="#faf5ff"
                  size="medium"
                />
                <StatCard
                  icon="fas fa-bullseye"
                  title="Goals"
                  value={`${completedGoals}/${totalGoals}`}
                  color="#f59e0b"
                  bgColor="#fffbeb"
                  size="medium"
                />
              </div>

              {/* PROFILE STATS - Moved to bottom */}
              <div className="profile-stats">
                <div className="stat-item">
                  <strong>{animatedStats.completedCourses}</strong>
                  <span>Courses Done</span>
                </div>
                <div className="stat-item">
                  <strong>{animatedStats.totalCourses}</strong>
                  <span>Total Courses</span>
                </div>
                <div className="stat-item">
                  <strong>{animatedStats.progress}%</strong>
                  <span>Progress</span>
                </div>
              </div>

              {goals.length > 0 && (
                <div className="goals-progress">
                  <h4>Goals Progress</h4>
                  <div className="progress-bar-container">
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${goalProgress}%` }}>
                        {goalProgress}%
                      </div>
                    </div>
                    <p>{completedGoals} of {totalGoals} goals completed</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* TABS */}
        <section className="profile-tabs">
          <button 
            className={activeTab === "overview" ? "active" : ""} 
            onClick={() => setActiveTab("overview")}
          >
            <i className="fas fa-home"></i> Overview
          </button>
          <button 
            className={activeTab === "details" ? "active" : ""} 
            onClick={() => setActiveTab("details")}
          >
            <i className="fas fa-user"></i> Details
          </button>
          <button 
            className={activeTab === "projects" ? "active" : ""} 
            onClick={() => setActiveTab("projects")}
          >
            <i className="fas fa-code"></i> Projects
          </button>
          <button 
            className={activeTab === "achievements" ? "active" : ""} 
            onClick={() => setActiveTab("achievements")}
          >
            <i className="fas fa-trophy"></i> Achievements
          </button>
        </section>

        {/* OVERVIEW TAB */}
        {activeTab === "overview" && (
          <>
            {/* QUICK STATS */}
            <div className="stats-grid">
              <StatCard
                icon="fas fa-code"
                title="Projects"
                value={projects.length}
                color="#3b82f6"
                bgColor="#f0f4ff"
                size="large"
              />
              <StatCard
                icon="fas fa-certificate"
                title="Certifications"
                value={certifications.length}
                color="#10b981"
                bgColor="#f0fdf4"
                size="large"
              />
              <StatCard
                icon="fas fa-brain"
                title="Skills"
                value={skills.length}
                color="#8b5cf6"
                bgColor="#faf5ff"
                size="large"
              />
              <StatCard
                icon="fas fa-bullseye"
                title="Goals"
                value={`${completedGoals}/${totalGoals}`}
                color="#f59e0b"
                bgColor="#fffbeb"
                size="large"
              />
            </div>

            {/* GOALS PROGRESS */}
            {goals.length > 0 && (
              <section className="profile-card">
                <h3>
                  <i className="fas fa-target"></i> Goals Progress
                </h3>
                <div className="progress-bar-container">
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${goalProgress}%` }}>
                      {goalProgress}%
                    </div>
                  </div>
                  <p>{completedGoals} of {totalGoals} goals completed</p>
                </div>
              </section>
            )}

            {/* ACTIVITY */}
            <section className="profile-card">
              <h3>
                <i className="fas fa-history"></i> Recent Activity
              </h3>
              <ul className="activity-list">
                {activity.slice(0, 10).map((item, index) => (
                  <li key={index}>
                    <i className={`fas ${item.icon}`}></i> 
                    {item.action}
                    <span className="activity-date">{item.date}</span>
                  </li>
                ))}
              </ul>
            </section>
          </>
        )}

        {/* DETAILS TAB */}
        {activeTab === "details" && (
          <>
            {/* BASIC INFO */}
            <section className="profile-card">
              <h3>
                <i className="fas fa-id-card"></i> Basic Information
              </h3>

              <div className="profile-grid">
                <div>
                  <label>Full Name *</label>
                  <input name="name" placeholder="Enter your name" value={user.name} onChange={handleChange} />
                </div>

                <div>
                  <label>Email *</label>
                  <input name="email" type="email" placeholder="your@email.com" value={user.email} onChange={handleChange} />
                </div>

                <div>
                  <label>Phone</label>
                  <input name="phone" placeholder="+91 XXXXX XXXXX" value={user.phone} onChange={handleChange} />
                </div>

                <div>
                  <label>Location</label>
                  <input name="location" placeholder="City, State" value={user.location} onChange={handleChange} />
                </div>

                <div>
                  <label>College</label>
                  <input name="college" placeholder="Your college name" value={user.college} onChange={handleChange} />
                </div>

                <div>
                  <label>Degree</label>
                  <input name="degree" placeholder="BCA / B.Tech" value={user.degree} onChange={handleChange} />
                </div>

                <div>
                  <label>Year</label>
                  <select name="year" value={user.year} onChange={handleChange}>
                    <option value="">Select Year</option>
                    <option>1st Year</option>
                    <option>2nd Year</option>
                    <option>3rd Year</option>
                    <option>4th Year</option>
                    <option>Graduate</option>
                  </select>
                </div>

                <div>
                  <label>Role</label>
                  <select name="role" value={user.role} onChange={handleChange}>
                    <option>Student</option>
                    <option>Fresher</option>
                    <option>Job Seeker</option>
                    <option>Frontend Developer</option>
                    <option>Backend Developer</option>
                    <option>Full Stack Developer</option>
                  </select>
                </div>
              </div>

              <div className="profile-grid single">
                <div>
                  <label>Bio</label>
                  <textarea 
                    name="bio" 
                    placeholder="Tell us about yourself..." 
                    value={user.bio} 
                    onChange={handleChange}
                    rows="4"
                  ></textarea>
                </div>
              </div>

              <button className="profile-btn" onClick={saveProfile}>
                <i className="fas fa-save"></i> Save Profile
              </button>
            </section>

            {/* SOCIAL LINKS */}
            <section className="profile-card">
              <h3>
                <i className="fas fa-link"></i> Social Links
              </h3>

              <div className="profile-grid">
                <div>
                  <label><i className="fab fa-github"></i> GitHub</label>
                  <input name="github" placeholder="https://github.com/username" value={user.github} onChange={handleChange} />
                </div>

                <div>
                  <label><i className="fab fa-linkedin"></i> LinkedIn</label>
                  <input name="linkedin" placeholder="https://linkedin.com/in/username" value={user.linkedin} onChange={handleChange} />
                </div>

                <div>
                  <label><i className="fas fa-globe"></i> Portfolio</label>
                  <input name="portfolio" placeholder="https://yourportfolio.com" value={user.portfolio} onChange={handleChange} />
                </div>
              </div>
            </section>

            {/* SKILLS */}
            <section className="profile-card">
              <h3>
                <i className="fas fa-brain"></i> Skills
              </h3>

              {skills.length > 0 && (
                <div className="skills-progress">
                  {skills.map((skill, index) => (
                    <div key={index} className="skill-item">
                      <div className="skill-header">
                        <span>{skill.name}</span>
                        <div className="skill-actions">
                          <strong>{skill.level}%</strong>
                          <button className="delete-btn" onClick={() => removeSkill(skill.name)}>
                            <i className="fas fa-times"></i>
                          </button>
                        </div>
                      </div>
                      <div className="skill-bar">
                        <div className="skill-fill" style={{ width: `${skill.level}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="profile-grid">
                <div>
                  <label>Skill Name</label>
                  <input
                    placeholder="e.g., React, Python, etc."
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                  />
                </div>
                <div>
                  <label>Proficiency Level: {newSkillLevel}%</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={newSkillLevel}
                    onChange={(e) => setNewSkillLevel(e.target.value)}
                  />
                </div>
              </div>

              <button className="profile-btn outline" onClick={addSkill}>
                <i className="fas fa-plus"></i> Add Skill
              </button>
            </section>

            {/* EXPERIENCE */}
            <section className="profile-card">
              <h3>
                <i className="fas fa-briefcase"></i> Experience
              </h3>

              {experience.length > 0 && (
                <div className="experience-list">
                  {experience.map((exp, index) => (
                    <div key={index} className="experience-item">
                      <div className="experience-header">
                        <div>
                          <h4>{exp.role}</h4>
                          <p><i className="fas fa-building"></i> {exp.company}</p>
                          <p><i className="fas fa-clock"></i> {exp.duration}</p>
                        </div>
                        <button className="delete-btn" onClick={() => deleteExperience(index)}>
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                      <p className="experience-desc">{exp.description}</p>
                    </div>
                  ))}
                </div>
              )}

              {!showAddExperience && (
                <button className="profile-btn outline" onClick={() => setShowAddExperience(true)}>
                  <i className="fas fa-plus"></i> Add Experience
                </button>
              )}

              {showAddExperience && (
                <div className="add-form">
                  <div className="profile-grid">
                    <div>
                      <label>Company Name *</label>
                      <input
                        placeholder="Company name"
                        value={newExperience.company}
                        onChange={(e) => setNewExperience({ ...newExperience, company: e.target.value })}
                      />
                    </div>
                    <div>
                      <label>Role *</label>
                      <input
                        placeholder="Your role"
                        value={newExperience.role}
                        onChange={(e) => setNewExperience({ ...newExperience, role: e.target.value })}
                      />
                    </div>
                    <div>
                      <label>Duration</label>
                      <input
                        placeholder="Jan 2023 - Present"
                        value={newExperience.duration}
                        onChange={(e) => setNewExperience({ ...newExperience, duration: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="profile-grid single">
                    <div>
                      <label>Description</label>
                      <textarea
                        placeholder="Describe your responsibilities..."
                        value={newExperience.description}
                        onChange={(e) => setNewExperience({ ...newExperience, description: e.target.value })}
                        rows="3"
                      ></textarea>
                    </div>
                  </div>
                  <div className="form-actions">
                    <button className="profile-btn" onClick={addExperience}>
                      <i className="fas fa-check"></i> Add Experience
                    </button>
                    <button className="profile-btn outline" onClick={() => setShowAddExperience(false)}>
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </section>

            {/* CERTIFICATIONS */}
            <section className="profile-card">
              <h3>
                <i className="fas fa-certificate"></i> Certifications
              </h3>

              {certifications.length > 0 && (
                <div className="cert-list">
                  {certifications.map((cert, index) => (
                    <div key={index} className="cert-item">
                      <div className="cert-icon">
                        <i className="fas fa-award"></i>
                      </div>
                      <div className="cert-details">
                        <h4>{cert.title}</h4>
                        <p><i className="fas fa-building"></i> {cert.platform}</p>
                        {cert.date && <p><i className="fas fa-calendar"></i> {cert.date}</p>}
                      </div>
                      <button className="delete-btn" onClick={() => deleteCertification(index)}>
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {!showAddCert && (
                <button className="profile-btn outline" onClick={() => setShowAddCert(true)}>
                  <i className="fas fa-plus"></i> Add Certification
                </button>
              )}

              {showAddCert && (
                <div className="add-form">
                  <div className="profile-grid">
                    <div>
                      <label>Certification Title *</label>
                      <input
                        placeholder="e.g., JavaScript Basics"
                        value={newCert.title}
                        onChange={(e) => setNewCert({ ...newCert, title: e.target.value })}
                      />
                    </div>
                    <div>
                      <label>Platform *</label>
                      <input
                        placeholder="e.g., Coursera, Udemy"
                        value={newCert.platform}
                        onChange={(e) => setNewCert({ ...newCert, platform: e.target.value })}
                      />
                    </div>
                    <div>
                      <label>Date</label>
                      <input
                        placeholder="e.g., Jan 2024"
                        value={newCert.date}
                        onChange={(e) => setNewCert({ ...newCert, date: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="form-actions">
                    <button className="profile-btn" onClick={addCertification}>
                      <i className="fas fa-check"></i> Add Certification
                    </button>
                    <button className="profile-btn outline" onClick={() => setShowAddCert(false)}>
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </section>

            {/* COURSES */}
            <section className="profile-card">
              <h3>
                <i className="fas fa-book"></i> Courses
              </h3>

              {courses.length > 0 && (
                <div className="course-list">
                  {courses.map((course, index) => (
                    <div key={index} className="course-item">
                      <div className="course-header">
                        <div>
                          <h4>{course.name}</h4>
                          <span className={`status-badge ${course.status.toLowerCase().replace(" ", "-")}`}>
                            {course.status}
                          </span>
                        </div>
                        <button className="delete-btn" onClick={() => deleteCourse(index)}>
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                      <div className="course-progress">
                        <div className="progress-bar">
                          <div className="progress-fill" style={{ width: `${course.progress}%` }}></div>
                        </div>
                        <span>{course.progress}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {!showAddCourse && (
                <button className="profile-btn outline" onClick={() => setShowAddCourse(true)}>
                  <i className="fas fa-plus"></i> Add Course
                </button>
              )}

              {showAddCourse && (
                <div className="add-form">
                  <div className="profile-grid">
                    <div>
                      <label>Course Name *</label>
                      <input
                        placeholder="e.g., React Advanced"
                        value={newCourse.name}
                        onChange={(e) => setNewCourse({ ...newCourse, name: e.target.value })}
                      />
                    </div>
                    <div>
                      <label>Status</label>
                      <select
                        value={newCourse.status}
                        onChange={(e) => setNewCourse({ ...newCourse, status: e.target.value })}
                      >
                        <option>In Progress</option>
                        <option>Completed</option>
                        <option>Not Started</option>
                      </select>
                    </div>
                    <div>
                      <label>Progress: {newCourse.progress}%</label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={newCourse.progress}
                        onChange={(e) => setNewCourse({ ...newCourse, progress: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="form-actions">
                    <button className="profile-btn" onClick={addCourse}>
                      <i className="fas fa-check"></i> Add Course
                    </button>
                    <button className="profile-btn outline" onClick={() => setShowAddCourse(false)}>
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </section>
          </>
        )}

        {/* PROJECTS TAB */}
        {activeTab === "projects" && (
          <section className="profile-card">
            <h3>
              <i className="fas fa-code"></i> Projects
            </h3>

            {projects.length > 0 && (
              <div className="project-grid">
                {projects.map((project, index) => (
                  <div key={index} className="project-card">
                    <div className="project-header">
                      <h4>{project.name}</h4>
                      <button className="delete-btn" onClick={() => deleteProject(index)}>
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                    <div className="project-tech">
                      {project.tech.map((tech, idx) => (
                        <span key={idx} className="tech-tag">{tech}</span>
                      ))}
                    </div>
                    <div className="project-status">
                      <i className="fas fa-clock"></i> {project.status}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {projects.length > 0 && !showAddProject && (
              <button className="profile-btn outline" onClick={() => setShowAddProject(true)}>
                <i className="fas fa-plus"></i> Add Project
              </button>
            )}

            {showAddProject && (
              <div className="add-form">
                <div className="profile-grid">
                  <div>
                    <label>Project Name *</label>
                    <input
                      placeholder="e.g., E-commerce Website"
                      value={newProject.name}
                      onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label>Technologies (comma-separated)</label>
                    <input
                      placeholder="e.g., React, Node.js, MongoDB"
                      value={newProject.tech}
                      onChange={(e) => setNewProject({ ...newProject, tech: e.target.value })}
                    />
                  </div>
                  <div>
                    <label>Status</label>
                    <select
                      value={newProject.status}
                      onChange={(e) => setNewProject({ ...newProject, status: e.target.value })}
                    >
                      <option>In Progress</option>
                      <option>Completed</option>
                      <option>Planning</option>
                    </select>
                  </div>
                  <div>
                    <label>Project Link</label>
                    <input
                      placeholder="https://github.com/username/project"
                      value={newProject.link}
                      onChange={(e) => setNewProject({ ...newProject, link: e.target.value })}
                    />
                  </div>
                </div>
                <div className="form-actions">
                  <button className="profile-btn" onClick={addProject}>
                    <i className="fas fa-check"></i> Add Project
                  </button>
                  <button className="profile-btn outline" onClick={() => setShowAddProject(false)}>
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {projects.length === 0 && !showAddProject && (
              <div className="empty-state">
                <i className="fas fa-folder-open"></i>
                <h4>No Projects Yet</h4>
                <p>Start building your portfolio by adding your first project.</p>
                <button className="profile-btn" onClick={() => setShowAddProject(true)}>
                  <i className="fas fa-plus"></i> Add Your First Project
                </button>
              </div>
            )}
          </section>
        )}

        {/* ACHIEVEMENTS TAB */}
        {activeTab === "achievements" && (
          <section className="profile-card">
            <h3>
              <i className="fas fa-trophy"></i> Achievements
            </h3>

            {achievements.length > 0 && (
              <div className="achievement-grid">
                {achievements.map((achievement, index) => (
                  <div key={index} className="achievement-card">
                    <div className="achievement-icon">
                      <i className={`fas ${achievement.icon}`}></i>
                    </div>
                    <div className="achievement-details">
                      <h4>{achievement.title}</h4>
                      {achievement.date && <p><i className="fas fa-calendar"></i> {achievement.date}</p>}
                    </div>
                    <button className="delete-btn" onClick={() => deleteAchievement(index)}>
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                ))}
              </div>
            )}

            {achievements.length > 0 && !showAddAchievement && (
              <button className="profile-btn outline" onClick={() => setShowAddAchievement(true)}>
                <i className="fas fa-plus"></i> Add Achievement
              </button>
            )}

            {showAddAchievement && (
              <div className="add-form">
                <div className="profile-grid">
                  <div>
                    <label>Achievement Title *</label>
                    <input
                      placeholder="e.g., Hackathon Winner"
                      value={newAchievement.title}
                      onChange={(e) => setNewAchievement({ ...newAchievement, title: e.target.value })}
                    />
                  </div>
                  <div>
                    <label>Icon</label>
                    <select
                      value={newAchievement.icon}
                      onChange={(e) => setNewAchievement({ ...newAchievement, icon: e.target.value })}
                    >
                      <option value="fa-trophy">🏆 Trophy</option>
                      <option value="fa-medal">🥇 Medal</option>
                      <option value="fa-star">⭐ Star</option>
                      <option value="fa-award">🎖️ Award</option>
                      <option value="fa-certificate">📜 Certificate</option>
                    </select>
                  </div>
                  <div>
                    <label>Date</label>
                    <input
                      placeholder="e.g., Jan 2024"
                      value={newAchievement.date}
                      onChange={(e) => setNewAchievement({ ...newAchievement, date: e.target.value })}
                    />
                  </div>
                </div>
                <div className="form-actions">
                  <button className="profile-btn" onClick={addAchievement}>
                    <i className="fas fa-check"></i> Add Achievement
                  </button>
                  <button className="profile-btn outline" onClick={() => setShowAddAchievement(false)}>
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {achievements.length === 0 && !showAddAchievement && (
              <div className="empty-state">
                <i className="fas fa-trophy"></i>
                <h4>No Achievements Yet</h4>
                <p>Start documenting your accomplishments and milestones.</p>
                <button className="profile-btn" onClick={() => setShowAddAchievement(true)}>
                  <i className="fas fa-plus"></i> Add Your First Achievement
                </button>
              </div>
            )}
          </section>
        )}

      </main>
    </>
  );
}
