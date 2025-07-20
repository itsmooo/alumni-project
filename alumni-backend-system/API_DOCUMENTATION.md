# Alumni Network Management System - API Documentation

## Overview

This is the comprehensive API documentation for the Alumni Network Management System backend. The system provides REST APIs for managing alumni profiles, events, announcements, job postings, payments, and administrative functions.

## Base Information

- **Base URL**: `http://localhost:5000` (Development) / `https://api.alumninetwork.com` (Production)
- **API Version**: 1.0.0
- **Authentication**: JWT Bearer Token
- **Content Type**: `application/json`
- **Interactive Documentation**: Available at `/api-docs` (Swagger UI)

## Quick Start

### 1. Server Setup
```bash
npm install
npm run dev  # Development mode
npm start    # Production mode
```

### 2. Environment Variables Required
```env
MONGODB_URI=mongodb://localhost:27017/alumni-network
JWT_SECRET=your_jwt_secret_key
FRONTEND_URL=http://localhost:3000
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
STRIPE_SECRET_KEY=your_stripe_secret
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
EMAIL_USER=your_email
EMAIL_PASS=your_email_password
```

## Authentication

### Bearer Token Format
```http
Authorization: Bearer <your_jwt_token>
```

### User Roles
- `alumni` - Regular alumni users
- `moderator` - Can manage events and announcements
- `admin` - Full system access

## API Endpoints Overview

### Authentication & User Management
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/verify-email` - Verify email
- `POST /api/auth/verify-phone` - Verify phone number
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password

### User Profile Management (Alumni Only)
- `GET /api/users` - Get all users (alumni directory)
- `GET /api/users/:id` - Get user profile by ID
- `GET /api/users/summary` - Get user statistics summary (alumni only)
- `PUT /api/users/profile` - Update own profile (alumni only)
- `PUT /api/users/privacy` - Update privacy settings (alumni only)
- `PUT /api/users/password` - Change password (alumni only)
- `DELETE /api/users/account` - Delete own account (alumni only)
- `GET /api/users/filters/graduation-years` - Get graduation years for filtering
- `GET /api/users/filters/locations` - Get locations for filtering

### Admin User Management (Admin Only)
- `GET /api/users/admin` - Get all users with advanced filtering (admin view)
- `POST /api/users/admin` - Create new user (admin only)
- `GET /api/users/admin/:id` - Get detailed user information (admin only)
- `PUT /api/users/admin/:id` - Update any user information (admin only)
- `DELETE /api/users/admin/:id` - Delete user permanently (admin only)
- `PUT /api/users/admin/:id/role` - Update user role (admin only)
- `PUT /api/users/admin/:id/status` - Activate/deactivate user (admin only)
- `POST /api/users/admin/bulk` - Bulk operations on users (admin only)
- `GET /api/users/admin/export` - Export users data (admin only)
- `GET /api/users/admin/statistics` - Get detailed user statistics (admin only)

### Events Management
- `GET /api/events` - Get all events
- `POST /api/events` - Create new event
- `GET /api/events/:id` - Get event details
- `PUT /api/events/:id` - Update event
- `DELETE /api/events/:id` - Delete event
- `POST /api/events/:id/register` - Register for event
- `DELETE /api/events/:id/register` - Cancel event registration

### Announcements
- `GET /api/announcements` - Get all announcements
- `POST /api/announcements` - Create announcement
- `GET /api/announcements/:id` - Get announcement details
- `PUT /api/announcements/:id` - Update announcement
- `DELETE /api/announcements/:id` - Delete announcement
- `POST /api/announcements/:id/like` - Like announcement
- `POST /api/announcements/:id/comment` - Comment on announcement

### Job Board
- `GET /api/jobs` - Get all job postings
- `POST /api/jobs` - Create job posting
- `GET /api/jobs/:id` - Get job details
- `PUT /api/jobs/:id` - Update job posting
- `DELETE /api/jobs/:id` - Delete job posting
- `POST /api/jobs/:id/apply` - Apply for job

### Payments
- `POST /api/payments/create-intent` - Create payment intent
- `GET /api/payments/my-payments` - Get user payments
- `GET /api/payments/:id` - Get payment details
- `GET /api/payments/:id/receipt` - Download receipt
- `POST /api/payments/webhook` - Stripe webhook handler

### File Upload
- `POST /api/upload/single` - Upload single file

### Dashboard & Analytics (Admin Only)
- `GET /api/dashboard` - Get dashboard analytics

### System Management (Admin Only) 
- `GET /api/system/settings` - Get system settings
- `GET /api/system/export/:type` - Export system data (users, events, payments)

### Admin Event Management (Admin/Moderator Only)
- `GET /api/events/admin` - Get all events (admin view)
- `POST /api/events/admin` - Create event (admin/moderator)
- `PUT /api/events/admin/:id` - Update event (admin/moderator)
- `DELETE /api/events/admin/:id` - Delete event (admin only)
- `GET /api/events/admin/statistics` - Get event statistics

## Role-Based Access Control

### Alumni Role (`alumni`)
- Can view alumni directory
- Can update their own profile
- Can manage their own privacy settings
- Can change their own password
- Can delete their own account
- Can view user statistics summary
- Can register for events
- Can apply for jobs
- Can create job postings
- Can like and comment on announcements

### Moderator Role (`moderator`)
- All alumni permissions
- Can create and manage events
- Can create and manage announcements
- Can view event statistics

### Admin Role (`admin`)
- All system permissions
- Full user management (CRUD operations)
- Can create, update, and delete any user
- Can change user roles and status
- Can perform bulk operations on users
- Can export user data
- Can view detailed user statistics
- Can manage system settings
- Can delete events
- Can view dashboard analytics

## Detailed API Reference

### 1. Authentication APIs

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@email.com",
  "phone": "+1234567890",
  "password": "securePassword123",
  "graduationYear": 2020,
  "degree": "Bachelor of Science",
  "major": "Computer Science"
}
```

