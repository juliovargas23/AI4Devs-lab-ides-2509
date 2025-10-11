import request from 'supertest';
import { app } from '../../index';
import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs';

const prisma = new PrismaClient();

describe('POST /api/candidates', () => {
  beforeAll(async () => {
    await prisma.$connect();
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.resume.deleteMany({});
    await prisma.workExperience.deleteMany({});
    await prisma.education.deleteMany({});
    await prisma.candidate.deleteMany({});
    await prisma.$disconnect();
  });

  afterEach(async () => {
    // Clean up after each test
    await prisma.resume.deleteMany({});
    await prisma.workExperience.deleteMany({});
    await prisma.education.deleteMany({});
    await prisma.candidate.deleteMany({});
  });

  describe('Success Cases', () => {
    it('should create a candidate with required fields only', async () => {
      const response = await request(app)
        .post('/api/candidates')
        .field('firstName', 'John')
        .field('lastName', 'Doe')
        .field('email', 'john.doe@example.com');

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toMatchObject({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        fullName: 'John Doe'
      });
      expect(response.body.data.id).toBeDefined();
      expect(response.body.data.createdAt).toBeDefined();
    });

    it('should create a candidate with all fields', async () => {
      const educations = JSON.stringify([
        {
          institution: 'MIT',
          degree: 'Bachelor of Science',
          fieldOfStudy: 'Computer Science',
          startDate: '2015-09-01',
          endDate: '2019-06-01',
          description: 'Focus on AI and Machine Learning'
        }
      ]);

      const workExperiences = JSON.stringify([
        {
          company: 'Google',
          position: 'Software Engineer',
          description: 'Worked on search algorithms',
          startDate: '2019-07-01',
          endDate: '2021-12-31'
        }
      ]);

      const response = await request(app)
        .post('/api/candidates')
        .field('firstName', 'Jane')
        .field('lastName', 'Smith')
        .field('email', 'jane.smith@example.com')
        .field('phone', '+1234567890')
        .field('address', '123 Main St, Boston, MA')
        .field('educations', educations)
        .field('workExperiences', workExperiences);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toMatchObject({
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@example.com',
        phone: '+1234567890',
        address: '123 Main St, Boston, MA'
      });
      expect(response.body.data.educations).toHaveLength(1);
      expect(response.body.data.educations[0]).toMatchObject({
        institution: 'MIT',
        degree: 'Bachelor of Science',
        fieldOfStudy: 'Computer Science'
      });
      expect(response.body.data.workExperiences).toHaveLength(1);
      expect(response.body.data.workExperiences[0]).toMatchObject({
        company: 'Google',
        position: 'Software Engineer'
      });
    });

    it('should create a candidate with a resume file', async () => {
      // Create a temporary test PDF file
      const testFilePath = path.join(__dirname, 'test-resume.pdf');
      fs.writeFileSync(testFilePath, 'This is a test PDF content');

      try {
        const response = await request(app)
          .post('/api/candidates')
          .field('firstName', 'Bob')
          .field('lastName', 'Johnson')
          .field('email', 'bob.johnson@example.com')
          .attach('resume', testFilePath);

        expect(response.status).toBe(201);
        expect(response.body.success).toBe(true);
        expect(response.body.data.resume).toBeDefined();
        expect(response.body.data.resume.fileName).toContain('test-resume');
      } finally {
        // Clean up test file
        if (fs.existsSync(testFilePath)) {
          fs.unlinkSync(testFilePath);
        }
      }
    });
  });

  describe('Validation Errors', () => {
    it('should return 400 if firstName is missing', async () => {
      const response = await request(app)
        .post('/api/candidates')
        .field('lastName', 'Doe')
        .field('email', 'test@example.com');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.type).toBe('ValidationError');
      expect(response.body.error.field).toBe('firstName');
    });

    it('should return 400 if lastName is missing', async () => {
      const response = await request(app)
        .post('/api/candidates')
        .field('firstName', 'John')
        .field('email', 'test@example.com');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.type).toBe('ValidationError');
      expect(response.body.error.field).toBe('lastName');
    });

    it('should return 400 if email is missing', async () => {
      const response = await request(app)
        .post('/api/candidates')
        .field('firstName', 'John')
        .field('lastName', 'Doe');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.type).toBe('ValidationError');
      expect(response.body.error.field).toBe('email');
    });

    it('should return 400 if email format is invalid', async () => {
      const response = await request(app)
        .post('/api/candidates')
        .field('firstName', 'John')
        .field('lastName', 'Doe')
        .field('email', 'invalid-email');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.type).toBe('ValidationError');
      expect(response.body.error.field).toBe('email');
    });

    it('should return 400 if firstName is too short', async () => {
      const response = await request(app)
        .post('/api/candidates')
        .field('firstName', 'J')
        .field('lastName', 'Doe')
        .field('email', 'test@example.com');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.type).toBe('ValidationError');
    });
  });

  describe('Duplicate Email', () => {
    it('should return 409 if email already exists', async () => {
      // Create first candidate
      await request(app)
        .post('/api/candidates')
        .field('firstName', 'John')
        .field('lastName', 'Doe')
        .field('email', 'duplicate@example.com');

      // Try to create another candidate with same email
      const response = await request(app)
        .post('/api/candidates')
        .field('firstName', 'Jane')
        .field('lastName', 'Smith')
        .field('email', 'duplicate@example.com');

      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
      expect(response.body.error.type).toBe('DuplicateEmailError');
    });
  });

  describe('Education Validation', () => {
    it('should return 400 if education has invalid dates', async () => {
      const educations = JSON.stringify([
        {
          institution: 'MIT',
          degree: 'Bachelor',
          startDate: '2020-01-01',
          endDate: '2019-01-01' // End date before start date
        }
      ]);

      const response = await request(app)
        .post('/api/candidates')
        .field('firstName', 'John')
        .field('lastName', 'Doe')
        .field('email', 'test@example.com')
        .field('educations', educations);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.type).toBe('ValidationError');
    });
  });

  describe('Work Experience Validation', () => {
    it('should return 400 if work experience has invalid dates', async () => {
      const workExperiences = JSON.stringify([
        {
          company: 'Google',
          position: 'Engineer',
          startDate: '2020-01-01',
          endDate: '2019-01-01' // End date before start date
        }
      ]);

      const response = await request(app)
        .post('/api/candidates')
        .field('firstName', 'John')
        .field('lastName', 'Doe')
        .field('email', 'test@example.com')
        .field('workExperiences', workExperiences);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.type).toBe('ValidationError');
    });
  });
});
