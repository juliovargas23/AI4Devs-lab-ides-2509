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

  return router;
}
