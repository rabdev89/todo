# T-207 Design: Task Completion Logic & Dependencies

## Architecture Overview

### Problem Statement
Currently, tasks can be marked as "completed" regardless of subtask status, violating the PRD business logic which requires:
1. **Dependency enforcement**: Block task completion if any subtask is pending/in_progress
2. **Auto-completion**: Auto-complete parent task when last subtask is completed
3. **Manual override**: Allow completion for tasks with no subtasks

This creates inconsistent states and poor UX.

### Solution: Multi-Layer Validation Pattern

Implement completion rules across backend (validation) and frontend (UX) layers:
1. **Backend validation** (source of truth)
2. **Frontend pre-flight check** (UX responsiveness)
3. **Auto-completion trigger** (side effects)

---

## Data Flow & State Management

### Scenario 1: Task with Pending Subtasks

```
User tries to mark Task as "completed"
    ↓
[Frontend] Check if task has incomplete subtasks
    ├─ If yes → Show error toast, block UI update
    └─ If no → Proceed to API call
    ↓
[Backend] PATCH /tasks/:id { status: "completed" }
    ↓
[Validation] Query subtasks for this task
    ├─ findAll(taskId) → count where isCompleted = false
    ├─ If count > 0 → Return 400 Bad Request
    │  Error: "Cannot complete task with pending subtasks"
    └─ If count = 0 → Allow update
    ↓
[API Response] Error → Toast on frontend, keep UI state unchanged
```

**User Experience**:
- Click task checkbox
- Toast appears: "Complete all subtasks first"
- Checkbox remains unchecked
- Optional: Highlight uncompleted subtasks with color

---

### Scenario 2: Last Subtask Completed (Auto-completion)

```
User marks final subtask as "completed"
    ↓
PATCH /subtasks/:id { isCompleted: true }
    ↓
[Backend SubtasksService.toggle()]
    ├─ Update subtask
    ├─ Get parent task ID
    ├─ Check: Are all subtasks now complete?
    │  findAll(taskId) → count where isCompleted = false
    │  If count = 0:
    │    └─ [Trigger Auto-completion]
    │       PATCH task { status: "completed" }
    │       Emit event: taskAutoCompleted (for logging)
    └─ Return updated subtask
    ↓
[Frontend] Receive subtask update
    ├─ Update subtask UI
    ├─ Check if task should be auto-checked
    │  (If all subtasks complete, auto-update task checkbox)
    └─ Show success toast: "Task completed automatically"
```

**User Experience**:
- Click final subtask checkbox
- It checks with animation
- Parent task checkbox auto-checks
- Toast: "All done! Task marked as completed"

---

### Scenario 3: Task with No Subtasks

```
User marks task as "completed"
    ↓
[Frontend] Check if task has subtasks
    ├─ If no subtasks → Allow completion immediately
    └─ If has subtasks → Apply Scenario 1 logic
    ↓
[Backend] Update task with no validation needed
    ↓
[API Response] 200 OK, task completed
```

**User Experience**:
- Click task checkbox
- It checks immediately (no async delay needed)
- No error blocking

---

## Backend Implementation Design

### TasksService.update() Logic

**Current Implementation** (incomplete):
```typescript
async update(userId: string, id: string, dto: UpdateTaskDto) {
  // ... ownership + type checks ...
  return await this.prisma.task.update({
    where: { id },
    data: { ...dto }
  });
}
```

**Proposed Implementation** (with validation):
```typescript
async update(userId: string, id: string, dto: UpdateTaskDto) {
  const existing = await this.prisma.task.findUnique({ 
    where: { id },
    include: { subtasks: true }
  });
  if (!existing) throw new NotFoundException('Task not found');
  if (existing.userId !== userId) throw new ForbiddenException();

  // NEW: Validate completion requirement
  if (dto.status === 'completed') {
    const pendingSubtasks = await this.prisma.subtask.count({
      where: { taskId: id, isCompleted: false }
    });
    if (pendingSubtasks > 0) {
      throw new BadRequestException(
        'Cannot complete task with pending subtasks. Complete all subtasks first.'
      );
    }
  }

  return await this.prisma.task.update({
    where: { id },
    data: { ...dto },
    include: { subtasks: true }
  });
}
```

### SubtasksService.toggle() Logic

**Current Implementation** (incomplete):
```typescript
async toggle(userId: string, id: string) {
  const existing = await this.prisma.subtask.findUnique({ where: { id } });
  // ... verify ownership via task ...
  return await this.prisma.subtask.update({
    where: { id },
    data: { isCompleted: !existing.isCompleted }
  });
}
```

