---
description: Domain-specific AI rules for React web development.
---

# React Domain Rules

When working on a React (or Next.js/Vite) frontend application, you MUST adhere to the following standards:

1.  **Component Architecture**:
    - Use functional components and React Hooks exclusively. No class components unless mandated by a specific legacy library.
    - Keep components small, modular, and focused on a single responsibility.
    - Extract reusable logic into custom hooks.

2.  **State Management & Data Fetching**:
    - Use server-state libraries (like React Query, SWR, or RTK Query) for remote data fetching, caching, and synchronization.
    - Use local state (`useState`, `useReducer`) only for ephemeral UI state.
    - For complex global client state, use lightweight solutions like Zustand, Jotai, or React Context, avoiding prop drilling.

3.  **Styling & UI**:
    - Follow the project's configured styling approach (Tailwind CSS, CSS Modules, Styled Components, etc.) consistently.
    - Ensure responsiveness and accessibility (a11y) standards are met on all custom UI elements.

4.  **Code Styles & Linting**:
    - Adhere to strict TypeScript typings. Avoid using `any`; define robust interfaces or types for all props and state variables.
    - Ensure code passes the configured `ESLint` and `Prettier` rules.

5.  **Testing Mandate (CRITICAL: 80-100% Target)**:
    - Write tests for utilities, custom hooks, and critical UI components using `Jest` and `React Testing Library` (or `Vitest`).
    - Focus on testing user behavior and accessibility rather than implementation details.
    - Mock network requests using MSW (Mock Service Worker) to ensure deterministic and isolated tests.
