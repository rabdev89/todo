---
description: Domain-specific AI rules for Flutter development.
---

# Flutter Domain Rules

When working on a Flutter mobile or web application, you MUST adhere to the following standards:

1.  **State Management**:
    - Use a consistent state management solution (e.g., `flutter_riverpod`, `provider`, `bloc` as configured in the project). If Riverpod is used, utilize Notifier/AsyncNotifier patterns.
    - DO NOT use `setState` for anything other than ephemeral, localized UI animations or momentary toggle states.

2.  **Architecture & Logic Separation**:
    - **UI Layer**: Keep screens and widgets focused on presentation. Use Consumer widgets or equivalent to react to state changes.
    - **Provider/Controller Layer**: Manage application state and business logic here. Must NOT contain UI-specific imports (no `flutter/material.dart`).
    - **Repository/Service Layer**: Handle data access and external API interactions. Methods must return domain models or throw specific exceptions. No direct DB queries inside UI or Providers.

3.  **Code Styles & Linting**:
    - Follow standard Dart best practices and ensure all code adheres to the configured linter warnings (e.g., `flutter_lints` and `analysis_options.yaml`).
    - Do not leave unused imports or dead code.
    - Use `const` constructors wherever possible for performance optimization.

4.  **Testing Mandate (CRITICAL: 80-100% Target)**:
    - Any new logic MUST be accompanied by unit/widget tests to maintain the 80%+ coverage target.
    - **Unit Tests**: Test pure logic classes and calculators.
    - **Provider/State Tests**: Mock dependencies and verify state transitions.
    - **Widget Tests**: Use `pumpWidget` or custom test wrappers to test UI rendering against mocked states. Do not hit real backend services during widget testing.
