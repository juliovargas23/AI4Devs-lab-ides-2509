import { Request, Response, NextFunction } from 'express';
import { AddCandidateUseCase, DuplicateEmailError } from '../../application/use-cases/AddCandidateUseCase';
import { GetCandidatesUseCase } from '../../application/use-cases/GetCandidatesUseCase';
import { CreateCandidateDTO } from '../../application/dtos/CandidateDTO';
import { GetCandidatesQueryDTO } from '../../application/dtos/CandidateListDTO';
import { ValidationError } from '../../application/validators/CandidateValidator';

export class CandidateController {
  constructor(
    private readonly addCandidateUseCase: AddCandidateUseCase,
    private readonly getCandidatesUseCase: GetCandidatesUseCase
  ) {}

  addCandidate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Parse request body
      const dto: CreateCandidateDTO = {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        phone: req.body.phone,
        address: req.body.address,
        educations: req.body.educations ? JSON.parse(req.body.educations) : undefined,
        workExperiences: req.body.workExperiences ? JSON.parse(req.body.workExperiences) : undefined
      };

      // Get uploaded file
      const resumeFile = req.file;

      // Execute use case
      const result = await this.addCandidateUseCase.execute(dto, resumeFile);

      // Return success response
      res.status(201).json({
        success: true,
        data: result,
        message: 'Candidate added successfully'
      });
    } catch (error: any) {
      // Check error type by name to avoid instanceof issues with transpiled code
      if (error.name === 'ValidationError') {
        res.status(400).json({
          success: false,
          error: {
            type: 'ValidationError',
            message: error.message,
            field: error.field
          }
        });
        return;
      }
      
      if (error.name === 'DuplicateEmailError') {
        res.status(409).json({
          success: false,
          error: {
            type: 'DuplicateEmailError',
            message: error.message
          }
        });
        return;
      }
      
      // Generic error handling
      console.error('Error adding candidate:', error);
      res.status(500).json({
        success: false,
        error: {
          type: 'InternalServerError',
          message: 'An error occurred while adding the candidate'
        }
      });
    }
  };

  getCandidates = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Parse query parameters with proper NaN and zero handling
      const pageParam = req.query.page ? parseInt(req.query.page as string, 10) : undefined;
      const limitParam = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;
      
      const query: GetCandidatesQueryDTO = {
        page: (pageParam && !isNaN(pageParam) && pageParam > 0) ? pageParam : undefined,
        limit: (limitParam && !isNaN(limitParam) && limitParam > 0) ? limitParam : undefined,
        search: req.query.search as string,
        sortBy: req.query.sortBy as 'createdAt' | 'firstName' | 'lastName',
        sortOrder: req.query.sortOrder as 'asc' | 'desc'
      };

      // Execute use case
      const result = await this.getCandidatesUseCase.execute(query);

      // Return success response
      res.status(200).json({
        success: true,
        ...result
      });
    } catch (error: any) {
      console.error('Error fetching candidates:', error);
      res.status(500).json({
        success: false,
        error: {
          type: 'InternalServerError',
          message: error.message || 'An error occurred while fetching candidates'
        }
      });
    }
  };
}
