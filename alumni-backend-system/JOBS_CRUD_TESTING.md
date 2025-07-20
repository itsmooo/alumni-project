# JOBS API CRUD TESTING GUIDE

This document provides comprehensive testing examples for all jobs API endpoints with detailed request/response examples.

## Base URL
```
http://localhost:3000/api/jobs
```

## Authentication Headers
```javascript
// For authenticated requests
{
  "Authorization": "Bearer YOUR_JWT_TOKEN"
}
```

---

## 1. ALUMNI ROUTES (Alumni Users Only)

### 1.1 Get Jobs Summary
**Endpoint:** `GET /api/jobs/summary`
**Authentication:** Required (Alumni only)

**Request:**
```bash
curl -X GET "http://localhost:3000/api/jobs/summary" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

**Expected Response:**
```json
{
  "totalJobs": 45,
  "appliedJobs": 8,
  "savedJobs": 12,
  "recentJobs": 5,
  "categoryBreakdown": {
    "technology": 18,
    "finance": 12,
    "healthcare": 8,
    "marketing": 4,
    "education": 2,
    "sales": 1
  },
  "typeBreakdown": {
    "full-time": 35,
    "part-time": 6,
    "contract": 3,
    "internship": 1
  },
  "applicationStatus": {
    "applied": 3,
    "reviewed": 2,
    "shortlisted": 2,
    "interviewed": 1,
    "offered": 0,
    "rejected": 0
  }
}
```

---

## 2. PUBLIC ROUTES (All Users)

### 2.1 Get All Jobs (Public)
**Endpoint:** `GET /api/jobs`
**Authentication:** Optional

**Request:**
```bash
curl -X GET "http://localhost:3000/api/jobs?page=1&limit=10&type=full-time&category=technology" \
  -H "Content-Type: application/json"
