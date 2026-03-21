# Verification Report

> **AI Instruction**: You MUST generate this report and ensure all items pass BEFORE asking the human for review or marking a ticket `[DONE]`. If any step fails, you must autonomously debug and fix the issue.

## 1. Must-Have Truths (Functional Checklist)

_Phrased backward: What must be TRUE for this Ticket's goal to be met?_

- [ ] [Example: User can click 'Check in' and the star counter increases globally.]
- [ ] [Example: Access token is successfully refreshed without user logout.]

## 2. Zero-Mock Policy Audit

_Mathematically prove no mock data was used in the feature._

- **Audit Command Run**: `grep -ri "mock" web-applications/<feature_path>`
- **Result**: [Paste CLI output here showing no illegal mocks used]
- **Status**: [PASS / FAIL]

## 3. Database Schema Alignment

_Prove alignment with the deployed database schema._

- **Reference Export**: `supabase-export.md`
- **Verification**: [Confirm that the implemented models and RPCs exactly match the names and types in the export file.]
- **Status**: [PASS / FAIL]

## 4. CLI Test Output Proof

_Paste the exact output of the test run to prove 100% coverage and success._

```bash
# PASTE CLI OUTPUT HERE
```

- **Status**: [PASS / FAIL]

---

**Verification Verdict**: [APPROVED / REJECTED]
_(If REJECTED, immediately pivot to debugging mode. Do not pause for human input.)_
