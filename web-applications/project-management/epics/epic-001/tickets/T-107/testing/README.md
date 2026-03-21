# T-107 Testing: Login Validation

## Automated
- [x] **Unit** `login.dto.spec.ts` — empty / invalid shape rejected; trimmed email.
- [x] **Unit** `auth.service.spec.ts` — unknown user and wrong password both `UnauthorizedException` with `LOGIN_FAILED_MESSAGE`; identical string assertion.
- [x] **E2E** `auth.e2e-spec.ts` — wrong password and unknown email both **401** with message `Invalid email or password`; empty login body **400**.

## Manual
1. Sign in with wrong password → Alert + bottom Snackbar: **Invalid email or password**.
2. Sign in with unknown email → same copy.
3. Empty email/password → client blocks before submit; API returns **400** if sent empty.

## Evidence
Run with DB up (see backend `.env` `DATABASE_URL`):

```bash
cd web-applications/backend && npm run build && npx jest src/auth/dto/login.dto.spec.ts src/auth/auth.service.spec.ts && npm run test:e2e
cd web-applications/frontend && npm run lint && npm run build
```

## Out of scope (per ticket)
- Account lockout after N failures (bonus / future).
