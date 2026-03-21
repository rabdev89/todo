# T-501: Pagination & Lazy Loading

## Overview
Optimize the task list for scale by implementing server-side pagination and frontend lazy loading.

## Requirements
- **Backend**:
  - Update `GET /tasks` to support `limit`, `offset`, and `sort` query parameters.
  - Return total count for pagination metadata.
- **Frontend**:
  - Implement infinite scroll or "Load More" in the `DashboardPage` table.
  - Update filtering/sorting to re-trigger paginated requests from page 0.

## Acceptance Criteria
- Verify only a subset of tasks (e.g., 20) is loaded initially.
- Verify scrolling or clicking "Load More" fetches the next batch.
- Filtering correctly resets the pagination offset.
