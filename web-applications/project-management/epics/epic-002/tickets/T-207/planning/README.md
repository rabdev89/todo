# T-207 Planning: Task Completion Logic & Dependencies

## Task Breakdown

### Phase 1: Backend Validation Implementation

#### Task 1.1: Update TasksService.update() with Validation
- [ ] Add logic to fetch task with subtasks
- [ ] Check if new status is 'completed'
- [ ] Query pending subtask count
- [ ] Throw BadRequestException if count > 0
- [ ] Add clear error message
- **Estimated Time**: 45 minutes
- **Depends On**: T-202 (subtasks already implemented)
- **Files Modified**: `src/tasks/tasks.service.ts`
- **Affected Tests**: Add validation test case

#### Task 1.2: Add Error Exception Class
- [ ] Create `src/common/exceptions/task-completion.exception.ts`
- [ ] Write `CannotCompleteTaskException` class
- [ ] Include structured error details
- **Estimated Time**: 15 minutes
- **Depends On**: Task 1.1
- **Files Modified**: `src/common/exceptions/task-completion.exception.ts` (new)

#### Task 1.3: Update Swagger/OpenAPI Documentation
- [ ] Document PATCH /tasks/:id completion error (400)
- [ ] Include example error response
- [ ] Add requirement note to endpoint docs
- **Estimated Time**: 20 minutes
- **Depends On**: Task 1.1
- **Files Modified**: `src/tasks/tasks.controller.ts` (docs)

---

### Phase 2: Auto-completion Implementation

#### Task 2.1: Update SubtasksService.toggle() with Auto-completion
- [ ] Add logic to fetch subtask with parent task
- [ ] Update subtask completion status
- [ ] Check if all subtasks now complete
- [ ] Call TasksService.update() to auto-complete parent
- [ ] Add logging for audit trail
- **Estimated Time**: 1 hour
- **Depends On**: Task 1.1, T-202 (subtasks service exists)
- **Files Modified**: `src/subtasks/subtasks.service.ts`
- **Affected Tests**: Add auto-completion test cases

#### Task 2.2: Handle Transaction Safety (Optional)
- [ ] Wrap subtask + task update in $transaction
- [ ] Add timeout handling for large operations
- [ ] Document rollback behavior
- **Estimated Time**: 30 minutes
- **Depends On**: Task 2.1
- **Files Modified**: `src/subtasks/subtasks.service.ts`
- **Note**: Can be deferred if not critical

#### Task 2.3: Add Event/Logging for Auto-completion
- [ ] Create event: `TaskAutoCompletedEvent`
- [ ] Emit event when auto-completion triggers
- [ ] Add structured logging with context
- **Estimated Time**: 30 minutes
- **Depends On**: Task 2.1
- **Files Modified**: `src/subtasks/subtasks.service.ts`

---

### Phase 3: Frontend Validation

#### Task 3.1: Implement handleCompleteTask() Handler
- [ ] Check if task has incomplete subtasks
- [ ] Show toast error if validation fails
- [ ] Prevent API call if blocked
- [ ] Only POST to API if validation passes
- **Estimated Time**: 45 minutes
- **Depends On**: Task 1.1 (backend validation exists)
- **Files Modified**: `src/components/DashboardPage.tsx`

#### Task 3.2: Update TaskRow Component Logic
- [ ] Add computed property: `canComplete`
- [ ] Update checkbox handler to check `canComplete`
- [ ] Prevent click if validation fails
- [ ] Show visual feedback (disabled state)
- **Estimated Time**: 30 minutes
- **Depends On**: Task 3.1
- **Files Modified**: `src/components/TaskRow.tsx`

#### Task 3.3: Enhance Subtask Toggle Handler
- [ ] Update handleToggleSubtask() to check all subtasks
- [ ] If all now complete, auto-update parent task UI
- [ ] Update expanded detail view immediately
- [ ] Show appropriate success message
- **Estimated Time**: 45 minutes
- **Depends On**: Task 2.1 (backend auto-completion exists)
- **Files Modified**: `src/components/DashboardPage.tsx`

#### Task 3.4: Error Boundary & Message Handling
- [ ] Catch specific error types (400, 403, 404)
- [ ] Display user-friendly error messages
- [ ] Rollback UI state on error
- [ ] Log errors for debugging
- **Estimated Time**: 30 minutes
- **Depends On**: Task 3.1, Task 3.3
- **Files Modified**: `src/components/DashboardPage.tsx`, error handling utilities

---

### Phase 4: Testing

#### Task 4.1: Unit Tests for Backend Validation
- [ ] Test: Complete task with no subtasks (allow)
- [ ] Test: Complete task with 1 complete subtask (allow)
- [ ] Test: Complete task with 1 incomplete subtask (block)
- [ ] Test: Complete task with multiple incomplete subtasks (block)
- [ ] Test: Error message content + format
- **Target Coverage**: 100% of validation logic
- **Estimated Time**: 1 hour
- **Depends On**: Task 1.1
- **Files Modified**: `src/tasks/tasks.service.spec.ts`

#### Task 4.2: Unit Tests for Auto-completion
- [ ] Test: Mark non-final subtask complete (no auto-completion)
- [ ] Test: Mark final subtask complete (trigger auto-completion)
- [ ] Test: Auto-completion doesn't happen if other subtasks pending
- [ ] Test: Event is emitted on auto-completion
- **Target Coverage**: 100% of auto-completion logic
- **Estimated Time**: 1 hour
- **Depends On**: Task 2.1
- **Files Modified**: `src/subtasks/subtasks.service.spec.ts`

