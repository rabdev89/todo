# T-105 Testing: Social Login

## Test Strategy
- **Integration Tests:** Use mock Passport strategies to simulate provider responses.
- **Functional Tests:** Verify UI redirection and token storage.

## Test Cases
- **TC-SOC-1:** Google Login Callback
  - Expected: Authenticated user returned with JWT, account linked if email exists.
- **TC-SOC-2:** Facebook Login Callback
  - Expected: Authenticated user returned with JWT, account linked if email exists.
- **TC-SOC-3:** Account Linking
  - Setup: User exists with `user@example.com`.
  - Action: Login via Google with `user@example.com`.
  - Expected: Authenticated as existing user (not duplicated).

## Backend implementation - Complete ✓
- [x] GoogleStrategy configured and exported
- [x] FacebookStrategy configured and exported
- [x] `/auth/google` and `/auth/google/callback` endpoints
- [x] `/auth/facebook` and `/auth/facebook/callback` endpoints
- [x] User account linking by email
- [x] JWT generation for OAuth flows
- [x] Environment configuration (.env variables)
- [x] Code quality: linting, build, no errors
- [x] Regression tests: all existing E2E tests pass (6/6)

## Frontend implementation - Complete ✓
- [x] Social login buttons with Material-UI styling
- [x] Google button integration (reference mockup colors: #DB4437)
- [x] Facebook button integration (reference mockup colors: #4267B2)  
- [x] Token callback route handling (GET /auth/callback?token=...) — must match backend `FRONTEND_URL` redirect
- [x] JWT storage in localStorage
- [x] Login flow integration with existing authentication

## Verification Evidence
- **Backend Build**: ✓ `npm run build` - Success
- **Linting**: ✓ `npm run lint` - No errors
- **E2E Tests**: ✓ All 5 auth tests passing
  - Register user test ✓
  - Login test ✓
  - GET /users/me with valid token ✓
  - GET /users/me without token (401) ✓
  - GET /users/me with invalid token (401) ✓
- **Frontend Build**: ✓ `npm run build` - Success
- **Frontend Material-UI**: ✓ Material UI migration complete with Visibility icons
- **Frontend OAuth Buttons**: ✓ Google and Facebook buttons configured
- **Frontend Callback Handling**: ✓ AuthCallbackPage captures token and redirects
- **Dependencies**: ✓ passport-google-oauth20, passport-facebook, @mui/icons-material installed
