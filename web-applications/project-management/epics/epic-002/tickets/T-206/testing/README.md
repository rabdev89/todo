# T-206 Testing: Cascading Deletes

## Test Strategy

### Testing Pyramid

```
                    🔺 E2E Tests (API Layer)
                   /|\  - Full API flow
                  / | \ - Real database
                 /  |  \
                /   |   \
               🔺----🔺 Integration Tests
              /|    |\  - Database cascades
             / |    | \ - Service layer
            /  |    |  \
           /   |    |   \
          🔺---🔺---🔺 Unit Tests (Methods)
         / |  |  |  | \  - Service methods
        /  |  |  |  |  \ - Pure functions
       /   |  |  |  |   \
      🔺---🔺--🔺--🔺---🔺
     Unit: Single delete, bulk delete, authorization
```

### Test Coverage Goals

- **Unit Tests**: 100% coverage of service methods
- **Integration Tests**: All cascade relationships
- **E2E Tests**: Complete API workflows
- **Performance Tests**: Latency benchmarks
- **Overall Coverage**: > 90% code coverage

---

## Unit Tests

### UT-SINGLE-DELETE-001: Delete Task with No Attachments

**Setup**:
- User authenticated (JWT token valid)
- Task created without attachments
- Subtasks exist (to verify cascade)

**Test Steps**:
1. Call `TasksService.remove(userId, taskId)`
2. Verify Task deleted from database
3. Verify associated Subtasks deleted (cascade)
4. Verify attachment cleanup not called

**Expected Results**:
- ✅ Task.count() decreases by 1
- ✅ Subtask.count() decreases by N
- ✅ No FileService.deleteFile() called
- ✅ Transaction committed successfully

**Status**: ⏳ To be implemented

---

### UT-SINGLE-DELETE-002: Delete Task with Multiple Attachments

**Setup**:
- User authenticated
- Task with 3 attachments (different storage types)
- Mock FileService for file cleanup

**Test Steps**:
1. Call `TasksService.remove(userId, taskId)`
2. Verify file cleanup called for each attachment
3. Verify Attachment records deleted from DB
4. Verify Task deleted from DB

**Expected Results**:
- ✅ FileService.deleteFile() called 3 times
- ✅ Attachment records deleted
- ✅ Task deleted
- ✅ All 3 operations committed atomically

**Status**: ⏳ To be implemented

---

### UT-SINGLE-DELETE-003: File Deletion Failure Causes Rollback

**Setup**:
- User authenticated
- Task with 2 attachments
- FileService.deleteFile() throws error on first file

**Test Steps**:
1. Call `TasksService.remove(userId, taskId)`
2. First file deletion fails
3. Verify transaction rolls back

**Expected Results**:
- ✅ Error thrown from service
- ✅ Task still exists in DB (rollback)
- ✅ Attachment records still exist (rollback)
- ✅ Exception type: `CascadingDeleteException`

**Status**: ⏳ To be implemented

---

### UT-SINGLE-DELETE-004: Authorization Check Prevents Delete

**Setup**:
- User A owns Task
- User B attempts to delete User A's Task

**Test Steps**:
1. Call `TasksService.remove(userB.id, userA.taskId)`
2. Ownership check fails
3. Expect ForbiddenException

**Expected Results**:
- ✅ ForbiddenException thrown
- ✅ No delete operation executed
- ✅ Task still exists in DB
- ✅ No file cleanup attempted

**Status**: ⏳ To be implemented

---

### UT-SINGLE-DELETE-005: Task Not Found

**Setup**:
- User authenticated
- TaskId does not exist

**Test Steps**:
1. Call `TasksService.remove(userId, invalidId)`
2. Expect NotFoundException

**Expected Results**:
- ✅ NotFoundException thrown
- ✅ No delete operation executed
- ✅ No file cleanup attempted

**Status**: ⏳ To be implemented

---

### UT-BULK-DELETE-001: Bulk Delete Multiple Tasks with Mixed Attachments

**Setup**:
- User authenticated
- 3 tasks: Task A (0 attachments), Task B (2 attachments), Task C (1 attachment)

