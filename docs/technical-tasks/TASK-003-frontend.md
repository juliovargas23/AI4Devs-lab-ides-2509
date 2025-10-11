# TASK-003: Frontend UI Implementation

**Task ID**: TASK-003  
**Feature**: Add Candidate to System (US-001)  
**Priority**: High  
**Estimated Effort**: 20-24 hours  
**Dependencies**: TASK-002 (Backend API)

---

## 🎯 Objective

Create an intuitive, responsive form for adding candidates with proper validation, file upload, error handling, and accessibility features following TDD and OOP principles.

---

## 📊 Current State Analysis

### Existing Infrastructure
- ✅ React 18 application with TypeScript
- ✅ Create React App setup
- ✅ Jest and React Testing Library configured
- ❌ No candidate-related components
- ❌ No API integration
- ❌ No form management setup

### Files to Create
- Multiple new component files
- Custom hooks
- API service layer
- Type definitions
- Test files

---

## 🏗️ Component Architecture

### Directory Structure

```
frontend/src/
├── App.tsx                                    # Update with routing
├── index.tsx                                  # Entry point
├── components/
│   ├── candidates/
│   │   ├── AddCandidateForm/
│   │   │   ├── AddCandidateForm.tsx          # Main form container
│   │   │   ├── AddCandidateForm.test.tsx     # Form tests
│   │   │   ├── AddCandidateForm.css          # Form styles
│   │   │   ├── PersonalInfoSection.tsx       # Personal info fields
│   │   │   ├── EducationSection.tsx          # Education entries
│   │   │   ├── WorkExperienceSection.tsx     # Work experience entries
│   │   │   ├── ResumeUploadSection.tsx       # Resume upload
│   │   │   └── FormActions.tsx               # Submit/Cancel buttons
│   │   └── Dashboard/
│   │       ├── RecruiterDashboard.tsx        # Main dashboard
│   │       ├── RecruiterDashboard.test.tsx   # Dashboard tests
│   │       └── RecruiterDashboard.css        # Dashboard styles
│   └── common/
│       ├── Button/
│       │   ├── Button.tsx
│       │   ├── Button.test.tsx
│       │   └── Button.css
│       ├── Input/
│       │   ├── Input.tsx
│       │   ├── Input.test.tsx
│       │   └── Input.css
│       ├── TextArea/
│       │   ├── TextArea.tsx
│       │   ├── TextArea.test.tsx
│       │   └── TextArea.css
│       ├── FileUpload/
│       │   ├── FileUpload.tsx
│       │   ├── FileUpload.test.tsx
│       │   └── FileUpload.css
│       ├── Alert/
│       │   ├── Alert.tsx
│       │   ├── Alert.test.tsx
│       │   └── Alert.css
│       ├── Modal/
│       │   ├── Modal.tsx
│       │   ├── Modal.test.tsx
│       │   └── Modal.css
│       └── LoadingSpinner/
│           ├── LoadingSpinner.tsx
│           ├── LoadingSpinner.test.tsx
│           └── LoadingSpinner.css
├── services/
│   ├── api/
│   │   ├── apiClient.ts                      # Axios instance config
│   │   ├── candidateApi.ts                   # Candidate API methods
│   │   └── types.ts                          # API response types
│   └── validation/
│       └── candidateValidation.ts            # Validation utilities
├── hooks/
│   ├── useCandidateForm.ts                   # Form state management
│   ├── useFileUpload.ts                      # File upload logic
│   └── useFormValidation.ts                  # Validation logic
├── types/
│   ├── candidate.types.ts                    # Candidate interfaces
│   └── form.types.ts                         # Form state interfaces
├── utils/
│   ├── validators.ts                         # Validation functions
│   ├── formatters.ts                         # Data formatters
│   └── constants.ts                          # App constants
└── tests/
    └── integration/
        └── AddCandidate.integration.test.tsx
```

---

## 📦 Dependencies to Install

```bash
cd frontend

# HTTP client
npm install axios

# Date handling
npm install date-fns

# Form validation
npm install yup

# Testing utilities (if not already installed)
npm install --save-dev @testing-library/react @testing-library/user-event @testing-library/jest-dom

# Mock service worker for API mocking
npm install --save-dev msw
```

---

## 📋 Implementation Steps (TDD Approach)

### PHASE 1: Setup & Type Definitions

#### Step 1.1: Create Type Definitions

