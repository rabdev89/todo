# T-201 Planning: Task CRUD API Endpoints

## Task Breakdown
1. [x] Metadata Update: status to `scoped`, track to `B`.
2. [ ] Backend: Generate `TasksModule`, `TasksService`, `TasksController`.
3. [ ] Backend: Define `CreateTaskDto` and `UpdateTaskDto`.
4. [ ] Backend: Implement `TasksService.create(userId, dto)`.
5. [ ] Backend: Implement `TasksService.findAll(userId)`.
6. [ ] Backend: Implement `TasksService.update(userId, id, dto)` with ownership check.
7. [ ] Backend: Implement `TasksService.remove(userId, id)` with ownership check.

## Implementation Notes
- Use `@UseGuards(JwtAuthGuard)` at the controller level.
- Extract `userId` from `req.user` inside controller methods.

## Verification Checklist
- [ ] `POST /tasks` creates a task linked to the correct user.
- [ ] `GET /tasks` lists only the requester's tasks.
- [ ] `PATCH /tasks/:id` fails if `:id` belongs to another user.