**Test Steps**:
1. Call `TasksService.bulkRemove(userId, [taskA.id, taskB.id, taskC.id])`
2. Verify all file deletions called
3. Verify all tasks deleted

**Expected Results**:
- ✅ FileService.deleteFile() called 3 times total
- ✅ All 3 tasks deleted
- ✅ All 3 attachments deleted
- ✅ Transaction committed atomically

**Status**: ⏳ To be implemented

---

### UT-BULK-DELETE-002: Bulk Delete Authorization Check

**Setup**:
- User A owns Tasks 1 & 2
- User B owns Task 3
- User A attempts bulk delete of all 3

**Test Steps**:
1. Call `TasksService.bulkRemove(userA.id, [task1, task2, task3])`
2. Verify filter by userId

**Expected Results**:
- ✅ Only Tasks 1 & 2 deleted (userId filter)
- ✅ Task 3 still exists
- ✅ No ForbiddenException (filtered safely)

**Status**: ⏳ To be implemented

---

### UT-BULK-DELETE-003: Empty List Handling

**Setup**:
- User authenticated
- Empty array of task IDs

**Test Steps**:
1. Call `TasksService.bulkRemove(userId, [])`

**Expected Results**:
- ✅ No error thrown
- ✅ No delete operation executed
- ✅ Result: { deletedCount: 0 }

**Status**: ⏳ To be implemented

---

## Integration Tests

### IT-CASCADE-001: Subtask Cascade Delete (Database-Level)

**Setup**:
- Task with 3 Subtasks
- Delete Task via Prisma

**Test Steps**:
1. Delete Task from database
2. Query Subtasks where taskId = deletedTask.id

**Expected Results**:
- ✅ Subtask count = 0 (cascade worked)
- ✅ No orphaned Subtasks in DB
- ✅ Cascading enforced by DB constraint

**Status**: ⏳ To be implemented

---

### IT-CASCADE-002: Attachment Cascade Delete (Database-Level)

**Setup**:
- Task with 3 Attachments
- Delete Task via Prisma

**Test Steps**:
1. Delete Task from database
2. Query Attachments where taskId = deletedTask.id

**Expected Results**:
- ✅ Attachment count = 0 (cascade worked)
- ✅ No orphaned Attachments in DB

**Status**: ⏳ To be implemented

---

### IT-CASCADE-003: Transaction Atomicity Test

**Setup**:
- Task with 2 Attachments
- Simulate failure on 2nd file deletion

**Test Steps**:
1. Start cascading delete within transaction
2. File 1 deletion succeeds
3. File 2 deletion fails
4. Transaction rolls back

**Expected Results**:
- ✅ Task still exists
- ✅ 2 Attachments still exist
- ✅ Neither file deleted from storage
- ✅ Consistent state guaranteed

**Status**: ⏳ To be implemented

---

### IT-CASCADE-004: Concurrent Delete Operations

**Setup**:
- Task A and Task B exist
- User attempts to delete both simultaneously

**Test Steps**:
1. Execute bulkRemove(userId, [taskA.id, taskB.id]) within transaction
2. Verify lock contention handling

**Expected Results**:
- ✅ Both tasks deleted
- ✅ No deadlock
- ✅ Transaction completes in < 5 seconds

**Status**: ⏳ To be implemented

---

## E2E Tests

### E2E-ENDPOINT-001: DELETE /tasks/:id Single Task Delete

**Setup**:
- Authenticated user
- Task with attachments exists

**Test Steps**:
1. Send DELETE /tasks/{taskId}
2. Verify 200 OK response
3. Query database for orphaned records

**Expected Results**:
- ✅ HTTP 200 response
- ✅ Response: { ok: true }
- ✅ Task deleted from DB
- ✅ All attachments deleted from DB
- ✅ No orphaned subtasks

**Status**: ⏳ To be implemented

---

### E2E-ENDPOINT-002: DELETE /tasks/:id Authorization Error

**Setup**:
- Authenticated as User A
- User B's Task targeted

