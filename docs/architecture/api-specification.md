# API Specification

**Project**: LTI - Talent Tracking System  
**Version**: 1.0  
**Base URL**: `http://localhost:3010/api`

---

## 📋 Overview

This document specifies the REST API endpoints for the Candidate Management feature of the LTI system.

### General Information

**Protocol**: HTTP/HTTPS  
**Format**: JSON (except file uploads use multipart/form-data)  
**Authentication**: None (to be added in future versions)  
**API Versioning**: Path-based (`/api/v1/...` - not yet implemented)

---

## 🔐 Common Response Format

### Success Response
```json
{
  "success": true,
  "data": { /* Response data */ },
  "message": "Operation completed successfully"
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": { /* Optional additional details */ }
  }
}
```

---

## 📍 Endpoints

### 1. Create Candidate

Creates a new candidate with optional education, work experience, and resume.

**Endpoint**: `POST /api/candidates`

**Content-Type**: `multipart/form-data`

**Request Parameters**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| firstName | string | Yes | Candidate's first name (1-100 chars) |
| lastName | string | Yes | Candidate's last name (1-100 chars) |
| email | string | Yes | Valid email address (unique) |
| phone | string | No | Phone number (10-15 digits) |
| address | string | No | Physical address (max 500 chars) |
| educations | string (JSON) | No | JSON array of education entries |
| workExperiences | string (JSON) | No | JSON array of work experience entries |
| resume | file | No | Resume file (PDF or DOCX, max 10MB) |

**Education Entry Structure** (JSON):
```json
{
  "institution": "string (required)",
  "degree": "string (required)",
  "fieldOfStudy": "string (optional)",
  "startDate": "YYYY-MM-DD (required)",
  "endDate": "YYYY-MM-DD (optional)",
  "description": "string (optional)"
}
```

**Work Experience Entry Structure** (JSON):
```json
{
  "company": "string (required)",
  "position": "string (required)",
  "description": "string (optional)",
  "startDate": "YYYY-MM-DD (required)",
  "endDate": "YYYY-MM-DD (optional)"
}
```

**Example Request (using curl)**:
```bash
curl -X POST http://localhost:3010/api/candidates \
  -F "firstName=John" \
  -F "lastName=Doe" \
  -F "email=john.doe@example.com" \
  -F "phone=+1234567890" \
  -F "address=123 Main St, New York, NY" \
  -F 'educations=[{"institution":"MIT","degree":"Bachelor of Science","fieldOfStudy":"Computer Science","startDate":"2015-09-01","endDate":"2019-06-01"}]' \
  -F 'workExperiences=[{"company":"Tech Corp","position":"Software Engineer","startDate":"2019-07-01"}]' \
  -F "resume=@/path/to/resume.pdf"
```

**Success Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "firstName": "John",
    "lastName": "Doe",
    "fullName": "John Doe",
    "email": "john.doe@example.com",
    "phone": "+1234567890",
    "address": "123 Main St, New York, NY",
    "educations": [
      {
        "id": "660e8400-e29b-41d4-a716-446655440000",
        "institution": "MIT",
        "degree": "Bachelor of Science",
        "fieldOfStudy": "Computer Science",
        "startDate": "2015-09-01T00:00:00.000Z",
        "endDate": "2019-06-01T00:00:00.000Z",
        "description": null
      }
    ],
    "workExperiences": [
      {
        "id": "770e8400-e29b-41d4-a716-446655440000",
        "company": "Tech Corp",
        "position": "Software Engineer",
        "description": null,
        "startDate": "2019-07-01T00:00:00.000Z",
        "endDate": null
      }
    ],
    "resume": {
      "fileName": "resume.pdf",
      "fileSize": 1048576,
      "uploadedAt": "2025-10-11T10:30:00.000Z"
    },
    "createdAt": "2025-10-11T10:30:00.000Z",
    "updatedAt": "2025-10-11T10:30:00.000Z"
  },
  "message": "Candidate added successfully"
}
```

**Error Responses**:

#### 400 Bad Request - Validation Error
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": {
      "fields": {
        "email": "Invalid email format",
        "firstName": "First name is required"
      }
    }
  }
}
```

