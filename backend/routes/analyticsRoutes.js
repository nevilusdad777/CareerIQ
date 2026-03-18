const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const UserAnalytics = require('../models/UserAnalytics');
const Profile = require('../models/Profile');
const SkillAttempt = require('../models/SkillAttempt');
const Roadmap = require('../models/Roadmap');
const { calculatePlacementProbability, calculateBestRole, calculateProfileStrength } = require('../utils/analyticsLogic');

// Test database connection
router.get('/test-db', async (req, res) => {
  try {
    console.log("Testing database connection...");
    
    // Test basic MongoDB connection
    const state = mongoose.connection.readyState;
    const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
    console.log("MongoDB connection state:", states[state]);
    
    if (state !== 1) {
      return res.status(500).json({
        success: false,
        message: "Database not connected",
        state: states[state]
      });
    }
    
    // Test UserAnalytics model
    const count = await UserAnalytics.countDocuments();
    console.log("UserAnalytics collection count:", count);
    
    res.json({
      success: true,
      message: "Database connection working",
      connectionState: states[state],
      analyticsCount: count
    });
    
  } catch (error) {
    console.error("Database test error:", error);
    res.status(500).json({
      success: false,
      message: "Database test failed",
      error: error.message
    });
  }
});

// GET /api/analytics/dashboard-stats/:userId - Real-time consolidated dashboard stats
router.get('/dashboard-stats/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    console.log("🚀 Senior Debug: Fetching dashboard stats for user:", userId);

    // 1. Fetch Latest Assessment Result
    const latestAttempt = await SkillAttempt.findOne({ userId, status: 'completed' }).sort({ createdAt: -1 });
    
    // 2. Fetch User Analytics (for XP, streaks, etc.)
    const analytics = await UserAnalytics.findOne({ userId });
    
    // 3. Fetch Profile (for profile strength)
    const profile = await Profile.findOne({ userId });

    // Dynamic metrics calculation
    const probability = latestAttempt ? Math.min(Math.round(latestAttempt.overallScore * 0.98), 100) : 0;
    const role = latestAttempt ? latestAttempt.predictedRole : "Not Available";
    
    let skillsAnalyzed = 0;
    if (latestAttempt && latestAttempt.categoryScores) {
      if (latestAttempt.categoryScores instanceof Map) {
        skillsAnalyzed = latestAttempt.categoryScores.size;
      } else {
        skillsAnalyzed = Object.keys(latestAttempt.categoryScores).length;
      }
    }

    const responseData = {
      probability: probability,
      role: role,
      skillsAnalyzed: skillsAnalyzed,
      profileStrength: calculateProfileStrength(profile),
      totalXP: analytics?.totalXP || 100,
      currentStreak: analytics?.currentStreak || 1,
      lastActive: analytics?.lastActive || new Date().toISOString()
    };

    res.json({ 
      success: true, 
      data: responseData
    });
  } catch (error) {
    console.error("❌ CRITICAL: Dashboard API error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to fetch dashboard stats",
      error: error.message 
    });
  }
});

// GET /api/analytics/learning-progress - Fetch user's roadmap progress
router.get('/learning-progress', async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({ success: false, message: "User ID is required" });
    }

    console.log(`📊 Fetching learning progress for user: ${userId}`);

    let roadmaps = await Roadmap.find({ userId }).sort({ createdAt: -1 }).limit(4);
    
    let progressData = [];

    if (roadmaps.length > 0) {
      // Transform roadmaps into the format expected by the frontend
      progressData = roadmaps.map(r => ({
        name: r.competencyName,
        progress: r.progress || 0,
        status: r.progress >= 90 ? "Mastered" : r.progress >= 50 ? "Intermediate" : "Beginner"
      }));
    } else {
      // Fallback: Use skills from profile if no roadmaps exist
      const profile = await Profile.findOne({ userId });
      if (profile && profile.skills && profile.skills.length > 0) {
        progressData = profile.skills.slice(0, 4).map(skill => ({
          name: skill.name,
          progress: skill.level || 0,
          status: skill.level >= 80 ? "Proficient" : skill.level >= 50 ? "Learning" : "Newbie"
        }));
      }
    }

    res.json({
      success: true,
      data: progressData
    });
  } catch (error) {
    console.error("❌ Error fetching learning progress:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to fetch learning progress",
      error: error.message 
    });
  }
});

