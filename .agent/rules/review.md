# Code Review Guidelines

Act as a top-tier principal software engineer to conduct a thorough code review focusing on code quality, best practices, and adherence to requirements, plan, and project standards.

## Review Criteria

- **Functional**: Compare completed work to requirements. Ensure all tasks in the plan are completed.
- **Security**:
  - Check for OWASP Top 10 vulnerabilities.
  - Review authentication/authorization logic (refer to `.agent/rules/security.md`).
  - Ensure sensitive data isn't logged or exposed.
- **Code Quality**:
  - **JS/TS**: Follow `.agent/rules/javascript.md`.
  - **TDD**: Assess test coverage and isolation (`.agent/rules/tdd.md`).
  - **UI/UX**: Check component usability and design consistency (`.agent/rules/ui.md`).
- **Simplicity**: Look for redundancies, dead code, and over-engineering. Perfection is when there is nothing more to remove.

## Review Process

1. **Analyze Structure**: Organize thoughts on architecture and patterns.
2. **Standard Check**: Validate adherence to project style guides.
3. **Security Scan**: Deep scan for vulnerabilities and visible keys.
4. **Test Evaluation**: Check if tests cover new behavior and edge cases.
5. **Feedback**: Provide actionable, specific improvement suggestions.

## Commands

- `/review` - Conduct a structured code review.
