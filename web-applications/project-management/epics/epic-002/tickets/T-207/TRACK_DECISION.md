# T-207 Track Decision: Task Completion Logic & Dependencies

## Decision: Track B (Full) ✅

### Justification

**Question 1: Scope Check**
- Modifies business logic across multiple services? **YES** - TasksService, frontend state management
- API contract changes? **YES** - update() behavior changes (validation rule)
- Multiple files affected (≥3)? **YES** - TasksService, DashboardPage, TaskDetailDrawer, TaskRow
- Shared type definitions changes? **Possibly** - UpdateTaskDto validation rules
→ **TRACK B (Full)**

**Question 2: Complexity Check**
- New feature implementation? **YES** - Business rule implementation (dependency enforcement + auto-completion)
- Complex validation logic? **YES** - Subtask dependency check, auto-completion trigger
- State management changes? **YES** - Frontend state updates on subtask toggle
- Potential side effects? **YES** - Changing one entity triggers another
→ **TRACK B (Full)**

**Question 3: Estimated Effort**
- Estimated time: 7-9 hours
  - Backend service logic: 2 hours
  - Frontend dependency validation: 2 hours
  - Frontend auto-completion: 1.5 hours
  - Testing (unit, integration, E2E): 3 hours
- Scope clarity: Medium (auto-completion behavior needs design)
→ **TRACK B (Full)**

### Why Track B

This ticket requires:
- **Business logic changes**: Implementing complex interdependency rules
- **Multi-layer updates**: Backend validation + frontend UI logic
- **State management**: Coordinating subtask toggle → parent auto-completion
- **Comprehensive testing**: Validation rules + side effects need thorough coverage
- **Design decisions**: Auto-completion behavior edge cases

### Implementation Scope

**Current State**:
- ✅ SubtaskService exists with toggle logic
- ✅ TasksService.update() handles basic updates
- ✅ Frontend renders subtasks with toggle checkboxes
- ❌ No subtask dependency validation on task completion
- ❌ No auto-completion logic when all subtasks complete
- ❌ No UI blocking for incomplete-subtask scenario

**Required Changes**:
1. Backend: Add validation in TasksService.update() to block completion if subtasks incomplete
2. Backend: Add auto-completion logic when last subtask marked complete
3. Frontend: Add validation check before attempting task completion
4. Frontend: Handle auto-completion UI update when subtask toggle completes last one
5. Frontend: Show appropriate error/UI message when completion blocked
6. Tests: Comprehensive coverage of all three scenarios

**Affected Files**:
- `src/tasks/tasks.service.ts` - Add validation + auto-completion logic
- `src/tasks/dto/update-task.dto.ts` - Possibly add validation metadata
- `src/subtasks/subtasks.service.ts` - Update toggle to call parent auto-completion
- `web-applications/frontend/src/components/DashboardPage.tsx` - Add validation before complete
- `web-applications/frontend/src/api/apiFetch.ts` - Potentially trap validation errors
- `src/tasks/**/*.spec.ts` - Add validation + auto-completion test cases

### Technical Decisions

1. **Validation Level**:
   - Primary: Backend validation (source of truth)
   - Secondary: Frontend validation (UX responsiveness)
   - Reason: Backend ensures data integrity, frontend provides better UX

2. **Auto-completion Trigger**:
   - When subtask is marked complete via PATCH /subtasks/:id
   - Check if all subtasks now complete
   - If yes: Auto-update task status to completed
   - Use transactional update to ensure atomicity

3. **Error Handling**:
   - Attempt to complete task with open subtasks: Return 400 Bad Request
   - Include error message: "Cannot complete task with pending subtasks"
   - Frontend catches error and displays toast notification

4. **UI Behavior** (Frontend):
   - When user clicks task completion checkbox with open subtasks:
     - Show toast error: "Complete all subtasks first"
     - Don't update checkbox state
     - Highlight open subtasks (visual indication)
   - When user completes last subtask:
     - Parent task checkbox auto-checks with visual feedback
     - Emit success notification

### Track B Artifacts Required

- ✅ `requirements/README.md` - Requirements defined
- ⏳ `design/README.md` - Design decisions (validation, auto-completion, state flow)
- ⏳ `planning/README.md` - Task breakdown and implementation sequence
- ⏳ `testing/README.md` - Test cases for all three scenarios
- ✅ `metadata.json` - Metadata marked as Track B

### Completion Gate

- [ ] Design phase complete with validation/auto-completion behavior finalized
- [ ] Planning phase complete with task breakdown
- [ ] Testing strategy defined with test cases
- [ ] Implementation follows Track B workflow (implement + test as you go)
- [ ] Backend validation working correctly (tests passing)
- [ ] Frontend validation/UI updates working correctly
- [ ] Auto-completion logic triggered correctly on last subtask
- [ ] All test cases passing (unit, integration, E2E)
- [ ] Code review completed with focus on state consistency

---

**Decision Date**: 2026-03-20  
**Track**: B (Full SDLC)  
**Status**: Scoped (ready for Design phase)  
**Next Phase**: Design → Planning → Implementation → Verification
