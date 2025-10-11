# TASK-002: Backend API Implementation

**Task ID**: TASK-002  
**Feature**: Add Candidate to System (US-001)  
**Priority**: High  
**Estimated Effort**: 16-20 hours  
**Dependencies**: TASK-001 (Database Layer)

---

## 🎯 Objective

Develop RESTful API endpoint for adding candidates following Test-Driven Development (TDD), Domain-Driven Design (DDD), and Object-Oriented Programming (OOP) principles with proper error handling, validation, and file upload support.

---

## 📊 Current State Analysis

### Existing Infrastructure
- ✅ Express server running on port 3010
- ✅ Prisma Client configured
- ✅ TypeScript setup complete
- ✅ Jest testing configured
- ✅ Database models created (from TASK-001)
- ❌ No API routes defined
- ❌ No business logic layer
- ❌ No file upload handling

### Files to Create/Modify
- Entire `src/` directory restructure for DDD
- Multiple new files for domain, application, infrastructure, and presentation layers

---

## 🏗️ Architecture Design (DDD Layers)

### Directory Structure

```
backend/src/
├── index.ts                                    # Entry point (update)
├── domain/                                     # Domain Layer - Business Logic
│   ├── entities/
│   │   ├── Candidate.ts                       # Candidate aggregate root
│   │   ├── Education.ts                       # Education entity
│   │   ├── WorkExperience.ts                  # Work experience entity
│   │   └── Resume.ts                          # Resume entity
│   ├── value-objects/
│   │   ├── Email.ts                           # Email value object
│   │   ├── Phone.ts                           # Phone value object
│   │   └── DateRange.ts                       # Date range validation
│   ├── repositories/
│   │   └── ICandidateRepository.ts            # Repository interface
│   └── services/
│       └── CandidateService.ts                # Domain service
├── application/                                # Application Layer - Use Cases
│   ├── use-cases/
│   │   └── AddCandidateUseCase.ts            # Add candidate use case
│   ├── dto/
│   │   ├── CreateCandidateDTO.ts             # Input DTO
│   │   ├── CandidateResponseDTO.ts           # Output DTO
│   │   ├── EducationDTO.ts                   # Education DTO
│   │   └── WorkExperienceDTO.ts              # Work experience DTO
│   └── validators/
│       └── CandidateValidator.ts             # Business validation
├── infrastructure/                             # Infrastructure Layer
│   ├── repositories/
│   │   └── PrismaCandidateRepository.ts      # Prisma implementation
│   ├── storage/
│   │   └── FileStorageService.ts             # File upload service
│   └── config/
│       └── multer.config.ts                  # Multer configuration
├── presentation/                               # Presentation Layer - API
│   ├── controllers/
│   │   └── CandidateController.ts            # HTTP controller
│   ├── routes/
│   │   ├── index.ts                          # Route aggregator
│   │   └── candidate.routes.ts               # Candidate routes
│   ├── middlewares/
│   │   ├── errorHandler.ts                   # Error handling
│   │   ├── validateRequest.ts                # Request validation
│   │   └── upload.middleware.ts              # File upload middleware
│   └── validators/
│       └── candidateSchema.ts                # Request schema validation
└── tests/                                      # Tests (existing folder)
    ├── domain/
    ├── application/
    ├── infrastructure/
    └── presentation/
```

---

## 📦 Dependencies to Install

```bash
cd backend

# File upload
npm install multer
npm install --save-dev @types/multer

# Validation
npm install joi
npm install class-validator class-transformer

# Utilities
npm install uuid
npm install --save-dev @types/uuid

# CORS
npm install cors
npm install --save-dev @types/cors
```

---

## 📋 Implementation Steps (TDD Approach)

### PHASE 1: Domain Layer (Core Business Logic)

#### Step 1.1: Value Objects

