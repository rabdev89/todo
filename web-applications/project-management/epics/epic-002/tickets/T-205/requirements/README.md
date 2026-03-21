# T-205: Multi-select Task Actions

## Overview
Enable users to select multiple tasks from the dashboard table and perform bulk actions (delete, status update, priority update).

## Requirements
### Frontend
- Add a checkbox to each row in the task table (`TaskRow`).
- Add a "Select All" checkbox in the table header.
- Maintain `selectedIds: Set<string>` state in `DashboardPage.tsx`.
- Floating Action Bar (Contextual):
  - Appears when `selectedIds.size > 0`.
  - Displays count of selected tasks.
  - Action: **Bulk Delete** (with confirmation dialog).
  - Action: **Bulk Status Update** (dropdown/menu to set status for all selected).
  - Action: **Bulk Priority Update** (dropdown/menu to set priority for all selected).
- Clear selection after any bulk action completes.

### Backend
- New Endpoint: `DELETE /tasks/bulk`
  - Body: `{ ids: string[] }`
  - Must verify ownership for all IDs before deleting.
- New Endpoint: `PATCH /tasks/bulk`
  - Body: `{ ids: string[], updates: Partial<CreateTaskDto> }`
  - Must verify ownership for all IDs before updating.

## Acceptance Criteria
- User can toggle individual selection.
- User can toggle "Select All" for the current filtered view.
- Bulk delete correctly removes all chosen tasks.
- Bulk status/priority update correctly modifies all chosen tasks.
- Selection is cleared automatically after a successful bulk operation.
