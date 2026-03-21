# Code Quality Standards

**Non-negotiable standards** for all code changes, regardless of language or track.

---

## Testing (REQUIRED)

### Test-Driven Development (TDD) Required

> **See `.agent/rules/tdd.md` for the full iron law protocol.**
1. **Write test first** - Define behavior before implementation
2. **Watch it fail** - Verify test actually tests something
3. **Implement minimum** - Only code needed to pass the test
4. **Make it pass** - Green tests
5. **Refactor** - Improve without breaking tests

### Test Requirements

- **Coverage**: All production code must have corresponding tests
- **Colocated**: Tests live next to code (not in separate test folder, unless project convention)
- **Independent**: Tests don't share state or fixtures
- **Clear**: Test name describes what it tests, not how it tests it
- **Fast**: Suites run in seconds, not minutes

### What Tests Must Answer

1. What is the unit under test?
2. What is the expected behavior?  
3. What inputs trigger different behaviors?
4. What are edge cases?
5. How will I find the bug if it breaks?

### Anti-patterns

✗ Shared test fixtures causing coupling  
✗ Tests that test implementation details, not behavior  
✗ Skipped tests accumulating technical debt  
✗ "I'll add tests later"

---

## Code Style (LANGUAGE-SPECIFIC)

### JavaScript/TypeScript

- Use `const` by default, `let` only when necessary
- Prefer arrow functions and functional methods (`map`, `filter`, `reduce`)
- Use destructuring early and often
- Name functions as verbs (`validate()`, `transform()`)
- Name booleans as questions (`isActive()`, `hasPermission()`)
- Keep functions under 20 lines when possible

### Python

- Follow PEP 8 with Black formatter
- Type hints on all function signatures
- Docstrings for all public functions
- Comprehensions over loops when readable
- Named parameters for clarity

### Flutter/Dart

- Follow Dart style guide
- Use meaningful variable names
- Organize imports (dart, package, relative)
- Document public APIs with `///` comments

---

## Code Review Standards

### Before pushing code, verify:

- [ ] Tests pass locally (verified per `.agent/rules/verification.md`)
- [ ] No linting errors (verified per `.agent/rules/verification.md`)
- [ ] No type errors
- [ ] Code is readable without explanation
- [ ] No commented-out code
- [ ] No debug prints or console logs
- [ ] Functions/classes have clear purpose
- [ ] Error handling is explicit
- [ ] No magic numbers or strings

### Commit Messages

```
Type: Brief description [TICKET-ID]

Longer explanation if needed. Reference the why, not the what.

Ticket: TICKET-ID
```

**Types**: feat, fix, refactor, test, docs, chore

---

## Common Issues to Avoid

### Complexity
- Single Responsibility: One job per function
- Cyclomatic Complexity: Keep decisions/loops manageable
- Parameter Count: More than 3 suggests refactoring

### Maintainability
- Clear variable names over clever abbreviations
- Explicit over implicit behavior
- DRY (Don't Repeat Yourself) but avoid false abstraction
- Comments explain "why", not "what"

### Performance
- Don't optimize prematurely
- Profile before optimizing
- Readable code is often fast enough
- Document performance-critical sections

### Security
- Never hardcode secrets
- Validate all inputs
- Use parameterized queries
- Sanitize external data
- Follow security.md for project-specific rules

---

## Escalation Points

If ANY of these are true, escalate before committing:

- Code changes security-sensitive functionality
- Tests cannot be written for code (suggests poor design)
- Code is a workaround for larger architectural issue
- Linting/type errors cannot be resolved without major refactor
- Performance impact is uncertain or negative

---

## By Track

### Track A (Lean)
- [ ] Tests pass
- [ ] No linting errors
- [ ] Code is readable
- [ ] No security issues

### Track B (Full)
- All Track A requirements PLUS:
- [ ] Code review completed
- [ ] Documentation updated
- [ ] Edge cases tested
- [ ] Performance validated (if applicable)

---

## Continuous Improvement

- Update this document when you learn better practices
- Question rules that don't make sense
- Propose changes through proper channels
- Never violate code quality for speed
