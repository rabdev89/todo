# T-501 Testing: Pagination & Lazy Loading

## Automated Tests
- **Unit Test (Backend)**: Verify `TasksService.findAll` returns correct slice of data based on skip/take.
- **Integration Test**: 
  - `GET /tasks?limit=5`: Verify only 5 items are returned.
  - `GET /tasks?page=2&limit=5`: Verify the next 5 items are returned.

## Manual Verification
1. Create at least 15 tasks (or reduce the dev limit to 5).
2. Open Dashboard and scroll to the bottom.
3. Verify new tasks are fetched and appended seamlessly.
4. Apply a filter and verify the list resets to page 1 and loads correctly.
5. Verify "Select All" correctly handles the currently loaded tasks (or all tasks if that's the desired behavior).
