# T-201 Design: Task CRUD API Endpoints

## Style Attribution
- **Source:** [api_contracts.md](file:///Users/ronaldbaniqued/Code/Origin/ToDoApp/ai-assisted-development/web-applications/project-management/api_contracts.md)
- **Visuals:** N/A (Backend logic).

## Architecture
- **Module:** `TasksModule`.
- **Service:** `TasksService` for DB operations via Prisma.
- **Controller:** `TasksController` handling requests.
- **Data Access:** Prisma `Task` model.

## Domain Model
- `Task` entity as defined in `database_schema.md`.
- Relation: `Task.userId -> User.id`.

## Plan & Breaths
- **Breath 1:** `TasksModule` scaffolding and `Task` entity service methods.
- **Breath 2:** `POST` and `GET` implementation with ownership checks.
- **Breath 3:** `PATCH` and `DELETE` implementation.
- **Breath 4:** Validation logic (DTOs) and Error handling.

## Verification Spec
- **Automated:** Integration tests for each endpoint ensuring 401 for unauthorized and 403 for cross-user access.
- **Manual:** Verify CRUD flow via Postman.