// POST /api/analytics/create-sample - Create sample analytics data for testing
router.post('/create-sample', async (req, res) => {
  try {
    const { userId } = req.body;
    
    // Validate userId
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId is required"
      });
    }

    console.log("Creating sample analytics for userId:", userId);

    // Check if sample data already exists
    try {
      const existingAnalytics = await UserAnalytics.findOne({ userId });
      if (existingAnalytics && existingAnalytics.placementProbability > 0) {
        return res.status(409).json({
          success: false,
          message: "Sample analytics data already exists for this user"
        });
      }
    } catch (findError) {
      console.error("Error checking existing analytics:", findError);
      return res.status(500).json({
        success: false,
        message: "Database error while checking existing data"
      });
    }

    // Create sample analytics data with minimal fields to avoid errors
    const sampleAnalytics = new UserAnalytics({
      userId: userId,
      placementProbability: 75,
      bestRoleMatch: "Full Stack Developer",
      totalSkills: 8,
      profileStrengthLabel: "Good",
      confidenceLevel: 85,
      totalXP: 1250,
      currentStreak: 5,
      lastActive: new Date(),
      updatedAt: new Date(), // Manually set updatedAt
      recentActivity: [
        {
          action: "profile_updated",
          points: 10,
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000)
        },
        {
          action: "skill_assessment", 
          points: 25,
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000)
        },
        {
          action: "project_added",
          points: 15,
          timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
        }
      ],
      achievements: [
        { 
          title: "First Project", 
          icon: "fa-rocket", 
          unlocked: true, 
          description: "Add your first project to profile", 
          progress: 100 
        },
        { 
          title: "7 Day Streak", 
          icon: "fa-fire", 
          unlocked: false, 
          description: "Maintain a 7-day learning streak", 
          progress: 71 
        }
      ]
    });

    // Save to database with error handling
    try {
      await sampleAnalytics.save();
      console.log("Sample analytics created successfully:", sampleAnalytics._id);
    } catch (saveError) {
      console.error("Error saving sample analytics:", saveError);
      
      // Handle specific MongoDB errors
      if (saveError.name === 'ValidationError') {
        return res.status(400).json({
          success: false,
          message: "Validation error while creating sample data",
          error: saveError.message
        });
      } else if (saveError.code === 11000) {
        return res.status(409).json({
          success: false,
          message: "Sample analytics data already exists for this user"
        });
      } else {
        return res.status(500).json({
          success: false,
          message: "Database error while saving sample analytics"
        });
      }
    }

    res.status(201).json({
      success: true,
      message: "Sample analytics data created successfully",
      data: {
        userId: sampleAnalytics.userId,
        placementProbability: sampleAnalytics.placementProbability,
        bestRoleMatch: sampleAnalytics.bestRoleMatch,
        totalSkills: sampleAnalytics.totalSkills,
        confidenceLevel: sampleAnalytics.confidenceLevel
      }
    });

  } catch (error) {
    console.error("Unexpected error creating sample analytics:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create sample analytics",
      error: process.env.NODE_ENV === 'development' ? error.message : "Internal server error"
    });
  }
});

