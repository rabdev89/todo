# T-206 Track Decision: Cascading Deletes

## Decision: Track B (Full) ✅

### Justification

**Question 1: Scope Check**
- Database schema changes? **YES** - Need to add `Attachment` model with cascading relationship
- API contract changes? **YES** - DELETE endpoint behavior changes to cascade deletes
- Multiple files affected? **YES** - Prisma schema, migrations, TasksService, TasksController, tests
→ **TRACK B (Full)**

**Question 2: Complexity Check**
- New feature implementation? **YES** - Database integrity pattern implementation
- Transactional requirements? **YES** - Requires Prisma transaction handling
- Security-sensitive? **YES** - Data loss potential requires careful implementation
→ **TRACK B (Full)**

**Question 3: Estimated Effort**
- Estimated time: 6-8 hours (schema design, migrations, implementation, testing, E2E validation)
- Uncertainty: Medium (Attachment model scope to be defined)
→ **TRACK B (Full)**

### Why Track B

This ticket requires:
- **Database schema changes**: Adding `Attachment` model with proper cascading relationships
- **Migration strategy**: Creating and testing database migrations
- **Transactional integrity**: Implementing Prisma transactions for atomicity
- **Comprehensive testing**: Unit tests for service layer, integration tests for cascading behavior, E2E verification
- **Careful planning**: Schema design decisions before implementation

### Implementation Scope

**Current State**:
- ✅ Subtask cascading already configured in schema (`onDelete: Cascade`)
- ✅ TasksService.remove() deletes Tasks
- ❌ No Attachment model exists
- ❌ No file deletion logic exists
- ❌ No transactional wrapper around cascading operations

**Required Changes**:
1. Add `Attachment` model to Prisma schema with cascading relationship
2. Create database migration for Attachment table
3. Implement file deletion logic (if file storage is enabled)
4. Wrap delete operation in Prisma transaction for atomicity
5. Comprehensive test coverage for cascading scenarios
6. Update DELETE endpoints documentation

**Affected Files**:
- `prisma/schema.prisma` - Add Attachment model
- `prisma/migrations/*` - New migration for Attachment table
- `src/tasks/tasks.service.ts` - Update remove() and bulkRemove() methods
- `src/tasks/tasks.controller.ts` - No changes (endpoint behavior updates via service)
- `src/tasks/dto/create-task.dto.ts` - Potentially add attachments field
- `src/tasks/**/*.spec.ts` - Add cascading delete tests
- `src/common/filters/*` - Add error handling for cascade conflicts

### Technical Decisions

1. **Schema Relationships**:
   - Task → Subtask: Already has `onDelete: Cascade` ✅
   - Task → Attachment: Will add `onDelete: Cascade`
   - Decision rationale: Automatic cleanup ensures data integrity, no orphaned records

2. **Transaction Handling**:
   - Use Prisma transaction to wrap cascading delete operations
   - Ensures atomicity: either all deletes succeed or entire operation fails

3. **File Deletion Strategy** (TBD in Design phase):
   - If files stored locally: Delete physical files
   - If files stored in cloud (S3/Azure): Call cloud API to delete
   - If URLs only: No file deletion needed
   - Decision deferred to Design phase pending file storage architecture

### Track B Artifacts Required

- ✅ `requirements/README.md` - Requirements defined
- ⏳ `design/README.md` - Design decisions and schema diagram
- ⏳ `planning/README.md` - Task breakdown and implementation plan
- ⏳ `testing/README.md` - Test cases and verification strategy
- ✅ `metadata.json` - Metadata updated with Track B status

### Completion Gate

- [ ] Design phase complete with schema decisions finalized
- [ ] Planning phase complete with task breakdown
- [ ] Testing strategy defined with test cases
- [ ] Implementation follows Track B workflow (implement + test as you go)
- [ ] Database migrations tested in local/staging environment
- [ ] All test cases passing (unit, integration, E2E)
- [ ] Code review completed with focus on cascade integrity
- [ ] Production deployment plan reviewed

---

**Decision Date**: 2026-03-20  
**Track**: B (Full SDLC)  
**Status**: Scoped (ready for Design phase)  
**Next Phase**: Design → Planning → Implementation → Verification