```

**Query Parameters:**
- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Items per page (default: 20, max: 100)
- `type` (string, optional): Job type (full-time|part-time|contract|internship|volunteer)
- `category` (string, optional): Job category (technology|healthcare|finance|education|marketing|sales|operations|other)
- `experienceLevel` (string, optional): Experience level (entry|mid|senior|executive)
- `location` (string, optional): Location filter
- `remote` (boolean, optional): Remote jobs only
- `search` (string, optional): Search in title, company, description
- `salaryMin` (number, optional): Minimum salary
- `salaryMax` (number, optional): Maximum salary

**Expected Response:**
```json
{
  "jobs": [
    {
      "_id": "64f5b8c123456789abcdef01",
      "title": "Senior Software Engineer",
      "company": {
        "name": "TechCorp Inc.",
        "logo": "https://example.com/logo.png",
        "website": "https://techcorp.com",
        "location": {
          "city": "San Francisco",
          "country": "USA",
          "isRemote": true
        }
      },
      "description": "We are looking for a Senior Software Engineer...",
      "type": "full-time",
      "category": "technology",
      "experienceLevel": "senior",
      "salary": {
        "min": 120000,
        "max": 180000,
        "currency": "USD",
        "period": "yearly",
        "isNegotiable": true
      },
      "skills": ["JavaScript", "React", "Node.js", "MongoDB"],
      "applicationDeadline": "2024-02-15T23:59:59.000Z",
      "applicationMethod": "website",
      "applicationUrl": "https://techcorp.com/careers/senior-engineer",
      "status": "active",
      "featured": true,
      "views": 245,
      "createdAt": "2024-01-15T10:00:00.000Z",
      "updatedAt": "2024-01-15T10:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 45,
    "pages": 5
  }
}
```

### 2.2 Get Job by ID
**Endpoint:** `GET /api/jobs/:id`
**Authentication:** Optional

**Request:**
```bash
curl -X GET "http://localhost:3000/api/jobs/64f5b8c123456789abcdef01" \
  -H "Content-Type: application/json"
```

**Expected Response:**
```json
{
  "_id": "64f5b8c123456789abcdef01",
  "title": "Senior Software Engineer",
  "company": {
    "name": "TechCorp Inc.",
    "logo": "https://example.com/logo.png",
    "website": "https://techcorp.com",
    "description": "Leading technology company...",
    "location": {
      "city": "San Francisco",
      "country": "USA",
      "isRemote": true
    }
  },
  "description": "We are looking for a Senior Software Engineer to join our team...",
  "requirements": [
    "5+ years of software development experience",
    "Strong knowledge of JavaScript and React",
    "Experience with Node.js and MongoDB",
    "Bachelor's degree in Computer Science or related field"
  ],
  "responsibilities": [
    "Design and develop scalable web applications",
    "Collaborate with cross-functional teams",
    "Mentor junior developers",
    "Participate in code reviews"
  ],
  "benefits": [
    "Competitive salary and equity",
    "Health, dental, and vision insurance",
    "Flexible work arrangements",
    "Professional development budget"
  ],
  "type": "full-time",
  "category": "technology",
  "experienceLevel": "senior",
  "salary": {
    "min": 120000,
    "max": 180000,
    "currency": "USD",
    "period": "yearly",
    "isNegotiable": true
  },
  "postedBy": {
    "_id": "64f5b8c123456789abcdef02",
    "firstName": "John",
    "lastName": "Doe"
  },
  "contactInfo": {
    "email": "careers@techcorp.com",
    "contactPerson": "Jane Smith"
  },
  "applicationDeadline": "2024-02-15T23:59:59.000Z",
  "applicationMethod": "website",
  "applicationUrl": "https://techcorp.com/careers/senior-engineer",
  "skills": ["JavaScript", "React", "Node.js", "MongoDB"],
  "tags": ["remote", "senior", "full-stack"],
  "status": "active",
  "featured": true,
  "views": 246,
  "createdAt": "2024-01-15T10:00:00.000Z",
  "updatedAt": "2024-01-15T10:00:00.000Z"
}
```

### 2.3 Apply for Job
**Endpoint:** `POST /api/jobs/:id/apply`
**Authentication:** Required

**Request:**
```bash
curl -X POST "http://localhost:3000/api/jobs/64f5b8c123456789abcdef01/apply" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "resume": "https://example.com/resume.pdf",
    "coverLetter": "I am very interested in this position because..."
  }'
```

**Request Body:**
```json
{
  "resume": "https://example.com/resume.pdf",
  "coverLetter": "I am very interested in this position because I have extensive experience in JavaScript and React development. My background includes..."
}
```

**Expected Response:**
```json
{
  "message": "Application submitted successfully",
  "application": {
    "_id": "64f5b8c123456789abcdef03",
    "applicant": "64f5b8c123456789abcdef04",
    "appliedAt": "2024-01-16T14:30:00.000Z",
    "status": "applied",
    "resume": "https://example.com/resume.pdf",
    "coverLetter": "I am very interested in this position because..."
  }
}
```

---

## 3. ADMIN ROUTES (Admin/Moderator Only)

### 3.1 Get All Jobs (Admin)
**Endpoint:** `GET /api/jobs/admin`
**Authentication:** Required (Admin/Moderator)

**Request:**
```bash
curl -X GET "http://localhost:3000/api/jobs/admin?page=1&limit=20&sortBy=views&sortOrder=desc&status=active" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

**Query Parameters:**
- All public parameters plus:
- `status` (string, optional): Job status (active|filled|expired|cancelled)
- `featured` (boolean, optional): Featured jobs only
- `sortBy` (string, optional): Sort field (createdAt|title|company|views|applicationCount|expiresAt)
- `sortOrder` (string, optional): Sort order (asc|desc)
- `dateFrom` (string, optional): Filter from date (ISO 8601)
- `dateTo` (string, optional): Filter to date (ISO 8601)

