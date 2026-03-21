# T-301 Planning: Attachment Service

## Task Breakdown
1. [x] Metadata Update: status to `scoped`, track to `B`.
2. [ ] Backend: Update `prisma/schema.prisma` with `Attachment` model.
3. [ ] Backend: Install `@types/multer`.
4. [ ] Backend: Implement `AttachmentsController.upload(file, taskId)`.
5. [ ] Backend: Configure static file serving in `main.ts`.
6. [ ] Frontend: Create `AttachmentList` component.
7. [ ] Frontend: Implement `UploadButton` with `axios` post request.

## Implementation Notes
- Use `diskStorage` for development file persistence.
- Ensure `taskId` ownership is verified before saving the file.

## Verification Checklist
- [ ] Uploading a >5MB file returns 400.
- [ ] Uploading a `.exe` file returns 400.
- [ ] Valid files are stored and listed correctly in the UI.
