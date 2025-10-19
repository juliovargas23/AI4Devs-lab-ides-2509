# User Story US-002: View Candidate List

**Feature**: Candidate Management  
**Story ID**: US-002  
**Priority**: High  
**Estimated Effort**: 32-40 hours (4-5 working days)  
**Dependencies**: US-001 (Add Candidate to System)

---

## 📋 User Story

**As a** recruiter,  
**I want** to view a list of all candidates in the system,  
**So that** I can see who has been added, access their information, and manage the candidate pool effectively.

---

## ✅ Acceptance Criteria

### AC1: Candidate List Display
- [ ] There must be a dedicated page/view showing all candidates
- [ ] The page must be the default landing page (dashboard) when the application loads
- [ ] The list must display candidates in a table or card layout
- [ ] Each candidate entry must show at minimum:
  - Full Name (First Name + Last Name)
  - Email
  - Phone (if available)
  - Date Added (createdAt)
  - Status indicator (e.g., Active, New)
- [ ] The list must be sorted by most recent first (newest candidates at the top)
- [ ] Empty state must be shown when no candidates exist (with message and add button)

### AC2: Navigation Between Views
- [ ] The candidate list view must have a prominent "Add Candidate" button
- [ ] The "Add Candidate" button must be clearly visible (top-right or top of list)
- [ ] Clicking "Add Candidate" must navigate to the Add Candidate form
- [ ] The Add Candidate form must have a "Back to List" or "Cancel" button
- [ ] Clicking "Back to List" must return to the candidate list view
- [ ] After successfully adding a candidate, user must be redirected to the list view
- [ ] The newly added candidate must be visible in the list (highlighted or at the top)
- [ ] Navigation must preserve form state if user navigates away accidentally

### AC3: Candidate Information Preview
- [ ] Each candidate row/card must show key information at a glance
- [ ] Clicking on a candidate row must expand/show more details (or navigate to detail view)
- [ ] Additional information to display on expand/detail:
  - Address
  - Education entries (count or summary)
  - Work Experience entries (count or summary)
  - Resume status (uploaded or not)
  - Full creation date and time
- [ ] Must have a way to collapse/close the expanded view

### AC4: Data Loading and Performance
- [ ] The list must load within 2 seconds for up to 100 candidates
- [ ] Show loading indicator while fetching data
- [ ] Handle loading states gracefully (skeleton loader or spinner)
- [ ] Show error message if data fails to load
- [ ] Provide retry mechanism if loading fails
- [ ] List must refresh automatically after adding a new candidate

### AC5: Search and Filter (Basic)
- [ ] Must have a search box to filter candidates by name
- [ ] Search must work in real-time (as user types)
- [ ] Search must be case-insensitive
- [ ] Search must filter by first name, last name, or email
- [ ] Clear search button must be available when text is entered
- [ ] Show "No results found" message when search returns no matches

### AC6: Pagination (if > 20 candidates)
- [ ] If more than 20 candidates exist, implement pagination
- [ ] Show 20 candidates per page by default
- [ ] Provide page navigation controls (Previous, Next, page numbers)
- [ ] Show total count of candidates (e.g., "Showing 1-20 of 150 candidates")
- [ ] Remember page position when navigating back from detail view
- [ ] Allow user to change items per page (10, 20, 50, 100)

### AC7: Responsive Design
- [ ] List view must work on mobile devices (375px+)
- [ ] On mobile, display candidates in card format (stacked vertically)
- [ ] On tablet/desktop, display in table format or grid
- [ ] "Add Candidate" button must be accessible on all screen sizes
- [ ] Touch targets must be at least 44x44 pixels on mobile
- [ ] Horizontal scrolling must be avoided on small screens

### AC8: Accessibility
- [ ] List must be navigable via keyboard (Tab, Enter, Arrow keys)
- [ ] Screen readers must be able to read candidate information
- [ ] Focus indicators must be clear for keyboard navigation
- [ ] Proper ARIA labels for all interactive elements
- [ ] Table headers must be properly associated with data cells
- [ ] "Add Candidate" button must have descriptive ARIA label

### AC9: Error Handling
- [ ] Show user-friendly error if API fails to load candidates
- [ ] Provide "Retry" button if initial load fails
- [ ] Show error message if navigation fails
- [ ] Handle edge cases (0 candidates, network issues, slow connections)
- [ ] Errors must not break the entire application

---

## 📝 Additional Features (Nice to Have)

### Future Enhancements
- Bulk actions (select multiple candidates, export, delete)
- Advanced filters (by date range, status, experience level)
- Sort by different columns (name, date, email)
- Quick actions menu per candidate (Edit, Delete, View Details, Download Resume)
- Export candidate list to CSV/Excel
- Candidate status management (New, In Review, Interview, Hired, Rejected)
- Tags or labels for candidates
- Notes section for each candidate
- Integration with calendar for interviews