**Expected Response:**
```json
{
  "jobs": [
    {
      "_id": "64f5b8c123456789abcdef01",
      "title": "Senior Software Engineer",
      "company": {
        "name": "TechCorp Inc.",
        "location": {
          "city": "San Francisco",
          "country": "USA",
          "isRemote": true
        }
      },
      "type": "full-time",
      "category": "technology",
      "experienceLevel": "senior",
      "status": "active",
      "featured": true,
      "views": 245,
      "applications": [
        {
          "_id": "64f5b8c123456789abcdef03",
          "applicant": "64f5b8c123456789abcdef04",
          "status": "applied",
          "appliedAt": "2024-01-16T14:30:00.000Z"
        }
      ],
      "postedBy": {
        "_id": "64f5b8c123456789abcdef02",
        "firstName": "John",
        "lastName": "Doe",
        "email": "john.doe@example.com"
      },
      "createdAt": "2024-01-15T10:00:00.000Z",
      "updatedAt": "2024-01-15T10:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "pages": 3
  },
  "summary": {
    "statusBreakdown": {
      "active": 35,
      "filled": 8,
      "expired": 2,
      "cancelled": 0
    },
    "typeBreakdown": {
      "full-time": 30,
      "part-time": 8,
      "contract": 5,
      "internship": 2
    }
  }
}
```

### 3.2 Create Job (Admin)
**Endpoint:** `POST /api/jobs/admin`
**Authentication:** Required (Admin/Moderator)

**Request:**
```bash
curl -X POST "http://localhost:3000/api/jobs/admin" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Frontend Developer",
    "company": {
      "name": "StartupCorp",
      "website": "https://startupcorp.com",
      "description": "Innovative startup in fintech",
      "location": {
        "city": "New York",
        "country": "USA",
        "isRemote": false
      }
    },
    "description": "We are seeking a talented Frontend Developer...",
    "requirements": [
      "3+ years of React experience",
      "Strong CSS and HTML skills",
      "Experience with modern build tools"
    ],
    "responsibilities": [
      "Develop user-facing features",
      "Optimize applications for speed",
      "Collaborate with design team"
    ],
    "benefits": [
      "Competitive salary",
      "Stock options",
      "Flexible hours"
    ],
    "type": "full-time",
    "category": "technology",
    "experienceLevel": "mid",
    "salary": {
      "min": 80000,
      "max": 120000,
      "currency": "USD",
      "period": "yearly",
      "isNegotiable": true
    },
    "contactInfo": {
      "email": "jobs@startupcorp.com",
      "contactPerson": "Sarah Johnson"
    },
    "applicationDeadline": "2024-03-01T23:59:59.000Z",
    "applicationMethod": "email",
    "skills": ["React", "JavaScript", "CSS", "HTML"],
    "tags": ["frontend", "react", "startup"],
    "featured": false
  }'
```

**Expected Response:**
```json
{
  "message": "Job created successfully",
  "job": {
    "_id": "64f5b8c123456789abcdef05",
    "title": "Frontend Developer",
    "company": {
      "name": "StartupCorp",
      "website": "https://startupcorp.com",
      "description": "Innovative startup in fintech",
      "location": {
        "city": "New York",
        "country": "USA",
        "isRemote": false
      }
    },
    "description": "We are seeking a talented Frontend Developer...",
    "requirements": [
      "3+ years of React experience",
      "Strong CSS and HTML skills",
      "Experience with modern build tools"
    ],
    "responsibilities": [
      "Develop user-facing features",
      "Optimize applications for speed",
      "Collaborate with design team"
    ],
    "benefits": [
      "Competitive salary",
      "Stock options",
      "Flexible hours"
    ],
    "type": "full-time",
    "category": "technology",
    "experienceLevel": "mid",
    "salary": {
      "min": 80000,
      "max": 120000,
      "currency": "USD",
      "period": "yearly",
      "isNegotiable": true
    },
    "postedBy": {
      "_id": "64f5b8c123456789abcdef02",
      "firstName": "John",
      "lastName": "Doe"
    },
    "contactInfo": {
      "email": "jobs@startupcorp.com",
      "contactPerson": "Sarah Johnson"
    },
    "applicationDeadline": "2024-03-01T23:59:59.000Z",
    "applicationMethod": "email",
    "skills": ["React", "JavaScript", "CSS", "HTML"],
    "tags": ["frontend", "react", "startup"],
    "status": "active",
    "featured": false,
    "views": 0,
    "applications": [],
    "createdAt": "2024-01-16T15:00:00.000Z",
    "updatedAt": "2024-01-16T15:00:00.000Z"
  }
}
```

