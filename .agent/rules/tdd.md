# TDD Rules

> **Enforced by**: All agents during any implementation or bug fix work
> **Priority**: This rule is mandatory. Violating the letter of these rules is violating the spirit.

---

## The Iron Law

```
NO PRODUCTION CODE WITHOUT A FAILING TEST FIRST
```

Write code before the test? **Delete it. Start over.** No exceptions:
- Don't keep it as "reference"
- Don't "adapt" it while writing tests
- Don't look at it
- **Delete means delete**

Implement fresh from tests. Period.

---

## Red-Green-Refactor Cycle

```
RED → Verify RED → GREEN → Verify GREEN → REFACTOR → Verify GREEN → Next
```

### RED — Write Failing Test

Write one minimal test showing what should happen.

**Requirements:**
- One behavior per test
- Clear name describing behavior (not implementation)
- Real code (no mocks unless unavoidable)

### Verify RED — Watch It Fail (MANDATORY)

```bash
# Run the specific test
npm test path/to/test.test.ts
```

Confirm:
- Test **fails** (not errors)
- Failure message is expected
- Fails because **feature missing** (not typos)

Test passes? You're testing existing behavior. Fix test.
Test errors? Fix error, re-run until it fails correctly.

### GREEN — Minimal Code

Write the **simplest code** to pass the test.

**Good**: Just enough to pass
**Bad**: Over-engineered with options, backoff, callbacks (YAGNI)

Don't add features, refactor other code, or "improve" beyond the test.

### Verify GREEN — Watch It Pass (MANDATORY)

```bash
npm test path/to/test.test.ts
```

Confirm:
- Test passes
- Other tests still pass
- Output pristine (no errors, warnings)

Test fails? Fix code, not test.
Other tests fail? Fix now.

### REFACTOR — Clean Up

After green only:
- Remove duplication
- Improve names
- Extract helpers

**Keep tests green. Don't add behavior.**

### Repeat

Next failing test for next feature.

---

## Test Quality Assertions

Tests must answer these 5 questions:

1. What is the unit under test?
2. What is the expected behavior?
3. What is the actual output?
4. What is the expected output?
5. How can we find the bug?

| Quality | Good | Bad |
|---------|------|-----|
| **Minimal** | One thing. "and" in name? Split it. | `test('validates email and domain and whitespace')` |
| **Clear** | Name describes behavior | `test('test1')` |
| **Shows intent** | Demonstrates desired API | Obscures what code should do |

---

## Constraints

- Colocate tests with code unless directed otherwise
- Avoid shared mutable state between tests
- Use explicit factories instead of shared fixtures
- Test expected and likely edge cases
- Get approval before moving on

---

## Anti-Rationalization Table

| Excuse | Reality |
|--------|---------|
| "Too simple to test" | Simple code breaks. Test takes 30 seconds. |
| "I'll test after" | Tests passing immediately prove nothing. |
| "Tests after achieve same goals" | Tests-after = "what does this do?" Tests-first = "what should this do?" |
| "Already manually tested" | Ad-hoc ≠ systematic. No record, can't re-run. |
| "Deleting X hours is wasteful" | Sunk cost fallacy. Keeping unverified code is technical debt. |
| "Keep as reference, write tests first" | You'll adapt it. That's testing after. Delete means delete. |
| "Need to explore first" | Fine. Throw away exploration, start with TDD. |
| "Test hard = design unclear" | Listen to test. Hard to test = hard to use. |
| "TDD will slow me down" | TDD faster than debugging. Pragmatic = test-first. |
| "Manual test faster" | Manual doesn't prove edge cases. You'll re-test every change. |
| "Existing code has no tests" | You're improving it. Add tests for existing code. |

---

## Red Flags — STOP and Start Over

If you catch yourself doing any of these, **delete code and start TDD**:

- ✗ Code before test
- ✗ Test after implementation
- ✗ Test passes immediately (never saw it fail)
- ✗ Can't explain why test failed
- ✗ Tests added "later"
- ✗ Rationalizing "just this once"
- ✗ "I already manually tested it"
- ✗ "Tests after achieve the same purpose"
- ✗ "Keep as reference" or "adapt existing code"
- ✗ "This is different because..."

---

## Verification Checklist

Before marking any implementation work complete:

- [ ] Every new function/method has a test
- [ ] Watched each test fail before implementing
- [ ] Each test failed for expected reason (feature missing, not typo)
- [ ] Wrote minimal code to pass each test
- [ ] All tests pass
- [ ] Output pristine (no errors, warnings)
- [ ] Tests use real code (mocks only if unavoidable)
- [ ] Edge cases and errors covered

**Can't check all boxes? You skipped TDD. Start over.**

---

## When Stuck

| Problem | Solution |
|---------|----------|
| Don't know how to test | Write the desired API first. Write assertion first. Ask the human. |
| Test too complicated | Design too complicated. Simplify interface. |
| Must mock everything | Code too coupled. Use dependency injection. |
| Test setup huge | Extract helpers. Still complex? Simplify design. |

---

## Integration with Debugging

Bug found? Write failing test reproducing it. Follow TDD cycle. Test proves fix and prevents regression. **Never fix bugs without a test.**

See also: `.agent/rules/verification.md` for completion verification requirements.
