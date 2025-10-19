export interface Education {
  institution: string;
  degree: string;
  fieldOfStudy?: string;
  startDate: string;
  endDate?: string;
  description?: string;
}

export interface WorkExperience {
  company: string;
  position: string;
  description?: string;
  startDate: string;
  endDate?: string;
}

export interface CandidateFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: string;
  educations?: Education[];
  workExperiences?: WorkExperience[];
  resume?: File;
}

export interface CandidateResponse {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone?: string;
  address?: string;
  educations: Education[];
  workExperiences: WorkExperience[];
  resume?: {
    id: string;
    fileName: string;
    filePath: string;
    fileSize: number;
    mimeType: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    type: string;
    message: string;
    field?: string;
  };
}

export interface ValidationError {
  field: string;
  message: string;
}

// Candidate list types
export interface CandidateListItem {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  currentPosition?: string;
  resumeUrl?: string;
  createdAt: string;
  educationCount: number;
  experienceCount: number;
}

export interface PaginationData {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface CandidateListResponse {
  data: CandidateListItem[];
  pagination: PaginationData;
}

export interface GetCandidatesParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: 'createdAt' | 'firstName' | 'lastName';
  sortOrder?: 'asc' | 'desc';
}