### 3.3 Get Job Details (Admin)
**Endpoint:** `GET /api/jobs/admin/:id`
**Authentication:** Required (Admin/Moderator)

**Request:**
```bash
curl -X GET "http://localhost:3000/api/jobs/admin/64f5b8c123456789abcdef01" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

**Expected Response:**
```json
{
  "_id": "64f5b8c123456789abcdef01",
  "title": "Senior Software Engineer",
  "company": {
    "name": "TechCorp Inc.",
    "logo": "https://example.com/logo.png",
    "website": "https://techcorp.com",
    "description": "Leading technology company...",
    "location": {
      "city": "San Francisco",
      "country": "USA",
      "isRemote": true
    }
  },
  "description": "We are looking for a Senior Software Engineer...",
  "requirements": ["5+ years experience", "JavaScript", "React"],
  "responsibilities": ["Design applications", "Mentor juniors"],
  "benefits": ["Competitive salary", "Health insurance"],
  "type": "full-time",
  "category": "technology",
  "experienceLevel": "senior",
  "salary": {
    "min": 120000,
    "max": 180000,
    "currency": "USD",
    "period": "yearly",
    "isNegotiable": true
  },
  "postedBy": {
    "_id": "64f5b8c123456789abcdef02",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com"
  },
  "contactInfo": {
    "email": "careers@techcorp.com",
    "contactPerson": "Jane Smith"
  },
  "applicationDeadline": "2024-02-15T23:59:59.000Z",
  "applicationMethod": "website",
  "applicationUrl": "https://techcorp.com/careers/senior-engineer",
  "skills": ["JavaScript", "React", "Node.js", "MongoDB"],
  "tags": ["remote", "senior", "full-stack"],
  "applications": [
    {
      "_id": "64f5b8c123456789abcdef03",
      "applicant": {
        "_id": "64f5b8c123456789abcdef04",
        "firstName": "Alice",
        "lastName": "Johnson",
        "email": "alice.johnson@example.com"
      },
      "appliedAt": "2024-01-16T14:30:00.000Z",
      "status": "applied",
      "resume": "https://example.com/resume.pdf",
      "coverLetter": "I am very interested in this position..."
    }
  ],
  "status": "active",
  "featured": true,
  "views": 246,
  "stats": {
    "applicationCount": 1,
    "viewsToApplicationRatio": "0.41%",
    "daysSincePosted": 1,
    "daysUntilDeadline": 30
  },
  "createdAt": "2024-01-15T10:00:00.000Z",
  "updatedAt": "2024-01-15T10:00:00.000Z"
}
```

### 3.4 Update Job (Admin)
**Endpoint:** `PUT /api/jobs/admin/:id`
**Authentication:** Required (Admin/Moderator)

**Request:**
```bash
curl -X PUT "http://localhost:3000/api/jobs/admin/64f5b8c123456789abcdef01" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Senior Full-Stack Developer",
    "featured": true,
    "salary": {
      "min": 130000,
      "max": 190000,
      "currency": "USD",
      "period": "yearly",
      "isNegotiable": true
    },
    "status": "active"
  }'