#### Task 4.3: Integration Tests for Full Flow
- [ ] Test: Complete task with subtasks (API + validation)
- [ ] Test: Toggle subtasks and trigger auto-completion (API)
- [ ] Test: Concurrent operations don't cause issues
- [ ] Test: Database constraints enforced
- **Estimated Time**: 1.5 hours
- **Depends On**: Task 4.1, Task 4.2
- **Files Modified**: `src/tasks/tasks.integration.spec.ts` (new)

#### Task 4.4: Frontend Component Tests
- [ ] Test: TaskRow checkbox disabled if subtasks incomplete
- [ ] Test: Toast shown when trying to complete task with subtasks
- [ ] Test: Subtask toggle auto-updates parent checkbox
- [ ] Test: Error messages displayed correctly
- **Target Coverage**: 90% of frontend state updates
- **Estimated Time**: 1.5 hours
- **Depends On**: Task 3.1, Task 3.3
- **Files Modified**: `src/components/DashboardPage.test.tsx`

#### Task 4.5: E2E Tests (API + UI)
- [ ] Test: Complete flow - toggle subtasks, parent auto-completes
- [ ] Test: Error flow - try complete task with subtasks, see error
- [ ] Test: Edge cases - delete subtasks, complete parent, etc.
- **Estimated Time**: 2 hours
- **Depends On**: All tasks in phases 1-3
- **Files Modified**: `e2e/task-completion.spec.ts` (new)

---

### Phase 5: Documentation & Review

#### Task 5.1: API Documentation
- [ ] Document PATCH /tasks/:id behavior with validation
- [ ] Document error codes (400, 403, 404)
- [ ] Document auto-completion via subtask toggle
- **Estimated Time**: 30 minutes
- **Depends On**: Task 1.1, Task 2.1
- **Files Modified**: `docs/api.md`

#### Task 5.2: Code Review Preparation
- [ ] Create pull request with clear description
- [ ] Add review checklist (validation, state consistency, test coverage)
- [ ] Document any assumptions or trade-offs
- **Estimated Time**: 30 minutes
- **Depends On**: Phases 1-4 complete
- **Files Modified**: PR description

#### Task 5.3: Final Verification
- [ ] All tests passing (unit, integration, E2E, frontend)
- [ ] Code coverage > 90%
- [ ] Linting passes (ESLint)
- [ ] Type checking passes (tsc)
- [ ] Build succeeds locally
- **Estimated Time**: 30 minutes
- **Depends On**: Phases 1-4 complete
- **Files Modified**: None (verification only)

---

## Task Dependencies

```
Task 1.1 ──→ Task 1.2 ──→ Task 1.3
                              ↓
                           Task 2.1
              ↓                ↓
         Task 2.3           Task 2.2
              ↓                ↓
         Task 4.2 ← ─ ───────┘
              ↓
         Task 4.3
              ↓

Task 3.1 ──→ Task 3.2
              ↓
          Task 3.3 ──→ Task 3.4
              ↓
          Task 4.4 ──→ Task 4.5 ──→ Task 5.1
                                       ↓
                                   Task 5.2 ↔ Task 5.3
```

## Parallel Work Opportunities

- **Task 3.1 & Task 4.1** can start simultaneously (independent: frontend vs backend)
- **Task 3.2 & Task 2.1** can start simultaneously after Task 1.1
- **Task 2.3 & Task 2.2** can start simultaneously after Task 2.1
- **Task 4.2 & Task 4.3** can start after Task 2.1 completes
- **Task 4.4** can start after Task 3.3 completes

## Critical Path

1. Task 1.1 (Backend validation) - **Gate for E2E testing**
2. Task 2.1 (Auto-completion) - **Gate for frontend subtask toggle**
3. Task 3.3 (Frontend auto-complete) - **Gate for full flow E2E**
4. Task 4.5 (E2E tests) - **Verification gate**
5. Task 5.3 (Final verification) - **Completion gate**

**Estimated Critical Path Duration**: 5-7 days (assuming 6-8 hours/day)

## Effort Summary

| Phase | Tasks | Est. Hours | Depends On |
|-------|-------|-----------|-----------|
| 1: Backend Validation | 3 | 1.25 | T-202 |
| 2: Auto-completion | 3 | 2 | Phase 1 |
| 3: Frontend Validation | 4 | 2.25 | Phase 2 |
| 4: Testing | 5 | 7 | Phases 1-3 |
| 5: Documentation | 3 | 1.5 | Phase 4 |
| **TOTAL** | **18** | **14 hrs** | **~2 days** |

## Risk Mitigation

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| State consistency (UI vs DB) | Medium | High | Comprehensive integration tests |
| Race condition (concurrent subtask updates) | Low | Medium | Use idempotent updates, test concurrency |
| Frontend validation not matching backend | High | High | Tests for both layers |
| Auto-completion not triggering correctly | Medium | Medium | Dedicated unit tests + E2E flow |
| Performance regression on subtask toggle | Low | Low | Benchmark toggle latency |

## Testing Coverage Goals

- **Unit Tests**: 100% of validation + auto-completion logic
- **Integration Tests**: All business rule scenarios
- **E2E Tests**: Complete user workflows
- **Frontend Tests**: State updates and UI reflecting logic
- **Overall Coverage**: Target > 90% code coverage

---

**Planning Status**: Ready for Implementation  
**Last Updated**: 2026-03-20  
**Next Phase**: Begin Phase 1 tasks (backend validation)