#### 409 Conflict - Duplicate Email
```json
{
  "success": false,
  "error": {
    "code": "DUPLICATE_EMAIL",
    "message": "A candidate with this email already exists"
  }
}
```

#### 413 Payload Too Large - File Too Large
```json
{
  "success": false,
  "error": {
    "code": "FILE_TOO_LARGE",
    "message": "File size exceeds 10MB limit"
  }
}
```

#### 415 Unsupported Media Type - Invalid File Type
```json
{
  "success": false,
  "error": {
    "code": "INVALID_FILE_TYPE",
    "message": "Invalid file type. Only PDF and DOCX files are allowed"
  }
}
```

#### 500 Internal Server Error
```json
{
  "success": false,
  "error": {
    "code": "SERVER_ERROR",
    "message": "An unexpected error occurred"
  }
}
```

---

## 🔍 Validation Rules

### Personal Information

**firstName**:
- Required: Yes
- Type: String
- Min Length: 1
- Max Length: 100
- Pattern: Letters, spaces, hyphens, apostrophes
- Example: "John", "Mary-Jane", "O'Brien"

**lastName**:
- Required: Yes
- Type: String
- Min Length: 1
- Max Length: 100
- Pattern: Letters, spaces, hyphens, apostrophes
- Example: "Doe", "Van Der Berg", "O'Connor"

**email**:
- Required: Yes
- Type: String
- Format: Valid email format
- Unique: Must be unique across all candidates
- Example: "john.doe@example.com"

**phone**:
- Required: No
- Type: String
- Pattern: `^\+?\d{10,15}$` (10-15 digits, optional + prefix)
- Example: "+1234567890", "1234567890"

**address**:
- Required: No
- Type: String
- Max Length: 500
- Example: "123 Main St, New York, NY 10001"

### Education

**institution**:
- Required: Yes
- Type: String
- Min Length: 1
- Max Length: 200

**degree**:
- Required: Yes
- Type: String
- Min Length: 1
- Max Length: 100

**fieldOfStudy**:
- Required: No
- Type: String
- Max Length: 100

**startDate**:
- Required: Yes
- Type: Date (ISO 8601 format: YYYY-MM-DD)
- Validation: Must be a valid date

**endDate**:
- Required: No
- Type: Date (ISO 8601 format: YYYY-MM-DD)
- Validation: Must be >= startDate if provided

**description**:
- Required: No
- Type: String
- Max Length: 2000

### Work Experience

**company**:
- Required: Yes
- Type: String
- Min Length: 1
- Max Length: 200

**position**:
- Required: Yes
- Type: String
- Min Length: 1
- Max Length: 100

**description**:
- Required: No
- Type: String
- Max Length: 2000

**startDate**:
- Required: Yes
- Type: Date (ISO 8601 format: YYYY-MM-DD)
- Validation: Must be a valid date

**endDate**:
- Required: No
- Type: Date (ISO 8601 format: YYYY-MM-DD)
- Validation: Must be >= startDate if provided
- Note: Null/empty means current position

### Resume File

**File Type**:
- Allowed MIME types: 
  - `application/pdf`
  - `application/vnd.openxmlformats-officedocument.wordprocessingml.document`
- Allowed extensions: `.pdf`, `.docx`

**File Size**:
- Maximum: 10,485,760 bytes (10 MB)

**File Name**:
- Stored with UUID prefix for uniqueness
- Original name preserved in metadata

---

## 📊 HTTP Status Codes

