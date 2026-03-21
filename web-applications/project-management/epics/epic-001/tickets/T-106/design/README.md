# T-106 Design: Registration Validation

> **OAuth client JSON** (e.g. `client_secret_*.json` from Google Cloud): **do not commit**. Copy `client_id` / `client_secret` into `web-applications/backend/.env` for T-105. T-106 does not read those files.

## Backend Changes
### RegisterDto.ts
- Use `@Matches` from `class-validator` to enforce password complexity:
  - `(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])`
- Add `@Trim()` equivalent (manual trimming in service if necessary).

### AuthService.ts
- `register()` method:
  1. Check if user exists: `prisma.user.findUnique({ where: { email } })`.
  2. If exists, throw `ConflictException('Email already in use')`.
  3. Hash password and create user.

## Frontend Changes
### RegisterPage.tsx (or LoginPage.tsx if combined)
- Add client-side validation logic using a library like `yup` or simple state checks.
- Display helper text under the password field as the user types.
- Handle 409 error from backend and show "Email already in use" toast.
