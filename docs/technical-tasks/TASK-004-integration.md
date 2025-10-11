# TASK-004: Integration & Validation Plan

**Task ID**: TASK-004  
**Feature**: Add Candidate to System (US-001)  
**Priority**: High  
**Estimated Effort**: 8-10 hours  
**Dependencies**: TASK-001, TASK-002, TASK-003

---

## 🎯 Objective

Ensure all three layers (Database, Backend, Frontend) work together seamlessly with comprehensive end-to-end testing, validation, and quality assurance.

---

## 📋 Pre-Integration Checklist

Before starting integration testing, verify:

### Database Layer (TASK-001)
- [ ] Prisma schema updated with all models
- [ ] Migration created and applied successfully
- [ ] Database tables exist in PostgreSQL
- [ ] Relationships and constraints working
- [ ] Prisma Client generated

### Backend Layer (TASK-002)
- [ ] All domain entities implemented
- [ ] Use cases functional
- [ ] Repository implementation complete
- [ ] API endpoint responding
- [ ] File upload working
- [ ] Error handling implemented
- [ ] Unit tests passing (70%+ coverage)

### Frontend Layer (TASK-003)
- [ ] All components created
- [ ] Form functionality working
- [ ] API integration complete
- [ ] Validation working
- [ ] File upload UI functional
- [ ] Unit tests passing

---

## 🔧 Integration Setup

### Step 1: Environment Configuration

**Backend `.env`**:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/lti_db"
PORT=3010
NODE_ENV=development
UPLOAD_DIR=uploads/resumes
```

**Frontend `.env`**:
```env
REACT_APP_API_URL=http://localhost:3010
```

### Step 2: Start Services

**Terminal 1 - Database**:
```bash
docker-compose up -d
```

**Terminal 2 - Backend**:
```bash
cd backend
npm install
npx prisma migrate deploy
npx prisma generate
npm run dev
```

**Terminal 3 - Frontend**:
```bash
cd frontend
npm install
npm start
```

### Step 3: Verify Connectivity

**Test Backend Health**:
```bash
curl http://localhost:3010
# Expected: "LTI - Talent Tracking System API"
```

**Test Frontend Access**:
- Navigate to http://localhost:3000
- Verify app loads without errors

**Test Database Connection**:
```bash
cd backend
npx prisma studio
# Verify Prisma Studio opens and shows all tables
```

---

## 🧪 Integration Test Scenarios

### Scenario 1: Happy Path - Complete Success

**Objective**: Verify full candidate creation flow works end-to-end.

**Steps**:
1. Open frontend at http://localhost:3000
2. Click "Add New Candidate" button
3. Fill personal information:
   - First Name: "John"
   - Last Name: "Doe"
   - Email: "john.doe@example.com"
   - Phone: "+1234567890"
   - Address: "123 Main St, New York, NY"

4. Add one education entry:
   - Institution: "MIT"
   - Degree: "Bachelor of Science"
   - Field of Study: "Computer Science"
   - Start Date: "2015-09-01"
   - End Date: "2019-06-01"

5. Add one work experience entry:
   - Company: "Tech Corp"
   - Position: "Software Engineer"
   - Description: "Full-stack development"
   - Start Date: "2019-07-01"
   - End Date: Leave empty (current position)

6. Upload resume (valid PDF file)

7. Click "Add Candidate" button

**Expected Results**:
- [ ] Loading spinner appears
- [ ] No validation errors
- [ ] Success message: "Candidate added successfully!"
- [ ] Form closes or resets
- [ ] Backend logs show successful creation
- [ ] Database contains new candidate record with ID
- [ ] Education entry linked to candidate
- [ ] Work experience entry linked to candidate
- [ ] Resume file saved to `uploads/resumes/` directory
- [ ] Resume record in database with correct metadata

**Verification Commands**:
```bash
# Check database
cd backend
npx prisma studio
# Navigate to Candidates table and verify record exists

