# /bob ↔ Agent Collaboration Guide

Audience: **AI agents** running inside this repository.  
Humans should use HUMAN.md and BOB_README.md for their /bob guidance.

Purpose: define the communication contract between `/bob` (the orchestration engine) and AI agents working inside this repo.

---

## ⚠️ CRITICAL RULES (Non-Negotiable)

1. **👉 Agents CANNOT modify `framework_status.json`**
   - This file is exclusively for `/bob` to manage workflow state.
   - Any attempt to update it directly violates the framework contract and breaks orchestration.
   - If you need to persist data, use the **user-agent collaboration flow** (see Section 3).

2. **👉 Interactive handlers require USER approval, not AI auto-fill**
   - Handlers like `startProjectInit`,`generateVisionDocument`, `generateUserFlow`, `generateRequirements` are **user-facing**.
   - Agent must **interview the user**, not auto-generate answers.
   - Only after explicit user approval can data be stored.
   - This ensures the project direction is **user-driven**, not AI-assumed.

---

## 1. Roles

- `/bob` (Engine)
  - Owns SDLC state: phase, layer (ticket/epic/PI), and track (A/B).
  - Decides what the “next step” is.
  - Executes commands safely (via engine/commands.json, command_mapping.ts).
  - Builds context packs for agents.
- Agents (researcher, planner, executor, verifier, security-engineer, ui-designer, architecture-designer)
  - Own localized reasoning and implementation for a step.
  - Read the context `/bob` provides plus AGENTS.md core contract.
  - Do not change global SDLC state directly.

---

## 2. What /bob Guarantees to Agents

When `/bob` invokes or prepares work for an agent, it should guarantee:

- **State clarity**
  - Current layer: Ticket (Layer 1), Epic Hardening (Layer 2), or PI Hardening (Layer 3).
  - Current phase: requirements, design, planning, implementation, verification, or hardening step.
  - Current track (A/B) for ticket-level work, if applicable.
- **Scoped context**
  - Agent Core Contract (from AGENTS.md).
  - Phase-relevant excerpt from WORKFLOW_OVERVIEW.md.
  - Ticket/epic/PI docs as needed (PRD, FRD, ticket README, BLUEPRINT, RECORD, VERIFICATION, etc.).
  - Any persisted track decision (TRACK_DECISION.md or metadata).
- **Relevant skills and patterns**
  - Agent skills appropriate for persona and phase (e.g. planner-v1, executor-v1, verifier-v1, ui-designer-v1, security-engineer-v1).
  - Methodology skills when required (two-track-workflow-v1, breath-based-execution-v1, evidence-based-validation-v1).
  - Patterns based on stack and scope from skills-library/index.json (auth, database, error handling, logging, etc.).

Agents can assume:

- They are not starting from a blank slate; `/bob` has already selected the most important docs and skills for the current step.

---

## 3. What Agents Promise to /bob

When acting under this framework, agents should:

- **Respect state**
  - Treat `/bob` as the source of truth for current layer/phase.
  - Do not move from ticket → epic → PI on their own; wait for /bob to orchestrate.
  - Use Track A/B as decided by the gate; do not silently re-scope.
- **Operate within scope**
  - Work only on files and behaviors relevant to the current ticket/epic/PI as defined by context.
  - Avoid global refactors unless explicitly part of the step.
- **🚫 HARD RULE: Do NOT update framework_status.json**
  - `framework_status.json` is reserved for `/bob` engine orchestration only.
  - Agents MUST NOT modify this file directly, even to auto-populate fields.
  - Any data that needs to be persisted (vision details, user flow details, requirements, etc.) must be:
    - **Collected via user interview** (agent asks, user answers).
    - **Presented to user for approval** before being stored.
    - **Only persisted when user explicitly approves** (not auto-filled).
  - Violations of this rule break the `/bob` state machine and cause framework deadlocks.
- **Interactive handlers (generateVisionDocument, generateUserFlow, generateRequirements)**
  - These handlers are designed for **user-agent collaboration**, NOT auto-population.
  - Flow:
    1. Agent executes handler (e.g., `generateVisionDocument`).
    2. Handler detects missing data and returns `requires_ai_input: true` with interview prompt.
    3. Agent interviews **the user** (not auto-filling based on assumptions).
    4. User provides answers or approves AI suggestions.
    5. Only after user approval, agent updates framework_status.json fields (vision_details, user_flow_details, etc.).
    6. Agent calls `/bob` again.
    7. Handler re-runs, detects data, and generates the markdown file.
  - This ensures the project vision, user flows, and requirements are **user-driven, not AI-generated**.
- **Keep artifacts in sync**
  - Update ticket/epic docs (requirements/design/planning/testing) to match actual implementation.
  - Produce or append to RESEARCH.md, BLUEPRINT.md, RECORD.md, VERIFICATION.md, SECURITY_AUDIT.md, UI_SPEC.md as appropriate for persona.
