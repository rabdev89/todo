# T-105 Requirements: Social Login (Google, Facebook)

## Overview
Expand the authentication system to support social login providers, simplifying the onboarding process for users.

## Requirements
- **OAuth2 Providers**
  - Implement Google login using `passport-google-oauth20`.
  - Implement Facebook login using `passport-facebook`.
- **Backend Flow**
  - Redirect users to provider's consent page.
  - Handle callbacks and verify tokens.
  - Create or find user in DB based on email.
  - Issue app-specific JWT for the session.
- **Frontend Integration**
  - Add "Continue with Google" and "Continue with Facebook" buttons to the Login/Register page.
  - Buttons must use official brand colors and logos.
  - **Reference Mockup:** [login_register.html](file:///Users/ronaldbaniqued/Code/Origin/ToDoApp/ai-assisted-development/web-applications/project-management/design/epic-001/login_register.html)

## Constraints
- App IDs and Secrets must be stored in `.env`.
- Ensure secure HTTPS callbacks in production (HTTP ok for local dev).
