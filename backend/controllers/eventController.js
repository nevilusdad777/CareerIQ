const mongoose = require('mongoose');
const Event = require('../models/Event');

// Get upcoming events
const getUpcomingEvents = async (req, res) => {
  try {
    const { userId } = req.query;
    
    // Validate userId
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'userId is required'
      });
    }

    if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID format'
      });
    }

    // Optional query parameters with validation
    const { 
      page = 1, 
      limit = 20, 
      type, 
      location,
      sortBy = 'date',
      sortOrder = 'asc',
      startDate,
      endDate
    } = req.query;

    // Validate pagination parameters
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    
    if (isNaN(pageNum) || pageNum < 1) {
      return res.status(400).json({
        success: false,
        message: 'Invalid page number'
      });
    }
    
    if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
      return res.status(400).json({
        success: false,
        message: 'Invalid limit number (1-100)'
      });
    }

    // Build query - Match either personal events OR global events
    const query = { 
      $or: [
        { userId },
        { isGlobal: true }
      ],
      date: { $gt: new Date() }, // Only future events
      status: { $in: ['upcoming', 'ongoing'] } // Only upcoming or ongoing events
    };
    
    if (type) {
      query.type = type;
    }
    
    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }

    // Date range filtering
    if (startDate) {
      const start = new Date(startDate);
      if (isNaN(start.getTime())) {
        return res.status(400).json({
          success: false,
          message: 'Invalid startDate format'
        });
      }
      query.date.$gte = start;
    }
    
    if (endDate) {
      const end = new Date(endDate);
      if (isNaN(end.getTime())) {
        return res.status(400).json({
          success: false,
          message: 'Invalid endDate format'
        });
      }
      if (!query.date.$gte) query.date.$gte = new Date();
      query.date.$lte = end;
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Calculate skip value for pagination
    const skip = (pageNum - 1) * limitNum;

    // Execute query with pagination
    let events = [];
    let total = 0;
    
    try {
      events = await Event.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limitNum)
        .lean(); // Use lean for better performance

      // Get total count for pagination info
      total = await Event.countDocuments(query);
    } catch (dbError) {
      console.error('Database error in getUpcomingEvents:', dbError);
      return res.status(500).json({
        success: false,
        message: 'Database error while fetching events'
      });
    }

    // Ensure events is always an array
    if (!Array.isArray(events)) {
      events = [];
    }

    // Get events count by type for stats (with error handling)
    let eventsByType = [];
    try {
      // Only run aggregation if we have events and valid userId
      if (events.length > 0 && mongoose.Types.ObjectId.isValid(userId)) {
        eventsByType = await Event.aggregate([
          { 
            $match: { 
              $or: [{ userId: new mongoose.Types.ObjectId(userId) }, { isGlobal: true }],
              date: { $gt: new Date() } 
            } 
          },
          { $group: { _id: '$type', count: { $sum: 1 } } }
        ]);
      }
    } catch (aggregateError) {
      console.error('Aggregate error:', aggregateError);
      // Continue without stats
    }

    res.status(200).json({
      success: true,
      data: {
        events,
        pagination: {
          current: pageNum,
          pageSize: limitNum,
          total,
          pages: Math.ceil(total / limitNum)
        },
        stats: {
          totalUpcoming: total,
          byType: eventsByType
        }
      }
    });

  } catch (error) {
    console.error('Error fetching upcoming events:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching upcoming events'
    });
  }
};

// Get all events (including past) for a user
const getAllEvents = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Validate userId
    if (!userId || !userId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID format'
      });
    }

    // Optional query parameters
    const { 
      page = 1, 
      limit = 20, 
      type, 
      status,
      location,
      sortBy = 'date',
      sortOrder = 'desc',
      startDate,
      endDate
    } = req.query;

    // Build query - Match personal OR global
    const query = {
      $or: [
        { userId },
        { isGlobal: true }
      ]
    };
    
    if (type) {
      query.type = type;
    }
    
    if (status) {
      query.status = status;
    }
    
    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }

    // Date range filtering
    if (startDate || endDate) {
      query.date = {};
      if (startDate) {
        query.date.$gte = new Date(startDate);
      }
      if (endDate) {
        query.date.$lte = new Date(endDate);
      }
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Calculate skip value for pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query with pagination
    const events = await Event.find(query)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Get total count for pagination info
    const total = await Event.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        events,
        pagination: {
          current: parseInt(page),
          pageSize: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });

  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching events'
    });
  }
};

// Create new event
const createEvent = async (req, res) => {
  try {
    const eventData = req.body;
    
    // Validate required fields
    const requiredFields = ['title', 'description', 'date'];
    
    // Require userId only if it's not a global event
    if (!eventData.isGlobal) {
      if (!eventData.userId) {
        return res.status(400).json({
          success: false,
          message: `userId is required for non-global events`
        });
      }
    }

    for (const field of requiredFields) {
      if (!eventData[field]) {
        return res.status(400).json({
          success: false,
          message: `${field} is required`
        });
      }
    }

    // Validate date is in the future for new events
    if (new Date(eventData.date) <= new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Event date must be in the future'
      });
    }

    const event = new Event(eventData);
    await event.save();

    res.status(201).json({
      success: true,
      data: event
    });

  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while creating event'
    });
  }
};

// Update event
const updateEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { userId } = req.body;
    const updateData = req.body;

    // Remove userId from updateData to prevent accidental user change
    delete updateData.userId;

    const event = await Event.findOneAndUpdate(
      { _id: eventId, userId },
      updateData,
      { new: true, runValidators: true }
    );

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    res.status(200).json({
      success: true,
      data: event
    });

  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while updating event'
    });
  }
};

// Delete event
const deleteEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { userId } = req.body;

    const event = await Event.findOneAndDelete({
      _id: eventId,
      userId
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Event deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while deleting event'
    });
  }
};


// --- ADMIN GLOBAL EVENTS ---

// Get all global events for Admin Panel
const getAdminGlobalEvents = async (req, res) => {
  try {
    const events = await Event.find({ isGlobal: true }).sort({ date: -1 });
    res.status(200).json({
      success: true,
      data: events
    });
  } catch (error) {
    console.error('Error fetching admin global events:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching global events'
    });
  }
};

// Create a global event (Admin only)
const createGlobalEvent = async (req, res) => {
  try {
    const eventData = { ...req.body, isGlobal: true };
    
    const requiredFields = ['title', 'description', 'date'];
    for (const field of requiredFields) {
      if (!eventData[field]) {
        return res.status(400).json({
          success: false,
          message: `${field} is required`
        });
      }
    }

    const event = new Event(eventData);
    await event.save();

    res.status(201).json({
      success: true,
      data: event
    });
  } catch (error) {
    console.error('Error creating global event:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while creating global event',
      error: error.message,
      stack: error.stack
    });
  }
};

// Delete a global event (Admin only)
const deleteGlobalEvent = async (req, res) => {
  try {
    const { eventId } = req.params;

    const event = await Event.findOneAndDelete({
      _id: eventId,
      isGlobal: true
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Global event not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Global event deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting global event:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while deleting global event'
    });
  }
};

module.exports = {
  getUpcomingEvents,
  getAllEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  getAdminGlobalEvents,
  createGlobalEvent,
  deleteGlobalEvent
};
