# T-203 Requirements: Dashboard UI Implementation

## Overview
Develop the primary dashboard for the TodoApp. This is the central hub where users manage tasks and subtasks, following the "Pristine Productivity Engine" design aesthetic—clean, minimal, and highly functional with strong visual hierarchy and contextual interactions.

The dashboard is composed of a left navigation sidebar and a main content area featuring a task management table with filtering, sorting, and inline interactions.

---

## Requirements

### 1. Layout & Structure
- **Sidebar (Left Navigation)**
  - Display app branding (NavTask logo)
  - Show user profile (avatar + username)
  - Navigation items:
    - Home (active state highlighted)
    - Sign Out

- **Main Content Area**
  - Page title: **To-do**
  - Top action bar:
    - Filter button (left)
    - “+ New Task” button (right, primary CTA)
  - Task table container:
    - Rounded corners
    - Soft shadow

---

### 2. Task List View
- Render tasks from backend
- Columns:
  - Selection Checkbox
  - Title
  - Due Date
  - Priority
  - Status
  - Actions (Edit)

- Row behavior:
  - Hover highlight
  - Expandable for subtasks

---

### 3. Selection & Bulk Actions
- Checkbox per row
- When one or more rows are selected:
  - Display a **trash icon at the top-left of the table**
  - Show **selected item count** beside the icon
  - Clicking triggers delete confirmation modal

---

### 4. Task Content Rules

#### Title
- Bold text
- Supports multi-line wrapping
- Optional attachment icon

#### Subtask Indicator
- Show **caret icon ONLY if subtasks exist**
- Hide caret when no subtasks

#### Due Date
- Default: standard text
- If **Overdue**:
  - Text color: **#CA0061**
  - Show “Overdue” label below date
- If **Today**:
  - Text color: **#009292**
  - Show “Today” label below date

#### Priority
- High → Yellow badge
- Low → Green badge
- Critical → Red badge

#### Status
- Must include **icon + label**

Status mapping:
- Not Started → Empty circle icon
- In Progress → Half-filled/spinner icon
- Complete → Filled circle icon
- Cancelled → Slashed circle icon

---

### 5. Subtask Integration
- Expandable rows
- Subtasks displayed indented under parent
- Features:
  - Toggle completion
  - Add subtask inline

---

### 6. Filtering & Sorting

#### Filtering
- Filter button opens dropdown/panel
- Filters:
  - Priority
  - Status

#### Active Filters
- Display as **chips above the table**
- Each chip is removable

#### Sorting
- Column header sort controls
- Sortable:
  - Due Date
  - Priority

---

### 7. Task Creation
- “+ New Task” button opens modal

#### Form Fields
- Title (Required)
- Description
- Due Date
- Priority

#### Modal Actions
- Save (primary)
- Cancel (secondary)

---

### 8. Actions
- Edit icon per row
- Delete via bulk selection

#### Delete Confirmation
- Modal dialog
- Shows number of items to delete

---

### 9. States

#### Loading
- Skeleton loaders for rows

#### Empty
- Message: “No tasks yet”
- Optional CTA: “Create your first task”

---

### 10. Visual Design
- Must follow `style_guide.json`
- Use MUI with custom theme
- Design principles:
  - Clean spacing
  - Rounded corners
  - Soft shadows
  - Minimal color usage

---

## Constraints

- Must be responsive:
  - Desktop-first
  - Tablet-friendly

- Must include:
  - Loading states (skeletons)
  - Empty state handling

- Must use:
  - MUI components
  - Theme overrides aligned with design tokens

- Performance considerations:
  - Efficient rendering for large lists
  - Optional virtualization

- Data handling:
  - Fetch from backend API
  - Manage state for:
    - Selection
    - Filters
    - Sorting
    - Expansion (subtasks)
