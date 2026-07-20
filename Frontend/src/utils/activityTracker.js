import axios from 'axios';

class ActivityTracker {
  constructor() {
    this.baseURL = 'http://localhost:5000/api/admin';
    this.activities = [];
    this.listeners = [];
  }

  // Log a new activity
  async logActivity(type, text, metadata = {}) {
    const activity = {
      id: Date.now() + Math.random(),
      type,
      text,
      timestamp: new Date().toISOString(),
      time: this.getRelativeTime(new Date()),
      icon: this.getIconForType(type),
      metadata
    };

    try {
      // Send to backend
      await axios.post(`${this.baseURL}/activities`, activity);
      
      // Add to local cache
      this.activities.unshift(activity);
      
      // Keep only last 50 activities in memory
      if (this.activities.length > 50) {
        this.activities = this.activities.slice(0, 50);
      }
      
      // Notify listeners
      this.notifyListeners();
      
      return activity;
    } catch (error) {
      console.error('Failed to log activity:', error);
      // Still add to local activities even if backend fails
      this.activities.unshift(activity);
      this.notifyListeners();
      return activity;
    }
  }

  // Get recent activities from backend
  async getRecentActivities(limit = 10) {
    try {
      const response = await axios.get(`${this.baseURL}/activities?limit=${limit}`);
      if (response.data.success) {
        this.activities = response.data.activities || [];
        return this.activities;
      }
    } catch (error) {
      console.error('Failed to fetch activities:', error);
    }
    
    return this.activities;
  }

  // Subscribe to activity updates
  subscribe(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback);
    };
  }

  // Notify all listeners
  notifyListeners() {
    this.listeners.forEach(callback => callback(this.activities));
  }

  // Get icon for activity type
  getIconForType(type) {
    const icons = {
      'user_registration': 'fa-user-plus',
      'user_login': 'fa-sign-in-alt',
      'user_logout': 'fa-sign-out-alt',
      'profile_update': 'fa-user-edit',
      'feedback': 'fa-comment',
      'skill_test': 'fa-trophy',
      'course_enrollment': 'fa-graduation-cap',
      'course_completion': 'fa-certificate',
      'job_application': 'fa-briefcase',
      'admin_login': 'fa-shield-alt',
      'admin_action': 'fa-cog',
      'system_update': 'fa-server',
      'error': 'fa-exclamation-triangle',
      'warning': 'fa-exclamation-circle',
      'success': 'fa-check-circle',
      'info': 'fa-info-circle',
      'default': 'fa-circle'
    };
    return icons[type] || icons.default;
  }

  // Get relative time string
  getRelativeTime(date) {
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

  // Predefined activity methods
  async logUserRegistration(email) {
    return this.logActivity('user_registration', `New user registered: ${email}`, { email });
  }

  async logUserLogin(email) {
    return this.logActivity('user_login', `User logged in: ${email}`, { email });
  }

  async logProfileUpdate(email) {
    return this.logActivity('profile_update', `Profile updated: ${email}`, { email });
  }

  async logFeedback(rating, comment) {
    return this.logActivity('feedback', `New feedback received: ${rating}-star rating`, { rating, comment });
  }

  async logSkillTest(testName, email) {
    return this.logActivity('skill_test', `Skill test completed: ${testName}`, { testName, email });
  }

  async logCourseEnrollment(courseName, email) {
    return this.logActivity('course_enrollment', `Course enrolled: ${courseName}`, { courseName, email });
  }

  async logCourseCompletion(courseName, email) {
    return this.logActivity('course_completion', `Course completed: ${courseName}`, { courseName, email });
  }

  async logJobApplication(jobTitle, email) {
    return this.logActivity('job_application', `Job application submitted: ${jobTitle}`, { jobTitle, email });
  }

  async logAdminAction(action, adminEmail) {
    return this.logActivity('admin_action', `Admin action: ${action}`, { action, adminEmail });
  }

  async logSystemUpdate(component) {
    return this.logActivity('system_update', `System updated: ${component}`, { component });
  }

  async logError(message, error) {
    return this.logActivity('error', `Error: ${message}`, { error: error?.message });
  }

  async logWarning(message) {
    return this.logActivity('warning', `Warning: ${message}`, {});
  }

  async logSuccess(message) {
    return this.logActivity('success', message, {});
  }

  async logInfo(message) {
    return this.logActivity('info', message, {});
  }
}

// Create singleton instance
const activityTracker = new ActivityTracker();

export default activityTracker;
