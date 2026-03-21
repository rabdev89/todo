# T-402: File Attachments (UI Integration) - Requirements

## Overview
Provide a user-friendly interface for managing file attachments within the task detail drawer. 

## User Stories
- As a user, I want to click an 'Upload' button to select a file from my computer and attach it to a task.
- As a user, I want to see a visual list of all attachments for a task, including their filename and size.
- As a user, I want to see different icons for different file types (e.g., Image, PDF, generic file).
- As a user, I want to download an attachment by clicking a download icon.
- As a user, I want to delete an attachment by clicking a delete icon and see it removed from the UI immediately.
- As a user, I want to see a loading state while a file is uploading.

## Functional Requirements
1. **Upload Trigger**: A button in the task detail drawer that opens the native file picker.
2. **Attachment List**: A list displaying all files associated with the selected task.
3. **File Icons**: Context-aware icons based on the file's MIME type.
4. **Download Action**: Triggers a browser download (or opens in a new tab) for the selected file.
5. **Delete Action**: Permantently removes the attachment from the backend and updates the frontend state.
6. **Progress Feedback**: Show 'Uploading...' text or a spinner during the upload transit.
7. **Empty State**: Friendly text or lack of list when no attachments exist.

## UI/UX Standards
- Consistent with the existing "Glassmorphism" / Modern Clean design.
- Use Material UI components (`Button`, `List`, `Paper`, `IconButton`).
- Hover effects on attachment items for better interactivity.
- Toast notifications for success/error feedback.
