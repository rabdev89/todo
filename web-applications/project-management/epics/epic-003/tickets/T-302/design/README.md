# T-302 Design: Sorting & Filtering

## Style Attribution
- **Source:** [style_guide.json](file:///Users/ronaldbaniqued/Code/Origin/ToDoApp/ai-assisted-development/web-applications/project-management/design/style_guide.json)
- **Visuals:** Use MUI `TextField` and `Select` with `#027CEC` focus. Clear "Filter" chip indicators.

## Architecture
- **Backend:** Prisma `where` and `orderBy` clauses in `TasksService`.
- **Frontend:** `FilterContext` to manage global filter state across components.

## Implementation logic
- **Search:** `where: { title: { contains: query, mode: 'insensitive' } }`.
- **Pagination:** Consider adding `skip` and `take` support.

## Plan & Breaths
- **Breath 1:** Backend: Update `TasksService.findAll` to handle dynamic filters.
- **Breath 2:** Frontend: Implement `FilterBar` UI component.
- **Breath 3:** Frontend: Connect `FilterBar` to the API fetching logic.

## Verification Spec
- **Automated:** Integration tests for the filtered `GET /tasks` endpoint.
- **Manual:** Filter by "High Priority" and verify only those tasks appear.
