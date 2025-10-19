/**
 * Integration E2E test for complete candidate flow
 * Tests the full workflow: add candidate -> list candidates -> navigation
 */

import request from 'supertest';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const API_URL = 'http://localhost:3010';

describe('Complete Candidate Flow - E2E Integration', () => {
  let testCandidateId: string;
  const testEmail = `integration-test-${Date.now()}@example.com`;

  // Clean up after tests
  afterAll(async () => {
    if (testCandidateId) {
      await prisma.candidate.delete({
        where: { id: testCandidateId }
      }).catch(() => {});
    }
    await prisma.$disconnect();
  });

  it('should complete full candidate workflow', async () => {
    // Step 1: Add a new candidate via POST
    const addResponse = await request(API_URL)
      .post('/api/candidates')
      .field('firstName', 'Integration')
      .field('lastName', 'Test')
      .field('email', testEmail)
      .field('phone', '+1234567890')
      .field('address', '123 Test St')
      .expect(201);

    expect(addResponse.body.success).toBe(true);
    expect(addResponse.body.data.id).toBeDefined();
    testCandidateId = addResponse.body.data.id;

    // Step 2: Verify candidate appears in list via GET
    const listResponse = await request(API_URL)
      .get('/api/candidates?page=1&limit=20')
      .expect(200);

    expect(listResponse.body.success).toBe(true);
    expect(listResponse.body.data).toBeInstanceOf(Array);
    expect(listResponse.body.pagination).toBeDefined();

    // Step 3: Search for the specific candidate
    const searchResponse = await request(API_URL)
      .get(`/api/candidates?search=${testEmail}`)
      .expect(200);

    expect(searchResponse.body.success).toBe(true);
    expect(searchResponse.body.data.length).toBe(1);
    
    const foundCandidate = searchResponse.body.data[0];
    expect(foundCandidate.id).toBe(testCandidateId);
    expect(foundCandidate.firstName).toBe('Integration');
    expect(foundCandidate.lastName).toBe('Test');
    expect(foundCandidate.email).toBe(testEmail);
    expect(foundCandidate.phone).toBe('+1234567890');
    expect(foundCandidate.educationCount).toBe(0);
    expect(foundCandidate.experienceCount).toBe(0);

    // Step 4: Verify pagination works
    const paginatedResponse = await request(API_URL)
      .get('/api/candidates?page=1&limit=1')
      .expect(200);

    expect(paginatedResponse.body.pagination.limit).toBe(1);
    expect(paginatedResponse.body.pagination.page).toBe(1);
    expect(paginatedResponse.body.data.length).toBeLessThanOrEqual(1);
  });

  it('should handle empty search results gracefully', async () => {
    const response = await request(API_URL)
      .get('/api/candidates?search=nonexistent-xyz-abc-123')
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data).toEqual([]);
    expect(response.body.pagination.total).toBe(0);
  });

  it('should return candidates sorted by most recent first', async () => {
    const response = await request(API_URL)
      .get('/api/candidates?sortBy=createdAt&sortOrder=desc')
      .expect(200);

    expect(response.body.success).toBe(true);
    
    if (response.body.data.length >= 2) {
      const dates = response.body.data.map((c: any) => new Date(c.createdAt).getTime());
      for (let i = 0; i < dates.length - 1; i++) {
        expect(dates[i]).toBeGreaterThanOrEqual(dates[i + 1]);
      }
    }
  });
});