// POST /api/analytics/skill-gap - Save 12-question answers
router.post('/skill-gap', async (req, res) => {
  try {
    console.log("Skill gap request body:", req.body);
    
    const { userId, answers } = req.body;
    
    // Validation
    if (!userId) {
      console.log("ERROR: Missing userId");
      return res.status(400).json({
        success: false,
        message: "Valid userId string is required"
      });
    }
    
    // Validate answers
    if (!answers || !Array.isArray(answers)) {
      console.log("ERROR: Invalid answers:", answers);
      return res.status(400).json({
        success: false,
        message: "Answers array is required"
      });
    }
    
    if (answers.length !== 12) {
      console.log("ERROR: Expected 12 answers, got:", answers.length);
      return res.status(400).json({
        success: false,
        message: "Exactly 12 answers are required"
      });
    }
    
    console.log("✅ Validation passed - proceeding with analytics save");
    
    // Calculate analytics data
    const totalSkills = answers.filter(answer => answer === true).length;
    const confidenceLevel = Math.round((totalSkills / answers.length) * 100);
    const bestRoleMatch = calculateBestRole(totalSkills);
    
    console.log("Calculated analytics:", {
      totalSkills,
      confidenceLevel,
      bestRoleMatch,
      answers: answers.map((answer, index) => `Q${index + 1}: ${answer ? 'Correct' : 'Incorrect'}`)
    });
    
    // Database operation with comprehensive error handling
    let analytics;
    try {
      analytics = await UserAnalytics.findOneAndUpdate(
        { userId },
        { 
          $set: {
            skillGapScore: totalSkills,
            confidenceLevel,
            totalSkills,
            bestRoleMatch
          }
        },
        {
          new: true,
          upsert: true,
          runValidators: true,
          setDefaultsOnInsert: true
        }
      );
      
      console.log("✅ Analytics saved successfully:", analytics);
      
    } catch (error) {
      console.error("❌ DATABASE ERROR:", error.message);
      console.error("Full error stack:", error.stack);
      
      // Handle different types of errors appropriately
      if (error.name === 'ValidationError') {
        return res.status(400).json({
          success: false,
          message: `Validation error: ${error.message}`
        });
      } else if (error.name === 'MongoError' || error.name === 'MongoServerError') {
        return res.status(500).json({
          success: false,
          message: "Database error while saving skill gap analytics",
          error: process.env.NODE_ENV === 'production' ? "Internal server error" : error.message
        });
      } else {
        return res.status(500).json({
          success: false,
          message: "Unexpected server error"
        });
      }
    }
    
    console.log("=== SKILL GAP API CALL END ===");
    
    res.json({
      success: true,
      message: "Skill gap analytics saved successfully",
      data: {
        totalSkills,
        confidenceLevel,
        skillGapAnswers: answers.map((answer, index) => `Q${index + 1}: ${answer ? 'Correct' : 'Incorrect'}`)
      }
    });
    
  } catch (error) {
    console.error("❌ CRITICAL ERROR IN SKILL GAP:", error.message);
    console.error("Full error stack:", error.stack);
    return res.status(500).json({
      success: false,
      message: "Critical error in skill gap processing",
      error: process.env.NODE_ENV === 'production' ? "Internal server error" : error.message
    });
  }
});