**File**: `src/types/candidate.types.ts`
```typescript
export interface IEducation {
  id?: string;
  institution: string;
  degree: string;
  fieldOfStudy?: string;
  startDate: string;
  endDate?: string;
  description?: string;
}

export interface IWorkExperience {
  id?: string;
  company: string;
  position: string;
  description?: string;
  startDate: string;
  endDate?: string;
  currentPosition?: boolean;
}

export interface IResume {
  fileName: string;
  fileSize: number;
  uploadedAt: string;
}

export interface ICandidate {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone?: string;
  address?: string;
  educations: IEducation[];
  workExperiences: IWorkExperience[];
  resume?: IResume;
  createdAt: string;
  updatedAt: string;
}

export interface ICreateCandidatePayload {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: string;
  educations?: IEducation[];
  workExperiences?: IWorkExperience[];
  resume?: File;
}
```

**File**: `src/types/form.types.ts`
```typescript
export interface FormErrors {
  [key: string]: string | undefined;
}

export interface FormState<T> {
  values: T;
  errors: FormErrors;
  touched: { [key: string]: boolean };
  isSubmitting: boolean;
  isValid: boolean;
}

export type ValidationRule = {
  test: (value: any) => boolean;
  message: string;
};

export type ValidationRules = {
  [key: string]: ValidationRule[];
};
```

#### Step 1.2: Create Constants

**File**: `src/utils/constants.ts`
```typescript
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3010';

export const FILE_UPLOAD = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_TYPES: ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  ALLOWED_EXTENSIONS: ['.pdf', '.docx']
};

export const VALIDATION_MESSAGES = {
  REQUIRED: 'This field is required',
  INVALID_EMAIL: 'Please enter a valid email address',
  INVALID_PHONE: 'Please enter a valid phone number',
  INVALID_DATE_RANGE: 'End date must be after start date',
  FILE_TOO_LARGE: 'File size must be less than 10MB',
  FILE_INVALID_TYPE: 'Only PDF and DOCX files are allowed'
};

export const DATE_FORMAT = 'yyyy-MM-dd';
```

---

### PHASE 2: Common Components (TDD)

#### Step 2.1: Button Component

