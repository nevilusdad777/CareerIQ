const mongoose = require('mongoose');
const Notification = require('../models/Notification');
const Event = require('../models/Event');
require('dotenv').config();

// Sample test data
const sampleNotifications = [
  {
    userId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439011'), // Sample user ID
    title: 'Application Deadline Approaching',
    message: 'Your application for the Software Engineer position at Google is due in 3 days.',
    type: 'warning',
    priority: 'high',
    actionUrl: '/applications/google-software-engineer'
  },
  {
    userId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439011'),
    title: 'Interview Scheduled',
    message: 'Your technical interview with Microsoft is scheduled for tomorrow at 2:00 PM.',
    type: 'success',
    priority: 'high',
    actionUrl: '/interviews/microsoft-technical'
  },
  {
    userId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439011'),
    title: 'Profile Update Required',
    message: 'Please update your skills section to improve your profile visibility.',
    type: 'info',
    priority: 'medium',
    actionUrl: '/profile/edit'
  },
  {
    userId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439011'),
    title: 'New Job Match',
    message: 'We found 5 new job opportunities that match your profile.',
    type: 'success',
    priority: 'medium',
    actionUrl: '/jobs/matches'
  },
  {
    userId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439011'),
    title: 'Workshop Reminder',
    message: 'Resume Building Workshop starts in 1 hour. Don\'t forget to join!',
    type: 'reminder',
    priority: 'low',
    actionUrl: '/workshops/resume-building'
  }
];

const sampleEvents = [
  {
    userId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439011'),
    title: 'Technical Interview - Microsoft',
    description: 'Technical interview for Software Engineer position. Focus on algorithms, data structures, and system design.',
    date: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
    endDate: new Date(Date.now() + 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000), // Tomorrow + 2 hours
    location: 'Virtual - Microsoft Teams',
    type: 'interview',
    isVirtual: true,
    meetingUrl: 'https://teams.microsoft.com/meeting/abc123',
    organizer: 'Microsoft HR',
    tags: ['interview', 'technical', 'microsoft']
  },
  {
    userId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439011'),
    title: 'Resume Building Workshop',
    description: 'Learn how to create an effective resume that stands out to recruiters. Cover letter writing tips included.',
    date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
    endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000), // 3 days + 2 hours
    location: 'Online - Zoom',
    type: 'workshop',
    isVirtual: true,
    meetingUrl: 'https://zoom.us/j/xyz789',
    organizer: 'CareerIQ Team',
    maxAttendees: 100,
    currentAttendees: 45,
    tags: ['workshop', 'resume', 'career']
  },
  {
    userId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439011'),
    title: 'Application Deadline - Google',
    description: 'Final deadline to submit application for Software Engineer position at Google.',
    date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    location: 'Online Portal',
    type: 'deadline',
    organizer: 'Google Careers',
    tags: ['deadline', 'application', 'google']
  },
  {
    userId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439011'),
    title: 'Career Fair - Tech Companies',
    description: 'Annual career fair featuring top tech companies. Network with recruiters and learn about job opportunities.',
    date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 2 weeks from now
    endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000 + 6 * 60 * 60 * 1000), // 2 weeks + 6 hours
    location: 'Convention Center, Downtown',
    type: 'seminar',
    isVirtual: false,
    organizer: 'Career Services',
    maxAttendees: 500,
    currentAttendees: 234,
    tags: ['career-fair', 'networking', 'tech']
  },
  {
    userId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439011'),
    title: 'Mock Interview Session',
    description: 'Practice your interview skills with industry professionals. Get feedback and improve your performance.',
    date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
    endDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000 + 1 * 60 * 60 * 1000), // 10 days + 1 hour
    location: 'Career Center - Room 201',
    type: 'meeting',
    isVirtual: false,
    organizer: 'Career Services',
    maxAttendees: 20,
    currentAttendees: 8,
    tags: ['mock-interview', 'practice', 'feedback']
  }
];

// Function to seed data
const seedData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/careeriq', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('Connected to MongoDB');

    // Clear existing data
    await Notification.deleteMany({});
    await Event.deleteMany({});
    console.log('Cleared existing notifications and events');

    // Insert sample notifications
    const notifications = await Notification.insertMany(sampleNotifications);
    console.log(`Inserted ${notifications.length} notifications`);

    // Insert sample events
    const events = await Event.insertMany(sampleEvents);
    console.log(`Inserted ${events.length} events`);

    console.log('Sample data seeded successfully!');
    console.log('\nSample User ID for testing: 507f1f77bcf86cd799439011');
    console.log('\nAPI Endpoints to test:');
    console.log('GET /api/notifications/507f1f77bcf86cd799439011');
    console.log('GET /api/events/upcoming?userId=507f1f77bcf86cd799439011');

  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// Run the seed function
seedData();
