import React from 'react';
import { CandidateListItem } from '../types/candidate';
import '../styles/CandidateTable.css';

interface CandidateTableProps {
  candidates: CandidateListItem[];
}

const CandidateTable: React.FC<CandidateTableProps> = ({ candidates }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="candidate-table-container">
      <table className="candidate-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Current Position</th>
            <th>Education</th>
            <th>Experience</th>
            <th>Resume</th>
            <th>Added</th>
          </tr>
        </thead>
        <tbody>
          {candidates.map((candidate) => (
            <tr key={candidate.id}>
              <td className="candidate-table-name">
                <strong>
                  {candidate.firstName} {candidate.lastName}
                </strong>
              </td>
              <td>
                <a href={`mailto:${candidate.email}`} className="candidate-table-email">
                  {candidate.email}
                </a>
              </td>
              <td>
                {candidate.phone ? (
                  <a href={`tel:${candidate.phone}`} className="candidate-table-phone">
                    {candidate.phone}
                  </a>
                ) : (
                  <span className="candidate-table-empty">—</span>
                )}
              </td>
              <td>
                {candidate.currentPosition || (
                  <span className="candidate-table-empty">—</span>
                )}
              </td>
              <td className="candidate-table-count">
                {candidate.educationCount}
              </td>
              <td className="candidate-table-count">
                {candidate.experienceCount}
              </td>
              <td className="candidate-table-resume">
                {candidate.resumeUrl ? (
                  <span className="candidate-table-resume-icon" title="Resume available">
                    📄
                  </span>
                ) : (
                  <span className="candidate-table-empty">—</span>
                )}
              </td>
              <td className="candidate-table-date">
                {formatDate(candidate.createdAt)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CandidateTable;