**File**: `src/domain/value-objects/Email.ts`
```typescript
export class Email {
  private readonly value: string;

  constructor(email: string) {
    if (!this.isValid(email)) {
      throw new Error('Invalid email format');
    }
    this.value = email.toLowerCase();
  }

  private isValid(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  getValue(): string {
    return this.value;
  }

  equals(other: Email): boolean {
    return this.value === other.value;
  }
}
```

**Test**: `src/tests/domain/value-objects/Email.test.ts`
```typescript
import { Email } from '../../../domain/value-objects/Email';

describe('Email Value Object', () => {
  it('should create valid email', () => {
    const email = new Email('test@example.com');
    expect(email.getValue()).toBe('test@example.com');
  });

  it('should convert email to lowercase', () => {
    const email = new Email('Test@Example.COM');
    expect(email.getValue()).toBe('test@example.com');
  });

  it('should throw error for invalid email', () => {
    expect(() => new Email('invalid')).toThrow('Invalid email format');
  });

  it('should compare emails correctly', () => {
    const email1 = new Email('test@example.com');
    const email2 = new Email('test@example.com');
    expect(email1.equals(email2)).toBe(true);
  });
});
```

**File**: `src/domain/value-objects/Phone.ts`
```typescript
export class Phone {
  private readonly value: string;

  constructor(phone: string) {
    const cleaned = this.clean(phone);
    if (!this.isValid(cleaned)) {
      throw new Error('Invalid phone format');
    }
    this.value = cleaned;
  }

  private clean(phone: string): string {
    return phone.replace(/[^\d+]/g, '');
  }

  private isValid(phone: string): boolean {
    // Basic validation: 10-15 digits, optional + prefix
    return /^\+?\d{10,15}$/.test(phone);
  }

  getValue(): string {
    return this.value;
  }
}
```

**File**: `src/domain/value-objects/DateRange.ts`
```typescript
export class DateRange {
  constructor(
    private readonly startDate: Date,
    private readonly endDate?: Date
  ) {
    if (endDate && endDate < startDate) {
      throw new Error('End date must be after start date');
    }
  }

  getStartDate(): Date {
    return this.startDate;
  }

  getEndDate(): Date | undefined {
    return this.endDate;
  }

  isCurrentlyActive(): boolean {
    return !this.endDate;
  }
}
```

#### Step 1.2: Domain Entities

**File**: `src/domain/entities/Candidate.ts`
```typescript
import { Email } from '../value-objects/Email';
import { Phone } from '../value-objects/Phone';
import { Education } from './Education';
import { WorkExperience } from './WorkExperience';
import { Resume } from './Resume';

export class Candidate {
  private constructor(
    private readonly id: string,
    private firstName: string,
    private lastName: string,
    private email: Email,
    private phone?: Phone,
    private address?: string,
    private educations: Education[] = [],
    private workExperiences: WorkExperience[] = [],
    private resume?: Resume,
    private readonly createdAt: Date = new Date(),
    private updatedAt: Date = new Date()
  ) {}

  static create(data: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    address?: string;
  }): Candidate {
    if (!data.firstName || data.firstName.trim() === '') {
      throw new Error('First name is required');
    }
    if (!data.lastName || data.lastName.trim() === '') {
      throw new Error('Last name is required');
    }

    const email = new Email(data.email);
    const phone = data.phone ? new Phone(data.phone) : undefined;

    return new Candidate(
      data.id,
      data.firstName.trim(),
      data.lastName.trim(),
      email,
      phone,
      data.address?.trim()
    );
  }

  // Getters
  getId(): string { return this.id; }
  getFirstName(): string { return this.firstName; }
  getLastName(): string { return this.lastName; }
  getFullName(): string { return `${this.firstName} ${this.lastName}`; }
  getEmail(): string { return this.email.getValue(); }
  getPhone(): string | undefined { return this.phone?.getValue(); }
  getAddress(): string | undefined { return this.address; }
  getEducations(): Education[] { return [...this.educations]; }
  getWorkExperiences(): WorkExperience[] { return [...this.workExperiences]; }
  getResume(): Resume | undefined { return this.resume; }
  getCreatedAt(): Date { return this.createdAt; }
  getUpdatedAt(): Date { return this.updatedAt; }

  // Business methods
  addEducation(education: Education): void {
    this.educations.push(education);
    this.updatedAt = new Date();
  }

  addWorkExperience(experience: WorkExperience): void {
    this.workExperiences.push(experience);
    this.updatedAt = new Date();
  }

  setResume(resume: Resume): void {
    this.resume = resume;
    this.updatedAt = new Date();
  }

  updateContactInfo(phone?: string, address?: string): void {
    if (phone) {
      this.phone = new Phone(phone);
    }
    if (address) {
      this.address = address.trim();
    }
    this.updatedAt = new Date();
  }
}
```

