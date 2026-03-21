# T-206 Planning: Cascading Deletes

## Task Breakdown

### Phase 1: Schema & Database Setup

#### Task 1.1: Add Attachment Model to Prisma Schema
- [ ] Add `Attachment` model to `prisma/schema.prisma`
- [ ] Add `attachments` relation to `Task` model
- [ ] Configure `onDelete: Cascade` on both relationships
- [ ] Verify schema validation (`prisma validate`)
- **Estimated Time**: 30 minutes
- **Depends On**: None
- **Files Modified**: `prisma/schema.prisma`

#### Task 1.2: Generate Database Migration
- [ ] Run `npx prisma migrate dev --name add_attachments_model`
- [ ] Review generated migration file
- [ ] Create backup plan for production deployment
- [ ] Document any manual migration steps needed
- **Estimated Time**: 45 minutes
- **Depends On**: Task 1.1
- **Files Modified**: `prisma/migrations/*`

#### Task 1.3: Test Migration Against Test Database
- [ ] Create test database with mock data
- [ ] Run migration on test database
- [ ] Verify cascading deletes work correctly (manual SQL test)
- [ ] Verify relationship constraints enforced properly
- **Estimated Time**: 45 minutes
- **Depends On**: Task 1.2
- **Files Modified**: None (test environment only)

---

### Phase 2: Service Layer Implementation

#### Task 2.1: Update delete() Method with Transactions
- [ ] Fetch task with related attachments
- [ ] Wrap delete in `prisma.$transaction()`
- [ ] Implement file cleanup (stub for now)
- [ ] Add proper error handling with rollback
- [ ] Add logging for audit trail
- **Estimated Time**: 1 hour
- **Depends On**: Task 1.1
- **Files Modified**: `src/tasks/tasks.service.ts`

#### Task 2.2: Update bulkRemove() with Transactions
- [ ] Fetch all attachments for tasks to delete
- [ ] Wrap bulk delete in transaction
- [ ] Implement file cleanup loop
- [ ] Add timeout for large bulk operations
- [ ] Add batch processing for >1000 tasks
- **Estimated Time**: 1.5 hours
- **Depends On**: Task 2.1
- **Files Modified**: `src/tasks/tasks.service.ts`

#### Task 2.3: Implement File Service Integration
- [ ] Create stub `FileService` interface
- [ ] Implement local file deletion
- [ ] Add support for S3 integration
- [ ] Add support for Azure Blob integration
- [ ] Add mock implementation for testing
- **Estimated Time**: 1 hour
- **Depends On**: Task 2.1, Task 2.2
- **Files Modified**: `src/files/file.service.ts` (new), `src/tasks/tasks.service.ts`

#### Task 2.4: Add Error Handling & Logging
- [ ] Add transactional error catch block
- [ ] Log cascade delete failures
- [ ] Log file deletion failures separately
- [ ] Create custom exception for cascade failures
- [ ] Add structured logging (JSON format)
- **Estimated Time**: 45 minutes
- **Depends On**: Task 2.1, Task 2.2, Task 2.3
- **Files Modified**: `src/common/exceptions/cascade-delete.exception.ts`, `src/tasks/tasks.service.ts`

---

### Phase 3: Testing

#### Task 3.1: Unit Tests for Single Delete
- [ ] Test: Delete task with no attachments
- [ ] Test: Delete task with multiple attachments
- [ ] Test: Authorization check (forbidden user)
- [ ] Test: Not found error handling
- [ ] Test: File deletion failure rollback
- [ ] Target Coverage**: 100% for delete() method
- **Estimated Time**: 1 hour
- **Depends On**: Task 2.1, Task 2.3
- **Files Modified**: `src/tasks/tasks.service.spec.ts`

#### Task 3.2: Unit Tests for Bulk Delete
- [ ] Test: Bulk delete with mixed tasks (some with attachments, some without)
- [ ] Test: Permission checks per task
- [ ] Test: Partial failure (1 task fails, others succeed)
- [ ] Test: Transaction rollback on failure
- [ ] Test: Empty list handling
- **Target Coverage**: 100% for bulkRemove() method
- **Estimated Time**: 1.5 hours
- **Depends On**: Task 2.2, Task 2.3
- **Files Modified**: `src/tasks/tasks.service.spec.ts`

#### Task 3.3: Integration Tests for Cascading
- [ ] Test: Subtask deleted when task deleted
- [ ] Test: Attachment deleted when task deleted
- [ ] Test: Database constraints enforced
- [ ] Test: Orphaned records check (verify none exist post-delete)
- [ ] Test: Bulk delete cascading to all related records
- **Estimated Time**: 1 hour
- **Depends On**: Task 1.3, Task 2.1, Task 2.2
- **Files Modified**: `src/tasks/tasks.integration.spec.ts` (new)

