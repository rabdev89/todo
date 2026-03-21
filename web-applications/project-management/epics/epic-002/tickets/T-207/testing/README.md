# T-207 Testing: Task Completion Logic & Dependencies

## Test Strategy

### Testing Pyramid

```
                    🔺 E2E Tests (Full User Flow)
                   /|\  - Complete task + subtask toggle
                  / | \ - Error scenarios
                 /  |  \
                /   |   \
               🔺----🔺 Integration Tests
              /|    |\  - API validation + auto-complete
             / |    | \ - Database state verification
            /  |    |  \
           /   |    |   \
          🔺---🔺---🔺 Unit Tests (Methods)
         / |  |  |  | \  - Validation logic
        /  |  |  |  |  \ - Auto-completion trigger
       /   |  |  |  |   \
      🔺---🔺--🔺--🔺---🔺
     Unit: Validate incomplete subtasks, check all complete, auto-complete parent
```

### Test Coverage Goals

- **Unit Tests**: 100% coverage of validation + auto-completion logic
- **Integration Tests**: All business rule scenarios with database
- **E2E Tests**: Complete user workflows (API + UI)
- **Frontend Tests**: State updates and UI behavior
- **Overall Coverage**: > 90% code coverage

---

## Unit Tests (Backend)

### UT-VALIDATE-001: Block Completion with Single Incomplete Subtask

**Setup**:
- User authenticated
- Task with 2 subtasks (1 complete, 1 incomplete)

**Test Steps**:
1. Call `TasksService.update(userId, taskId, { status: 'completed' })`
2. Service queries pending subtasks
3. Count returns 1

**Expected Results**:
- ✅ BadRequestException thrown
- ✅ Error message: "Cannot complete task with pending subtasks"
- ✅ Task status NOT updated in database
- ✅ HTTP response: 400 Bad Request

**Status**: ⏳ To be implemented

---

### UT-VALIDATE-002: Block Completion with Multiple Incomplete Subtasks

**Setup**:
- User authenticated
- Task with 3 subtasks (1 complete, 2 incomplete)

**Test Steps**:
1. Call `TasksService.update(userId, taskId, { status: 'completed' })`

**Expected Results**:
- ✅ BadRequestException thrown
- ✅ Task status NOT updated
- ✅ No state change in database

**Status**: ⏳ To be implemented

---

### UT-VALIDATE-003: Allow Completion with All Subtasks Complete

**Setup**:
- User authenticated
- Task with 2 subtasks (both complete)

**Test Steps**:
1. Call `TasksService.update(userId, taskId, { status: 'completed' })`

**Expected Results**:
- ✅ Update succeeds
- ✅ Task.status = 'completed' in database
- ✅ HTTP response: 200 OK
- ✅ No exception thrown

**Status**: ⏳ To be implemented

---

### UT-VALIDATE-004: Allow Completion with No Subtasks

**Setup**:
- User authenticated
- Task with 0 subtasks

**Test Steps**:
1. Call `TasksService.update(userId, taskId, { status: 'completed' })`

**Expected Results**:
- ✅ Update succeeds
- ✅ Task.status = 'completed'
- ✅ No validation error

**Status**: ⏳ To be implemented

---

### UT-VALIDATE-005: Allow Downgrade (Completed to Pending)

**Setup**:
- User authenticated
- Task with status 'completed'

**Test Steps**:
1. Call `TasksService.update(userId, taskId, { status: 'pending' })`

**Expected Results**:
- ✅ Update succeeds (no validation on downgrade)
- ✅ Task.status = 'pending'
- ✅ Subtasks unchanged

**Status**: ⏳ To be implemented

---

### UT-AUTO-001: Auto-complete Parent Task When Last Subtask Complete

**Setup**:
- User authenticated
- Task with 2 subtasks (both marked false)
- First subtask already marked complete

**Test Steps**:
1. Call `SubtasksService.toggle(userId, secondSubtaskId)`
2. Service checks: are all subtasks now complete?
3. Count returns 0 (all complete)
4. Auto-completion triggered

**Expected Results**:
- ✅ Subtask.isCompleted = true
- ✅ Task.status automatically updated to 'completed'
- ✅ Both updates committed
- ✅ Event emitted: `TaskAutoCompletedEvent`
- ✅ HTTP response: 200 OK (subtask update response)

**Status**: ⏳ To be implemented

---

### UT-AUTO-002: Don't Auto-complete If Other Subtasks Pending

**Setup**:
- User authenticated
- Task with 3 subtasks (0 complete at start)
- Toggling first subtask to complete

**Test Steps**:
1. Call `SubtasksService.toggle(userId, firstSubtaskId)`
2. Service checks: are all subtasks complete?
3. Count returns 2 (still 2 pending)

**Expected Results**:
- ✅ Subtask.isCompleted = true
- ✅ Task.status NOT changed (remains 'pending')
- ✅ No auto-completion triggered
- ✅ No event emitted

**Status**: ⏳ To be implemented

---

### UT-AUTO-003: Toggle Subtask Back to Incomplete (No Impact)

