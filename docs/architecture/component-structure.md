# Frontend Component Structure

**Project**: LTI - Talent Tracking System  
**Framework**: React 18 with TypeScript  
**Architecture**: Component-Based with Custom Hooks

---

## 🏗️ Architecture Overview

The frontend follows a modular component architecture with clear separation of concerns:

1. **Presentational Components**: UI-only, no business logic
2. **Container Components**: Manage state and business logic
3. **Custom Hooks**: Reusable logic extraction
4. **Services**: API communication and external interactions
5. **Types**: TypeScript interfaces and types
6. **Utils**: Helper functions and constants

---

## 📁 Directory Structure

```
frontend/src/
│
├── components/                         # All React components
│   ├── candidates/                     # Candidate-related features
│   │   ├── AddCandidateForm/          # Add candidate feature
│   │   │   ├── AddCandidateForm.tsx   # Main form container
│   │   │   ├── AddCandidateForm.test.tsx
│   │   │   ├── AddCandidateForm.css
│   │   │   ├── PersonalInfoSection.tsx      # Form sections
│   │   │   ├── EducationSection.tsx
│   │   │   ├── WorkExperienceSection.tsx
│   │   │   ├── ResumeUploadSection.tsx
│   │   │   └── FormActions.tsx
│   │   │
│   │   └── Dashboard/                  # Candidate dashboard
│   │       ├── RecruiterDashboard.tsx
│   │       ├── RecruiterDashboard.test.tsx
│   │       └── RecruiterDashboard.css
│   │
│   └── common/                         # Reusable UI components
│       ├── Button/
│       │   ├── Button.tsx
│       │   ├── Button.test.tsx
│       │   └── Button.css
│       ├── Input/
│       ├── TextArea/
│       ├── FileUpload/
│       ├── Alert/
│       ├── Modal/
│       └── LoadingSpinner/
│
├── hooks/                              # Custom React hooks
│   ├── useCandidateForm.ts            # Form state management
│   ├── useFileUpload.ts               # File upload logic
│   └── useFormValidation.ts           # Validation logic
│
├── services/                           # External services
│   ├── api/
│   │   ├── apiClient.ts               # Axios configuration
│   │   ├── candidateApi.ts            # Candidate API calls
│   │   └── types.ts                   # API response types
│   └── validation/
│       └── candidateValidation.ts     # Validation utilities
│
├── types/                              # TypeScript definitions
│   ├── candidate.types.ts             # Candidate interfaces
│   └── form.types.ts                  # Form state types
│
├── utils/                              # Utility functions
│   ├── validators.ts                  # Validation functions
│   ├── formatters.ts                  # Data formatters
│   └── constants.ts                   # App constants
│
├── styles/                             # Global styles
│   ├── variables.css                  # CSS variables
│   ├── global.css                     # Global styles
│   └── mixins.css                     # Reusable CSS mixins
│
├── App.tsx                             # Root component
├── App.css                             # App styles
├── index.tsx                           # Entry point
└── index.css                           # Base styles
```

---

## 🧩 Component Hierarchy

```
App
└── RecruiterDashboard
    └── AddCandidateForm (Modal or Route)
        ├── Alert (conditional)
        ├── PersonalInfoSection
        │   ├── Input (firstName)
        │   ├── Input (lastName)
        │   ├── Input (email)
        │   ├── Input (phone)
        │   └── TextArea (address)
        │
        ├── EducationSection
        │   └── [Dynamic List]
        │       ├── Input (institution)
        │       ├── Input (degree)
        │       ├── Input (fieldOfStudy)
        │       ├── Input (startDate)
        │       ├── Input (endDate)
        │       ├── TextArea (description)
        │       └── Button (remove)
        │
        ├── WorkExperienceSection
        │   └── [Dynamic List]
        │       ├── Input (company)
        │       ├── Input (position)
        │       ├── TextArea (description)
        │       ├── Input (startDate)
        │       ├── Input (endDate)
        │       └── Button (remove)
        │
        ├── ResumeUploadSection
        │   └── FileUpload
        │
        └── FormActions
            ├── Button (cancel)
            └── Button (submit)
```

---

## 📦 Component Specifications

### Container Components

#### AddCandidateForm
**Purpose**: Main form container orchestrating all sections  
**Responsibilities**:
- Manage overall form state via `useCandidateForm` hook
- Handle form submission
- Display success/error messages
- Coordinate child components
- Handle loading states

**Props**:
```typescript
interface AddCandidateFormProps {
  onSuccess?: () => void;      // Callback after successful submission
  onCancel?: () => void;        // Callback when form is cancelled
}
```