**Proposed Implementation** (with auto-completion):
```typescript
async toggle(userId: string, id: string) {
  const existing = await this.prisma.subtask.findUnique({ 
    where: { id },
    include: { task: true }
  });
  if (!existing) throw new NotFoundException('Subtask not found');
  
  const task = await this.prisma.task.findUnique({
    where: { id: existing.taskId }
  });
  if (task.userId !== userId) throw new ForbiddenException();

  // Update subtask
  const newIsCompleted = !existing.isCompleted;
  const updated = await this.prisma.subtask.update({
    where: { id },
    data: { isCompleted: newIsCompleted }
  });

  // NEW: Check for auto-completion (only when marking as complete)
  if (newIsCompleted) {
    const pendingSubtasks = await this.prisma.subtask.count({
      where: { 
        taskId: existing.taskId, 
        isCompleted: false 
      }
    });

    if (pendingSubtasks === 0) {
      // All subtasks complete → auto-complete parent task
      await this.prisma.task.update({
        where: { id: existing.taskId },
        data: { status: 'completed' }
      });
      
      // Log event for audit trail
      this.logger.log(`Auto-completed task ${existing.taskId}`);
    }
  }

  return updated;
}
```

---

## Frontend Implementation Design

### DashboardPage State Management

**Current State** (incomplete):
```typescript
const [tasks, setTasks] = useState<Task[]>([]);
const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
```

**No changes needed** to state structure - validation happens in handlers.

### DashboardPage Completion Handler

**New Handler** (for task completion):
```typescript
const handleCompleteTask = async (taskId: string, newStatus: TaskStatus) => {
  const task = tasks?.find(t => t.id === taskId);
  if (!task) return;

  // Pre-flight check: Can we complete this task?
  if (newStatus === 'completed') {
    const incompleteTasks = task.subtasks?.filter(s => !s.isCompleted) || [];
    if (incompleteTasks.length > 0) {
      setToast(`Complete ${incompleteTasks.length} subtask(s) first`);
      return; // Don't make API call
    }
  }

  try {
    const updated = await apiFetch(`/tasks/${taskId}`, {
      method: 'PATCH',
      body: JSON.stringify({ status: newStatus })
    });

    // Update task in list
    setTasks(prev => 
      prev?.map(t => t.id === taskId ? updated : t) || []
    );
    setToast('Task updated');
  } catch (error) {
    if (error instanceof BadRequestException) {
      // Backend validation error (e.g., subtasks constraint)
      setToast(error.message);
    } else {
      setToast('Failed to update task');
    }
  }
};
```

### Subtask Toggle Handler

**Enhanced Handler** (for auto-completion):
```typescript
const handleToggleSubtask = async (subtaskId: string) => {
  const subtask = expandedTask?.subtasks?.find(s => s.id === subtaskId);
  if (!subtask) return;

  try {
    const updated = await apiFetch(`/subtasks/${subtaskId}`, {
      method: 'PATCH',
      body: JSON.stringify({ isCompleted: !subtask.isCompleted })
    });

    // Update expanded task with new subtask state
    const updatedSubtasks = expandedTask.subtasks.map(s =>
      s.id === subtaskId ? updated : s
    );
    
    const updatedTask = {
      ...expandedTask,
      subtasks: updatedSubtasks
    };

    // NEW: Check if all subtasks now complete
    const allComplete = updatedSubtasks.every(s => s.isCompleted);
    if (allComplete && subtask.isCompleted === false) {
      // Was just marked complete and now all are complete
      updatedTask.status = 'completed';
      setToast('All subtasks done! Task completed');
    }

    // Update global tasks + expanded detail
    setTasks(prev =>
      prev?.map(t => t.id === expandedTask.id ? updatedTask : t) || []
    );
    setSelectedDetailId(updatedTask.id); // Refresh detail view
  } catch (error) {
    setToast('Failed to update subtask');
  }
};
```

### UI Behavior Enhancement

**Task Row Completion Logic**:
```typescript
// In TaskRow component
const canComplete = task.subtasks?.length === 0 || 
                     task.subtasks?.every(s => s.isCompleted);

const handleTaskCheckbox = (e: ChangeEvent<HTMLInputElement>) => {
  if (e.target.checked && !canComplete) {
    e.preventDefault();
    // Show error via parent callback
    onCompletionBlocked?.(`Complete ${task.subtasks?.filter(s => !s.isCompleted).length || 0} subtask(s)`);
    return;
  }
  
  onToggle?.({ status: e.target.checked ? 'completed' : 'pending' });
};
```

