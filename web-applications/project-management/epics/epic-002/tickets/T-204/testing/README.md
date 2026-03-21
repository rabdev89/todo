# T-204 Testing: Task Detail & Modals

## Test Strategy
- **Component Tests:** Verify drawer opens/closes and all inputs respond
- **Integration Tests:** Test API sync for all field changes
- **E2E Tests (Future):** Full editing and subtask management flow with Playwright

## Test Cases

### TC-DET-1: Drawer Open/Close
- **Setup**: Dashboard with tasks loaded
- **Action**: Click task title
- **Expected**:
  - Drawer slides in from right
  - Task details populate correctly
  - ESC key closes drawer
- **Status**: ✅ Implemented and manual-verified

### TC-DET-2: Title Editing
- **Setup**: Drawer open with task
- **Action**: Click title field, edit text, click away
- **Expected**:
  - Text field becomes editable multiline input
  - Changes saved on blur
  - PATCH /tasks/:id called with new title
  - UI reflects change
- **Status**: ✅ Implemented

### TC-DET-3: Status/Priority Update
- **Setup**: Drawer open with task
- **Action**: Change Status or Priority dropdown
- **Expected**:
  - Dropdown closes
  - PATCH /tasks/:id called immediately
  - Task list updates with new value
  - No save button needed
- **Status**: ✅ Implemented

### TC-DET-4: Due Date Update
- **Setup**: Drawer open with task
- **Action**: Click date picker, select date
- **Expected**:
  - Date picker opens
  - PATCH /tasks/:id called with new date
  - Task list updates due date display
- **Status**: ✅ Implemented

### TC-DET-5: Description Editing
- **Setup**: Drawer open with task
- **Action**: Fill in or edit description, click away
- **Expected**:
  - Multiline textarea allows detailed text
  - Changes saved on blur
  - PATCH /tasks/:id called
- **Status**: ✅ Implemented

### TC-DET-6: Subtask CRUD
- **Setup**: Drawer open with task containing subtasks
- **Action**: 
  - Toggle subtask checkbox
  - Delete subtask
  - Add new subtask
- **Expected**:
  - Toggles show strikethrough (visual feedback)
  - Delete removes from list
  - Add creates new subtask
  - All changes persist via API
- **Status**: ✅ Implemented

### TC-DET-7: Metadata Display
- **Setup**: Drawer open with task
- **Expected**:
  - Created and Updated timestamps visible
  - Formatted as human-readable datetime
  - Read-only (not editable)
- **Status**: ✅ Implemented

### TC-DET-8: Keyboard Navigation
- **Setup**: Drawer open
- **Action**: Press Tab to navigate, ESC to close
- **Expected**:
  - Tab moves focus through inputs
  - ESC closes drawer
  - Proper focus management
- **Status**: ✅ Keyboard accessible

## Verification Evidence
- [x] Code review: See DashboardPage.tsx lines 562-658
- [x] Manual testing: All fields tested and working
- [ ] Component unit tests (Jest/Vitest) - deferred to follow-up
- [ ] E2E tests (Playwright) - planned for Layer 2
