# T-102 Testing: User Model & Migrations

## Test Cases
- **TC-102.1:** Schema Validation
  - Steps: Run `npx prisma validate`.
  - Expected: Schema is valid.
- **TC-102.2:** Migration Success
  - Steps: Check database for `_prisma_migrations` and `users` table.
  - Expected: Migration is recorded and table exists.

## Automated Tests
- [ ] Prisma Validate: `npx prisma validate`
- [ ] DB Connectivity Test

## Verification Log
- **2026-03-18**:
  - **Prisma validate**: `npm run prisma:validate -w backend` (requires `DATABASE_URL`; see `web-applications/backend/.env.example`)
  - **Prisma client generation**: `npm run prisma:generate -w backend`
  - **Backend lint/build**: `npm run lint:backend && npm run build:backend`
  - **DB up + migration applied (local)**:
    - `cd web-applications/backend && docker compose up -d`
    - `cd web-applications/backend && npm run prisma:migrate`
    - Verified with: `docker exec -i todoapp-postgres psql -U postgres -d todoapp -c "\\dt" -c "\\d users"`
  - **Migration artifact**:
    - `web-applications/backend/prisma/migrations/20260318140000_init_users/migration.sql`
    - `web-applications/backend/prisma/migrations/20260318141910_init_users/migration.sql`
