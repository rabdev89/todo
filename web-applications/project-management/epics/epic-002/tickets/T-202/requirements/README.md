# T-202 Requirements: Subtask Logic (Hierarchy & Completion)

## Overview
Implement hierarchical task management by allowing tasks to have multiple subtasks. Introduce business rules for task completion based on subtask status.

## Requirements
- **Subtask Entity**
  - Subtasks are linked to a parent `Task`.
  - Fields: `id`, `title`, `isCompleted`, `taskId` (FK).
- **Subtask Management API**
  - `POST /tasks/:taskId/subtasks`: Add a subtask to a task.
  - `PATCH /subtasks/:id`: Toggle subtask completion.
  - `DELETE /subtasks/:id`: Remove a subtask.
- **Business Logic: Completion Dependency**
  - A parent Task CANNOT be marked as `isCompleted: true` if it has any subtasks that are `isCompleted: false`.
  - Attempting to complete a task with pending subtasks should return a `400 Bad Request` with a meaningful message.
- **Security**
  - Users can only manage subtasks for tasks they own.

## Constraints
- Max 20 subtasks per task.
- Subtask titles: 1-255 characters.
