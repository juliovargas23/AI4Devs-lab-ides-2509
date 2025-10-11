# TASK-001: Database Layer Implementation

**Task ID**: TASK-001  
**Feature**: Add Candidate to System (US-001)  
**Priority**: High (Blocking)  
**Estimated Effort**: 4-6 hours  
**Dependencies**: None

---

## 🎯 Objective

Create the complete data model for candidates following Domain-Driven Design (DDD) principles with proper relationships, constraints, and validation rules using Prisma ORM and PostgreSQL.

---

## 📊 Current State Analysis

### Existing Infrastructure
- ✅ PostgreSQL database running in Docker container
- ✅ Prisma ORM configured and connected
- ✅ Basic `User` model exists in schema
- ❌ No candidate-related models
- ❌ No migrations for candidate data

### Files to Modify
- `backend/prisma/schema.prisma` - Add new models
- Create new migration files

---

## 🏗️ Domain Model Design

Following DDD principles, we need to create these entities:

### 1. Candidate (Aggregate Root)
The main entity representing a job candidate.

**Properties**:
```prisma
model Candidate {
  id              String           @id @default(uuid())
  firstName       String
  lastName        String
  email           String           @unique
  phone           String?
  address         String?
  createdAt       DateTime         @default(now())
  updatedAt       DateTime         @updatedAt
  
  // Relations
  educations      Education[]
  workExperiences WorkExperience[]
  resume          Resume?
  
  @@index([email])
  @@map("candidates")
}
```

**Business Rules**:
- Email must be unique across all candidates
- First name and last name are required
- Phone and address are optional
- Timestamps are automatically managed

### 2. Education (Value Object)
Represents educational background entries for a candidate.

**Properties**:
```prisma
model Education {
  id            String    @id @default(uuid())
  candidateId   String
  institution   String
  degree        String
  fieldOfStudy  String?
  startDate     DateTime
  endDate       DateTime?
  description   String?   @db.Text
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  // Relations
  candidate     Candidate @relation(fields: [candidateId], references: [id], onDelete: Cascade)
  
  @@index([candidateId])
  @@map("educations")
}
```

**Business Rules**:
- Must be associated with a candidate
- Institution and degree are required
- Field of study is optional
- End date is optional (for ongoing education)
- If end date exists, it must be after start date (validated in application layer)
- Cascade delete when candidate is deleted

### 3. WorkExperience (Value Object)
Represents work history entries for a candidate.

**Properties**:
```prisma
model WorkExperience {
  id          String    @id @default(uuid())
  candidateId String
  company     String
  position    String
  description String?   @db.Text
  startDate   DateTime
  endDate     DateTime?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  
  // Relations
  candidate   Candidate @relation(fields: [candidateId], references: [id], onDelete: Cascade)
  
  @@index([candidateId])
  @@map("work_experiences")
}
```

**Business Rules**:
- Must be associated with a candidate
- Company and position are required
- Description is optional
- End date is optional (for current position)
- If end date exists, it must be after start date (validated in application layer)
- Cascade delete when candidate is deleted

### 4. Resume (Value Object)
Represents the uploaded resume file for a candidate.

**Properties**:
```prisma
model Resume {
  id          String   @id @default(uuid())
  candidateId String   @unique
  fileName    String
  filePath    String
  fileSize    Int
  mimeType    String
  uploadedAt  DateTime @default(now())
  
  // Relations
  candidate   Candidate @relation(fields: [candidateId], references: [id], onDelete: Cascade)
  
  @@index([candidateId])
  @@map("resumes")
}
```

**Business Rules**:
- One-to-one relationship with candidate
- File name, path, and metadata required
- Mime type restricted to PDF and DOCX (validated in application layer)
- File size maximum 10MB (validated in application layer)
- Cascade delete when candidate is deleted

---

## 📋 Implementation Steps

### Step 1: Update Prisma Schema
**File**: `backend/prisma/schema.prisma`

