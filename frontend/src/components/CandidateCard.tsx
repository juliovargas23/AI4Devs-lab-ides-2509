import React from 'react';
import { CandidateListItem } from '../types/candidate';
import '../styles/CandidateCard.css';

interface CandidateCardProps {
  candidate: CandidateListItem;
}

const CandidateCard: React.FC<CandidateCardProps> = ({ candidate }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="candidate-card">
      <div className="candidate-card-header">
        <h3 className="candidate-card-name">
          {candidate.firstName} {candidate.lastName}
        </h3>
        {candidate.currentPosition && (
          <span className="candidate-card-position">{candidate.currentPosition}</span>
        )}
      </div>
      
      <div className="candidate-card-body">
        <div className="candidate-card-info">
          <span className="candidate-card-label">Email:</span>
          <a href={`mailto:${candidate.email}`} className="candidate-card-email">
            {candidate.email}
          </a>
        </div>
        
        {candidate.phone && (
          <div className="candidate-card-info">
            <span className="candidate-card-label">Phone:</span>
            <a href={`tel:${candidate.phone}`} className="candidate-card-phone">
              {candidate.phone}
            </a>
          </div>
        )}
        
        <div className="candidate-card-stats">
          <span className="candidate-card-stat">
            📚 {candidate.educationCount} Education{candidate.educationCount !== 1 ? 's' : ''}
          </span>
          <span className="candidate-card-stat">
            💼 {candidate.experienceCount} Experience{candidate.experienceCount !== 1 ? 's' : ''}
          </span>
        </div>
        
        {candidate.resumeUrl && (
          <div className="candidate-card-resume">
            <span className="candidate-card-resume-icon">📄</span>
            <span>Resume available</span>
          </div>
        )}
      </div>
      
      <div className="candidate-card-footer">
        <span className="candidate-card-date">
          Added: {formatDate(candidate.createdAt)}
        </span>
      </div>
    </div>
  );
};

export default CandidateCard;