**Response (201)**:
```json
{
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "user_id",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@email.com",
    "role": "alumni",
    "profile": {
      "graduationYear": 2020,
      "degree": "Bachelor of Science",
      "major": "Computer Science"
    }
  }
}
```

#### Login User
```http
POST /api/auth/login
Content-Type: application/json

{
  "identifier": "john.doe@email.com", // or phone number
  "password": "securePassword123"
}
```

**Response (200)**:
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "user_id",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@email.com",
    "role": "alumni"
  }
}
```

### 2. User Profile APIs

#### Get Alumni Directory
```http
GET /api/users?page=1&limit=20&search=john&graduationYear=2020&location=New York
```

**Query Parameters**:
- `page` (integer): Page number (default: 1)
- `limit` (integer): Items per page (default: 20, max: 100)
- `search` (string): Search term
- `graduationYear` (integer): Filter by graduation year
- `location` (string): Filter by location
- `profession` (string): Filter by profession

**Response (200)**:
```json
{
  "users": [
    {
      "_id": "user_id",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@email.com",
      "profile": {
        "graduationYear": 2020,
        "degree": "Bachelor of Science",
        "profession": "Software Engineer",
        "company": "Tech Corp",
        "location": {
          "city": "New York",
          "country": "USA"
        },
        "profilePicture": "https://cloudinary.com/image.jpg"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "pages": 8
  }
}
```

#### Update Profile
```http
PUT /api/users/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "profile": {
    "profession": "Senior Software Engineer",
    "company": "New Tech Corp",
    "bio": "Passionate software engineer with 5+ years experience",
    "location": {
      "city": "San Francisco",
      "country": "USA"
    },
    "skills": ["JavaScript", "React", "Node.js"],
    "socialLinks": {
      "linkedin": "https://linkedin.com/in/johndoe",
      "website": "https://johndoe.com"
    }
  }
}
```

### 3. Events APIs

#### Get Events
```http
GET /api/events?page=1&limit=20&type=networking&upcoming=true&search=tech
```

**Query Parameters**:
- `page`, `limit`: Pagination
- `type`: Event type (reunion, webinar, fundraiser, networking, workshop, social, other)
- `status`: Event status (draft, published, cancelled, completed)
- `upcoming`: Boolean to filter upcoming events
- `search`: Search in title/description

**Response (200)**:
```json
{
  "events": [
    {
      "_id": "event_id",
      "title": "Tech Networking Night",
      "description": "Annual networking event for tech alumni",
      "type": "networking",
      "date": {
        "start": "2024-06-15T18:00:00.000Z",
        "end": "2024-06-15T22:00:00.000Z"
      },
      "location": {
        "type": "physical",
        "venue": "Tech Hub",
        "address": "123 Tech Street",
        "city": "San Francisco",
        "country": "USA"
      },
      "organizer": {
        "_id": "organizer_id",
        "firstName": "Jane",
        "lastName": "Smith"
      },
      "capacity": 100,
      "attendeeCount": 45,
      "registration": {
        "isRequired": true,
        "deadline": "2024-06-10T23:59:59.000Z",
        "fee": {
          "amount": 25,
          "currency": "USD"
        }
      },
      "status": "published",
      "isPublic": true,
      "tags": ["networking", "technology", "career"]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 25,
    "pages": 2
  }
}
```

#### Create Event
```http
POST /api/events
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Alumni Reunion 2024",
  "description": "Annual alumni reunion event",
  "type": "reunion",
  "date": {
    "start": "2024-08-15T18:00:00.000Z",
    "end": "2024-08-15T23:00:00.000Z"
  },
  "location": {
    "type": "physical",
    "venue": "University Campus",
    "address": "456 University Ave",
    "city": "Boston",
    "country": "USA"
  },
  "capacity": 200,
  "registration": {
    "isRequired": true,
    "deadline": "2024-08-10T23:59:59.000Z",
    "fee": {
      "amount": 50,
      "currency": "USD"
    }
  },
  "tags": ["reunion", "networking"],
  "isPublic": true
}
```

#### Register for Event
```http
POST /api/events/{event_id}/register
Authorization: Bearer <token>
```

**Response (200)**:
```json
{
  "message": "Successfully registered for event",
  "registration": {
    "eventId": "event_id",
    "userId": "user_id",
    "status": "registered",
    "registeredAt": "2024-03-15T10:30:00.000Z"
  }
}
```

### 4. Announcements APIs

#### Get Announcements
```http
GET /api/announcements?page=1&limit=20&category=jobs&priority=high
```

**Query Parameters**:
- `category`: general, jobs, news, scholarships, events, achievements, obituary
- `priority`: low, medium, high, urgent
- `search`: Search term

**Response (200)**:
```json
{
  "announcements": [
    {
      "_id": "announcement_id",
      "title": "New Job Opportunities Available",
      "content": "Several exciting job opportunities have been posted...",
      "author": {
        "_id": "author_id",
        "firstName": "Admin",
        "lastName": "User"
      },
      "category": "jobs",
      "priority": "high",
      "status": "published",
      "publishDate": "2024-03-15T09:00:00.000Z",
      "isPinned": false,
      "engagement": {
        "views": 245,
        "likes": [
          {
            "user": "user_id",
            "likedAt": "2024-03-15T10:30:00.000Z"
          }
        ],
        "comments": []
      },
      "createdAt": "2024-03-15T09:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 15,
    "pages": 1
  }
}
```

#### Create Announcement
```http
POST /api/announcements
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Important System Maintenance",
  "content": "The system will be under maintenance on Sunday...",
  "category": "general",
  "priority": "high",
  "targetAudience": {
    "isPublic": true,
    "graduationYears": [2020, 2021, 2022],
    "roles": ["alumni"]
  },
  "publishDate": "2024-03-20T09:00:00.000Z",
  "expiryDate": "2024-03-25T23:59:59.000Z"
}
```

### 5. Job Board APIs

#### Get Jobs
```http
GET /api/jobs?page=1&limit=20&type=full-time&category=technology&remote=true
```

**Query Parameters**:
- `type`: full-time, part-time, contract, internship, volunteer
- `category`: technology, healthcare, finance, education, marketing, sales, operations, other
- `experienceLevel`: entry, mid, senior, executive
- `location`: Location search
- `remote`: Boolean for remote jobs
- `search`: Search term

**Response (200)**:
```json
{
  "jobs": [
    {
      "_id": "job_id",
      "title": "Senior Software Engineer",
      "description": "We are looking for a senior software engineer...",
      "company": {
        "name": "Tech Innovations Inc",
        "logo": "https://cloudinary.com/logo.jpg",
        "location": {
          "city": "San Francisco",
          "country": "USA",
          "isRemote": true
        }
      },
      "type": "full-time",
      "category": "technology",
      "experienceLevel": "senior",
      "salary": {
        "min": 120000,
        "max": 180000,
        "currency": "USD"
      },
      "applicationMethod": {
        "type": "email",
        "contact": "jobs@techinnovations.com"
      },
      "postedBy": {
        "_id": "poster_id",
        "firstName": "HR",
        "lastName": "Manager"
      },
      "views": 156,
      "applicationCount": 12,
      "status": "active",
      "createdAt": "2024-03-10T14:30:00.000Z",
      "expiresAt": "2024-04-10T23:59:59.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "pages": 3
  }
}
```

#### Create Job Posting
```http
POST /api/jobs
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Frontend Developer",
  "description": "Looking for a talented frontend developer...",
  "company": {
    "name": "StartupXYZ",
    "logo": "https://cloudinary.com/startup-logo.jpg",
    "website": "https://startupxyz.com",
    "location": {
      "city": "Remote",
      "country": "USA",
      "isRemote": true
    }
  },
  "type": "full-time",
  "category": "technology",
  "experienceLevel": "mid",
  "requirements": [
    "3+ years React experience",
    "Strong JavaScript skills",
    "Experience with TypeScript"
  ],
  "salary": {
    "min": 80000,
    "max": 110000,
    "currency": "USD"
  },
  "applicationMethod": {
    "type": "email",
    "contact": "hiring@startupxyz.com"
  },
  "expiresAt": "2024-05-15T23:59:59.000Z"
}
```

### 6. Payment APIs

#### Create Payment Intent
```http
POST /api/payments/create-intent
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 50.00,
  "currency": "USD",
  "type": "event_ticket",
  "purpose": "Alumni Reunion 2024 Ticket",
  "paymentMethod": "card"  // or "hormuud", "zaad" for mobile money
}
```

**Response (200)**:
```json
{
  "paymentIntent": {
    "id": "pi_1234567890",
    "amount": 5000,  // Amount in cents
    "currency": "usd",
    "status": "requires_payment_method"
  },
  "clientSecret": "pi_1234567890_secret_abc123"
}
```

#### Get User Payments
```http
GET /api/payments/my-payments?page=1&limit=20
Authorization: Bearer <token>
```

**Response (200)**:
```json
{
  "payments": [
    {
      "_id": "payment_id",
      "amount": 50.00,
      "currency": "USD",
      "type": "event_ticket",
      "purpose": "Alumni Reunion 2024 Ticket",
      "status": "completed",
      "paymentMethod": "card",
      "transactionId": "txn_1234567890",
      "user": "user_id",
      "createdAt": "2024-03-15T14:30:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 5,
    "pages": 1
  }
}
```

### 7. File Upload API

#### Upload Single File
```http
POST /api/upload/single
Authorization: Bearer <token>
Content-Type: multipart/form-data

Form Data:
file: [FILE_OBJECT]
```

**Response (200)**:
```json
{
  "message": "File uploaded successfully",
  "url": "https://res.cloudinary.com/your-cloud/image/upload/v1234567890/alumni-network/user_id_timestamp.jpg"
}
```

### 8. Admin APIs

#### Dashboard Analytics
```http
GET /api/admin/dashboard?startDate=2024-01-01&endDate=2024-12-31
Authorization: Bearer <admin_token>
```

**Response (200)**:
```json
{
  "users": {
    "total": 1250,
    "new": 45,
    "byRole": {
      "alumni": 1200,
      "moderator": 5,
      "admin": 3
    },
    "recent": [
      {
        "_id": "user_id",
        "firstName": "John",
        "lastName": "Doe",
        "email": "john@email.com",
        "createdAt": "2024-03-15T10:30:00.000Z"
      }
    ]
  },
  "events": {
    "total": 25,
    "upcoming": 8,
    "byType": {
      "networking": 10,
      "reunion": 5,
      "webinar": 8,
      "other": 2
    }
  },
  "payments": {
    "totalRevenue": 12500.00,
    "recentRevenue": 2300.00
  },
  "announcements": {
    "total": 45,
    "byCategory": {
      "general": 20,
      "jobs": 15,
      "events": 10
    }
  },
  "jobs": {
    "total": 78,
    "byCategory": {
      "technology": 35,
      "finance": 20,
      "healthcare": 15,
      "other": 8
    }
  }
}
```

## WebSocket Connection (Real-time Features)

### Connection Setup
```javascript
import io from 'socket.io-client';

const socket = io('http://localhost:5000', {
  auth: {
    token: 'your_jwt_token'
  }
});
```

### Events
- `join-room` - Join a chat room
- `send-message` - Send a message
- `receive-message` - Receive a message

## Error Handling

### Standard Error Response Format
```json
{
  "message": "Error description",
  "errors": [
    {
      "field": "email",
      "message": "Email is required"
    }
  ]
}
```

### HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `429` - Too Many Requests (rate limited)
- `500` - Internal Server Error

## Rate Limiting

- **Global Limit**: 100 requests per 15 minutes per IP
- **Authentication**: Required for most endpoints
- **File Upload**: 10MB maximum file size

## Data Models

### User Model
```javascript
{
  _id: String,
  firstName: String,
  lastName: String,
  email: String,
  phone: String,
  role: "alumni" | "admin" | "moderator",
  profile: {
    graduationYear: Number,
    degree: String,
    major: String,
    profession: String,
    company: String,
    location: {
      city: String,
      country: String
    },
    bio: String,
    profilePicture: String,
    socialLinks: {
      linkedin: String,
      twitter: String,
      facebook: String,
      website: String
    },
    skills: [String],
    interests: [String]
  },
  preferences: {
    emailNotifications: Boolean,
    smsNotifications: Boolean,
    pushNotifications: Boolean,
    privacy: {
      showEmail: Boolean,
      showPhone: Boolean,
      showLocation: Boolean
    }
  },
  isActive: Boolean,
  membershipStatus: "active" | "inactive" | "suspended",
  createdAt: Date,
  updatedAt: Date,
  lastLogin: Date
}
```

### Event Model
```javascript
{
  _id: String,
  title: String,
  description: String,
  type: "reunion" | "webinar" | "fundraiser" | "networking" | "workshop" | "social" | "other",
  date: {
    start: Date,
    end: Date
  },
  location: {
    type: "physical" | "virtual" | "hybrid",
    venue: String,
    address: String,
    city: String,
    country: String,
    virtualLink: String
  },
  organizer: ObjectId, // User reference
  capacity: Number,
  registration: {
    isRequired: Boolean,
    deadline: Date,
    fee: {
      amount: Number,
      currency: String
    }
  },
  attendees: [{
    user: ObjectId, // User reference
    status: "registered" | "attended" | "cancelled",
    registeredAt: Date
  }],
  tags: [String],
  isPublic: Boolean,
  status: "draft" | "published" | "cancelled" | "completed",
  createdAt: Date,
  updatedAt: Date
}
```

## Frontend Integration Tips

### 1. Authentication Flow
```javascript
// Login
const login = async (identifier, password) => {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier, password })
  });
  const data = await response.json();
  localStorage.setItem('token', data.token);
  return data;
};

// API calls with authentication
const apiCall = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
  return fetch(`/api${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers
    }
  });
};
```

### 2. Pagination Helper
```javascript
const fetchWithPagination = async (endpoint, page = 1, limit = 20) => {
  const response = await apiCall(`${endpoint}?page=${page}&limit=${limit}`);
  return response.json();
};
```

### 3. File Upload
```javascript
const uploadFile = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch('/api/upload/single', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    body: formData
  });
  
  return response.json();
};
```

## Support

- **Swagger UI**: Available at `/api-docs` for interactive API testing
- **Health Check**: `GET /api/health` for server status
- **WebSocket**: Real-time messaging support included

## Security Features

- JWT authentication with role-based access control
- Password hashing with bcrypt
- Rate limiting
- CORS configuration
- Helmet security headers
- Input validation and sanitization
- File upload restrictions

This documentation provides everything needed to build a comprehensive frontend application that integrates with the Alumni Network Management System backend.