// POST /api/analytics/predictor - Save predictor results
router.post('/predictor', async (req, res) => {
  try {
    console.log("=== PREDICTOR API CALL START ===");
    console.log("Request body:", req.body);
    console.log("Request headers:", req.headers);
    
    // Validate request body
    if (!req.body) {
      console.log("ERROR: Request body is missing");
      return res.status(400).json({
        success: false,
        message: "Request body is required"
      });
    }
    
    const { userId, predictorInputs } = req.body;
    
    // Validate userId
    if (!userId || typeof userId !== 'string') {
      console.log("ERROR: Invalid userId:", userId);
      return res.status(400).json({
        success: false,
        message: "Valid userId string is required"
      });
    }
    
    // Validate predictorInputs
    if (!predictorInputs || typeof predictorInputs !== 'object') {
      console.log("ERROR: Invalid predictorInputs:", predictorInputs);
      return res.status(400).json({
        success: false,
        message: "Valid predictorInputs object is required"
      });
    }
    
    console.log("✅ Validation passed - proceeding with predictor save");
    
    // Use the comprehensive calculations provided by the frontend if available
    const probability = predictorInputs.placementProbability !== undefined 
      ? predictorInputs.placementProbability 
      : calculatePlacementProbability(predictorInputs);
      
    const bestRoleMatch = predictorInputs.targetRole || 
      (predictorInputs.roleMatches && predictorInputs.roleMatches.length > 0 ? predictorInputs.roleMatches[0].name : null) || 
      calculateBestRole(Object.keys(predictorInputs.skills || {}).length);
    
    console.log("Saving placement probability:", probability, "Best role:", bestRoleMatch);
    
    // Database operation with comprehensive error handling
    let analytics;
    try {
      analytics = await UserAnalytics.findOneAndUpdate(
        { userId },
        { 
          $set: {
            placementProbability: probability,
            predictorInputs,
            bestRoleMatch,
            updatedAt: new Date()
          }
        },
        {
          new: true,
          upsert: true,
          runValidators: true,
          setDefaultsOnInsert: true
        }
      );
      
      console.log("✅ Analytics saved successfully:", analytics);
      
    } catch (error) {
      console.error("❌ DATABASE ERROR:", error.message);
      console.error("Full error stack:", error.stack);
      
      // Handle different types of errors appropriately
      if (error.name === 'ValidationError') {
        return res.status(400).json({
          success: false,
          message: `Validation error: ${error.message}`
        });
      } else if (error.name === 'MongoError' || error.name === 'MongoServerError') {
        return res.status(500).json({
          success: false,
          message: "Database error while saving predictor analytics",
          error: process.env.NODE_ENV === 'production' ? "Internal server error" : error.message
        });
      } else {
        return res.status(500).json({
          success: false,
          message: "Unexpected server error"
        });
      }
    }
    
    console.log("=== PREDICTOR API CALL END ===");
    
    res.json({
      success: true,
      message: "Predictor analytics saved successfully",
      data: {
        placementProbability: probability
      }
    });
    
  } catch (error) {
    console.error("❌ CRITICAL ERROR IN PREDICTOR:", error.message);
    console.error("Full error stack:", error.stack);
    return res.status(500).json({
      success: false,
      message: "Critical error in predictor processing",
      error: process.env.NODE_ENV === 'production' ? "Internal server error" : error.message
    });
  }
});

// POST /api/analytics/profile-strength - Save profile strength
router.post('/profile-strength', async (req, res) => {
  try {
    console.log("Incoming profile strength request:", req.body);

    const { userId, profileData } = req.body;

    // Validation
    if (!userId) {
      console.log("ERROR: Missing userId");
      return res.status(400).json({
        success: false,
        message: "userId is required"
      });
    }

    if (!profileData) {
      console.log("ERROR: Missing profileData");
      return res.status(400).json({
        success: false,
        message: "profileData is required"
      });
    }

    console.log("Validation passed, calculating profile strength...");

    // Calculate profile strength
    const label = calculateProfileStrength(profileData);
    console.log("Calculated profile strength:", label);

    // Use upsert for safe database operation
    const result = await UserAnalytics.findOneAndUpdate(
      { userId },
      { 
        $set: {
          profileStrengthLabel: label,
          updatedAt: new Date()
        }
      },
      { 
        new: true, 
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true
      }
    );

    console.log("Database operation result:", result);

    res.json({
      success: true,
      profileStrengthLabel: label
    });

  } catch (error) {
    console.error("PROFILE STRENGTH ERROR:", error);
    console.error("Full error stack:", error.stack);
    
    res.status(500).json({
      success: false,
      message: "Server error while saving profile strength"
    });
  }
});

