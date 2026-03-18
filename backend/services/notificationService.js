const Notification = require('../models/Notification');

/**
 * Create a new notification for a user
 * @param {Object} params
 * @param {string} params.userId - The ID of the user
 * @param {string} params.title - Title of the notification
 * @param {string} params.message - Message content
 * @param {string} params.type - 'info', 'success', 'warning', 'error', 'reminder'
 * @param {string} params.priority - 'low', 'medium', 'high'
 * @param {string} params.actionUrl - URL to navigate to when clicked
 * @param {Object} params.metadata - Additional data
 */
const createNotification = async ({
  userId,
  title,
  message,
  type = 'info',
  priority = 'medium',
  actionUrl = '',
  metadata = {}
}) => {
  try {
    const notification = new Notification({
      userId,
      title,
      message,
      type,
      priority,
      actionUrl,
      metadata
    });
    await notification.save();
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    return null;
  }
};

/**
 * Create a welcome notification for new users
 */
const createWelcomeNotification = async (userId, userName) => {
  return createNotification({
    userId,
    title: 'Welcome to CareerIQ! 🎉',
    message: `Hi ${userName}, we're glad you're here! Start by completing your profile to get personalized predictions.`,
    type: 'success',
    priority: 'high',
    actionUrl: '/profile'
  });
};

/**
 * Notification for assessment completion
 */
const createAssessmentNotification = async (userId, score) => {
  return createNotification({
    userId,
    title: 'Assessment Completed! 🧠',
    message: `You scored ${score}% in your recent skill assessment. View your updated dashboard results now.`,
    type: 'success',
    priority: 'medium',
    actionUrl: '/dashboard'
  });
};

module.exports = {
  createNotification,
  createWelcomeNotification,
  createAssessmentNotification
};
