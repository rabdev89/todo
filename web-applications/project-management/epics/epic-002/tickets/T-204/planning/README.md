# T-204 Planning: Task Detail & Modals

## Task Breakdown (ACTUAL COMPLETION STATUS)
1. [x] Metadata Update: status to `scoped`, track to `B`.
2. [x] Frontend: Right-side Drawer (MUI `Drawer`) with smooth animations.
3. [x] Frontend: Form state for task editing with real-time validation.
4. [x] Frontend: Subtask management within detail view (toggle, delete, add).
5. [x] Frontend: Immediate update handlers synced with `PATCH /tasks/:id`.
6. [x] Frontend: Subtask operations synced via API endpoints.

## Implementation Details

### Component: TaskDetailDrawer (DashboardPage.tsx, lines 562-658)
- **Trigger**: Clicking task title or edit icon opens drawer
- **Layout**: Responsive right-side drawer (100% mobile, 400-500px desktop)
- **Sections**:
  1. **Title** - Multiline text input with auto-save on blur
  2. **Status & Priority** - Dropdowns with immediate API update
  3. **Due Date** - Date picker with immediate API update
  4. **Description** - Multiline textarea with save on blur
  5. **Subtasks** - List with toggle/delete + add new input
  6. **Metadata** - Created/updated timestamps (read-only)

### Key Features
- Auto-save for field changes (Status, Priority, Due Date via immediate PATCH)
- Save-on-blur for text fields (Title, Description)
- Subtask toggle: Edit in place with API sync
- Subtask add: Enter key or button click
- Subtask delete: Icon button with immediate removal
- Keyboard accessible: ESC to close drawer
- Visual feedback: AppBar header with close button

### Styling
- Follows design system (Roboto font, proper spacing)
- MUI Drawer with white background
- Custom AppBar in drawer header
- Typography hierarchy with captions for labels
- Consistent border radius (2px for inputs)

## Verification Checklist
- [x] Clicking a task opens the correct detail view.
- [x] Changing priority updates immediately via API.
- [x] Adding a subtask from detail view works and persists.
- [x] Closing drawer with ESC key works.
- [x] All fields are properly validated and editable.
- [x] Timestamps display correctly.