```prisma
// Add these models to the schema file

model Candidate {
  id              String           @id @default(uuid())
  firstName       String
  lastName        String
  email           String           @unique
  phone           String?
  address         String?
  createdAt       DateTime         @default(now())
  updatedAt       DateTime         @updatedAt
  
  educations      Education[]
  workExperiences WorkExperience[]
  resume          Resume?
  
  @@index([email])
  @@map("candidates")
}

model Education {
  id            String    @id @default(uuid())
  candidateId   String
  institution   String
  degree        String
  fieldOfStudy  String?
  startDate     DateTime
  endDate       DateTime?
  description   String?   @db.Text
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  candidate     Candidate @relation(fields: [candidateId], references: [id], onDelete: Cascade)
  
  @@index([candidateId])
  @@map("educations")
}

model WorkExperience {
  id          String    @id @default(uuid())
  candidateId String
  company     String
  position    String
  description String?   @db.Text
  startDate   DateTime
  endDate     DateTime?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  
  candidate   Candidate @relation(fields: [candidateId], references: [id], onDelete: Cascade)
  
  @@index([candidateId])
  @@map("work_experiences")
}

model Resume {
  id          String   @id @default(uuid())
  candidateId String   @unique
  fileName    String
  filePath    String
  fileSize    Int
  mimeType    String
  uploadedAt  DateTime @default(now())
  
  candidate   Candidate @relation(fields: [candidateId], references: [id], onDelete: Cascade)
  
  @@index([candidateId])
  @@map("resumes")
}
```

### Step 2: Create and Run Migration

**Commands**:
```bash
# Navigate to backend directory
cd backend

# Create migration
npx prisma migrate dev --name add_candidate_models

# This will:
# 1. Create SQL migration file
# 2. Apply migration to database
# 3. Generate Prisma Client with new models
```

**Expected Output**:
```
Environment variables loaded from .env
Prisma schema loaded from prisma/schema.prisma
Datasource "db": PostgreSQL database "lti_db"

Applying migration `20251011_add_candidate_models`

The following migration(s) have been created and applied:

migrations/
  └─ 20251011_add_candidate_models/
    └─ migration.sql

✔ Generated Prisma Client
```

### Step 3: Verify Migration

**SQL Generated** (in `migrations/.../migration.sql`):
```sql
-- CreateTable
CREATE TABLE "candidates" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "address" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "candidates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "educations" (
    "id" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "institution" TEXT NOT NULL,
    "degree" TEXT NOT NULL,
    "fieldOfStudy" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "educations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "work_experiences" (
    "id" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "description" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "work_experiences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resumes" (
    "id" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "mimeType" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "resumes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "candidates_email_key" ON "candidates"("email");

-- CreateIndex
CREATE INDEX "candidates_email_idx" ON "candidates"("email");

-- CreateIndex
CREATE INDEX "educations_candidateId_idx" ON "educations"("candidateId");

-- CreateIndex
CREATE INDEX "work_experiences_candidateId_idx" ON "work_experiences"("candidateId");

-- CreateIndex
CREATE UNIQUE INDEX "resumes_candidateId_key" ON "resumes"("candidateId");

-- CreateIndex
CREATE INDEX "resumes_candidateId_idx" ON "resumes"("candidateId");

-- AddForeignKey
ALTER TABLE "educations" ADD CONSTRAINT "educations_candidateId_fkey" 
    FOREIGN KEY ("candidateId") REFERENCES "candidates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_experiences" ADD CONSTRAINT "work_experiences_candidateId_fkey" 
    FOREIGN KEY ("candidateId") REFERENCES "candidates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resumes" ADD CONSTRAINT "resumes_candidateId_fkey" 
    FOREIGN KEY ("candidateId") REFERENCES "candidates"("id") ON DELETE CASCADE ON UPDATE CASCADE;
```

### Step 4: Verify Database Tables

**Command**:
```bash
npx prisma studio
```

This will open Prisma Studio in your browser where you can:
- Verify all tables were created
- Check table structures
- View indexes and constraints
- Manually test CRUD operations

### Step 5: Generate Prisma Client

**Command**:
```bash
npx prisma generate
```

**Expected Output**:
```
✔ Generated Prisma Client to ./node_modules/@prisma/client
```

---

## 🧪 Testing Strategy

### Database Tests to Create