**Test**: `src/tests/domain/entities/Candidate.test.ts`

#### Step 1.3: Repository Interface

**File**: `src/domain/repositories/ICandidateRepository.ts`
```typescript
import { Candidate } from '../entities/Candidate';

export interface ICandidateRepository {
  save(candidate: Candidate): Promise<Candidate>;
  findByEmail(email: string): Promise<Candidate | null>;
  findById(id: string): Promise<Candidate | null>;
  existsByEmail(email: string): Promise<boolean>;
}
```

---

### PHASE 2: Application Layer (Use Cases)

#### Step 2.1: DTOs

**File**: `src/application/dto/CreateCandidateDTO.ts`
```typescript
export interface EducationDTO {
  institution: string;
  degree: string;
  fieldOfStudy?: string;
  startDate: string; // ISO date string
  endDate?: string;
  description?: string;
}

export interface WorkExperienceDTO {
  company: string;
  position: string;
  description?: string;
  startDate: string;
  endDate?: string;
}

export interface CreateCandidateDTO {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: string;
  educations?: EducationDTO[];
  workExperiences?: WorkExperienceDTO[];
  resume?: Express.Multer.File;
}
```

**File**: `src/application/dto/CandidateResponseDTO.ts`
```typescript
export interface CandidateResponseDTO {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone?: string;
  address?: string;
  educations: Array<{
    id: string;
    institution: string;
    degree: string;
    fieldOfStudy?: string;
    startDate: string;
    endDate?: string;
    description?: string;
  }>;
  workExperiences: Array<{
    id: string;
    company: string;
    position: string;
    description?: string;
    startDate: string;
    endDate?: string;
  }>;
  resume?: {
    fileName: string;
    fileSize: number;
    uploadedAt: string;
  };
  createdAt: string;
  updatedAt: string;
}
```

#### Step 2.2: Use Case

