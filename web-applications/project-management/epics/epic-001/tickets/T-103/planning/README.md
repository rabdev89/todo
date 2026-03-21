# T-103 Planning: Auth Service

## Task Breakdown
1. [x] Metadata Update: status to `scoped`, track to `B`.
2. [ ] Backend: Install `@types/bcrypt`, `bcrypt`, `passport`, `@nestjs/passport`, `@nestjs/jwt`, `passport-jwt`.
3. [ ] Backend: Generate `AuthModule`, `AuthService`, `AuthController`.
4. [ ] Backend: Implement `AuthService.register(dto: RegisterDto)`.
5. [ ] Backend: Implement `AuthService.login(dto: LoginDto)`.
6. [ ] Backend: Setup `LocalStrategy` for initial login validation.
7. [ ] Backend: Setup `JwtStrategy` for subsequent request validation.

## Implementation Notes
- Use `Passport` for standard auth patterns.
- Ensure `jwt.secret` is loaded from `process.env.JWT_SECRET`.

## Verification Checklist
- [ ] POST `/auth/register` returns 201 and stores hashed password.
- [ ] POST `/auth/login` returns JWT on success.
- [ ] POST `/auth/login` returns 401 on bad password.