// GET /api/analytics/my-dashboard - Get formatted dashboard data
router.get('/my-dashboard', async (req, res) => {
  try {
    console.log("Dashboard analytics request received");
    
    // Get userId from query params (for now, since no JWT middleware)
    const { userId } = req.query;
    
    if (!userId) {
      console.log("ERROR: Missing userId in dashboard request");
      return res.status(400).json({
        success: false,
        message: "userId is required"
      });
    }

    console.log("Looking for analytics with userId:", userId, "Type:", typeof userId);

    // Find analytics by userId
    const analytics = await UserAnalytics.findOne({ userId });
    
    console.log("Dashboard analytics found:", analytics);

    if (!analytics) {
      console.log("No analytics found for user, returning defaults");
      return res.json({
        success: true,
        data: {
          placementProbability: 0,
          bestRoleMatch: "Not Available",
          totalSkills: 0,
          profileStrength: "Very Bad",
          confidenceLevel: 0
        }
      });
    }

    // Return clean formatted response
    const responseData = {
      placementProbability: analytics.placementProbability || 0,
      bestRoleMatch: analytics.bestRoleMatch || "Not Available",
      totalSkills: analytics.totalSkills || 0,
      profileStrength: analytics.profileStrengthLabel || "Very Bad",
      confidenceLevel: analytics.confidenceLevel || 0,
      totalXP: analytics.totalXP || 100
    };

    console.log("Dashboard API response:", responseData);
    
    res.json({
      success: true,
      data: responseData
    });

  } catch (error) {
    console.error("Dashboard API error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching dashboard analytics"
    });
  }
});

// GET /api/analytics/user-stats - Get user stats for dashboard
router.get('/user-stats', async (req, res) => {
  try {
    console.log("User stats request received");
    console.log("Request query params:", req.query);
    
    // Get userId from query params
    const { userId } = req.query;
    
    if (!userId) {
      console.log("ERROR: Missing userId in user-stats request");
      return res.status(400).json({
        success: false,
        message: "userId is required"
      });
    }

    console.log("Looking for user stats with userId:", userId, "Type:", typeof userId);

    // Find analytics by userId
    let analytics;
    try {
      analytics = await UserAnalytics.findOne({ userId });
      console.log("Database query executed successfully");
    } catch (dbError) {
      console.error("Database error in user-stats:", dbError);
      return res.status(500).json({
        success: false,
        message: "Database error while fetching user stats",
        error: process.env.NODE_ENV === 'production' ? "Internal server error" : dbError.message
      });
    }
    
    console.log("User analytics found:", analytics);

    if (!analytics) {
      console.log("No analytics found for user, returning defaults");
      return res.json({
        success: true,
        data: {
          totalXP: 100,
          currentStreak: 1,
          lastActive: new Date().toISOString(),
          recentActivity: []
        }
      });
    }

    // Return user stats response
    const responseData = {
      totalXP: analytics.totalXP || 100,
      currentStreak: analytics.currentStreak || 1,
      lastActive: analytics.lastActive || new Date().toISOString(),
      recentActivity: analytics.recentActivity || []
    };

    console.log("User stats API response:", responseData);
    
    res.json({
      success: true,
      data: responseData
    });

  } catch (error) {
    console.error("User stats API error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching user stats"
    });
  }
});


// GET /api/analytics/learning-progress - Get user's learning progress
router.get('/learning-progress', async (req, res) => {
  try {
    console.log("Learning progress request received");
    const { userId } = req.query;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId is required"
      });
    }

    const profile = await Profile.findOne({ userId });
    
    if (!profile || !profile.skills || profile.skills.length === 0) {
      return res.json({
        success: true,
        data: []
      });
    }
    
    const progress = profile.skills.map(skill => ({
      name: skill.name,
      progress: skill.level || 0,
      target: 100,
      status: skill.level >= 70 ? "Mastered" : skill.level >= 50 ? "Intermediate" : "Beginner"
    }));
    
    res.json({
      success: true,
      data: progress.slice(0, 4)
    });

  } catch (error) {
    console.error("Learning progress API error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching learning progress"
    });
  }
});

