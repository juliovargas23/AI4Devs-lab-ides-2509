# TASK-005: Candidate List View Implementation

**Epic**: Candidate Management  
**User Story**: US-002 - View Candidate List  
**Task Type**: Full Stack Development  
**Priority**: High  
**Estimated Effort**: 32-40 hours  
**Dependencies**: TASK-001, TASK-002, TASK-003, TASK-004 (All completed)

---

## 📋 Task Overview

Implement a complete candidate list view (dashboard) with navigation to and from the Add Candidate form. This includes backend API endpoints, frontend components, routing, search functionality, and pagination.

---

## 🎯 Objectives

1. Create backend API endpoint to retrieve all candidates
2. Implement frontend candidate list component with table/card layout
3. Add routing and navigation between list view and add form
4. Implement search and filter functionality
5. Add pagination for large datasets
6. Ensure responsive design across all devices
7. Write comprehensive tests (unit, integration, E2E)

---

## 🏗️ Architecture

### Backend (Express + TypeScript + Prisma)

#### New Files to Create:
```
backend/src/
├── application/
│   ├── dtos/
│   │   └── CandidateListDTO.ts          (New)
│   └── use-cases/
│       └── GetCandidatesUseCase.ts      (New)
├── presentation/
│   └── controllers/
│       └── CandidateController.ts       (Update)
└── tests/
    ├── integration/
    │   └── getCandidates.integration.test.ts  (New)
    └── e2e/
        └── candidateList.e2e.test.ts    (New)
```

### Frontend (React + TypeScript)

#### New Files to Create:
```
frontend/src/
├── components/
│   ├── CandidateList.tsx                (New)
│   ├── CandidateCard.tsx                (New)
│   ├── CandidateTable.tsx               (New)
│   ├── SearchBar.tsx                    (New)
│   ├── Pagination.tsx                   (New)
│   ├── EmptyState.tsx                   (New)
│   └── LoadingSpinner.tsx               (New)
├── services/
│   └── candidateApi.ts                  (Update)
├── hooks/
│   ├── useCandidates.ts                 (New)
│   └── useDebounce.ts                   (New)
├── types/
│   └── candidate.ts                     (Update)
├── styles/
│   ├── CandidateList.css                (New)
│   ├── CandidateCard.css                (New)
│   └── SearchBar.css                    (New)
└── tests/
    ├── components/
    │   ├── CandidateList.test.tsx       (New)
    │   ├── CandidateCard.test.tsx       (New)
    │   └── SearchBar.test.tsx           (New)
    └── integration/
        └── candidateListFlow.test.tsx   (New)
```

#### Files to Update:
```
frontend/src/
├── App.tsx                               (Update - Add routing)
├── components/
│   └── AddCandidateForm.tsx             (Update - Add back button)
└── index.tsx                             (Update if needed)
```

---

## 📝 Detailed Implementation Steps

### Phase 1: Backend API (8-10 hours)

#### Step 1.1: Create GetCandidatesUseCase (2 hours)
**File**: `backend/src/application/use-cases/GetCandidatesUseCase.ts`

**Requirements**:
- Accept pagination parameters (page, limit)
- Accept search query parameter
- Return paginated list of candidates
- Include total count for pagination
- Sort by createdAt DESC (newest first)

**Interface**:
```typescript
interface GetCandidatesParams {
  page?: number;
  limit?: number;
  search?: string;
}

interface GetCandidatesResult {
  candidates: Candidate[];
  total: number;
  page: number;
  totalPages: number;
}
```

**Business Logic**:
- Default page = 1, default limit = 20
- Search should filter by firstName, lastName, or email (case-insensitive)
- Use Prisma's pagination features (skip, take)
- Include educations and workExperiences count

#### Step 1.2: Create CandidateListDTO (1 hour)
**File**: `backend/src/application/dtos/CandidateListDTO.ts`

**Requirements**:
- Define response structure for candidate list
- Include minimal fields for list view
- Add metadata fields (totalCount, currentPage, totalPages)