**Setup**:
- User authenticated
- Task with 2 subtasks (both complete, task auto-completed)
- User unchecks one subtask

**Test Steps**:
1. Call `SubtasksService.toggle(userId, firstSubtaskId)` to mark incomplete
2. Service updates subtask
3. Check if all complete: No

**Expected Results**:
- ✅ Subtask.isCompleted = false
- ✅ Task.status NOT reverted (remains 'completed')
- ✅ No reverse auto-completion

**Status**: ⏳ To be implemented

---

### UT-AUTO-004: Do Not Auto-complete on Non-final Subtask

**Setup**:
- User authenticated
- Task with 3 subtasks (0 complete)

**Test Steps**:
1. Mark 1st subtask complete (2 still pending)

**Expected Results**:
- ✅ Only subtask updated
- ✅ Task status NOT changed
- ✅ No auto-completion

**Status**: ⏳ To be implemented

---

## Integration Tests

### IT-FLOW-001: Complete Task → API Validation → Database

**Setup**:
- Authenticated user
- Task with 1 incomplete subtask
- Real database

**Test Steps**:
1. Send PATCH /tasks/:id { status: 'completed' }
2. API handler calls TasksService.update()
3. Service validates subtasks
4. Validation fails

**Expected Results**:
- ✅ HTTP 400 Bad Request
- ✅ Error response contains constraint message
- ✅ Task.status NOT changed in database
- ✅ Subtask.isCompleted NOT changed

**Status**: ⏳ To be implemented

---

### IT-FLOW-002: Toggle Subtask → Auto-completion → Database & Parent Update

**Setup**:
- Authenticated user
- Task with 2 subtasks (1 complete, 1 incomplete)
- Real database

**Test Steps**:
1. Send PATCH /subtasks/:id { isCompleted: true }
2. Service toggles subtask
3. Service checks: all complete now?
4. Yes → Auto-completion triggered
5. Task updated in database

**Expected Results**:
- ✅ Subtask.isCompleted = true
- ✅ Task.status = 'completed'
- ✅ Both records updated in database
- ✅ HTTP 200 response (subtask update)

**Status**: ⏳ To be implemented

---

### IT-FLOW-003: Authorization Check on Completion

**Setup**:
- User A owns Task
- User B attempts to complete Task A

**Test Steps**:
1. User B calls TasksService.update(userB.id, taskA.id, ...)
2. Service queries task
3. task.userId !== userB.id

**Expected Results**:
- ✅ ForbiddenException thrown (before validation)
- ✅ No subtask check performed
- ✅ Task NOT updated

**Status**: ⏳ To be implemented

---

### IT-FLOW-004: Auto-completion Event Emitted

**Setup**:
- Authenticated user
- Task with 2 subtasks (1 complete)
- Event listener mocked

**Test Steps**:
1. Toggle last subtask complete
2. Auto-completion triggered
3. Event emitted

**Expected Results**:
- ✅ TaskAutoCompletedEvent emitted
- ✅ Event contains taskId, userId, timestamp
- ✅ Event listeners receive notification

**Status**: ⏳ To be implemented

---

## E2E Tests (API + Database)

### E2E-SCENARIO-001: User Unable to Complete Task with Subtasks (Error Flow)

**Setup**:
- Authenticated user
- Task "Write report" with 3 subtasks (2 done, 1 in progress)
- Starting at dashboard

**Test Steps**:
1. User sees task with incomplete subtask
2. User clicks task checkbox to mark complete
3. Request sent to PATCH /tasks/:id

**Expected Results**:
- ✅ HTTP 400 Bad Request
- ✅ Error message: "Complete all subtasks first"
- ✅ Checkbox remains unchecked
- ✅ Subtask still shows in detail drawer

**Status**: ⏳ To be implemented

---

### E2E-SCENARIO-002: Auto-completion Flow (Happy Path)

**Setup**:
- Authenticated user
- Task "Project Setup" with 2 subtasks: "Install dependencies" (done), "Configure env" (pending)
- Detail drawer open

**Test Steps**:
1. User sees last pending subtask checkbox
2. Clicks to mark it complete
3. Subtask updates on API
4. Parent task should auto-complete
5. Verify UI updates

**Expected Results**:
- ✅ Subtask checkbox checks with animation
- ✅ Parent task checkbox auto-checks
- ✅ Toast: "All done! Task completed"
- ✅ Task moves to completed state in list
- ✅ Detail drawer shows updated status

**Status**: ⏳ To be implemented

---

### E2E-SCENARIO-003: Parent Can't Auto-complete If Other Subtask Pending

**Setup**:
- Task with 3 subtasks (0 done)
- Detail drawer open

**Test Steps**:
1. Mark 1st subtask complete
2. Check task status
3. Should still be pending

**Expected Results**:
- ✅ 1st subtask checks
- ✅ Parent task remains pending
- ✅ Parent checkbox unchecked
- ✅ No auto-completion

**Status**: ⏳ To be implemented

---

### E2E-SCENARIO-004: Subtask Without Subtasks (Direct Complete)

**Setup**:
- Task with 0 subtasks
- Dashboard view