```

**Expected Response:**
```json
{
  "message": "Job updated successfully",
  "job": {
    "_id": "64f5b8c123456789abcdef01",
    "title": "Senior Full-Stack Developer",
    "company": {
      "name": "TechCorp Inc.",
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
      "min": 130000,
      "max": 190000,
      "currency": "USD",
      "period": "yearly",
      "isNegotiable": true
    },
    "status": "active",
    "featured": true,
    "views": 246,
    "postedBy": {
      "_id": "64f5b8c123456789abcdef02",
      "firstName": "John",
      "lastName": "Doe"
    },
    "createdAt": "2024-01-15T10:00:00.000Z",
    "updatedAt": "2024-01-16T16:00:00.000Z"
  }
}
```

### 3.5 Delete Job (Admin)
**Endpoint:** `DELETE /api/jobs/admin/:id`
**Authentication:** Required (Admin only)

**Request:**
```bash
curl -X DELETE "http://localhost:3000/api/jobs/admin/64f5b8c123456789abcdef01" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

**Expected Response:**
```json
{
  "message": "Job deleted successfully"
}
```

### 3.6 Bulk Operations (Admin)
**Endpoint:** `POST /api/jobs/admin/bulk`
**Authentication:** Required (Admin/Moderator)

**Request:**
```bash
curl -X POST "http://localhost:3000/api/jobs/admin/bulk" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "feature",
    "jobIds": ["64f5b8c123456789abcdef01", "64f5b8c123456789abcdef02"]
  }'
```

**Actions Available:**
- `activate` - Set status to active
- `deactivate` - Set status to cancelled
- `feature` - Set featured to true
- `unfeature` - Set featured to false
- `delete` - Delete jobs (admin only)

**Expected Response:**
```json
{
  "message": "Bulk feature completed successfully",
  "modifiedCount": 2,
  "matchedCount": 2
}
```

### 3.7 Export Jobs (Admin)
**Endpoint:** `GET /api/jobs/admin/export`
**Authentication:** Required (Admin/Moderator)

**Request:**
```bash
curl -X GET "http://localhost:3000/api/jobs/admin/export?format=csv&status=active&category=technology" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

**Query Parameters:**
- `format` (string, optional): Export format (csv|json) (default: json)
- `status` (string, optional): Filter by status
- `category` (string, optional): Filter by category
- `type` (string, optional): Filter by type
- `dateFrom` (string, optional): Filter from date
- `dateTo` (string, optional): Filter to date

**Expected Response:** File download (CSV or JSON format)

### 3.8 Get Job Statistics (Admin)
**Endpoint:** `GET /api/jobs/admin/statistics`
**Authentication:** Required (Admin/Moderator)

**Request:**
```bash
curl -X GET "http://localhost:3000/api/jobs/admin/statistics" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

**Expected Response:**
```json
{
  "overview": {
    "totalJobs": 150,
    "activeJobs": 120,
    "totalApplications": 450,
    "totalViews": 12500,
    "averageApplicationsPerJob": "3.75",
    "averageViewsPerJob": "83.33"
  },
  "breakdowns": {
    "status": {
      "active": 120,
      "filled": 25,
      "expired": 4,
      "cancelled": 1
    },
    "type": {
      "full-time": 100,
      "part-time": 25,
      "contract": 15,
      "internship": 8,
      "volunteer": 2
    },
    "category": {
      "technology": {
        "count": 60,
        "averageViews": 95,
        "totalApplications": 180
      },
      "finance": {
        "count": 30,
        "averageViews": 75,
        "totalApplications": 90
      }
    },
    "experienceLevel": {
      "entry": 40,
      "mid": 60,
      "senior": 35,
      "executive": 15
    }
  },
  "recentActivity": [
    {
      "_id": "2024-01-15",
      "jobsPosted": 5,
      "applications": 12
    },
    {
      "_id": "2024-01-16",
      "jobsPosted": 3,
      "applications": 8
    }
  ],
  "topJobs": [
    {
      "_id": "64f5b8c123456789abcdef01",
      "title": "Senior Software Engineer",
      "company": "TechCorp Inc.",
      "views": 245,
      "applications": 15,
      "engagementScore": 395
    }
  ],
  "applicationTrends": {
    "thisMonth": 85,
    "lastMonth": 72,
    "growth": "18.06%"
  }
}
```

