# T-202 Planning: Subtask Logic

## Task Breakdown
1. [x] Metadata Update: status to `scoped`, track to `B`.
2. [ ] Backend: Update `prisma/schema.prisma` with `Subtask` model.
3. [ ] Backend: Run `npx prisma migrate dev --name add_subtasks`.
4. [ ] Backend: Create `SubtasksModule` and scaffolding.
5. [ ] Backend: Implement `SubtasksService` (CRUD for subtasks).
6. [ ] Backend: Update `TasksService.update` to include subtask check.
7. [ ] Backend: Add unit tests for `TasksService` guard logic.

## Implementation Notes
- Ensure Cascade Delete: Deleting a Task should delete its Subtasks.
- Return user-friendly error: "Cannot complete task with pending subtasks."

## Verification Checklist
- [ ] Subtask creation via API works.
- [ ] PATCH task with pending subtasks returns 400.
- [ ] PATCH task with all completed subtasks returns 200.
