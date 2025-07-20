# ADMIN JOB CREATION API DOCUMENTATION

This document provides comprehensive documentation for the admin job creation endpoint with detailed examples, validation rules, and error handling.

## 📋 ENDPOINT OVERVIEW

- **URL:** `POST /api/jobs/admin`
- **Authentication:** Required (Admin role only)
- **Content-Type:** `application/json`
- **Purpose:** Create new job postings with full administrative control

---

## 🔐 AUTHENTICATION

### Required Headers:
```javascript
{
  "Authorization": "Bearer YOUR_ADMIN_JWT_TOKEN",
  "Content-Type": "application/json"
}
```

### Role Requirements:
- **Admin role required** - Only users with admin privileges can create jobs
- JWT token must be valid and not expired
- User must exist in the system and have active status

---

## 📝 REQUEST SPECIFICATION

### Complete Request Example:

```bash
curl -X POST "http://localhost:3000/api/jobs/admin" \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Senior Full-Stack Developer",
    "company": {
      "name": "TechInnovate Solutions",
      "logo": "https://techinnovate.com/logo.png",
      "website": "https://techinnovate.com",
      "description": "Leading software development company specializing in enterprise solutions",
      "location": {
        "city": "San Francisco",
        "country": "USA",
        "isRemote": true
      }
    },
    "description": "We are seeking an experienced Full-Stack Developer to join our growing engineering team. You will be responsible for developing scalable web applications using modern technologies and best practices.",
    "requirements": [
      "5+ years of full-stack development experience",
      "Proficiency in JavaScript, React, and Node.js",
      "Experience with MongoDB and PostgreSQL",
      "Knowledge of cloud platforms (AWS, Azure, or GCP)",
      "Strong understanding of RESTful APIs and microservices",
      "Bachelor degree in Computer Science or equivalent experience"
    ],
    "responsibilities": [
      "Design and develop scalable web applications",
      "Collaborate with cross-functional teams to define and implement new features",
      "Write clean, maintainable, and well-documented code",
      "Participate in code reviews and maintain high code quality standards",
      "Troubleshoot and debug applications",
      "Mentor junior developers and contribute to team knowledge sharing"
    ],
    "benefits": [
      "Competitive salary with performance bonuses",
      "Comprehensive health, dental, and vision insurance",
      "401(k) with company matching",
      "Flexible work arrangements and remote work options",
      "Professional development budget ($3,000/year)",
      "Unlimited PTO policy",
      "Stock options",
      "Modern equipment and home office setup allowance"
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
    "postedBy": "64f5b8c123456789abcdef02",
    "contactInfo": {
      "email": "careers@techinnovate.com",
      "phone": "+1-555-123-4567",
      "contactPerson": "Sarah Johnson, HR Manager"
    },
    "applicationDeadline": "2024-03-15T23:59:59.000Z",
    "applicationMethod": "website",
    "applicationUrl": "https://techinnovate.com/careers/senior-fullstack-dev",
    "skills": [
      "JavaScript",
      "React",
      "Node.js",
      "MongoDB",
      "PostgreSQL",
      "AWS",
      "Docker",
      "Git",
      "REST APIs",
      "GraphQL"
    ],
    "tags": [
      "remote-friendly",
      "senior-level",
      "full-stack",
      "enterprise",
      "growth-opportunity"
    ],
    "status": "active",
    "featured": true,
    "expiresAt": "2024-04-15T23:59:59.000Z"
  }'
```

---

## 📊 FIELD SPECIFICATIONS

### ✅ REQUIRED FIELDS