**Structure**:
```typescript
export interface CandidateListItemDTO {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: string;
  createdAt: Date;
  educationCount: number;
  workExperienceCount: number;
  hasResume: boolean;
}

export interface CandidateListResponseDTO {
  success: boolean;
  data: {
    candidates: CandidateListItemDTO[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}
```

#### Step 1.3: Update CandidateRepository (2 hours)
**File**: `backend/src/infrastructure/repositories/PrismaCandidateRepository.ts`

**Add Method**:
```typescript
async findAllPaginated(params: {
  page: number;
  limit: number;
  search?: string;
}): Promise<{ candidates: Candidate[]; total: number }> {
  // Implementation with Prisma
}
```

**Requirements**:
- Use Prisma's `findMany` with skip/take
- Use `count` for total
- Implement search with `where` clause
- Include related counts
- Optimize query performance

#### Step 1.4: Update CandidateController (2 hours)
**File**: `backend/src/presentation/controllers/CandidateController.ts`

**Add Method**:
```typescript
async getCandidates(req: Request, res: Response): Promise<void> {
  // Extract query params (page, limit, search)
  // Call GetCandidatesUseCase
  // Return formatted response
}
```

**Requirements**:
- Parse query parameters with validation
- Handle errors appropriately
- Return 200 with data
- Return 500 on errors
- Add proper TypeScript types

#### Step 1.5: Add Route (30 minutes)
**File**: `backend/src/presentation/routes/candidateRoutes.ts`

**Add Route**:
```typescript
router.get('/', candidateController.getCandidates.bind(candidateController));
```

**Endpoint**: `GET /api/candidates`

**Query Parameters**:
- `page` (optional, default: 1)
- `limit` (optional, default: 20)
- `search` (optional)

**Example**: `GET /api/candidates?page=1&limit=20&search=john`

#### Step 1.6: Write Backend Tests (2-3 hours)

**Integration Tests** (`getCandidates.integration.test.ts`):
- Test retrieving all candidates (default pagination)
- Test pagination (page 1, page 2)
- Test search functionality
- Test empty result set
- Test invalid pagination parameters
- Test with 0 candidates
- Test with 100+ candidates

**E2E Tests** (`candidateList.e2e.test.ts`):
- Create multiple candidates
- Retrieve list
- Verify pagination
- Verify search
- Verify sorting (newest first)

---

### Phase 2: Frontend Routing (4-6 hours)

#### Step 2.1: Install React Router (30 minutes)
```bash
cd frontend
npm install react-router-dom
npm install --save-dev @types/react-router-dom
```

#### Step 2.2: Update App.tsx (1 hour)
**File**: `frontend/src/App.tsx`

**Requirements**:
- Set up React Router with BrowserRouter
- Define routes:
  - `/` → CandidateList (default)
  - `/candidates` → CandidateList
  - `/candidates/add` → AddCandidateForm
- Add navigation logic

**Structure**:
```typescript
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/candidates" replace />} />
        <Route path="/candidates" element={<CandidateList />} />
        <Route path="/candidates/add" element={<AddCandidateForm />} />
      </Routes>
    </BrowserRouter>
  );
}
```

#### Step 2.3: Update AddCandidateForm (2 hours)
**File**: `frontend/src/components/AddCandidateForm.tsx`

**Changes**:
1. Import `useNavigate` from react-router-dom
2. Add "Back to List" button at the top
3. On successful submission, navigate to `/candidates`
4. Style the back button to match design

**Code**:
```typescript
import { useNavigate } from 'react-router-dom';

const navigate = useNavigate();

// Add back button
<button 
  type="button" 
  onClick={() => navigate('/candidates')}
  className="back-button"
>
  ← Back to List
</button>

// After successful submission
if (response.success) {
  setSubmitSuccess(true);
  setTimeout(() => {
    navigate('/candidates');
  }, 1500); // Show success message, then redirect
}
```

---

### Phase 3: Frontend List View (12-16 hours)

#### Step 3.1: Create API Service Methods (1 hour)
**File**: `frontend/src/services/candidateApi.ts`