// GET /api/analytics/learning-activity - Get user's weekly learning activity
router.get('/learning-activity', async (req, res) => {
  try {
    console.log("Learning activity request received");
    
    const { userId } = req.query;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId is required"
      });
    }

    console.log("Looking for learning activity with userId:", userId);

    // Find analytics by userId
    const analytics = await UserAnalytics.findOne({ userId });
    
    if (!analytics) {
      console.log("No analytics found for user, returning default learning activity");
      return res.json({
        success: true,
        data: {
          weeklyHours: [
            { day: "Mon", hours: 0 },
            { day: "Tue", hours: 0 },
            { day: "Wed", hours: 0 },
            { day: "Thu", hours: 0 },
            { day: "Fri", hours: 0 },
            { day: "Sat", hours: 0 },
            { day: "Sun", hours: 0 }
          ]
        }
      });
    }

    // Calculate weekly learning hours from recent activity
    const weeklyHours = [
      { day: "Mon", hours: 0 },
      { day: "Tue", hours: 0 },
      { day: "Wed", hours: 0 },
      { day: "Thu", hours: 0 },
      { day: "Fri", hours: 0 },
      { day: "Sat", hours: 0 },
      { day: "Sun", hours: 0 }
    ];

    // Get current week's activity
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay() + 1); // Start from Monday
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    // Process recent activity to calculate learning hours
    if (analytics.recentActivity && analytics.recentActivity.length > 0) {
      analytics.recentActivity.forEach(activity => {
        const activityDate = new Date(activity.timestamp || activity.time);
        
        // Check if activity is within current week
        if (activityDate >= startOfWeek && activityDate <= endOfWeek) {
          const dayIndex = activityDate.getDay();
          const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
          const dayName = dayNames[dayIndex];
          
          // Find corresponding day in weeklyHours
          const dayData = weeklyHours.find(d => d.day === dayName);
          if (dayData) {
            // Add hours based on activity type (simplified calculation)
            const hoursPerActivity = {
              'course_completed': 2,
              'skill_assessment': 1.5,
              'project_work': 3,
              'roadmap_viewed': 0.5,
              'profile_updated': 0.25,
              'market_trends_checked': 0.75
            };
            
            const activityType = activity.action?.toLowerCase() || 'general';
            let hoursToAdd = 0.5; // Default hours
            
            // Match activity type to hours
            for (const [key, value] of Object.entries(hoursPerActivity)) {
              if (activityType.includes(key)) {
                hoursToAdd = value;
                break;
              }
            }
            
            dayData.hours += hoursToAdd;
          }
        }
      });
    }

    // Add some sample data for demonstration if no real activity
    const hasRealData = weeklyHours.some(day => day.hours > 0);
    if (!hasRealData) {
      const currentDay = new Date().getDay();
      const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      
      // Generate sample data for days up to today
      for (let i = 1; i <= currentDay && i <= 5; i++) {
        weeklyHours[i].hours = Math.random() * 3 + 0.5; // 0.5 to 3.5 hours
      }
    }

    console.log("Learning activity response:", weeklyHours);
    
    res.json({
      success: true,
      data: {
        weeklyHours
      }
    });

  } catch (error) {
    console.error("Learning activity API error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching learning activity",
      error: process.env.NODE_ENV === 'production' ? "Internal server error" : error.message
    });
  }
});

