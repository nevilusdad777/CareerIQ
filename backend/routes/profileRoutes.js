const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Profile = require('../models/Profile');

// Save or Update Profile
router.post('/save', async (req, res) => {
  try {
    const profileData = req.body;
    
    // Check if profile exists
    const existingProfile = await Profile.findOne({ userId: profileData.userId });
    
    if (existingProfile) {
      // Update existing profile
      const updatedProfile = await Profile.findOneAndUpdate(
        { userId: profileData.userId },
        profileData,
        { new: true, upsert: true }
      );
      
      res.json({ 
        success: true, 
        message: 'Profile updated successfully',
        profile: updatedProfile 
      });
    } else {
      // Create new profile
      const newProfile = new Profile(profileData);
      await newProfile.save();
      
      res.json({ 
        success: true, 
        message: 'Profile created successfully',
        profile: newProfile 
      });
    }
  } catch (error) {
    console.error('Error saving profile:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error saving profile',
      error: error.message 
    });
  }
});

// Get Profile by User ID
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const profile = await Profile.findOne({ userId });
    
    if (!profile) {
      return res.json({ 
        success: false, 
        message: 'Profile not found',
        profile: null 
      });
    }
    
    res.json({ 
      success: true, 
      message: 'Profile found',
      profile 
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching profile',
      error: error.message 
    });
  }
});

// Get All Profiles (for Admin Panel)
router.get('/admin/all', async (req, res) => {
  try {
    const profiles = await Profile.find().sort({ updatedAt: -1 });
    
    res.json({ 
      success: true, 
      message: 'Profiles retrieved successfully',
      profiles 
    });
  } catch (error) {
    console.error('Error fetching all profiles:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching profiles',
      error: error.message 
    });
  }
});

// Delete Profile (Admin only)
router.delete('/admin/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const deletedProfile = await Profile.findOneAndDelete({ userId });
    
    if (!deletedProfile) {
      return res.json({ 
        success: false, 
        message: 'Profile not found' 
      });
    }
    
    res.json({ 
      success: true, 
      message: 'Profile deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting profile:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error deleting profile',
      error: error.message 
    });
  }
});

module.exports = router;
