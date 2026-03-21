# T-501 Planning: Pagination & Lazy Loading

## Overview
This document outlines the implementation tasks, dependencies, effort estimates, and execution phases for T-501 Pagination & Lazy Loading.

**Total Effort**: ~8 hours  
**Estimated Duration**: 1–2 days (depending on team size and parallelization)  
**Track**: B (Full SDLC)

---

## Phase 1: Backend Service Layer (2.5 hours)

### Phase 1 Objective
Update `TasksService.findAll()` to support pagination and return paginated metadata. Verify logic with unit tests.

| Task ID | Task | Effort | Dependencies | Owner |
|---------|------|--------|--------------|-------|
| P1-T1 | **Update TasksService.findAll() signature** — Add `page?: number`, `limit?: number`, `sort?: string`, `order?: "asc" \| "desc"` parameters. | 30 min | T-201 (Tasks Service exists) | Backend |
| P1-T2 | **Implement pagination offset calculation** — Convert `page` (1-indexed) to Prisma `skip` (0-indexed): `skip = (page - 1) * limit`. Set defaults: `limit=20`, `max_limit=100`. | 30 min | P1-T1 | Backend |
| P1-T3 | **Fetch paginated dataset** — Use `prisma.task.findMany({skip, take, where, orderBy})` to fetch tasks. Ensure ordering matches `sort` and `order` params. | 30 min | P1-T2 | Backend |
| P1-T4 | **Fetch total count** — Add `prisma.task.count({where})` query to get total task count for metadata. | 15 min | P1-T2 | Backend |
| P1-T5 | **Calculate pagination metadata** — Return `{data, meta: {total, page, lastPage, hasMore}}`. | 15 min | P1-T3, P1-T4 | Backend |
| P1-T6 | **Unit test: Basic pagination** — Test `findAll(userId, {page: 1, limit: 5})` returns 5 tasks + correct metadata. | 30 min | P1-T5 | QA / Backend |
| P1-T7 | **Unit test: Offset calculation** — Verify page 2, 3 return correct offset ranges (e.g., tasks 6–10, 11–15). | 30 min | P1-T6 | QA / Backend |
| P1-T8 | **Unit test: Edge cases** — Test `page=0`, negative `limit`, `limit > max_limit`, empty result set, `lastPage` calculation. | 30 min | P1-T6 | QA / Backend |

### Phase 1 Gates
- ✅ `TasksService.findAll()` unit tests pass (8 tests).
- ✅ Pagination offset calculation verified with boundary tests.
- ✅ Metadata format (total, page, lastPage, hasMore) finalized.

---

## Phase 2: Backend Controller Layer (0.75 hours)

### Phase 2 Objective
Update `TasksController.GET /tasks` to accept pagination query parameters and pass them to `TasksService`.

| Task ID | Task | Effort | Dependencies | Owner |
|---------|------|--------|--------------|-------|
| P2-T1 | **Create PaginationDto** — DTO with `page?: number`, `limit?: number`, `sort?: string`, `order?: "asc" \| "desc"`. Add validation: `@IsNumber()`, `@Max(100)`, etc. | 30 min | P1-T5 | Backend |
| P2-T2 | **Update TasksController.getTasks()** — Extract `@Query() paginationDto: PaginationDto` from request. Call `tasksService.findAll(userId, paginationDto)`. | 30 min | P2-T1 | Backend |
| P2-T3 | **Test: GET /tasks with pagination params** — Manual API test: `GET /tasks?page=2&limit=10&sort=createdAt&order=desc`. Verify response shape and data. | 15 min | P2-T2 | QA / Backend |

### Phase 2 Gates
- ✅ `PaginationDto` created with all validation rules.
- ✅ `GET /tasks` controller accepts query params and passes to service.
- ✅ Manual API test confirms response metadata correct.

---

## Phase 3: Frontend State Management (1 hour)

### Phase 3 Objective
Set up frontend pagination state in `DashboardPage.tsx` to track current page, `hasMore`, `loadingMore`, and task accumulation.

