/**
 * Data Transfer Object for candidate list responses
 * Provides a simplified view of candidates for list displays
 */
export interface CandidateListItemDTO {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  currentPosition?: string;
  resumeUrl?: string;
  createdAt: Date;
  educationCount: number;
  experienceCount: number;
}

/**
 * Paginated response for candidate list
 */
export interface CandidateListResponseDTO {
  data: CandidateListItemDTO[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Query parameters for fetching candidate list
 */
export interface GetCandidatesQueryDTO {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: 'createdAt' | 'firstName' | 'lastName';
  sortOrder?: 'asc' | 'desc';
}
