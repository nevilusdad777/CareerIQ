const express = require('express');
const router = express.Router();
const {
  getNotificationsByUserId,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification
} = require('../controllers/notificationController');

// GET /api/notifications/:userId - Get notifications for a specific user
// Query parameters: page, limit, type, isRead, priority, sortBy, sortOrder
router.get('/:userId', getNotificationsByUserId);

// PUT /api/notifications/:notificationId/read - Mark notification as read
// Body: { userId }
router.put('/:notificationId/read', markNotificationAsRead);

// PUT /api/notifications/:userId/read-all - Mark all notifications as read for a user
router.put('/:userId/read-all', markAllNotificationsAsRead);

// DELETE /api/notifications/:notificationId - Delete a notification
// Body: { userId }
router.delete('/:notificationId', deleteNotification);

module.exports = router;
