import { Request, Response, NextFunction } from 'express';
import express from 'express';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import cors from 'cors';
import { PrismaCandidateRepository } from './infrastructure/repositories/PrismaCandidateRepository';
import { AddCandidateUseCase } from './application/use-cases/AddCandidateUseCase';
import { GetCandidatesUseCase } from './application/use-cases/GetCandidatesUseCase';
import { CandidateController } from './presentation/controllers/CandidateController';
import { createCandidateRoutes } from './presentation/routes/candidateRoutes';

dotenv.config();
const prisma = new PrismaClient();

export const app = express();
export default prisma;

const port = 3010;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Dependency Injection
const candidateRepository = new PrismaCandidateRepository(prisma);
const addCandidateUseCase = new AddCandidateUseCase(candidateRepository);
const getCandidatesUseCase = new GetCandidatesUseCase(candidateRepository);
const candidateController = new CandidateController(addCandidateUseCase, getCandidatesUseCase);

// Routes
app.get('/', (req, res) => {
  res.send('Hola LTI!');
});

app.use('/api/candidates', createCandidateRoutes(candidateController));

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: {
      type: 'InternalServerError',
      message: err.message || 'Something broke!'
    }
  });
});

// Only start the server if not in test environment
if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
  });
}
