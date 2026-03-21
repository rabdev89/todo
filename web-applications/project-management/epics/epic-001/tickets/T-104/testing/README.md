# T-104 Testing: Secure Routes Middleware

## Test Strategy
- **Integration Tests:** Focus on the Guard's ability to block/allow requests.
- **Controller Tests:** Verify the data returned by `/users/me`.

## Test Cases
- **TC-SEC-1:** Valid Token Access
  - Input: Valid JWT in header.
  - Expected: 200 OK, Correct user profile returned.
- **TC-SEC-2:** Missing Token
  - Input: No header.
  - Expected: 401 Unauthorized.
- **TC-SEC-3:** Invalid/Expired Token
  - Input: Tampered or old token.
  - Expected: 401 Unauthorized.

## Verification Evidence
- [x] `npm run test:e2e -- --testPathPattern=auth` - **5/5 tests passing**
  - ✓ registers a user and returns id/email
  - ✓ logs in and returns access_token; wrong password yields 401
  - ✓ GET /users/me with valid token returns user data
  - ✓ GET /users/me without token returns 401
  - ✓ GET /users/me with invalid token returns 401
- [x] Security scan checklist for token validation logic - **Complete**
  - JWT extraction from Bearer header: ✓
  - Token validation against JWT_SECRET: ✓
  - Request enrichment with user payload: ✓
  - 401 response on unauthorized access: ✓