- **Report outcomes**
  - Surface success/failure, blockers, and open questions in the appropriate output docs.
  - Avoid claiming completion unless tests and checks for that step have passed.

---

## 4. Entry Points and Main Flows

### Human → /bob → Agents

Typical flows:

- **Initialize or continue workflow**
  - Human runs `/bob` (mapped to `cd engine && npm run start -- bob`).
  - On a fresh clone where dependencies are not installed yet, agents should treat a failure like:
    - `'tsx' is not recognized as an internal or external command`
    - or equivalent “command not found” for `tsx`
    as a signal that the engine is not bootstrapped, not as a workflow failure.
  - In that case, agents should:
    - Use the Makefile bundle installer by default:
      - `cd engine && make bundle-install`  (installs and builds engine + packages/memory)
    - If `make` is not installed, install it and then run the bundle installer:
      - Windows:
        - `winget install GnuWin32.Make`  (or) `choco install make` (if Chocolatey is available)
      - macOS:
        - `brew install make`
      - Linux:
        - Debian/Ubuntu: `sudo apt-get update && sudo apt-get install -y make`
        - Fedora: `sudo dnf install -y make`
        - Arch: `sudo pacman -S --noconfirm make`
      - After installing `make`:
        - If `make` still isn’t recognized, add it to PATH for this session and retry:
          - Windows PowerShell:
            - `$env:Path += ';C:\Program Files (x86)\GnuWin32\bin'`
            - or `$env:Path += ';C:\Program Files\GnuWin32\bin'`
            - Then: `cd engine && make bundle-install`
          - Or call the full path: `"C:\Program Files (x86)\GnuWin32\bin\make.exe" bundle-install`
    - Only if `make` cannot be installed, run the manual steps:
      - `cd engine && npm install && npm run build`
      - `cd ../packages/memory && npm install && npm run build`
    - Then re-run `/bob` (i.e., `cd engine && npm run start -- bob`) and continue with normal orchestration.
  - Once the engine is bootstrapped, `/bob`:
### Orchestrator Command Reference (for Agents)

Use these commands to interact with `/bob` from the repository root (prepend `cd engine &&` if needed):

```bash

# Execute single step
npm run start -- bob

# Execute single step in orchestrate mode
npm run start -- orchestrate --single

# Run continuously until blocked
npm run start -- orchestrate --auto

# Run with limited steps
npm run start -- orchestrate --max-steps 3

# Run without user prompts
npm run start -- orchestrate --auto --no-prompt

# Check framework status
npm run start -- bob-status

# Reset framework state
npm run start -- bob --reset
```

Agent mapping for user prompts:
- When the user types `/bob`, run: `cd engine && npm run start -- bob`
  - Once the engine is bootstrapped, `/bob`:
    - Reads framework_status.json.
    - Determines current phase/step.
    - Chooses commands and, when needed, agent personas to run.
- **Ticket-level execution**
  - `/bob` advances ticket T-XXX through:
    - Research → Plan → Execute → Verify.
  - For each stage, `/bob`:
    - Selects persona (researcher, planner, executor, verifier).
    - Builds context pack.
    - Hands control to the agent for that step.
- **Epic / PI hardening**
  - `/bob` orchestrates hardening sequences using the engine and, where appropriate, the security-engineer and verifier personas.

### Agent → /bob

Agents interact with `/bob` by:

- Following the current layer/phase and tickets indicated via:
  - framework/framework_status.json.
  - Generated dashboards (framework/dashboard.md or project-management/dashboard.md).
- Using slash commands and engine commands that `/bob` recommends (Phase → Commands mapping).
- Avoiding manual progression between phases/layers unless `/bob` is unavailable and human explicitly instructs them to proceed.

---

## 5. Error Handling and Escalation

- If an agent encounters:
  - Missing or inconsistent state (e.g. framework_status.json unclear).
  - Commands that fail repeatedly.
  - Requirements/design/docs that conflict with reality.
  - **Poor search results or missing context**:
    - **First**: Try reindexing the repository: `cd engine && npm run start -- bob --reindex`
    - **If still struggling**: Clear cache and rebuild: `cd engine && npm run start -- bob --reset-index`
    - **Why**: Indexing may be stale after code changes, or cache corruption may exist
    - **Benefit**: Fresh index ensures latest codebase context and accurate search results
  - It should:
    - Stop escalation loops and:
    - Use `/debug`, `/handoff`, or `/reflect` as appropriate.
    - Log issue in ACTIVE_SESSION.md or relevant ticket docs.
    - Defer progression to `/bob` and/or human until inconsistency is resolved.

---

## 6. Implementation Notes (for Engine Work)

This file describes the behavioral contract. The underlying implementation work is captured in:

- `bob_imrpovements.md` – details the desired state machine, framework_status.json fields, command mapping, and context builder hooks.
- `BOB_README.md` – explains the engine architecture, orchestration loop, and state files.

When evolving `/bob`, ensure changes keep this collaboration contract intact: `/bob` owns state and context; agents own localized reasoning and outputs within that context.

