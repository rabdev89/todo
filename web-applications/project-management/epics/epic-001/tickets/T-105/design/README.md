# T-105 Design: Social Login

## Style Attribution
- **Source:** [style_guide.json](file:///Users/ronaldbaniqued/Code/Origin/ToDoApp/ai-assisted-development/web-applications/project-management/design/style_guide.json)
- **Reference Mockup:** [login_register.html](file:///Users/ronaldbaniqued/Code/Origin/ToDoApp/ai-assisted-development/web-applications/project-management/design/epic-001/login_register.html)
- **Visuals:** Branding for Google (`#DB4437`) and Facebook (`#4267B2`). Use MUI `Button` with consistent radius (`8px`) matching the mockup structure.

## Architecture
- **Strategies:** `GoogleStrategy` and `FacebookStrategy` in NestJS `AuthModule`.
- **Controller:** `/auth/google` and `/auth/facebook` endpoints with redirection logic.
- **Service:** Logic to link social IDs to existing user accounts if emails match.

## Plan & Breaths
- **Breath 1:** Dependency setup (`passport-google-oauth20`, `passport-facebook`).
- **Breath 2:** Backend: Google OAuth strategy and callback implementation.
- **Breath 3:** Backend: Facebook OAuth strategy and callback implementation.
- **Breath 4:** Frontend: Social login buttons with branding.

## Verification Spec
- **Automated:** Integration tests for the callback logic using mock profiles.
- **Manual:** Verify end-to-end redirection and login flow for both providers.
