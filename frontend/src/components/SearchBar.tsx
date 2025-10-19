import React from 'react';
import '../styles/SearchBar.css';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  placeholder = 'Search by name or email...',
}) => {
  return (
    <div className="search-bar-container">
      <div className="search-bar-wrapper">
        <span className="search-icon" aria-hidden="true">🔍</span>
        <input
          type="text"
          className="search-input"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          aria-label="Search candidates"
        />
        {value && (
          <button
            className="search-clear-button"
            onClick={() => onChange('')}
            aria-label="Clear search"
            type="button"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
};

export default SearchBar;