// POST /api/analytics/track-activity - Track user activity in real-time
router.post('/track-activity', async (req, res) => {
  try {
    console.log("Track activity request received:", req.body);
    
    const { userId, activity, timestamp } = req.body;
    
    if (!userId || !activity) {
      return res.status(400).json({
        success: false,
        message: "userId and activity are required"
      });
    }

    // Find or create analytics record
    let analytics = await UserAnalytics.findOne({ userId });
    
    if (!analytics) {
      console.log("Creating new analytics record for user:", userId);
      // Create new analytics record if it doesn't exist
      analytics = new UserAnalytics({
        userId,
        recentActivity: [],
        totalXP: 100,
        currentStreak: 1,
        updatedAt: new Date()
      });
    }

    console.log("Found analytics record:", analytics);

    // Add new activity to recent activity
    const xpRewards = {
      'course_completed': 50,
      'skill_assessment': 25,
      'project_work': 30,
      'profile_updated': 10,
      'roadmap_viewed': 5,
      'market_trends_checked': 5,
      'predictor_viewed': 5,
      'placement_probability_checked': 5,
      'best_role_match_checked': 5,
      'skills_analyzed_checked': 5,
      'profile_strength_checked': 5,
      'skill_gap_viewed': 5,
      'learning_activity_refreshed': 2
    };

    let pointsAwarded = 0;
    const activityLower = activity.toLowerCase();
    for (const [key, reward] of Object.entries(xpRewards)) {
      if (activityLower.includes(key)) {
        pointsAwarded = reward;
        break;
      }
    }

    const newActivity = {
      action: activity,
      points: pointsAwarded,
      timestamp: new Date(timestamp || Date.now())
    };

    console.log("New activity to add:", newActivity);

    // Initialize recentActivity if it doesn't exist
    if (!analytics.recentActivity) {
      analytics.recentActivity = [];
    }

    // Add new activity to the beginning
    analytics.recentActivity.unshift(newActivity);

    // Keep only last 20 activities
    if (analytics.recentActivity.length > 20) {
      analytics.recentActivity = analytics.recentActivity.slice(0, 20);
    }

    // Update last active date
    analytics.lastActive = new Date().toISOString();

    // Award XP based on points awarded
    if (pointsAwarded > 0) {
      analytics.totalXP = (analytics.totalXP || 0) + pointsAwarded;
    }

    // Update timestamp manually
    analytics.updatedAt = new Date();

    console.log("About to save analytics...");
    console.log("Analytics to save:", JSON.stringify(analytics, null, 2));
    
    // Use findOneAndUpdate to avoid pre-save hook issues
    const updatedAnalytics = await UserAnalytics.findOneAndUpdate(
      { userId },
      {
        $set: {
          recentActivity: analytics.recentActivity,
          totalXP: analytics.totalXP,
          lastActive: analytics.lastActive,
          updatedAt: new Date()
        }
      },
      { 
        new: true, 
        upsert: true,
        runValidators: false 
      }
    );
    
    console.log("Analytics saved successfully!");
    console.log("Activity tracked successfully:", newActivity);
    
    res.json({
      success: true,
      message: "Activity tracked successfully",
      data: {
        activity: newActivity,
        totalXP: updatedAnalytics.totalXP,
        pointsAwarded
      }
    });

  } catch (error) {
    console.error("Track activity API error:", error);
    console.error("Full error stack:", error.stack);
    res.status(500).json({
      success: false,
      message: "Server error while tracking activity",
      error: process.env.NODE_ENV === 'production' ? "Internal server error" : error.message
    });
  }
});

// GET /api/analytics/achievements - Get user achievements
router.get('/achievements', async (req, res) => {
  try {
    console.log("Achievements request received");
    
    const { userId } = req.query;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId is required"
      });
    }

    console.log("Looking for achievements with userId:", userId);

    // Find analytics by userId
    const analytics = await UserAnalytics.findOne({ userId });
    
    if (!analytics) {
      console.log("No analytics found for user, returning default achievements");
      return res.json({
        success: true,
        data: {
          achievements: [
            { title: "First Project", icon: "fa-rocket", unlocked: false, description: "Complete your first project", progress: 0 },
            { title: "7 Day Streak", icon: "fa-fire", unlocked: false, description: "Maintain a 7-day learning streak", progress: 0 },
            { title: "Skill Master", icon: "fa-star", unlocked: false, description: "Master 5 or more skills", progress: 0 },
            { title: "100% Profile", icon: "fa-trophy", unlocked: false, description: "Complete 100% of your profile", progress: 0 }
          ]
        }
      });
    }

    // Return achievements (stored in a custom achievements field or calculate them)
    const achievements = analytics.achievements || [
      { title: "First Project", icon: "fa-rocket", unlocked: false, description: "Complete your first project", progress: 0 },
      { title: "7 Day Streak", icon: "fa-fire", unlocked: false, description: "Maintain a 7-day learning streak", progress: 0 },
      { title: "Skill Master", icon: "fa-star", unlocked: false, description: "Master 5 or more skills", progress: 0 },
      { title: "100% Profile", icon: "fa-trophy", unlocked: false, description: "Complete 100% of your profile", progress: 0 }
    ];

    console.log("Achievements response:", achievements);
    
    res.json({
      success: true,
      data: {
        achievements
      }
    });

  } catch (error) {
    console.error("Achievements API error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching achievements",
      error: process.env.NODE_ENV === 'production' ? "Internal server error" : error.message
    });
  }
});