**Test Steps**:
1. Send DELETE /tasks/{user_b_task_id}
2. Verify 403 Forbidden response

**Expected Results**:
- ✅ HTTP 403 response
- ✅ Task not deleted
- ✅ No state changes

**Status**: ⏳ To be implemented

---

### E2E-ENDPOINT-003: DELETE /tasks/bulk Multiple Tasks

**Setup**:
- Authenticated user
- 3 tasks with attachments

**Test Steps**:
1. Send DELETE /tasks/bulk with { ids: [task1, task2, task3] }
2. Verify 200 OK response
3. Query for orphaned records

**Expected Results**:
- ✅ HTTP 200 response
- ✅ All 3 tasks deleted
- ✅ All attachments deleted
- ✅ No orphaned subtasks

**Status**: ⏳ To be implemented

---

### E2E-ENDPOINT-004: Large Bulk Delete (1000+ Tasks)

**Setup**:
- Authenticated user
- 1000 tasks (100+ with attachments)

**Test Steps**:
1. Send DELETE /tasks/bulk with { ids: [1000 task IDs] }
2. Measure response time
3. Verify eventual consistency

**Expected Results**:
- ✅ HTTP 200 response (or appropriate timeout handling)
- ✅ All tasks eventually deleted
- ✅ Response time < 10 seconds
- ✅ No database locks hanging

**Status**: ⏳ To be implemented

---

### E2E-ENDPOINT-005: File Cleanup Verification (Mocked S3)

**Setup**:
- Authenticated user
- Attachment with storage_type = 's3'
- Mock S3 service

**Test Steps**:
1. Delete Task via DELETE /tasks/:id
2. Verify S3 deleteObject() called with correct key

**Expected Results**:
- ✅ HTTP 200 response
- ✅ S3Service.deleteObject() called once
- ✅ Correct S3 key passed

**Status**: ⏳ To be implemented

---

## Performance Tests

### PERF-001: Single Task Delete Latency

**Benchmark**: Delete single task with no attachments

- **Target**: < 100ms
- **Measurement**: Start delete query → end response
- **Runs**: 100 iterations
- **Metrics**: P50, P95, P99 latency

**Expected Results**:
- ✅ P50 < 50ms
- ✅ P95 < 100ms
- ✅ P99 < 150ms

**Status**: ⏳ To be implemented

---

### PERF-002: Bulk Delete Latency (100 tasks)

**Benchmark**: Delete 100 tasks with 2 attachments each (no file cleanup)

- **Target**: < 1 second
- **Measurement**: Start bulk delete → end response
- **Runs**: 10 iterations
- **Metrics**: P50, P95, P99 latency

**Expected Results**:
- ✅ P50 < 500ms
- ✅ P95 < 1000ms
- ✅ P99 < 1500ms

**Status**: ⏳ To be implemented

---

### PERF-003: File Cleanup Throughput

**Benchmark**: Delete 1000 attachments in parallel

- **Target**: < 50ms per attachment average
- **Measurement**: File cleanup time per attachment
- **Runs**: 1 iteration (1000 files)
- **Metrics**: Total time, avg per file

**Expected Results**:
- ✅ Average < 50ms per attachment
- ✅ Total < 50 seconds

**Status**: ⏳ To be implemented

---

## Manual Verification Checklist

Before accepting this ticket as complete:

- [ ] Database migration applied successfully
- [ ] Subtask cascade delete verified (DELETE task → subtasks gone)
- [ ] Attachment cascade delete verified (DELETE task → attachments gone)
- [ ] Transaction rollback tested (failure → no state change)
- [ ] Authorization check verified (wrong user → 403)
- [ ] File cleanup called (mocked storage)
- [ ] Performance benchmarks passed
- [ ] All tests passing (unit, integration, E2E)
- [ ] Code coverage > 90%
- [ ] Linting passes
- [ ] Type checking passes
- [ ] Build succeeds

---

**Testing Status**: Test cases defined, implementation pending  
**Last Updated**: 2026-03-20  
**Next Phase**: Implement test cases during development
