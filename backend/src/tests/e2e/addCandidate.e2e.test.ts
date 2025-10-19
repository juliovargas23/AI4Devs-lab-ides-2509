import request from 'supertest';
import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs';

const prisma = new PrismaClient();
const API_URL = 'http://localhost:3010';

describe('Add Candidate E2E Tests', () => {
  beforeAll(async () => {
    // Ensure database connection is ready
    await prisma.$connect();
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.resume.deleteMany({});
    await prisma.workExperience.deleteMany({});
    await prisma.education.deleteMany({});
    await prisma.candidate.deleteMany({
      where: {
        email: {
          contains: 'e2e.test'
        }
      }
    });
    await prisma.$disconnect();
  });

  afterEach(async () => {
    // Clean up after each test
    await prisma.resume.deleteMany({
      where: {
        candidate: {
          email: {
            contains: 'e2e.test'
          }
        }
      }
    });
    await prisma.workExperience.deleteMany({
      where: {
        candidate: {
          email: {
            contains: 'e2e.test'
          }
        }
      }
    });
    await prisma.education.deleteMany({
      where: {
        candidate: {
          email: {
            contains: 'e2e.test'
          }
        }
      }
    });
    await prisma.candidate.deleteMany({
      where: {
        email: {
          contains: 'e2e.test'
        }
      }
    });
  });

  describe('Happy Path Scenarios', () => {
    it('should create a candidate with all fields', async () => {
      const response = await request(API_URL)
        .post('/api/candidates')
        .field('firstName', 'John')
        .field('lastName', 'Doe')
        .field('email', 'john.doe.e2e.test@example.com')
        .field('phone', '+1234567890')
        .field('address', '123 Main St, New York, NY 10001')
        .field('educations', JSON.stringify([
          {
            institution: 'MIT',
            degree: 'Bachelor of Science',
            fieldOfStudy: 'Computer Science',
            startDate: '2015-09-01',
            endDate: '2019-06-01',
            description: 'Focus on AI and Machine Learning'
          }
        ]))
        .field('workExperiences', JSON.stringify([
          {
            company: 'Tech Corp',
            position: 'Software Engineer',
            description: 'Full-stack development',
            startDate: '2019-07-01',
            endDate: null
          }
        ]));

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.firstName).toBe('John');
      expect(response.body.data.lastName).toBe('Doe');
      expect(response.body.data.email).toBe('john.doe.e2e.test@example.com');

      // Verify in database
      const candidate = await prisma.candidate.findUnique({
        where: { email: 'john.doe.e2e.test@example.com' },
        include: {
          educations: true,
          workExperiences: true
        }
      });

      expect(candidate).not.toBeNull();
      expect(candidate!.educations).toHaveLength(1);
      expect(candidate!.workExperiences).toHaveLength(1);
    });

    it('should create a candidate with only required fields', async () => {
      const response = await request(API_URL)
        .post('/api/candidates')
        .field('firstName', 'Jane')
        .field('lastName', 'Smith')
        .field('email', 'jane.smith.e2e.test@example.com');

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.firstName).toBe('Jane');
      expect(response.body.data.lastName).toBe('Smith');

      // Verify in database
      const candidate = await prisma.candidate.findUnique({
        where: { email: 'jane.smith.e2e.test@example.com' }
      });

      expect(candidate).not.toBeNull();
      expect(candidate!.phone).toBeNull();
      expect(candidate!.address).toBeNull();
    });
  });

  describe('Validation Error Scenarios', () => {
    it('should reject candidate with missing firstName', async () => {
      const response = await request(API_URL)
        .post('/api/candidates')
        .field('lastName', 'Doe')
        .field('email', 'missing.firstname.e2e.test@example.com');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });

    it('should reject candidate with missing lastName', async () => {
      const response = await request(API_URL)
        .post('/api/candidates')
        .field('firstName', 'John')
        .field('email', 'missing.lastname.e2e.test@example.com');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should reject candidate with missing email', async () => {
      const response = await request(API_URL)
        .post('/api/candidates')
        .field('firstName', 'John')
        .field('lastName', 'Doe');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should reject candidate with invalid email format', async () => {
      const response = await request(API_URL)
        .post('/api/candidates')
        .field('firstName', 'John')
        .field('lastName', 'Doe')
        .field('email', 'invalid-email');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should reject duplicate email', async () => {
      const email = 'duplicate.e2e.test@example.com';

      // Create first candidate
      await request(API_URL)
        .post('/api/candidates')
        .field('firstName', 'First')
        .field('lastName', 'Candidate')
        .field('email', email);

      // Try to create second candidate with same email
      const response = await request(API_URL)
        .post('/api/candidates')
        .field('firstName', 'Second')
        .field('lastName', 'Candidate')
        .field('email', email);

      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
    });

    it('should reject invalid phone format', async () => {
      const response = await request(API_URL)
        .post('/api/candidates')
        .field('firstName', 'John')
        .field('lastName', 'Doe')
        .field('email', 'invalid.phone.e2e.test@example.com')
        .field('phone', 'invalid-phone');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('Edge Case Scenarios', () => {
    it('should handle special characters in text fields', async () => {
      const response = await request(API_URL)
        .post('/api/candidates')
        .field('firstName', "O'Brien")
        .field('lastName', 'Smith-Jones')
        .field('email', 'special.chars.e2e.test@example.com')
        .field('address', '123 Main St, Apt #456');

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.firstName).toBe("O'Brien");
    });

    it('should handle multiple education entries', async () => {
      const response = await request(API_URL)
        .post('/api/candidates')
        .field('firstName', 'Multi')
        .field('lastName', 'Education')
        .field('email', 'multi.education.e2e.test@example.com')
        .field('educations', JSON.stringify([
          {
            institution: 'University A',
            degree: 'Bachelor',
            fieldOfStudy: 'CS',
            startDate: '2010-09-01',
            endDate: '2014-06-01'
          },
          {
            institution: 'University B',
            degree: 'Master',
            fieldOfStudy: 'AI',
            startDate: '2014-09-01',
            endDate: '2016-06-01'
          }
        ]));

      expect(response.status).toBe(201);

      const candidate = await prisma.candidate.findUnique({
        where: { email: 'multi.education.e2e.test@example.com' },
        include: { educations: true }
      });

      expect(candidate!.educations).toHaveLength(2);
    });

    it('should handle multiple work experience entries', async () => {
      const response = await request(API_URL)
        .post('/api/candidates')
        .field('firstName', 'Multi')
        .field('lastName', 'Experience')
        .field('email', 'multi.experience.e2e.test@example.com')
        .field('workExperiences', JSON.stringify([
          {
            company: 'Company A',
            position: 'Junior Dev',
            startDate: '2015-01-01',
            endDate: '2017-12-31'
          },
          {
            company: 'Company B',
            position: 'Senior Dev',
            startDate: '2018-01-01',
            endDate: null
          }
        ]));

      expect(response.status).toBe(201);

      const candidate = await prisma.candidate.findUnique({
        where: { email: 'multi.experience.e2e.test@example.com' },
        include: { workExperiences: true }
      });

      expect(candidate!.workExperiences).toHaveLength(2);
    });

    it('should handle long text in description fields', async () => {
      const longDescription = 'A'.repeat(1000);

      const response = await request(API_URL)
        .post('/api/candidates')
        .field('firstName', 'Long')
        .field('lastName', 'Text')
        .field('email', 'long.text.e2e.test@example.com')
        .field('educations', JSON.stringify([
          {
            institution: 'University',
            degree: 'Bachelor',
            fieldOfStudy: 'CS',
            startDate: '2010-09-01',
            endDate: '2014-06-01',
            description: longDescription
          }
        ]));

      expect(response.status).toBe(201);
    });

    it('should reject firstName that is too short', async () => {
      const response = await request(API_URL)
        .post('/api/candidates')
        .field('firstName', 'A')
        .field('lastName', 'Doe')
        .field('email', 'short.name.e2e.test@example.com');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('Database Integrity Tests', () => {
    it('should maintain referential integrity with cascade delete', async () => {
      // Create candidate with related data
      const response = await request(API_URL)
        .post('/api/candidates')
        .field('firstName', 'Cascade')
        .field('lastName', 'Test')
        .field('email', 'cascade.e2e.test@example.com')
        .field('educations', JSON.stringify([
          {
            institution: 'University',
            degree: 'Bachelor',
            fieldOfStudy: 'CS',
            startDate: '2010-09-01',
            endDate: '2014-06-01'
          }
        ]));

      expect(response.status).toBe(201);
      const candidateId = response.body.data.id;

      // Verify related data exists
      const educationsBefore = await prisma.education.findMany({
        where: { candidateId }
      });
      expect(educationsBefore.length).toBeGreaterThan(0);

      // Delete candidate
      await prisma.candidate.delete({
        where: { id: candidateId }
      });

      // Verify related data was cascade deleted
      const educationsAfter = await prisma.education.findMany({
        where: { candidateId }
      });
      expect(educationsAfter).toHaveLength(0);
    });

    it('should retrieve candidate with all relationships', async () => {
      // Create candidate
      await request(API_URL)
        .post('/api/candidates')
        .field('firstName', 'Retrieve')
        .field('lastName', 'Test')
        .field('email', 'retrieve.e2e.test@example.com')
        .field('educations', JSON.stringify([
          {
            institution: 'MIT',
            degree: 'BS',
            fieldOfStudy: 'CS',
            startDate: '2015-09-01',
            endDate: '2019-06-01'
          }
        ]))
        .field('workExperiences', JSON.stringify([
          {
            company: 'TechCorp',
            position: 'Developer',
            startDate: '2019-07-01',
            endDate: null
          }
        ]));

      // Retrieve with relationships
      const candidate = await prisma.candidate.findUnique({
        where: { email: 'retrieve.e2e.test@example.com' },
        include: {
          educations: true,
          workExperiences: true
        }
      });

      expect(candidate).not.toBeNull();
      expect(`${candidate!.firstName} ${candidate!.lastName}`).toBe('Retrieve Test');
      expect(candidate!.educations).toHaveLength(1);
      expect(candidate!.workExperiences).toHaveLength(1);
    });
  });

  describe('Performance Tests', () => {
    it('should handle concurrent requests', async () => {
      const requests = Array.from({ length: 5 }, (_, i) =>
        request(API_URL)
          .post('/api/candidates')
          .field('firstName', `Concurrent${i}`)
          .field('lastName', 'Test')
          .field('email', `concurrent${i}.e2e.test@example.com`)
      );

      const responses = await Promise.all(requests);

      responses.forEach(response => {
        expect(response.status).toBe(201);
        expect(response.body.success).toBe(true);
      });

      // Verify all candidates were created
      const count = await prisma.candidate.count({
        where: {
          email: {
            startsWith: 'concurrent',
            endsWith: '.e2e.test@example.com'
          }
        }
      });

      expect(count).toBe(5);
    });
  });
});
