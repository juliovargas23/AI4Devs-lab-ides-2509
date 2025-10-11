import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('Candidate Database Model', () => {
  beforeAll(async () => {
    // Connect to database
    await prisma.$connect();
  });

  afterAll(async () => {
    // Cleanup test data
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
      expect(candidate.lastName).toBe('Doe');
      expect(candidate.email).toBe('john.doe@example.com');
      expect(candidate.createdAt).toBeDefined();
      expect(candidate.updatedAt).toBeDefined();
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
      expect(candidate.educations[0].degree).toBe('Bachelor of Science');
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
      expect(candidate.workExperiences[0].company).toBe('Tech Corp');
      expect(candidate.workExperiences[0].endDate).toBeNull();
    });

    it('should create candidate with resume', async () => {
      const candidate = await prisma.candidate.create({
        data: {
          firstName: 'Test',
          lastName: 'Resume',
          email: 'test.resume@example.com',
          resume: {
            create: {
              fileName: 'resume.pdf',
              filePath: '/uploads/resume.pdf',
              fileSize: 1048576,
              mimeType: 'application/pdf'
            }
          }
        },
        include: { resume: true }
      });

      expect(candidate.resume).toBeDefined();
      expect(candidate.resume?.fileName).toBe('resume.pdf');
      expect(candidate.resume?.mimeType).toBe('application/pdf');
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
        },
        include: { educations: true }
      });

      const educationId = candidate.educations[0].id;

      // Delete candidate
      await prisma.candidate.delete({
        where: { id: candidate.id }
      });

      // Check that education was also deleted
      const education = await prisma.education.findUnique({
        where: { id: educationId }
      });

      expect(education).toBeNull();
    });

    it('should cascade delete all related records when candidate is deleted', async () => {
      const candidate = await prisma.candidate.create({
        data: {
          firstName: 'Full',
          lastName: 'Delete',
          email: 'full.delete@example.com',
          educations: {
            create: {
              institution: 'Test University',
              degree: 'Bachelor',
              startDate: new Date()
            }
          },
          workExperiences: {
            create: {
              company: 'Test Corp',
              position: 'Engineer',
              startDate: new Date()
            }
          },
          resume: {
            create: {
              fileName: 'test.pdf',
              filePath: '/test.pdf',
              fileSize: 1000,
              mimeType: 'application/pdf'
            }
          }
        },
        include: {
          educations: true,
          workExperiences: true,
          resume: true
        }
      });

      const educationId = candidate.educations[0].id;
      const workExpId = candidate.workExperiences[0].id;
      const resumeId = candidate.resume?.id;

      // Delete candidate
      await prisma.candidate.delete({
        where: { id: candidate.id }
      });

      // Verify all related records were deleted
      const education = await prisma.education.findUnique({ where: { id: educationId } });
      const workExp = await prisma.workExperience.findUnique({ where: { id: workExpId } });
      const resume = await prisma.resume.findUnique({ where: { id: resumeId! } });

      expect(education).toBeNull();
      expect(workExp).toBeNull();
      expect(resume).toBeNull();
    });
  });

  describe('Data Validation', () => {
    it('should allow multiple education entries for one candidate', async () => {
      const candidate = await prisma.candidate.create({
        data: {
          firstName: 'Multi',
          lastName: 'Education',
          email: 'multi.education@example.com',
          educations: {
            create: [
              {
                institution: 'University 1',
                degree: 'Bachelor',
                startDate: new Date('2010-01-01')
              },
              {
                institution: 'University 2',
                degree: 'Master',
                startDate: new Date('2014-01-01')
              }
            ]
          }
        },
        include: { educations: true }
      });

      expect(candidate.educations).toHaveLength(2);
    });

    it('should allow optional fields to be null', async () => {
      const candidate = await prisma.candidate.create({
        data: {
          firstName: 'Minimal',
          lastName: 'Data',
          email: 'minimal@example.com'
        }
      });

      expect(candidate.phone).toBeNull();
      expect(candidate.address).toBeNull();
    });

    it('should enforce one-to-one relationship for resume', async () => {
      const candidate = await prisma.candidate.create({
        data: {
          firstName: 'Resume',
          lastName: 'Test',
          email: 'resume.unique@example.com',
          resume: {
            create: {
              fileName: 'resume1.pdf',
              filePath: '/resume1.pdf',
              fileSize: 1000,
              mimeType: 'application/pdf'
            }
          }
        }
      });

      // Attempting to create another resume for the same candidate should fail
      await expect(
        prisma.resume.create({
          data: {
            candidateId: candidate.id,
            fileName: 'resume2.pdf',
            filePath: '/resume2.pdf',
            fileSize: 1000,
            mimeType: 'application/pdf'
          }
        })
      ).rejects.toThrow();
    });
  });
});