**Test**: `src/components/common/Button/Button.test.tsx`
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button Component', () => {
  it('renders with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Click me</Button>);
    expect(screen.getByText('Click me')).toBeDisabled();
  });

  it('shows loading state', () => {
    render(<Button loading>Click me</Button>);
    expect(screen.getByText('Click me')).toBeDisabled();
    expect(screen.getByRole('button')).toHaveClass('loading');
  });

  it('applies variant classes', () => {
    render(<Button variant="primary">Click me</Button>);
    expect(screen.getByRole('button')).toHaveClass('btn-primary');
  });
});
```

**Implementation**: `src/components/common/Button/Button.tsx`
```typescript
import React from 'react';
import './Button.css';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  loading?: boolean;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  loading = false,
  disabled,
  children,
  className = '',
  ...props
}) => {
  return (
    <button
      className={`btn btn-${variant} ${loading ? 'loading' : ''} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <span className="spinner" aria-hidden="true" />}
      {children}
    </button>
  );
};
```

**Styles**: `src/components/common/Button/Button.css`
```css
.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 44px; /* Accessibility: Touch target */
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background-color: #007bff;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: #0056b3;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
}

.btn-danger {
  background-color: #dc3545;
  color: white;
}

.btn.loading {
  position: relative;
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
```

#### Step 2.2: Input Component

**Test**: `src/components/common/Input/Input.test.tsx`
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { Input } from './Input';

describe('Input Component', () => {
  it('renders with label', () => {
    render(<Input label="Name" name="name" />);
    expect(screen.getByLabelText('Name')).toBeInTheDocument();
  });

  it('shows error message', () => {
    render(<Input label="Email" name="email" error="Invalid email" />);
    expect(screen.getByText('Invalid email')).toBeInTheDocument();
  });

  it('shows required indicator', () => {
    render(<Input label="Email" name="email" required />);
    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('calls onChange when value changes', () => {
    const handleChange = jest.fn();
    render(<Input name="name" onChange={handleChange} />);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'test' } });
    expect(handleChange).toHaveBeenCalled();
  });
});
```

**Implementation**: `src/components/common/Input/Input.tsx`
```typescript
import React from 'react';
import './Input.css';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  touched?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  touched,
  required,
  className = '',
  id,
  name,
  ...props
}) => {
  const inputId = id || name;
  const showError = touched && error;

  return (
    <div className={`input-group ${className}`}>
      {label && (
        <label htmlFor={inputId} className="input-label">
          {label}
          {required && <span className="required" aria-label="required">*</span>}
        </label>
      )}
      <input
        id={inputId}
        name={name}
        className={`input ${showError ? 'input-error' : ''}`}
        aria-invalid={showError ? 'true' : 'false'}
        aria-describedby={showError ? `${inputId}-error` : undefined}
        {...props}
      />
      {showError && (
        <span id={`${inputId}-error`} className="error-message" role="alert">
          {error}
        </span>
      )}
    </div>
  );
};
```

#### Step 2.3: FileUpload Component

**Test**: `src/components/common/FileUpload/FileUpload.test.tsx`
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { FileUpload } from './FileUpload';

describe('FileUpload Component', () => {
  it('renders upload zone', () => {
    render(<FileUpload onFileSelect={jest.fn()} />);
    expect(screen.getByText(/drag.*drop/i)).toBeInTheDocument();
  });

  it('calls onFileSelect when file is selected', () => {
    const handleFileSelect = jest.fn();
    render(<FileUpload onFileSelect={handleFileSelect} />);
    
    const file = new File(['content'], 'resume.pdf', { type: 'application/pdf' });
    const input = screen.getByLabelText(/choose file/i);
    
    fireEvent.change(input, { target: { files: [file] } });
    
    expect(handleFileSelect).toHaveBeenCalledWith(file);
  });

  it('shows error for invalid file type', () => {
    const handleFileSelect = jest.fn();
    render(<FileUpload onFileSelect={handleFileSelect} />);
    
    const file = new File(['content'], 'test.txt', { type: 'text/plain' });
    const input = screen.getByLabelText(/choose file/i);
    
    fireEvent.change(input, { target: { files: [file] } });
    
    expect(screen.getByText(/only pdf and docx/i)).toBeInTheDocument();
  });

  it('shows file preview when file is selected', () => {
    render(<FileUpload onFileSelect={jest.fn()} />);
    
    const file = new File(['content'], 'resume.pdf', { type: 'application/pdf' });
    const input = screen.getByLabelText(/choose file/i);
    
    fireEvent.change(input, { target: { files: [file] } });
    
    expect(screen.getByText('resume.pdf')).toBeInTheDocument();
  });
});
```

**Implementation**: `src/components/common/FileUpload/FileUpload.tsx`
```typescript
import React, { useState, useRef } from 'react';
import { FILE_UPLOAD, VALIDATION_MESSAGES } from '../../../utils/constants';
import './FileUpload.css';

interface FileUploadProps {
  onFileSelect: (file: File | null) => void;
  error?: string;
  accept?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onFileSelect,
  error,
  accept = '.pdf,.docx'
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [validationError, setValidationError] = useState<string>('');
  const inputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    if (!FILE_UPLOAD.ALLOWED_TYPES.includes(file.type)) {
      return VALIDATION_MESSAGES.FILE_INVALID_TYPE;
    }
    if (file.size > FILE_UPLOAD.MAX_SIZE) {
      return VALIDATION_MESSAGES.FILE_TOO_LARGE;
    }
    return null;
  };

  const handleFile = (file: File) => {
    const error = validateFile(file);
    if (error) {
      setValidationError(error);
      setSelectedFile(null);
      onFileSelect(null);
    } else {
      setValidationError('');
      setSelectedFile(file);
      onFileSelect(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleRemove = () => {
    setSelectedFile(null);
    setValidationError('');
    onFileSelect(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const displayError = error || validationError;

  return (
    <div className="file-upload">
      {!selectedFile ? (
        <div
          className={`upload-zone ${dragActive ? 'drag-active' : ''} ${displayError ? 'error' : ''}`}
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
          onDragLeave={() => setDragActive(false)}
        >
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            onChange={handleChange}
            className="file-input"
            id="file-upload"
            aria-label="Choose file to upload"
          />
          <label htmlFor="file-upload" className="upload-label">
            <svg className="upload-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <span className="upload-text">
              Drag and drop your resume here, or <span className="browse-link">browse</span>
            </span>
            <span className="upload-hint">PDF or DOCX (max 10MB)</span>
          </label>
        </div>
      ) : (
        <div className="file-preview">
          <div className="file-info">
            <svg className="file-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <div>
              <div className="file-name">{selectedFile.name}</div>
              <div className="file-size">{formatFileSize(selectedFile.size)}</div>
            </div>
          </div>
          <button
            type="button"
            onClick={handleRemove}
            className="remove-button"
            aria-label="Remove file"
          >
            ×
          </button>
        </div>
      )}
      {displayError && (
        <span className="error-message" role="alert">
          {displayError}
        </span>
      )}
    </div>
  );
};
```

