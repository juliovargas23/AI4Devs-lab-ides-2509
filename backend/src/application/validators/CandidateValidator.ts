import { CreateCandidateDTO, CreateEducationDTO, CreateWorkExperienceDTO } from '../dtos/CandidateDTO';

export class ValidationError extends Error {
  constructor(
    message: string,
    public readonly field: string
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class CandidateValidator {
  static validateCreateCandidate(dto: CreateCandidateDTO): void {
    // Validate first name
    if (!dto.firstName || dto.firstName.trim().length === 0) {
      throw new ValidationError('First name is required', 'firstName');
    }
    if (dto.firstName.trim().length < 2) {
      throw new ValidationError('First name must be at least 2 characters', 'firstName');
    }
    if (dto.firstName.trim().length > 100) {
      throw new ValidationError('First name must not exceed 100 characters', 'firstName');
    }

    // Validate last name
    if (!dto.lastName || dto.lastName.trim().length === 0) {
      throw new ValidationError('Last name is required', 'lastName');
    }
    if (dto.lastName.trim().length < 2) {
      throw new ValidationError('Last name must be at least 2 characters', 'lastName');
    }
    if (dto.lastName.trim().length > 100) {
      throw new ValidationError('Last name must not exceed 100 characters', 'lastName');
    }

    // Validate email
    if (!dto.email || dto.email.trim().length === 0) {
      throw new ValidationError('Email is required', 'email');
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(dto.email)) {
      throw new ValidationError('Invalid email format', 'email');
    }

    // Validate phone (optional)
    if (dto.phone) {
      const phoneRegex = /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/;
      if (!phoneRegex.test(dto.phone.trim())) {
        throw new ValidationError('Invalid phone number format', 'phone');
      }
    }

    // Validate address (optional)
    if (dto.address && dto.address.trim().length > 500) {
      throw new ValidationError('Address must not exceed 500 characters', 'address');
    }

    // Validate educations
    if (dto.educations) {
      dto.educations.forEach((education, index) => {
        try {
          this.validateEducation(education);
        } catch (error) {
          if (error instanceof ValidationError) {
            throw new ValidationError(
              `Education ${index + 1}: ${error.message}`,
              `educations[${index}].${error.field}`
            );
          }
          throw error;
        }
      });
    }

    // Validate work experiences
    if (dto.workExperiences) {
      dto.workExperiences.forEach((experience, index) => {
        try {
          this.validateWorkExperience(experience);
        } catch (error) {
          if (error instanceof ValidationError) {
            throw new ValidationError(
              `Work Experience ${index + 1}: ${error.message}`,
              `workExperiences[${index}].${error.field}`
            );
          }
          throw error;
        }
      });
    }
  }

  private static validateEducation(education: CreateEducationDTO): void {
    if (!education.institution || education.institution.trim().length === 0) {
      throw new ValidationError('Institution is required', 'institution');
    }
    if (education.institution.trim().length > 200) {
      throw new ValidationError('Institution name must not exceed 200 characters', 'institution');
    }

    if (!education.degree || education.degree.trim().length === 0) {
      throw new ValidationError('Degree is required', 'degree');
    }
    if (education.degree.trim().length > 100) {
      throw new ValidationError('Degree must not exceed 100 characters', 'degree');
    }

    if (education.fieldOfStudy && education.fieldOfStudy.trim().length > 100) {
      throw new ValidationError('Field of study must not exceed 100 characters', 'fieldOfStudy');
    }

    if (!education.startDate) {
      throw new ValidationError('Start date is required', 'startDate');
    }
    
    const startDate = new Date(education.startDate);
    if (isNaN(startDate.getTime())) {
      throw new ValidationError('Invalid start date format', 'startDate');
    }

    if (education.endDate) {
      const endDate = new Date(education.endDate);
      if (isNaN(endDate.getTime())) {
        throw new ValidationError('Invalid end date format', 'endDate');
      }
      if (endDate < startDate) {
        throw new ValidationError('End date cannot be before start date', 'endDate');
      }
    }

    if (education.description && education.description.trim().length > 1000) {
      throw new ValidationError('Description must not exceed 1000 characters', 'description');
    }
  }

  private static validateWorkExperience(experience: CreateWorkExperienceDTO): void {
    if (!experience.company || experience.company.trim().length === 0) {
      throw new ValidationError('Company is required', 'company');
    }
    if (experience.company.trim().length > 200) {
      throw new ValidationError('Company name must not exceed 200 characters', 'company');
    }

    if (!experience.position || experience.position.trim().length === 0) {
      throw new ValidationError('Position is required', 'position');
    }
    if (experience.position.trim().length > 100) {
      throw new ValidationError('Position must not exceed 100 characters', 'position');
    }

    if (!experience.startDate) {
      throw new ValidationError('Start date is required', 'startDate');
    }

    const startDate = new Date(experience.startDate);
    if (isNaN(startDate.getTime())) {
      throw new ValidationError('Invalid start date format', 'startDate');
    }

    if (experience.endDate) {
      const endDate = new Date(experience.endDate);
      if (isNaN(endDate.getTime())) {
        throw new ValidationError('Invalid end date format', 'endDate');
      }
      if (endDate < startDate) {
        throw new ValidationError('End date cannot be before start date', 'endDate');
      }
    }

    if (experience.description && experience.description.trim().length > 2000) {
      throw new ValidationError('Description must not exceed 2000 characters', 'description');
    }
  }

  static validateFileUpload(file: Express.Multer.File): void {
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    const ALLOWED_MIME_TYPES = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (!file) {
      throw new ValidationError('Resume file is required', 'file');
    }

    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      throw new ValidationError(
        'Invalid file type. Only PDF and Word documents are allowed',
        'file'
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      throw new ValidationError(
        `File size exceeds maximum allowed size of ${MAX_FILE_SIZE / 1024 / 1024}MB`,
        'file'
      );
    }
  }
}
