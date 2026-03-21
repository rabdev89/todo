# T-302 Planning: Sorting & Filtering

## Task Breakdown
1. [x] Metadata Update: status to `scoped`, track to `B`.
2. [ ] Backend: Define `GetTasksFilterDto`.
3. [ ] Backend: Refactor `TasksService.findAll` for Prisma dynamic queries.
4. [ ] Frontend: Build `FilterBar` with MUI components.
5. [ ] Frontend: Implement debounce for the search input (500ms).
6. [ ] Frontend: Sync filter state with API `params`.

## Implementation Notes
- Use `qs` or standard `URLSearchParams` for query string generation.
- Ensure the "Clear Filters" button resets all state.

## Verification Checklist
- [ ] Searching "Meet" returns "Meeting with team".
- [ ] Filtering "Completed" hides active tasks.
- [ ] Sorting by "Due Date" orders list correctly.
