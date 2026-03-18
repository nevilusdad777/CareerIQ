const express = require('express');
const router = express.Router();
const RoadmapProgress = require('../models/RoadmapProgress');
const Roadmap = require('../models/Roadmap');
const mongoose = require('mongoose');

// ==========================================
// DYNAMIC MASTERY PATHS (NEW SYSTEM)
// ==========================================

// 1. Create Roadmap
router.post('/create', async (req, res) => {
  try {
    const { userId, competencyName, overview, modules } = req.body;
    
    if (!userId || !competencyName) {
      return res.status(400).json({ success: false, message: "Missing required fields: userId or competencyName" });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, message: "Invalid User ID format" });
    }

    const newRoadmap = new Roadmap({
      userId,
      competencyName,
      overview,
      modules: modules.map(m => ({
        title: m.title,
        link: m.url || m.link, // Handle both Frontend/Backend naming
        type: m.type,
        completed: false
      }))
    });

    await newRoadmap.save();
    res.status(201).json({ success: true, roadmapId: newRoadmap._id, data: newRoadmap });
  } catch (error) {
    console.error("Error creating roadmap:", error);
    res.status(500).json({ success: false, message: "Server error creating roadmap" });
  }
});

// 2. Get Single Roadmap
router.get('/detail/:id', async (req, res) => {
  try {
    const roadmap = await Roadmap.findById(req.params.id);
    if (!roadmap) {
      return res.status(404).json({ success: false, message: "Roadmap not found" });
    }
    res.json({ success: true, data: roadmap });
  } catch (error) {
    console.error("Error fetching roadmap:", error);
    res.status(500).json({ success: false, message: "Server error fetching roadmap" });
  }
});

// 3. Get All User Roadmaps
router.get('/my-paths/:userId', async (req, res) => {
  try {
    const roadmaps = await Roadmap.find({ userId: req.params.userId }).sort({ createdAt: -1 });
    res.json({ success: true, data: roadmaps });
  } catch (error) {
    console.error("Error fetching user roadmaps:", error);
    res.status(500).json({ success: false, message: "Server error fetching roadmaps" });
  }
});

// 4. Update Progress / Toggle Module
router.put('/:id/toggle-module', async (req, res) => {
  try {
    const { moduleId, completed } = req.body;
    const roadmap = await Roadmap.findById(req.params.id);
    
    if (!roadmap) {
      return res.status(404).json({ success: false, message: "Roadmap not found" });
    }

    const module = roadmap.modules.id(moduleId);
    if (module) {
      module.completed = completed;
      await roadmap.save(); // Pre-save middleware handles progress % calculation
    }

    res.json({ success: true, data: roadmap });
  } catch (error) {
    console.error("Error updating roadmap progress:", error);
    res.status(500).json({ success: false, message: "Server error updating progress" });
  }
});

// ==========================================
// LEGACY PROGRESS TRACKING (STATIC ROLES)
// ==========================================

// Get Roadmap Progress by User ID
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    let progress = await RoadmapProgress.findOne({ userId });
    
    // If no progress exists, return empty state instead of 404
    if (!progress) {
      return res.json({ 
        success: true, 
        message: 'No progress found, starting fresh',
        progress: { roleProgress: {} }
      });
    }

    res.json({
      success: true,
      data: progress
    });
  } catch (error) {
    console.error('Error fetching roadmap progress:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error fetching progress',
      error: error.message
    });
  }
});

// Save or Update Roadmap Progress
router.post('/save', async (req, res) => {
  try {
    const { userId, roleId, completedVideos, learningStreak, totalWatchTime } = req.body;

    if (!userId || !roleId) {
      return res.status(400).json({ success: false, message: 'Missing userId or roleId' });
    }

    // Find the user's overall progress document
    let roadmapProgress = await RoadmapProgress.findOne({ userId });

    if (!roadmapProgress) {
      // Create new document if it doesn't exist
      roadmapProgress = new RoadmapProgress({
        userId,
        roleProgress: {
          [roleId]: {
            completedVideos: completedVideos || [],
            learningStreak: learningStreak || 0,
            totalWatchTime: totalWatchTime || 0,
            lastActive: new Date()
          }
        }
      });
    } else {
      // Initialize role map if undefined
      if (!roadmapProgress.roleProgress) {
        roadmapProgress.roleProgress = new Map();
      }

      // Update the specific role's progress
      roadmapProgress.roleProgress.set(roleId, {
        completedVideos: completedVideos || [],
        learningStreak: learningStreak !== undefined ? learningStreak : (roadmapProgress.roleProgress.get(roleId)?.learningStreak || 0),
        totalWatchTime: totalWatchTime !== undefined ? totalWatchTime : (roadmapProgress.roleProgress.get(roleId)?.totalWatchTime || 0),
        lastActive: new Date()
      });
    }

    await roadmapProgress.save();

    res.json({
      success: true,
      message: 'Progress saved successfully',
      data: roadmapProgress
    });
  } catch (error) {
    console.error('Error saving roadmap progress:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error saving progress',
      error: error.message
    });
  }
});

module.exports = router;