**File**: `src/application/use-cases/AddCandidateUseCase.ts`
```typescript
import { v4 as uuidv4 } from 'uuid';
import { Candidate } from '../../domain/entities/Candidate';
import { Education } from '../../domain/entities/Education';
import { WorkExperience } from '../../domain/entities/WorkExperience';
import { Resume } from '../../domain/entities/Resume';
import { ICandidateRepository } from '../../domain/repositories/ICandidateRepository';
import { FileStorageService } from '../../infrastructure/storage/FileStorageService';
import { CreateCandidateDTO } from '../dto/CreateCandidateDTO';
import { CandidateResponseDTO } from '../dto/CandidateResponseDTO';

export class AddCandidateUseCase {
  constructor(
    private readonly candidateRepository: ICandidateRepository,
    private readonly fileStorageService: FileStorageService
  ) {}

  async execute(dto: CreateCandidateDTO): Promise<CandidateResponseDTO> {
    // Check if email already exists
    const emailExists = await this.candidateRepository.existsByEmail(dto.email);
    if (emailExists) {
      throw new Error('A candidate with this email already exists');
    }

    // Create candidate entity
    const candidateId = uuidv4();
    const candidate = Candidate.create({
      id: candidateId,
      firstName: dto.firstName,
      lastName: dto.lastName,
      email: dto.email,
      phone: dto.phone,
      address: dto.address
    });

    // Add educations
    if (dto.educations) {
      for (const eduDto of dto.educations) {
        const education = Education.create({
          id: uuidv4(),
          candidateId: candidateId,
          institution: eduDto.institution,
          degree: eduDto.degree,
          fieldOfStudy: eduDto.fieldOfStudy,
          startDate: new Date(eduDto.startDate),
          endDate: eduDto.endDate ? new Date(eduDto.endDate) : undefined,
          description: eduDto.description
        });
        candidate.addEducation(education);
      }
    }

    // Add work experiences
    if (dto.workExperiences) {
      for (const expDto of dto.workExperiences) {
        const experience = WorkExperience.create({
          id: uuidv4(),
          candidateId: candidateId,
          company: expDto.company,
          position: expDto.position,
          description: expDto.description,
          startDate: new Date(expDto.startDate),
          endDate: expDto.endDate ? new Date(expDto.endDate) : undefined
        });
        candidate.addWorkExperience(experience);
      }
    }

    // Handle resume upload
    if (dto.resume) {
      const filePath = await this.fileStorageService.saveFile(
        dto.resume,
        candidateId
      );
      
      const resume = Resume.create({
        id: uuidv4(),
        candidateId: candidateId,
        fileName: dto.resume.originalname,
        filePath: filePath,
        fileSize: dto.resume.size,
        mimeType: dto.resume.mimetype
      });
      
      candidate.setResume(resume);
    }

    // Save to repository
    const savedCandidate = await this.candidateRepository.save(candidate);

    // Map to response DTO
    return this.mapToResponseDTO(savedCandidate);
  }

  private mapToResponseDTO(candidate: Candidate): CandidateResponseDTO {
    return {
      id: candidate.getId(),
      firstName: candidate.getFirstName(),
      lastName: candidate.getLastName(),
      fullName: candidate.getFullName(),
      email: candidate.getEmail(),
      phone: candidate.getPhone(),
      address: candidate.getAddress(),
      educations: candidate.getEducations().map(edu => ({
        id: edu.getId(),
        institution: edu.getInstitution(),
        degree: edu.getDegree(),
        fieldOfStudy: edu.getFieldOfStudy(),
        startDate: edu.getStartDate().toISOString(),
        endDate: edu.getEndDate()?.toISOString(),
        description: edu.getDescription()
      })),
      workExperiences: candidate.getWorkExperiences().map(exp => ({
        id: exp.getId(),
        company: exp.getCompany(),
        position: exp.getPosition(),
        description: exp.getDescription(),
        startDate: exp.getStartDate().toISOString(),
        endDate: exp.getEndDate()?.toISOString()
      })),
      resume: candidate.getResume() ? {
        fileName: candidate.getResume()!.getFileName(),
        fileSize: candidate.getResume()!.getFileSize(),
        uploadedAt: candidate.getResume()!.getUploadedAt().toISOString()
      } : undefined,
      createdAt: candidate.getCreatedAt().toISOString(),
      updatedAt: candidate.getUpdatedAt().toISOString()
    };
  }
}
```

**Test**: `src/tests/application/use-cases/AddCandidateUseCase.test.ts`

---

### PHASE 3: Infrastructure Layer

#### Step 3.1: Prisma Repository Implementation

