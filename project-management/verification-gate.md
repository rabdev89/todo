# Verification Gate

> **Applies to**: All tickets (Layer 1) and all Epics (Layer 2)
> **Enforced by**: Agent self-assessment + CI output
> **Minimum passing score**: 56 / 70 (80%) for Layer 1 tickets · 63 / 70 (90%) for Layer 2 Epics
> **Action on failure**: Agent MUST remediate and re-score before marking complete

---

## How to Use This Gate

At the end of every ticket or Epic, the agent MUST:
1. Work through each criterion below
2. Assign the score honestly (partial credit is allowed)
3. Sum the total and compare against the passing threshold
4. Log the scored checklist in the ticket's completion note or Epic hardening doc

If the score is below threshold, the agent identifies the lowest-scoring sections, remediates, and re-runs the gate.

---

## Section A — Requirements Compliance (15 pts)

| # | Criterion | Max | Score |
|---|-----------|-----|-------|
| A1 | All acceptance criteria defined in the ticket are met | 4 | |
| A2 | No features were added that are outside the ticket scope (no scope creep) | 3 | |
| A3 | The implementation matches the approved Implementation Plan without deviation | 4 | |
| A4 | Edge cases identified during planning are handled | 2 | |
| A5 | Any deviations from the plan are documented in the activity log | 2 | |

**Section A Total**: __ / 15

---

## Section B — Code Quality (15 pts)

| # | Criterion | Max | Score |
|---|-----------|-----|-------|
| B1 | No TypeScript errors (`tsc --noEmit` passes cleanly) | 3 | |
| B2 | Linter passes with zero errors (warnings acceptable) | 3 | |
| B3 | No commented-out code blocks left in the diff | 2 | |
| B4 | No `console.log`, `debugger`, or TODO left in production paths | 2 | |
| B5 | Functions are single-purpose and under 50 lines where possible | 2 | |
| B6 | Naming is clear and consistent with existing codebase conventions | 3 | |

**Section B Total**: __ / 15

---

## Section C — Testing (15 pts)

| # | Criterion | Max | Score |
|---|-----------|-----|-------|
| C1 | Unit tests exist for all new functions/methods | 4 | |
| C2 | All existing tests still pass (no regressions) | 4 | |
| C3 | Test coverage on new code is ≥ 80% | 3 | |
| C4 | Tests cover at least one happy path and one failure/edge case per function | 2 | |
| C5 | Tests are deterministic (no flaky tests introduced) | 2 | |

**Section C Total**: __ / 15

---

## Section D — Security & Safety (10 pts)

| # | Criterion | Max | Score |
|---|-----------|-----|-------|
| D1 | No secrets, API keys, or credentials committed to source | 4 | |
| D2 | User inputs are validated and sanitised | 3 | |
| D3 | No new dependencies added without justification in the ticket | 2 | |
| D4 | New dependencies have no known critical CVEs | 1 | |

**Section D Total**: __ / 10

---

## Section E — Integration & Contracts (10 pts)

*Layer 2 (Epic-level) only — Layer 1 tickets score this section at 0 if not applicable*

| # | Criterion | Max | Score |
|---|-----------|-----|-------|
| E1 | API contracts (request/response shapes) are unchanged or versioned | 3 | |
| E2 | No breaking changes to shared types or interfaces without Epic-level approval | 3 | |
| E3 | E2E tests pass (if applicable to this Epic) | 2 | |
| E4 | Threat model reviewed — no new attack surface introduced without mitigation | 2 | |

**Section E Total**: __ / 10

---

## Section F — Documentation & Handoff (5 pts)

| # | Criterion | Max | Score |
|---|-----------|-----|-------|
| F1 | `activity-log.md` entry written for this ticket/Epic | 2 | |
| F2 | Any new environment variables documented in the project README or `.env.example` | 1 | |
| F3 | Any architectural decisions made are noted in the relevant project doc | 2 | |

**Section F Total**: __ / 5

---

## Final Score

| Section | Max | Score |
|---------|-----|-------|
| A — Requirements Compliance | 15 | |
| B — Code Quality | 15 | |
| C — Testing | 15 | |
| D — Security & Safety | 10 | |
| E — Integration & Contracts | 10 | |
| F — Documentation & Handoff | 5 | |
| **TOTAL** | **70** | |

---

## Pass/Fail Decision

| Layer | Threshold | Result |
|-------|-----------|--------|
| Layer 1 (Ticket) | ≥ 56 / 70 (80%) | ☐ PASS ☐ FAIL |
| Layer 2 (Epic) | ≥ 63 / 70 (90%) | ☐ PASS ☐ FAIL |

---

## On Failure

If the gate is failed:
1. Identify every criterion scored below half its maximum
2. Address each one — do not skip low-value criteria
3. Re-run the full gate (do not carry forward previous scores)
4. If the gate is failed **twice** on the same ticket/Epic, the Circuit Breaker Protocol activates
