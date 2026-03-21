# T-301 Testing: Attachment Service

## Test Strategy
- **Integration Tests:** Focus on file handling and storage metadata.
- **Security Tests:** Verify size and type constraints.

## Test Cases
- **TC-ATT-1:** Successful Upload
  - Input: 100kb PNG file.
  - Expected: 201 Created, File exists in storage.
- **TC-ATT-2:** File Type Guard
  - Input: `.txt` file.
  - Expected: 400 Bad Request.
- **TC-ATT-3:** Size Guard
  - Input: 10MB JPG.
  - Expected: 400 Bad Request.

## Verification Evidence
- [ ] `npm run test:e2e -- --testPathPattern=attachments`
- [ ] List of stored files in `web-applications/backend/uploads`.
