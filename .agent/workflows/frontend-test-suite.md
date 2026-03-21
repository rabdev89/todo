---
description: Create and enforce comprehensive test suites for frontend features
---

# Frontend Test Suite Workflow

Use this workflow whenever the human requests `/frontend-test-suite` or when you are wrapping up a new frontend feature. The primary goal is 80-100% test coverage.

## Instructions for the AI

1.  **Analyze the Feature**: Read the newly implemented logic, state controllers, and UI components in the active project directory.
2.  **Logic Unit Tests**:
    - Create corresponding isolated test files for pure parsing, validation, or calculator logic.
    - Ensure 100% logic testing.
3.  **State & Provider Testing**:
    - Create mocked dependencies or API clients using the project's standard mocking library (e.g., `mocktail`, `jest.mock`).
    - Test global state transitons (loading, success, error) and business rules within the state manager (e.g., Riverpod, Redux).
4.  **UI Component Testing**:
    - Wrap the component using the project's specialized test helper (e.g., `pumpApp`, `render` with Context Providers).
    - Write tests for initial rendering, error states, and user interactions (simulating clicks, typing, and submitting).
5.  **Integration (Optional)**:
    - If the feature encompasses a core user journey, add an E2E test to the integration or e2e test directory.
6.  **Verify Coverage**:
    - Execute the corresponding test runner and coverage flag (`npm run test:coverage` or equivalent).
    - Assess the generated coverage report. Add targeted tests if the coverage falls below the 80% watermark.
7.  **Complete**: Return the final testing report snippet and securely document any gaps.
