const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: function() { return !this.isGlobal; },
    index: true
  },
  isGlobal: {
    type: Boolean,
    default: false,
    index: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000
  },
  date: {
    type: Date,
    required: true,
    index: true
  },
  endDate: {
    type: Date,
    index: true,
    validate: {
      validator: function(v) {
        // Enforce endDate is after date only if both exist
        if (v && this.date) {
            return v > this.date;
        }
        return true;
      },
      message: 'End date must be after the start date'
    }
  },
  location: {
    type: String,
    trim: true,
    maxlength: 500
  },
  type: {
    type: String,
    required: true,
    enum: ['workshop', 'seminar', 'interview', 'deadline', 'meeting', 'other'],
    default: 'other'
  },
  status: {
    type: String,
    enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
    default: 'upcoming'
  },
  isVirtual: {
    type: Boolean,
    default: false
  },
  meetingUrl: {
    type: String,
    trim: true
  },
  organizer: {
    type: String,
    trim: true,
    maxlength: 100
  },
  maxAttendees: {
    type: Number,
    min: 1
  },
  currentAttendees: {
    type: Number,
    default: 0,
    min: 0
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: 50
  }],
  reminders: [{
    type: Date
  }],
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
eventSchema.index({ userId: 1, date: -1 }); // Optimized chronological lookup for a user
eventSchema.index({ userId: 1, status: 1 });
eventSchema.index({ date: 1, status: 1 });

// Virtual for checking if event is in the past
eventSchema.virtual('isPast').get(function() {
  return new Date() > this.date;
});

// Virtual for duration if endDate is provided
eventSchema.virtual('duration').get(function() {
  if (this.endDate) {
    return this.endDate - this.date;
  }
  return null;
});

// Pre-save middleware to update status based on date
eventSchema.pre('save', function() {
  const now = new Date();
  if (this.date <= now && this.status === 'upcoming') {
    this.status = 'ongoing';
  }
  if (this.endDate && this.endDate <= now && this.status === 'ongoing') {
    this.status = 'completed';
  }
});

module.exports = mongoose.model('Event', eventSchema);
