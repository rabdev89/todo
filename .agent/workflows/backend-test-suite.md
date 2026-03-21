---
description: Create and enforce comprehensive test suites for backend features
---

# Backend Test Suite Workflow

Use this workflow whenever the human requests `/backend-test-suite` or when you are wrapping up a new backend API feature. The primary goal is 80-100% test coverage.

## Instructions for the AI

1.  **Analyze the Feature**: Read the newly implemented services, API endpoints, database models, and validation schemas in the active project directory.
2.  **Environment Setup**: Ensure the project's specific testing framework (`pytest`, `jest`, etc.) and mocking tools are properly configured.
3.  **Service/Logic level Unit Tests**:
    - Create tests for isolated business logic situated in the services or use-case layer.
    - Mock external integrations (DB operations, third-party APIs) meticulously.
    - Ensure both successful paths and expected error throws are explicitly covered.
4.  **Endpoint Integration Tests**:
    - Use the framework's HTTP client (`TestClient`, `Supertest`) to invoke route endpoints explicitly.
    - Simulate authenticated contexts by mocking authorization layers securely.
    - Verify that status codes (200, 400, 403, 500) and response body payloads map correctly to defined schemas.
5.  **Verify Coverage**:
    - Run the testing framework with its coverage tool activated (`pytest --cov`, `npm run test:cov`).
    - Evaluate the output to ensure the test suite achieves the 80% watermark minimum.
6.  **Fallback Quality Check**:
    - Run any configured static analysis or linters to confirm no syntax or style violations have been introduced.
7.  **Complete**: Provide a test summary to the user and mark the test suite task as completed.
