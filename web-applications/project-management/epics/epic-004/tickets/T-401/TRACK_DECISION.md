# T-401 Track Decision: File Attachments (Backend)

## Decision: Track B (Full) ✅

### Justification

**Question 1: Scope Check**
- Database schema changes? **YES** - New `Attachment` model with relationships
- API contract changes? **YES** - Three new endpoints (POST/GET/DELETE /attachments)
- Multiple files affected (≥3)? **YES** - schema.prisma, AttachmentsController, AttachmentsService, middleware, tests (5+ files)
- Shared type definitions? **YES** - DTOs: CreateAttachmentDto, AttachmentResponseDto
→ **TRACK B (Full)**

**Question 2: Complexity Check**
- New feature implementation? **YES** - Complete file attachment system (first-time feature)
- Architectural change? **YES** - File storage infrastructure, multipart form handling
- File I/O operations? **YES** - Disk storage, cleanup, streaming
- Security-sensitive? **YES** - File access control, ownership verification, validation
→ **TRACK B (Full)**

**Question 3: Estimated Effort**
- Database design + migration: 1 hour
- Service + Controller implementation: 3 hours
- File storage logic + cleanup: 1.5 hours
- Testing (unit, integration, E2E): 3 hours
- Total estimate: 8-9 hours
- Scope clarity: Medium (file storage backend defined, but edge cases need discovery)
→ **TRACK B (Full)**

### Why Track B

This ticket requires:
- **Database schema changes**: Adding new `Attachment` model with relationships and cascading deletes
- **API contract design**: Three new endpoints with proper HTTP semantics
- **File system integration**: Local storage with disk cleanup on delete
- **Security implementation**: Ownership verification, authorization checks
- **Comprehensive testing**: Unit tests for service, integration tests for endpoints, E2E for full flows
- **Architecture decisions**: File storage strategy, error handling, disk cleanup timing

### Implementation Scope

**Current State**:
- ❌ No Attachment model in schema
- ❌ No AttachmentsController
- ❌ No AttachmentsService
- ❌ No multer middleware configured
- ❌ No storage directory structure
- ❌ No file cleanup logic

**Required Changes**:
1. Add `Attachment` model to Prisma schema with Task relationship
2. Create database migration for attachment table
3. Implement `AttachmentsService` with upload/delete/list methods
4. Implement `AttachmentsController` with three endpoints
5. Configure multer middleware for file upload handling
6. Implement file system operations (save, delete, stream)
7. Implement authorization checks (owner verification)
8. Add comprehensive validation (file size, type, etc.)
9. Comprehensive test coverage (unit, integration, E2E)

**Affected Files**:
- `prisma/schema.prisma` - Add Attachment model
- `prisma/migrations/*` - New migration for attachments table
- `src/attachments/attachments.module.ts` - New module
- `src/attachments/attachments.controller.ts` - New controller
- `src/attachments/attachments.service.ts` - New service
- `src/attachments/dto/create-attachment.dto.ts` - New DTOs
- `src/common/config/multer.config.ts` - Upload configuration
- `src/**/*.spec.ts` - Test cases
- Root `.gitignore` - Exclude uploads directory

### Technical Decisions

1. **File Storage Location**:
   - Development: `web-applications/backend/uploads/` (local filesystem)
   - Decision rationale: Simple, no external dependencies, suitable for MVP
   - Future: Can migrate to S3/Azure Blob with interface abstraction

2. **File Structure**:
   - Naming: UUID-based to prevent conflicts and directory traversal attacks
   - Path: `/uploads/{taskId}/{uuid}-{originalFilename}`
   - Rationale: Organized by task, collision-safe names

3. **Validation Strategy**:
   - Max file size: 10MB (configurable via env)
   - Allowed MIME types: image/*, application/pdf, text/plain, application/vnd.openxmlformats-officedocument*
   - Validated at middleware (multer) and service layer

4. **Authorization Pattern**:
   - Verify ownership at endpoint (user must own parent task)
   - Use JwtAuthGuard + CurrentUser decorator
   - Fetch task to verify userId matches

5. **Cleanup Strategy**:
   - Synchronous file deletion on API call (simple, fast)
   - Could optimize with background job queue for large files (future)
   - Cascading delete via Prisma when task deleted (via T-206)

6. **Error Handling**:
   - File too large: 400 Bad Request
   - Invalid file type: 400 Bad Request
   - Unauthorized: 403 Forbidden
   - Task not found: 404 Not Found
   - Disk write failure: 500 Internal Server Error

### Track B Artifacts Required

- ✅ `requirements/README.md` - Requirements defined
- ✅ `design/README.md` - Design decisions documented
- ⏳ `planning/README.md` - Task breakdown (to create)
- ✅ `testing/README.md` - Test cases defined
- ⏳ `implementation/README.md` - Implementation notes template (to create)
- ✅ `metadata.json` - Metadata marked as Track B

### Completion Gate

- [ ] Design phase complete with storage strategy finalized
- [ ] Planning phase complete with task breakdown
- [ ] Database schema created and tested
- [ ] File upload/download endpoints implemented
- [ ] Authorization and validation working correctly
- [ ] File cleanup on delete working correctly
- [ ] All test cases passing (unit, integration, E2E)
- [ ] File storage directory properly configured
- [ ] Disk cleanup tested
- [ ] Code review completed with focus on security and file handling

---

**Decision Date**: 2026-03-21  
**Track**: B (Full SDLC)  
**Status**: Scoped (ready for Implementation phase)  
**Next Phase**: Begin implementation tasks in sequence (Phase 1: Schema, Phase 2: Service/Controller, Phase 3: Testing)