**Add Method**:
```typescript
export interface GetCandidatesParams {
  page?: number;
  limit?: number;
  search?: string;
}

export const getCandidates = async (
  params: GetCandidatesParams = {}
): Promise<CandidateListResponseDTO> => {
  const queryParams = new URLSearchParams();
  if (params.page) queryParams.append('page', params.page.toString());
  if (params.limit) queryParams.append('limit', params.limit.toString());
  if (params.search) queryParams.append('search', params.search);

  const response = await fetch(
    `${API_BASE_URL}/candidates?${queryParams.toString()}`
  );
  
  if (!response.ok) {
    throw new Error('Failed to fetch candidates');
  }
  
  return response.json();
};
```

#### Step 3.2: Create Custom Hooks (2 hours)

**File**: `frontend/src/hooks/useCandidates.ts`
```typescript
export const useCandidates = (params: GetCandidatesParams) => {
  const [candidates, setCandidates] = useState<CandidateListItem[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCandidates = async () => {
    // Implementation
  };

  useEffect(() => {
    fetchCandidates();
  }, [params.page, params.limit, params.search]);

  return { candidates, pagination, loading, error, refetch: fetchCandidates };
};
```

**File**: `frontend/src/hooks/useDebounce.ts`
```typescript
export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};
```

#### Step 3.3: Create EmptyState Component (1 hour)
**File**: `frontend/src/components/EmptyState.tsx`

**Requirements**:
- Display icon/illustration
- Display "No Candidates Yet" message
- Display descriptive text
- Display "Add Your First Candidate" button
- Button navigates to `/candidates/add`

#### Step 3.4: Create LoadingSpinner Component (30 minutes)
**File**: `frontend/src/components/LoadingSpinner.tsx`

**Requirements**:
- Display centered spinner
- Optional text prop
- Accessible (ARIA labels)
- CSS animation

#### Step 3.5: Create SearchBar Component (2 hours)
**File**: `frontend/src/components/SearchBar.tsx`

**Requirements**:
- Input field with search icon
- Clear button (X) when text entered
- Placeholder: "Search candidates..."
- onChange callback
- onClear callback
- Debounced search (use useDebounce hook)
- Keyboard accessible

**Props**:
```typescript
interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
  placeholder?: string;
}
```

#### Step 3.6: Create Pagination Component (2 hours)
**File**: `frontend/src/components/Pagination.tsx`

**Requirements**:
- Display "Showing X-Y of Z candidates"
- Previous/Next buttons
- Page number buttons (show 5 at a time)
- Disable previous on page 1
- Disable next on last page
- onClick callback with page number
- Responsive design

**Props**:
```typescript
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}
```

#### Step 3.7: Create CandidateCard Component (2 hours)
**File**: `frontend/src/components/CandidateCard.tsx`

**Requirements**:
- Display for mobile view
- Show name, email, phone
- Show date added
- Show education/experience count
- Show resume indicator
- Click to expand (future)
- Accessible
- Touch-friendly (44px targets)

**Props**:
```typescript
interface CandidateCardProps {
  candidate: CandidateListItem;
  onClick?: () => void;
}
```

#### Step 3.8: Create CandidateTable Component (2 hours)
**File**: `frontend/src/components/CandidateTable.tsx`

**Requirements**:
- Display for desktop view
- Table with columns: Name, Email, Phone, Added, Resume, Actions
- Proper table semantics (<thead>, <tbody>)
- Sortable columns (future)
- Row hover effect
- Click row to view details (future)
- Accessible (ARIA labels)

**Props**:
```typescript
interface CandidateTableProps {
  candidates: CandidateListItem[];
  onRowClick?: (candidateId: string) => void;
}
```

#### Step 3.9: Create CandidateList Component (4 hours)
**File**: `frontend/src/components/CandidateList.tsx`

**Requirements**:
- Main component orchestrating all subcomponents
- Use useCandidates hook
- Show LoadingSpinner while loading
- Show EmptyState when no candidates
- Show SearchBar at top
- Show "Add Candidate" button (top-right)
- Show CandidateTable (desktop) or CandidateCard (mobile)
- Show Pagination at bottom
- Handle search with debounce
- Handle page changes
- Handle errors
- Responsive layout

