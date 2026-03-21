# T-206 Phase 3 — Manual QA & Verification Checklist

**Purpose**: Verify cascading delete functionality with real database, files, and API calls

**Duration**: ~45 minutes  
**Prerequisites**: Running backend server, test database, file uploads enabled

---

## Setup (5 minutes)

- [ ] **Database**: Confirm test database is running and accessible
- [ ] **Backend**: Start backend server: `npm run start:dev` (or equivalent)
- [ ] **API Client**: Have Postman/Insomnia or cURL ready
- [ ] **File Storage**: Confirm `uploads/` directory exists and is writable
- [ ] **Test User**: Create test user account and get auth token (if auth required)

```bash
# Example: Start backend in dev mode
cd web-applications/backend
npm run start:dev

# In another terminal, verify server is running:
curl http://localhost:3000/health
```

---

## TC-206-001: Single Task Delete (No Attachments)

**Steps**:
1. [ ] Create task via API: `POST /tasks` with title="Manual QA Task 1"
2. [ ] Record task ID from response
3. [ ] Create 1 subtask via `POST /tasks/:taskId/subtasks`
4. [ ] Delete task via `DELETE /tasks/:taskId`
5. [ ] Verify response: `{ ok: true, deleted: { taskId, attachmentCount: 0 } }`

**Verification**:
- [ ] Task no longer visible in `GET /tasks`
- [ ] Subtask no longer exists in test DB: `SELECT * FROM subtasks WHERE task_id = '<taskId>'`
- [ ] No database error logs in backend console

**Expected Outcome**: ✅ PASS

---

## TC-206-002: Single Task Delete (With Attachments)

**Steps**:
1. [ ] Create task: `POST /tasks` with title="Manual QA Task 2"
2. [ ] **Upload 3 files** to task:
   - `POST /tasks/:taskId/attachments` (file: document.pdf)
   - `POST /tasks/:taskId/attachments` (file: spreadsheet.xlsx)
   - `POST /tasks/:taskId/attachments` (file: image.png)
3. [ ] Record file paths from upload responses
4. [ ] **Delete task**: `DELETE /tasks/:taskId`
5. [ ] Verify response includes: `attachmentCount: 3`

**Verification**:
- [ ] All 3 attachment records deleted from DB
- [ ] All 3 files deleted from `uploads/` directory (check with `ls -la uploads/`)
- [ ] Response shows no `failedFileDeletions` (or empty array)
- [ ] No error logs in backend console

**Expected Outcome**: ✅ PASS

```bash
# Verify files deleted from filesystem:
ls -lah uploads/ | wc -l  # Should be ~2-3 files less after delete

# Verify attachments deleted from DB:
SELECT COUNT(*) FROM attachments WHERE task_id = '<taskId>';  # Should return 0
```

---

## TC-206-003: Single Task Delete (File Deletion Failure)

**Steps**:
1. [ ] Create task: `POST /tasks` with title="Manual QA Task 3"
2. [ ] Upload 2 files to task
3. [ ] **Manually delete one file** from `uploads/` directory before deleting task
   ```bash
   rm uploads/<file-path>
   ```
4. [ ] Delete task via `DELETE /tasks/:taskId`
5. [ ] Verify response includes: `attachmentCount: 2`

**Verification**:
- [ ] Response: `ok: true` (still succeeds despite file failure)
- [ ] Response includes `failedFileDeletions` array with 1 entry
- [ ] Failed entry shows: `{ attachmentId, filename, error: "File not found" }`
- [ ] Both attachment records still deleted from DB
- [ ] Backend logs show WARN message about file deletion failure

**Expected Outcome**: ✅ PASS (Graceful Degradation)

```bash
# Check backend logs for:
[TasksService] Failed to delete file for attachment <id> - File not found
```

---

## TC-206-004: Bulk Delete (Multiple Tasks)

**Steps**:
1. [ ] Create 3 tasks:
   - Task A: 2 attachments
   - Task B: 0 attachments
   - Task C: 3 attachments
2. [ ] Record task IDs: `[taskA, taskB, taskC]`
3. [ ] Bulk delete via `DELETE /tasks/bulk` with body: `{ ids: [taskA, taskB, taskC] }`
4. [ ] Verify response: `{ taskCount: 3, attachmentCount: 5 }`

**Verification**:
- [ ] All 3 tasks missing from `GET /tasks`
- [ ] All 5 attachment records deleted from DB
- [ ] All files from tasks A & C deleted from filesystem
- [ ] No `failedFileDeletions` if cleanup successful

**Expected Outcome**: ✅ PASS

```bash
# Verify bulk delete from DB:
SELECT COUNT(*) FROM tasks WHERE id IN ('<taskA>', '<taskB>', '<taskC>');  # Should return 0
SELECT COUNT(*) FROM attachments WHERE task_id IN ('<taskA>', '<taskB>', '<taskC>');  # Should return 0
```

---

## TC-206-005: Authorization Check

**Steps**:
1. [ ] Create **User A** and get auth token A
2. [ ] **Logged in as User A**:
   - Create task: `POST /tasks` with title="User A Task"
   - Record taskId
