/**
 * E2E Tests for GET /api/candidates endpoint
 * Tests pagination, search, and sorting functionality
 */

import request from 'supertest';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const API_URL = 'http://localhost:3010';

describe('GET /api/candidates - E2E Tests', () => {
  // Clean up test data before each test
  beforeEach(async () => {
    await prisma.candidate.deleteMany({
      where: {
        email: {
          contains: 'test-list-'
        }
      }
    });
  });

  // Clean up after all tests
  afterAll(async () => {
    await prisma.candidate.deleteMany({
      where: {
        email: {
          contains: 'test-list-'
        }
      }
    });
    await prisma.$disconnect();
  });

  describe('Basic Functionality', () => {
    it('should return empty list when no candidates exist', async () => {
      // Note: This test may fail if there's existing data in the database
      // It checks that we get a valid response structure
      const response = await request(API_URL)
        .get('/api/candidates?search=nonexistent-test-email-xyz')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual([]);
      expect(response.body.pagination.total).toBe(0);
    });

    it('should return list of candidates with default pagination', async () => {
      // Create test candidates
      await prisma.candidate.createMany({
        data: [
          {
            firstName: 'Alice',
            lastName: 'Johnson',
            email: 'test-list-alice@example.com',
            phone: '+1234567890'
          },
          {
            firstName: 'Bob',
            lastName: 'Smith',
            email: 'test-list-bob@example.com',
            phone: '+1234567891'
          }
        ]
      });

      const response = await request(API_URL)
        .get('/api/candidates')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBeGreaterThanOrEqual(2);
      expect(response.body.pagination.page).toBe(1);
      expect(response.body.pagination.limit).toBe(20);
      expect(response.body.pagination.total).toBeGreaterThanOrEqual(2);

      // Verify candidate structure
      const candidate = response.body.data.find((c: any) => c.email === 'test-list-alice@example.com');
      expect(candidate).toMatchObject({
        firstName: 'Alice',
        lastName: 'Johnson',
        email: 'test-list-alice@example.com',
        phone: '+1234567890',
        educationCount: 0,
        experienceCount: 0
      });
      expect(candidate.id).toBeDefined();
      expect(candidate.createdAt).toBeDefined();
    });

    it('should return candidate with education and experience counts', async () => {
      // Create candidate with education and experience
      const candidate = await prisma.candidate.create({
        data: {
          firstName: 'Charlie',
          lastName: 'Brown',
          email: 'test-list-charlie@example.com',
          educations: {
            create: [
              {
                institution: 'Test University',
                degree: 'Bachelor',
                fieldOfStudy: 'Computer Science',
                startDate: new Date('2015-09-01'),
                endDate: new Date('2019-06-01')
              }
            ]
          },
          workExperiences: {
            create: [
              {
                company: 'Tech Corp',
                position: 'Developer',
                startDate: new Date('2019-07-01'),
                endDate: new Date('2022-12-31')
              },
              {
                company: 'Software Inc',
                position: 'Senior Developer',
                startDate: new Date('2023-01-01'),
                endDate: null
              }
            ]
          }
        }
      });

      const response = await request(API_URL)
        .get('/api/candidates')
        .expect(200);

      const foundCandidate = response.body.data.find((c: any) => c.id === candidate.id);
      expect(foundCandidate).toMatchObject({
        firstName: 'Charlie',
        lastName: 'Brown',
        educationCount: 1,
        experienceCount: 2,
        currentPosition: 'Senior Developer' // Most recent experience
      });
    });
  });

  describe('Pagination', () => {
    beforeEach(async () => {
      // Create 25 test candidates for pagination tests
      const candidates = Array.from({ length: 25 }, (_, i) => ({
        firstName: `Test${i}`,
        lastName: `User${i}`,
        email: `test-list-user${i}@example.com`
      }));
      await prisma.candidate.createMany({ data: candidates });
    });

    it('should paginate results with custom page and limit', async () => {
      const response = await request(API_URL)
        .get('/api/candidates?page=2&limit=10')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBeLessThanOrEqual(10);
      expect(response.body.pagination.page).toBe(2);
      expect(response.body.pagination.limit).toBe(10);
      expect(response.body.pagination.total).toBeGreaterThanOrEqual(25);
      expect(response.body.pagination.totalPages).toBeGreaterThanOrEqual(3);
    });

    it('should respect maximum limit of 100', async () => {
      const response = await request(API_URL)
        .get('/api/candidates?limit=200')
        .expect(200);

      expect(response.body.pagination.limit).toBe(100);
    });

    it('should handle page beyond total pages', async () => {
      const response = await request(API_URL)
        .get('/api/candidates?page=999')
        .expect(200);

      expect(response.body.data).toEqual([]);
    });
  });

  describe('Search Functionality', () => {
    beforeEach(async () => {
      // Create candidates with specific names for searching
      await prisma.candidate.createMany({
        data: [
          { firstName: 'John', lastName: 'Doe', email: 'test-list-john.doe@example.com' },
          { firstName: 'Jane', lastName: 'Doe', email: 'test-list-jane.doe@example.com' },
          { firstName: 'John', lastName: 'Smith', email: 'test-list-john.smith@example.com' },
          { firstName: 'Alice', lastName: 'Johnson', email: 'test-list-alice@special.com' }
        ]
      });
    });

    it('should search by first name', async () => {
      const response = await request(API_URL)
        .get('/api/candidates?search=John')
        .expect(200);

      expect(response.body.success).toBe(true);
      
      // Filter only our test candidates
      const testCandidates = response.body.data.filter((c: any) => 
        c.email.includes('test-list-john')
      );
      
      expect(testCandidates.length).toBeGreaterThanOrEqual(2);
      testCandidates.forEach((c: any) => {
        expect(c.firstName.toLowerCase()).toContain('john');
      });
    });

    it('should search by last name', async () => {
      const response = await request(API_URL)
        .get('/api/candidates?search=Doe')
        .expect(200);

      expect(response.body.data.length).toBeGreaterThanOrEqual(2);
      const testCandidates = response.body.data.filter((c: any) => c.email.includes('test-list-'));
      testCandidates.forEach((c: any) => {
        expect(c.lastName.toLowerCase()).toContain('doe');
      });
    });

    it('should search by email', async () => {
      const response = await request(API_URL)
        .get('/api/candidates?search=special')
        .expect(200);

      expect(response.body.data.length).toBeGreaterThanOrEqual(1);
      const alice = response.body.data.find((c: any) => c.email === 'test-list-alice@special.com');
      expect(alice).toBeDefined();
      expect(alice.firstName).toBe('Alice');
    });

    it('should be case-insensitive', async () => {
      const response = await request(API_URL)
        .get('/api/candidates?search=JOHN')
        .expect(200);

      expect(response.body.data.length).toBeGreaterThanOrEqual(2);
    });

    it('should return empty array for no matches', async () => {
      const response = await request(API_URL)
        .get('/api/candidates?search=NonExistentName999')
        .expect(200);

      expect(response.body.data).toEqual([]);
      expect(response.body.pagination.total).toBe(0);
    });
  });

  describe('Sorting', () => {
    beforeEach(async () => {
      // Create candidates with known order
      await prisma.candidate.create({
        data: { firstName: 'Zoe', lastName: 'Adams', email: 'test-list-zoe@example.com' }
      });
      // Small delay to ensure different timestamps
      await new Promise(resolve => setTimeout(resolve, 10));
      await prisma.candidate.create({
        data: { firstName: 'Alice', lastName: 'Brown', email: 'test-list-alice-brown@example.com' }
      });
      await new Promise(resolve => setTimeout(resolve, 10));
      await prisma.candidate.create({
        data: { firstName: 'Bob', lastName: 'Carter', email: 'test-list-bob-carter@example.com' }
      });
    });

    it('should sort by createdAt desc by default', async () => {
      const response = await request(API_URL)
        .get('/api/candidates')
        .expect(200);

      const testCandidates = response.body.data
        .filter((c: any) => c.email.includes('test-list-'))
        .slice(0, 3);
      
      // Most recent should be first
      expect(testCandidates[0].firstName).toBe('Bob');
      expect(testCandidates[1].firstName).toBe('Alice');
      expect(testCandidates[2].firstName).toBe('Zoe');
    });

    it('should sort by firstName asc', async () => {
      const response = await request(API_URL)
        .get('/api/candidates?sortBy=firstName&sortOrder=asc')
        .expect(200);

      const testCandidates = response.body.data.filter((c: any) => 
        c.email.includes('test-list-') && 
        ['Alice', 'Bob', 'Zoe'].includes(c.firstName)
      );

      expect(testCandidates[0].firstName).toBe('Alice');
      expect(testCandidates[1].firstName).toBe('Bob');
      expect(testCandidates[2].firstName).toBe('Zoe');
    });

    it('should sort by lastName desc', async () => {
      const response = await request(API_URL)
        .get('/api/candidates?sortBy=lastName&sortOrder=desc')
        .expect(200);

      const testCandidates = response.body.data.filter((c: any) => 
        c.email.includes('test-list-') && 
        ['Adams', 'Brown', 'Carter'].includes(c.lastName)
      );

      expect(testCandidates[0].lastName).toBe('Carter');
      expect(testCandidates[1].lastName).toBe('Brown');
      expect(testCandidates[2].lastName).toBe('Adams');
    });
  });

  describe('Combined Filters', () => {
    beforeEach(async () => {
      // Create 30 test candidates with varying names
      const candidates = Array.from({ length: 30 }, (_, i) => ({
        firstName: i % 2 === 0 ? 'John' : 'Jane',
        lastName: `Test${i}`,
        email: `test-list-combined${i}@example.com`
      }));
      await prisma.candidate.createMany({ data: candidates });
    });

    it('should combine search with pagination', async () => {
      const response = await request(API_URL)
        .get('/api/candidates?search=John&page=1&limit=5')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBeLessThanOrEqual(5);
      expect(response.body.pagination.page).toBe(1);
      expect(response.body.pagination.limit).toBe(5);
      response.body.data.forEach((c: any) => {
        if (c.email.includes('test-list-combined')) {
          expect(c.firstName).toBe('John');
        }
      });
    });

    it('should combine search with sorting', async () => {
      const response = await request(API_URL)
        .get('/api/candidates?search=test-list-combined&sortBy=lastName&sortOrder=asc&limit=10')
        .expect(200);

      const testCandidates = response.body.data.filter((c: any) => 
        c.email.includes('test-list-combined')
      );

      // Verify ascending order
      for (let i = 0; i < testCandidates.length - 1; i++) {
        expect(testCandidates[i].lastName <= testCandidates[i + 1].lastName).toBe(true);
      }
    });
  });

  describe('Error Handling', () => {
    it('should use defaults for invalid page number', async () => {
      const response = await request(API_URL)
        .get('/api/candidates?page=0')
        .expect(200); // Controller filters invalid values and uses defaults

      expect(response.body.success).toBe(true);
      expect(response.body.pagination.page).toBe(1); // Default page
    });

    it('should use defaults for invalid limit', async () => {
      const response = await request(API_URL)
        .get('/api/candidates?limit=0')
        .expect(200); // Controller filters invalid values and uses defaults

      expect(response.body.success).toBe(true);
      expect(response.body.pagination.limit).toBe(20); // Default limit
    });

    it('should handle non-numeric pagination parameters', async () => {
      const response = await request(API_URL)
        .get('/api/candidates?page=abc&limit=xyz')
        .expect(200); // Should use defaults

      expect(response.body.success).toBe(true);
      expect(response.body.pagination.page).toBe(1);
      expect(response.body.pagination.limit).toBe(20);
    });
  });
});
