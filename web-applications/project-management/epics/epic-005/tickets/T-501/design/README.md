# T-501 Design: Pagination & Lazy Loading

## Backend Changes
### TasksService.ts
- Update `findAll(userId: string, options: PaginationDto)`:
  - Add `skip` (offset) and `take` (limit) to `prisma.task.findMany`.
  - Fetch total count: `prisma.task.count({ where: { userId } })`.
  - Return: `{ data: Task[], meta: { total: number, page: number, lastPage: number } }`.

### TasksController.ts
- Update `GET /tasks` to accept query params: `?page=1&limit=20`.

## Frontend Changes
### DashboardPage.tsx
- **State**: `page: number`, `hasMore: boolean`, `loadingMore: boolean`.
- **Infinite Scroll**:
  - Add a scroll listener to the `TableContainer` or a "Load More" button at the bottom of the table.
  - Append new tasks to the existing `tasks` state instead of replacing them.
- **Filtering Reset**: Reset pagination to page 1 whenever filters or sort orders change.

## UX / Feedback
- Show skeleton loaders at the bottom of the list while fetching the next page.
- Display "All tasks loaded" when `hasMore` is false.
