# Implementation Plan: T-108 Login Success Redirect

This ticket ensures that users are redirected to the correct destination after authentication.

## Proposed Changes

### [Frontend: Auth Flow]
#### [MODIFY] [LoginPage.tsx](file:///Users/ronaldbaniqued/Code/Origin/ToDoApp/web-applications/frontend/src/pages/LoginPage.tsx)
- Extract optional `redirect` or `from` query parameter.
- Use `navigate(target, { replace: true })` instead of default `/`.

#### [MODIFY] [AuthCallbackPage.tsx](file:///Users/ronaldbaniqued/Code/Origin/ToDoApp/web-applications/frontend/src/pages/AuthCallbackPage.tsx)
- Extract optional `token` and `redirect` from URL search params.
- Navigate to the redirect target if present.

## Verification
- Manual test: Log in from a specific "interrupt" state and verify return to that page.
- Manual test: Standard login redirects to `/`.
