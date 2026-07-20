import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { safeArray, safeSlice, safeGet, safeAxiosCall } from "../../utils/apiHelpers";
import { useEffectOnce, useApiCall } from "../../hooks/useApiHooks";
import { fallbackDashboardData } from "../../data/fallbackData";
import { API_BASE_URL } from '../../utils/constants';
import "./Dashboard.css";

export default function Dashboard() {
  const navigate = useNavigate();

  // Analytics state
  const [analytics, setAnalytics] = useState({
    placementProbability: 0,
    bestRoleMatch: "Not Available",
    totalSkills: 0,
    profileStrength: "Very Bad",
    confidenceLevel: 0,
    totalXP: 100
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Animated stats
  const [placementProb, setPlacementProb] = useState(0);
  const [profileStrength, setProfileStrength] = useState(0);
  const [skillGaps, setSkillGaps] = useState(0);

  // User data
  const [userName, setUserName] = useState("User");
  const [streak, setStreak] = useState(0);
  const [xpPoints, setXpPoints] = useState(0);
  const [lastActiveDate, setLastActiveDate] = useState(null);
  const [userLevel, setUserLevel] = useState(1);
  const [nextLevelXP, setNextLevelXP] = useState(100);
  const [currentLevelXP, setCurrentLevelXP] = useState(0);

  // Profile completion state
  const [profileCompletion, setProfileCompletion] = useState({
    percentage: 0,
    basicInfo: false,
    skills: false,
    projects: false,
    certifications: false
  });

  // Real-time skills data
  const [skills, setSkills] = useState([]);

  const [achievements, setAchievements] = useState([
    { title: "First Project", icon: "fa-rocket", unlocked: false, description: "Add your first project to profile", progress: 0 },
    { title: "7 Day Streak", icon: "fa-fire", unlocked: false, description: "Maintain a 7-day learning streak", progress: 0 },
    { title: "Skill Master", icon: "fa-star", unlocked: false, description: "Add 5+ skills with 70%+ level", progress: 0 },
    { title: "100% Profile", icon: "fa-trophy", unlocked: false, description: "Complete all profile sections", progress: 0 }
  ]);

  const [activities, setActivities] = useState([]);

  // Real-time activity time updater
  useEffect(() => {
    const interval = setInterval(() => {
      setActivities(prevActivities => 
        prevActivities.map(activity => ({
          ...activity,
          time: getTimeAgo(activity.timestamp)
        }))
      );
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  // New features state
  const [notifications, setNotifications] = useState([]);
  const [learningProgress, setLearningProgress] = useState([]);
  const [userRoadmaps, setUserRoadmaps] = useState([]);
  const [quickActions, setQuickActions] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [weather, setWeather] = useState({ temp: 72, condition: "Sunny" });
  const [motivationalQuote, setMotivationalQuote] = useState("");
  const [timeGreeting, setTimeGreeting] = useState("");
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Fetch real notifications from backend
  const fetchNotifications = async () => {
    try {
      const currentUser = JSON.parse(sessionStorage.getItem("currentUser"));
      if (!currentUser || !currentUser.id) return;

      const response = await axios.get(`${API_BASE_URL}/notifications/${currentUser.id}`);
      
      if (response.data.success && Array.isArray(response.data.data)) {
        setNotifications(response.data.data.slice(0, 5));
        console.log("Real notifications loaded:", response.data.data);
      } else {
        // Set sample notifications for demo if no data or invalid format
        setNotifications([
          { id: 1, type: "achievement", message: "New achievement unlocked!", time: "2 hours ago", icon: "fa-trophy" },
          { id: 2, type: "reminder", message: "Complete your profile", time: "1 day ago", icon: "fa-bell" }
        ]);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
      // Set sample notifications for demo
      setNotifications([
        { id: 1, type: "achievement", message: "New achievement unlocked!", time: "2 hours ago", icon: "fa-trophy" },
        { id: 2, type: "reminder", message: "Complete your profile", time: "1 day ago", icon: "fa-bell" }
      ]);
    }
  };

  // Fetch dynamic mastery paths
  const fetchUserRoadmaps = async () => {
    try {
      const storedUser = JSON.parse(localStorage.getItem("user")) || JSON.parse(sessionStorage.getItem("currentUser"));
      const userId = storedUser?._id || storedUser?.id;
      if (!userId) return;

      const response = await axios.get(`${API_BASE_URL}/roadmap/${userId}`);
      if (response.data.success) {
        setUserRoadmaps(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching user roadmaps:", error);
    }
  };

  // Fetch real learning progress from backend
  const fetchLearningProgress = async () => {
    try {
      const currentUser = JSON.parse(sessionStorage.getItem("currentUser"));
      if (!currentUser || !currentUser.id) return;

      const response = await axios.get(`http://localhost:5000/api/analytics/learning-progress?userId=${currentUser.id}`);
      
      if (response.data.success && Array.isArray(response.data.data)) {
        setLearningProgress(response.data.data);
        console.log("Real learning progress loaded:", response.data.data);
      } else {
        // Calculate from user skills as fallback
        try {
          const profileResponse = await axios.get(`http://localhost:5000/api/profile/${currentUser.id}`);
          if (profileResponse.data.success && profileResponse.data.profile) {
            const userSkills = profileResponse.data.profile.skills || [];
            const progress = userSkills.map(skill => ({
              name: skill.name,
              progress: skill.level || 0,
              target: 100,
              status: skill.level >= 70 ? "Mastered" : skill.level >= 50 ? "Intermediate" : "Beginner"
            }));
            setLearningProgress(Array.isArray(progress) ? progress.slice(0, 4) : []);
          }
        } catch (profileError) {
          console.error("Error fetching profile for learning progress:", profileError);
          setLearningProgress([]);
        }
      }
    } catch (error) {
      console.error("Error fetching learning progress:", error);
      setLearningProgress([]);
    }
  };

  // Fetch quick actions based on user profile
  const fetchQuickActions = async () => {
    try {
      const currentUser = JSON.parse(sessionStorage.getItem("currentUser"));
      if (!currentUser || !currentUser.id) return;

      const profileResponse = await axios.get(`http://localhost:5000/api/profile/${currentUser.id}`);
      const userStatsResponse = await axios.get(`http://localhost:5000/api/analytics/user-stats?userId=${currentUser.id}`);
      
      const actions = [];
      
      // Dynamic actions based on profile completion
      if (profileResponse.data.success && profileResponse.data.profile) {
        const profile = profileResponse.data.profile;
        const completion = calculateProfileCompletion(profile);
        
        if (!profile.projects || profile.projects.length === 0) {
          actions.push({ id: 1, title: "Add Project", icon: "fa-plus", color: "#3b82f6", action: () => navigate("/profile", { state: { section: "projects" } }) });
        }
        
        if (profile.skills && profile.skills.length < 3) {
          actions.push({ id: 2, title: "Add Skills", icon: "fa-star", color: "#10b981", action: () => navigate("/profile", { state: { section: "skills" } }) });
        }
        
        if (completion.percentage < 100) {
          actions.push({ id: 3, title: "Complete Profile", icon: "fa-user", color: "#f59e0b", action: () => navigate("/profile") });
        }
      }
      
      // Learning-based actions
      if (userStatsResponse.data.success) {
        const stats = userStatsResponse.data.data;
        if (stats.currentStreak < 3) {
          actions.push({ id: 4, title: "Start Learning", icon: "fa-play", color: "#8b5cf6", action: () => navigate("/roadmap") });
        }
      }
      
      setQuickActions(actions.slice(0, 4));
      console.log("Quick actions generated:", actions);
    } catch (error) {
      console.error("Error fetching quick actions:", error);
    }
  };

  // Fetch upcoming events from backend
  const fetchUpcomingEvents = async () => {
    try {
      const currentUser = JSON.parse(sessionStorage.getItem("currentUser"));
      if (!currentUser || !currentUser.id) {
        console.log("No user found, using fallback events");
        setUpcomingEvents(fallbackDashboardData.upcomingEvents);
        return;
      }

      const response = await axios.get(`http://localhost:5000/api/events/upcoming?userId=${currentUser.id}`);
      
      if (response.data.success && Array.isArray(response.data.data?.events)) {
        setUpcomingEvents(response.data.data.events.slice(0, 3));
        console.log("Real upcoming events loaded:", response.data.data.events);
      } else {
        console.log("Using fallback events - API response invalid");
        setUpcomingEvents(fallbackDashboardData.upcomingEvents);
      }
    } catch (error) {
      console.error("Error fetching upcoming events:", error);
      console.log("Using fallback events due to error");
      setUpcomingEvents(fallbackDashboardData.upcomingEvents);
    }
  };

  // Calculate profile completion percentage
  const calculateProfileCompletion = (profile) => {
    // Handle null or undefined profile
    if (!profile) {
      return { percentage: 0 };
    }
    
    let completion = 0;
    let sections = 0;
    
    if (profile.name && profile.email) { completion += 25; sections++; }
    if (profile.skills && profile.skills.length > 0) { completion += 25; sections++; }
    if (profile.projects && profile.projects.length > 0) { completion += 25; sections++; }
    if (profile.certifications && profile.certifications.length > 0) { completion += 25; sections++; }
    
    return { percentage: sections > 0 ? completion : 0 };
  };

  // Set time-based greeting
  const setTimeBasedGreeting = () => {
    const hour = new Date().getHours();
    let greeting = "";
    
    if (hour < 12) {
      greeting = "Good Morning";
    } else if (hour < 17) {
      greeting = "Good Afternoon";
    } else {
      greeting = "Good Evening";
    }
    
    setTimeGreeting(greeting);
  };

  // Fetch motivational quote from API
  const fetchMotivationalQuote = async () => {
    try {
      const quotes = [
        "The expert in anything was once a beginner.",
        "Success is the sum of small efforts repeated day in and day out.",
        "Your limitation—it's only your imagination.",
        "Great things never come from comfort zones.",
        "Dream it. Wish it. Do it.",
        "Success doesn't just find you. You have to go out and get it.",
        "The harder you work for something, the greater you'll feel when you achieve it.",
        "Don't stop when you're tired. Stop when you're done."
      ];
      
      const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
      setMotivationalQuote(randomQuote);
    } catch (error) {
      setMotivationalQuote("Keep learning and growing!");
    }
  };

  // Helper function to get activity icon
  const getActivityIcon = (activity) => {
    const iconMap = {
      'profile_updated': 'fa-user',
      'skill_assessment': 'fa-brain',
      'project_added': 'fa-folder-plus',
      'skill_added': 'fa-star',
      'certification_added': 'fa-certificate',
      'achievement_unlocked': 'fa-trophy',
      'roadmap_viewed': 'fa-road',
      'skill_gap_viewed': 'fa-tools',
      'market_trends_checked': 'fa-globe',
      'predictor_viewed': 'fa-robot',
      'daily_login': 'fa-calendar-check',
      'learning_completed': 'fa-graduation-cap',
      'quiz_completed': 'fa-question-circle',
      'deadline_met': 'fa-clock',
      'collaboration_started': 'fa-users',
      'resource_accessed': 'fa-book',
      'feedback_given': 'fa-comment',
      'milestone_reached': 'fa-flag'
    };
    return iconMap[activity] || 'fa-circle';
  };

  // Helper function to get activity points
  const getActivityPoints = (activity) => {
    const pointsMap = {
      'profile_updated': 10,
      'skill_assessment': 25,
      'project_added': 15,
      'skill_added': 10,
      'certification_added': 20,
      'achievement_unlocked': 30,
      'roadmap_viewed': 5,
      'skill_gap_viewed': 10,
      'market_trends_checked': 8,
      'predictor_viewed': 12,
      'daily_login': 10,
      'learning_completed': 15,
      'quiz_completed': 20,
      'deadline_met': 25,
      'collaboration_started': 18,
      'resource_accessed': 5,
      'feedback_given': 8,
      'milestone_reached': 35
    };
    return pointsMap[activity] || 5;
  };

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const [learningHours, setLearningHours] = useState([
    { day: "Mon", hours: 0 },
    { day: "Tue", hours: 0 },
    { day: "Wed", hours: 0 },
    { day: "Thu", hours: 0 },
    { day: "Fri", hours: 0 },
    { day: "Sat", hours: 0 },
    { day: "Sun", hours: 0 }
  ]);

  // Calculate achievements based on user profile data
  const calculateAchievements = async () => {
    try {
      const currentUser = JSON.parse(sessionStorage.getItem("currentUser"));
      if (!currentUser || !currentUser.id) {
        console.log("No currentUser found for achievements calculation");
        return;
      }

      console.log("Calculating achievements for user:", currentUser.id);
      
      // Get user profile data directly
      const profileResponse = await axios.get(`http://localhost:5000/api/profile/${currentUser.id}`);
      const userStatsResponse = await axios.get(`http://localhost:5000/api/analytics/user-stats?userId=${currentUser.id}`);
      
      let updatedAchievements = [...achievements];
      
      // Calculate First Project achievement - based on profile projects
      if (profileResponse.data.success && profileResponse.data.profile) {
        const profile = profileResponse.data.profile;
        const hasProjects = profile.projects && profile.projects.length > 0;
        updatedAchievements[0].unlocked = hasProjects;
        updatedAchievements[0].progress = hasProjects ? 100 : 0;
        console.log("First Project - Projects found:", hasProjects);
      }
      
      // Calculate 7 Day Streak achievement - from user stats
      if (userStatsResponse.data.success) {
        const stats = userStatsResponse.data.data;
        const streakDays = stats.currentStreak || 0;
        updatedAchievements[1].unlocked = streakDays >= 7;
        updatedAchievements[1].progress = Math.min((streakDays / 7) * 100, 100);
        console.log("7 Day Streak - Current streak:", streakDays);
      }
      
      // Calculate Skill Master achievement - based on profile skills
      if (profileResponse.data.success && profileResponse.data.profile) {
        const profile = profileResponse.data.profile;
        const userSkills = profile.skills || [];
        const masteredSkills = userSkills.filter(skill => (skill.level || 0) >= 70).length;
        updatedAchievements[2].unlocked = masteredSkills >= 5;
        updatedAchievements[2].progress = Math.min((masteredSkills / 5) * 100, 100);
        console.log("Skill Master - Mastered skills:", masteredSkills, "Total skills:", userSkills.length);
      }
      
      // Calculate 100% Profile achievement - based on profile completion
      const completionPercentage = profileCompletion.percentage || 0;
      updatedAchievements[3].unlocked = completionPercentage >= 100;
      updatedAchievements[3].progress = completionPercentage;
      console.log("100% Profile - Completion:", completionPercentage + "%");
      
      setAchievements(updatedAchievements);
      console.log("Final achievements calculated:", updatedAchievements);
      
      // Save achievements to backend
      await saveAchievements(updatedAchievements);
      
    } catch (error) {
      console.error("Error calculating achievements:", error);
    }
  };

  // Save achievements to backend
  const saveAchievements = async (achievementsData) => {
    try {
      const currentUser = JSON.parse(sessionStorage.getItem("currentUser"));
      if (!currentUser || !currentUser.id) return;

      await axios.post(`http://localhost:5000/api/analytics/save-achievements`, {
        userId: currentUser.id,
        achievements: achievementsData
      });
      
      console.log("Achievements saved successfully");
    } catch (error) {
      console.error("Error saving achievements:", error);
    }
  };

  // Fetch achievements from backend
  const fetchAchievements = async () => {
    try {
      const currentUser = JSON.parse(sessionStorage.getItem("currentUser"));
      if (!currentUser || !currentUser.id) return;

      const response = await axios.get(`http://localhost:5000/api/analytics/achievements?userId=${currentUser.id}`);
      
      if (response.data.success) {
        setAchievements(response.data.data.achievements);
        console.log("Achievements loaded from backend:", response.data.data.achievements);
      }
    } catch (error) {
      console.error("Error fetching achievements:", error);
      // Calculate achievements if fetch fails
      calculateAchievements();
    }
  };

  // Handle achievement click
  const handleAchievementClick = (achievement) => {
    console.log("Achievement clicked:", achievement);
    trackUserActivity(`achievement_viewed_${achievement.title.toLowerCase().replace(/\s+/g, '_')}`);
    
    // Navigate to profile page for editing profile data
    if (achievement.title === "First Project") {
      navigate("/profile", { state: { section: "projects" } });
    } else if (achievement.title === "100% Profile") {
      navigate("/profile");
    } else if (achievement.title === "Skill Master") {
      navigate("/profile", { state: { section: "skills" } });
    } else if (achievement.title === "7 Day Streak") {
      // Show streak details or refresh learning activity
      fetchLearningActivity();
    }
  };

  // Fetch recent activities from backend
  const fetchRecentActivities = async () => {
    try {
      const currentUser = JSON.parse(sessionStorage.getItem("currentUser"));
      if (!currentUser || !currentUser.id) {
        console.log("No currentUser found for activities fetch");
        setActivities([]);
        return;
      }

      console.log("Fetching recent activities for user:", currentUser.id);
      
      // Get activities from analytics recentActivity array
      const response = await axios.get(`http://localhost:5000/api/analytics/${currentUser.id}`);
      
      if (response.data.success && response.data.analytics && response.data.analytics.recentActivity) {
        const recentActivities = response.data.analytics.recentActivity;
        
        // Transform activities for display
        const transformedActivities = recentActivities.slice(0, 10).map((activity, index) => {
          const activityTime = new Date(activity.timestamp || activity.time);
          const timeAgo = getTimeAgo(activityTime);
          
          // Map activity actions to icons
          const iconMap = {
            'profile_updated': 'fa-user',
            'skill_assessment': 'fa-brain',
            'roadmap_viewed': 'fa-road',
            'market_trends_checked': 'fa-globe',
            'course_completed': 'fa-graduation-cap',
            'project_work': 'fa-code',
            'placement_probability_checked': 'fa-chart-line',
            'best_role_match_checked': 'fa-briefcase',
            'skills_analyzed_checked': 'fa-star',
            'profile_strength_checked': 'fa-user-graduate',
            'skill_gap_viewed': 'fa-tools',
            'predictor_viewed': 'fa-robot',
            'learning_activity_refreshed': 'fa-sync-alt'
          };
          
          return {
            action: activity.action || 'Activity logged',
            time: timeAgo,
            icon: iconMap[activity.action?.toLowerCase()] || 'fa-circle',
            timestamp: activityTime,
            points: activity.points || 0
          };
        });
        
        setActivities(transformedActivities);
        console.log("Real recent activities loaded:", transformedActivities);
      } else {
        console.log("No recent activities found - setting empty array");
        setActivities([]);
      }
    } catch (error) {
      console.error("Error fetching recent activities:", error);
      // Set empty array on error - no fallback data
      setActivities([]);
    }
  };

  // Helper function to calculate time ago
  const getTimeAgo = (date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) {
      return 'Just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    } else {
      const weeks = Math.floor(diffInSeconds / 604800);
      return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
    }
  };

  // Handle activity click
  const handleActivityClick = (activity) => {
    console.log("Activity clicked:", activity);
    trackUserActivity(`recent_activity_clicked_${activity.action.toLowerCase().replace(/\s+/g, '_')}`);
    
    // Navigate based on activity type
    if (activity.action.toLowerCase().includes('profile')) {
      navigate("/profile");
    } else if (activity.action.toLowerCase().includes('skill')) {
      navigate("/skillgap");
    } else if (activity.action.toLowerCase().includes('roadmap')) {
      navigate("/roadmap");
    } else if (activity.action.toLowerCase().includes('market')) {
      navigate("/market-intel");
    } else if (activity.action.toLowerCase().includes('course')) {
      navigate("/courses");
    } else if (activity.action.toLowerCase().includes('project')) {
      navigate("/predictor");
    }
  };

// Fetch learning activity data
const fetchLearningActivity = async () => {
  try {
    const currentUser = JSON.parse(sessionStorage.getItem("currentUser"));
    if (!currentUser || !currentUser.id) {
      console.log("No currentUser found for learning activity");
      return;
    }

    console.log("Fetching learning activity for user:", currentUser.id);
    
    const response = await axios.get(`http://localhost:5000/api/analytics/learning-activity?userId=${currentUser.id}`);
    
    if (response.data.success) {
      const activityData = response.data.data;
      console.log("Learning activity loaded:", activityData);
      
      // Update learning hours with real data
      setLearningHours(activityData.weeklyHours || [
        { day: "Mon", hours: 0 },
        { day: "Tue", hours: 0 }, 
        { day: "Wed", hours: 0 },
        { day: "Thu", hours: 0 },
        { day: "Fri", hours: 0 },
        { day: "Sat", hours: 0 },
        { day: "Sun", hours: 0 }
      ]);
    } else {
      console.log("No learning activity data found");
    }
  } catch (error) {
    console.error("Error fetching learning activity:", error);
    // Use fallback data based on current day
    const currentDay = new Date().getDay();
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const today = dayNames[currentDay];
    
    // Generate some sample data for demonstration
    setLearningHours([
      { day: "Mon", hours: currentDay >= 1 ? Math.random() * 3 : 0 },
      { day: "Tue", hours: currentDay >= 2 ? Math.random() * 3 : 0 },
      { day: "Wed", hours: currentDay >= 3 ? Math.random() * 3 : 0 },
      { day: "Thu", hours: currentDay >= 4 ? Math.random() * 3 : 0 },
      { day: "Fri", hours: currentDay >= 5 ? Math.random() * 3 : 0 },
      { day: "Sat", hours: currentDay >= 6 ? Math.random() * 3 : 0 },
      { day: "Sun", hours: currentDay === 0 ? Math.random() * 3 : 0 }
    ]);
  }
};

  // Track user activity in real-time with immediate UI update
  const trackUserActivity = async (activity) => {
    try {
      const currentUser = JSON.parse(sessionStorage.getItem("currentUser"));
      if (!currentUser || !currentUser.id) return;

      // Create activity object immediately for UI update
      const newActivity = {
        action: activity,
        time: "Just now",
        icon: getActivityIcon(activity),
        timestamp: new Date(),
        points: getActivityPoints(activity)
      };

      // Update UI immediately - show activity in real-time
      setActivities(prevActivities => [newActivity, ...prevActivities.slice(0, 9)]);
      
      console.log("Tracking real-time activity:", activity);

      // Send to backend for persistence
      await axios.post(`http://localhost:5000/api/analytics/track-activity`, {
        userId: currentUser.id,
        activity: activity,
        timestamp: new Date().toISOString()
      });

      console.log("Activity tracked and UI updated in real-time");
    } catch (error) {
      console.error("Error tracking activity:", error);
    }
  };


  // Calculate user level based on XP
  const calculateUserLevel = (xp) => {
    let level = 1;
    let levelXP = 0;
    let nextLevel = 100;
    
    while (xp >= nextLevel) {
      level++;
      levelXP = nextLevel;
      nextLevel = level * 100;
    }
    
    return {
      level,
      currentLevelXP: xp - levelXP,
      nextLevelXP: nextLevel - levelXP
    };
  };

  // Calculate streak based on activity
  const calculateStreak = (activities) => {
    if (!activities || activities.length === 0) return 0;
    
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Check if user was active today
    const todayActive = activities.some(activity => {
      const activityDate = new Date(activity.time);
      activityDate.setHours(0, 0, 0, 0);
      return activityDate.getTime() === today.getTime();
    });
    
    if (todayActive) {
      streak = 1;
      // Check consecutive days
      for (let i = 1; i < 30; i++) {
        const checkDate = new Date(today);
        checkDate.setDate(checkDate.getDate() - i);
        
        const dayActive = activities.some(activity => {
          const activityDate = new Date(activity.time);
          activityDate.setHours(0, 0, 0, 0);
          return activityDate.getTime() === checkDate.getTime();
        });
        
        if (dayActive) {
          streak++;
        } else {
          break;
        }
      }
    }
    
    return streak;
  };

  // Fetch user skills from backend (analytics data)
  const fetchUserSkills = async () => {
    try {
      const currentUser = JSON.parse(sessionStorage.getItem("currentUser"));
      if (!currentUser || !currentUser.id) {
        console.log("No userId found for skills fetch");
        return;
      }

      // Fetch analytics data which contains skills information
      const response = await axios.get(`http://localhost:5000/api/analytics/${currentUser.id}`);
      
      if (response.data.success && response.data.analytics) {
        const analyticsData = response.data.analytics;
        let transformedSkills = [];
        
        // Extract skills from analytics data
        if (analyticsData.skills && Array.isArray(analyticsData.skills)) {
          transformedSkills = analyticsData.skills.map(skill => ({
            name: skill.name || 'Unknown Skill',
            level: skill.level || skill.proficiency || 0,
            category: skill.category || 'Technical'
          }));
        }
        
        // If no skills in analytics, try to get from profile
        if (transformedSkills.length === 0) {
          const profileResponse = await axios.get(`http://localhost:5000/api/profile/${currentUser.id}`);
          
          if (profileResponse.data.success && profileResponse.data.profile && profileResponse.data.profile.skills) {
            const userSkills = profileResponse.data.profile.skills;
            transformedSkills = userSkills.map(skill => ({
              name: skill.name || 'Unknown Skill',
              level: skill.level || 0,
              category: skill.category || 'Technical'
            }));
          }
        }
        
        // Sort by level (highest first) and limit to top 6 skills
        transformedSkills.sort((a, b) => b.level - a.level);
        transformedSkills = transformedSkills.slice(0, 6);
        
        if (transformedSkills.length > 0) {
          setSkills(transformedSkills);
          console.log("Skills loaded from analytics:", transformedSkills);
        } else {
          // Set default skills if no skills found
          setSkills([
            { name: "JavaScript", level: 50, category: "Technical" },
            { name: "React", level: 45, category: "Technical" },
            { name: "Communication", level: 60, category: "Soft Skills" },
            { name: "Problem Solving", level: 55, category: "Technical" }
          ]);
          console.log("Using default skills - no skills found in analytics or profile");
        }
      } else {
        console.log("No analytics data found, fetching from profile");
        // Fallback to profile skills
        const profileResponse = await axios.get(`http://localhost:5000/api/profile/${currentUser.id}`);
        
        if (profileResponse.data.success && profileResponse.data.profile && profileResponse.data.profile.skills) {
          const userSkills = profileResponse.data.profile.skills;
          const transformedSkills = userSkills.map(skill => ({
            name: skill.name || 'Unknown Skill',
            level: skill.level || 0,
            category: skill.category || 'Technical'
          }));
          setSkills(transformedSkills);
          console.log("Skills loaded from profile:", transformedSkills);
        } else {
          // Set default skills if no skills found
          setSkills([
            { name: "JavaScript", level: 50, category: "Technical" },
            { name: "React", level: 45, category: "Technical" },
            { name: "Communication", level: 60, category: "Soft Skills" },
            { name: "Problem Solving", level: 55, category: "Technical" }
          ]);
          console.log("Using default skills - no profile skills found");
        }
      }
    } catch (error) {
      console.error("Error fetching user skills:", error);
      // Set default skills if fetch fails
      setSkills([
        { name: "JavaScript", level: 50, category: "Technical" },
        { name: "React", level: 45, category: "Technical" },
        { name: "Communication", level: 60, category: "Soft Skills" },
        { name: "Problem Solving", level: 55, category: "Technical" }
      ]);
      console.log("Using default skills due to error");
    }
  };

// Fetch user activity and stats
  const fetchUserStats = async () => {
    try {
      const currentUser = JSON.parse(sessionStorage.getItem("currentUser"));
      if (!currentUser || !currentUser.id) {
        console.log("No currentUser or userId found");
        return;
      }

      console.log("Fetching user stats for userId:", currentUser.id);

      // Fetch user activity from backend
      const response = await axios.get(`http://localhost:5000/api/analytics/user-stats?userId=${currentUser.id}`);
      
      console.log("User stats response:", response.data);
      
      if (response.data.success) {
        const stats = response.data.data;
        
        // Update XP and calculate level
        setXpPoints(stats.totalXP || 0);
        const levelData = calculateUserLevel(stats.totalXP || 0);
        setUserLevel(levelData.level);
        setCurrentLevelXP(levelData.currentLevelXP);
        setNextLevelXP(levelData.nextLevelXP);
        
        // Update streak
        setStreak(stats.currentStreak || 0);
        
        // Update last active date
        if (stats.lastActive) {
          setLastActiveDate(new Date(stats.lastActive));
        }
      } else {
        console.error("API returned error:", response.data.message);
      }
    } catch (error) {
      console.error("Error fetching user stats:", error);
      if (error.response) {
        console.error("Error response:", error.response.data);
        console.error("Error status:", error.response.status);
      }
      if (error.request) {
        console.error("No response received:", error.request);
      }
      
      // Use localStorage fallback
      const savedXP = localStorage.getItem('userXP') || 0;
      const savedStreak = localStorage.getItem('userStreak') || 0;
      const lastActive = localStorage.getItem('lastActiveDate');
      
      setXpPoints(parseInt(savedXP));
      setStreak(parseInt(savedStreak));
      
      if (lastActive) {
        setLastActiveDate(new Date(lastActive));
      }
      
      const levelData = calculateUserLevel(parseInt(savedXP));
      setUserLevel(levelData.level);
      setCurrentLevelXP(levelData.currentLevelXP);
      setNextLevelXP(levelData.nextLevelXP);
    }
  };

  // Award XP for user actions
  const awardXP = async (action, points) => {
    try {
      const currentUser = JSON.parse(sessionStorage.getItem("currentUser"));
      if (!currentUser || !currentUser.id) return;

      const newXP = xpPoints + points;
      setXpPoints(newXP);
      
      // Update level
      const levelData = calculateUserLevel(newXP);
      setUserLevel(levelData.level);
      setCurrentLevelXP(levelData.currentLevelXP);
      setNextLevelXP(levelData.nextLevelXP);
      
      // Save to backend
      await axios.post(`http://localhost:5000/api/analytics/award-xp`, {
        userId: currentUser.id,
        action,
        points,
        totalXP: newXP
      });
      
      // Update localStorage as fallback
      localStorage.setItem('userXP', newXP.toString());
      
      // Show notification
      showXPNotification(action, points);
      
    } catch (error) {
      console.error("Error awarding XP:", error);
      // Fallback to localStorage
      const newXP = xpPoints + points;
      setXpPoints(newXP);
      localStorage.setItem('userXP', newXP.toString());
      
      const levelData = calculateUserLevel(newXP);
      setUserLevel(levelData.level);
      setCurrentLevelXP(levelData.currentLevelXP);
      setNextLevelXP(levelData.nextLevelXP);
    }
  };

  // Show XP notification
  const showXPNotification = (action, points) => {
    // You can implement a toast notification here
    console.log(`+${points} XP for ${action}`);
  };

  const fetchProfileData = async () => {
    try {
      const currentUser = JSON.parse(sessionStorage.getItem("currentUser"));
      if (!currentUser || !currentUser.id) {
        return null;
      }

      const response = await axios.get(`http://localhost:5000/api/profile/${currentUser.id}`);
      
      if (response.data.success && response.data.profile) {
        return response.data.profile;
      }
      return null;
    } catch (error) {
      console.error("Error fetching profile data:", error);
      return null;
    }
  };

  const getStrengthLabel = (strength) => {
    if (strength === "Very Good") return "Very Good";
    if (strength === "Good") return "Good";
    if (strength === "Bad") return "Bad";
    if (strength === "Very Bad") return "Very Bad";
    return strength;
  };

  const getStrengthValue = (strength) => {
    switch (strength) {
      case "Very Good": return 100;
      case "Good": return 75;
      case "Moderate": return 50;
      case "Needs Work": return 25;
      case "Very Bad": return 10;
      default: return 0;
    }
  };

  // Fetch dashboard analytics from backend - Senior Debugged Version
  const fetchDashboard = async () => {
    try {
      const currentUser = JSON.parse(sessionStorage.getItem("currentUser"));
      if (!currentUser || !currentUser.id) {
        console.warn("⚠️ [DASHBOARD] USER NOT FOUND IN STORAGE");
        return;
      }

      setLoading(true);
      console.log("🔍 [DASHBOARD] FETCHING REAL-TIME METRICS FOR:", currentUser.id);
      
      const response = await axios.get(
        `http://localhost:5000/api/analytics/dashboard-stats/${currentUser.id}`
      );
      
      console.log("✅ [DASHBOARD] API RESPONSE:", response.data);

      if (response.data.success && response.data.data) {
        const dData = response.data.data;
        
        // 1. Update Aggregate Analytics State
        setAnalytics({
          placementProbability: dData.probability,
          bestRoleMatch: dData.role,
          totalSkills: dData.skillsAnalyzed,
          profileStrength: dData.profileStrength,
          totalXP: dData.totalXP,
          currentStreak: dData.currentStreak
        });

        // 2. Trigger Animated Counters
        const animateValue = (start, end, duration, setter) => {
          if (end === undefined || end === null) return;
          const range = end - start;
          const increment = range / (duration / 16);
          let current = start;
          const timer = setInterval(() => {
            current += increment;
            if ((range > 0 && current >= end) || (range < 0 && current <= end)) {
              setter(end);
              clearInterval(timer);
            } else {
              setter(Math.floor(current));
            }
          }, 16);
        };

        animateValue(0, dData.probability || 0, 1500, setPlacementProb);
        animateValue(0, dData.skillsAnalyzed || 0, 1200, setSkillGaps);
        animateValue(0, getStrengthValue(dData.profileStrength), 1500, setProfileStrength);
        
        // 3. Update Individual Direct States
        setStreak(dData.currentStreak || 0);
        setXpPoints(dData.totalXP || 100);
        setUserName(currentUser.name || "User");
        
        console.log("🌟 [DASHBOARD] STATE UPDATED SUCCESSFULLY");
      }
    } catch (error) {
      console.error("❌ [DASHBOARD] FETCH FAILURE:", error);
      setError("Failed to synchronize metrics. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Create sample analytics data if none exists
  const createSampleDataIfNeeded = async () => {
    try {
      const currentUser = JSON.parse(sessionStorage.getItem("currentUser"));
      if (!currentUser || !currentUser.id) return;

      console.log("Checking if sample data needed for user:", currentUser.id);
      
      // Check if analytics data exists
      const response = await axios.get(`http://localhost:5000/api/analytics/my-dashboard?userId=${currentUser.id}`);
      
      if (response.data.success && response.data.data) {
        const analytics = response.data.data;
        
        // If all values are 0 or "Not Available", create sample data
        if (analytics.placementProbability === 0 && 
            analytics.bestRoleMatch === "Not Available" && 
            analytics.totalSkills === 0) {
          
          console.log("No analytics data found - using fallback data");
          // Skip sample data creation to avoid errors
          // The dashboard will use default/fallback values
        }
      }
    } catch (error) {
      console.error("Error creating sample data:", error);
      console.log("Continuing without sample data - using fallback data");
      // Don't throw error, just continue with fallback data
    }
  };

  // Initialize all new features
  const initializeFeatures = async () => {
    try {
      await Promise.allSettled([
        fetchNotifications(),
        fetchLearningProgress(),
        fetchQuickActions(),
        fetchUpcomingEvents(),
        setTimeBasedGreeting(),
        fetchMotivationalQuote()
      ]);
      console.log("All new features initialized");
    } catch (error) {
      console.error("Error initializing features:", error);
    }
  };

  // Load analytics and user stats on component mount
  useEffect(() => {
    const initializeDashboard = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Initialize new features
        initializeFeatures();
        
        // Fetch all dashboard data with error handling for each
        const fetchPromises = [];
        
        try {
          fetchPromises.push(fetchDashboard());
        } catch (error) {
          console.error("Dashboard fetch failed:", error);
        }
        
        // After fetching dashboard, check if sample data is needed
        try {
          fetchPromises.push(createSampleDataIfNeeded());
        } catch (error) {
          console.error("Sample data creation failed:", error);
        }
        
        // Set fallback data if no user found
        const currentUser = JSON.parse(sessionStorage.getItem("currentUser"));
        if (!currentUser || !currentUser.id) {
          console.log("No user found, setting fallback data");
          setAnalytics(fallbackDashboardData.analytics);
          setNotifications(fallbackDashboardData.notifications);
          setUpcomingEvents(fallbackDashboardData.upcomingEvents);
          setLearningProgress(fallbackDashboardData.learningProgress);
          setQuickActions(fallbackDashboardData.quickActions);
          setAchievements(fallbackDashboardData.achievements);
          setActivities(fallbackDashboardData.activities);
          setLearningHours(fallbackDashboardData.learningHours);
          setSkills(fallbackDashboardData.skills);
          setLoading(false);
          return;
        }
        
        try {
          fetchPromises.push(fetchUserStats());
        } catch (error) {
          console.error("User stats fetch failed:", error);
        }
        
        try {
          fetchPromises.push(fetchUserSkills());
        } catch (error) {
          console.error("User skills fetch failed:", error);
        }
        
        try {
          fetchPromises.push(fetchLearningActivity());
        } catch (error) {
          console.error("Learning activity fetch failed:", error);
        }
        
        try {
          fetchPromises.push(fetchAchievements());
        } catch (error) {
          console.error("Achievements fetch failed:", error);
        }
        
        try {
          fetchPromises.push(fetchRecentActivities());
        } catch (error) {
          console.error("Recent activities fetch failed:", error);
        }
        
        await Promise.allSettled(fetchPromises);
        
        // Award daily login bonus
        const lastLogin = localStorage.getItem('lastLoginDate');
        const today = new Date().toDateString();
        
        if (lastLogin !== today) {
          awardXP('Daily Login', 10);
          localStorage.setItem('lastLoginDate', today);
        }
      } catch (error) {
        console.error('Dashboard initialization error:', error);
        setError('Some dashboard features may be limited. Please refresh the page.');
      } finally {
        setLoading(false);
      }
    };

    initializeDashboard();
  }, []);

  // Load profile data
  useEffect(() => {
    const loadProfileData = async () => {
      // Fetch real profile data
      const profileData = await fetchProfileData();
      
      // Update user name
      const currentUser = JSON.parse(sessionStorage.getItem("currentUser"));
      if (currentUser && currentUser.name) {
        setUserName(currentUser.name);
      }

      // Calculate profile completion with real data (only if profileData exists)
      if (profileData) {
        const completion = calculateProfileCompletion(profileData);
        setProfileCompletion(completion);
      } else {
        setProfileCompletion({ percentage: 0 });
      }
    };

    loadProfileData();
  }, []);

  // Profile completion animation
  useEffect(() => {
    if (profileCompletion.percentage > 0) {
      const animateValue = (start, end, duration, setter) => {
        const range = end - start;
        const increment = range / (duration / 16);
        let current = start;
        
        const timer = setInterval(() => {
          current += increment;
          if (current >= end) {
            setter(end);
            clearInterval(timer);
          } else {
            setter(Math.floor(current));
          }
        }, 16);
      };

      // Animate to the calculated percentage
      animateValue(0, profileCompletion.percentage, 1000, (value) => {
        // This would update a progress bar if needed
      });
    }
  }, [profileCompletion]);

  // Also refresh profile data
  const refreshProfileData = async () => {
    const profileData = await fetchProfileData();
    
    // Calculate profile completion only if profileData exists
    if (profileData) {
      const completion = calculateProfileCompletion(profileData);
      setProfileCompletion(completion);
    } else {
      setProfileCompletion({ percentage: 0 });
    }
    
    // Recalculate achievements when profile data changes
    calculateAchievements();
  };

  // Refresh analytics data
  const refreshAnalytics = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchDashboard(),
        fetchUserStats(),
        fetchUserSkills(),
        fetchUserRoadmaps(),
        fetchLearningActivity()
      ]);
    } catch (error) {
      console.error('Error refreshing analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  // Safe rendering - prevent crashes
  if (loading) {
    return (
      <main className="dashboard">
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading Dashboard...</p>
        </div>
      </main>
    );
  }

  // Error state
  if (error) {
    return (
      <main className="dashboard">
        <div className="error-state">
          <div className="error-icon">
            <i className="fas fa-exclamation-triangle"></i>
          </div>
          <h3>Oops! Something went wrong</h3>
          <p>{error}</p>
          <button className="retry-btn" onClick={() => window.location.reload()}>
            <i className="fas fa-redo"></i> Try Again
          </button>
        </div>
      </main>
    );
  }

  // Inline styles for white cards
  const cardStyle = {
    background: 'linear-gradient(135deg, #ffffff, #f8fafc)',
    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
    border: '2px solid #e2e8f0'
  };

  const statValueStyle = {
    color: '#1e293b'
  };

  const cardH3Style = {
    color: '#64748b'
  };

  const badgeSuccessStyle = {
    background: 'linear-gradient(135deg, #dbeafe, #bfdbfe)',
    color: '#1e40af',
    border: '1px solid rgba(30, 64, 175, 0.2)',
    boxShadow: '0 2px 8px rgba(59, 130, 246, 0.2)'
  };

  const badgeInfoStyle = {
    background: 'linear-gradient(135deg, #dbeafe, #bfdbfe)',
    color: '#1e40af',
    border: '1px solid rgba(30, 64, 175, 0.2)',
    boxShadow: '0 2px 8px rgba(59, 130, 246, 0.2)'
  };

  const badgeWarningStyle = {
    background: 'linear-gradient(135deg, #dbeafe, #bfdbfe)',
    color: '#1e40af',
    border: '1px solid rgba(30, 64, 175, 0.2)',
    boxShadow: '0 2px 8px rgba(59, 130, 246, 0.2)'
  };

  const badgePrimaryStyle = {
    background: 'linear-gradient(135deg, #dbeafe, #bfdbfe)',
    color: '#1e40af',
    border: '1px solid rgba(30, 64, 175, 0.2)',
    boxShadow: '0 2px 8px rgba(59, 130, 246, 0.2)'
  };

  return (
    <main className="dashboard">

      {/* HEADER */}
      <div className="dashboard-header">
        <div className="header-left">
          <h2>Welcome back, {userName}! 👋</h2>
          <p>Complete overview of your academic & career progress</p>
        </div>

        <div className="header-right">
          <button className="refresh-btn" onClick={refreshAnalytics} title="Refresh Analytics">
            <i className="fas fa-sync-alt"></i>
          </button>
          
          {/* Enhanced Streak Badge */}
          <div className="streak-badge enhanced">
            <div className="streak-icon">
              <i className="fas fa-fire"></i>
              {streak > 0 && <span className="streak-flame"></span>}
            </div>
            <div className="streak-info">
              <strong>{streak}</strong>{' '}
              <span>Day Streak</span>
              {streak >= 7 && <small className="streak-milestone">🔥 Week Warrior!</small>}
              {streak >= 30 && <small className="streak-milestone">💎 Master!</small>}
            </div>
          </div>
          
          {/* Enhanced XP Badge */}
          <div className="xp-badge enhanced">
            <div className="xp-icon">
              <i className="fas fa-star"></i>
              <span className="level-badge">Lv.{userLevel}</span>
            </div>
            <div className="xp-info">
              <div className="xp-main">
                <strong>{xpPoints.toLocaleString()}</strong>{' '}
                <span>Total XP</span>
              </div>
              <div className="xp-progress">
                <div className="xp-bar">
                  <div 
                    className="xp-fill" 
                    style={{ width: `${(currentLevelXP / nextLevelXP) * 100}%` }}
                  ></div>
                </div>
                <small>{currentLevelXP}/{nextLevelXP} XP</small>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN STATS CARDS */}
      <div className="cards">
        <div className="card clickable" onClick={() => {
          trackUserActivity('placement_probability_checked');
          navigate("/predictor");
        }} style={cardStyle}>
          <i className="fas fa-chart-line card-icon"></i>
          <h3 style={cardH3Style}>Placement Probability</h3>
          <p className="stat-value" style={statValueStyle}>{placementProb}%</p>
          <div className="card-footer">
            <span className="badge badge-success" style={badgeSuccessStyle}>
              {placementProb > 70 ? '↑ High' : placementProb > 40 ? '→ Medium' : '↓ Low'}
            </span>
          </div>
        </div>

        <div className="card clickable" onClick={() => {
          trackUserActivity('best_role_match_checked');
          navigate("/profile");
        }} style={cardStyle}>
          <i className="fas fa-briefcase card-icon"></i>
          <h3 style={cardH3Style}>Best Role Match</h3>
          <p className="stat-value" style={statValueStyle}>{analytics?.bestRoleMatch || 'Not Available'}</p>
          <div className="card-footer">
            <span className="badge badge-info" style={badgeInfoStyle}>
              {analytics?.bestRoleMatch && analytics.bestRoleMatch !== 'Not Available' ? 'Recommended' : 'Analysis Needed'}
            </span>
          </div>
        </div>

        <div className="card clickable" onClick={() => {
          trackUserActivity('skills_analyzed_checked');
          navigate("/skillgap");
        }} style={cardStyle}>
          <i className="fas fa-brain card-icon"></i>
          <h3 style={cardH3Style}>Skills Analyzed</h3>
          <p className="stat-value" style={statValueStyle}>{skillGaps}</p>
          <div className="card-footer">
            <span className="badge badge-primary" style={badgePrimaryStyle}>
              {skillGaps > 0 ? `${skillGaps} Skills` : 'No Skills'}
            </span>
          </div>
        </div>

        <div className="card clickable" onClick={() => {
          trackUserActivity('profile_strength_checked');
          navigate("/profile");
        }} style={cardStyle}>
          <i className="fas fa-user-graduate card-icon"></i>
          <h3 style={cardH3Style}>Profile Strength</h3>
          <p className="stat-value" style={statValueStyle}>{profileStrength}%</p>
          <div className="card-footer">
            <span className="badge badge-warning" style={badgeWarningStyle}>
              {profileStrength >= 75 ? 'Strong' : profileStrength >= 50 ? 'Moderate' : 'Needs Work'}
            </span>
          </div>
        </div>
      </div>

      {/* MAIN GRID SECTION */}
      <div className="dashboard-grid">

        {/* PROFILE COMPLETION */}
        <section className="profile-completion-card">
          <div className="pc-header">
            <div className="pc-title-row">
              <i className="fas fa-user-circle pc-icon"></i>
              <h3>Profile<br/>Completion</h3>
            </div>
            <div className="pc-badge">
              <span className={`pc-pill ${profileCompletion.percentage === 0 ? 'pc-just-started' : profileCompletion.percentage === 100 ? 'pc-complete' : 'pc-in-progress'}`}>
                {profileCompletion.percentage === 0 ? 'JUST STARTED' : profileCompletion.percentage === 100 ? 'COMPLETE' : 'IN PROGRESS'}
              </span>
            </div>
          </div>
          
          <p className="pc-subtitle">Complete your profile to get accurate predictions</p>

          <div className="pc-progress-track">
            <div className={`pc-progress-fill ${profileCompletion.percentage > 0 ? 'active' : ''}`} style={{ width: `${profileCompletion.percentage}%` }}></div>
          </div>

          <div className="pc-stats-box">
            <span className="pc-stat-label">COMPLETED:</span>
            <span className="pc-stat-value">
              <strong>{[profileCompletion.basicInfo, profileCompletion.skills, profileCompletion.projects, profileCompletion.certifications].filter(Boolean).length}/4</strong>
            </span>
            <span className="pc-stat-suffix">sections</span>
          </div>

          <div className="pc-grid">
            <div className={`pc-grid-item ${profileCompletion.basicInfo ? 'done' : 'pending'}`} onClick={() => !profileCompletion.basicInfo && navigate("/profile")} title={!profileCompletion.basicInfo ? "Click to add basic info" : "Completed"}>
              <div className="pc-item-icon">
                {profileCompletion.basicInfo ? <i className="fas fa-check-circle"></i> : <div className="pc-circle"></div>}
              </div>
              <div className="pc-item-text">
                <h4>Basic Info</h4>
                <p>Add your personal details</p>
              </div>
              <i className="fas fa-arrow-right pc-arrow"></i>
            </div>
            
            <div className={`pc-grid-item ${profileCompletion.skills ? 'done' : 'pending'}`} onClick={() => !profileCompletion.skills && navigate("/profile")} title={!profileCompletion.skills ? "Click to add skills" : "Completed"}>
              <div className="pc-item-icon">
                {profileCompletion.skills ? <i className="fas fa-check-circle"></i> : <div className="pc-circle"></div>}
              </div>
              <div className="pc-item-text">
                <h4>Skills Added</h4>
                <p>Add your technical skills</p>
              </div>
              <i className="fas fa-arrow-right pc-arrow"></i>
            </div>

            <div className={`pc-grid-item ${profileCompletion.projects ? 'done' : 'pending'}`} onClick={() => !profileCompletion.projects && navigate("/profile")} title={!profileCompletion.projects ? "Click to add projects" : "Completed"}>
              <div className="pc-item-icon">
                {profileCompletion.projects ? <i className="fas fa-check-circle"></i> : <div className="pc-circle"></div>}
              </div>
              <div className="pc-item-text">
                <h4>Add Projects</h4>
                <p>Showcase your work</p>
              </div>
              <i className="fas fa-arrow-right pc-arrow"></i>
            </div>

            <div className={`pc-grid-item ${profileCompletion.certifications ? 'done' : 'pending'}`} onClick={() => !profileCompletion.certifications && navigate("/profile")} title={!profileCompletion.certifications ? "Click to add certifications" : "Completed"}>
              <div className="pc-item-icon">
                {profileCompletion.certifications ? <i className="fas fa-check-circle"></i> : <div className="pc-circle"></div>}
              </div>
              <div className="pc-item-text">
                <h4>Add Certifications</h4>
                <p>Add your achievements</p>
              </div>
              <i className="fas fa-arrow-right pc-arrow"></i>
            </div>
          </div>

          <div className="pc-actions">
            <button className="pc-btn-primary" onClick={() => navigate("/profile")}>
              <i className="fas fa-edit"></i> {profileCompletion.percentage === 100 ? 'View Profile' : 'Complete Profile'}
            </button>
            {profileCompletion.percentage < 100 && (
              <button className="pc-btn-secondary" onClick={refreshAnalytics}>
                <i className="fas fa-sync-alt"></i> Check Status
              </button>
            )}
          </div>
        </section>

        {/* SKILLS */}
        <section className="section-box">
          <div className="box-header">
            <h3><i className="fas fa-brain"></i> Skill Levels</h3>
            <button className="text-btn" onClick={() => navigate("/skillgap")}>
              View All <i className="fas fa-arrow-right"></i>
            </button>
          </div>

          <div className="skills-list">
            {skills.map((skill, index) => (
              <div className="skill-item" key={index}>
                <div className="skill-header">
                  <span className="skill-name">{skill.name}</span>
                  <span className="skill-percentage">{skill.level}%</span>
                </div>
                <div className="progress">
                  <div 
                    className={`progress-fill ${skill.level >= 70 ? 'good' : skill.level >= 50 ? 'average' : 'low'}`}
                    style={{ width: `${skill.level}%` }}
                  ></div>
                </div>
                <span className="skill-category">{skill.category}</span>
              </div>
            ))}
          </div>
        </section>

        {/* LEARNING ACTIVITY CHART */}
        <section className="section-box">
          <div className="box-header">
            <h3><i className="fas fa-chart-bar"></i> Learning This Week</h3>
            <span className="total-hours">{learningHours.reduce((sum, day) => sum + day.hours, 0).toFixed(1)}h total</span>
          </div>

          <div className="learning-chart">
            {learningHours.map((day, index) => {
              const maxHours = Math.max(...learningHours.map(d => d.hours), 5);
              const heightPercentage = maxHours > 0 ? (day.hours / maxHours) * 100 : 0;
              const isToday = new Date().getDay() === index || (index === 6 && new Date().getDay() === 0);
              
              return (
                <div className="chart-bar" key={index}>
                  <div 
                    className={`bar-fill ${isToday ? 'today' : ''} ${day.hours > 0 ? 'active' : ''}`}
                    style={{ height: `${heightPercentage}%` }}
                    title={`${day.day}: ${day.hours.toFixed(1)} hours`}
                  >
                    {day.hours > 0 && (
                      <span className="bar-hours">{day.hours.toFixed(1)}h</span>
                    )}
                  </div>
                  <span className={`bar-label ${isToday ? 'today' : ''}`}>{day.day}</span>
                </div>
              );
            })}
          </div>

          <div className="dashboard-learning-stats">
            <div className="learning-stat-card">
              <i className="fas fa-fire"></i>
              <span>Current Streak: {streak} days</span>
            </div>
            <div className="learning-stat-card">
              <i className="fas fa-calendar-check"></i>
              <span>Active Days: {learningHours.filter(day => day.hours > 0).length}/7</span>
            </div>
            <div className="learning-stat-card">
              <i className="fas fa-clock"></i>
              <span>Daily Avg: {(learningHours.reduce((sum, day) => sum + day.hours, 0) / Math.max(learningHours.filter(day => day.hours > 0).length, 1)).toFixed(1)}h</span>
            </div>
          </div>

          <button className="refresh-learning-btn" onClick={() => {
            fetchLearningActivity();
            trackUserActivity('learning_activity_refreshed');
          }}>
            <i className="fas fa-sync-alt"></i> Refresh Activity
          </button>
        </section>


        {/* QUICK ACTIONS */}
        <section className="section-box">
          <div className="box-header">
            <h3><i className="fas fa-bolt"></i> Quick Actions</h3>
          </div>

          <div className="quick-actions">
            <button className="action-btn" onClick={() => {
              trackUserActivity('roadmap_viewed');
              navigate("/roadmap");
            }}>
              <i className="fas fa-route"></i>
              <span>View Roadmap</span>
            </button>

            <button className="action-btn" onClick={() => {
              trackUserActivity('skill_gap_viewed');
              navigate("/skillgap");
            }}>
              <i className="fas fa-tools"></i>
              <span>Skill Gap</span>
            </button>

            <button className="action-btn" onClick={() => {
              trackUserActivity('market_trends_checked');
              navigate("/market-intel");
            }}>
              <i className="fas fa-globe"></i>
              <span>Market Trends</span>
            </button>

            <button className="action-btn" onClick={() => {
              trackUserActivity('predictor_viewed');
              navigate("/predictor");
            }}>
              <i className="fas fa-robot"></i>
              <span>Predictor</span>
            </button>
          </div>
        </section>

        {/* ACHIEVEMENTS */}
        <section className="section-box">
          <div className="box-header">
            <h3><i className="fas fa-trophy"></i> Achievements</h3>
            <span className="achievement-count">{achievements.filter(a => a.unlocked).length}/{achievements.length} Unlocked</span>
          </div>

          <div className="achievements-grid">
            {achievements.map((achievement, index) => (
              <div 
                className={`achievement-badge ${achievement.unlocked ? 'unlocked' : 'locked'}`} 
                key={index}
                onClick={() => handleAchievementClick(achievement)}
                title={achievement.description}
              >
                <div className="achievement-icon">
                  <i className={`fas ${achievement.icon}`}></i>
                  {achievement.unlocked && <div className="glow-effect"></div>}
                </div>
                <div className="achievement-info">
                  <span className="achievement-title">{achievement.title}</span>
                  <div className="achievement-progress">
                    <div className="progress-bar">
                      <div 
                        className="progress-fill" 
                        style={{ width: `${achievement.progress}%` }}
                      ></div>
                    </div>
                    <span className="progress-text">{achievement.progress}%</span>
                  </div>
                </div>
                {achievement.unlocked && (
                  <div className="achievement-check">
                    <i className="fas fa-check"></i>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="achievement-tips">
            <p><i className="fas fa-lightbulb"></i> Complete activities to unlock achievements and earn XP!</p>
          </div>
        </section>

        {/* ACTIVITY */}
        <section className="section-box">
          <div className="box-header">
            <h3><i className="fas fa-history"></i> Recent Activity</h3>
            <button className="refresh-activity-btn" onClick={() => {
              fetchRecentActivities();
              trackUserActivity('recent_activity_refreshed');
            }}>
              <i className="fas fa-sync-alt"></i>
            </button>
          </div>

          <ul className="activity-list">
            {activities.length > 0 ? (
              activities.map((activity, index) => (
                <li 
                  key={index} 
                  className="activity-item"
                  onClick={() => handleActivityClick(activity)}
                >
                  <div className="activity-icon">
                    <i className={`fas ${activity.icon}`}></i>
                    {activity.points > 0 && (
                      <span className="activity-points">+{activity.points}</span>
                    )}
                  </div>
                  <div className="activity-content">
                    <span className="activity-action">{activity.action}</span>
                    <span className="activity-time">{activity.time}</span>
                  </div>
                  <div className="activity-arrow">
                    <i className="fas fa-chevron-right"></i>
                  </div>
                </li>
              ))
            ) : (
              <li className="no-activities">
                <i className="fas fa-info-circle"></i>
                <span>No recent activities found. Start exploring to see your activities here!</span>
              </li>
            )}
          </ul>

          {activities.length > 0 && (
            <div className="activity-summary">
              <div className="summary-item">
                <i className="fas fa-fire"></i>
                <span>Total XP Earned: {activities.reduce((sum, activity) => sum + (activity.points || 0), 0)}</span>
              </div>
              <div className="summary-item">
                <i className="fas fa-calendar-check"></i>
                <span>Activities: {activities.length}</span>
              </div>
            </div>
          )}
        </section>

        {/* NEW FEATURES SECTION */}
        <div className="features-grid">
          {/* Notifications */}
          <section className="section-box notifications-box">
            <div className="box-header">
              <h3><i className="fas fa-bell"></i> Notifications</h3>
              <span className={`connection-status ${isOnline ? 'online' : 'offline'}`}>
                <i className={`fas fa-${isOnline ? 'wifi' : 'wifi-slash'}`}></i>
              </span>
            </div>
            <div className="notifications-list">
              {notifications.length > 0 ? (
                notifications.map(notification => (
                  <div key={notification.id} className={`notification-item ${notification.type}`}>
                    <i className={`fas ${notification.icon}`}></i>
                    <div className="notification-content">
                      <p>{notification.message}</p>
                      <span className="notification-time">{notification.time}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-notifications">
                  <i className="fas fa-check-circle"></i>
                  <p>All caught up! No new notifications.</p>
                </div>
              )}
            </div>
          </section>

          {/* Learning Progress */}
          <section className="section-box learning-progress-box">
            <div className="box-header">
              <h3><i className="fas fa-chart-line"></i> Learning Progress</h3>
            </div>
            <div className="progress-list">
              {learningProgress.length > 0 ? (
                learningProgress.map((course, index) => (
                  <div key={index} className="learning-progress-item">
                    <div className="progress-info">
                      <h4>{course.name}</h4>
                      <span className={`progress-status st-${course.status.toLowerCase().replace(/\s+/g, '-')}`}>{course.status}</span>
                    </div>
                    <div className="progress-bar-container">
                      <div className="progress">
                        <div 
                          className={`progress-fill ${course.progress >= 70 ? 'good' : course.progress >= 50 ? 'average' : 'low'}`}
                          style={{ width: `${course.progress}%` }}
                        ></div>
                      </div>
                      <span className="progress-text">{course.progress}%</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-progress">
                  <i className="fas fa-book"></i>
                  <p>Start learning to see your progress here!</p>
                </div>
              )}
            </div>
          </section>

          {/* Quick Actions */}
          <section className="section-box actions-box">
            <div className="box-header">
              <h3><i className="fas fa-bolt"></i> Quick Actions</h3>
            </div>
            <div className="actions-grid">
              {quickActions.map(action => (
                <button 
                  key={action.id} 
                  className="action-btn"
                  onClick={action.action}
                  style={{ '--action-color': action.color }}
                >
                  <i className={`fas ${action.icon}`}></i>
                  <span>{action.title}</span>
                </button>
              ))}
            </div>
          </section>

          {/* Upcoming Events */}
          <section className="section-box events-box">
            <div className="box-header">
              <h3><i className="fas fa-calendar"></i> Upcoming Events</h3>
            </div>
            <div className="events-list">
              {upcomingEvents.length > 0 ? (
                upcomingEvents.map(event => {
                  const evtDate = new Date(event.date);
                  return (
                    <div key={event._id || event.id} className={`event-item ${event.type}`}>
                      <div className="event-date">
                        <span className="event-day">{evtDate.getDate()}</span>
                        <span className="event-month">{evtDate.toLocaleDateString('en', { month: 'short' })}</span>
                      </div>
                      <div className="event-details">
                        <h4>{event.title}</h4>
                        <span className="event-time">
                          {evtDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                          {event.isVirtual ? ' • Virtual' : (event.location ? ` • ${event.location}` : '')}
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="no-events">
                  <i className="fas fa-calendar-times"></i>
                  <p>No upcoming events scheduled.</p>
                </div>
              )}
            </div>
          </section>

          {/* Motivational Section */}
          <section className="section-box motivation-box">
            <div className="box-header">
              <h3><i className="fas fa-lightbulb"></i> {timeGreeting}!</h3>
            </div>
            <div className="motivation-content">
              <div className="quote-section">
                <i className="fas fa-quote-left quote-icon"></i>
                <p className="motivational-quote">"{motivationalQuote}"</p>
                <i className="fas fa-quote-right quote-icon"></i>
              </div>
              <div className="daily-tip">
                <h4><i className="fas fa-lightbulb"></i> Daily Tip</h4>
                <p>Consistency is key to success. Even 15 minutes of learning daily can make a huge difference!</p>
              </div>
            </div>
          </section>
        </div>

      </div>

    </main>
  );
}
