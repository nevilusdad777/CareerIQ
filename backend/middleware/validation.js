// Request validation schemas
const Joi = require('joi');

// User registration validation
const registerSchema = Joi.object({
  name: Joi.string().min(2).max(50).required().messages({
    'string.empty': 'Name is required',
    'string.min': 'Name must be at least 2 characters',
    'string.max': 'Name cannot exceed 50 characters'
  }),
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email',
    'string.empty': 'Email is required'
  }),
  password: Joi.string().min(6).required().messages({
    'string.empty': 'Password is required',
    'string.min': 'Password must be at least 6 characters'
  })
});

// User login validation
const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email',
    'string.empty': 'Email is required'
  }),
  password: Joi.string().required().messages({
    'string.empty': 'Password is required'
  })
});

// MongoDB ObjectId validation
const objectIdSchema = Joi.string().hex().length(24).required().messages({
  'string.hex': 'Invalid ID format',
  'string.length': 'Invalid ID format',
  'string.empty': 'ID is required'
});

// Pagination validation
const paginationSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20)
});

// Event creation validation
const eventSchema = Joi.object({
  userId: objectIdSchema,
  title: Joi.string().min(3).max(100).required(),
  description: Joi.string().min(10).max(500).required(),
  date: Joi.date().iso().min('now').required(),
  type: Joi.string().valid('assessment', 'deadline', 'meeting', 'workshop', 'other').required(),
  location: Joi.string().max(200).allow(''),
  status: Joi.string().valid('upcoming', 'ongoing', 'completed', 'cancelled').default('upcoming')
});

// Analytics validation
const analyticsSchema = Joi.object({
  userId: objectIdSchema,
  placementProbability: Joi.number().min(0).max(100),
  bestRoleMatch: Joi.string().max(100),
  totalSkills: Joi.number().min(0),
  confidenceLevel: Joi.number().min(0).max(100)
});

// Query parameter validation
const queryValidation = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.query);
    if (error) {
      const message = error.details.map(detail => detail.message).join(', ');
      return res.status(400).json({
        success: false,
        message
      });
    }
    next();
  };
};

module.exports = {
  registerSchema,
  loginSchema,
  objectIdSchema,
  paginationSchema,
  eventSchema,
  analyticsSchema,
  queryValidation
};
