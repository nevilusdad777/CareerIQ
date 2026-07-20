const express = require("express");
const User = require("../models/User");
const UserAnalytics = require("../models/UserAnalytics");
const RoadmapProgress = require("../models/RoadmapProgress");
const Feedback = require("../models/Feedback");
const SkillAttempt = require("../models/SkillAttempt");

const router = express.Router();

// In-memory storage for activities (in production, use MongoDB)
let activities = [];

// Get all users for admin dashboard
router.get("/users", async (req, res) => {
  try {
    // Fetch all users from MongoDB, exclude password field
    const users = await User.find({})
      .select("-password") // Exclude password field
      .sort({ createdAt: -1 }); // Sort by newest first

    // Fetch analytics and roadmap progress for each user
    const usersWithAnalytics = await Promise.all(
      users.map(async (user) => {
        const analytics = await UserAnalytics.findOne({ userId: user._id });
        const roadmap = await RoadmapProgress.findOne({ userId: user._id });
        
        // Provide defaults if analytics missing
        const defaultAnalytics = {
          placementProbability: 0,
          bestRoleMatch: "",
          totalSkills: 0,
          profileStrengthLabel: "Very Bad"
        };
        
        // Calculate total roadmap progress if available
        let roadmapStats = {
          streak: 0,
          watchTimeHours: 0,
          completedVideosCount: 0
        };
        
        if (roadmap && roadmap.roleProgress) {
          let totalStreak = 0;
          let totalWatchTimeMinutes = 0;
          let totalCompleted = 0;
          
          roadmap.roleProgress.forEach((progress) => {
            if (progress.learningStreak > totalStreak) totalStreak = progress.learningStreak; // Use max streak across roles
            totalWatchTimeMinutes += (progress.totalWatchTime || 0);
            totalCompleted += (progress.completedVideos ? progress.completedVideos.length : 0);
          });
          
          let hours = Math.floor(totalWatchTimeMinutes / 60);
          roadmapStats = {
            streak: totalStreak,
            watchTimeHours: hours,
            completedVideosCount: totalCompleted
          };
        }

        return {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          department: user.department,
          createdAt: user.createdAt,
          completedRoadmaps: user.completedRoadmaps || [],
          analytics: analytics || defaultAnalytics,
          roadmapStats: roadmapStats
        };
      })
    );

    const totalUsers = usersWithAnalytics.length;

    res.json({
      success: true,
      totalUsers: totalUsers,
      users: usersWithAnalytics
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch users"
    });
  }
});

// Log a new activity
router.post("/activities", (req, res) => {
  try {
    const { type, text, timestamp, icon, metadata } = req.body;
    
    const activity = {
      id: Date.now() + Math.random(),
      type: type || 'info',
      text,
      timestamp: timestamp || new Date().toISOString(),
      time: getRelativeTime(new Date(timestamp || new Date())),
      icon: icon || 'fa-info-circle',
      metadata: metadata || {}
    };

    // Add to beginning of array
    activities.unshift(activity);
    
    // Keep only last 100 activities
    if (activities.length > 100) {
      activities = activities.slice(0, 100);
    }

    res.json({
      success: true,
      activity,
      message: "Activity logged successfully"
    });
  } catch (error) {
    console.error("Error logging activity:", error);
    res.status(500).json({
      success: false,
      message: "Failed to log activity"
    });
  }
});

// Get recent activities
router.get("/activities", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const type = req.query.type;
    
    let filteredActivities = activities;
    
    // Filter by type if specified
    if (type) {
      filteredActivities = activities.filter(activity => activity.type === type);
    }
    
    // Return limited number of activities
    const limitedActivities = filteredActivities.slice(0, limit);
    
    // Calculate stats from DB 
    const feedbackCount = await Feedback.countDocuments({});
    const skillTestCount = await SkillAttempt.countDocuments({ status: 'completed' });
    const courseCount = await RoadmapProgress.countDocuments({});

    res.json({
      success: true,
      activities: limitedActivities,
      totalCount: activities.length,
      feedbackCount,
      skillTestCount,
      courseCount
    });
  } catch (error) {
    console.error("Error fetching activities:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch activities"
    });
  }
});

// Delete activities (for cleanup)
router.delete("/activities", (req, res) => {
  try {
    const { olderThan } = req.body; // in hours
    
    if (olderThan) {
      const cutoffTime = new Date(Date.now() - (olderThan * 60 * 60 * 1000));
      activities = activities.filter(activity => 
        new Date(activity.timestamp) > cutoffTime
      );
    } else {
      // Clear all activities
      activities = [];
    }
    
    res.json({
      success: true,
      message: "Activities cleaned up successfully",
      remainingCount: activities.length
    });
  } catch (error) {
    console.error("Error cleaning up activities:", error);
    res.status(500).json({
      success: false,
      message: "Failed to clean up activities"
    });
  }
});

// Helper function to get relative time
function getRelativeTime(date) {
  const now = new Date();
  const diff = now - date;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `${days} day${days > 1 ? 's' : ''} ago`;
  } else if (hours > 0) {
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else if (minutes > 0) {
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  } else {
    return 'Just now';
  }
}

