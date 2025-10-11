// API Configuration
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3010/api';

// File Upload Configuration
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];

export const ALLOWED_FILE_EXTENSIONS = ['.pdf', '.doc', '.docx'];

// Validation Rules
export const VALIDATION_RULES = {
  firstName: {
    minLength: 2,
    maxLength: 100,
    required: true
  },
  lastName: {
    minLength: 2,
    maxLength: 100,
    required: true
  },
  email: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  },
  phone: {
    required: false,
    // eslint-disable-next-line no-useless-escape
    pattern: /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/
  },
  address: {
    maxLength: 500,
    required: false
  }
};
