const express = require('express');
const router = express.Router();
const {
  getUpcomingEvents,
  getAllEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  getAdminGlobalEvents,
  createGlobalEvent,
  deleteGlobalEvent
} = require('../controllers/eventController');

// --- ADMIN ROUTES ---

// GET /api/events/admin/global - Get all global events
router.get('/admin/global', getAdminGlobalEvents);

// POST /api/events/admin/global - Create global event
router.post('/admin/global', createGlobalEvent);

// DELETE /api/events/admin/global/:eventId - Delete global event
router.delete('/admin/global/:eventId', deleteGlobalEvent);

// --- USER/STANDARD ROUTES ---

// GET /api/events/upcoming - Get upcoming events
// Query parameters: userId, page, limit, type, location, sortBy, sortOrder, startDate, endDate
router.get('/upcoming', getUpcomingEvents);

// GET /api/events/:userId - Get all events for a user (including past)
// Query parameters: page, limit, type, status, location, sortBy, sortOrder, startDate, endDate
router.get('/:userId', getAllEvents);

// POST /api/events - Create new event
// Body: { userId, title, description, date, ...other fields }
router.post('/', createEvent);

// PUT /api/events/:eventId - Update event
// Body: { userId, ...updateFields }
router.put('/:eventId', updateEvent);

// DELETE /api/events/:eventId - Delete event
// Body: { userId }
router.delete('/:eventId', deleteEvent);

module.exports = router;
