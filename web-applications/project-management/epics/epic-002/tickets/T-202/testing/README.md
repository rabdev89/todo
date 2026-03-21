# T-202 Testing: Subtask Logic

## Test Strategy
- **Unit Tests:** Guard logic inside `TasksService`.
- **Integration Tests:** E2E flow from subtask creation to parent task completion.

## Test Cases
- **TC-SUB-1:** Subtask Creation
  - Input: valid subtask data and taskId.
  - Expected: 201 Created.
- **TC-SUB-2:** Blocked Completion (Rule)
  - Setup: Task A with 1 incomplete subtask.
  - Action: PATCH Task A { isCompleted: true }.
  - Expected: 400 Bad Request.
- **TC-SUB-3:** Allowed Completion
  - Setup: Task A with all subtasks completed.
  - Action: PATCH Task A { isCompleted: true }.
  - Expected: 200 OK.

## Verification Evidence
- [x] `cd web-applications/backend && npm run test:e2e -- --testPathPatterns=subtasks`
- [ ] Logs showing the validation query for subtasks.

## Verification Log
- **2026-03-19**:
  - **Prisma migrate**: `cd web-applications/backend && npm run prisma:migrate -- --name add_subtasks`
  - **Backend lint/build**: `cd web-applications/backend && npm run lint && npm run build`
  - **Subtasks e2e**: `cd web-applications/backend && npm run test:e2e -- --testPathPatterns=subtasks`