**State** (via hook):
- Form data (all fields)
- Submission status
- Error messages
- Success status

**Key Methods**:
- `handleSubmit()`: Submit form data
- `handleCancel()`: Close/reset form
- `validateForm()`: Validate all fields

---

### Presentational Components

#### PersonalInfoSection
**Purpose**: Display personal information fields  
**Props**:
```typescript
interface PersonalInfoSectionProps {
  values: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
  };
  errors: FormErrors;
  touched: FormTouched;
  onChange: (field: string, value: string) => void;
  onBlur: (field: string) => void;
}
```

#### EducationSection
**Purpose**: Manage dynamic list of education entries  
**Props**:
```typescript
interface EducationSectionProps {
  educations: IEducation[];
  onAdd: () => void;
  onUpdate: (index: number, field: keyof IEducation, value: any) => void;
  onRemove: (index: number) => void;
  errors?: { [index: number]: FormErrors };
}
```

#### WorkExperienceSection
**Purpose**: Manage dynamic list of work experience entries  
**Props**: Similar to EducationSection

#### ResumeUploadSection
**Purpose**: Wrapper for file upload component  
**Props**:
```typescript
interface ResumeUploadSectionProps {
  onFileSelect: (file: File | null) => void;
  error?: string;
}
```

---

### Common Components

#### Button
**Purpose**: Reusable button with variants and loading state  
**Props**:
```typescript
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  loading?: boolean;
  children: React.ReactNode;
}
```

**Variants**:
- `primary`: Main action buttons (blue)
- `secondary`: Secondary actions (gray)
- `danger`: Destructive actions (red)

**States**:
- Default
- Hover
- Disabled
- Loading (with spinner)

#### Input
**Purpose**: Text input with label and error display  
**Props**:
```typescript
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  touched?: boolean;
}
```

**Features**:
- Optional label with required indicator
- Error message display
- Accessibility attributes (aria-*)
- Various input types support

#### FileUpload
**Purpose**: File upload with drag-and-drop  
**Props**:
```typescript
interface FileUploadProps {
  onFileSelect: (file: File | null) => void;
  error?: string;
  accept?: string;
}
```

**Features**:
- Drag-and-drop zone
- Click to browse
- File preview
- File validation
- Remove file option

#### Alert
**Purpose**: Display success/error/info messages  
**Props**:
```typescript
interface AlertProps {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  onClose?: () => void;
}
```

---

## 🎣 Custom Hooks

### useCandidateForm
**Purpose**: Manage complete form state and logic  
**Returns**:
```typescript
{
  formData: FormData;
  isSubmitting: boolean;
  error: string | null;
  success: boolean;
  updateField: (field: keyof FormData, value: any) => void;
  addEducation: () => void;
  updateEducation: (index: number, field: keyof IEducation, value: any) => void;
  removeEducation: (index: number) => void;
  addWorkExperience: () => void;
  updateWorkExperience: (index: number, field: keyof IWorkExperience, value: any) => void;
  removeWorkExperience: (index: number) => void;
  submitForm: () => Promise<boolean>;
  resetForm: () => void;
}
```

**Responsibilities**:
- Form state management
- Field updates
- Array manipulation (add/remove entries)
- Form submission
- Error handling
- Reset functionality

### useFileUpload
**Purpose**: Handle file selection and validation  
**Returns**:
```typescript
{
  selectedFile: File | null;
  error: string | null;
  handleFileSelect: (file: File) => void;
  clearFile: () => void;
  validateFile: (file: File) => boolean;
}
```

### useFormValidation
**Purpose**: Real-time form validation  
**Returns**:
```typescript
{
  errors: FormErrors;
  touched: FormTouched;
  validate: (field: string, value: any) => string | undefined;
  validateAll: (values: any) => boolean;
  setTouched: (field: string) => void;
  clearErrors: () => void;
}
```

---

## 🌐 API Service Layer

### apiClient.ts
**Purpose**: Configured Axios instance  
**Features**:
- Base URL configuration
- Request interceptors (auth tokens)
- Response interceptors (error handling)
- Timeout configuration

### candidateApi.ts
**Purpose**: Candidate-specific API calls  
**Methods**:
```typescript
class CandidateApi {
  static async createCandidate(payload: ICreateCandidatePayload): Promise<ICandidate>;
  // Future methods:
  // static async getCandidates(params: QueryParams): Promise<ICandidate[]>;
  // static async getCandidateById(id: string): Promise<ICandidate>;
  // static async updateCandidate(id: string, payload: UpdatePayload): Promise<ICandidate>;
  // static async deleteCandidate(id: string): Promise<void>;
}
```

