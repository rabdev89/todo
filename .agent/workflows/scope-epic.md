---
description: Scope and generate all implementation tickets for a specific Epic
---

I have completed the strategic planning and exported the final designs into `project-management/design/`.

Your task is to **scope and generate all implementation tickets** (T-XXX to T-XXX) required to build the specific Epic defined by the user.

**Requirements for Scoping:**

1. **Alignment**: Every ticket's requirements MUST be anchored to the **Project Foundation** (Vision, PRD, FRD, Epic Backlog).
2. **Design Fidelity**: Every ticket's design MUST follow the **Design Bible** (Sitemap, Style Guide, Interaction Guide, etc.). Crucially, you MUST reference the specific exported mockups in the `## Reference Mockups` section with the path to the `.html` file.
3. **Reference Mockups (CRITICAL RULES)**: When generating tickets, explicitly instruct the AI agent executing the ticket that if a `## Reference Mockups` section exists, it MUST read the specified `.html` mockup file and base its frontend implementation EXACTLY on that mockup. It should not invent generic UI if a mockup is provided.
4. **Traceability**: Each ticket's `design/README.md` MUST include a direct link to its corresponding exported mockup in standard Markdown format.
5. **Structure**: Each ticket must follow the standard phase-based structure (Requirements -> Design -> Planning -> Implementation -> Testing).
6. **Sync**: Read `project-management/design/screen_list.md` and explicitly link the generated tickets to the specific screens by updating their `- **Ticket**: T-XXX` field.
7. **Gap Handling**: If the generated screens in UI tools reveal a missing user flow, or if there is a gap between the documented requirements and the available exported mockups, you MUST identify this gap. Provide instructions to the human to generate the necessary missing screens, and update both the `requirements/README.md` and `design/README.md` to ensure they are fully synced and mapped.
8. **Completeness**: Break down the entire Epic into manageable, sequential tickets.

**Workflow (Automated Scaffold Generation):**

To save massive computational tokens and prevent hallucination loops, you MUST use the autonomous Python scaffolder for ticket generation instead of creating the folders manually.

1. **Plan the Tickets**: Based on your required scoping, define the list of tickets needed (e.g., T-055, T-056).
2. **Execute the Script**: Run `python .agent/generate_tickets.py --epic "epic-XXX-name" --tickets "55:Login Screen" "56:Auth Endpoints"` in the root terminal.
   - The script will automatically clone the `epic_template` if the epic doesn't exist yet.
   - The script will instantly create all the nested ticket directories, `planning/README.md` files, and perfectly formatted `metadata.json` files for the entire Epic in <1 second.
3. **Notify User**: Let the human orchestrator know the Epic has been fully scoped and scaffolded.

---

## 🚨 Important: Scoping vs Execution Commands

**This workflow (`/scope-epic`) is for CREATING tickets only.** Do NOT use the execution engine during scoping.

- **Scoping Phase** (this workflow): Use `python .agent/generate_tickets.py` to create ticket structure
- **Execution Phase** (after scoping): Use `npm run start --prefix ./engine -- run T-XXX` to implement individual tickets

**When to use each command:**
- `/scope-epic` → Plan and scaffold new tickets in an epic
- `npm run start --prefix ./engine -- run T-XXX` → Execute existing tickets through SDLC phases

Never run the execution engine during the scoping phase. Scoping is planning; execution is implementation.
