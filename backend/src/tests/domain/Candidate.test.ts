import { Candidate } from '../../domain/entities/Candidate';

describe('Candidate Entity', () => {
  describe('Constructor', () => {
    it('should create a candidate with required fields', () => {
      const candidate = new Candidate({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com'
      });

      expect(candidate.firstName).toBe('John');
      expect(candidate.lastName).toBe('Doe');
      expect(candidate.fullName).toBe('John Doe');
      expect(candidate.email.getValue()).toBe('john.doe@example.com');
      expect(candidate.createdAt).toBeInstanceOf(Date);
      expect(candidate.updatedAt).toBeInstanceOf(Date);
    });

    it('should create a candidate with all fields', () => {
      const candidate = new Candidate({
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@example.com',
        phone: '+1234567890',
        address: '123 Main St',
        educations: [{
          institution: 'MIT',
          degree: 'Bachelor',
          startDate: new Date('2015-01-01')
        }],
        workExperiences: [{
          company: 'Tech Corp',
          position: 'Engineer',
          startDate: new Date('2019-01-01')
        }]
      });

      expect(candidate.phone?.getValue()).toBe('+1234567890');
      expect(candidate.address).toBe('123 Main St');
      expect(candidate.educations).toHaveLength(1);
      expect(candidate.workExperiences).toHaveLength(1);
    });

    it('should trim whitespace from names', () => {
      const candidate = new Candidate({
        firstName: '  John  ',
        lastName: '  Doe  ',
        email: 'john.doe@example.com'
      });

      expect(candidate.firstName).toBe('John');
      expect(candidate.lastName).toBe('Doe');
    });
  });

  describe('Validation', () => {
    it('should throw error if firstName is empty', () => {
      expect(() => new Candidate({
        firstName: '',
        lastName: 'Doe',
        email: 'test@example.com'
      })).toThrow('First name is required');
    });

    it('should throw error if firstName is too short', () => {
      expect(() => new Candidate({
        firstName: 'J',
        lastName: 'Doe',
        email: 'test@example.com'
      })).toThrow('First name must be at least 2 characters');
    });

    it('should throw error if lastName is empty', () => {
      expect(() => new Candidate({
        firstName: 'John',
        lastName: '',
        email: 'test@example.com'
      })).toThrow('Last name is required');
    });

    it('should throw error if lastName is too short', () => {
      expect(() => new Candidate({
        firstName: 'John',
        lastName: 'D',
        email: 'test@example.com'
      })).toThrow('Last name must be at least 2 characters');
    });

    it('should throw error if email is empty', () => {
      expect(() => new Candidate({
        firstName: 'John',
        lastName: 'Doe',
        email: ''
      })).toThrow('Email is required');
    });

    it('should throw error if email is invalid', () => {
      expect(() => new Candidate({
        firstName: 'John',
        lastName: 'Doe',
        email: 'invalid-email'
      })).toThrow('Invalid email address');
    });
  });

  describe('Business Logic', () => {
    let candidate: Candidate;

    beforeEach(() => {
      candidate = new Candidate({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com'
      });
    });

    it('should update personal info', () => {
      const oldUpdatedAt = candidate.updatedAt;
      
      // Wait a bit to ensure updatedAt changes
      setTimeout(() => {
        candidate.updatePersonalInfo('Jane', 'Smith', '+1234567890', '456 Elm St');
        
        expect(candidate.firstName).toBe('Jane');
        expect(candidate.lastName).toBe('Smith');
        expect(candidate.phone?.getValue()).toBe('+1234567890');
        expect(candidate.address).toBe('456 Elm St');
        expect(candidate.updatedAt.getTime()).toBeGreaterThan(oldUpdatedAt.getTime());
      }, 10);
    });

    it('should update email', () => {
      candidate.updateEmail('newemail@example.com');
      expect(candidate.email.getValue()).toBe('newemail@example.com');
    });

    it('should add education', () => {
      candidate.addEducation({
        institution: 'Harvard',
        degree: 'Master',
        startDate: new Date('2020-01-01')
      });

      expect(candidate.educations).toHaveLength(1);
      expect(candidate.educations[0].institution).toBe('Harvard');
    });

    it('should add work experience', () => {
      candidate.addWorkExperience({
        company: 'Google',
        position: 'Senior Engineer',
        startDate: new Date('2021-01-01')
      });

      expect(candidate.workExperiences).toHaveLength(1);
      expect(candidate.workExperiences[0].company).toBe('Google');
    });

    it('should attach resume', () => {
      candidate.attachResume({
        fileName: 'resume.pdf',
        filePath: '/uploads/resume.pdf',
        fileSize: 1000000,
        mimeType: 'application/pdf'
      });

      expect(candidate.hasResume()).toBe(true);
      expect(candidate.resume?.fileName).toBe('resume.pdf');
    });

    it('should remove resume', () => {
      candidate.attachResume({
        fileName: 'resume.pdf',
        filePath: '/uploads/resume.pdf',
        fileSize: 1000000,
        mimeType: 'application/pdf'
      });

      candidate.removeResume();
      expect(candidate.hasResume()).toBe(false);
    });
  });

  describe('Serialization', () => {
    it('should convert to JSON', () => {
      const candidate = new Candidate({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '+1234567890'
      });

      const json = candidate.toJSON();

      expect(json.firstName).toBe('John');
      expect(json.lastName).toBe('Doe');
      expect(json.fullName).toBe('John Doe');
      expect(json.email).toBe('john.doe@example.com');
      expect(json.phone).toBe('+1234567890');
      expect(json.createdAt).toBeInstanceOf(Date);
      expect(json.updatedAt).toBeInstanceOf(Date);
    });
  });
});
