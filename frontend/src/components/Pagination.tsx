import React from 'react';
import { PaginationData } from '../types/candidate';
import '../styles/Pagination.css';

interface PaginationProps {
  pagination: PaginationData;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ pagination, onPageChange }) => {
  const { page, totalPages, total, limit } = pagination;
  
  // Calculate range of items being displayed
  const startItem = (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, total);
  
  // Generate page numbers to display (max 7 pages visible)
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 7;
    
    if (totalPages <= maxVisible) {
      // Show all pages
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show first, last, and pages around current
      if (page <= 4) {
        for (let i = 1; i <= 5; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (page >= totalPages - 3) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = page - 1; i <= page + 1; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages && newPage !== page) {
      onPageChange(newPage);
    }
  };

  if (totalPages <= 1) {
    return null; // Don't show pagination if there's only one page
  }

  return (
    <div className="pagination-container">
      <div className="pagination-info">
        Showing <strong>{startItem}</strong> to <strong>{endItem}</strong> of <strong>{total}</strong> candidates
      </div>
      
      <nav className="pagination-nav" aria-label="Pagination">
        <button
          className="pagination-button pagination-button-prev"
          onClick={() => handlePageChange(page - 1)}
          disabled={page === 1}
          aria-label="Go to previous page"
        >
          ← Previous
        </button>
        
        <div className="pagination-numbers">
          {getPageNumbers().map((pageNum, index) => (
            pageNum === '...' ? (
              <span key={`ellipsis-${index}`} className="pagination-ellipsis">
                ...
              </span>
            ) : (
              <button
                key={pageNum}
                className={`pagination-number ${page === pageNum ? 'pagination-number-active' : ''}`}
                onClick={() => handlePageChange(pageNum as number)}
                aria-label={`Go to page ${pageNum}`}
                aria-current={page === pageNum ? 'page' : undefined}
              >
                {pageNum}
              </button>
            )
          ))}
        </div>
        
        <button
          className="pagination-button pagination-button-next"
          onClick={() => handlePageChange(page + 1)}
          disabled={page === totalPages}
          aria-label="Go to next page"
        >
          Next →
        </button>
      </nav>
    </div>
  );
};

export default Pagination;
