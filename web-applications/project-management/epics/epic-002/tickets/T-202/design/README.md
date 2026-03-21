# T-202 Design: Subtask Logic

## Style Attribution
- **Source:** [database_schema.md](file:///Users/ronaldbaniqued/Code/Origin/ToDoApp/ai-assisted-development/web-applications/project-management/database_schema.md)
- **Visuals:** N/A (Backend logic).

## Architecture
- **Relationship:** One-to-Many (`Task` -> `Subtask`).
- **Prisma Schema:** Update `schema.prisma` to include the `Subtask` model.
- **Service Logic:** Enhance `TasksService` with completion guards.

## Logic Flow: Task Completion
1. `PATCH /tasks/:id` called with `{ isCompleted: true }`.
2. `TasksService` queries for any subtasks where `taskId = :id` AND `isCompleted = false`.
3. If count > 0, throw `BadRequestException`.
4. Otherwise, proceed with update.

## Plan & Breaths
- **Breath 1:** Database update (Add `Subtask` model to Prisma & Migrate).
- **Breath 2:** Subtask CRUD implementation in a new `SubtasksService/Controller`.
- **Breath 3:** Implementation of completion guard logic in `TasksService`.

## Verification Spec
- **Automated:** Unit tests for the completion guard method.
- **Integration:** E2E test for subtask creation and the blocked completion rule.