| Task ID | Task | Effort | Dependencies | Owner |
|---------|------|--------|--------------|-------|
| P3-T1 | **Add pagination state variables** — `page: number`, `hasMore: boolean`, `loadingMore: boolean`, `totalTasks: number` in `DashboardPage` state (useState). | 15 min | T-203 (DashboardPage exists) | Frontend |
| P3-T2 | **Update fetch hook** — Modify existing `useFetchTasks()` or create `usePaginatedTasks()` to accept `page` param and append tasks instead of replacing. | 30 min | P3-T1 | Frontend |
| P3-T3 | **Implement loadMore() handler** — Function to increment `page` and trigger next fetch. Set `loadingMore=true` during fetch, `false` when complete. | 15 min | P3-T2 | Frontend |
| P3-T4 | **Update filter/sort handlers** — When filter or sort changes, reset `page=1`, clear tasks array, and re-fetch from page 1. | 15 min | P3-T1, P3-T3 | Frontend |
| P3-T5 | **Handle pagination metadata** — Extract `hasMore` from API response; set state to trigger UI updates (e.g., hide "Load More" when `hasMore=false`). | 15 min | P3-T2 | Frontend |

### Phase 3 Gates
- ✅ DashboardPage pagination state initialized.
- ✅ usePaginatedTasks hook appends tasks correctly.
- ✅ Filter/sort integration resets pagination.
- ✅ `hasMore` state drives "Load More" button visibility.

---

## Phase 4: Frontend UI & UX (1 hour)

### Phase 4 Objective
Implement infinite scroll / "Load More" button and skeleton loaders for better perceived performance.

| Task ID | Task | Effort | Dependencies | Owner |
|---------|------|--------|--------------|-------|
| P4-T1 | **Add "Load More" button** — Insert button at bottom of task table. Disabled when `loadingMore=true` or `hasMore=false`. Shows "All tasks loaded" message when `hasMore=false`. | 30 min | P3-T3, P3-T5 | Frontend |
| P4-T2 | **Add skeleton loaders** — Show skeleton cards while `loadingMore=true`. Render 3–5 skeleton rows at bottom of table. | 30 min | P4-T1 | Frontend |
| P4-T3 | *(Optional) Infinite scroll listener* — Detect scroll near bottom of table and auto-trigger `loadMore()`. Hide "Load More" button if using auto-scroll. | 30 min | P4-T1 | Frontend |
| P4-T4 | **Update "Select All" behavior** — Clarify: does "Select All" select current page OR all tasks? Document and implement accordingly. | 15 min | T-205 (multi-select exists) | Frontend / Product |

### Phase 4 Gates
- ✅ "Load More" button integrated and functional.
- ✅ Skeleton loaders render during `loadingMore`.
- ✅ "All tasks loaded" message displays correctly.
- ✅ Select All behavior documented and implemented.

---

## Phase 5: Integration & Testing (2 hours)

### Phase 5 Objective
Write integration tests, E2E tests, and verify performance improvements. Conduct manual QA with 15+ tasks.

| Task ID | Task | Effort | Dependencies | Owner |
|---------|------|--------|--------------|-------|
| P5-T1 | **Integration test: Paginated API flow** — Test `GET /tasks?page=1&limit=5`, `page=2&limit=5`, verify correct subset returned. Check metadata accuracy. | 30 min | P2-T3, P3-T2 | QA / Backend |
| P5-T2 | **E2E test: Load More button flow** — Start on Dashboard, load initial tasks, click "Load More", verify new tasks append, click again, verify page increments. | 30 min | P4-T1 | QA / Frontend |
| P5-T3 | **E2E test: Filter reset pagination** — Apply filter, verify pagination resets to page 1, load more, verify results filtered. | 30 min | P3-T4 | QA / Frontend |
| P5-T4 | **Manual QA: Create 15+ tasks** — Create at least 20 test tasks in dev DB. Open Dashboard, scroll/load-more, verify seamless loading. | 30 min | P4-T1 | QA |
| P5-T5 | **Performance baseline** — Measure API latency (full-load vs paginated) with 100+ tasks. Document improvement. | 15 min | P5-T1 | QA / Performance |
| P5-T6 | **Documentation update** — Update API docs with new pagination query params. Update user guide for "Load More" UX. | 15 min | P2-T1 | Documentation |

### Phase 5 Gates
- ✅ Integration tests pass (paginated API flow verified).
- ✅ E2E tests pass (Load More, filter reset, pagination).
- ✅ Manual QA confirms no regressions with 15+ tasks.
- ✅ Performance baseline documented (API latency improvement).
- ✅ API and user documentation updated.

