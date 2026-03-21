# T-205 Testing: Multi-select Task Actions

## Test Strategy
- **Component Tests:** Verify checkbox selection logic and action bar behavior
- **Integration Tests:** Test bulk API endpoints with ownership verification
- **E2E Tests (Future):** Full multi-select workflows with Playwright

## Test Cases

### TC-MULTI-1: Individual Task Selection
- **Setup**: Dashboard with 3+ tasks loaded
- **Action**: Click checkbox on first task
- **Expected**:
  - Checkbox becomes checked
  - selectedIds contains task ID
  - Count updates in action bar
  - Action bar appears if hidden
- **Status**: ✅ Implemented

### TC-MULTI-2: Select All / Deselect All
- **Setup**: Dashboard with 3+ tasks
- **Action**: Click header "Select All" checkbox
- **Expected**:
  - All visible rows become checked
  - selectedIds contains all task IDs
  - Count shows total selected
  - Click again to deselect all
- **Status**: ✅ Implemented

### TC-MULTI-3: Select All Respects Filters
- **Setup**: Dashboard with filter applied (e.g., High priority only)
- **Action**: Click Select All
- **Expected**:
  - Only filtered tasks are selected
  - Deselected tasks remain unselected
  - Count reflects filtered count
- **Status**: ✅ Implemented

### TC-MULTI-4: Bulk Delete with Confirmation
- **Setup**: 2+ tasks selected
- **Action**: Click Delete button in action bar
- **Expected**:
  - Confirmation dialog appears
  - On confirm: DELETE /tasks/bulk called with ids
  - Selected tasks removed from list
  - Selection cleared
  - Toast shows success message
- **Status**: ✅ Implemented

### TC-MULTI-5: Bulk Delete Cancellation
- **Setup**: 2+ tasks selected, deletion dialog open
- **Action**: Click Cancel
- **Expected**:
  - Dialog closes
  - Tasks remain selected
  - No API call made
- **Status**: ✅ Implemented

### TC-MULTI-6: Bulk Status Update
- **Setup**: 2+ tasks selected
- **Action**: Click "Mark Complete" button
- **Expected**:
  - PATCH /tasks/bulk called with ids and `{status: 'completed'}`
  - All selected tasks update status in list
  - Selection cleared
  - Toast shows success
  - Action bar disappears
- **Status**: ✅ Implemented

### TC-MULTI-7: Action Bar UI
- **Setup**: No tasks selected initially
- **Action**:
  - Select a task
  - Watch action bar appear
  - Deselect all
- **Expected**:
  - Action bar slides in when selection > 0
  - Shows \"X tasks selected\" count
  - Has Mark Complete, Delete, and Close buttons
  - Smooth transitions
  - Action bar slides out when selection = 0
- **Status**: ✅ Implemented

### TC-MULTI-8: Partial Selection (Indeterminate State)
- **Setup**: 3 tasks available
- **Action**: Select 1 task, view header checkbox
- **Expected**:
  - Header checkbox shows indeterminate state (dash/partial)
  - Select All completes selection for all
- **Status**: ✅ Implemented

### TC-MULTI-9: Backend Ownership Verification
- **Setup**: Multiple tasks by different users (backend scenario)
- **Action**: Attempt bulk delete via API
- **Expected**:
  - Backend verifies ownership for each task ID
  - Only user's own tasks are deleted
  - Unauthorized tasks are rejected
- **Status**: ✅ Backend verified (JwtAuthGuard + prisma where clause)

## Verification Evidence
- [x] Code review: See DashboardPage.tsx lines 101-143, 479-490, 650-656
- [x] Code review: See TasksController.ts lines 41-52
- [x] Manual testing: All selection flows tested
- [x] Manual testing: Action bar appearance/disappearance
- [ ] Component unit tests (Jest/Vitest) - deferred
- [ ] E2E tests (Playwright) - planned for Layer 2
