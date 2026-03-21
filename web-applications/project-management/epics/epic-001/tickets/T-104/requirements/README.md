# T-104 Requirements: Secure Routes Middleware

## Overview
Implement the security infrastructure to protect sensitive API routes using the JWTs generated in T-103.

## Requirements
- **JWT Authentication Guard**
  - Implement a global or route-specific `JwtAuthGuard`.
  - Validate the `Authorization: Bearer <token>` header.
- **User Profile Endpoint: GET /users/me**
  - Protected endpoint that returns the authenticated user's profile.
  - Return `200 OK` with user details (excluding password hash).
- **Access Control**
  - Ensure unauthorized requests (no token or invalid token) return `401 Unauthorized`.
  - Populate the `Request` object with the `user` payload.

## Constraints
- Tokens must be validated against the `JWT_SECRET` environment variable.
- Middleware must be efficient and not block the event loop.
