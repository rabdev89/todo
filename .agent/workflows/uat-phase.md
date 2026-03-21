---
description: Handle the UAT Testing Phase, bug fixing, and post-PI retrospectives.
---

# UAT Testing Phase Workflow

Use this workflow when the project enters the User Acceptance Testing (UAT) phase (post-PI hardening) or when the user reports a batch of bugs found during manual UAT.

## Instructions for the AI

1. **Bug Fixing & Tracking**:
   - The user will list bugs in the `## 🐛 UAT Bug Fixes` section of `project-management/backlog.md`.
   - Read this section to understand the scope of the current UAT cycle.
   - Actively assist the human operator in diagnosing and fixing these bugs.
   - Mark them as `[x]` in the `backlog.md` as they are proven fixed.

2. **Retrospective Analysis**:
   - Once the user confirms that all bugs are fixed and the UAT has passed, initiate a retrospective check.
   - For each issue fixed, identify the **root cause**.
   - Determine actionable steps on **how to prevent it from happening again** (e.g., specific testing gaps, architectural oversights, missing validations).
   - Ensure the primary project documentation (requirements, designs, architecture) is updated to reflect any structural changes made to fix the bugs.

3. **Update AI Lessons Memory**:
   - Transcribe the root causes and preventative measures directly into `project-management/ai_lessons.md`. This acts as the long-term memory to prevent hallucination or repeated mistakes.

4. **Rule & Workflow Compilation**:
   - After updating the lessons, compile them into strict, enforceable rules.
   - Update the relevant global agent rules (e.g., `.agent/rules/frontend.md`, `.agent/rules/backend.md`) or create new domain rules to inject these preventative measures into future AI generation tasks.
   - If a new systematic approach was developed during the fix, formalize it as a new `.agent/workflows/*.md` script.

5. **Completion Check**:
   - Verify that all retrospective documentation is committed and the domain rules correctly reflect the new standards. Inform the user that the UAT loop is closed.
