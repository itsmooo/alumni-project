# Alumni Backend Endpoints - Complete Summary

All endpoints are prefixed with `/api` and organized by feature. This document provides a complete overview of all available endpoints for alumni users.

## 🔐 Authentication

| Action | Method | Endpoint | Notes |
|--------|--------|----------|-------|
| Register | POST | `/api/auth/register` | Create a new alumni account |
| Login | POST | `/api/auth/login` | Email/password login |
| Verify Email | POST | `/api/auth/verify-email` | For email verification |
| Forgot Password | POST | `/api/auth/forgot-password` | Send reset link or OTP |
| Get Current User | GET | `/api/auth/me` | Authenticated alumni info |

## 👤 Profile Management

| Action | Method | Endpoint | Notes |
|--------|--------|----------|-------|
| View Own Profile | GET | `/api/users/me` | Alumni views their own data |
| Update Profile | PUT | `/api/users/profile` | Update name, location, etc. |
| Upload Profile Photo | POST | `/api/users/me/photo` | Upload avatar (JPG/PNG, max 5MB) |
| Update Privacy Settings | PUT | `/api/users/privacy` | Manage notification preferences |
| Change Password | PUT | `/api/users/password` | Update account password |
| Delete Account | DELETE | `/api/users/account` | Soft delete account |

## 🎓 Alumni Directory

| Action | Method | Endpoint | Notes |
|--------|--------|----------|-------|
| List Alumni | GET | `/api/alumni` | Searchable list of all alumni |
| View Profile | GET | `/api/alumni/:id` | View another alumni's profile |

**Query Parameters for `/api/alumni`:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20, max: 100)
- `search` - Search by name, profession, or company
- `graduationYear` - Filter by graduation year
- `location` - Filter by location (city or country)
- `profession` - Filter by profession
- `company` - Filter by company

## 📅 Events

| Action | Method | Endpoint | Notes |
|--------|--------|----------|-------|
| List Events | GET | `/api/events` | All events: upcoming & past |
| View Event | GET | `/api/events/:id` | Show full event details |
| RSVP to Event | POST | `/api/events/:id/rsvp` | `{ status: "yes" \| "no" \| "maybe", message?: string }` |
| View My RSVPs | GET | `/api/events/my-rsvps` | Personal RSVP list |

**Query Parameters for `/api/events`:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20, max: 100)
- `status` - Filter by event status (upcoming, ongoing, past)
- `category` - Filter by event category
- `location` - Filter by location
- `search` - Search by title or description

**Query Parameters for `/api/events/my-rsvps`:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20, max: 100)
- `status` - Filter by RSVP status (yes, no, maybe)

## 📰 Announcements & News

| Action | Method | Endpoint | Notes |
|--------|--------|----------|-------|
| List Posts | GET | `/api/announcements` | Filterable by category |
| View Post | GET | `/api/announcements/:id` | View full announcement/news post |

**Query Parameters for `/api/announcements`:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20, max: 100)
- `category` - Filter by category (news, announcement, update)
- `search` - Search by title or content

## 💳 Donations & Payments

| Action | Method | Endpoint | Notes |
|--------|--------|----------|-------|
| List Donation Campaigns | GET | `/api/donations` | Active donation options |
| View Campaign Details | GET | `/api/donations/:id` | Get specific campaign info |
| Pay for Donation | POST | `/api/donations/:id/pay` | Triggers Hormuud/Zaad API |
| My Donations | GET | `/api/donations/my` | List of personal donations |

**Query Parameters for `/api/donations`:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20, max: 100)
- `category` - Filter by category (scholarship, infrastructure, events, general)

**Query Parameters for `/api/donations/my`:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20, max: 100)

**Request Body for `/api/donations/:id/pay`:**
```json
{
  "amount": 50.00,
  "paymentMethod": "hormuud" | "zaad",
  "phoneNumber": "+252612345678",
  "message": "Optional donation message"
}
```

