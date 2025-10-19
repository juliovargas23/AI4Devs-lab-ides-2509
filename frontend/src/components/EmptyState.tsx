import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/EmptyState.css';

interface EmptyStateProps {
  message?: string;
  description?: string;
  showAddButton?: boolean;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  message = 'No candidates found',
  description = 'Start by adding your first candidate to the system.',
  showAddButton = true,
}) => {
  const navigate = useNavigate();

  return (
    <div className="empty-state-container">
      <div className="empty-state-icon" aria-hidden="true">
        📋
      </div>
      <h2 className="empty-state-title">{message}</h2>
      <p className="empty-state-description">{description}</p>
      {showAddButton && (
        <button
          className="empty-state-button"
          onClick={() => navigate('/candidates/add')}
          aria-label="Add your first candidate"
        >
          + Add Candidate
        </button>
      )}
    </div>
  );
};

export default EmptyState;