**State Management**:
```typescript
const [currentPage, setCurrentPage] = useState(1);
const [searchQuery, setSearchQuery] = useState('');
const debouncedSearch = useDebounce(searchQuery, 500);

const { candidates, pagination, loading, error, refetch } = useCandidates({
  page: currentPage,
  limit: 20,
  search: debouncedSearch,
});
```

**Layout**:
```tsx
<div className="candidate-list-container">
  <header className="candidate-list-header">
    <h1>Candidate Dashboard</h1>
    <button onClick={() => navigate('/candidates/add')}>
      + Add Candidate
    </button>
  </header>

  <SearchBar 
    value={searchQuery}
    onChange={setSearchQuery}
    onClear={() => setSearchQuery('')}
  />

  {loading && <LoadingSpinner />}
  {error && <ErrorMessage error={error} onRetry={refetch} />}
  {!loading && !error && candidates.length === 0 && <EmptyState />}
  {!loading && !error && candidates.length > 0 && (
    <>
      <div className="desktop-view">
        <CandidateTable candidates={candidates} />
      </div>
      <div className="mobile-view">
        {candidates.map(candidate => (
          <CandidateCard key={candidate.id} candidate={candidate} />
        ))}
      </div>
      <Pagination 
        currentPage={currentPage}
        totalPages={pagination?.totalPages || 1}
        totalItems={pagination?.total || 0}
        itemsPerPage={20}
        onPageChange={setCurrentPage}
      />
    </>
  )}
</div>
```

---

### Phase 4: Styling (4-6 hours)

#### Step 4.1: CandidateList Styles
**File**: `frontend/src/styles/CandidateList.css`

**Requirements**:
- Header with flexbox layout
- Responsive grid/table
- Mobile-first approach
- Breakpoints: 768px (tablet), 1024px (desktop)
- Colors matching existing theme
- Hover effects
- Loading states

#### Step 4.2: CandidateCard Styles
**File**: `frontend/src/styles/CandidateCard.css`

**Requirements**:
- Card layout with shadow
- Proper spacing
- Mobile-optimized (full width on small screens)
- Touch-friendly
- Status indicators

#### Step 4.3: SearchBar Styles
**File**: `frontend/src/styles/SearchBar.css`

**Requirements**:
- Search icon
- Clear button styling
- Focus states
- Responsive width

#### Step 4.4: Responsive Design
- Desktop (1024px+): Full table, all columns visible
- Tablet (768px-1023px): Table with some columns hidden
- Mobile (375px-767px): Card layout, stacked vertically

---

### Phase 5: Testing (6-8 hours)

#### Step 5.1: Component Unit Tests (4 hours)

**CandidateList.test.tsx**:
- Renders loading state
- Renders empty state
- Renders candidate list
- Handles search input
- Handles pagination
- Navigates to add form

**CandidateCard.test.tsx**:
- Renders candidate information
- Displays all required fields
- Shows resume indicator
- Click handler works

**SearchBar.test.tsx**:
- Renders input field
- Calls onChange callback
- Shows clear button
- Clear button works

**Pagination.test.tsx**:
- Renders correct page numbers
- Previous/Next buttons work
- Disables buttons appropriately
- Shows correct item counts

#### Step 5.2: Integration Tests (2 hours)

**candidateListFlow.test.tsx**:
- Navigate from list to add form
- Add candidate and return to list
- New candidate appears in list
- Search filters correctly
- Pagination works

#### Step 5.3: E2E Tests (2 hours)

**candidateList.e2e.test.ts**:
- Full flow: Open app → See list → Add candidate → Return to list
- Search candidates
- Navigate through pages
- Click candidate (future)

---

## 🧪 Testing Checklist

### Backend Tests
- [ ] GET /api/candidates returns all candidates
- [ ] Pagination works correctly
- [ ] Search filters by name
- [ ] Search filters by email
- [ ] Search is case-insensitive
- [ ] Empty list returns correct response
- [ ] Invalid page number handled
- [ ] Performance test with 1000+ candidates

