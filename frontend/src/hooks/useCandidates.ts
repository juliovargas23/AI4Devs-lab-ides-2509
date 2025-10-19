import { useState, useEffect, useCallback } from 'react';
import { candidateApi } from '../services/candidateApi';
import { CandidateListItem, PaginationData, GetCandidatesParams } from '../types/candidate';

interface UseCandidatesResult {
  candidates: CandidateListItem[];
  pagination: PaginationData | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Custom hook to fetch and manage candidate list
 * @param params Query parameters for filtering and pagination
 * @returns Candidates data, loading state, error, and refetch function
 */
export function useCandidates(params?: GetCandidatesParams): UseCandidatesResult {
  const [candidates, setCandidates] = useState<CandidateListItem[]>([]);
  const [pagination, setPagination] = useState<PaginationData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCandidates = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await candidateApi.getCandidates(params);

      if (response.success && response.data) {
        setCandidates(response.data.data);
        setPagination(response.data.pagination);
      } else {
        setError(response.error?.message || 'Failed to fetch candidates');
        setCandidates([]);
        setPagination(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      setCandidates([]);
      setPagination(null);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params?.page, params?.limit, params?.search, params?.sortBy, params?.sortOrder]);

  useEffect(() => {
    fetchCandidates();
  }, [fetchCandidates]);

  return {
    candidates,
    pagination,
    loading,
    error,
    refetch: fetchCandidates,
  };
}
