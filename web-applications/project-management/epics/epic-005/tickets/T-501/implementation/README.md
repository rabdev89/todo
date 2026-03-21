# T-501 Implementation: Pagination & Lazy Loading

## Phase Tracking

This document tracks the execution progress of T-501 across all phases. Update status as work progresses.

---

## Phase 1: Backend Service Layer [STATUS: ⏳ NOT STARTED]

### Completion Checklist
- [ ] P1-T1: TasksService.findAll() signature updated with pagination params
- [ ] P1-T2: Offset calculation implemented (page to skip conversion)
- [ ] P1-T3: Paginated dataset fetch using Prisma.task.findMany()
- [ ] P1-T4: Total count fetch using Prisma.task.count()
- [ ] P1-T5: Pagination metadata calculated (total, page, lastPage, hasMore)
- [ ] P1-T6: Unit test — Basic pagination (page 1, limit 5)
- [ ] P1-T7: Unit test — Offset calculation (pages 2, 3, etc.)
- [ ] P1-T8: Unit test — Edge cases (page 0, negative limit, etc.)

### Key Files
- `web-applications/backend/src/tasks/tasks.service.ts` — Update `findAll()` method
- `web-applications/backend/src/tasks/dtos/create-task.dto.ts` — Create or extend pagination DTO
- `web-applications/backend/test/tasks.service.spec.ts` — Add 8 unit tests

### Notes
```
(Use this section to document decisions, blockers, or discoveries)

- Pagination defaults: limit=20, max_limit=100
- Offset calculation: skip = (page - 1) * limit
- Return format: {data: Task[], meta: {total, page, lastPage, hasMore}}
```

---

## Phase 2: Backend Controller Layer [STATUS: ⏳ NOT STARTED]

### Completion Checklist
- [ ] P2-T1: PaginationDto created with validation rules
- [ ] P2-T2: TasksController.getTasks() updated to accept pagination query params
- [ ] P2-T3: Manual API test confirms pagination response correct

### Key Files
- `web-applications/backend/src/tasks/dtos/pagination.dto.ts` — New DTO
- `web-applications/backend/src/tasks/tasks.controller.ts` — Update GET /tasks

### Notes
```
(Use this section to document decisions, blockers, or discoveries)

- Query param validation: page ≥ 1, 0 < limit ≤ 100
- Default: page=1, limit=20
- Backward compatibility: If no pagination params, default to page 1, limit 20
```

---

## Phase 3: Frontend State Management [STATUS: ⏳ NOT STARTED]

### Completion Checklist
- [ ] P3-T1: Pagination state variables added (page, hasMore, loadingMore, totalTasks)
- [ ] P3-T2: usePaginatedTasks hook created (appends tasks instead of replacing)
- [ ] P3-T3: loadMore() handler implemented (increment page, trigger fetch)
- [ ] P3-T4: Filter/sort handlers reset pagination (page=1, clear tasks)
- [ ] P3-T5: Pagination metadata handled (hasMore drives UI updates)

### Key Files
- `web-applications/frontend/src/pages/DashboardPage.tsx` — Update state and hooks
- `web-applications/frontend/src/hooks/usePaginatedTasks.ts` — New hook (or extend existing fetch hook)

### Notes
```
(Use this section to document decisions, blockers, or discoveries)

- State variables: 
  - page: number (1-indexed)
  - hasMore: boolean
  - loadingMore: boolean
  - totalTasks: number
- Task accumulation: Use spread operator or concat: setTasks([...tasks, ...newTasks])
- Filter integration: Reset to page=1 and clear tasks array when filters change
```

---

## Phase 4: Frontend UI & UX [STATUS: ⏳ NOT STARTED]

### Completion Checklist
- [ ] P4-T1: "Load More" button implemented at bottom of task table
- [ ] P4-T2: Skeleton loaders display during data fetch
- [ ] P4-T3: (Optional) Infinite scroll listener auto-triggers loadMore()
- [ ] P4-T4: "Select All" behavior clarified and implemented

