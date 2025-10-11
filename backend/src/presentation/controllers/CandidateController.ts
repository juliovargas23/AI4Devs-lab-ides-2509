import { Request, Response, NextFunction } from 'express';
import { AddCandidateUseCase, DuplicateEmailError } from '../../application/use-cases/AddCandidateUseCase';
import { CreateCandidateDTO } from '../../application/dtos/CandidateDTO';
import { ValidationError } from '../../application/validators/CandidateValidator';

export class CandidateController {
  constructor(
    private readonly addCandidateUseCase: AddCandidateUseCase
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
}