**File**: `src/infrastructure/repositories/PrismaCandidateRepository.ts`
```typescript
import { PrismaClient } from '@prisma/client';
import { Candidate } from '../../domain/entities/Candidate';
import { ICandidateRepository } from '../../domain/repositories/ICandidateRepository';
import { Email } from '../../domain/value-objects/Email';
import { Phone } from '../../domain/value-objects/Phone';

export class PrismaCandidateRepository implements ICandidateRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async save(candidate: Candidate): Promise<Candidate> {
    const result = await this.prisma.candidate.create({
      data: {
        id: candidate.getId(),
        firstName: candidate.getFirstName(),
        lastName: candidate.getLastName(),
        email: candidate.getEmail(),
        phone: candidate.getPhone(),
        address: candidate.getAddress(),
        educations: {
          create: candidate.getEducations().map(edu => ({
            id: edu.getId(),
            institution: edu.getInstitution(),
            degree: edu.getDegree(),
            fieldOfStudy: edu.getFieldOfStudy(),
            startDate: edu.getStartDate(),
            endDate: edu.getEndDate(),
            description: edu.getDescription()
          }))
        },
        workExperiences: {
          create: candidate.getWorkExperiences().map(exp => ({
            id: exp.getId(),
            company: exp.getCompany(),
            position: exp.getPosition(),
            description: exp.getDescription(),
            startDate: exp.getStartDate(),
            endDate: exp.getEndDate()
          }))
        },
        resume: candidate.getResume() ? {
          create: {
            id: candidate.getResume()!.getId(),
            fileName: candidate.getResume()!.getFileName(),
            filePath: candidate.getResume()!.getFilePath(),
            fileSize: candidate.getResume()!.getFileSize(),
            mimeType: candidate.getResume()!.getMimeType()
          }
        } : undefined
      },
      include: {
        educations: true,
        workExperiences: true,
        resume: true
      }
    });

    return this.toDomain(result);
  }

  async findByEmail(email: string): Promise<Candidate | null> {
    const result = await this.prisma.candidate.findUnique({
      where: { email },
      include: {
        educations: true,
        workExperiences: true,
        resume: true
      }
    });

    return result ? this.toDomain(result) : null;
  }

  async findById(id: string): Promise<Candidate | null> {
    const result = await this.prisma.candidate.findUnique({
      where: { id },
      include: {
        educations: true,
        workExperiences: true,
        resume: true
      }
    });

    return result ? this.toDomain(result) : null;
  }

  async existsByEmail(email: string): Promise<boolean> {
    const count = await this.prisma.candidate.count({
      where: { email }
    });
    return count > 0;
  }

  private toDomain(data: any): Candidate {
    // Convert Prisma result to domain entity
    // Implementation details...
  }
}
```

#### Step 3.2: File Storage Service

**File**: `src/infrastructure/storage/FileStorageService.ts`
```typescript
import fs from 'fs/promises';
import path from 'path';

export class FileStorageService {
  private readonly uploadDir: string;

  constructor(uploadDir: string = 'uploads/resumes') {
    this.uploadDir = uploadDir;
  }

  async saveFile(file: Express.Multer.File, candidateId: string): Promise<string> {
    // Ensure upload directory exists
    await this.ensureDirectoryExists();

    // Generate unique filename
    const ext = path.extname(file.originalname);
    const fileName = `${candidateId}-${Date.now()}${ext}`;
    const filePath = path.join(this.uploadDir, fileName);

    // Save file
    await fs.writeFile(filePath, file.buffer);

    return filePath;
  }

  async deleteFile(filePath: string): Promise<void> {
    try {
      await fs.unlink(filePath);
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  }

  private async ensureDirectoryExists(): Promise<void> {
    try {
      await fs.access(this.uploadDir);
    } catch {
      await fs.mkdir(this.uploadDir, { recursive: true });
    }
  }

  validateFile(file: Express.Multer.File): void {
    const allowedMimeTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new Error('Invalid file type. Only PDF and DOCX files are allowed');
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      throw new Error('File size exceeds 10MB limit');
    }
  }
}
```

#### Step 3.3: Multer Configuration

**File**: `src/infrastructure/config/multer.config.ts`
```typescript
import multer from 'multer';

export const multerConfig = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF and DOCX files are allowed'));
    }
  }
});
```

---

### PHASE 4: Presentation Layer (API)

#### Step 4.1: Controller

