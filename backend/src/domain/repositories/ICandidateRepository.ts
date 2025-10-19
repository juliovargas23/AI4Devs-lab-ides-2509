import { Candidate } from '../entities/Candidate';

export interface ICandidateRepository {
  /**
   * Creates a new candidate in the database
   * @param candidate The candidate entity to create
   * @returns The created candidate with assigned ID
   */
  create(candidate: Candidate): Promise<Candidate>;

  /**
   * Finds a candidate by their ID
   * @param id The candidate ID
   * @returns The candidate if found, null otherwise
   */
  findById(id: string): Promise<Candidate | null>;

  /**
   * Finds a candidate by their email address
   * @param email The candidate email
   * @returns The candidate if found, null otherwise
   */
  findByEmail(email: string): Promise<Candidate | null>;

  /**
   * Finds all candidates with pagination and search
   * @param options Query options including pagination, search, and sorting
   * @returns Paginated array of candidates and total count
   */
  findAll(options?: {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: 'createdAt' | 'firstName' | 'lastName';
    sortOrder?: 'asc' | 'desc';
  }): Promise<{ candidates: Candidate[]; total: number }>;

  /**
   * Updates an existing candidate
   * @param candidate The candidate entity with updated data
   * @returns The updated candidate
   */
  update(candidate: Candidate): Promise<Candidate>;

  /**
   * Deletes a candidate by their ID
   * @param id The candidate ID
   * @returns true if deleted, false if not found
   */
  delete(id: string): Promise<boolean>;

  /**
   * Checks if a candidate with the given email exists
   * @param email The email to check
   * @returns true if exists, false otherwise
   */
  existsByEmail(email: string): Promise<boolean>;
}
