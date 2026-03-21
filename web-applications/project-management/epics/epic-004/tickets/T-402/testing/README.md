# T-402: File Attachments (UI Integration) - Testing

## Test strategy
Manual UI verification and browser-based smoke tests to ensure a smooth user experience.

## Test Cases

### 1. Attachment Display
- **Scenario**: Open a task with existing attachments.
- **Expected**: All attachments are listed with correct filenames, sizes, and icons matching their MIME types.

### 2. Successful Upload
- **Scenario**: Select a valid file and click upload.
- **Expected**: List updates immediately, 'Uploading...' status is visible during transit, success toast appears.

### 3. File Download
- **Scenario**: Click the download icon.
- **Expected**: Browser starts downloading the file with the original filename.

### 4. File Deletion
- **Scenario**: Click the delete icon.
- **Expected**: File is removed from the drawer immediately, success toast appears.

### 5. Error Handling (UI)
- **Scenario**: Attempt upload when backend is down.
- **Expected**: 'Failed to upload' toast appears, uploading status resets.

## Verification Results

### Manual verification (Current Session)
- [ ] UI layout check: **PENDING**
- [ ] Upload functionality: **PENDING**
- [ ] Download functionality: **PENDING**
- [ ] Delete functionality: **PENDING**
- [ ] Toast notifications: **PENDING**
