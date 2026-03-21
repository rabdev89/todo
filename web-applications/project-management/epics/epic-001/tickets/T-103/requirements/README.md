# T-103 Requirements: Auth Service (Register/Login)

## Overview
Implement a secure authentication service for the TodoApp. This service will handle user registration and login, generating JWTs for subsequent requests.

## Requirements
- **Endpoint: POST /auth/register**
  - Accept `email` and `password`.
  - Validate email format and uniqueness.
  - Hash password using `bcrypt` (10-12 salt rounds).
  - Store user in PostgreSQL via Prisma.
  - Response: `201 Created` with `id` and `email`.
- **Endpoint: POST /auth/login**
  - Accept `email` and `password`.
  - Verify password against stored hash.
  - Generate JWT containing `userId` and `email`.
  - Response: `200 OK` with `access_token`.
- **Security**
  - Use `@nestjs/passport` and `passport-jwt`.
  - Passwords must NEVER be stored in plain text.

## Constraints
- Max 5 concurrent login attempts per 15 mins (Logic for future, but keep in mind).
- JWT secret should be environment-controlled.