#### Task 3.4: E2E Tests for API Endpoints
- [ ] Test: DELETE /tasks/:id cascade flow
- [ ] Test: DELETE /tasks/bulk cascade flow
- [ ] Test: File cleanup in mocked storage
- [ ] Test: Error responses and status codes
- [ ] Test: Large bulk deletes (1000+ tasks)
- **Estimated Time**: 2 hours
- **Depends On**: Task 3.2, Task 3.3
- **Files Modified**: `e2e/tasks.delete.spec.ts` (new)

#### Task 3.5: Performance Testing
- [ ] Benchmark: Delete 1 task (target: <100ms)
- [ ] Benchmark: Delete 100 tasks (target: <1000ms)
- [ ] Benchmark: Attachment cleanup (target: <50ms per attachment)
- [ ] Identify bottlenecks
- [ ] Optimize indexes if needed
- **Estimated Time**: 1.5 hours
- **Depends On**: Task 3.4
- **Files Modified**: `scripts/performance-test.ts` (new)

---

### Phase 4: Documentation & Review

#### Task 4.1: Update API Documentation
- [ ] Document DELETE /tasks/:id behavior
- [ ] Document DELETE /tasks/bulk behavior
- [ ] Add cascading delete warning in API docs
- [ ] Document error codes and recovery strategies
- [ ] Update Swagger/OpenAPI spec
- **Estimated Time**: 45 minutes
- **Depends On**: Task 2.1, Task 2.2
- **Files Modified**: `src/tasks/tasks.controller.ts` (docs), `docs/api.md`

#### Task 4.2: Code Review Preparation
- [ ] Create pull request
- [ ] Add review checklist (schema safety, transaction atomicity, error handling)
- [ ] Document migration safety steps
- [ ] List testing coverage results
- [ ] Add known limitations and future work
- **Estimated Time**: 30 minutes
- **Depends On**: All tasks in Phases 1-3
- **Files Modified**: Pull request description

#### Task 4.3: Final Verification
- [ ] All tests passing (unit, integration, E2E)
- [ ] Code coverage > 90%
- [ ] Linting passes (ESLint)
- [ ] Type checking passes (tsc)
- [ ] Build succeeds locally
- **Estimated Time**: 30 minutes
- **Depends On**: Phase 1, 2, 3 complete
- **Files Modified**: None (verification only)

#### Task 4.4: Production Deployment Plan
- [ ] Document migration rollback procedure
- [ ] Create health check for cascade integrity
- [ ] Plan monitoring/alerting for cascade failures
- [ ] Document rollback steps if issues arise
- [ ] Notify DBA/Ops about schema changes
- **Estimated Time**: 45 minutes
- **Depends On**: Task 4.3
- **Files Modified**: `docs/deployment.md`

---

## Task Dependencies

```
Task 1.1 ──→ Task 1.2 ──→ Task 1.3
                              ↓
                     Task 2.1 ──→ Task 2.2
                              ↓
                           Task 3.1 ──→ Task 3.3
                              ↓           ↓
Task 2.3 ──→ Task 2.4       Task 3.2 ──→ Task 3.4
                              ↓           ↓
                           Task 3.5 ──→ Task 4.1
                                        ↓
                                    Task 4.2 ↔ Task 4.3 ──→ Task 4.4
```

## Parallel Work Opportunities

- **Task 2.1 & Task 2.3** can start simultaneously after Task 1.1
- **Task 3.1 & Task 3.2** can start simultaneously after Task 2.3
- **Task 4.1** can start after Task 2.2 (documentation can precede code review)

## Critical Path

1. Task 1.1 → Task 1.2 → Task 1.3 (Schema validation)
2. Task 2.1 → Task 2.2 (Service implementation)
3. Task 3.1 + 3.2 → Task 3.3 → Task 3.4 (Testing)
4. Task 4.3 (Final verification gate)

**Estimated Critical Path Duration**: 8-10 days (assuming 6-8 hours/day)

## Effort Summary

| Phase | Tasks | Est. Hours | Depends On |
|-------|-------|-----------|-----------|
| 1: Schema | 3 | 2 | T-201 |
| 2: Implementation | 4 | 4.25 | Phase 1 |
| 3: Testing | 5 | 7 | Phase 2 |
| 4: Review | 4 | 2.5 | Phase 3 |
| **TOTAL** | **16** | **15.75 hrs** | **~2 days** |

## Risk Mitigation

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| Migration failure in prod | Low | High | Test on staging, backup, rollback plan |
| Performance regression | Medium | Medium | Benchmark before/after, optimize indexes |
| Transaction timeout on large bulk | Medium | Medium | Implement batch processing, set timeout |
| File cleanup partial failure | High | Medium | Separate file cleanup from DB transaction |
| Lock contention on tasks table | Low | Medium | Add lock timeout, monitor connection pool |

## Testing Coverage Goals

- **Unit Tests**: 100% of service methods
- **Integration Tests**: All cascade scenarios  
- **E2E Tests**: All API endpoints (single + bulk)
- **Performance**: Benchmarks for 1/100/1000 task deletes
- **Overall Coverage**: Target > 90% code coverage

---

**Planning Status**: Ready for Implementation  
**Last Updated**: 2026-03-20  
**Next Phase**: Begin Phase 1 tasks (schema + migration)
