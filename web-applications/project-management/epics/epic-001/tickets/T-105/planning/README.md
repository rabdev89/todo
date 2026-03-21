# T-105 Planning: Social Login

## Task Breakdown

### Backend Implementation (Completed)
1. [x] Metadata Update: status to `implementation-in-progress`, track to `B`.
2. [x] Backend: Install `passport-google-oauth20`, `passport-facebook` and types.
3. [x] Backend: Implement `GoogleStrategy` and `FacebookStrategy`.
4. [x] Backend: Add OAuth endpoints to `AuthController`.
5. [x] Backend: OAuth configuration in `.env` and `.env.example`.

### Remaining Frontend Work
6. [x] Frontend: Build branded social login buttons with Material UI.
7. [x] Frontend: Setup callback route handling to store received JWT.

## Implementation Notes
- Google and Facebook strategies use account linking: users with matching emails are automatically linked to existing accounts
- OAuth callbacks redirect to frontend with JWT token in query parameter
- Environment variables required for development: Google Client ID/Secret, Facebook App ID/Secret
- Frontend uses Material UI components for branded login buttons
- AuthCallbackPage component handles token capture and localStorage persistence


## Verification Checklist - Backend
- [x] Google strategy properly configured
- [x] Facebook strategy properly configured
- [x] AuthController has OAuth endpoints
- [x] Code compiles and lints without errors
- [x] All auth E2E tests passing (5/5)
- [ ] Integration tests for callback logic (mock strategies) - optional enhancement

## Verification Checklist - Frontend
- [x] Material UI social login buttons implemented
- [x] OAuth endpoints properly wired to buttons
- [x] AuthCallbackPage component created
- [x] JWT token captured from query parameter
- [x] Token stored in localStorage
- [x] Frontend code compiles without errors
- [ ] Manual testing with development OAuth credentials - recommended pre-deployment