---

### PHASE 3: API Integration

#### Step 3.1: API Client Setup

**File**: `src/services/api/apiClient.ts`
```typescript
import axios from 'axios';
import { API_BASE_URL } from '../../utils/constants';

export const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Add auth token here if needed
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle global errors
    const message = error.response?.data?.error?.message || 'An unexpected error occurred';
    return Promise.reject(new Error(message));
  }
);
```

**File**: `src/services/api/candidateApi.ts`
```typescript
import { apiClient } from './apiClient';
import { ICandidate, ICreateCandidatePayload } from '../../types/candidate.types';

export class CandidateApi {
  static async createCandidate(payload: ICreateCandidatePayload): Promise<ICandidate> {
    const formData = new FormData();
    
    // Append simple fields
    formData.append('firstName', payload.firstName);
    formData.append('lastName', payload.lastName);
    formData.append('email', payload.email);
    
    if (payload.phone) {
      formData.append('phone', payload.phone);
    }
    
    if (payload.address) {
      formData.append('address', payload.address);
    }
    
    // Append arrays as JSON strings
    if (payload.educations && payload.educations.length > 0) {
      formData.append('educations', JSON.stringify(payload.educations));
    }
    
    if (payload.workExperiences && payload.workExperiences.length > 0) {
      formData.append('workExperiences', JSON.stringify(payload.workExperiences));
    }
    
    // Append file
    if (payload.resume) {
      formData.append('resume', payload.resume);
    }
    
    const response = await apiClient.post<{ data: ICandidate }>('/candidates', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return response.data.data;
  }
}
```

---

### PHASE 4: Custom Hooks

#### Step 4.1: Form Management Hook

**File**: `src/hooks/useCandidateForm.ts`
```typescript
import { useState } from 'react';
import { IEducation, IWorkExperience, ICreateCandidatePayload } from '../types/candidate.types';
import { CandidateApi } from '../services/api/candidateApi';

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  educations: IEducation[];
  workExperiences: IWorkExperience[];
  resume: File | null;
}

interface FormState {
  data: FormData;
  isSubmitting: boolean;
  error: string | null;
  success: boolean;
}

export const useCandidateForm = () => {
  const [state, setState] = useState<FormState>({
    data: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: '',
      educations: [],
      workExperiences: [],
      resume: null
    },
    isSubmitting: false,
    error: null,
    success: false
  });

  const updateField = (field: keyof FormData, value: any) => {
    setState(prev => ({
      ...prev,
      data: { ...prev.data, [field]: value }
    }));
  };

  const addEducation = () => {
    setState(prev => ({
      ...prev,
      data: {
        ...prev.data,
        educations: [
          ...prev.data.educations,
          {
            institution: '',
            degree: '',
            fieldOfStudy: '',
            startDate: '',
            endDate: '',
            description: ''
          }
        ]
      }
    }));
  };

  const updateEducation = (index: number, field: keyof IEducation, value: any) => {
    setState(prev => ({
      ...prev,
      data: {
        ...prev.data,
        educations: prev.data.educations.map((edu, i) =>
          i === index ? { ...edu, [field]: value } : edu
        )
      }
    }));
  };

  const removeEducation = (index: number) => {
    setState(prev => ({
      ...prev,
      data: {
        ...prev.data,
        educations: prev.data.educations.filter((_, i) => i !== index)
      }
    }));
  };

  const addWorkExperience = () => {
    setState(prev => ({
      ...prev,
      data: {
        ...prev.data,
        workExperiences: [
          ...prev.data.workExperiences,
          {
            company: '',
            position: '',
            description: '',
            startDate: '',
            endDate: ''
          }
        ]
      }
    }));
  };

  const updateWorkExperience = (index: number, field: keyof IWorkExperience, value: any) => {
    setState(prev => ({
      ...prev,
      data: {
        ...prev.data,
        workExperiences: prev.data.workExperiences.map((exp, i) =>
          i === index ? { ...exp, [field]: value } : exp
        )
      }
    }));
  };

  const removeWorkExperience = (index: number) => {
    setState(prev => ({
      ...prev,
      data: {
        ...prev.data,
        workExperiences: prev.data.workExperiences.filter((_, i) => i !== index)
      }
    }));
  };

  const submitForm = async () => {
    setState(prev => ({ ...prev, isSubmitting: true, error: null }));

    try {
      const payload: ICreateCandidatePayload = {
        firstName: state.data.firstName,
        lastName: state.data.lastName,
        email: state.data.email,
        phone: state.data.phone || undefined,
        address: state.data.address || undefined,
        educations: state.data.educations.length > 0 ? state.data.educations : undefined,
        workExperiences: state.data.workExperiences.length > 0 ? state.data.workExperiences : undefined,
        resume: state.data.resume || undefined
      };

      await CandidateApi.createCandidate(payload);

      setState(prev => ({ ...prev, isSubmitting: false, success: true }));
      return true;
    } catch (error) {
      setState(prev => ({
        ...prev,
        isSubmitting: false,
        error: error instanceof Error ? error.message : 'An error occurred'
      }));
      return false;
    }
  };

  const resetForm = () => {
    setState({
      data: {
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        educations: [],
        workExperiences: [],
        resume: null
      },
      isSubmitting: false,
      error: null,
      success: false
    });
  };

  return {
    formData: state.data,
    isSubmitting: state.isSubmitting,
    error: state.error,
    success: state.success,
    updateField,
    addEducation,
    updateEducation,
    removeEducation,
    addWorkExperience,
    updateWorkExperience,
    removeWorkExperience,
    submitForm,
    resetForm
  };
};
```

