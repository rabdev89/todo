# T-104 Design: Secure Routes Middleware

## Style Attribution
- **Source:** [api_contracts.md](file:///Users/ronaldbaniqued/Code/Origin/ToDoApp/ai-assisted-development/web-applications/project-management/api_contracts.md)
- **Visuals:** N/A (Backend logic).

## Architecture
- **Guard:** `JwtAuthGuard` extending NestJS `@nestjs/passport` `AuthGuard('jwt')`.
- **Strategy:** `JwtStrategy` to decode and validate JWT payload.
- **Decorator:** Custom `@CurrentUser()` decorator to easily access user data in controllers.

## Implementation Flow
1. Incoming request with `Bearer <token>`.
2. `JwtAuthGuard` triggers `JwtStrategy.validate(payload)`.
3. Strategy fetches user from DB if necessary or returns payload.
4. User object attached to `req.user`.

## Plan & Breaths
- **Breath 1:** Implement `JwtStrategy` and passport configuration.
- **Breath 2:** Implement `JwtAuthGuard` and apply to a test route.
- **Breath 3:** Implement `/users/me` endpoint in `UsersController`.

## Verification Spec
- **Automated:** E2E tests for protected vs. unprotected routes.
- **Manual:** Verify token rejection and acceptance via Postman.