## 💼 Job Board

| Action | Method | Endpoint | Notes |
|--------|--------|----------|-------|
| List Jobs | GET | `/api/jobs` | Filterable (type, location, etc.) |
| Job Detail | GET | `/api/jobs/:id` | View full job post |
| Apply to Job | POST | `/api/jobs/:id/apply` | Express interest or link to form |

**Query Parameters for `/api/jobs`:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20, max: 100)
- `type` - Filter by job type (full-time, part-time, contract, internship)
- `location` - Filter by location
- `category` - Filter by job category
- `search` - Search by title or description

**Request Body for `/api/jobs/:id/apply`:**
```json
{
  "message": "Optional application message",
  "resumeUrl": "Optional resume URL"
}
```

## 🔔 Notifications

| Action | Method | Endpoint | Notes |
|--------|--------|----------|-------|
| List Notifications | GET | `/api/notifications` | View all system messages |
| Mark as Read | PATCH | `/api/notifications/:id` | Mark single as read |
| Mark All as Read | PATCH | `/api/notifications/mark-all-read` | Mark all as read |

**Query Parameters for `/api/notifications`:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20, max: 100)
- `unreadOnly` - Filter to show only unread notifications (boolean)

## 💰 Transaction History

| Action | Method | Endpoint | Notes |
|--------|--------|----------|-------|
| My Transactions | GET | `/api/transactions/my` | All personal transactions (events + donations) |
| Transaction Details | GET | `/api/transactions/my/:id` | View specific transaction |

**Query Parameters for `/api/transactions/my`:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20, max: 100)
- `type` - Filter by transaction type (donation, event_ticket, membership, merchandise)
- `status` - Filter by status (pending, completed, failed, cancelled)
- `startDate` - Filter from date (YYYY-MM-DD)
- `endDate` - Filter until date (YYYY-MM-DD)

## 📁 File Upload

| Action | Method | Endpoint | Notes |
|--------|--------|----------|-------|
| Upload File | POST | `/api/upload/single` | General file upload (for resumes, etc.) |

## 🔍 Additional Features

### User Management (Admin Only)
- `/api/users` - List all users (admin only)
- `/api/users/:id` - Get user by ID (admin only)
- `/api/users/:id` - Update user (admin only)
- `/api/users/:id` - Delete user (admin only)

### Dashboard Analytics (Admin Only)
- `/api/dashboard/overview` - System overview statistics
- `/api/dashboard/users` - User analytics
- `/api/dashboard/events` - Event analytics
- `/api/dashboard/payments` - Payment analytics

### System Management (Admin Only)
- `/api/system/settings` - System configuration
- `/api/system/export` - Data export functionality

## 📋 Response Formats

### Standard Success Response
```json
{
  "message": "Operation successful",
  "data": { ... }
}
```

### Paginated Response
```json
{
  "items": [...],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 100,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

### Error Response
```json
{
  "message": "Error description",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

## 🔐 Authentication Requirements

- **Public Endpoints**: Registration, login, password reset
- **Alumni Only**: Profile management, RSVPs, donations, notifications
- **Admin Only**: User management, system settings, analytics

## 📝 Notes

1. All endpoints require JWT authentication except for public auth endpoints
2. File uploads are handled via multipart/form-data
3. Pagination is consistent across all list endpoints
4. Error responses include detailed validation messages
5. All timestamps are in ISO 8601 format
6. File size limits: Profile photos (5MB), general uploads (10MB)
7. Supported image formats: JPG, PNG
8. Mobile money payments support Hormuud and Zaad
9. Email notifications are sent for important actions
10. All endpoints include comprehensive Swagger documentation

## 🚀 Getting Started

1. Register as an alumni: `POST /api/auth/register`
2. Login to get JWT token: `POST /api/auth/login`
3. Use the token in Authorization header: `Bearer <token>`
4. Start using the alumni endpoints!

For detailed API documentation, visit `/api-docs` when the server is running. 