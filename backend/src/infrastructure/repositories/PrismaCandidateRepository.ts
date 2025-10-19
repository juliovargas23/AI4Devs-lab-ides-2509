import { PrismaClient } from '@prisma/client';
import { Candidate } from '../../domain/entities/Candidate';
import { ICandidateRepository } from '../../domain/repositories/ICandidateRepository';

export class PrismaCandidateRepository implements ICandidateRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(candidate: Candidate): Promise<Candidate> {
    const data = await this.prisma.candidate.create({
      data: {
        firstName: candidate.firstName,
        lastName: candidate.lastName,
        email: candidate.email.getValue(),
        phone: candidate.phone?.getValue(),
        address: candidate.address,
        educations: {
          create: candidate.educations.map(edu => ({
            institution: edu.institution,
            degree: edu.degree,
            fieldOfStudy: edu.fieldOfStudy,
            startDate: edu.startDate,
            endDate: edu.endDate,
            description: edu.description
          }))
        },
        workExperiences: {
          create: candidate.workExperiences.map(exp => ({
            company: exp.company,
            position: exp.position,
            description: exp.description,
            startDate: exp.startDate,
            endDate: exp.endDate
          }))
        },
        resume: candidate.resume ? {
          create: {
            fileName: candidate.resume.fileName,
            filePath: candidate.resume.filePath,
            fileSize: candidate.resume.fileSize,
            mimeType: candidate.resume.mimeType
          }
        } : undefined
      },
      include: {
        educations: true,
        workExperiences: true,
        resume: true
      }
    });

    return this.toDomain(data);
  }

  async findById(id: string): Promise<Candidate | null> {
    const data = await this.prisma.candidate.findUnique({
      where: { id },
      include: {
        educations: true,
        workExperiences: true,
        resume: true
      }
    });

    return data ? this.toDomain(data) : null;
  }

  async findByEmail(email: string): Promise<Candidate | null> {
    const data = await this.prisma.candidate.findUnique({
      where: { email: email.toLowerCase() },
      include: {
        educations: true,
        workExperiences: true,
        resume: true
      }
    });

    return data ? this.toDomain(data) : null;
  }

  async findAll(options?: {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: 'createdAt' | 'firstName' | 'lastName';
    sortOrder?: 'asc' | 'desc';
  }): Promise<{ candidates: Candidate[]; total: number }> {
    const page = options?.page || 1;
    const limit = options?.limit || 20;
    const skip = (page - 1) * limit;
    const sortBy = options?.sortBy || 'createdAt';
    const sortOrder = options?.sortOrder || 'desc';

    // Build search filter
    const where = options?.search ? {
      OR: [
        { firstName: { contains: options.search, mode: 'insensitive' as const } },
        { lastName: { contains: options.search, mode: 'insensitive' as const } },
        { email: { contains: options.search, mode: 'insensitive' as const } }
      ]
    } : {};

    // Get total count for pagination
    const total = await this.prisma.candidate.count({ where });

    // Get paginated results
    const data = await this.prisma.candidate.findMany({
      where,
      include: {
        educations: true,
        workExperiences: true,
        resume: true
      },
      orderBy: {
        [sortBy]: sortOrder
      },
      skip,
      take: limit
    });

    const candidates = data.map(item => this.toDomain(item));
    return { candidates, total };
  }

  async update(candidate: Candidate): Promise<Candidate> {
    if (!candidate.id) {
      throw new Error('Cannot update candidate without ID');
    }

    // Delete existing related records
    await this.prisma.education.deleteMany({
      where: { candidateId: candidate.id }
    });
    await this.prisma.workExperience.deleteMany({
      where: { candidateId: candidate.id }
    });
    await this.prisma.resume.deleteMany({
      where: { candidateId: candidate.id }
    });

    // Update candidate with new data
    const data = await this.prisma.candidate.update({
      where: { id: candidate.id },
      data: {
        firstName: candidate.firstName,
        lastName: candidate.lastName,
        email: candidate.email.getValue(),
        phone: candidate.phone?.getValue(),
        address: candidate.address,
        educations: {
          create: candidate.educations.map(edu => ({
            institution: edu.institution,
            degree: edu.degree,
            fieldOfStudy: edu.fieldOfStudy,
            startDate: edu.startDate,
            endDate: edu.endDate,
            description: edu.description
          }))
        },
        workExperiences: {
          create: candidate.workExperiences.map(exp => ({
            company: exp.company,
            position: exp.position,
            description: exp.description,
            startDate: exp.startDate,
            endDate: exp.endDate
          }))
        },
        resume: candidate.resume ? {
          create: {
            fileName: candidate.resume.fileName,
            filePath: candidate.resume.filePath,
            fileSize: candidate.resume.fileSize,
            mimeType: candidate.resume.mimeType
          }
        } : undefined
      },
      include: {
        educations: true,
        workExperiences: true,
        resume: true
      }
    });

    return this.toDomain(data);
  }

  async delete(id: string): Promise<boolean> {
    try {
      await this.prisma.candidate.delete({
        where: { id }
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  async existsByEmail(email: string): Promise<boolean> {
    const count = await this.prisma.candidate.count({
      where: { email: email.toLowerCase() }
    });
    return count > 0;
  }

  private toDomain(data: any): Candidate {
    return new Candidate({
      id: data.id,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
      address: data.address,
      educations: data.educations?.map((edu: any) => ({
        id: edu.id,
        institution: edu.institution,
        degree: edu.degree,
        fieldOfStudy: edu.fieldOfStudy,
        startDate: edu.startDate,
        endDate: edu.endDate,
        description: edu.description
      })) || [],
      workExperiences: data.workExperiences?.map((exp: any) => ({
        id: exp.id,
        company: exp.company,
        position: exp.position,
        description: exp.description,
        startDate: exp.startDate,
        endDate: exp.endDate
      })) || [],
      resume: data.resume ? {
        id: data.resume.id,
        fileName: data.resume.fileName,
        filePath: data.resume.filePath,
        fileSize: data.resume.fileSize,
        mimeType: data.resume.mimeType
      } : undefined,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt
    });
  }
}
