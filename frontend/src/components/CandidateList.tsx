import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCandidates } from '../hooks/useCandidates';
import { useDebounce } from '../hooks/useDebounce';
import CandidateTable from './CandidateTable';
import CandidateCard from './CandidateCard';
import SearchBar from './SearchBar';
import Pagination from './Pagination';
import LoadingSpinner from './LoadingSpinner';
import EmptyState from './EmptyState';
import '../styles/CandidateList.css';

const CandidateList: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const debouncedSearch = useDebounce(searchTerm, 500);

  // Fetch candidates with current filters
  const { candidates, pagination, loading, error, refetch } = useCandidates({
    page: currentPage,
    limit: 20,
    search: debouncedSearch || undefined,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  // Reset to page 1 when search changes
  React.useEffect(() => {
    if (searchTerm !== debouncedSearch) {
      setCurrentPage(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddCandidate = () => {
    navigate('/candidates/add');
  };

  return (
    <div className="candidate-list-container">
      <header className="candidate-list-header">
        <div className="candidate-list-title-section">
          <h1 className="candidate-list-title">Candidates</h1>
          {pagination && (
            <span className="candidate-list-total">
              {pagination.total} total
            </span>
          )}
        </div>
        <button
          className="candidate-list-add-button"
          onClick={handleAddCandidate}
          aria-label="Add new candidate"
        >
          + Add Candidate
        </button>
      </header>

      <SearchBar
        value={searchTerm}
        onChange={handleSearchChange}
        placeholder="Search by name or email..."
      />

      {loading && <LoadingSpinner message="Loading candidates..." />}

      {error && (
        <div className="candidate-list-error" role="alert">
          <strong>Error:</strong> {error}
          <button
            className="candidate-list-retry-button"
            onClick={() => refetch()}
          >
            Retry
          </button>
        </div>
      )}

      {!loading && !error && candidates.length === 0 && (
        <EmptyState
          message={searchTerm ? 'No candidates found' : 'No candidates yet'}
          description={
            searchTerm
              ? `No results found for "${searchTerm}". Try a different search term.`
              : 'Start by adding your first candidate to the system.'
          }
          showAddButton={!searchTerm}
        />
      )}

      {!loading && !error && candidates.length > 0 && (
        <>
          {/* Desktop table view */}
          <div className="candidate-list-desktop">
            <CandidateTable candidates={candidates} />
          </div>

          {/* Mobile card view */}
          <div className="candidate-list-mobile">
            {candidates.map((candidate) => (
              <CandidateCard key={candidate.id} candidate={candidate} />
            ))}
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <Pagination
              pagination={pagination}
              onPageChange={handlePageChange}
            />
          )}
        </>
      )}
    </div>
  );
};

export default CandidateList;