---

## 🎨 Styling Strategy

### CSS Organization
1. **Component-level**: Each component has its own `.css` file
2. **Global styles**: Shared styles in `styles/global.css`
3. **CSS Variables**: Design tokens in `styles/variables.css`

### CSS Variables (Design Tokens)
```css
:root {
  /* Colors */
  --color-primary: #007bff;
  --color-secondary: #6c757d;
  --color-danger: #dc3545;
  --color-success: #28a745;
  --color-warning: #ffc107;
  
  /* Spacing */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;
  
  /* Typography */
  --font-size-sm: 14px;
  --font-size-base: 16px;
  --font-size-lg: 18px;
  --font-size-xl: 24px;
  
  /* Border radius */
  --border-radius-sm: 4px;
  --border-radius-md: 8px;
  
  /* Shadows */
  --shadow-sm: 0 1px 3px rgba(0,0,0,0.12);
  --shadow-md: 0 4px 6px rgba(0,0,0,0.1);
}
```

### Responsive Breakpoints
```css
/* Mobile first approach */
/* Base styles: 375px+ */

@media (min-width: 768px) {
  /* Tablet */
}

@media (min-width: 1024px) {
  /* Desktop */
}

@media (min-width: 1440px) {
  /* Large desktop */
}
```

---

## ♿ Accessibility Features

### Keyboard Navigation
- Tab order follows visual order
- All interactive elements keyboard accessible
- Focus indicators visible
- Skip links where appropriate

### ARIA Attributes
```typescript
// Required fields
<input aria-required="true" />

// Error messages
<input aria-invalid="true" aria-describedby="field-error" />
<span id="field-error" role="alert">{error}</span>

// File upload
<input type="file" aria-label="Upload resume file" />

// Loading states
<button aria-busy="true" aria-live="polite">
  Submitting...
</button>
```

### Screen Reader Support
- Semantic HTML elements
- Descriptive labels
- Error announcements
- Status updates

---

## 🧪 Testing Strategy

### Unit Tests
**Test each component in isolation**:
```typescript
describe('Button Component', () => {
  it('renders with text', () => { /* ... */ });
  it('calls onClick handler', () => { /* ... */ });
  it('shows loading state', () => { /* ... */ });
  it('is disabled when disabled prop is true', () => { /* ... */ });
});
```

### Integration Tests
**Test component interactions**:
```typescript
describe('AddCandidateForm Integration', () => {
  it('submits form with valid data', async () => { /* ... */ });
  it('shows validation errors', async () => { /* ... */ });
  it('handles API errors', async () => { /* ... */ });
});
```

### E2E Tests (Optional)
**Test complete user flows**:
```typescript
describe('Add Candidate Flow', () => {
  it('completes full candidate creation', () => { /* ... */ });
});
```

---

## 🔄 State Management Flow

```
User Action
    ↓
Event Handler
    ↓
Custom Hook (useCandidateForm)
    ↓
Update Local State
    ↓
Trigger Re-render
    ↓
Display Updated UI

--- On Submit ---

Submit Handler
    ↓
Validate Form
    ↓
API Service Call (candidateApi.createCandidate)
    ↓
HTTP Request (Axios)
    ↓
Backend API
    ↓
Response
    ↓
Update State (success/error)
    ↓
Show Feedback to User
```

---

## 📈 Performance Considerations

### Optimization Techniques
1. **React.memo**: Memoize expensive components
2. **useCallback**: Memoize callback functions
3. **useMemo**: Memoize expensive computations
4. **Code Splitting**: Lazy load components
5. **Debouncing**: For real-time validation
6. **Virtual Scrolling**: For large lists (future)

### Bundle Size
- Monitor with `npm run build`
- Keep bundle < 500KB (initial load)
- Lazy load non-critical components

---

## 🚀 Future Enhancements

1. **Form Persistence**: Save draft to localStorage
2. **Multi-step Form**: Break into wizard steps
3. **Autocomplete**: For institution and company
4. **Rich Text Editor**: For descriptions
5. **Image Upload**: Profile photo
6. **Bulk Import**: CSV/Excel upload
7. **Internationalization**: Multi-language support
8. **Dark Mode**: Theme switching

---

## 📚 References

- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React Testing Library](https://testing-library.com/react)
- [Accessibility Guidelines (WCAG 2.1)](https://www.w3.org/WAI/WCAG21/quickref/)
- [React Hooks](https://react.dev/reference/react)

---

**Last Updated**: October 11, 2025  
**Version**: 1.0  
**Status**: Design Approved
