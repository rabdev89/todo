# T-203 Testing: Dashboard UI Implementation

## Test Strategy
- **Component Tests:** Test `DashboardPage` and `TaskRow` rendering and interactions via Jest.
- **Integration Tests:** Test API integration with mocked fetch calls.
- **E2E Tests (Future):** Use Playwright/Cypress for full user flow (load → create → edit → delete).

## Test Cases

### TC-DASH-1: Initial Load
- **Setup**: User navigates to dashboard
- **Expected**: 
  - Show skeleton loaders while fetching
  - Render task list once data arrives from GET /tasks
  - Display empty state if no tasks exist
- **Status**: ✅ Ready to implement

### TC-DASH-2: Task Completion
- **Setup**: Dashboard has tasks loaded
- **Action**: Click checkbox on task without pending subtasks
- **Expected**: 
  - API call to PATCH /tasks/:id
  - UI shows completed state (strikethrough + circle indicator)
  - Toast shows "Task updated"
- **Status**: ✅ Ready to implement

### TC-DASH-3: Create Task
- **Setup**: User clicks "Add Task" button
- **Action**: Fill form (title required, optional fields), click "Add Task"
- **Expected**:
  - POST /tasks called with form data
  - Modal closes
  - New task appears in list
  - Toast shows "Task created"
- **Status**: ✅ Ready to implement

### TC-DASH-4: Filter & Sort
- **Setup**: Dashboard with multiple tasks
- **Action**: 
  - Select filters (High priority, Completed status)
  - Click sort header (Due Date)
- **Expected**:
  - List updates to show only matching tasks
  - **Active Filter Chips** appear for "High" and "Completed".
  - Clicking the 'X' on a chip removes that filter and refreshes the list.
  - Tasks sorted by due date ascending/descending.
- **Status**: ✅ Ready to implement

### TC-DASH-7: Delete Confirmation
- **Setup**: User clicks delete button on a task row or selects multiple and clicks bulk delete.
- **Action**: Click 'Delete' button.
- **Expected**:
  - Confirmation Modal appears.
  - Clicking 'Cancel' closes modal; no deletion occurs.
  - Clicking 'Confirm' triggers API call and removes task(s) from UI.
- **Status**: ✅ Ready to implement

### TC-DASH-5: Subtask Management
- **Setup**: Task with subtasks expanded
- **Expected**:
  - Subtasks visible with completion indicators
  - "Add or Manage Subtasks" link opens detail drawer
  - Can add subtasks via subtask form in drawer
- **Status**: ✅ Ready to implement

### TC-DASH-6: Mobile Responsiveness
- **Setup**: Viewport 375x667 (mobile)
- **Expected**: 
  - Sidebar collapses behind hamburger menu
  - Task table columns adjust (hide non-critical columns)
  - Modal fits screen
- **Status**: ✅ Ready to implement (manual verification needed)

## Test Coverage Goals
- **Component rendering**: 95%+ coverage
- **API integration**: 90%+ coverage
- **User interactions**: 85%+ coverage
- **Overall target**: ≥ 80% for ci/verify.sh gate

## Verification Evidence
- [ ] `npm test` passes with ≥ 80% coverage
- [ ] `ci/verify.sh` passes (Layer 1 threshold: 56/70)
- [ ] Manual QA: Mobile responsiveness confirmed
- [ ] Browser recordings of critical flows (optional)
