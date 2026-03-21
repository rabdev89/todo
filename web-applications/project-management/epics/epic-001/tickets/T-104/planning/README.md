# T-104 Planning: Secure Routes Middleware

## Task Breakdown
1. [x] Metadata Update: status to `scoped`, track to `B`.
2. [x] Backend: Configure `PassportModule` in `AuthModule`.
3. [x] Backend: Implement `JwtStrategy` with `validate` method.
4. [x] Backend: Create `JwtAuthGuard`.
5. [x] Backend: Implement `GET /users/me` in `UsersController` with `@UseGuards(JwtAuthGuard)`.
6. [x] Backend: Verify unauthorized access returns 401.

## Implementation Notes
- Ensure `JwtStrategy` correctly extracts the token from the header.
- Use the custom decorator to keep controller methods clean.

## Verification Checklist
- [x] `GET /users/me` with valid token returns 200 and user data.
- [x] `GET /users/me` without token returns 401.
- [x] Access token from T-103 login is valid for this middleware.