# Check file system
ls -lh backend/uploads/resumes/
# Verify PDF file exists with candidate ID in name
```

---

### Scenario 2: Validation Errors

**Objective**: Verify client-side and server-side validation works.

#### Test 2.1: Empty Required Fields
**Steps**:
1. Open add candidate form
2. Leave first name empty
3. Click submit

**Expected Results**:
- [ ] Error message: "First name is required"
- [ ] Field highlighted in red
- [ ] Form not submitted
- [ ] No API call made

#### Test 2.2: Invalid Email Format
**Steps**:
1. Fill first name: "Test"
2. Fill last name: "User"
3. Fill email: "notanemail"
4. Click submit

**Expected Results**:
- [ ] Real-time validation error: "Please enter a valid email address"
- [ ] Form not submitted

#### Test 2.3: Duplicate Email
**Steps**:
1. Create a candidate with email "duplicate@example.com"
2. Try to create another candidate with same email

**Expected Results**:
- [ ] Form submits
- [ ] Backend returns 409 error
- [ ] Error message: "A candidate with this email already exists"
- [ ] User can correct and retry

#### Test 2.4: Invalid Date Range
**Steps**:
1. Add education entry
2. Start Date: "2020-01-01"
3. End Date: "2019-01-01" (before start date)
4. Try to submit

**Expected Results**:
- [ ] Validation error: "End date must be after start date"
- [ ] Form not submitted

#### Test 2.5: Invalid File Type
**Steps**:
1. Fill required fields
2. Try to upload .txt file

**Expected Results**:
- [ ] Immediate error: "Only PDF and DOCX files are allowed"
- [ ] File not selected
- [ ] Can try different file

#### Test 2.6: Oversized File
**Steps**:
1. Fill required fields
2. Try to upload 15MB PDF

**Expected Results**:
- [ ] Error: "File size must be less than 10MB"
- [ ] File not selected

---

### Scenario 3: Multiple Entries

**Objective**: Verify dynamic form sections work correctly.

**Steps**:
1. Fill personal information
2. Click "Add Education" 3 times
3. Fill all 3 education entries with different data
4. Click "Add Experience" 3 times
5. Fill all 3 work experience entries
6. Upload resume
7. Submit form

**Expected Results**:
- [ ] All 3 education entries saved to database
- [ ] All 3 work experience entries saved to database
- [ ] All entries correctly linked to candidate
- [ ] Resume uploaded successfully
- [ ] Success message displayed

**Verification**:
```sql
-- Check education count
SELECT COUNT(*) FROM educations WHERE "candidateId" = '<candidate-id>';
-- Expected: 3

