# T-103 Testing: Auth Service

## Test Strategy
- **Unit Tests:** Focus on `AuthService` isolated logic.
- **Integration Tests:** End-to-end (E2E) tests using `supertest`.

## Test Cases
- **TC-AUTH-1:** Registration
  - Input: valid email/pass.
  - Expected: 201, User in DB.
- **TC-AUTH-2:** Login Success
  - Input: existing email/correct pass.
  - Expected: 200, JWT returned.
- **TC-AUTH-3:** Login Failure
  - Input: valid email/wrong pass.
  - Expected: 401 Unauthorized.

## Verification Evidence
- [ ] `npm run test:e2e -- --testPathPatterns=auth`
- [ ] Postman collection run results.

## Verification Log
- **2026-03-18**:
  - **DB up**: `cd web-applications/backend && docker compose up -d`
  - **Prisma migrate**: `cd web-applications/backend && npm run prisma:migrate`
  - **Backend lint/build**: `cd web-applications/backend && npm run lint && npm run build`
  - **Auth e2e**: `cd web-applications/backend && npm run test:e2e -- --testPathPatterns=auth`
