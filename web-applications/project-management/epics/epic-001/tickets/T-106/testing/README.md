# T-106 Testing: Registration Validation

## Automated
- [x] **Unit** `register.dto.spec.ts` — weak passwords fail; compliant password passes; email/displayName trimming.
- [x] **E2E** `auth.e2e-spec.ts` — weak password → 400; duplicate email → 409; happy path `Password123!` unchanged.
- [x] **E2E harness** `test/e2e-app-setup.ts` — global `ValidationPipe` matches `main.ts` (all e2e suites).

## Manual
1. Sign up with `12345678` → inline / API error for password rules.
2. Register twice with same email → Snackbar “Email already in use”.
3. Strong password → auto-login and redirect to `/`.

## Evidence (local)
- Backend: `npm run build`, `npx jest src/auth/dto/register.dto.spec.ts`, `npm run test:e2e` — all green.
- Frontend: `npm run lint`, `npm run build` — green.

## Security note
Google/Facebook **client_secret\*.json** files must not be committed. Use `web-applications/backend/.env` (`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, …). Added `project-management/design/.gitignore` to ignore `client_secret*.json`.
