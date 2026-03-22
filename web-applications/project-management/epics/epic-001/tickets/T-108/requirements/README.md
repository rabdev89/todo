# Requirements: T-108 Login Success Redirect

## Problem Statement
When a user logs in, they should be seamlessly transitioned to the main application interface (the Dashboard). Currently, hardcoded redirects to `/` are in place, but they need to be verified and potentially enhanced to support redirections to a "return to" URL if the user was interrupted by a login challenge.

## Functional Requirements
- **Post-Login Redirect**: After successful email/password login, navigate to `/`.
- **Social Login Redirect**: After successful OAuth2 callback, navigate to `/`.
- **Deep Link Support**: If a `redirect_uri` or `from` query parameter is present, navigate there instead of the default `/`.

## Acceptance Criteria
- [ ] User is redirected to `/` after manual login.
- [ ] User is redirected to `/` after social login.
- [ ] If accessing `/settings` (protected) redirects to `/login`, logging in then takes them back to `/settings`.
