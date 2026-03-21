# SKILL: Evidence-Based Validation

## Metadata
- **Category**: methodology
- **Scope**: universal
- **Difficulty**: Complex
- **Last Updated**: 2026-03-09
- **Effectiveness**: Very High

## Problem
Validation often devolves into "It looks correct" (Subjective) or "I ran it and it didn't crash" (Weak). This leads to bugs in production because the *Happy Path* worked once but edge cases were ignored.

## Solution Overview
**Evidence-Based Validation** redefines "Done" as "Proven". You must provide **artifacts** (logs, screenshots, test reports) that demonstrate the feature working as intended.

## Implementation

### The Core Principle
> "If you didn't log it, it didn't happen."

### Validation Artifacts
Every ticket MUST include a `VERIFICATION.md` with:

1.  **Test Execution Logs**
    - `npm test` output showing PASS.
    - Coverage report (if applicable).

2.  **Manual Verification Proof**
    - `curl` request/response for API endpoints.
    - Screenshot/Video for UI components.
    - Database query result showing data state.

3.  **Edge Case Evidence**
    - "Here is the log when the user enters an invalid email."
    - "Here is the 404 response for a missing ID."

### Hard Rules
1.  **No Artifact = No Pass**: You cannot mark a ticket [DONE] without evidence.
2.  **Reproducibility**: The evidence must be reproducible by another developer.
3.  **Negative Testing**: Prove that bad inputs fail correctly.

## Workflow Integration

### Verifier Agent
The `Verifier Agent` uses this skill to audit the `Executor Agent`'s work.

- **Bad**: "I checked the login and it works."
- **Good**: "Here is the JWT token returned by `POST /login`:"
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsIn...",
    "expiresIn": 3600
  }
  ```

### CI/CD Gating
This skill enforces that CI pipelines (GitHub Actions) are the ultimate source of truth.

## Common Mistakes
- **Trusting "It compiled"**: Compilation != Correctness.
- **Testing only Happy Path**: Real users break things.
- **Vague Evidence**: "Tested manually" (useless).
