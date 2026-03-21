# T-201 Testing: Task CRUD API Endpoints

## Test Strategy
- **Integration Tests:** E2E tests focusing on multi-user isolation.
- **Validation Tests:** Check DTO constraints (min/max length).

## Test Cases
- **TC-TASK-1:** Create Task
  - Expected: 201, `userId` in record matches requester.
- **TC-TASK-2:** List Tasks Isolation
  - Setup: User A and User B both have tasks.
  - Action: GET /tasks as User A.
  - Expected: Only User A's tasks returned.
- **TC-TASK-3:** Update/Delete Protection
  - Action: PATCH /tasks/UserB_id as User A.
  - Expected: 403 Forbidden or 404 Not Found.

## Verification Evidence
- [x] `cd web-applications/backend && npm run test:e2e -- --testPathPatterns=tasks`
- [ ] Database log showing only authorized rows accessed.

## Verification Log
- **2026-03-19**:
  - **DB up**: `cd web-applications/backend && docker compose up -d`
  - **Prisma migrate**: `cd web-applications/backend && npm run prisma:migrate`
  - **Backend lint/build**: `cd web-applications/backend && npm run lint && npm run build`
  - **Tasks e2e**: `cd web-applications/backend && npm run test:e2e -- --testPathPatterns=tasks`
