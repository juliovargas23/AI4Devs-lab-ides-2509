export interface CreateEducationDTO {
  institution: string;
  degree: string;
  fieldOfStudy?: string;
  startDate: string; // ISO date string
  endDate?: string; // ISO date string
  description?: string;
}

export interface CreateWorkExperienceDTO {
  company: string;
  position: string;
  description?: string;
  startDate: string; // ISO date string
  endDate?: string; // ISO date string
}

export interface CreateCandidateDTO {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: string;
  educations?: CreateEducationDTO[];
  workExperiences?: CreateWorkExperienceDTO[];
}

export interface CandidateResponseDTO {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone?: string;
  address?: string;
  educations: EducationResponseDTO[];
  workExperiences: WorkExperienceResponseDTO[];
  resume?: ResumeResponseDTO;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

export interface EducationResponseDTO {
  id: string;
  institution: string;
  degree: string;
  fieldOfStudy?: string;
  startDate: string;
  endDate?: string;
  description?: string;
}

export interface WorkExperienceResponseDTO {
  id: string;
  company: string;
  position: string;
  description?: string;
  startDate: string;
  endDate?: string;
}

export interface ResumeResponseDTO {
  id: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
}