### Key Files
- `web-applications/frontend/src/pages/DashboardPage.tsx` — Add "Load More" button and loaders
- `web-applications/frontend/src/components/SkeletonLoader.tsx` — Optional: create/update skeleton component

### Notes
```
(Use this section to document decisions, blockers, or discoveries)

- "Load More" button:
  - Disabled when loadingMore=true or hasMore=false
  - Label changes to "All tasks loaded" when hasMore=false
- Skeleton loaders: 3–5 skeleton rows, same as task row height
- Infinite scroll (optional): Detect scroll to bottom; auto-trigger loadMore() if enabled
- Select All: Current page only (to avoid selecting hidden tasks), or all tasks? [CLARIFY WITH PRODUCT]
```

---

## Phase 5: Integration & Testing [STATUS: ⏳ NOT STARTED]

### Completion Checklist
- [ ] P5-T1: Integration test — Backend paginated API flow
- [ ] P5-T2: E2E test — "Load More" button flow
- [ ] P5-T3: E2E test — Filter reset pagination
- [ ] P5-T4: Manual QA — 15+ tasks, scrolling/loading behavior
- [ ] P5-T5: Performance baseline — API latency improvement measured
- [ ] P5-T6: Documentation update — API docs + user guide

### Key Files
- `web-applications/backend/test/tasks.controller.spec.ts` — Integration tests
- `web-applications/frontend/test/DashboardPage.spec.tsx` — E2E tests (or manual test plan)
- `docs/API.md` — Update API documentation
- `docs/USER_GUIDE.md` — Update user guide for "Load More" UX

### Notes
```
(Use this section to document decisions, blockers, or discoveries)

- Test data: Create 20+ tasks in dev DB for manual QA
- Performance baseline: Measure API response time (full-load vs paginated) with 100+ tasks
- E2E test scenarios:
  1. Load Dashboard → load initial tasks
  2. Click "Load More" → new tasks append
  3. Apply filter → pagination resets, correct subset shown
  4. Sort change → pagination resets, new sort order applied
```

---

## Implementation Decisions

| Decision | Rationale | Status |
|----------|-----------|--------|
| Default `limit=20` | Balances UX responsiveness and backend load. | ⏳ To Decide |
| Offset calculation: `(page - 1) * limit` | Standard pagination formula; 1-indexed pages. | ✅ Approved |
| Append tasks instead of replace | Better UX for lazy loading; accumulates across pages. | ✅ Approved |
| Reset pagination on filter change | Prevents stale/off-base results. | ✅ Approved |
| Separate count query | Simplicity + future caching opportunity. | ✅ Approved |

---

## Blockers & Dependencies

- **T-201**: Tasks API must exist (dependency met ✅)
- **T-203**: Dashboard UI must exist (dependency met ✅)
- **P2-T2 completion**: Frontend cannot start P3 integration until API contract finalized

---

## Performance & Optimization Notes

```
(Use this section to document performance findings and optimizations)

- Baseline: API response time (full fetch vs paginated)
- Load test: 500+ tasks, measure pagination latency
- Consider: React-Window virtualization if list grows beyond 100 tasks per page
- Database index: Ensure index on userId + createdAt for fast pagination queries
```

---

## Sign-Off

| Role | Name | Date | Status |
|------|------|------|--------|
| Backend Lead | — | — | ⏳ Pending |
| Frontend Lead | — | — | ⏳ Pending |
| QA Lead | — | — | ⏳ Pending |

---

## Appendix: Phase Quick Links

- [Planning Document](../planning/README.md) — Task details, effort, dependencies
- [Design Document](../design/README.md) — Architecture, data flows, UX
- [Testing Document](../testing/README.md) — Test cases and strategy
- [Track Decision](../TRACK_DECISION.md) — Why Track B was chosen
- [Requirements](../requirements/README.md) — Feature specifications
