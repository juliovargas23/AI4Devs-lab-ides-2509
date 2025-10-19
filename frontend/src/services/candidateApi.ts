import { API_BASE_URL } from '../config/constants';
import { 
  CandidateFormData, 
  CandidateResponse, 
  ApiResponse, 
  CandidateListResponse, 
  GetCandidatesParams 
} from '../types/candidate';

class CandidateApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  async addCandidate(candidateData: CandidateFormData): Promise<ApiResponse<CandidateResponse>> {
    try {
      const formData = new FormData();

      // Add basic fields
      formData.append('firstName', candidateData.firstName);
      formData.append('lastName', candidateData.lastName);
      formData.append('email', candidateData.email);
      
      if (candidateData.phone) {
        formData.append('phone', candidateData.phone);
      }
      
      if (candidateData.address) {
        formData.append('address', candidateData.address);
      }

      // Add educations if present
      if (candidateData.educations && candidateData.educations.length > 0) {
        formData.append('educations', JSON.stringify(candidateData.educations));
      }

      // Add work experiences if present
      if (candidateData.workExperiences && candidateData.workExperiences.length > 0) {
        formData.append('workExperiences', JSON.stringify(candidateData.workExperiences));
      }

      // Add resume file if present
      if (candidateData.resume) {
        formData.append('resume', candidateData.resume);
      }

      const response = await fetch(`${this.baseUrl}/candidates`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: {
            type: data.error || 'API_ERROR',
            message: data.message || 'Failed to add candidate',
            field: data.field,
          },
        };
      }

      return {
        success: true,
        data: data.data,
        message: 'Candidate added successfully',
      };
    } catch (error) {
      console.error('Error adding candidate:', error);
      return {
        success: false,
        error: {
          type: 'NETWORK_ERROR',
          message: error instanceof Error ? error.message : 'Network error occurred',
        },
      };
    }
  }

  async getCandidates(params?: GetCandidatesParams): Promise<ApiResponse<CandidateListResponse>> {
    try {
      const queryParams = new URLSearchParams();
      
      if (params?.page) {
        queryParams.append('page', params.page.toString());
      }
      if (params?.limit) {
        queryParams.append('limit', params.limit.toString());
      }
      if (params?.search) {
        queryParams.append('search', params.search);
      }
      if (params?.sortBy) {
        queryParams.append('sortBy', params.sortBy);
      }
      if (params?.sortOrder) {
        queryParams.append('sortOrder', params.sortOrder);
      }

      const url = `${this.baseUrl}/candidates${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      const response = await fetch(url);
      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: {
            type: data.error?.type || 'API_ERROR',
            message: data.error?.message || 'Failed to fetch candidates',
          },
        };
      }

      return {
        success: true,
        data: {
          data: data.data,
          pagination: data.pagination,
        },
      };
    } catch (error) {
      console.error('Error fetching candidates:', error);
      return {
        success: false,
        error: {
          type: 'NETWORK_ERROR',
          message: error instanceof Error ? error.message : 'Network error occurred',
        },
      };
    }
  }
}

export const candidateApi = new CandidateApiService();
