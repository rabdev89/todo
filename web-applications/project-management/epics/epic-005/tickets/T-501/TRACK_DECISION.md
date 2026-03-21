# T-501: Pagination & Lazy Loading — Track Decision

## Overview
This document justifies the track selection (Track A vs Track B) for T-501 using the three-question WORKFLOW_DECISION_GATE matrix.

## WORKFLOW_DECISION_GATE Analysis

### Question 1: Database Schema or API Contract Changes?
**Answer: YES** ✅ → Track B

**Justification**:
- **API Contract Change**: The `GET /tasks` endpoint changes from returning a flat array to returning a paginated response with metadata:
  ```json
  {
    "data": [Task[], ...],
    "meta": {
      "total": 42,
      "page": 1,
      "lastPage": 3
    }
  }
  ```
- **Query Parameters Addition**: Controller must explicitly accept and validate `page`, `limit`, `sort`, and `order` query parameters.
- **Response Shape Modification**: Existing API consumers (frontend) must adapt to the new response structure.

**Scope Impact**: Requires API versioning consideration or coordinated frontend/backend updates.

---

### Question 2: Complex Feature (Multi-Layer Testing Required)?
**Answer: YES** ✅ → Track B

**Justification**:
- **Backend Layer**:
  - `TasksService.findAll()` requires pagination logic (skip/take offset calculation).
  - Must fetch both filtered dataset AND total count (two queries).
  - Performance: Improper indexing or count queries can impact response times.
  
- **Frontend Layer**:
  - State management: `page`, `hasMore`, `loadingMore`, `tasks` array concatenation.
  - Infinite scroll or "Load More" button logic (scroll event listeners).
  - Integration with existing filter/sort logic (pagination reset on filter change).
  - Edge cases: Empty state after filter, last page behavior, "All tasks loaded" UX.

- **Integration Testing**: Requires E2E tests verifying fetch chains, offset calculations, and state transitions.
- **Performance Testing**: Verify pagination improves load time vs fetching all tasks.

---

### Question 3: Effort > 8 Hours or Multi-System Impact?
**Answer: YES** ✅ → Track B

**Justification**:

**Estimated Effort Breakdown**:
- **Backend Design & Implementation**: 2.5 hours
  - `TasksService.findAll()` pagination logic: 1 hour
  - `TasksController` query param handling: 0.75 hour
  - Unit tests (service pagination): 0.75 hour

- **Frontend Design & Implementation**: 3 hours
  - State management setup (page, hasMore, loadingMore): 0.75 hour
  - Infinite scroll / Load More button: 1 hour
  - Filter/sort integration with pagination reset: 0.75 hour
  - Skeleton loaders and "All tasks loaded" UX: 0.5 hour

- **Integration & E2E Testing**: 2 hours
  - Integration test (backend pagination): 0.5 hour
  - E2E test (infinite scroll flow): 1 hour
  - Performance testing & optimization: 0.5 hour

- **Documentation & Review**: 0.5 hours

**Total: ~8 hours** → Track B threshold met.

**Multi-System Impact**:
- Backend: TasksService, TasksController, tests
- Frontend: DashboardPage, fetch hooks/utilities
- Shared: API contract, response types (may need backend types update)

---

## Track Selection: **TRACK B** (Full SDLC)

### Rationale Summary
All three WORKFLOW_DECISION_GATE questions returned **YES**:
1. ✅ API contract changes (query params + response shape)
2. ✅ Multi-layer complexity (backend + frontend + integration testing)
3. ✅ Effort > 8 hours (8 hours estimated) + multi-system impact

**Track B Requirements** *(Per TICKET_SCOPING.md)*:
- ✅ **Requirements Document** (requirements/README.md) — Complete
- ✅ **Design Document** (design/README.md) — Complete
- ✅ **Planning Document** (planning/README.md) — *To be created*
- ✅ **Testing Document** (testing/README.md) — Complete
- ✅ **Phase Tracking** (implementation/README.md) — *To be created*
- ✅ **TRACK_DECISION** (this file) — Complete

---

## Completion Gate

**T-501 Ready for Implementation when**:
- ✅ All Track B artifacts created and reviewed
- ✅ planning/README.md tasks sequenced with dependencies
- ✅ implementation/README.md phase checklist prepared
- ✅ All test cases from testing/README.md converted to test code or test spec
- ⏳ Backend and frontend teams aligned on pagination defaults (limit=20, max_limit=100)
- ⏳ Performance baseline established (measure latency improvement vs full-load)

---

## Key Decisions

| Decision | Rationale | Implications |
|----------|-----------|--------------|
| Pagination defaults: `limit=20` | Balance between UX (responsiveness) and backend load. | Frontend must enforce `max_limit=100` to prevent DOS. |
| Infinite Scroll > "Load More" | Better UX for modern apps; reduces clicks. | Requires scroll event listener; test with keyboard navigation. |
| Reset to page 1 on filter | Prevents showing stale/off-base results. | Frontend must clear `tasks` array + reset `page=1` when filter changes. |
| Count query separate from data fetch | Clarity + potential future caching. | Slight latency trade-off; consider Redis caching for count if needed. |

---

## Dependencies
- **T-201**: Tasks API must exist (base endpoint).
- **T-203**: Dashboard UI must exist (target for pagination integration).

---

## Risk Mitigation

| Risk | Mitigation |
|------|-----------|
| **Pagination breaks filters/sorting** | Integration tests with combined filter + pagination; manual QA with 15+ tasks. |
| **Infinite scroll performance degrades with many tasks** | Load test with 500+ tasks; add virtualization (React-Window) if needed. |
| **API contract change breaks other consumers** | Coordinate with mobile/API docs; consider API versioning if needed. |
| **Select All behavior unclear with pagination** | Clarify: Select All = current page OR all tasks? Document decision. |

---

## Next Phase
➡️ **Implementation Planning** — See `planning/README.md` for task breakdown and effort distribution.
