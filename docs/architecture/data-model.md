# Data Model Architecture

**Project**: LTI - Talent Tracking System  
**Feature**: Candidate Management  
**Database**: PostgreSQL with Prisma ORM

---

## 🗂️ Entity Relationship Diagram

```
┌─────────────────────────────────────────┐
│             Candidate                   │
├─────────────────────────────────────────┤
│ id              UUID (PK)               │
│ firstName       String                  │
│ lastName        String                  │
│ email           String (UNIQUE)         │
│ phone           String (nullable)       │
│ address         String (nullable)       │
│ createdAt       DateTime                │
│ updatedAt       DateTime                │
└─────────────────────────────────────────┘
       │                    │          │
       │ 1                  │ 1        │ 1
       │                    │          │
       │ *                  │ *        │ 0..1
       ▼                    ▼          ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│  Education   │  │WorkExperience│  │   Resume     │
├──────────────┤  ├──────────────┤  ├──────────────┤
│ id       (PK)│  │ id       (PK)│  │ id       (PK)│
│ candidateId  │  │ candidateId  │  │ candidateId  │
│ institution  │  │ company      │  │ fileName     │
│ degree       │  │ position     │  │ filePath     │
│ fieldOfStudy │  │ description  │  │ fileSize     │
│ startDate    │  │ startDate    │  │ mimeType     │
│ endDate      │  │ endDate      │  │ uploadedAt   │
│ description  │  │ createdAt    │  └──────────────┘
│ createdAt    │  │ updatedAt    │
│ updatedAt    │  └──────────────┘
└──────────────┘
```

---

## 📊 Table Specifications

### Candidate Table

**Table Name**: `candidates`  
**Purpose**: Stores core candidate information  
**Aggregate Root**: Yes (in DDD context)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique identifier |
| firstName | VARCHAR(100) | NOT NULL | Candidate's first name |
| lastName | VARCHAR(100) | NOT NULL | Candidate's last name |
| email | VARCHAR(255) | NOT NULL, UNIQUE | Contact email (unique) |
| phone | VARCHAR(20) | NULL | Contact phone number |
| address | TEXT | NULL | Physical address |
| createdAt | TIMESTAMP | NOT NULL, DEFAULT NOW() | Record creation time |
| updatedAt | TIMESTAMP | NOT NULL, DEFAULT NOW() | Last update time |

**Indexes**:
- Primary: `id`
- Unique: `email`
- Index: `email` (for fast lookups)

**Business Rules**:
- Email must be unique across all candidates
- First name and last name are mandatory
- Phone and address are optional
- Timestamps automatically managed by Prisma

---

### Education Table

**Table Name**: `educations`  
**Purpose**: Stores educational background entries  
**Relationship**: Many-to-One with Candidate

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique identifier |
| candidateId | UUID | NOT NULL, FOREIGN KEY | References candidates(id) |
| institution | VARCHAR(200) | NOT NULL | Educational institution name |
| degree | VARCHAR(100) | NOT NULL | Degree obtained/pursuing |
| fieldOfStudy | VARCHAR(100) | NULL | Major or field of study |
| startDate | DATE | NOT NULL | Start date of education |
| endDate | DATE | NULL | End date (null if ongoing) |
| description | TEXT | NULL | Additional details |
| createdAt | TIMESTAMP | NOT NULL, DEFAULT NOW() | Record creation time |
| updatedAt | TIMESTAMP | NOT NULL, DEFAULT NOW() | Last update time |

**Foreign Keys**:
- `candidateId` → `candidates.id` ON DELETE CASCADE

**Indexes**:
- Primary: `id`
- Foreign: `candidateId`

**Business Rules**:
- Must be associated with a valid candidate
- Institution and degree are required
- End date is optional (for ongoing education)
- If end date exists, must be >= start date
- Cascade delete when candidate is deleted

---

### WorkExperience Table

