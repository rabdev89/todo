# T-401: File Attachments (Backend) - Requirements

## Overview
Enable users to attach files to tasks for better context and collaboration. This backend implementation handles file storage, database persistence, and access control.

## User Stories
- As a user, I want to upload files to a specific task so I can keep related documents organized.
- As a user, I want to see a list of attachments for each task.
- As a user, I want to download attached files.
- As a user, I want to delete attachments I no longer need.

## Functional Requirements
1. **File Upload**:
   - Support multipart/form-data uploads.
   - Associate files with a specific `taskId`.
   - Validate file size (max 10MB).
   - Validate file types (images, PDF, common document formats).
2. **File Retrieval**:
   - Provide metadata (filename, size, mimetype) when fetching tasks.
   - Provide a public URL (or streaming endpoint) to download the file.
3. **File Deletion**:
   - Remove attachment record from database.
   - Remove physical file from disk storage.
4. **Security & Authorization**:
   - Only the task owner can upload attachments.
   - Only the task owner can view/download attachments.
   - Only the task owner can delete attachments.

## Non-Functional Requirements
- **Storage**: Local filesystem storage for MVP (`/uploads` directory).
- **Scalability**: Path structure should allow for easy migration to cloud storage (S3).
- **Performance**: Efficient file streaming for downloads.
- **Reliability**: Ensure database and disk stay in sync (no orphaned files).
