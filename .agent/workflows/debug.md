---
description: Structured state-tracing for bug hunting and systematic debugging
---

# Systematic Debugging Protocol

> **Iron Law**: NO FIXES WITHOUT ROOT CAUSE INVESTIGATION FIRST.
> If you haven't completed Phase 1, you cannot propose fixes. Symptom fixes are failure.

## Phase 1: Root Cause Investigation (MANDATORY)

**BEFORE attempting ANY fix:**

1. **Read Error Messages Carefully**: Read stack traces completely. Note line numbers, file paths, and error codes.
2. **Reproduce Consistently**: Can you trigger it reliably? What are the exact steps? If not reproducible → gather more data, don't guess.
3. **Check Recent Changes**: What changed? Git diff, recent commits, new dependencies, config changes.
4. **Gather Evidence in Multi-Component Systems**:
   - Log what data enters/exits each component boundary.
   - Verify environment/config propagation.
   - Check state at each layer.
   - Run once to gather evidence showing WHERE it breaks.
5. **Trace Data Flow**: Trace bad values backward through the call stack until you find the original trigger.

## Phase 2: Pattern Analysis

**Find the pattern before fixing:**

1. **Find Working Examples**: What works that's similar to what's broken?
2. **Compare Against References**: Read reference implementations COMPLETELY. Don't skim.
3. **Identify Differences**: List every difference, however small. Don't assume "that can't matter".

## Phase 3: Hypothesis and Testing

**Scientific method:**

1. **Form Single Hypothesis**: State clearly: "I think X is the root cause because Y."
2. **Test Minimally**: Make the SMALLEST possible change to test the hypothesis. One variable at a time.
3. **Verify Before Continuing**: Did it work? If no, revert and form NEW hypothesis. **DON'T add fixes on top of failed ones.**

## Phase 4: Implementation and Verification

**Fix the root cause, not the symptom:**

1. **Create Failing Test Case (TDD)**: Simplest possible reproduction. MUST have before fixing. Use `.agent/rules/tdd.md`.
2. **Implement Single Fix**: Address the root cause identified. No "while I'm here" improvements.
3. **Verify Fix**: Test passes now? No other tests broken? Issue actually resolved?
4. **Defense in Depth**: Add validation at multiple layers to prevent recurrence.

---

## Escalation: The Circuit Breaker rule

If 3+ fixes have failed: **STOP and question the architecture.**
- Each fix reveals new shared state/coupling/problem.
- Fixes require "massive refactor".
- Each fix creates new symptoms elsewhere.

**Discuss with your human partner before attempting Fix #4.**

---

## Anti-Rationalization Table

| Excuse | Reality |
|--------|---------|
| "Issue is simple, don't need process" | Simple issues have root causes too. |
| "Emergency, no time for process" | Systematic debugging is FASTER than guessing. |
| "Just try this first, then investigate" | First fix sets the pattern. Do it right. |
| "I'll write test after fixing" | Untested fixes don't stick. Test-first proves it. |
| "One more fix attempt" (after 2+ failures) | 3+ failures = architectural problem. Question the pattern. |

## Red Flags - STOP and Return to Phase 1

- ✗ "Quick fix for now, investigate later"
- ✗ "Just try changing X and see if it works"
- ✗ "I don't fully understand but this might work"
- ✗ Proposing solutions before tracing data flow
- ✗ **Each fix reveals new problem in different place**