-- Check work experience count
SELECT COUNT(*) FROM work_experiences WHERE "candidateId" = '<candidate-id>';
-- Expected: 3
```

---

### Scenario 4: Edge Cases

#### Test 4.1: Minimum Required Fields Only
**Steps**:
1. Fill only: first name, last name, email
2. Leave everything else empty
3. Submit

**Expected Results**:
- [ ] Candidate created successfully
- [ ] No education entries
- [ ] No work experience entries
- [ ] No resume
- [ ] All optional fields null/empty in database

#### Test 4.2: Special Characters in Names
**Steps**:
1. First Name: "José"
2. Last Name: "O'Brien-Smith"
3. Fill other required fields
4. Submit

**Expected Results**:
- [ ] Special characters preserved
- [ ] No encoding issues
- [ ] Database stores correctly
- [ ] Display shows correctly

#### Test 4.3: Very Long Text
**Steps**:
1. Fill address with 500 characters
2. Fill work description with 1000 characters
3. Submit

**Expected Results**:
- [ ] Long text accepted
- [ ] Database stores complete text
- [ ] No truncation

#### Test 4.4: International Phone Numbers
**Steps**:
1. Phone: "+44 20 7946 0958" (UK)
2. Phone: "+81 3-1234-5678" (Japan)
3. Submit each

**Expected Results**:
- [ ] Various formats accepted
- [ ] Validation passes
- [ ] Stored correctly

---

### Scenario 5: Error Recovery

#### Test 5.1: Network Failure During Submit
**Steps**:
1. Fill form completely
2. Stop backend server
3. Click submit
4. Restart backend
5. Click submit again

**Expected Results**:
- [ ] First submit: Network error message shown
- [ ] Form data preserved (not lost)
- [ ] User can retry
- [ ] Second submit: Success

#### Test 5.2: Database Connection Lost
**Steps**:
1. Stop PostgreSQL container
2. Try to submit form

**Expected Results**:
- [ ] Error message: "Unable to connect to database"
- [ ] User-friendly error (not technical)
- [ ] Form data preserved

#### Test 5.3: File Upload Failure
**Steps**:
1. Remove write permissions on upload directory
2. Try to submit with resume

**Expected Results**:
- [ ] Error message about file upload
- [ ] Candidate not created (transaction rollback)
- [ ] User can retry

---

## 🌐 Browser Compatibility Testing

### Browsers to Test
- [ ] Chrome (latest version)
- [ ] Firefox (latest version)
- [ ] Safari (latest version)
- [ ] Edge (latest version)

### Test Matrix

| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| Form display | ☐ | ☐ | ☐ | ☐ |
| Input validation | ☐ | ☐ | ☐ | ☐ |
| File upload | ☐ | ☐ | ☐ | ☐ |
| Drag & drop | ☐ | ☐ | ☐ | ☐ |
| Form submission | ☐ | ☐ | ☐ | ☐ |
| Error display | ☐ | ☐ | ☐ | ☐ |
| Success flow | ☐ | ☐ | ☐ | ☐ |

---

## 📱 Responsive Design Testing

### Viewport Sizes to Test

#### Mobile (375px width)
- [ ] Form displays correctly
- [ ] All fields accessible
- [ ] Buttons touchable (min 44x44px)
- [ ] No horizontal scroll
- [ ] File upload works
- [ ] Validation errors visible
- [ ] Submit button accessible

#### Tablet (768px width)
- [ ] Two-column layout where appropriate
- [ ] Good use of space
- [ ] Touch targets adequate
- [ ] Form scrolls smoothly

#### Desktop (1920px width)
- [ ] Form centered and readable
- [ ] Not too wide (max-width applied)
- [ ] Good visual hierarchy
- [ ] Efficient use of space

### Test Tools
```bash
# Chrome DevTools
# Open DevTools (F12)
# Click device toolbar icon
# Test different viewport sizes
```

---

## ♿ Accessibility Testing

### Keyboard Navigation Test
**Steps**:
1. Load form
2. Press Tab repeatedly
3. Navigate through all fields
4. Fill form using only keyboard
5. Submit using Enter key

**Expected Results**:
- [ ] Tab order logical
- [ ] All interactive elements reachable
- [ ] Focus visible on all elements
- [ ] Can submit without mouse
- [ ] Skip links available (if applicable)

### Screen Reader Test
**Tools**: NVDA (Windows), VoiceOver (Mac), JAWS

**Steps**:
1. Enable screen reader
2. Navigate form
3. Listen to announcements

**Expected Results**:
- [ ] All labels read correctly
- [ ] Required fields announced
- [ ] Error messages announced
- [ ] Success message announced
- [ ] Instructions clear
- [ ] Form structure understandable

### Color Contrast Test
**Tool**: WAVE browser extension or axe DevTools

**Expected Results**:
- [ ] Text meets WCAG AA standards (4.5:1)
- [ ] Error messages readable
- [ ] Focus indicators visible
- [ ] No color-only information

### ARIA Attributes Check
- [ ] `aria-label` on file input
- [ ] `aria-required` on required fields
- [ ] `aria-invalid` on error fields
- [ ] `aria-describedby` for error messages
- [ ] `role="alert"` on notifications

---

## 🚀 Performance Testing

### Load Time Metrics
**Acceptance Criteria**:
- [ ] Initial page load < 2 seconds
- [ ] Form interactive < 3 seconds
- [ ] File upload feedback immediate

**Test with Chrome DevTools**:
```
1. Open DevTools > Network tab
2. Throttle to "Fast 3G"
3. Reload page
4. Verify load times
```

### File Upload Performance
**Test Cases**:
- [ ] 1MB PDF uploads in < 2 seconds
- [ ] 5MB PDF uploads in < 5 seconds
- [ ] 10MB file shows progress
- [ ] Large file doesn't freeze UI

### Form Submission Performance
**Acceptance Criteria**:
- [ ] Submission response < 2 seconds (normal data)
- [ ] Submission response < 5 seconds (with large resume)
- [ ] No UI freezing during upload

---

## 📝 Manual QA Checklist

### Frontend QA
- [ ] "Add Candidate" button visible and styled
- [ ] Button accessible from dashboard
- [ ] Form opens correctly (modal or page)
- [ ] All fields render properly
- [ ] Labels aligned correctly
- [ ] Placeholders helpful
- [ ] Required indicators (*) shown
- [ ] Add education button works
- [ ] Remove education button works
- [ ] Add work experience button works
- [ ] Remove work experience button works
- [ ] File drag-and-drop works
- [ ] File click-to-browse works
- [ ] File preview displays
- [ ] Remove file button works
- [ ] Validation real-time
- [ ] Error messages clear and specific
- [ ] Submit button disables during loading
- [ ] Loading spinner shows
- [ ] Success message displays
- [ ] Form clears after success
- [ ] Cancel button works (if applicable)

### Backend QA
- [ ] Server starts without errors
- [ ] API endpoint accessible
- [ ] CORS configured correctly
- [ ] Accepts multipart/form-data
- [ ] Parses form data correctly
- [ ] Validates required fields
- [ ] Validates email format
- [ ] Checks duplicate email
- [ ] Validates file type
- [ ] Validates file size
- [ ] Saves candidate to database
- [ ] Saves education entries
- [ ] Saves work experience entries
- [ ] Saves resume file to disk
- [ ] Saves resume metadata to database
- [ ] Returns success response (201)
- [ ] Returns validation errors (400)
- [ ] Returns duplicate error (409)
- [ ] Returns server errors (500)
- [ ] Error messages user-friendly
- [ ] Logs errors appropriately

### Database QA
- [ ] All tables exist
- [ ] Candidate record created with UUID
- [ ] Email stored correctly
- [ ] Phone stored correctly
- [ ] Timestamps auto-generated
- [ ] Education entries linked (foreign key)
- [ ] Work experience entries linked
- [ ] Resume record linked
- [ ] Unique email constraint enforced
- [ ] Cascade delete works
- [ ] No orphaned records

### Integration QA
- [ ] Frontend connects to backend
- [ ] API calls successful
- [ ] CORS no issues
- [ ] FormData constructed correctly
- [ ] File uploads end-to-end
- [ ] Data persists correctly
- [ ] Error messages propagate
- [ ] Success flow complete

---

## 📊 Test Results Documentation

### Test Report Template

```markdown
## Integration Test Report - Add Candidate Feature