---

### PHASE 5: Main Form Component

**File**: `src/components/candidates/AddCandidateForm/AddCandidateForm.tsx`
```typescript
import React, { useEffect } from 'react';
import { useCandidateForm } from '../../../hooks/useCandidateForm';
import { Input } from '../../common/Input/Input';
import { TextArea } from '../../common/TextArea/TextArea';
import { FileUpload } from '../../common/FileUpload/FileUpload';
import { Button } from '../../common/Button/Button';
import { Alert } from '../../common/Alert/Alert';
import './AddCandidateForm.css';

interface AddCandidateFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const AddCandidateForm: React.FC<AddCandidateFormProps> = ({
  onSuccess,
  onCancel
}) => {
  const {
    formData,
    isSubmitting,
    error,
    success,
    updateField,
    addEducation,
    updateEducation,
    removeEducation,
    addWorkExperience,
    updateWorkExperience,
    removeWorkExperience,
    submitForm,
    resetForm
  } = useCandidateForm();

  useEffect(() => {
    if (success && onSuccess) {
      onSuccess();
      resetForm();
    }
  }, [success, onSuccess, resetForm]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitForm();
  };

  return (
    <form onSubmit={handleSubmit} className="add-candidate-form">
      <h2>Add New Candidate</h2>

      {error && <Alert type="error" message={error} />}
      {success && <Alert type="success" message="Candidate added successfully!" />}

      {/* Personal Information */}
      <section className="form-section">
        <h3>Personal Information</h3>
        <div className="form-row">
          <Input
            label="First Name"
            name="firstName"
            value={formData.firstName}
            onChange={(e) => updateField('firstName', e.target.value)}
            required
          />
          <Input
            label="Last Name"
            name="lastName"
            value={formData.lastName}
            onChange={(e) => updateField('lastName', e.target.value)}
            required
          />
        </div>
        <Input
          label="Email"
          name="email"
          type="email"
          value={formData.email}
          onChange={(e) => updateField('email', e.target.value)}
          required
        />
        <Input
          label="Phone"
          name="phone"
          type="tel"
          value={formData.phone}
          onChange={(e) => updateField('phone', e.target.value)}
        />
        <TextArea
          label="Address"
          name="address"
          value={formData.address}
          onChange={(e) => updateField('address', e.target.value)}
          rows={3}
        />
      </section>

      {/* Education Section */}
      <section className="form-section">
        <div className="section-header">
          <h3>Education</h3>
          <Button type="button" variant="secondary" onClick={addEducation}>
            + Add Education
          </Button>
        </div>
        {formData.educations.map((education, index) => (
          <div key={index} className="dynamic-entry">
            <Input
              label="Institution"
              value={education.institution}
              onChange={(e) => updateEducation(index, 'institution', e.target.value)}
              required
            />
            <Input
              label="Degree"
              value={education.degree}
              onChange={(e) => updateEducation(index, 'degree', e.target.value)}
              required
            />
            <Input
              label="Field of Study"
              value={education.fieldOfStudy}
              onChange={(e) => updateEducation(index, 'fieldOfStudy', e.target.value)}
            />
            <div className="form-row">
              <Input
                label="Start Date"
                type="date"
                value={education.startDate}
                onChange={(e) => updateEducation(index, 'startDate', e.target.value)}
                required
              />
              <Input
                label="End Date"
                type="date"
                value={education.endDate}
                onChange={(e) => updateEducation(index, 'endDate', e.target.value)}
              />
            </div>
            <Button
              type="button"
              variant="danger"
              onClick={() => removeEducation(index)}
            >
              Remove
            </Button>
          </div>
        ))}
      </section>

      {/* Work Experience Section */}
      <section className="form-section">
        <div className="section-header">
          <h3>Work Experience</h3>
          <Button type="button" variant="secondary" onClick={addWorkExperience}>
            + Add Experience
          </Button>
        </div>
        {formData.workExperiences.map((experience, index) => (
          <div key={index} className="dynamic-entry">
            <Input
              label="Company"
              value={experience.company}
              onChange={(e) => updateWorkExperience(index, 'company', e.target.value)}
              required
            />
            <Input
              label="Position"
              value={experience.position}
              onChange={(e) => updateWorkExperience(index, 'position', e.target.value)}
              required
            />
            <TextArea
              label="Description"
              value={experience.description}
              onChange={(e) => updateWorkExperience(index, 'description', e.target.value)}
              rows={3}
            />
            <div className="form-row">
              <Input
                label="Start Date"
                type="date"
                value={experience.startDate}
                onChange={(e) => updateWorkExperience(index, 'startDate', e.target.value)}
                required
              />
              <Input
                label="End Date"
                type="date"
                value={experience.endDate}
                onChange={(e) => updateWorkExperience(index, 'endDate', e.target.value)}
              />
            </div>
            <Button
              type="button"
              variant="danger"
              onClick={() => removeWorkExperience(index)}
            >
              Remove
            </Button>
          </div>
        ))}
      </section>

      {/* Resume Upload */}
      <section className="form-section">
        <h3>Resume</h3>
        <FileUpload
          onFileSelect={(file) => updateField('resume', file)}
        />
      </section>

      {/* Form Actions */}
      <div className="form-actions">
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" loading={isSubmitting} disabled={isSubmitting}>
          {isSubmitting ? 'Adding Candidate...' : 'Add Candidate'}
        </Button>
      </div>
    </form>
  );
};
```

