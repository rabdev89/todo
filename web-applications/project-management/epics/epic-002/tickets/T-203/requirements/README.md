# T-203 Requirements: Dashboard UI Implementation

## Overview
Develop the primary dashboard for the TodoApp. This is the central hub where users manage their tasks and subtasks, following the "Pristine Productivity Engine" design aesthetic.

## Requirements
- **Task List View**
  - Render a list of tasks fetched from the backend.
  - Display `title`, `dueDate`, and `priority` badge.
  - Toggle `isCompleted` with a checkbox/switch.
- **Task Creation**
  - "Add Task" button that opens a clean modal/dialog.
  - Form fields: Title (Required), Description, Due Date, Priority.
- **Subtask Integration**
  - Expandable task rows to reveal subtasks.
  - Ability to add/toggle subtasks directly from the dashboard.
- **Visuals**
  - Strict adherence to `style_guide.json` tokens.
  - Use MUI components with custom theme overrides.

## Constraints
- Must be responsive (Desktop first, Tablet friendly).
- Loading states (Skeletons) for data fetching.
- Empty state message when no tasks exist.
