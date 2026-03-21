# T-401: File Attachments (Backend) - Testing

## Test Strategy
Focus on verifying file persistence, database synchronization, and strict ownership checks.

## Test Cases

### 1. Attachment Upload (E2E)
- **Scenario**: Authorized user uploads a valid file.
- **Expected**: File is saved to `./uploads`, record created in `attachments` table, 201 response.

### 2. Unauthorized Upload
- **Scenario**: User tries to upload to a task they don't own.
- **Expected**: 403 Forbidden.

### 3. Invalid File Type
- **Scenario**: User uploads an executable or restricted file type.
- **Expected**: 400 Bad Request (via Multer filter).

### 4. File Deletion
- **Scenario**: User deletes an existing attachment.
- **Expected**: Physical file removed from disk, record removed from DB, 200 response.

### 5. Cascading Delete
- **Scenario**: Delete a task with attachments.
- **Expected**: All related attachments are removed from DB (physical file cleanup handled separately or via interceptor).

## Verification Results

### E2E Test Suite (`attachments.e2e-spec.ts`)
- [ ] Upload valid file: **PENDING**
- [ ] Delete valid file: **PENDING**
- [ ] Ownership checks: **PENDING**

### Manual verification
- [ ] UI upload check: **PENDING**
- [ ] Download link check: **PENDING**
