# T-301 Requirements: Attachment Service

## Overview
Enable users to attach files (images, PDFs) to their tasks. This requires backend storage logic and frontend upload components.

## Requirements
- **File Upload Capability**
  - Support `multipart/form-data` uploads.
  - Linked to a specific `taskId`.
- **Backend Storage**
  - Save files to a local `uploads/` directory for development.
  - Store metadata (filename, path, size, mimetype) in the `Attachment` table.
- **Frontend Integration**
  - "Attach File" button in the Task Detail view (T-204).
  - List of current attachments with download/view links.
- **Security**
  - Limit file size to 5MB.
  - Restricted mimetypes: `image/*`, `application/pdf`.

## Constraints
- Attachments MUST be deleted if the parent task is deleted.
- Users can only upload to tasks they own.