---

## 🎨 UI/UX Considerations

### Layout Structure
```
┌─────────────────────────────────────────────────────────┐
│  Candidate Dashboard                    [+ Add Candidate]│
├─────────────────────────────────────────────────────────┤
│  🔍 Search candidates...                      Total: 45  │
├─────────────────────────────────────────────────────────┤
│  Name              Email              Phone      Added   │
├─────────────────────────────────────────────────────────┤
│  John Doe          john@email.com    +123...   Oct 11  │
│  Jane Smith        jane@email.com    +456...   Oct 10  │
│  ...                                                      │
├─────────────────────────────────────────────────────────┤
│  Showing 1-20 of 45           < 1 2 3 4 >               │
└─────────────────────────────────────────────────────────┘
```

### Empty State
```
┌─────────────────────────────────────────────────────────┐
│                                         [+ Add Candidate]│
├─────────────────────────────────────────────────────────┤
│                                                          │
│                    📋                                    │
│           No Candidates Yet                              │
│                                                          │
│    Start building your talent pool by adding            │
│    your first candidate to the system.                  │
│                                                          │
│                [+ Add Your First Candidate]              │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## 🔗 Related Technical Tasks

This user story is broken down into the following technical task:

1. **[TASK-005: Candidate List View](../technical-tasks/TASK-005-candidate-list.md)**
   - Implement GET /api/candidates endpoint
   - Create CandidateList React component
   - Add routing between list and add views
   - Implement search and filter functionality
   - Add pagination logic
   - Create responsive design
   - Write tests

---

## 🎯 Definition of Done

- [ ] All acceptance criteria are met and verified
- [ ] Code follows DDD, TDD, and OOP principles
- [ ] Unit tests written and passing (70%+ coverage)
- [ ] Integration tests written and passing
- [ ] E2E tests for navigation flow
- [ ] Code reviewed and approved
- [ ] Documentation updated
- [ ] Manual QA testing completed
- [ ] Accessibility testing completed (WCAG 2.1 AA)
- [ ] Cross-browser testing completed
- [ ] Responsive design testing completed
- [ ] Performance testing (load time < 2 seconds)
- [ ] No critical or high-priority bugs
- [ ] US-001 completion requirement satisfied (view newly added candidate)

---

## 📊 Test Scenarios

### Happy Path
1. User opens the application
2. Dashboard/List view loads showing all candidates
3. User sees candidate table with all required fields
4. User clicks "Add Candidate" button
5. Add Candidate form opens
6. User fills form and submits
7. User is redirected back to list view
8. New candidate appears at the top of the list
9. Success message is shown

### Search/Filter Scenarios
1. User enters search term "John" → Only John Doe shown
2. User enters email "@example.com" → All matching emails shown
3. User clears search → Full list returns
4. User searches for non-existent name → "No results found" message

### Navigation Scenarios
1. From list view, click "Add Candidate" → Form opens
2. From form, click "Back to List" → Returns to list
3. Add candidate successfully → Redirects to list with new candidate
4. Click browser back button → Returns to appropriate view

### Edge Cases
1. No candidates in database → Empty state shown
2. 100 candidates → Pagination appears
3. Network error on load → Error message with retry button
4. Slow connection → Loading indicator shown
5. Navigate away during form fill → Form state preserved or warning shown

### Responsive Tests
1. View list on mobile (375px) → Cards display correctly
2. View list on tablet (768px) → Table/grid displays correctly
3. View list on desktop (1024px+) → Full table with all columns
4. "Add Candidate" button accessible on all sizes

---

## 🔄 User Flow Diagram

```
┌─────────────────┐
│   Application   │
│     Starts      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Candidate List  │◄──────────┐
│   (Dashboard)   │           │
└────────┬────────┘           │
         │                    │
         │ Click              │ Submit Success
         │ "Add Candidate"    │ or "Back to List"
         │                    │
         ▼                    │
┌─────────────────┐           │
│  Add Candidate  │───────────┘
│      Form       │
└─────────────────┘
```

---

## 📈 Success Metrics

- [ ] User can view all candidates within 2 seconds
- [ ] 100% of newly added candidates appear in the list
- [ ] Search functionality returns results in < 500ms
- [ ] Zero navigation errors reported
- [ ] Mobile usability score > 90%
- [ ] Accessibility score (Lighthouse) > 90%

---

## 🔗 Related User Stories

- **US-001**: Add Candidate to System (Dependency - must be completed first)
- **US-003**: View Candidate Details (Future - detailed view of individual candidate)
- **US-004**: Edit Candidate Information (Future)
- **US-005**: Delete Candidate (Future)

---

**Created**: October 11, 2025  
**Status**: 📋 **READY FOR IMPLEMENTATION**  
**Owner**: Development Team  
**Reviewer**: Product Owner
