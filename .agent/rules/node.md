---
description: Domain-specific AI rules for Node.js backend development.
---

# Node.js Domain Rules

When working on a Node.js (e.g., Express, NestJS, Fastify) backend application, you MUST adhere to the following standards:

1.  **Architecture & Language**:
    - Use TypeScript primarily. Explicitly type all service functions, controller inputs, and responses. Avoid the use of `any`.
    - Follow a layered architecture (Controller -> Service -> Data Access/Repository) to decouple business logic from HTTP transport and database concerns.

2.  **Error Handling & Validation**:
    - Use consistent error handling middleware. Never leak internal server errors (stack traces) to the client.
    - Validate all incoming request bodies, params, and queries using validation schemas (e.g., Zod, Joi, class-validator) before processing logic.

3.  **Code Quality**:
    - Follow established ESLint and Prettier configurations.
    - Avoid "Callback Hell" by using `async/await` patterns consistently.
    - Ensure sensitive credentials and configurations are loaded via environment variables and never hardcoded.

4.  **Testing Mandate (CRITICAL: 80-100% Target)**:
    - Maintain high test coverage using frameworks like `Jest`, `Mocha`, or `Vitest`.
    - **Unit Tests**: Test core business functions and services in isolation by mocking databases and external API calls.
    - **Integration Tests**: Use tools like `Supertest` to verify complete API routes against a seeded test database or mocked data layer.