**File**: `src/presentation/controllers/CandidateController.ts`
```typescript
import { Request, Response, NextFunction } from 'express';
import { AddCandidateUseCase } from '../../application/use-cases/AddCandidateUseCase';
import { CreateCandidateDTO } from '../../application/dto/CreateCandidateDTO';

export class CandidateController {
  constructor(private readonly addCandidateUseCase: AddCandidateUseCase) {}

  async addCandidate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Parse JSON fields from multipart form
      const dto: CreateCandidateDTO = {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        phone: req.body.phone,
        address: req.body.address,
        educations: req.body.educations ? JSON.parse(req.body.educations) : undefined,
        workExperiences: req.body.workExperiences ? JSON.parse(req.body.workExperiences) : undefined,
        resume: req.file
      };

      const result = await this.addCandidateUseCase.execute(dto);

      res.status(201).json({
        success: true,
        data: result,
        message: 'Candidate added successfully'
      });
    } catch (error) {
      next(error);
    }
  }
}
```

#### Step 4.2: Request Validation Schema

**File**: `src/presentation/validators/candidateSchema.ts`
```typescript
import Joi from 'joi';

export const createCandidateSchema = Joi.object({
  firstName: Joi.string().required().trim().min(1).max(100),
  lastName: Joi.string().required().trim().min(1).max(100),
  email: Joi.string().required().email(),
  phone: Joi.string().optional().pattern(/^\+?\d{10,15}$/),
  address: Joi.string().optional().max(500),
  educations: Joi.string().optional().custom((value, helpers) => {
    try {
      const parsed = JSON.parse(value);
      if (!Array.isArray(parsed)) {
        return helpers.error('any.invalid');
      }
      return parsed;
    } catch {
      return helpers.error('any.invalid');
    }
  }),
  workExperiences: Joi.string().optional().custom((value, helpers) => {
    try {
      const parsed = JSON.parse(value);
      if (!Array.isArray(parsed)) {
        return helpers.error('any.invalid');
      }
      return parsed;
    } catch {
      return helpers.error('any.invalid');
    }
  })
});
```

#### Step 4.3: Error Handler Middleware

**File**: `src/presentation/middlewares/errorHandler.ts`
```typescript
import { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code?: string,
    public details?: any
  ) {
    super(message);
  }
}

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error:', err);

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code || 'ERROR',
        message: err.message,
        details: err.details
      }
    });
  }

  // Handle Prisma errors
  if (err.name === 'PrismaClientKnownRequestError') {
    return res.status(400).json({
      success: false,
      error: {
        code: 'DATABASE_ERROR',
        message: 'Database operation failed',
        details: err.message
      }
    });
  }

  // Handle validation errors
  if (err.message.includes('Invalid email') || err.message.includes('required')) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: err.message
      }
    });
  }

  // Generic error
  res.status(500).json({
    success: false,
    error: {
      code: 'SERVER_ERROR',
      message: 'An unexpected error occurred'
    }
  });
};
```

#### Step 4.4: Routes

**File**: `src/presentation/routes/candidate.routes.ts`
```typescript
import { Router } from 'express';
import { CandidateController } from '../controllers/CandidateController';
import { multerConfig } from '../../infrastructure/config/multer.config';
import { validateRequest } from '../middlewares/validateRequest';
import { createCandidateSchema } from '../validators/candidateSchema';

export function createCandidateRoutes(controller: CandidateController): Router {
  const router = Router();

  router.post(
    '/',
    multerConfig.single('resume'),
    validateRequest(createCandidateSchema),
    (req, res, next) => controller.addCandidate(req, res, next)
  );

  return router;
}
```