**Table Name**: `work_experiences`  
**Purpose**: Stores employment history  
**Relationship**: Many-to-One with Candidate

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique identifier |
| candidateId | UUID | NOT NULL, FOREIGN KEY | References candidates(id) |
| company | VARCHAR(200) | NOT NULL | Company name |
| position | VARCHAR(100) | NOT NULL | Job title/position |
| description | TEXT | NULL | Job responsibilities |
| startDate | DATE | NOT NULL | Employment start date |
| endDate | DATE | NULL | Employment end date (null if current) |
| createdAt | TIMESTAMP | NOT NULL, DEFAULT NOW() | Record creation time |
| updatedAt | TIMESTAMP | NOT NULL, DEFAULT NOW() | Last update time |

**Foreign Keys**:
- `candidateId` → `candidates.id` ON DELETE CASCADE

**Indexes**:
- Primary: `id`
- Foreign: `candidateId`

**Business Rules**:
- Must be associated with a valid candidate
- Company and position are required
- Description is optional
- End date is optional (null indicates current position)
- If end date exists, must be >= start date
- Cascade delete when candidate is deleted

---

### Resume Table

**Table Name**: `resumes`  
**Purpose**: Stores resume file metadata  
**Relationship**: One-to-One with Candidate

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique identifier |
| candidateId | UUID | NOT NULL, UNIQUE, FOREIGN KEY | References candidates(id) |
| fileName | VARCHAR(255) | NOT NULL | Original file name |
| filePath | VARCHAR(500) | NOT NULL | Storage path on server |
| fileSize | INTEGER | NOT NULL | File size in bytes |
| mimeType | VARCHAR(100) | NOT NULL | MIME type (PDF/DOCX) |
| uploadedAt | TIMESTAMP | NOT NULL, DEFAULT NOW() | Upload timestamp |

**Foreign Keys**:
- `candidateId` → `candidates.id` ON DELETE CASCADE

**Indexes**:
- Primary: `id`
- Unique: `candidateId`
- Index: `candidateId`

**Business Rules**:
- One-to-one relationship with candidate
- Only one resume per candidate
- Allowed MIME types: `application/pdf`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`
- Maximum file size: 10MB (enforced in application layer)
- Cascade delete when candidate is deleted
- Physical file deletion handled in application layer

---

## 🔗 Relationships

### Candidate → Education (One-to-Many)
- One candidate can have multiple education entries
- Each education entry belongs to exactly one candidate
- Cascade delete: When candidate is deleted, all education entries are deleted

### Candidate → WorkExperience (One-to-Many)
- One candidate can have multiple work experience entries
- Each work experience entry belongs to exactly one candidate
- Cascade delete: When candidate is deleted, all work experience entries are deleted

### Candidate → Resume (One-to-One)
- One candidate can have at most one resume
- Each resume belongs to exactly one candidate
- Cascade delete: When candidate is deleted, resume record is deleted
- Note: Physical file deletion must be handled in application layer

---

## 🔒 Data Constraints & Validation

### Database Level Constraints
1. **Primary Keys**: UUID for all tables
2. **Foreign Keys**: Enforced with CASCADE DELETE
3. **Unique Constraints**: 
   - `candidates.email`
   - `resumes.candidateId`
4. **NOT NULL Constraints**: All required fields
5. **Indexes**: On frequently queried fields

### Application Level Validation
1. **Email Format**: Must match valid email pattern
2. **Phone Format**: Must match international phone pattern
3. **Date Ranges**: End date >= Start date
4. **File Types**: Only PDF and DOCX
5. **File Size**: Maximum 10MB
6. **String Lengths**: Enforced in domain entities

---

## 📈 Scalability Considerations

### Current Design
- **UUID Primary Keys**: Allow for distributed ID generation
- **Indexes**: Optimized for common queries
- **Normalized Structure**: Eliminates data redundancy

### Future Enhancements
1. **Partitioning**: Partition candidates by creation date if table grows large
2. **Archival**: Move old candidates to archive table
3. **Full-Text Search**: Add full-text indexes for resume content search
4. **Soft Deletes**: Add `deletedAt` column instead of hard deletes
5. **Audit Trail**: Add audit table for tracking changes

---

## 🗄️ Sample Data

### Example Candidate with Related Data

```sql
-- Candidate
INSERT INTO candidates (id, firstName, lastName, email, phone, address) 
VALUES (
  '550e8400-e29b-41d4-a716-446655440000',
  'John',
  'Doe',
  'john.doe@example.com',
  '+1234567890',
  '123 Main St, New York, NY 10001'
);