### 3.9 Update Application Status (Admin)
**Endpoint:** `PUT /api/jobs/admin/:id/applications/:applicationId`
**Authentication:** Required (Admin/Moderator)

**Request:**
```bash
curl -X PUT "http://localhost:3000/api/jobs/admin/64f5b8c123456789abcdef01/applications/64f5b8c123456789abcdef03" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "reviewed",
    "notes": "Strong candidate, good technical skills"
  }'
```

**Request Body:**
```json
{
  "status": "reviewed",
  "notes": "Strong candidate, good technical skills"
}
```

**Status Options:**
- `applied` - Initial application
- `reviewed` - Application reviewed
- `shortlisted` - Candidate shortlisted
- `interviewed` - Interview completed
- `offered` - Job offer made
- `rejected` - Application rejected

**Expected Response:**
```json
{
  "message": "Application status updated successfully",
  "application": {
    "_id": "64f5b8c123456789abcdef03",
    "applicant": {
      "_id": "64f5b8c123456789abcdef04",
      "firstName": "Alice",
      "lastName": "Johnson",
      "email": "alice.johnson@example.com"
    },
    "appliedAt": "2024-01-16T14:30:00.000Z",
    "status": "reviewed",
    "resume": "https://example.com/resume.pdf",
    "coverLetter": "I am very interested in this position...",
    "notes": "Strong candidate, good technical skills"
  }
}
```

---

## 4. ERROR RESPONSES

### 4.1 Validation Error (400)
```json
{
  "errors": [
    {
      "type": "field",
      "msg": "Title is required",
      "path": "title",
      "location": "body"
    },
    {
      "type": "field",
      "msg": "Invalid job type",
      "path": "type",
      "location": "body"
    }
  ]
}
```

### 4.2 Unauthorized (401)
```json
{
  "message": "Access denied. No token provided."
}
```

### 4.3 Forbidden (403)
```json
{
  "message": "Access denied. Insufficient permissions."
}
```

### 4.4 Not Found (404)
```json
{
  "message": "Job not found"
}
```

### 4.5 Server Error (500)
```json
{
  "message": "Server error"
}
```

---

## 5. TESTING CHECKLIST

### ✅ Alumni Routes
- [ ] GET /api/jobs/summary - Test with alumni token
- [ ] Verify summary statistics are accurate
- [ ] Test with invalid/missing token

### ✅ Public Routes
- [ ] GET /api/jobs - Test pagination, filtering, search
- [ ] GET /api/jobs/:id - Test valid/invalid IDs
- [ ] POST /api/jobs/:id/apply - Test application submission
- [ ] Test view count incrementation

### ✅ Admin Routes
- [ ] GET /api/jobs/admin - Test all filters and sorting
- [ ] POST /api/jobs/admin - Test job creation with all fields
- [ ] GET /api/jobs/admin/:id - Test detailed job view
- [ ] PUT /api/jobs/admin/:id - Test job updates
- [ ] DELETE /api/jobs/admin/:id - Test job deletion
- [ ] POST /api/jobs/admin/bulk - Test all bulk operations
- [ ] GET /api/jobs/admin/export - Test CSV and JSON export
- [ ] GET /api/jobs/admin/statistics - Test analytics data
- [ ] PUT /api/jobs/admin/:id/applications/:applicationId - Test status updates

### ✅ Authentication & Authorization
- [ ] Test all endpoints with no token
- [ ] Test with invalid token
- [ ] Test with wrong role (alumni accessing admin routes)
- [ ] Test with correct roles

### ✅ Data Validation
- [ ] Test required fields validation
- [ ] Test enum values validation
- [ ] Test data type validation
- [ ] Test array field validation

This comprehensive testing guide covers all CRUD operations for the jobs API with detailed request/response examples for each endpoint. 