# T-203 Planning: Dashboard UI Implementation

## Task Breakdown (ACTUAL COMPLETION STATUS)
1. [x] Metadata Update: status to `scoped`, track to `B`.
2. [x] Frontend: Setup `Dashboard` route and base layout (DashboardPage.tsx with Sidebar + AppBar).
3. [x] Frontend: Implement state management using React hooks (useState for tasks, filters, dialogs, expanded rows).
4. [x] Frontend: Build `TaskRow` component with priority styling and expand/collapse.
5. [x] Frontend: Build `SubtaskList` with inline completion display and "Add or Manage Subtasks" link.
6. [x] Frontend: Build `CreateTaskDialog` and `DetailDrawer` with form validation.
7. [x] Frontend: Connect components to `backend` API via `apiFetch` utility.

## Implementation Details

### Main Components
- **DashboardPage.tsx** (800+ lines)
  - AppBar with logout button
  - Sidebar navigation with drawer toggle (mobile)
  - Table-based task list with sorting headers
  - Filter panel (by priority & status)
  - Bulk selection and bulk operations
  - Task detail drawer for editing/managing subtasks
  - Create/Edit task dialog
  - Toast notifications for user feedback

### Features Implemented
- **Task Management**
  - Create tasks with title, description, due date, priority, status
  - Edit existing tasks
  - Delete single or bulk tasks
  - Toggle task completion status
  - Expand/collapse rows to view subtasks
  
- **Subtask Management**
  - View subtasks inline within expanded rows
  - Add subtasks via detail drawer
  - See completion status of subtasks
  
- **Filtering & Sorting**
  - Filter by priority (Low, Medium, High, Urgent)
  - Filter by status (Pending, In Progress, Completed)
  - Sort by title, due date, priority, status
  - Click column headers to toggle sort direction

- **UI/UX**
  - Responsive layout (sidebar collapses on mobile)
  - Skeleton loaders during data fetch
  - Empty state handling
  - Toast notifications for CRUD feedback
  - Strikethrough styling for completed tasks
  - Priority badge colors matching design

### API Integration
- POST /tasks (create)
- GET /tasks (list)
- PATCH /tasks/:id (update)
- PATCH /tasks/bulk (bulk update)
- DELETE /tasks/:id (delete)
- DELETE /tasks/bulk (bulk delete)

### Design Adherence
- Follows style_guide.json color tokens for priority badges
- Uses MUI components with custom theme overrides
- Responsive grid layout with proper spacing
- Clean, minimal aesthetic ("Pristine Productivity Engine")

## Verification Checklist
- [x] Task list displays correctly with real data.
- [x] Adding a task updates the UI immediately.
- [x] Subtasks are visible and interactive.
- [x] Colors and spacing match `style_guide.json`.
- [ ] Unit tests for components (Jest/Vitest) — TO DO
- [ ] E2E tests for full creation flow (Playwright) — FUTURE
- [ ] Mobile responsiveness validation — TO DO
