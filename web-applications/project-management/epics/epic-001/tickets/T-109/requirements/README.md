# Requirements: T-109 Logout Functionality

## Problem Statement
Users need a way to securely end their session and sign out of the application. Currently, no UI exists for logging out, requiring users to manualy clear storage or cookies.

## Functional Requirements
- **Logout Action**: A clearly labeled "Logout" or "Sign Out" button/liquid link.
- **Token Clearing**: Remove `access_token` from `localStorage`.
- **Navigation**: Immediate redirect to the Login page (`/login`).
- **Confirmation (Optional/Nice-to-have)**: Confirmation dialog to prevent accidental logout (standard for SaaS).

## Non-Functional Requirements
- **Security**: Token must be fully cleared.
- **UX**: Button should be easily accessible but not intrusive.

## Acceptance Criteria
- [ ] Logout button is visible on the Dashboard.

- [ ] Clicking logout should display a modal asking "Are you sure yo want to sign out? All unsaved changed will be lost"
- [ ] Clicking sign out from modal should clear the auth token.
- [ ] User is redirected to `/login`.
- [ ] User cannot navigate back to Dashboard without re-authenticating.

