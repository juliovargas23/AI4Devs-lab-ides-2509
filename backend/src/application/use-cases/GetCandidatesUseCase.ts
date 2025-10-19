import { ICandidateRepository } from '../../domain/repositories/ICandidateRepository';
import { 
  CandidateListResponseDTO, 
  CandidateListItemDTO, 
  GetCandidatesQueryDTO 
} from '../dtos/CandidateListDTO';

/**
 * Use case for retrieving paginated list of candidates
 */
export class GetCandidatesUseCase {
  constructor(private readonly candidateRepository: ICandidateRepository) {}

  /**
   * Execute the use case to get candidates with pagination and search
   * @param query Query parameters for filtering and pagination
   * @returns Paginated list of candidates
   */
  async execute(query: GetCandidatesQueryDTO): Promise<CandidateListResponseDTO> {
    const page = query.page ?? 1;
    const limit = Math.min(query.limit ?? 20, 100); // Max 100 per page
    const search = query.search?.trim();
    const sortBy = query.sortBy || 'createdAt';
    const sortOrder = query.sortOrder || 'desc';

    // Validate page and limit
    if (page < 1 || isNaN(page)) {
      throw new Error('Page must be greater than 0');
    }
    if (limit < 1 || isNaN(limit)) {
      throw new Error('Limit must be greater than 0');
    }

    // Fetch candidates from repository
    const { candidates, total } = await this.candidateRepository.findAll({
      page,
      limit,
      search,
      sortBy,
      sortOrder
    });

    // Map to DTOs
    const data: CandidateListItemDTO[] = candidates.map(candidate => {
      // Get the most recent work experience (either ongoing or latest end date)
      const currentExperience = candidate.workExperiences.reduce((latest, exp) => {
        if (!latest) return exp;
        // Ongoing positions (no end date) take priority
        if (!exp.endDate) return exp;
        if (!latest.endDate) return latest;
        // Otherwise, compare end dates
        return exp.endDate > latest.endDate ? exp : latest;
      }, candidate.workExperiences[0]);

      return {
        id: candidate.id!,
        firstName: candidate.firstName,
        lastName: candidate.lastName,
        email: candidate.email.getValue(),
        phone: candidate.phone?.getValue(),
        currentPosition: currentExperience?.position,
        resumeUrl: candidate.resume?.filePath,
        createdAt: candidate.createdAt!,
        educationCount: candidate.educations.length,
        experienceCount: candidate.workExperiences.length
      };
    });

    // Calculate pagination metadata
    const totalPages = Math.ceil(total / limit);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages
      }
    };
  }
}
