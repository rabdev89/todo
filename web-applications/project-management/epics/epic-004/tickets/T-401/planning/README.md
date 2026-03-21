# T-401: File Attachments (Backend) - Planning

## Implementation Phases

### Phase 1: Database & Infrastructure (Done)
- [x] Update `schema.prisma` with `Attachment` model.
- [x] Run Prisma migration.
- [x] Configure static file serving in `AppModule`.
- [x] Install dependencies (`multer`, `@types/multer`, `@nestjs/serve-static`).

### Phase 2: Service & Controller (Done)
- [x] Create `AttachmentsService` with upload/delete logic.
- [x] Implement endpoints in `TasksController`.
- [x] Configure Multer storage engine.
- [x] Implement ownership verification logic.

### Phase 3: Verification (In Progress)
- [/] Create E2E test suite `attachments.e2e-spec.ts`.
- [/] Verify cascading deletes.
- [ ] Manual verification via browser/UI.

## Estimated Effort
- **Backend Implementation**: 4 hours (Completed)
- **Infrastructure/Static Serving**: 1 hour (Completed)
- **Testing (Unit/E2E)**: 3 hours (In Progress)
- **Total**: ~8 hours
