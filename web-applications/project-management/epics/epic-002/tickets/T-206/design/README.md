# T-206 Design: Cascading Deletes

## Architecture Overview

### Problem Statement
When a Task is deleted, orphaned records remain in the database:
- **Subtasks** not cleaned up (partially fixed - see Current State)
- **Attachments** (new model) not cleaned up (missing entirely)
- **File artifacts** not deleted from storage

This violates data integrity principles and creates maintenance issues.

### Solution: Cascading Delete Pattern

Implement cascading deletes across all Task-related entities using:
1. **Database-level cascading** (Prisma onDelete: Cascade)
2. **Application-level transaction wrapper** (Prisma $transaction)
3. **File cleanup** (optional, depends on storage architecture)

---

## Data Model & Schema Design

### Current State (Prisma Schema)
```
User (1) ──→ (M) Task
              └─→ (M) Subtask with onDelete: Cascade ✅
```

### Proposed New State
```
User (1) ──→ (M) Task
              ├─→ (M) Subtask with onDelete: Cascade ✅
              └─→ (M) Attachment with onDelete: Cascade (NEW)
```

### Attachment Model (New)

**Added to `prisma/schema.prisma`**:

```prisma
model Attachment {
  id        String   @id @default(uuid())
  taskId    String   @map("task_id")
  filename  String   @db.VarChar(255)
  mimeType  String   @db.VarChar(100)
  size      Int      // bytes
  url       String   @db.VarCharMax
  storageType Enum("local" | "s3" | "azure_blob")
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  // Cascading relationship to Task
  task Task @relation(fields: [taskId], references: [id], onDelete: Cascade)

  @@map("attachments")
  @@index([taskId], map: "idx_attachments_task_id")
}
```

**Task Model Update**:

```prisma
model Task {
  // ... existing fields ...
  attachments Attachment[]  // NEW: Add this relation
}
```

### Rationale for `onDelete: Cascade`

1. **Data Integrity**: When task is deleted, all associated data must be deleted
2. **Consistency**: Prevents orphaned records that reference non-existent tasks
3. **GDPR Compliance**: Ensures complete data removal when user/task is deleted
4. **Simplicity**: Database handles relationship cleanup, no manual cleanup needed

---

## Delete Operation Flow

### Single Task Delete (`DELETE /tasks/:id`)

**Current Implementation** (incomplete):
```typescript
// src/tasks/tasks.service.ts - BEFORE
async remove(userId: string, id: string) {
  const existing = await this.prisma.task.findUnique({ where: { id } });
  if (!existing) throw new NotFoundException('Task not found');
  if (existing.userId !== userId) throw new ForbiddenException();
  
  await this.prisma.task.delete({ where: { id } });  // ❌ No cascading
  return { ok: true };
}
```

**Proposed Implementation** (with transaction + file cleanup):
```typescript
// src/tasks/tasks.service.ts - AFTER
async remove(userId: string, id: string) {
  const existing = await this.prisma.task.findUnique({ 
    where: { id },
    include: { attachments: true }  // Get attachments before delete
  });
  if (!existing) throw new NotFoundException('Task not found');
  if (existing.userId !== userId) throw new ForbiddenException();
  
  // Transaction ensures atomicity
  return await this.prisma.$transaction(async (tx) => {
    // 1. Delete files from storage (if needed)
    for (const attachment of existing.attachments) {
      if (attachment.storageType === 'local') {
        await this.fileService.deleteFile(attachment.url);
      } else if (attachment.storageType === 's3') {
        await this.s3Service.deleteObject(attachment.url);
      }
    }
    
    // 2. Delete task (this cascades to subtasks + attachments via DB)
    await tx.task.delete({ where: { id } });
    
    return { ok: true };
  });
}
```

### Bulk Delete (`DELETE /tasks/bulk`)

Similar pattern for `bulkRemove()`:
```typescript
async bulkRemove(userId: string, ids: string[]) {
  // Get all attachments first
  const attachments = await this.prisma.attachment.findMany({
    where: {
      task: { userId, id: { in: ids } }
    }
  });
  
  return await this.prisma.$transaction(async (tx) => {
    // 1. Clean up files
    for (const attachment of attachments) {
      if (attachment.storageType === 'local') {
        await this.fileService.deleteFile(attachment.url);
      }
    }
    
    // 2. Delete all tasks (cascades)
    return await tx.task.deleteMany({
      where: { id: { in: ids }, userId }
    });
  });
}
```

---

## Transaction Boundary

### Why Transactions Matter

