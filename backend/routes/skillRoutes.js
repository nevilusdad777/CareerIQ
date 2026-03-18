const express = require('express');
const router = express.Router();
const Skill = require('../models/Skill');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Admin middleware
const requireAdmin = async (req, res, next) => {
  if (req.user.role === 'admin') return next();

  // Fallback: Check DB if role is missing in token
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    const user = await User.findById(userId);

    if (user && user.role === 'admin') {
      req.user.role = 'admin';
      return next();
    }
    return res.status(403).json({ error: 'Admin access required' });
  } catch (error) {
    return res.status(500).json({ error: 'Authorization check failed' });
  }
};

// GET all skills
router.get('/', async (req, res) => {
  try {
    const skills = await Skill.find().sort({ name: 1 });
    res.json({ success: true, data: skills });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET single skill
router.get('/:id', async (req, res) => {
  try {
    const skill = await Skill.findById(req.params.id);
    if (!skill) return res.status(404).json({ success: false, message: 'Skill not found' });
    res.json({ success: true, data: skill });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// CREATE skill
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const skill = new Skill(req.body);
    await skill.save();
    res.status(201).json({ success: true, data: skill });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, error: "A skill with this name already exists. Please use a unique name or edit the existing skill." });
    }
    res.status(400).json({ success: false, error: error.message });
  }
});

// UPDATE skill
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const skill = await Skill.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!skill) return res.status(404).json({ success: false, message: 'Skill not found' });
    res.json({ success: true, data: skill });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// DELETE skill
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const skill = await Skill.findByIdAndDelete(req.params.id);
    if (!skill) return res.status(404).json({ success: false, message: 'Skill not found' });
    res.json({ success: true, message: 'Skill deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
