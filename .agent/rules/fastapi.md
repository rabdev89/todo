---
description: Domain-specific AI rules for Python and FastAPI backend development.
---

# Python & FastAPI Domain Rules

When working on a Python/FastAPI backend application, you MUST adhere to the following standards:

1.  **Architecture & Typing**:
    - Strictly type all function signatures. Use `typing` (List, Dict, Optional, Any) and maintain standard Python 3.10+ typing syntax.
    - **Validation**: ALL request bodies and response schemas MUST be defined using `Pydantic` models. Do not pass raw dictionaries back to the client.

2.  **Dependency Injection**:
    - Use FastAPI's `Depends` for standardizing database connections and Authentication flow (e.g., `get_current_user`).
    - Do NOT instantiate global un-mockable clients inside route handlers.
    - **Service Layer separation**: Keep complex business logic in the service layer. API endpoints should primarily handle input parsing, calling the service, and orchestrating responses.

3.  **Code Quality & PEP 8**:
    - Follow standard PEP 8 styling conventions.
    - Utilize configured formatting/linting tools (`black`, `flake8`, `pydocstyle`, `ruff`).
    - All public functions and classes should have comprehensive, standard-style docstrings (e.g., Google or Sphinx style).

4.  **Testing Mandate (CRITICAL: 80-100% Target)**:
    - Any new API endpoint or Service logic MUST be accompanied by comprehensive tests using `pytest`.
    - Ensure test coverage meets or exceeds the 80% watermark.
    - **Unit Tests**: Service-level testing referencing mocked database/external API responses.
    - **Integration Tests**: API-level testing using FastAPI's `TestClient` to mimic direct HTTP calls.
