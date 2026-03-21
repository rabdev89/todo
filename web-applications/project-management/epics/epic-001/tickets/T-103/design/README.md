# T-103 Design: Auth Service

## Style Attribution
- **Source:** [api_contracts.md](file:///Users/ronaldbaniqued/Code/Origin/ToDoApp/ai-assisted-development/web-applications/project-management/api_contracts.md)
- **Visuals:** N/A (Backend logic).

## System Architecture
- **AuthModule:** Encapsulates all auth logic.
- **AuthService:** Business logic for hashing, validation, and signing.
- **AuthController:** REST endpoints.
- **JwtStrategy:** Passport strategy for validating incoming tokens.

## Implementation Details
- NestJS `JwtModule` configuration.
- Bcrypt for hashing.
- Integration with `UsersModule` to fetch/store user data.

## Plan & Breaths
- **Breath 1:** Install dependencies (`bcrypt`, `passport`, `@nestjs/jwt`).
- **Breath 2:** Implement `register` logic and DB integration.
- **Breath 3:** Implement `login` and JWT generation.
- **Breath 4:** Global Exception Filter integration for Auth errors.

## Verification Spec
- **Automated:** Unit tests for `AuthService` (Hashing/Validation).
- **Manual:** Postman/Curl flow for registration and login.
