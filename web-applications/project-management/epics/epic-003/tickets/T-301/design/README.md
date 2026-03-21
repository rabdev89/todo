# T-301 Design: Attachment Service

## Style Attribution
- **Source:** [style_guide.json](file:///Users/ronaldbaniqued/Code/Origin/ToDoApp/ai-assisted-development/web-applications/project-management/design/style_guide.json)
- **Visuals:** Use standard MUI `Button` with `#027CEC` for upload triggers. List items with `8px` radius.

## Architecture
- **Backend:** NestJS `multer` for file handling.
- **Database:** `Attachment` model in Prisma.
- **Frontend:** `FileUpload` component with progress indicator.

## Data Schema (Ref)
- `Attachment`: `id`, `filename`, `url`, `size`, `taskId`.

## Plan & Breaths
- **Breath 1:** Database update (Add `Attachment` model & Migrate).
- **Breath 2:** Backend: `AttachmentsModule` with `Multer` configuration and upload controller.
- **Breath 3:** Backend: Static file serving for the `uploads/` directory.
- **Breath 4:** Frontend: Attachment list and upload component in Task Detail view.

## Verification Spec
- **Automated:** Integration tests for file upload endpoint with mock files.
- **Manual:** Upload a PDF and an Image via UI and verify storage/metadata.
