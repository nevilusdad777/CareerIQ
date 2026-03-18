# CareerIQ API Documentation

## Notifications & Events API

This document describes the newly implemented notifications and events endpoints for the CareerIQ application.

## Base URL
```
http://localhost:5000
```

## Authentication
Currently, these endpoints don't require authentication, but you should include the `userId` parameter to ensure data isolation.

---

## Notifications API

### Get Notifications by User ID
```http
GET /api/notifications/:userId
```

**Parameters:**
- `userId` (path): MongoDB ObjectId of the user

**Query Parameters (Optional):**
- `page` (number): Page number for pagination (default: 1)
- `limit` (number): Number of items per page (default: 20)
- `type` (string): Filter by notification type (`info`, `success`, `warning`, `error`, `reminder`)
- `isRead` (boolean): Filter by read status (`true`, `false`)
- `priority` (string): Filter by priority (`low`, `medium`, `high`)
- `sortBy` (string): Field to sort by (default: `createdAt`)
- `sortOrder` (string): Sort order (`asc`, `desc`) (default: `desc`)

**Response:**
```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "_id": "64a1b2c3d4e5f6789012345",
        "userId": "507f1f77bcf86cd799439011",
        "title": "Application Deadline Approaching",
        "message": "Your application for the Software Engineer position at Google is due in 3 days.",
        "type": "warning",
        "isRead": false,
        "priority": "high",
        "actionUrl": "/applications/google-software-engineer",
        "createdAt": "2024-07-01T10:30:00.000Z",
        "updatedAt": "2024-07-01T10:30:00.000Z"
      }
    ],
    "pagination": {
      "current": 1,
      "pageSize": 20,
      "total": 5,
      "pages": 1
    },
    "unreadCount": 3
  }
}
```

### Mark Notification as Read
```http
PUT /api/notifications/:notificationId/read
```

**Body:**
```json
{
  "userId": "507f1f77bcf86cd799439011"
}
```

### Mark All Notifications as Read
```http
PUT /api/notifications/:userId/read-all
```

### Delete Notification
```http
DELETE /api/notifications/:notificationId
```

**Body:**
```json
{
  "userId": "507f1f77bcf86cd799439011"
}
```

---

## Events API

### Get Upcoming Events
```http
GET /api/events/upcoming?userId=USER_ID
```

**Query Parameters:**
- `userId` (required): MongoDB ObjectId of the user
- `page` (number): Page number for pagination (default: 1)
- `limit` (number): Number of items per page (default: 20)
- `type` (string): Filter by event type (`workshop`, `seminar`, `interview`, `deadline`, `meeting`, `other`)
- `location` (string): Filter by location (case-insensitive search)
- `sortBy` (string): Field to sort by (default: `date`)
- `sortOrder` (string): Sort order (`asc`, `desc`) (default: `asc`)
- `startDate` (date): Filter events from this date (ISO format)
- `endDate` (date): Filter events until this date (ISO format)

**Response:**
```json
{
  "success": true,
  "data": {
    "events": [
      {
        "_id": "64a1b2c3d4e5f6789012346",
        "userId": "507f1f77bcf86cd799439011",
        "title": "Technical Interview - Microsoft",
        "description": "Technical interview for Software Engineer position...",
        "date": "2024-07-02T14:00:00.000Z",
        "endDate": "2024-07-02T16:00:00.000Z",
        "location": "Virtual - Microsoft Teams",
        "type": "interview",
        "status": "upcoming",
        "isVirtual": true,
        "meetingUrl": "https://teams.microsoft.com/meeting/abc123",
        "organizer": "Microsoft HR",
        "tags": ["interview", "technical", "microsoft"],
        "createdAt": "2024-07-01T10:30:00.000Z",
        "updatedAt": "2024-07-01T10:30:00.000Z",
        "isPast": false,
        "duration": 7200000
      }
    ],
    "pagination": {
      "current": 1,
      "pageSize": 20,
      "total": 3,
      "pages": 1
    },
    "stats": {
      "totalUpcoming": 3,
      "byType": [
        { "_id": "interview", "count": 1 },
        { "_id": "workshop", "count": 1 },
        { "_id": "deadline", "count": 1 }
      ]
    }
  }
}
```

### Get All Events (Including Past)
```http
GET /api/events/:userId
```

**Query Parameters:**
- `page`, `limit`, `type`, `status`, `location`, `sortBy`, `sortOrder`, `startDate`, `endDate`

### Create Event
```http
POST /api/events
```

**Body:**
```json
{
  "userId": "507f1f77bcf86cd799439011",
  "title": "New Event",
  "description": "Event description",
  "date": "2024-07-15T10:00:00.000Z",
  "endDate": "2024-07-15T12:00:00.000Z",
  "location": "Event location",
  "type": "meeting",
  "isVirtual": false,
  "organizer": "Organizer name"
}
```

### Update Event
```http
PUT /api/events/:eventId
```

### Delete Event
```http
DELETE /api/events/:eventId
```

---

## Error Responses

All endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Error description"
}
```

**Common HTTP Status Codes:**
- `200`: Success
- `201`: Created (for POST requests)
- `400`: Bad Request (invalid parameters)
- `404`: Not Found
- `500`: Internal Server Error

---

## Testing with Sample Data

To populate your database with sample data:

1. Run the seed script:
```bash
cd Backend
node scripts/seedTestData.js
```

2. Use the sample user ID for testing:
```
507f1f77bcf86cd799439011
```

3. Test the endpoints:
```bash
# Get notifications
curl "http://localhost:5000/api/notifications/507f1f77bcf86cd799439011"

# Get upcoming events
curl "http://localhost:5000/api/events/upcoming?userId=507f1f77bcf86cd799439011"
```

---

## Frontend Integration

For your Dashboard.jsx, you can now call:

```javascript
// Get notifications
const response = await fetch(`/api/notifications/${userId}`);
const data = await response.json();
const notifications = data.data.notifications;

// Get upcoming events
const response = await fetch(`/api/events/upcoming?userId=${userId}`);
const data = await response.json();
const events = data.data.events;
```

Both endpoints will return empty arrays if no data is found, preventing 404 errors.
