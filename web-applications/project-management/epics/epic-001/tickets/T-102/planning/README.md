# T-102 Planning: User Model & Migrations

## Task Breakdown
1. [ ] Install `@prisma/client` and `prisma` dev dependency in `/backend`.
2. [ ] Initialize Prisma: `npx prisma init`.
3. [ ] Define the `User` model in `prisma/schema.prisma`.
4. [ ] Run `npx prisma migrate dev --name init_users`.
5. [ ] Verify `PrismaService` is injected and functional in NestJS.

## Verification Checklist
- [ ] `prisma/schema.prisma` contains the `User` model.
- [ ] `SQL` migration file exists in `prisma/migrations`.
- [ ] Database connection is successful.
