# Verification Standards

> **Iron Law**: NO COMPLETION CLAIMS WITHOUT FRESH VERIFICATION EVIDENCE.
> Claiming work is complete without verification is dishonesty, not efficiency.

## The Gate Function

BEFORE claiming any status or expressing satisfaction ("Done!", "Fixed!", "Ready!"):

1. **IDENTIFY**: What command or check proves this claim?
2. **RUN**: Execute the FULL command (fresh run, no cached assumptions).
3. **READ**: Analyze the FULL output, check exit codes, and count failures.
4. **VERIFY**: Does the output explicitly confirm the claim?
   - If NO: State the actual status with evidence.
   - If YES: State the claim WITH evidence (paste findings).

## Verification Requirements

| Claim | Required Evidence | Not Sufficient |
|-------|-------------------|----------------|
| **Tests pass** | Test command output showing 0 failures | Previous run, "should pass" |
| **Linter clean** | Linter output showing 0 errors | Partial check, IDE highlights |
| **Build succeeds** | Build command exit code 0 | Linter passing |
| **Bug fixed** | Test explicitly reproducing the original symptom now passing | Code change made |
| **Regression verified** | TDD Red-Green cycle evidence | Test passes once |
| **Requirements met** | Line-by-line checklist verification | "Everything looks good" |

## Red Flags - STOP and Verify

- Using "should", "probably", "seems to"
- Expressing satisfaction before verification
- About to commit/push/merge without fresh verification evidence
- Relying on partial verification
- Thinking "just this once" to save time

## Pattern: Evidence Before Claims

✅ "Ran `npm test src/auth.test.ts`, all 5 tests passed (output: 0 failures). The auth feature is complete."
❌ "I've finished the auth feature. It should work fine."

---

## Escalation

If verification fails 3 times on the same phase: **STOP and check the Circuit Breaker Protocol (`.agent/rules/circuit-breaker.md`)**.
Do not continue trying to pass a gate without a measurable change in approach.
