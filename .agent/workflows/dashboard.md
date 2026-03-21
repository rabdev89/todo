---
description: Generate a visual project management dashboard overview with automated SDLC tracking sync
---

Generate or update the `project-management/DASHBOARD.md` to provide a fast, visual overview of project progress.

**CRITICAL PRE-REQUISITE: The Synchronization Loop**
Before generating the Dashboard UI, the AI MUST synchronize the true state of the project across all 3 layers:

1. **Ticket Level Sync**: Scan `web-applications/project-management/epics/` and their respective ticket directories. Read the ticket `metadata.json` and verification gates to find the _true_ completed status of every ticket.
2. **Epic Level Sync**: Aggregate the ticket data to determine the Epic status (e.g., if Epic 1 has 5/5 tickets complete, the Epic is complete).
3. **PI Level Sync**: Check the Epic statuses against the active `PI-XXX_Manifest.md` to determine the overall release phase (e.g., UAT Phase, Hardening Phase).
4. **Update Project Tracking**: Using the hard data discovered in steps 1-3, actively update `project-management/backlog.md` and the PI Manifest tracking files to reflect the correct, verified state. **Do not skip this step.**

**Workflow (UI Generation):**
Instead of the AI manually calculating the UI, the AI MUST use the autonomous project-agnostic script.

1. **Execute the Script**: The AI runs `python .agent/dashboard_sync.py` in the root terminal. This script autonomously reads the ticket data, generates the progress bars, and writes directly to `project-management/DASHBOARD.md`.
2. **Review Output**: Wait for the script to finish and verify the file was updated.
3. **Notify User**: Let the human orchestrator know the project state is synchronized and the visual dashboard is ready to view.