| Field | Type | Description | Validation |
|-------|------|-------------|------------|
| `title` | String | Job title | Non-empty, trimmed |
| `company.name` | String | Company name | Non-empty, trimmed |
| `description` | String | Job description | Non-empty |
| `type` | Enum | Job type | One of: "full-time", "part-time", "contract", "internship", "volunteer" |
| `category` | Enum | Job category | One of: "technology", "healthcare", "finance", "education", "marketing", "sales", "operations", "other" |
| `experienceLevel` | Enum | Experience level | One of: "entry", "mid", "senior", "executive" |
| `postedBy` | ObjectId | Admin user ID | Valid MongoDB ObjectId |
| `applicationMethod` | Enum | Application method | One of: "email", "website", "phone", "in_person" |

### 🔧 OPTIONAL FIELDS

#### Company Information:
| Field | Type | Description | Validation |
|-------|------|-------------|------------|
| `company.logo` | String | Company logo URL | Valid URL format |
| `company.website` | String | Company website | Valid URL format |
| `company.description` | String | Company description | Any string |
| `company.location.city` | String | Company city | Any string |
| `company.location.country` | String | Company country | Any string |
| `company.location.isRemote` | Boolean | Remote work option | Boolean value |

#### Job Details:
| Field | Type | Description | Default |
|-------|------|-------------|---------|
| `requirements` | Array | Job requirements | Empty array |
| `responsibilities` | Array | Job responsibilities | Empty array |
| `benefits` | Array | Job benefits | Empty array |
| `skills` | Array | Required skills | Empty array |
| `tags` | Array | Job tags | Empty array |

#### Salary Information:
| Field | Type | Description | Validation |
|-------|------|-------------|------------|
| `salary.min` | Number | Minimum salary | Numeric value |
| `salary.max` | Number | Maximum salary | Numeric, must be ≥ min |
| `salary.currency` | String | Salary currency | Any string (default: "USD") |
| `salary.period` | Enum | Salary period | One of: "hourly", "monthly", "yearly" |
| `salary.isNegotiable` | Boolean | Negotiable salary | Boolean value |

#### Contact & Application:
| Field | Type | Description | Validation |
|-------|------|-------------|------------|
| `contactInfo.email` | String | Contact email | Valid email format |
| `contactInfo.phone` | String | Contact phone | Any string |
| `contactInfo.contactPerson` | String | Contact person | Any string |
| `applicationDeadline` | Date | Application deadline | ISO 8601 format, future date |
| `applicationUrl` | String | Application URL | Valid URL (required if method is "website") |

#### Job Status & Settings:
| Field | Type | Description | Default |
|-------|------|-------------|---------|
| `status` | Enum | Job status | "active" |
| `featured` | Boolean | Featured job | false |
| `expiresAt` | Date | Job expiration | 30 days from creation |

---

## ✅ SUCCESS RESPONSE (201 Created)

