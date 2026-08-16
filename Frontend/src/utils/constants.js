// Application constants
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:5000/api';
export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:5000';

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  SIGNUP: '/signup',
  DASHBOARD: '/dashboard',
  PROFILE: '/profile',
  SKILL_GAP: '/skillgap',
  PREDICTOR: '/predictor',
  ROADMAP: '/roadmap',
  MARKET_INTEL: '/market',
  FEEDBACK: '/feedback',
  
  // Admin routes
  ADMIN_DASHBOARD: '/admindashboard',
  ADMIN_USERS: '/adminusers',
  ADMIN_FEEDBACK: '/managefeedback',
  ADMIN_SKILLS: '/skillmanager',
  ADMIN_MARKET: '/marketdata',
  ADMIN_SETTINGS: '/settings'
};

export const SKILL_CATEGORIES = {
  TECHNICAL: 'Technical',
  NON_TECHNICAL: 'Non-Technical',
  SOFT_SKILLS: 'Soft Skills'
};

export const EXPERIENCE_LEVELS = {
  BEGINNER: 'Beginner',
  INTERMEDIATE: 'Intermediate',
  ADVANCED: 'Advanced',
  EXPERT: 'Expert'
};


export const JOB_ROLES = [
  'Frontend Developer',
  'Backend Developer',
  'Full Stack Developer',
  'Data Scientist',
  'UI/UX Designer',
  'Mobile Developer',
  'DevOps Engineer',
  'Product Manager',
  'Data Analyst',
  'Machine Learning Engineer'
];

export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
};