**Test Steps**:
1. User clicks task checkbox
2. No subtasks to check

**Expected Results**:
- ✅ Task checks immediately (no async delay)
- ✅ Status changes without error
- ✅ No validation block

**Status**: ⏳ To be implemented

---

### E2E-SCENARIO-005: Error Recovery (Try Again After Fix)

**Setup**:
- Task with incomplete subtask
- User attempts to complete (fails)
- User completes subtask
- User reattempts task completion

**Test Steps**:
1. Click task checkbox → error, unchecked
2. Complete the pending subtask
3. Click task checkbox again

**Expected Results**:
- ✅ First attempt: 400 error, checkbox unchecked
- ✅ Second attempt: 200 success, checkbox checks
- ✅ Task now marked completed

**Status**: ⏳ To be implemented

---

## Frontend Component Tests

### CT-UI-001: Task Checkbox Disabled If Subtasks Incomplete

**Setup**:
- TaskRow component with task (has incomplete subtasks)

**Test Steps**:
1. Render TaskRow
2. Inspect task completion checkbox

**Expected Results**:
- ✅ Checkbox is disabled or styled differently
- ✅ Tooltip shows: "Complete all subtasks first"
- ✅ Clicking doesn't trigger onChange

**Status**: ⏳ To be implemented

---

### CT-UI-002: Toast Error on Completion Attempt

**Setup**:
- DashboardPage with task (incomplete subtasks)
- Mock toast function

**Test Steps**:
1. Call handleCompleteTask() for task with incomplete subtasks
2. Pre-flight check detects incomplete subtasks

**Expected Results**:
- ✅ Toast.error() called with message
- ✅ No API call made
- ✅ Checkbox state unchanged

**Status**: ⏳ To be implemented

---

### CT-UI-003: Subtask Toggle Updates Parent Checkbox

**Setup**:
- TaskDetailDrawer with 2 subtasks (1 complete, 1 incomplete)

**Test Steps**:
1. Click incomplete subtask checkbox
2. Mock API response: all subtasks now complete
3. Component receives updated task

**Expected Results**:
- ✅ Subtask checkbox checks
- ✅ Parent task checkbox auto-checks
- ✅ Task detail rerenders (status updated)

**Status**: ⏳ To be implemented

---

### CT-UI-004: Error Message Display in Detail View

**Setup**:
- TaskDetailDrawer with task + incomplete subtasks
- User tries to mark task complete via drawer

**Test Steps**:
1. Click task completion toggle in drawer
2. Try to send PATCH
3. API returns 400 error

**Expected Results**:
- ✅ Error caught in handler
- ✅ Toast shows error message
- ✅ Checkbox rolls back (unchecked)
- ✅ Subtasks still visible to fix

**Status**: ⏳ To be implemented

---

## Performance Tests

### PERF-001: Validation Check Latency (Backend)

**Benchmark**: PATCH /tasks/:id with validation check

- **Target**: < 100ms (including DB query)
- **Measurement**: API request → validation query → response
- **Query**: SELECT COUNT(*) WHERE taskId = ? AND isCompleted = false
- **Metrics**: P50, P95, P99 latency

**Expected Results**:
- ✅ P50 < 50ms
- ✅ P95 < 100ms
- ✅ P99 < 150ms

**Status**: ⏳ To be implemented

---

### PERF-002: Auto-completion Trigger Latency

**Benchmark**: PATCH /subtasks/:id that triggers auto-completion

- **Target**: < 200ms (two DB updates)
- **Measurement**: Subtask update → parent auto-complete → response
- **Metrics**: P50, P95, P99 latency

**Expected Results**:
- ✅ P50 < 100ms
- ✅ P95 < 200ms
- ✅ P99 < 300ms

**Status**: ⏳ To be implemented

---

### PERF-003: Frontend Validation Check Latency

**Benchmark**: handleToggleSubtask() pre-flight check

- **Target**: < 50ms (in-memory check)
- **Measurement**: State check → validation → update decision
- **Metrics**: Latency from click to API call

**Expected Results**:
- ✅ < 50ms (in-memory, no DB)

**Status**: ⏳ To be implemented

---

## Manual Verification Checklist

Before accepting this ticket as complete:

- [ ] Backend validation blocks completion with incomplete subtasks
- [ ] Backend validation allows completion with all complete subtasks
- [ ] Backend validation allows completion for tasks with no subtasks
- [ ] Auto-completion triggered when last subtask completed
- [ ] Auto-completion NOT triggered if other subtasks pending
- [ ] Frontend validation prevents API call with incomplete subtasks
- [ ] Frontend shows error toast on validation failure
- [ ] Subtask toggle auto-checks parent task (if all complete)
- [ ] Error messages are clear and actionable
- [ ] All tests passing (unit, integration, frontend, E2E)
- [ ] Code coverage > 90%
- [ ] Linting passes
- [ ] Type checking passes
- [ ] Build succeeds
- [ ] Performance targets met

---

**Testing Status**: Test cases defined, implementation pending  
**Last Updated**: 2026-03-20  
**Next Phase**: Implement test cases during development