```json
{
  "message": "Job created successfully",
  "job": {
    "_id": "64f5b8c123456789abcdef10",
    "title": "Senior Full-Stack Developer",
    "company": {
      "name": "TechInnovate Solutions",
      "logo": "https://techinnovate.com/logo.png",
      "website": "https://techinnovate.com",
      "description": "Leading software development company specializing in enterprise solutions",
      "location": {
        "city": "San Francisco",
        "country": "USA",
        "isRemote": true
      }
    },
    "description": "We are seeking an experienced Full-Stack Developer to join our growing engineering team...",
    "requirements": [
      "5+ years of full-stack development experience",
      "Proficiency in JavaScript, React, and Node.js",
      "Experience with MongoDB and PostgreSQL",
      "Knowledge of cloud platforms (AWS, Azure, or GCP)",
      "Strong understanding of RESTful APIs and microservices",
      "Bachelor degree in Computer Science or equivalent experience"
    ],
    "responsibilities": [
      "Design and develop scalable web applications",
      "Collaborate with cross-functional teams to define and implement new features",
      "Write clean, maintainable, and well-documented code",
      "Participate in code reviews and maintain high code quality standards",
      "Troubleshoot and debug applications",
      "Mentor junior developers and contribute to team knowledge sharing"
    ],
    "benefits": [
      "Competitive salary with performance bonuses",
      "Comprehensive health, dental, and vision insurance",
      "401(k) with company matching",
      "Flexible work arrangements and remote work options",
      "Professional development budget ($3,000/year)",
      "Unlimited PTO policy",
      "Stock options",
      "Modern equipment and home office setup allowance"
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
      "lastName": "Doe",
      "email": "john.doe@admin.com"
    },
    "contactInfo": {
      "email": "careers@techinnovate.com",
      "phone": "+1-555-123-4567",
      "contactPerson": "Sarah Johnson, HR Manager"
    },
    "applicationDeadline": "2024-03-15T23:59:59.000Z",
    "applicationMethod": "website",
    "applicationUrl": "https://techinnovate.com/careers/senior-fullstack-dev",
    "skills": [
      "JavaScript",
      "React",
      "Node.js",
      "MongoDB",
      "PostgreSQL",
      "AWS",
      "Docker",
      "Git",
      "REST APIs",
      "GraphQL"
    ],
    "tags": [
      "remote-friendly",
      "senior-level",
      "full-stack",
      "enterprise",
      "growth-opportunity"
    ],
    "applications": [],
    "status": "active",
    "featured": true,
    "views": 0,
    "expiresAt": "2024-04-15T23:59:59.000Z",
    "createdAt": "2024-01-16T10:30:00.000Z",
    "updatedAt": "2024-01-16T10:30:00.000Z"
  }
}
```

---

## ❌ ERROR RESPONSES

### 400 Bad Request - Validation Errors

#### Field Validation Errors:
```json
{
  "errors": [
    {
      "type": "field",
      "msg": "Job title is required",
      "path": "title",
      "location": "body"
    },
    {
      "type": "field",
      "msg": "Invalid job type",
      "path": "type",
      "location": "body"
    },
    {
      "type": "field",
      "msg": "Company name is required",
      "path": "company.name",
      "location": "body"
    },
    {
      "type": "field",
      "msg": "Posted by must be a valid user ID",
      "path": "postedBy",
      "location": "body"
    }
  ]
}
```

#### Business Logic Validation Errors:

**Salary Range Error:**
```json
{
  "message": "Minimum salary cannot be greater than maximum salary"
}
```

**Application Deadline Error:**
```json
{
  "message": "Application deadline must be in the future"
}
```

**Expiration Date Error:**
```json
{
  "message": "Expiration date must be in the future"
}
```

**Duplicate Job Error:**
```json
{
  "message": "Duplicate job entry"
}
```

### 401 Unauthorized
```json
{
  "message": "Access denied. No token provided."
}
```

### 403 Forbidden
```json
{
  "message": "Access denied. Insufficient permissions."
}
```

### 500 Internal Server Error
```json
{
  "message": "Server error"
}
```

---

## 🔍 VALIDATION RULES

### 1. Required Field Validation
- All required fields must be present and non-empty
- String fields are trimmed of whitespace
- Enum fields must match exact values (case-sensitive)

### 2. Format Validation
- **URLs:** Must be valid HTTP/HTTPS URLs
- **Emails:** Must follow standard email format
- **Dates:** Must be in ISO 8601 format (YYYY-MM-DDTHH:mm:ss.sssZ)
- **ObjectIds:** Must be valid MongoDB ObjectIds

### 3. Business Logic Validation
- **Salary Range:** Minimum salary cannot exceed maximum salary
- **Dates:** Application deadline and expiration date must be in the future
- **Application Method:** If method is "website", applicationUrl is required

### 4. Data Type Validation
- **Arrays:** Requirements, responsibilities, benefits, skills, tags must be arrays
- **Booleans:** isRemote, isNegotiable, featured must be boolean values
- **Numbers:** Salary min/max must be numeric values

---

## 🚀 AUTOMATIC FEATURES