-- Education
INSERT INTO educations (id, candidateId, institution, degree, fieldOfStudy, startDate, endDate)
VALUES (
  '660e8400-e29b-41d4-a716-446655440000',
  '550e8400-e29b-41d4-a716-446655440000',
  'Massachusetts Institute of Technology',
  'Bachelor of Science',
  'Computer Science',
  '2015-09-01',
  '2019-06-01'
);

-- Work Experience
INSERT INTO work_experiences (id, candidateId, company, position, startDate, endDate)
VALUES (
  '770e8400-e29b-41d4-a716-446655440000',
  '550e8400-e29b-41d4-a716-446655440000',
  'Tech Corp',
  'Senior Software Engineer',
  '2019-07-01',
  NULL  -- Current position
);

-- Resume
INSERT INTO resumes (id, candidateId, fileName, filePath, fileSize, mimeType)
VALUES (
  '880e8400-e29b-41d4-a716-446655440000',
  '550e8400-e29b-41d4-a716-446655440000',
  'john_doe_resume.pdf',
  'uploads/resumes/550e8400-e29b-41d4-a716-446655440000-1699876543210.pdf',
  1048576,  -- 1MB
  'application/pdf'
);
```

---

## 🔍 Common Queries

### Get Candidate with All Related Data
```sql
SELECT 
  c.*,
  e.id as edu_id, e.institution, e.degree,
  w.id as work_id, w.company, w.position,
  r.id as resume_id, r.fileName
FROM candidates c
LEFT JOIN educations e ON c.id = e.candidateId
LEFT JOIN work_experiences w ON c.id = w.candidateId
LEFT JOIN resumes r ON c.id = r.candidateId
WHERE c.email = 'john.doe@example.com';
```

### Find Candidates with Specific Education
```sql
SELECT DISTINCT c.*
FROM candidates c
INNER JOIN educations e ON c.id = e.candidateId
WHERE e.institution LIKE '%MIT%'
  AND e.degree LIKE '%Computer Science%';
```

### Find Candidates Currently Working
```sql
SELECT DISTINCT c.*
FROM candidates c
INNER JOIN work_experiences w ON c.id = w.candidateId
WHERE w.endDate IS NULL;
```

---

## 🛠️ Migration Strategy

### Initial Migration
```bash
npx prisma migrate dev --name add_candidate_models
```

### Future Migrations
1. Create migration: `npx prisma migrate dev --name <name>`
2. Review SQL in `migrations/` folder
3. Test in development
4. Deploy to production: `npx prisma migrate deploy`

### Rollback Strategy
- Keep backups before migrations
- Test migrations in staging first
- Have rollback scripts ready
- Monitor after deployment

---

## 📚 References

- [Prisma Schema Documentation](https://www.prisma.io/docs/concepts/components/prisma-schema)
- [PostgreSQL Data Types](https://www.postgresql.org/docs/current/datatype.html)
- [Database Normalization](https://en.wikipedia.org/wiki/Database_normalization)
- [UUID Best Practices](https://www.postgresql.org/docs/current/datatype-uuid.html)

---

**Last Updated**: October 11, 2025  
**Version**: 1.0  
**Status**: Approved for Implementation