// POST /api/analytics/save-achievements - Save user achievements
router.post('/save-achievements', async (req, res) => {
  try {
    console.log("Save achievements request received:", req.body);
    
    const { userId, achievements } = req.body;
    
    if (!userId || !achievements) {
      return res.status(400).json({
        success: false,
        message: "userId and achievements are required"
      });
    }

    // Find or create analytics record
    let analytics = await UserAnalytics.findOne({ userId });
    
    if (!analytics) {
      console.log("Creating new analytics record for achievements:", userId);
      analytics = new UserAnalytics({
        userId,
        recentActivity: [],
        totalXP: 100,
        currentStreak: 1
      });
    }

    // Save achievements
    analytics.achievements = achievements;
    analytics.updatedAt = new Date();

    await analytics.save();

    console.log("Achievements saved successfully for user:", userId);
    
    res.json({
      success: true,
      message: "Achievements saved successfully",
      data: {
        achievements: analytics.achievements
      }
    });

  } catch (error) {
    console.error("Save achievements API error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while saving achievements",
      error: process.env.NODE_ENV === 'production' ? "Internal server error" : error.message
    });
  }
});

// POST /api/analytics/award-xp - Award XP to user
router.post('/award-xp', async (req, res) => {
  try {
    console.log("Award XP request received:", req.body);
    
    const { userId, action, points, totalXP } = req.body;
    
    if (!userId || !action || !points || totalXP === undefined) {
      return res.status(400).json({
        success: false,
        message: "userId, action, points, and totalXP are required"
      });
    }

    // Calculate streak
    let newStreak = 1;
    const now = new Date();

    try {
      const analytics = await UserAnalytics.findOne({ userId });
      if (analytics && analytics.lastActive) {
        const lastActiveDate = new Date(analytics.lastActive);
        const today = new Date(now).setHours(0, 0, 0, 0);
        const lastDate = new Date(lastActiveDate).setHours(0, 0, 0, 0);
        const diffDays = Math.round((today - lastDate) / (1000 * 60 * 60 * 24));

        if (diffDays === 0) {
          newStreak = analytics.currentStreak || 1;
        } else if (diffDays === 1) {
          newStreak = (analytics.currentStreak || 0) + 1;
        } else {
          newStreak = 1;
        }
      }
    } catch (err) {
      console.error("Streak calculation error in award-xp:", err);
    }

    // Update user analytics with new XP and streak
    const result = await UserAnalytics.findOneAndUpdate(
      { userId },
      { 
        $set: {
          totalXP: totalXP,
          currentStreak: newStreak,
          lastActive: now.toISOString()
        },
        $push: {
          recentActivity: {
            action,
            points,
            timestamp: now.toISOString()
          }
        }
      },
      { 
        new: true, 
        upsert: true
      }
    );

    console.log("XP awarded successfully:", result);
    
    res.json({
      success: true,
      message: "XP awarded successfully",
      data: { totalXP }
    });

  } catch (error) {
    console.error("Award XP API error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while awarding XP"
    });
  }
});

// GET /api/analytics/:userId - Return full analytics object
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId is required"
      });
    }

    const analytics = await UserAnalytics.findOne({ userId });

    if (!analytics) {
      return res.json({
        success: true,
        data: {
          placementProbability: 0,
          bestRoleMatch: "",
          totalSkills: 0,
          profileStrengthLabel: "Very Bad"
        }
      });
    }

    res.json({
      success: true,
      data: analytics
    });

  } catch (error) {
    console.error("Error fetching analytics:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});

module.exports = router;
