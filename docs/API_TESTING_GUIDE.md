# API Testing Guide

## Quick Test with cURL

### 1. Create a candidate with required fields only

```bash
curl -X POST http://localhost:3010/api/candidates \
  -F "firstName=John" \
  -F "lastName=Doe" \
  -F "email=john.doe@example.com"
```

### 2. Create a candidate with all fields

```bash
curl -X POST http://localhost:3010/api/candidates \
  -F "firstName=Jane" \
  -F "lastName=Smith" \
  -F "email=jane.smith@example.com" \
  -F "phone=+1234567890" \
  -F "address=123 Main St, Boston, MA" \
  -F 'educations=[{"institution":"MIT","degree":"Bachelor of Science","fieldOfStudy":"Computer Science","startDate":"2015-09-01","endDate":"2019-06-01"}]' \
  -F 'workExperiences=[{"company":"Google","position":"Software Engineer","startDate":"2019-07-01"}]'
```

### 3. Create a candidate with resume

```bash
# First create a test PDF file
echo "Test Resume Content" > test-resume.pdf

# Upload candidate with resume
curl -X POST http://localhost:3010/api/candidates \
  -F "firstName=Bob" \
  -F "lastName=Johnson" \
  -F "email=bob.johnson@example.com" \
  -F "resume=@test-resume.pdf"
```

### 4. Test validation errors

#### Missing required field
```bash
curl -X POST http://localhost:3010/api/candidates \
  -F "firstName=John" \
  -F "lastName=Doe"
# Expected: 400 Bad Request - Email is required
```

#### Invalid email format
```bash
curl -X POST http://localhost:3010/api/candidates \
  -F "firstName=John" \
  -F "lastName=Doe" \
  -F "email=invalid-email"
# Expected: 400 Bad Request - Invalid email format
```

#### Duplicate email
```bash
# First create a candidate
curl -X POST http://localhost:3010/api/candidates \
  -F "firstName=John" \
  -F "lastName=Doe" \
  -F "email=duplicate@example.com"

# Try to create another with same email
curl -X POST http://localhost:3010/api/candidates \
  -F "firstName=Jane" \
  -F "lastName=Smith" \
  -F "email=duplicate@example.com"
# Expected: 409 Conflict - Email already exists
```

## Using Postman or Insomnia

### Setup
1. Create a new POST request
2. URL: `http://localhost:3010/api/candidates`
3. Body type: `form-data`

### Add fields:
| Key | Value | Type |
|-----|-------|------|
| firstName | John | Text |
| lastName | Doe | Text |
| email | john.doe@example.com | Text |
| phone | +1234567890 | Text (optional) |
| address | 123 Main St | Text (optional) |
| educations | [{"institution":"MIT",...}] | Text (optional) |
| workExperiences | [{"company":"Google",...}] | Text (optional) |
| resume | (select file) | File (optional) |

### Expected Response (201)
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
    "address": "123 Main St",
    "educations": [],
    "workExperiences": [],
    "resume": null,
    "createdAt": "2024-10-11T15:30:00.000Z",
    "updatedAt": "2024-10-11T15:30:00.000Z"
  },
  "message": "Candidate added successfully"
}
```

## Running the Test Server

```bash
# Terminal 1: Start the server
cd backend
npm run dev

# Terminal 2: Run the tests
npm test
```

## Troubleshooting

### Error: Connection refused
- Make sure the server is running on port 3010
- Check if another process is using port 3010

### Error: Database connection failed
- Verify Docker PostgreSQL container is running
- Check `.env` file has correct database URL
- Run `docker ps` to see running containers

### Error: Module not found
- Run `npm install` in the backend directory
- Delete `node_modules` and run `npm install` again

### Error: Migration failed
- Run `npx prisma migrate dev` to apply migrations
- Check database credentials in `.env`