### Frontend Tests
- [ ] CandidateList renders correctly
- [ ] Empty state shows when no candidates
- [ ] Loading state shows while fetching
- [ ] Search filters candidates
- [ ] Pagination changes pages
- [ ] Navigation to add form works
- [ ] Navigation back to list works
- [ ] Mobile responsive view works
- [ ] Desktop table view works
- [ ] Keyboard navigation works

### Integration Tests
- [ ] Add candidate → Returns to list → Candidate visible
- [ ] Search → Results update correctly
- [ ] Page navigation preserves search
- [ ] Refresh page preserves state (if implemented)

---

## 📊 Acceptance Criteria Mapping

| AC | Description | Backend | Frontend | Tests |
|----|-------------|---------|----------|-------|
| AC1 | Candidate List Display | ✅ | ✅ | ✅ |
| AC2 | Navigation | N/A | ✅ | ✅ |
| AC3 | Information Preview | ✅ | ✅ | ✅ |
| AC4 | Data Loading | ✅ | ✅ | ✅ |
| AC5 | Search and Filter | ✅ | ✅ | ✅ |
| AC6 | Pagination | ✅ | ✅ | ✅ |
| AC7 | Responsive Design | N/A | ✅ | ✅ |
| AC8 | Accessibility | N/A | ✅ | ✅ |
| AC9 | Error Handling | ✅ | ✅ | ✅ |

---

## 🚀 Deployment Steps

1. **Run All Tests**: Ensure 100% passing
2. **Code Review**: Review all changes
3. **Database Check**: Verify no migration needed
4. **Environment Variables**: No new variables required
5. **Build Frontend**: `npm run build`
6. **Start Backend**: `npm run dev`
7. **Smoke Test**: Manual testing of key flows
8. **Deploy**: Follow deployment procedures

---

## 📝 Additional Notes

### Performance Considerations
- Implement database indexes on frequently searched columns (firstName, lastName, email)
- Consider implementing cursor-based pagination for very large datasets (10,000+ candidates)
- Optimize Prisma queries with proper includes/selects
- Add caching for frequently accessed pages (future)

### Security Considerations
- Validate all query parameters
- Sanitize search input to prevent SQL injection (Prisma handles this)
- Rate limit the GET endpoint if needed
- Ensure proper error messages don't leak sensitive data

### Accessibility Notes
- Use semantic HTML (table, thead, tbody for table view)
- Proper ARIA labels for all interactive elements
- Keyboard navigation must work (Tab, Enter, Arrow keys)
- Screen reader announcements for loading/error states
- Focus management when navigating between views

---

## ✅ Definition of Done

- [ ] All backend endpoints implemented and tested
- [ ] All frontend components implemented and tested
- [ ] Routing between views works correctly
- [ ] Search functionality works correctly
- [ ] Pagination works correctly
- [ ] Responsive design implemented
- [ ] Accessibility requirements met
- [ ] All tests passing (unit, integration, E2E)
- [ ] Code reviewed and approved
- [ ] Documentation updated
- [ ] Manual QA completed
- [ ] No critical bugs
- [ ] Performance benchmarks met

---

## 🔗 Dependencies

### Completed Tasks (Prerequisites):
- ✅ TASK-001: Database Layer
- ✅ TASK-002: Backend API (Add Candidate)
- ✅ TASK-003: Frontend UI (Add Candidate Form)
- ✅ TASK-004: Integration & Testing

### New Dependencies:
```json
{
  "frontend": {
    "react-router-dom": "^6.x",
    "@types/react-router-dom": "^5.x"
  }
}
```

---

## 📅 Estimated Timeline

| Phase | Tasks | Estimated Time |
|-------|-------|----------------|
| Phase 1 | Backend API | 8-10 hours |
| Phase 2 | Frontend Routing | 4-6 hours |
| Phase 3 | Frontend List View | 12-16 hours |
| Phase 4 | Styling | 4-6 hours |
| Phase 5 | Testing | 6-8 hours |
| **Total** | | **34-46 hours** |

**Recommended**: 5 working days (8 hours/day)

---

**Created**: October 11, 2025  
**Status**: 📋 **READY FOR IMPLEMENTATION** (Awaiting Manual Validation)  
**Owner**: Development Team  
**Next Action**: Review and approve before implementation