**Date**: [Date]  
**Tester**: [Name]  
**Environment**: Development

### Test Summary
- Total Scenarios: 5
- Scenarios Passed: X
- Scenarios Failed: Y
- Pass Rate: Z%

### Detailed Results

#### Scenario 1: Happy Path
- Status: ✅ Pass / ❌ Fail
- Notes: [Any observations]

#### Scenario 2: Validation
- Status: ✅ Pass / ❌ Fail
- Notes: [Any observations]

[... continue for all scenarios]

### Issues Found
1. [Issue description]
   - Severity: Critical/High/Medium/Low
   - Steps to reproduce:
   - Expected vs Actual:

### Recommendations
- [Any improvements or fixes needed]

### Sign-off
- [ ] All critical issues resolved
- [ ] Ready for deployment
```

---

## ✅ Final Validation Checklist

### Functionality
- [ ] Can create candidate with all required fields
- [ ] Can create candidate with optional fields
- [ ] Can add multiple education entries
- [ ] Can add multiple work experience entries
- [ ] Can upload resume file
- [ ] Validation prevents invalid submissions
- [ ] Error handling works for all scenarios
- [ ] Success flow completes correctly

### Data Integrity
- [ ] Data persists correctly in database
- [ ] Relationships maintained
- [ ] Files saved securely
- [ ] No data loss on errors

### User Experience
- [ ] Form intuitive and easy to use
- [ ] Clear instructions and labels
- [ ] Helpful error messages
- [ ] Success feedback clear
- [ ] Loading states apparent

### Technical Quality
- [ ] Code follows DDD principles
- [ ] Tests written and passing
- [ ] Code coverage >70%
- [ ] No console errors
- [ ] No memory leaks
- [ ] Performance acceptable

### Security
- [ ] File types validated server-side
- [ ] File size enforced server-side
- [ ] SQL injection prevented (Prisma)
- [ ] XSS prevented (React escaping)
- [ ] CORS configured appropriately

### Documentation
- [ ] API documented
- [ ] Code commented where needed
- [ ] README updated
- [ ] Test results documented

---

## 🚀 Deployment Readiness

### Pre-Deployment Checklist
- [ ] All tests passing
- [ ] Manual QA complete
- [ ] Performance acceptable
- [ ] Security verified
- [ ] Documentation complete
- [ ] Environment variables configured
- [ ] Database migrations ready
- [ ] Backup plan in place

### Rollout Plan
1. **Database Migration**
   ```bash
   cd backend
   npx prisma migrate deploy
   ```

2. **Backend Deployment**
   - Build: `npm run build`
   - Start: `npm start`
   - Verify: Health check endpoint

3. **Frontend Deployment**
   - Build: `npm run build`
   - Deploy build folder
   - Verify: App loads

4. **Smoke Tests**
   - Create one test candidate
   - Verify in database
   - Verify file uploaded
   - Verify success message

5. **Monitoring**
   - Check error logs
   - Monitor API response times
   - Watch for errors

---

## 🎯 Success Criteria

✅ **Feature Complete When**:
- All user story acceptance criteria met
- All integration test scenarios pass
- Manual QA checklist completed
- Browser compatibility verified
- Responsive design validated
- Accessibility standards met (WCAG 2.1 AA)
- Performance requirements met
- Security verified
- Documentation complete
- Deployed to production
- Smoke tests pass in production

---

**Last Updated**: October 11, 2025  
**Status**: Ready for Execution  
**Estimated Time**: 8-10 hours