---

## ✅ Validation Checklist

### Components
- [ ] All common components created and tested
- [ ] Button component works correctly
- [ ] Input component shows validation errors
- [ ] FileUpload component validates files
- [ ] Alert component displays messages
- [ ] Modal component opens/closes properly

### Form Functionality
- [ ] Personal info fields work
- [ ] Can add/remove education entries
- [ ] Can add/remove work experience entries
- [ ] File upload accepts PDF/DOCX only
- [ ] File size validated (max 10MB)
- [ ] Form submits correctly
- [ ] Loading state shows during submission
- [ ] Success message displays
- [ ] Error messages display

### API Integration
- [ ] API client configured
- [ ] FormData created correctly
- [ ] Multipart/form-data sent
- [ ] Error handling works
- [ ] Success response parsed

### Accessibility
- [ ] All inputs have labels
- [ ] Error messages announced
- [ ] Keyboard navigation works
- [ ] Touch targets min 44x44px
- [ ] ARIA labels present

### Responsive Design
- [ ] Mobile layout works (375px)
- [ ] Tablet layout works (768px)
- [ ] Desktop layout works (1024px+)

---

## 🚀 Next Steps

After completing this task:
1. ✅ Frontend UI is ready
2. ➡️ Proceed to [TASK-004: Integration & Validation](TASK-004-integration.md)

---

**Last Updated**: October 11, 2025  
**Status**: Ready to Implement  
**Estimated Time**: 20-24 hours