---

## Task Dependency Graph

```
P1-T1 → P1-T2 → P1-T3 ─┐
                       ├─→ P1-T5 → P1-T6 → P1-T7 → P1-T8
        P1-T2 → P1-T4 ─┘

P1-T5 → P2-T1 → P2-T2 → P2-T3 → P5-T1

T-203 → P3-T1 → P3-T2 → P3-T3 ─┐
                               ├─→ P3-T5 → P4-T1 → P4-T2 → P5-T2
P3-T1 ────────────────→ P3-T4 ─┘                          ↓
                                                        P5-T3
                                                         ↓
                        P4-T1 → P4-T3
                        T-205 → P4-T4

P5-T1, P5-T2, P5-T3 → P5-T4 → P5-T5 → P5-T6
```

---

## Parallelization Opportunities

### Independent Workstreams
1. **Backend (P1 + P2)**: Can execute in parallel with frontend until P3-T2 (fetch hook integration).
   - Backend team: Complete P1 (2.5h) + P2 (0.75h) in parallel.
   - Estimated: 2.5–3 hours wall-clock time.

2. **Frontend (P3 + P4)**: Starts after API contract finalized (P2-T2).
   - Frontend team: Complete P3 (1h) + P4 (1h) in serial (P4 depends on P3).
   - Estimated: 2 hours wall-clock time.

3. **Testing (P5)**: Can start after backend API complete (P2-T2) for integration tests, frontend UI for E2E.
   - QA team: Parallel unit/integration tests + E2E tests.
   - Estimated: 1.5–2 hours wall-clock time, overlapping with Phase 4.

**Optimal Schedule** (with parallel teams):
- **Days 1–2 (Morning)**: Backend (P1 + P2) + Frontend setup (P3-T1, P3-T2).
- **Days 1–2 (Afternoon)**: Frontend UI (P4) + QA integration tests (P5-T1).
- **Day 2 (End)**: E2E + manual QA (P5-T2 through P5-T6).

---

## Effort Summary

| Phase | Tasks | Effort | Owner |
|-------|-------|--------|-------|
| **P1: Backend Service** | P1-T1 → P1-T8 | 2.5 hours | Backend Team |
| **P2: Backend Controller** | P2-T1 → P2-T3 | 0.75 hours | Backend Team |
| **P3: Frontend State** | P3-T1 → P3-T5 | 1 hour | Frontend Team |
| **P4: Frontend UI/UX** | P4-T1 → P4-T4 | 1+ hours | Frontend Team |
| **P5: Testing & Validation** | P5-T1 → P5-T6 | 2 hours | QA Team |
| **Total** | 23 tasks | **~8 hours** | All Teams |

---

## Risk Mitigation

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|-----------|
| **Pagination offset calculation error** | Medium | High | Unit test boundary cases (P1-T8); peer review before P2. |
| **Infinite scroll infinite loop (loading same page)** | Low | High | Test page increment logic (P5-T2); add console logging for debugging. |
| **API contract breaking change** | Medium | High | Coordinate with frontend before P2-T2; consider API versioning if needed. |
| **Performance regression with large task lists** | Low | Medium | Load test with 500+ tasks (P5-T5); may need virtualization (React-Window). |
| **Filter/sort + pagination edge cases** | Medium | Medium | Comprehensive E2E tests (P5-T3); manual QA with multiple filter combinations. |

---

## Success Criteria

- ✅ Backend returns paginated data with metadata (total, page, lastPage, hasMore).
- ✅ Frontend appends tasks correctly and accumulates across page loads.
- ✅ Filter/sort resets pagination to page 1.
- ✅ "Load More" button visible only when `hasMore=true`.
- ✅ All 23 tasks completed and tested.
- ✅ Performance improves vs fetching all tasks (baseline documented).
- ✅ No regressions in existing Dashboard functionality (T-203, T-205).
- ✅ API documentation updated with pagination query params.

---

## Next Steps

➡️ **Implementation** — Begin Phase 1 (Backend Service) with Backend Team.  
➡️ **Parallel Work** — Frontend team prepares P3-T1 state setup in parallel.  
➡️ **Testing** — QA prepares test scripts and test data (15+ tasks) for P5 execution.