Without transactions:
```
Step 1: Start file deletion... ⚠️ Partial failure
Step 2: Delete task from DB... ✓ (task gone, but files remain)
Result: Orphaned files in storage, inconsistent state
```

With transactions:
```
Step 1: Start transaction
Step 2: Delete files... ✓
Step 3: Delete task... ✓
Step 4: Commit all or rollback all (atomic)
Result: Consistent state guaranteed
```

### Transaction Isolation

- **Isolation Level**: Recommended `READ_COMMITTED` (MySQL default)
- **Timeout**: Set reasonable timeout (5-10 seconds) for delete operations
- **Rollback Triggers**: On any file deletion error, entire transaction rolls back

---

## Error Handling

### Cascading Failure Scenarios

1. **Soft Delete Constraint Violation** (if implemented):
   - Prevent delete if child records exist and soft delete is enforced
   - Cascade delete overrides this - consider impact

2. **File Deletion Failure**:
   - If file service unavailable, transaction rolls back
   - Task NOT deleted, application retries
   - Logging captures error for investigation

3. **Database Timeout**:
   - Large task deletion (1000s of attachments) may timeout
   - Consider pagination/batching for large bulk deletes

### Error Response

```json
{
  "error": "Delete failed during cascade",
  "code": "CASCADING_DELETE_FAILED",
  "details": {
    "taskId": "abc123",
    "failedAt": "file_deletion",
    "message": "S3 access denied"
  }
}
```

---

## Database Migration Strategy

### Migration File (auto-generated by Prisma)

```bash
npx prisma migrate dev --name add_attachments_model
```

This generates:
1. `CREATE TABLE attachments` with all fields
2. `ALTER TABLE tasks ADD COLUMN attachments_id` (if using foreign key)
3. Indexes for foreign key performance

### Migration Safety Checks

- ✅ Test migration on staging database first
- ✅ Backup production database before running
- ✅ Verify `onDelete: Cascade` propagates correctly in MySQL
- ✅ Test bulk delete with 1000+ records

---

## File Storage Integration (TBD)

### Dependencies

This feature depends on file storage implementation:
- If no file storage system → Skip file deletion step
- If local filesystem → Integrate `FileService`
- If S3 → Integrate `S3Service`
- If Azure Blob → Integrate `BlobService`

**Status**: Architecture TBD in Planning phase

---

## Performance Considerations

### Cascade Delete Performance

- **Small tasks** (<10 attachments): No performance impact
- **Large tasks** (>1000 attachments): Consider async cleanup
- **Bulk deletes** (>100 tasks at once): May trigger timeout

### Optimization Strategies

1. **Indexing**: Ensure `idx_attachments_task_id` index exists
2. **Batch Deletes**: For bulk > 1000 tasks, split into batches of 100
3. **Async Cleanup**: Implement background job for orphaned files (future task)

---

## Security & Data Integrity

### Authorization Checks

✅ Ownership verification before cascade:
```typescript
const existing = await this.prisma.task.findUnique({ where: { id } });
if (existing.userId !== userId) throw new ForbiddenException();
```

### Data Loss Prevention

⚠️ **Warning**: Cascading deletes are permanent and irreversible
- User must confirm delete action (frontend responsibility)
- Audit logging recommended (future enhancement)
- Consider soft deletes for sensitive data (future task)

---

## Acceptance Criteria

- ✅ Subtasks deleted when Task deleted (already working via schema)
- ✅ Attachments deleted when Task deleted (new)
- ✅ Files cleaned from storage when Attachment deleted (if file storage enabled)
- ✅ Transactional atomicity: All or nothing delete
- ✅ Error handling: Rollback on any failure
- ✅ Performance: Single task delete < 100ms, bulk delete < 1000ms
- ✅ Ownership verified before cascade
- ✅ Unit tests + integration tests + E2E tests passing

---

## Design Decision Log

| Decision | Rationale | Status |
|----------|-----------|--------|
| Use Prisma `onDelete: Cascade` | Built-in, atomic, relational | ✅ Approved |
| Wrap with $transaction | Ensure file + DB atomicity | ✅ Approved |
| Fetch attachments before delete | Need to clean files first | ✅ Approved |
| Support multiple storage types | Future-proof for S3/Azure | ⏳ TBD in Planning |
| Set transaction timeout | Prevent hanging deletes | ✅ Approved |

---

**Design Status**: Ready for Planning Phase  
**Last Updated**: 2026-03-20  
**Next Phase**: Implement task breakdown and test strategy
