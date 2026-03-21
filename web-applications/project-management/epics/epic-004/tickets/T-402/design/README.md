# T-402: File Attachments (UI Integration) - Design

## Component Architecture
The attachments UI is integrated directly into the `TaskDetailDrawer` component within `DashboardPage.tsx`.

## Key Components
- **Attachments Section**: A `Box` containing a `Typography` header and the list of attachments.
- **Attachment Item**: A `Paper` (variant="outlined") component for each file, displaying:
  - `ListItemIcon`: MIME-type specific icon.
  - `Typography`: Filename (with `noWrap`).
  - `Typography`: File size in KB.
  - `IconButton` x2: Download and Delete.
- **Upload Button**: A `Button` with `component="label"` and a hidden `input type="file"`.

## State Management
- `uploading`: Boolean state to track transit.
- `selectedTask.attachments`: The source of truth for the local list, updated via `apiFetch`.

## Logic
- **`handleFileUpload`**: Constructs `FormData`, calls `POST /tasks/:id/attachments`, and updates the `tasks` and `selectedTask` states on success.
- **`handleFileDelete`**: Calls `DELETE /tasks/attachments/:id`, removes from local state, and shows a toast.
- **`handleFileDownload`**: Creates a temporary `<a>` tag with correct `href` (API base + URL) and named `download` attribute.
- **`getFileIcon`**: Helper function mapping MIME types categories to MUI icons (`ImageIcon`, `PictureAsPdfIcon`, `InsertDriveFileIcon`).

## Visual Tokens (Style Guide Alignment)
- Header: `Typography variant="caption" fontWeight={700} color="#94A3B8"`.
- Attachment Card: Border color `#F1F5F9`, Hover background `#F8FAFC`, Border radius `2.5`.
- Icons: Purple for images (`#8B5CF6`), Red for PDFs (`#EF4444`), Slate for generic documents (`#64748B`).
