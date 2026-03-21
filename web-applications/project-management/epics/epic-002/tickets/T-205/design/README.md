# T-205 Design: Multi-select Tasks

## Frontend Changes
### DashboardPage.tsx
- State: `selectedIds: Set<string>`
- `handleToggleSelect(id: string)`
- `handleToggleSelectAll()`
- Render `Checkbox` in `TaskRow`.
- Render `Checkbox` in `TableHead`.
- Render `BulkActionBar` (Conditional):
  - Positioned at the bottom or top of the table.
  - Uses MUI `Paper` with elevation.
  - Buttons for 'Delete', 'Set Status', 'Set Priority'.

## Backend Changes
### tasks.controller.ts
- `@Delete('bulk')`
- `@Patch('bulk')`

### tasks.service.ts
- `bulkRemove(userId: string, ids: string[])`: Use `prisma.task.deleteMany` with `where: { id: { in: ids }, userId }`.
- `bulkUpdate(userId: string, ids: string[], data: UpdateTaskDto)`: Use `prisma.task.updateMany` with `where: { id: { in: ids }, userId }`.