3. [ ] Create **User B** and get auth token B
4. [ ] **Logged in as User B**:
   - Attempt delete: `DELETE /tasks/:taskId` (user A's task)
5. [ ] Verify response: Status 403, message contains "Forbidden"

**Verification**:
- [ ] Task still exists in DB
- [ ] Attachments not deleted
- [ ] No files removed from filesystem
- [ ] Backend logs show "ForbiddenException" 

**Expected Outcome**: ✅ PASS (Request denied)

---

## TC-206-006: Transaction Atomicity

**Steps**:
1. [ ] Create task with 2 attachments
2. [ ] **Within same transaction**:
   - Task should be deleted
   - Both attachments should be deleted
   - Both files should be cleaned up
3. [ ] Verify consistency: All or nothing (no orphaned records)

**Verification**:
- [ ] Check DB: No task, no attachments
- [ ] Check filesystem: No files remaining
- [ ] No partial deletions or orphaned records
- [ ] Backend logs show atomic transaction completion

**Expected Outcome**: ✅ PASS (All-or-nothing semantics)

```bash
# Verify atomic nature:
# If delete partially fails, DB should still be consistent
# (Task deleted means attachments also deleted)
SELECT * FROM tasks WHERE id = '<taskId>';  # NULL
SELECT * FROM attachments WHERE task_id = '<taskId>';  # Empty
```

---

## TC-206-007: Error Handling (Empty Task IDs)

**Steps**:
1. [ ] Attempt bulk delete with empty array: `DELETE /tasks/bulk` with `{ ids: [] }`
2. [ ] Verify response: Status 400, message="No task IDs provided"

**Expected Outcome**: ✅ PASS (Proper validation)

---

## TC-206-008: Cascade Verification (GET after DELETE)

**Steps**:
1. [ ] Create task with 2 subtasks and 3 attachments
2. [ ] Delete task via `DELETE /tasks/:taskId`
3. [ ] Immediately call `GET /tasks/:taskId`
4. [ ] Verify response: Status 404, message="Task not found"

**Verification**:
- [ ] Task is truly deleted (404, not hidden)
- [ ] Cascade effects visible immediately
- [ ] No lag in visibility

**Expected Outcome**: ✅ PASS (Immediate consistency)

---

## Performance Baseline (15 minutes)

### PB-001: Single Delete with 10 Attachments

**Steps**:
1. [ ] Create task
2. [ ] Upload **10 files** (mixed sizes: 100KB to 2MB)
3. [ ] Set timer
4. [ ] Delete task
5. [ ] Record completion time

**Expected**: < 3 seconds  
**Actual**: ___ seconds

- [ ] Response time acceptable?

---

### PB-002: Bulk Delete of 50 Tasks (with 5 attachments each = 250 files)

**Steps**:
1. [ ] Create 50 tasks
2. [ ] Upload 5 files to each task
3. [ ] Set timer
4. [ ] Bulk delete all 50 tasks
5. [ ] Record completion time

**Expected**: < 30 seconds  
**Actual**: ___ seconds

- [ ] Response time acceptable?
- [ ] All 250 files cleaned up?
- [ ] Server responsive during bulk delete?

---

### PB-003: Large Bulk Delete (100+ tasks)

- [ ] Create 100 tasks with ≥3 attachments each
- [ ] Bulk delete all
- [ ] Record time: ___ seconds
- [ ] No timeout errors?
- [ ] Database consistent after delete?

---

## Database Consistency Check

After all manual tests, run:

```sql
-- Should return 0 (no orphaned attachments without tasks)
SELECT COUNT(*) FROM attachments WHERE task_id NOT IN (SELECT id FROM tasks);

-- Should return 0 (no orphaned subtasks without tasks)
SELECT COUNT(*) FROM subtasks WHERE task_id NOT IN (SELECT id FROM tasks);

-- Verify user's remaining tasks are intact
SELECT COUNT(*) FROM tasks WHERE user_id = '<userId>';
```

**Verification**:
- [ ] No orphaned attachments: ✅
- [ ] No orphaned subtasks: ✅
- [ ] User data integrity: ✅

---

## File System Consistency Check

```bash
# Check for orphaned files (files not referenced in DB)
# This is harder to verify without a file manifest, but:
du -sh uploads/  # Total size should have decreased

# List recent deletion times:
ls -lt uploads/ | head -20
```

**Verification**:
- [ ] Upload directory size reduced after deletes
- [ ] Recent deletions shown in file timestamps

---

## Sign-Off

| Check | Status | Notes |
|-------|--------|-------|
| Single delete (no attachments) | ⏳ | |
| Single delete (with attachments) | ⏳ | |
| Graceful failure handling | ⏳ | |
| Bulk delete | ⏳ | |
| Authorization enforcement | ⏳ | |
| Transaction atomicity | ⏳ | |
| Cascade verification | ⏳ | |
| Performance baseline | ⏳ | |
| DB consistency | ⏳ | |
| File system cleanup | ⏳ | |

**QA Tester**: ___________________  
**Date**: ___________________  
**Overall Result**: ⏳ PENDING

---

## Notes & Observations

```
(Use this section to document any issues, edge cases, or findings)

Example:
- File deletion took longer than expected when deleting 100+ files
- No authorization checks on subtask deletion (cascade handles it)
- Error message could be more specific about which files failed
```

---

## Follow-Up Actions

- [ ] All manual tests passed → Proceed to Phase 4
- [ ] Some tests failed → Document issues and create bug tickets
- [ ] Performance concerns → Optimize database queries or implement batching
- [ ] Recommendations for production:
  - [ ] Add monitoring for cascade delete operations
  - [ ] Implement async file deletion for large batches
  - [ ] Create database backup before bulk deletes
