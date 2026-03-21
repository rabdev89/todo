---
name: workflow
description: Instructions for the Two-Track AI development workflow (Lean vs Full).
---

# AI DevKit Workflow Skill

This skill defines the standardized development process for AI agents working on this project. It ensures a balance between speed (Lean Track) and thoroughness (Full Track) based on task complexity.

## Decision Matrix

Always categorize your task before starting to choose the correct track:

| Criteria                              | Track              | Complexity |
| ------------------------------------- | ------------------ | ---------- |
| < 3 files changed, no new schema/API  | **Track A (Lean)** | Low/Medium |
| >= 3 files changed, or new tables/API | **Track B (Full)** | High/Major |

---

## Track A: Lean Workflow (Small/Medium)

Use this for bug fixes, minor UI tweaks, or simple logic updates.

1.  **Initialize**: Create `web-applications/project-management/tickets/T-XXX/` folder. Copy only `TEMPLATE-implementation_plan.md` as `implementation_plan.md`.
2.  **Plan**: Use headers in `implementation_plan.md` (Requirements, Design, Plan) to document the approach concisely.
3.  **Execute**: Create `tasks.md` in the root and implement code.
4.  **Finalize**: Set `**Status**: [DONE]` and update `backlog.md`.

---

## Track B: Full Workflow (Major Features)

Use this for new features, architectural changes, or complex refactors.

1.  **Initialize**: Create `web-applications/project-management/tickets/T-XXX/` and all subfolders (`requirements/`, `design/`, etc.) from `ticket_templates/`.
2.  **Phase-Based Execution**: Strictly follow the sequence:
    - Requirements → Design → Planning → Implementation → Testing
    - Update each folder's `README.md` per phase.
3.  **Approval**: Present `implementation_plan.md` (summary) for explicit user approval at each major phase.
4.  **Finalize**: Set `**Status**: [DONE]` and update `backlog.md`.

---

## Core Rules

- **Backlog**: Always check `backlog.md` first and move items to **🔍 Ready for Review**.
- **Approval**: NEVER execute code for complex changes without explicit user approval.
- **Verification**: Update `backlog.md` to **✅ Verified** only after confirmation.
