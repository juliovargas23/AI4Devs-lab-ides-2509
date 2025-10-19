import { Router } from 'express';
import { CandidateController } from '../controllers/CandidateController';
import { FileStorageService } from '../../infrastructure/services/FileStorageService';

export function createCandidateRoutes(controller: CandidateController): Router {
  const router = Router();
  const fileStorageService = new FileStorageService();
  const upload = fileStorageService.getMulterUpload();

  /**
   * @route   POST /api/candidates
   * @desc    Add a new candidate
   * @access  Public
   */
  router.post('/', upload.single('resume'), controller.addCandidate);

  /**
   * @route   GET /api/candidates
   * @desc    Get list of candidates with pagination and search
   * @access  Public
   * @query   page - Page number (default: 1)
   * @query   limit - Items per page (default: 20, max: 100)
   * @query   search - Search by name or email
   * @query   sortBy - Sort field: createdAt | firstName | lastName (default: createdAt)
   * @query   sortOrder - Sort order: asc | desc (default: desc)
   */
  router.get('/', controller.getCandidates);

  return router;
}
