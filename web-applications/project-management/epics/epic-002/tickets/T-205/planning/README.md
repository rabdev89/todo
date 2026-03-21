# T-205 Planning: Multi-select Task Actions

## Task Breakdown (ACTUAL COMPLETION STATUS)
1. [x] Metadata Update: status to `scoped`, track to `B`.
2. [x] Frontend: Add `selectedIds: Set<string>` state to DashboardPage.
3. [x] Frontend: Add checkbox to each TaskRow.
4. [x] Frontend: Add "Select All" checkbox to table header.
5. [x] Frontend: Implement floating action bar (Paper component).
6. [x] Frontend: Implement bulk delete handler with confirmation.
7. [x] Frontend: Implement bulk status update handler.
8. [x] Backend: Implement DELETE /tasks/bulk endpoint.
9. [x] Backend: Implement PATCH /tasks/bulk endpoint.
10. [x] Backend: Add ownership verification for bulk operations.

## Implementation Details

### Frontend: DashboardPage.tsx

**State Management** (lines 101-120):
- `selectedIds: Set<string>` - tracks selected task IDs
- `handleToggleSelect(id: string)` - toggle individual task selection
- `handleToggleSelectAll()` - toggle all visible tasks (respects filters)
- `handleBulkDelete()` - delete selected with confirmation
- `handleBulkUpdate(updates)` - bulk update status/priority

**UI Components**:
1. **Checkbox Column in TaskRow** (lines 650-656):
   - Per-task checkbox for selection
   - Controlled by selectedIds state
   - Supports individual selection

2. **Select All in Table Header** (lines 433-438):
   - Checkbox in header cell
   - Indeterminate state when partial selection
   - Toggles all visible tasks in filtered view

3. **Floating Action Bar** (lines 479-490):
   - Fixed position at bottom center
   - Dark theme (charcoal background)
   - Shows count of selected tasks
   - "Mark Complete" button (bulk status update)
   - "Delete" button (bulk delete with confirmation)
   - Close button to clear selection

### Backend: TasksController.ts

**Endpoints** (lines 41-52):
- `@Patch('bulk')` - bulkUpdate method
  - Body: `{ ids: string[], updates: UpdateTaskDto }`
  - Calls `this.tasks.bulkUpdate()`
- `@Delete('bulk')` - bulkRemove method
  - Body: `{ ids: string[] }`
  - Calls `this.tasks.bulkRemove()`

**Service Methods** (TasksService):
- `bulkUpdate()` - Updates all specified tasks with provided updates
- `bulkRemove()` - Deletes all specified tasks
- Both verify user ownership before modifying

## Verification Checklist
- [x] User can toggle individual task selection.
- [x] User can toggle "Select All" for filtered view.
- [x] Bulk delete correctly removes all chosen tasks with confirmation.
- [x] Bulk status update correctly modifies all chosen tasks.
- [x] Selection clears automatically after successful bulk operation.
- [x] Floating action bar appears/disappears based on selection state.
- [x] Backend endpoints verify user ownership before bulk operations.
