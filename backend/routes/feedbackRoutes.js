const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Feedback = require('../models/Feedback');

// POST /api/feedback: Create new feedback
router.post('/', async (req, res) => {
  try {
    const {
      userId,
      userName,
      userEmail,
      rating,
      message,
      category,
      priority,
      anonymous,
      bugDetails
    } = req.body;

    const newFeedback = new Feedback({
      user: userId,
      userName: anonymous ? 'Anonymous User' : userName,
      userEmail: anonymous ? '' : userEmail,
      rating,
      message,
      category,
      priority,
      anonymous,
      bugDetails
    });

    const savedFeedback = await newFeedback.save();

    res.status(201).json({
      success: true,
      message: 'Feedback submitted successfully.',
      data: savedFeedback
    });
  } catch (error) {
    console.error('Error submitting feedback:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit feedback',
      error: error.message
    });
  }
});

// GET /api/feedback/admin: Get all feedbacks for admin panel
router.get('/admin', async (req, res) => {
  try {
    const feedbacks = await Feedback.find().sort({ createdAt: -1 });
    
    // Map data for admin dashboard structure
    const mappedFeedbacks = feedbacks.map(fb => ({
      id: fb._id,
      userName: fb.userName || 'Anonymous',
      userEmail: fb.userEmail || 'N/A',
      rating: fb.rating,
      subject: fb.category === 'bug' ? 'Bug Report' : 'General Feedback',
      message: fb.message,
      status: fb.status,
      category: fb.category,
      createdAt: fb.createdAt,
      reviewedAt: fb.reviewedAt,
      priority: fb.priority,
      bugDetails: fb.bugDetails
    }));

    res.status(200).json({
      success: true,
      data: mappedFeedbacks
    });
  } catch (error) {
    console.error('Error fetching admin feedbacks:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch feedbacks',
      error: error.message
    });
  }
});

// PUT /api/feedback/admin/:id: Update feedback status
router.put('/admin/:id', async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid feedback ID' });
    }

    const updatedFeedback = await Feedback.findByIdAndUpdate(
      id,
      { 
        status,
        reviewedAt: status === 'reviewed' ? new Date() : undefined
      },
      { new: true }
    );

    if (!updatedFeedback) {
      return res.status(404).json({ success: false, message: 'Feedback not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Feedback status updated',
      data: updatedFeedback
    });
  } catch (error) {
    console.error('Error updating feedback status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update feedback status',
      error: error.message
    });
  }
});

// DELETE /api/feedback/admin/:id: Delete a feedback
router.delete('/admin/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid feedback ID' });
    }

    const deletedFeedback = await Feedback.findByIdAndDelete(id);

    if (!deletedFeedback) {
      return res.status(404).json({ success: false, message: 'Feedback not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Feedback deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting feedback:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete feedback',
      error: error.message
    });
  }
});

// GET /api/feedback/positive: Fetch positive feedback for Home page testimonials
router.get('/positive', async (req, res) => {
  try {
    const positiveFeedbacks = await Feedback.find({
      rating: 5,
      status: 'reviewed', // Ensure they are reviewed
      anonymous: false // Prefer non-anonymous for testimonials
    })
    .sort({ createdAt: -1 })
    .limit(5); 

    res.status(200).json({
        success: true,
        data: positiveFeedbacks
    });
  } catch (error) {
     console.error('Error fetching positive testimonials:', error);
     res.status(500).json({
       success: false,
       message: 'Failed to fetch positive feedback'
     });
  }
});

module.exports = router;
