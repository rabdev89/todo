# T-201 Requirements: Task CRUD API Endpoints

## Overview
Implement the core business logic and API endpoints for managing tasks. This is the foundation of the task management functionality.

## Requirements
- **Endpoint: POST /tasks**
  - Create a new task.
  - Required fields: `title`.
  - Optional fields: `description`, `dueDate`, `priority` (LOW, MEDIUM, HIGH).
- **Endpoint: GET /tasks**
  - List all tasks for the authenticated user.
  - Support basic pagination (optional for this breath, but consider in design).
- **Endpoint: PATCH /tasks/:id**
  - Update any field of an existing task.
  - Toggle `isCompleted` status.
- **Endpoint: DELETE /tasks/:id**
  - Permanently remove a task.
- **Security**
  - All endpoints MUST be protected by `JwtAuthGuard`.
  - A user can ONLY access/modify their own tasks.

## Constraints
- Task titles must be between 1 and 255 characters.
- Use UUIDs for task identification.