---

## Error Handling Strategy

### Backend Error Cases

1. **Incomplete Subtasks**:
   ```
   Status: 400 Bad Request
   Body: {
     error: "BadRequestException",
     message: "Cannot complete task with pending subtasks. Complete all subtasks first.",
     statusCode: 400
   }
   ```

2. **Not Found**:
   ```
   Status: 404 Not Found
   Body: {
     error: "NotFoundException",
     message: "Task not found",
     statusCode: 404
   }
   ```

3. **Forbidden** (wrong user):
   ```
   Status: 403 Forbidden
   Body: {
     error: "ForbiddenException",
     message: "Access denied",
     statusCode: 403
   }
   ```

### Frontend Error Handling

```typescript
try {
  await apiFetch('/tasks/:id', { method: 'PATCH', ... });
} catch (error) {
  if (error.statusCode === 400) {
    // Validation error - expected in normal usage
    setToast(error.message);
  } else if (error.statusCode === 403) {
    // Should never happen unless auth changed
    setToast('Access denied');
  } else if (error.statusCode === 404) {
    // Task was deleted by another session
    setTasks(prev => prev?.filter(t => t.id !== taskId) || []);
    setToast('Task no longer exists');
  } else {
    // Network or server error
    setToast('Failed to update task. Please try again.');
  }
}
```

---

## Transaction Considerations

### Auto-completion Atomicity

When toggling last subtask to complete, two operations occur:
1. Update Subtask: `isCompleted = true`
2. Update Task: `status = completed` (auto-completion)

**Should use transaction?**
- **Option A**: Use $transaction (safer)
  ```typescript
  await this.prisma.$transaction(async (tx) => {
    await tx.subtask.update(...);
    if (allComplete) await tx.task.update(...);
  });
  ```
- **Option B**: Sequential updates (simpler)
  ```typescript
  await this.prisma.subtask.update(...);
  if (allComplete) await this.prisma.task.update(...);
  ```

**Decision**: Option A (transaction) for consistency, but lower priority than core feature.

---

## Edge Cases & Validation Rules

### Edge Case 1: Task Already Completed
- User tries to mark already-completed task as completed
- **Expected**: Idempotent - 200 OK (no change)
- **Implementation**: Allow (NestJS default behavior)

### Edge Case 2: Uncompleting Task with Completed Subtasks
- User marks completed task back to "pending"
- **Validation**: Allow (no constraint on downgrade)
- **Logic**: Don't auto-revert subtasks

### Edge Case 3: Deleting Only Subtask
- Task has 1 subtask, user deletes it
- Task becomes subtask-free
- **Expected**: Task can now be completed by user
- **Note**: T-206 handles cascading deletes

### Edge Case 4: Concurrent Subtask Updates
- User A completes last subtask
- User B completes different subtask
- Task gets auto-completed twice
- **Handling**: Idempotent update (second call is no-op)

---

## Acceptance Criteria

- ✅ Task completion blocked if subtasks incomplete (400 error)
- ✅ Error message clear: "Complete all subtasks first"
- ✅ Auto-completion triggered when last subtask complete
- ✅ Frontend validation prevents unnecessary API calls
- ✅ Frontend UI updates immediately on subtask toggle
- ✅ Parent task checkbox auto-checks when auto-completed
- ✅ Tasks without subtasks can be completed freely
- ✅ Error handling shows appropriate user messages
- ✅ All validation scenarios covered by tests

---

## Design Decision Log

| Decision | Rationale | Status |
|----------|-----------|--------|
| Backend validation (source of truth) | Ensures data integrity | ✅ Approved |
| Frontend pre-flight check | Better UX, fewer API calls | ✅ Approved |
| Auto-completion on last subtask toggle | User expectation, PRD requirement | ✅ Approved |
| Transaction for auto-completion | Consistency guarantee | ⏳ Nice-to-have |
| Error code 400 for constraint violation | Standard REST pattern | ✅ Approved |
| Idempotent updates (allow duplicate completes) | Simplicity, fault-tolerance | ✅ Approved |

---

**Design Status**: Ready for Planning Phase  
**Last Updated**: 2026-03-20  
**Next Phase**: Implement task breakdown and test strategy
