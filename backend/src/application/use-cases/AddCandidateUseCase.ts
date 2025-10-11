import { Candidate } from '../../domain/entities/Candidate';
import { ICandidateRepository } from '../../domain/repositories/ICandidateRepository';
import { CreateCandidateDTO, CandidateResponseDTO } from '../dtos/CandidateDTO';
import { CandidateValidator } from '../validators/CandidateValidator';
import { Resume } from '../../domain/value-objects/Resume';

export class DuplicateEmailError extends Error {
  constructor(email: string) {
    super(`A candidate with email ${email} already exists`);
    this.name = 'DuplicateEmailError';
  }
}

export class AddCandidateUseCase {
  constructor(
    private readonly candidateRepository: ICandidateRepository
  ) {}

  async execute(
    dto: CreateCandidateDTO,
    resumeFile?: Express.Multer.File
  ): Promise<CandidateResponseDTO> {
    // Validate input
    CandidateValidator.validateCreateCandidate(dto);
    
    if (resumeFile) {
      CandidateValidator.validateFileUpload(resumeFile);
    }

    // Check for duplicate email
    const existingCandidate = await this.candidateRepository.findByEmail(dto.email);
    if (existingCandidate) {
      throw new DuplicateEmailError(dto.email);
    }

    // Create candidate entity
    const candidate = new Candidate({
      firstName: dto.firstName,
      lastName: dto.lastName,
      email: dto.email,
      phone: dto.phone,
      address: dto.address,
      educations: dto.educations?.map(edu => ({
        institution: edu.institution,
        degree: edu.degree,
        fieldOfStudy: edu.fieldOfStudy,
        startDate: new Date(edu.startDate),
        endDate: edu.endDate ? new Date(edu.endDate) : undefined,
        description: edu.description
      })),
      workExperiences: dto.workExperiences?.map(exp => ({
        company: exp.company,
        position: exp.position,
        description: exp.description,
        startDate: new Date(exp.startDate),
        endDate: exp.endDate ? new Date(exp.endDate) : undefined
      })),
      resume: resumeFile ? {
        fileName: resumeFile.originalname,
        filePath: resumeFile.path,
        fileSize: resumeFile.size,
        mimeType: resumeFile.mimetype
      } : undefined
    });

    // Persist candidate
    const savedCandidate = await this.candidateRepository.create(candidate);

    // Return response DTO
    return this.toResponseDTO(savedCandidate);
  }

  private toResponseDTO(candidate: Candidate): CandidateResponseDTO {
    return {
      id: candidate.id!,
      firstName: candidate.firstName,
      lastName: candidate.lastName,
      fullName: candidate.fullName,
      email: candidate.email.getValue(),
      phone: candidate.phone?.getValue(),
      address: candidate.address,
      educations: candidate.educations.map(edu => ({
        id: edu.id!,
        institution: edu.institution,
        degree: edu.degree,
        fieldOfStudy: edu.fieldOfStudy,
        startDate: edu.startDate.toISOString(),
        endDate: edu.endDate?.toISOString(),
        description: edu.description
      })),
      workExperiences: candidate.workExperiences.map(exp => ({
        id: exp.id!,
        company: exp.company,
        position: exp.position,
        description: exp.description,
        startDate: exp.startDate.toISOString(),
        endDate: exp.endDate?.toISOString()
      })),
      resume: candidate.resume ? {
        id: candidate.resume.id,
        fileName: candidate.resume.fileName,
        filePath: candidate.resume.filePath,
        fileSize: candidate.resume.fileSize,
        mimeType: candidate.resume.mimeType
      } : undefined,
      createdAt: candidate.createdAt.toISOString(),
      updatedAt: candidate.updatedAt.toISOString()
    };
  }
}