### 1. Default Values
- **Status:** Automatically set to "active"
- **Featured:** Defaults to false if not specified
- **Expiration:** Set to 30 days from creation if not provided
- **Views:** Initialized to 0
- **Applications:** Initialized as empty array

### 2. Data Population
- **Posted By:** User information is populated in response
- **Timestamps:** createdAt and updatedAt are automatically managed

### 3. Data Processing
- **String Trimming:** Title and company name are trimmed
- **Date Validation:** Ensures all dates are valid and logical

---

## 📝 USAGE EXAMPLES

### Minimal Required Request:
```json
{
  "title": "Software Developer",
  "company": {
    "name": "Tech Company"
  },
  "description": "Looking for a software developer",
  "type": "full-time",
  "category": "technology",
  "experienceLevel": "mid",
  "postedBy": "64f5b8c123456789abcdef02",
  "applicationMethod": "email"
}
```

### Full-Featured Request:
```json
{
  "title": "Senior Product Manager",
  "company": {
    "name": "InnovateCorp",
    "logo": "https://innovatecorp.com/logo.png",
    "website": "https://innovatecorp.com",
    "description": "Leading innovation company",
    "location": {
      "city": "New York",
      "country": "USA",
      "isRemote": true
    }
  },
  "description": "Seeking an experienced Product Manager...",
  "requirements": [
    "5+ years product management experience",
    "Strong analytical skills",
    "Experience with agile methodologies"
  ],
  "responsibilities": [
    "Define product roadmap",
    "Work with engineering teams",
    "Analyze market trends"
  ],
  "benefits": [
    "Competitive salary",
    "Health insurance",
    "Stock options"
  ],
  "type": "full-time",
  "category": "other",
  "experienceLevel": "senior",
  "salary": {
    "min": 100000,
    "max": 150000,
    "currency": "USD",
    "period": "yearly",
    "isNegotiable": true
  },
  "postedBy": "64f5b8c123456789abcdef02",
  "contactInfo": {
    "email": "careers@innovatecorp.com",
    "phone": "+1-555-987-6543",
    "contactPerson": "John Smith"
  },
  "applicationDeadline": "2024-02-28T23:59:59.000Z",
  "applicationMethod": "website",
  "applicationUrl": "https://innovatecorp.com/careers/product-manager",
  "skills": ["Product Management", "Analytics", "Agile"],
  "tags": ["remote", "senior", "product"],
  "status": "active",
  "featured": true,
  "expiresAt": "2024-03-31T23:59:59.000Z"
}
```

---

## 🧪 TESTING CHECKLIST

### ✅ Authentication Tests
- [ ] Test with valid admin token
- [ ] Test with invalid token
- [ ] Test with non-admin token
- [ ] Test without token

### ✅ Required Field Tests
- [ ] Test with all required fields
- [ ] Test missing title
- [ ] Test missing company name
- [ ] Test missing description
- [ ] Test invalid job type
- [ ] Test invalid category
- [ ] Test invalid experience level
- [ ] Test invalid postedBy ID
- [ ] Test missing application method

### ✅ Optional Field Tests
- [ ] Test with minimal required fields only
- [ ] Test with all optional fields
- [ ] Test invalid URL formats
- [ ] Test invalid email formats
- [ ] Test invalid date formats

### ✅ Business Logic Tests
- [ ] Test salary min > max validation
- [ ] Test past application deadline
- [ ] Test past expiration date
- [ ] Test automatic expiration date setting
- [ ] Test default status setting

### ✅ Data Type Tests
- [ ] Test non-array for array fields
- [ ] Test non-boolean for boolean fields
- [ ] Test non-numeric for salary fields
- [ ] Test invalid ObjectId format

### ✅ Edge Cases
- [ ] Test very long strings
- [ ] Test empty arrays
- [ ] Test special characters in text fields
- [ ] Test international characters
- [ ] Test various date formats

This comprehensive documentation covers all aspects of the admin job creation endpoint, providing developers with everything needed to successfully implement and test the functionality. 