---
description: Automatically migrate a ticket-heavy project into the structured Three-Layer (Epic/PI) SDLC.
---

Migrate the current project to the Three-Layer SDLC framework.

1.  **Structural Realignment & Metadata Generation**: You MUST use the Python migration script to prevent token-burn.
    Execute `python .agent/migrate_sdlc.py --source "project-management/tickets" --epic "epic-XXX-migrated"` in the root terminal.
    - If you only want to move specific tickets: Add `--tickets "T-001" "T-002"`.
    - The script will instantly physically move the folders into the new Epic container, generate `epic_metadata.json`, and inject missing `metadata.json` boilerplate into every moved ticket folder.
2.  **Backlog Cleanup**: Update `backlog.md` links to reflect the new paths.
3.  **Retroactive Audit**: Run a gap analysis (Audit Epic [X] against PRD) for all realigned features to identify what the ad-hoc tickets missed.