// Bulk delete users
router.delete("/users/bulk-delete", async (req, res) => {
  try {
    const { userIds } = req.body;

    if (!userIds || !Array.isArray(userIds)) {
      return res.status(400).json({
        success: false,
        message: "User IDs array is required"
      });
    }

    // Delete users from User collection
    const deleteResult = await User.deleteMany({ _id: { $in: userIds } });

    // Also delete their analytics data
    await UserAnalytics.deleteMany({ userId: { $in: userIds } });

    res.json({
      success: true,
      message: `Successfully deleted ${deleteResult.deletedCount} users and their analytics`,
      deletedCount: deleteResult.deletedCount
    });

  } catch (error) {
    console.error("Error bulk deleting users:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete users"
    });
  }
});

// Get predictor analytics statistics
router.get("/predictor-stats", async (req, res) => {
  try {
    // Fetch all user analytics data
    const allAnalytics = await UserAnalytics.find({});

    if (allAnalytics.length === 0) {
      return res.json({
        success: true,
        data: {
          totalUsers: 0,
          averagePlacementProbability: 0,
          roleDistribution: {},
          skillStats: {
            totalSkills: 0,
            averageSkillsPerUser: 0,
            strengths: [],
            weaknesses: []
          },
          confidenceStats: {
            averageConfidence: 0,
            highConfidenceUsers: 0,
            mediumConfidenceUsers: 0,
            lowConfidenceUsers: 0
          },
          achievementsStats: {
            totalAchievements: 0,
            averageAchievementsPerUser: 0,
            unlockedAchievements: 0
          }
        }
      });
    }

    // Calculate average placement probability
    const validProbabilities = allAnalytics
      .map(ua => ua.placementProbability)
      .filter(prob => prob > 0);
    
    const averagePlacementProbability = validProbabilities.length > 0 
      ? (validProbabilities.reduce((sum, prob) => sum + prob, 0) / validProbabilities.length).toFixed(2)
      : 0;

    // Calculate role distribution
    const roleDistribution = {};
    allAnalytics.forEach(ua => {
      const role = ua.bestRoleMatch || "Not Available";
      roleDistribution[role] = (roleDistribution[role] || 0) + 1;
    });

    // Calculate skill statistics
    const totalSkills = allAnalytics.reduce((sum, ua) => sum + (ua.totalSkills || 0), 0);
    const averageSkillsPerUser = allAnalytics.length > 0 
      ? (totalSkills / allAnalytics.length).toFixed(2)
      : 0;

    // Analyze skill gaps (strengths and weaknesses)
    const skillGapAnalysis = {
      strengths: [],
      weaknesses: []
    };

    allAnalytics.forEach(ua => {
      if (ua.skillGapAnswers && Array.isArray(ua.skillGapAnswers)) {
        ua.skillGapAnswers.forEach((answer, index) => {
          if (answer === true) {
            skillGapAnalysis.strengths.push(index);
          } else if (answer === false) {
            skillGapAnalysis.weaknesses.push(index);
          }
        });
      }
    });

    // Count frequency of strengths and weaknesses
    const countOccurrences = (arr) => {
      const counts = {};
      arr.forEach(item => {
        counts[item] = (counts[item] || 0) + 1;
      });
      return counts;
    };

    const strengthsCounts = countOccurrences(skillGapAnalysis.strengths);
    const weaknessesCounts = countOccurrences(skillGapAnalysis.weaknesses);

    // Get top strengths and weaknesses
    const getTopItems = (counts, limit = 10) => {
      return Object.entries(counts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, limit)
        .map(([skill, count]) => ({ skill, count }));
    };

    // Calculate confidence statistics
    const validConfidences = allAnalytics
      .map(ua => ua.confidenceLevel)
      .filter(conf => conf > 0);
    
    const averageConfidence = validConfidences.length > 0
      ? (validConfidences.reduce((sum, conf) => sum + conf, 0) / validConfidences.length).toFixed(2)
      : 0;

    const confidenceStats = {
      averageConfidence: parseFloat(averageConfidence),
      highConfidenceUsers: allAnalytics.filter(ua => ua.confidenceLevel >= 70).length,
      mediumConfidenceUsers: allAnalytics.filter(ua => ua.confidenceLevel >= 40 && ua.confidenceLevel < 70).length,
      lowConfidenceUsers: allAnalytics.filter(ua => ua.confidenceLevel < 40).length
    };

    // Calculate achievements statistics
    const totalAchievements = allAnalytics.reduce((sum, ua) => {
      return sum + (ua.achievements ? ua.achievements.length : 0);
    }, 0);

    const unlockedAchievements = allAnalytics.reduce((sum, ua) => {
      if (ua.achievements) {
        return sum + ua.achievements.filter(ach => ach.unlocked).length;
      }
      return sum;
    }, 0);

    const achievementsStats = {
      totalAchievements,
      averageAchievementsPerUser: allAnalytics.length > 0 
        ? (totalAchievements / allAnalytics.length).toFixed(2)
        : 0,
      unlockedAchievements
    };

    res.json({
      success: true,
      data: {
        totalUsers: allAnalytics.length,
        averagePlacementProbability: parseFloat(averagePlacementProbability),
        roleDistribution,
        skillStats: {
          totalSkills,
          averageSkillsPerUser: parseFloat(averageSkillsPerUser),
          strengths: getTopItems(strengthsCounts),
          weaknesses: getTopItems(weaknessesCounts)
        },
        confidenceStats,
        achievementsStats,
        lastUpdated: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error("Error fetching predictor stats:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch predictor statistics"
    });
  }
});

module.exports = router;