**File**: `backend/src/tests/database/candidate.db.test.ts`

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('Candidate Database Model', () => {
  beforeAll(async () => {
    // Setup test database
  });

  afterAll(async () => {
    // Cleanup
    await prisma.$disconnect();
  });

  describe('Create Candidate', () => {
    it('should create a candidate with required fields', async () => {
      const candidate = await prisma.candidate.create({
        data: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com'
        }
      });

      expect(candidate.id).toBeDefined();
      expect(candidate.firstName).toBe('John');
      expect(candidate.email).toBe('john.doe@example.com');
    });

    it('should create a candidate with all fields', async () => {
      const candidate = await prisma.candidate.create({
        data: {
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'jane.smith@example.com',
          phone: '+1234567890',
          address: '123 Main St'
        }
      });

      expect(candidate.phone).toBe('+1234567890');
      expect(candidate.address).toBe('123 Main St');
    });
  });

  describe('Unique Email Constraint', () => {
    it('should reject duplicate email addresses', async () => {
      await prisma.candidate.create({
        data: {
          firstName: 'Test',
          lastName: 'User',
          email: 'duplicate@example.com'
        }
      });

      await expect(
        prisma.candidate.create({
          data: {
            firstName: 'Another',
            lastName: 'User',
            email: 'duplicate@example.com'
          }
        })
      ).rejects.toThrow();
    });
  });

  describe('Relationships', () => {
    it('should create candidate with education', async () => {
      const candidate = await prisma.candidate.create({
        data: {
          firstName: 'Test',
          lastName: 'Education',
          email: 'test.education@example.com',
          educations: {
            create: {
              institution: 'Test University',
              degree: 'Bachelor of Science',
              fieldOfStudy: 'Computer Science',
              startDate: new Date('2015-09-01'),
              endDate: new Date('2019-06-01')
            }
          }
        },
        include: { educations: true }
      });

      expect(candidate.educations).toHaveLength(1);
      expect(candidate.educations[0].institution).toBe('Test University');
    });

    it('should create candidate with work experience', async () => {
      const candidate = await prisma.candidate.create({
        data: {
          firstName: 'Test',
          lastName: 'Work',
          email: 'test.work@example.com',
          workExperiences: {
            create: {
              company: 'Tech Corp',
              position: 'Software Engineer',
              startDate: new Date('2019-07-01'),
              endDate: null // Current position
            }
          }
        },
        include: { workExperiences: true }
      });

      expect(candidate.workExperiences).toHaveLength(1);
      expect(candidate.workExperiences[0].endDate).toBeNull();
    });

    it('should cascade delete education when candidate is deleted', async () => {
      const candidate = await prisma.candidate.create({
        data: {
          firstName: 'Delete',
          lastName: 'Test',
          email: 'delete.test@example.com',
          educations: {
            create: {
              institution: 'Test',
              degree: 'Test',
              startDate: new Date()
            }
          }
        }
      });

      await prisma.candidate.delete({
        where: { id: candidate.id }
      });

      const educations = await prisma.education.findMany({
        where: { candidateId: candidate.id }
      });

      expect(educations).toHaveLength(0);
    });
  });
});
```

---

## ✅ Validation Checklist

### Schema Validation
- [ ] All models defined correctly
- [ ] Primary keys use UUID
- [ ] Foreign keys correctly reference parent tables
- [ ] Indexes created on email and candidateId fields
- [ ] Cascade delete rules configured
- [ ] Unique constraints on candidate email and resume candidateId
- [ ] Optional fields marked with `?`
- [ ] Timestamps (createdAt, updatedAt) auto-managed

### Migration Validation
- [ ] Migration file created successfully
- [ ] Migration applies without errors
- [ ] Database tables created with correct names
- [ ] All columns present with correct types
- [ ] Indexes created successfully
- [ ] Foreign key constraints working
- [ ] Unique constraints enforced

### Prisma Client Validation
- [ ] Prisma Client generated successfully
- [ ] TypeScript types available for all models
- [ ] Relationship types correctly defined
- [ ] Can import and use Prisma Client in code

### Database Validation
- [ ] Can connect to PostgreSQL database
- [ ] Can perform CRUD operations on candidates
- [ ] Can create related education entries
- [ ] Can create related work experience entries
- [ ] Can create related resume entry
- [ ] Unique email constraint prevents duplicates
- [ ] Cascade delete removes related records

---

## 🚀 Next Steps

After completing this task:
1. ✅ Database models are ready
2. ➡️ Proceed to [TASK-002: Backend API Implementation](TASK-002-backend.md)
3. Backend will use these Prisma models for data operations

---

## 📚 References

- [Prisma Schema Documentation](https://www.prisma.io/docs/concepts/components/prisma-schema)
- [Prisma Relations](https://www.prisma.io/docs/concepts/components/prisma-schema/relations)
- [Prisma Migrations](https://www.prisma.io/docs/concepts/components/prisma-migrate)
- [PostgreSQL Data Types](https://www.postgresql.org/docs/current/datatype.html)

---

**Last Updated**: October 11, 2025  
**Status**: Ready to Implement  
**Estimated Time**: 4-6 hours
