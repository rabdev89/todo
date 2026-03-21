# T-107 Design: Login Validation

## Backend Changes
### `auth.constants.ts`
- `LOGIN_FAILED_MESSAGE` — single string used for all failed password logins.

### `AuthService.login`
1. Find user by email.
2. If not found OR password doesn't match → `UnauthorizedException(LOGIN_FAILED_MESSAGE)`.
3. **Security**: Same message for both paths (anti-enumeration). Optional future: dummy `bcrypt.compare` when user missing to narrow timing gaps.

### `LoginDto`
- Trim email.
- Password: `@IsNotEmpty` + `@MaxLength(72)` — **do not** use `@MinLength(8)` on login (avoids leaking registration policy via **400** vs **401**).

## Frontend Changes
### `LoginPage.tsx` / `lib/loginMessages.ts`
- **401** on sign-in: MUI **Alert** + **Snackbar** with `LOGIN_FAILED_MESSAGE` (must match backend).
- Submit button **disabled** + **CircularProgress** while `submitting`.
- Client-side: required email/password + basic email format before submit.
