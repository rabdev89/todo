---
description: Execute a feature plan interactively, guiding me through each task while referencing relevant docs and updating status.
---

# Feature Plan Execution Assistant

Help me work through a feature plan one task at a time.

## Step 1: Gather Context

Ask me for:

- Feature name (kebab-case, e.g., `user-authentication`)
- Brief feature/branch description
- Relevant planning doc path (default `web-applications/project-management/epics/[EPIC-NAME]/tickets/T-{name}/planning/README.md`)
- Any supporting design/implementation docs (design, requirements, implementation)
- Current branch and latest diff summary (`git status -sb`, `git diff --stat`)
- **CI Status**: Check `ci/ci_config.sh` to ensure the correct environment variables are active.

## Step 2: Load the Plan

- Request the planning doc contents or offer commands like:
  ```bash
  cat project-management/tickets/T-{name}/planning/planning.md
  ```
- Parse sections that represent task lists (look for headings + checkboxes `[ ]`, `[x]`).
- Build an ordered queue of tasks grouped by section (e.g., Foundation, Core Features, Testing).

## Step 3: Present Task Queue

Show an overview:

```
### Task Queue: <Feature Name>
1. [status] Section • Task title
2. ...
```

Status legend: `todo`, `in-progress`, `done`, `blocked` (based on checkbox/notes if present).

## Step 4: Interactive Task Execution

For each task in order:

1. Display the section/context, full bullet text, and any existing notes.
2. Suggest relevant docs to reference (requirements/design/implementation).
3. **CRITICAL PRE-CHECK**: Check the `design/README.md` for a `## Reference Mockups` section. If present, use `view_file` to read the specific `.html` mockup file(s). You MUST base your implementation on this exact HTML layout and styling.
4. Ask: "Plan for this task?" Offer to outline sub-steps using the design doc and `.html` mockups.
5. **CI Config Check**: Before suggesting any shell commands for tests or builds, verify they align with the `LINT_CMD` and `TEST_CMD` defined in `ci/ci_config.sh`.
6. **Execution Discipline**: Enforce `.agent/rules/tdd.md` for all code changes. Do not write production code without failing tests.
7. Prompt to mark status (`done`, `in-progress`, `blocked`, `skipped`). **CRITICAL**: Do NOT allow marking a task as `done` without fresh verification output (per `.agent/rules/verification.md`).
8. Encourage code/document edits inside Cursor; offer commands/snippets when useful.
9. If blocked, record blocker info and move task to the end or into a "Blocked" list.

## Step 5: Update Planning Doc

After each status change, generate a Markdown snippet the user can paste back into the planning doc, e.g.:

```
- [x] Task: Implement auth service (Notes: finished POST /auth/login, tests added)
```

Remind the user to keep the source doc updated.

## Step 6: Check for Newly Discovered Work

After each section, ask if new tasks were discovered. If yes, capture them in a "New Work" list with status `todo` and include in the summary.

## Step 7: Session Summary

Produce a summary table:

```
### Execution Summary
- Completed: (list)
- In Progress: (list + owners/next steps)
- Blocked: (list + blockers)
- Skipped / Deferred: (list + rationale)
- New Tasks: (list)
```

## Step 8: Next Actions

Remind the user to:

- Update `web-applications/project-management/epics/EPIC-ID/tickets/T-{name}/planning/planning.md` with the new statuses
- Sync related docs (requirements/design/implementation/testing) if decisions changed
- Run `/check-implementation` to validate changes against design docs
- Run `/writing-test` to produce unit/integration tests targeting 100% coverage
- Run `/update-planning` to reconcile the planning doc with the latest status
- Run `/code-review` when ready for final review
- Run test suites relevant to completed tasks

---

Let me know when you're ready to start executing the plan. Provide the feature name and planning doc first.
