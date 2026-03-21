# T-102: User Model & Migrations

## Requirements
- Follow the schema defined in `database_schema.md`.
- Ensure email is unique and indexed.
- Implement the `User` repository/service in NestJS.

## Verification
- Confirm `users` table exists in PostgreSQL.
- Verify User entity matches the schema.

## Notes
- Prisma requires `DATABASE_URL` to validate/generate. See `web-applications/backend/.env.example`.
