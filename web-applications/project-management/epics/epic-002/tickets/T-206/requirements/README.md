# T-206: Cascading Deletes

## Overview
Ensure that deleting a task automatically cleans up all associated subtasks and file attachments to maintain database integrity and prevent orphaned records.

## Requirements
- Backend implementation for cascading deletes.
- Logic:
  - Delete Task -> Delete all related Subtasks.
  - Delete Task -> Delete all related Attachments (and physical files if stored locally).
- Transactional integrity: If any part of the delete fails, the entire operation should rollback (via Prisma transactions).

## Acceptance Criteria
- Verify in DB that subtasks are gone after parent task deletion.
- Verify in filesystem/DB that attachments are gone after parent task deletion.