| Code | Meaning | Usage |
|------|---------|-------|
| 200 | OK | Successful GET, PUT, PATCH requests |
| 201 | Created | Successful POST request |
| 400 | Bad Request | Validation error, malformed request |
| 401 | Unauthorized | Authentication required (future) |
| 403 | Forbidden | Insufficient permissions (future) |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Duplicate resource (e.g., email) |
| 413 | Payload Too Large | File size exceeds limit |
| 415 | Unsupported Media Type | Invalid file type |
| 422 | Unprocessable Entity | Semantic validation error |
| 500 | Internal Server Error | Server-side error |
| 503 | Service Unavailable | Service temporarily down |

---

## 🔒 Security Considerations

### Current Implementation
- Input validation on all fields
- File type validation (MIME type and extension)
- File size limits enforced
- Parameterized queries via Prisma (SQL injection prevention)
- CORS enabled for frontend origin

### Future Enhancements
- Authentication (JWT tokens)
- Authorization (role-based access)
- Rate limiting (prevent abuse)
- API key management
- Request signing
- HTTPS enforcement in production

---

## 🧪 Testing Examples

### Using JavaScript (Axios)

```javascript
import axios from 'axios';

const formData = new FormData();
formData.append('firstName', 'John');
formData.append('lastName', 'Doe');
formData.append('email', 'john.doe@example.com');
formData.append('phone', '+1234567890');

const educations = [
  {
    institution: 'MIT',
    degree: 'Bachelor of Science',
    fieldOfStudy: 'Computer Science',
    startDate: '2015-09-01',
    endDate: '2019-06-01'
  }
];
formData.append('educations', JSON.stringify(educations));

const file = new File(['...'], 'resume.pdf', { type: 'application/pdf' });
formData.append('resume', file);

try {
  const response = await axios.post('http://localhost:3010/api/candidates', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  console.log('Success:', response.data);
} catch (error) {
  console.error('Error:', error.response.data);
}
```

### Using Postman

1. **Method**: POST
2. **URL**: `http://localhost:3010/api/candidates`
3. **Body**: 
   - Select "form-data"
   - Add text fields: firstName, lastName, email, etc.
   - For arrays: Add as text with JSON string value
   - For file: Change type to "File" and select file

### Using cURL with JSON Arrays

```bash
curl -X POST http://localhost:3010/api/candidates \
  -H "Content-Type: multipart/form-data" \
  -F "firstName=Jane" \
  -F "lastName=Smith" \
  -F "email=jane.smith@example.com" \
  -F 'educations=[{"institution":"Harvard","degree":"MBA","startDate":"2020-09-01","endDate":"2022-06-01"}]' \
  -F 'workExperiences=[{"company":"StartupCo","position":"CTO","startDate":"2022-07-01"}]' \
  -F "resume=@resume.pdf"
```

---

## 📈 Performance Considerations

### Response Times (Target)
- Simple candidate (no arrays, no file): < 200ms
- With education/experience arrays: < 500ms
- With file upload (< 5MB): < 2 seconds
- With file upload (5-10MB): < 5 seconds

### Optimization Strategies
- Database indexes on email field
- Efficient Prisma queries with proper `include`
- File streaming for large uploads
- Connection pooling for database
- Caching strategies (future)

---

## 🔄 Future Endpoints (Planned)

### Get All Candidates
```
GET /api/candidates
Query params: page, limit, sort, filter
```

### Get Candidate by ID
```
GET /api/candidates/:id
```

### Update Candidate
```
PUT /api/candidates/:id
PATCH /api/candidates/:id
```

### Delete Candidate
```
DELETE /api/candidates/:id
```

### Search Candidates
```
GET /api/candidates/search?q=...
```

### Download Resume
```
GET /api/candidates/:id/resume
```

---

## 📚 References

- [REST API Best Practices](https://restfulapi.net/)
- [HTTP Status Codes](https://httpstatuses.com/)
- [Multipart Form Data](https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods/POST)
- [Express.js Multer](https://github.com/expressjs/multer)

---

**Last Updated**: October 11, 2025  
**Version**: 1.0  
**Status**: Implemented
