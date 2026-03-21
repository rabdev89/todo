# T-302 Requirements: Sorting & Filtering (FE/BE)

## Overview
Enhance the task dashboard with the ability to sort and filter tasks based on various criteria (priority, due date, completion status).

## Requirements
- **Server-Side Filtering**
  - Update `GET /tasks` to accept query parameters: `priority`, `isCompleted`, `search`.
  - Implement sorting via `sortBy` and `order` (ASC/DESC).
- **Frontend Controls**
  - Add a "Filter Bar" to the dashboard (T-203).
  - Include dropdowns for Priority and Status.
  - Include a Search input for title-based filtering.
- **Persistence**
  - Filter state should be reflected in the URL (Optional but recommended).

## Constraints
- Search should be case-insensitive.
- Default sort: `dueDate` (ASC) then `priority` (DESC).