**File**: `src/presentation/routes/index.ts`
```typescript
import { Router } from 'express';
import { createCandidateRoutes } from './candidate.routes';
import { CandidateController } from '../controllers/CandidateController';
import { AddCandidateUseCase } from '../../application/use-cases/AddCandidateUseCase';
import { PrismaCandidateRepository } from '../../infrastructure/repositories/PrismaCandidateRepository';
import { FileStorageService } from '../../infrastructure/storage/FileStorageService';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Dependency injection
const candidateRepository = new PrismaCandidateRepository(prisma);
const fileStorageService = new FileStorageService();
const addCandidateUseCase = new AddCandidateUseCase(candidateRepository, fileStorageService);
const candidateController = new CandidateController(addCandidateUseCase);

const router = Router();

router.use('/candidates', createCandidateRoutes(candidateController));

export default router;
```

#### Step 4.5: Update Main Entry Point

**File**: `src/index.ts`
```typescript
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import routes from './presentation/routes';
import { errorHandler } from './presentation/middlewares/errorHandler';

dotenv.config();

export const app = express();
const port = process.env.PORT || 3010;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/', (req, res) => {
  res.send('LTI - Talent Tracking System API');
});

app.use('/api', routes);

// Error handling
app.use(errorHandler);

// Start server
if (require.main === module) {
  app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
  });
}
```

---

## 🧪 Testing Strategy

### Test Coverage Requirements
- Domain Layer: 80%+
- Application Layer: 75%+
- Infrastructure Layer: 70%+
- Presentation Layer: 70%+
- Overall: 70%+

### Test Files to Create
1. `tests/domain/value-objects/*.test.ts`
2. `tests/domain/entities/*.test.ts`
3. `tests/application/use-cases/AddCandidateUseCase.test.ts`
4. `tests/infrastructure/repositories/PrismaCandidateRepository.test.ts`
5. `tests/presentation/controllers/CandidateController.test.ts`
6. `tests/integration/api/candidate.integration.test.ts`

### Integration Test Example
```typescript
import request from 'supertest';
import { app } from '../../../src/index';

describe('POST /api/candidates', () => {
  it('should create a candidate successfully', async () => {
    const response = await request(app)
      .post('/api/candidates')
      .field('firstName', 'John')
      .field('lastName', 'Doe')
      .field('email', 'john.doe@example.com')
      .field('phone', '+1234567890')
      .attach('resume', Buffer.from('test'), 'resume.pdf')
      .expect(201);

    expect(response.body.success).toBe(true);
    expect(response.body.data.email).toBe('john.doe@example.com');
  });
});
```

---

## ✅ Validation Checklist

### Architecture
- [ ] DDD layers properly separated
- [ ] Domain logic isolated from infrastructure
- [ ] Repository pattern implemented
- [ ] Use cases orchestrate business logic
- [ ] DTOs for data transfer
- [ ] Dependency injection used

### API Endpoint
- [ ] POST /api/candidates endpoint works
- [ ] Accepts multipart/form-data
- [ ] Returns 201 on success
- [ ] Returns proper error codes (400, 409, 500)

### Validation
- [ ] Required fields validated
- [ ] Email format validated
- [ ] Duplicate email rejected
- [ ] Phone format validated
- [ ] Date ranges validated
- [ ] File type validated
- [ ] File size validated

### File Upload
- [ ] Multer configured correctly
- [ ] Files saved to disk
- [ ] File metadata stored in database
- [ ] Only PDF and DOCX accepted
- [ ] Max 10MB enforced

### Error Handling
- [ ] Custom error classes created
- [ ] Global error handler implemented
- [ ] User-friendly error messages
- [ ] Proper HTTP status codes
- [ ] Error logging functional

### Testing
- [ ] Unit tests written for each layer
- [ ] Integration tests for API endpoint
- [ ] Test coverage above 70%
- [ ] All tests passing
- [ ] Edge cases covered

---

## 🚀 Next Steps

After completing this task:
1. ✅ Backend API is ready
2. ➡️ Proceed to [TASK-003: Frontend UI Implementation](TASK-003-frontend.md)

---

**Last Updated**: October 11, 2025  
**Status**: Ready to Implement  
**Estimated Time**: 16-20 hours
