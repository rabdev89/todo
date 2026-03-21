# T-302 Testing: Sorting & Filtering

## Test Strategy
- **API Tests:** Verify correct data sets for various query combinations.
- **Frontend Tests:** Verify the `FilterBar` triggers API calls correctly.

## Test Cases
- **TC-FLT-1:** Search Logic
  - Input: `?search=urgent`.
  - Expected: Only tasks with "urgent" in title returned.
- **TC-FLT-2:** Combined Filters
  - Input: `?priority=HIGH&isCompleted=false`.
  - Expected: Intersection of sets.
- **TC-FLT-3:** Default Sort
  - Action: GET /tasks (no params).
  - Expected: Ordered by `dueDate`.

## Verification Evidence
- [ ] `npm run test:e2e -- --testPathPattern=tasks_filter`
- [ ] UI screenshots showing filtered states.
