# BOB — Agentic SDLC Orchestrator

> **Rules and guidelines for AI agents working within the framework.**  
> BOB is an Agentic SDLC Orchestrator: it coordinates specialized agents across the full software development lifecycle.
>
> Project-agnostic | Tech-agnostic | Starter framework for enterprise-grade development

---

## ⚡ Agent Core Contract & Rule Precedence

> **New agents**: Load this section and the current ticket/epic context before doing any work.

### Agent Core Contract (Non-Negotiable)

- **High-Speed Context Cache (CLAUDE.md)**: Before starting any task, agents MUST read the local [CLAUDE.md](CLAUDE.md) file. This document serves as a "high-speed index" or "session cache" that maps the long-form rules in this file to the current session's specific needs (active ticket, schema, and hot paths).
- Safety
  - Do not exfiltrate secrets or credentials.
  - Stay within the repository and ticket scope defined by the user and /bob.
  - Prefer least-privilege changes; avoid broad refactors unless requested.
- Honesty
  - Admit when information is missing or uncertain.
  - Flag assumptions explicitly.
  - Base claims on code, tests, or docs in this repo.
- Quality
  - Prefer correctness and clarity over brevity.
  - Ensure code is linted and tested before claiming “done”.
  - Align with the project’s testing and CI commands when provided.
- Workflow
  - Respect the current SDLC layer and phase; do not move layers on your own.
  - Treat `/bob` as the orchestrator for phase and layer transitions.
  - Use the Phase → Commands map and /bob’s instructions instead of inventing new flows.
- Collaboration
  - Keep ticket docs, design docs, and logs up to date with reality.
  - Leave enough context for the next agent or human to continue smoothly.

### Rule Precedence

When rules conflict, apply them in this order:

1. Current repo/system prompt for this agent session
2. This file (AGENTS.md) and `project-management/WORKFLOW_OVERVIEW.md`
3. `.agent/rules/*` (CORE_PRINCIPLES, CODE_QUALITY, WORKFLOW, EMERGENCIES, etc.)
4. `skills-library/` (skills and patterns)
5. All other documentation in the repo

- `.agent/agents/registry.json` and `.agent/agents/*/system-prompt.md` are the **source of truth** for agent personas.
- `HUMAN.md` is human-only guidance; agents should not treat it as a rule source unless explicitly asked to summarize it for a human.

### On-Demand Rule Docs

Large rule files are **on-demand references**, not required reading before every ticket:

- `project-management/WORKFLOW_DECISION_GATE.md`
- `.agent/rules/CORE_PRINCIPLES.md`
- `.agent/rules/CODE_QUALITY.md`
- `.agent/rules/WORKFLOW.md`
- `.agent/rules/EMERGENCIES.md`
- `.agent/rules/tdd.md` (Strict TDD enforcement)
- `.agent/rules/verification.md` (Evidence-based claims)

Read these when:

- You are scoping a new ticket/epic or re-evaluating Track A vs Track B.
- Your current task clearly touches their domain (quality, workflow, debugging, testing, or emergencies).
- You are about to make a claim that work is complete (requires `verification.md`).
- `/bob` or a workflow command explicitly instructs you to consult them.

### Skills, Patterns, and Rules (Operational Use)

When applying the skills-library:

- Use **rules** (`.agent/rules/*`) as the backbone for safety, quality, and workflow.
- Use **skills** (`skills-library/agents`, `skills-library/methodology`) to decide *how* to work at each phase:
  - Requirements/Design: planner-v1, architecture-designer-v1, ui-designer-v1, two-track-workflow-v1, breath-based-execution-v1, evidence-based-validation-v1.
  - Implementation: executor-v1 for behavior.
  - Verification: verifier-v1, testing-patterns-v1.
- Use **patterns** (`skills-library/patterns/*`) for concrete implementation details:
  - auth, database, forms, error handling, logging, background jobs, etc.

`/bob` is responsible for selecting and injecting the most relevant skills and patterns into your context based on phase, layer, and stack.

---

## 🎯 Project Context

This framework provides structured AI-assisted development through a **Three-Layer SDLC**:

| Layer | Focus | Threshold | Location |
|-------|-------|-----------|----------|
| **1** | Developer Velocity | 56/70 (80%) | `web-applications/project-management/epics/EPIC-XXX/tickets/T-XXX/` |
| **2** | Epic Hardening | 63/70 (90%) | `web-applications/project-management/epics/EPIC-XXX/` |
| **3** | Production Readiness | 70/70 (100%) | `web-applications/project-management/epics/PI-XXX_Manifest.md` |

**Core Codebase**: `web-applications/`  
**Shared Assets**: `packages/`  
**AI Instructions**: `skills/` | `skills-library/`  
**Agent Rules**: `.agent/rules/`  

### Source of Truth

1. **Project Foundation**: `vision.md`, `PRD.md`, `FRD.md`, `epic_backlogs.md`, `system_architecture.md`
2. **Design Bible**: `sitemap.md`, `style_guide.md`, `interaction_guide.md`, `user_flow.md`
3. **Implementation**: Mockups, schema exports, live code

## Framework Optimization Guidelines

> **BOB - AI Software Development Workflow Framework is a starter framework** — designed to bootstrap projects quickly while maintaining enterprise-grade quality.

When optimizing or extending the framework:

### Project-Agnostic Improvements
- All framework enhancements must work across **any project type** (web apps, mobile apps, APIs, etc.)
- Avoid project-specific logic in core framework files
- Use configurable templates instead of hardcoded values
- Design for reusability across different domains and industries

### Tech-Agnostic Improvements  
- Framework patterns must apply to **any technology stack**
- Skills library covers: Flutter, FastAPI, Express, React, and more
- CI/CD scripts auto-detect tech stack via `ci/ci_config.sh`
- Testing strategies work with: `flutter_test`, `jest`, `pytest`, `cargo test`, etc.
- Never assume a specific framework; make patterns adaptable

### What This Means
✅ **Good**: "Add a skill for form validation that works in Flutter, React, and Vue"
❌ **Bad**: "Add Flutter-specific form validation for this banking app"

✅ **Good**: "Improve the epic scoping workflow for any SDLC"
❌ **Bad**: "Customize epic scoping just for e-commerce projects"

The framework should remain **portable, adaptable, and stack-agnostic** while providing concrete, copy-pasteable patterns.

---

## Documentation Structure

- `web-applications/project-management/tickets/T-XXX/requirements/README.md` - Problem understanding and requirements
- `web-applications/project-management/tickets/T-XXX/design/README.md` - System architecture and design decisions
- `web-applications/project-management/tickets/T-XXX/planning/README.md` - Task breakdown and project planning
- `web-applications/project-management/tickets/T-XXX/implementation/README.md` - Implementation guides and notes
- `web-applications/project-management/tickets/T-XXX/testing/README.md` - Testing strategy and test cases
- `web-applications/project-management/tickets/T-XXX/deployment/` - Deployment and infrastructure docs
- `web-applications/project-management/tickets/T-XXX/monitoring/` - Monitoring and observability setup

## Code Style & Standards

- Follow the project's established code style and conventions.
- Write clear, self-documenting code with meaningful variable names.
- **Faithful Translation**: Do not use "default" component styles if the high-fidelity mockups in `project-management/design/` specify custom tokens. Extract exact values for padding, margins, colors, and effects.
- Add comments for complex logic or non-obvious decisions.
- **Database Schema Sync (CRITICAL)**: Before writing any code that interacts with database tables (API endpoints, services, seeding scripts, migrations), ALWAYS cross-reference the live schema export at `web-applications/<backend>/database/schema/supabase-export.md`. Never assume column names from PRD, FRD, or old documentation — they drift. Use the exact column and table names from the export. If the export file is outdated or missing, ask the human to re-export it from the Supabase Dashboard first.

## Development Workflow

This project operates on a rigorous **Three-Layer Workflow** separating developer velocity, feature hardening, and production readiness.

### 🚀 Layer 1: Ticket-Level Flow (Developer Velocity)

This track is localized to `feature/*` branches and focuses purely on fast execution. No deployment or security theater.

**Workflow:** `Ideation → Ticket → Requirements → Design → Implementation (Breaths) → Autonomous Verification → Merge (to Epic branch)`

1. **Initialize**: Create ticket folders inside isolated Epic folders (e.g., `/web-applications/project-management/epics/epic-001/tickets/T-XXX/`).
2. **Execute (Breath-Based Implementation)**: Implement the feature in strict, classify all tickets per `.agent/rules/parallelism.md`and `circuit-breaker.md` and verified chunks (Breaths). Example: Breath 1 (Database/Models) must be fully complete and verified before Breath 2 (Services/API) begins. Tests here mean Component Unit Tests, linting, and manual local validation. INDEPENDENT tickets execute in parallel; DEPENDENT tickets wait for their breath. Implement each feature within its breath.
3. **Autonomous Bug Fixing**: If executing a bug fix, skip the heavy Requirements/Design phases. Proceed straight to identifying the failing log, fixing the code, writing the test, and merging.
4. **Finalize**: Run `bash ci/verify.sh` and confirm the score meets the Layer 1 threshold (≥ 56 / 70). Paste the passing CLI output before marking `[DONE]`. Score the `project-management/verification-gate.md` checklist and attach the result to the ticket's `testing/README.md`. Update the local ticket `metadata.json`. If the gate is failed twice consecutively on the same ticket, activate the **Circuit Breaker Protocol** (`.agent/rules/circuit-breaker.md`).

### 🛡️ Layer 2: Epic-Level Flow (Release Hardening)

Triggered when an epic is ready to ship, consolidating all its tickets.

**Workflow:** `Harden → Verify → Deploy → Observe → Document`

1. **Gating**: Epic completes when all local ticket `metadata.json` files read fully approved.
2. **Validate**: Run `ci/pipeline.sh` (Static analysis, unit tests, dependency scans, env validation).
3. **Harden**: Fill out `threat_model.md` and `api_contract.md` templates in the Epic folder. Perform E2E regression testing.
4. **Review/Release**: Verify against the Design Bible/Requirements. Check the "Epic Mastery/Gap Analysis". No epic can close if there are unaccounted gaps.
5. **Versioning**: Once verified, tag the release version logically using Semantic Versioning (e.g., `git tag v1.X.X`).

> [!TIP]
> **Command**: To trigger this phase, say **"Start the Epic Hardening protocol for Epic [X]"**. The agent will automatically transition from developer velocity to release hardening.

### 🏛️ Layer 3: PI-Level Flow (Production Readiness)

Triggered when all Epics for a version release are Hardened. This layer ensures cross-epic synergy and enterprise-grade quality.

**Workflow:** `Holistic Audit → PI Manifest → Security Blitz → Release Notes → Production Deployment`

1. **Manifest**: Maintain `web-applications/project-management/epics/PI-XXX_Manifest.md` mapping Epics to the release.
2. **DOD Enforcement**:
   - **Zero Mock Policy**: ABSOLUTELY NO mock data in the FE or API.
   - **100% Coverage**: All BE code MUST have full unit test coverage.
   - **FE Gating**: Flutter tests initialized and targeting full screen coverage.
   - **Security Audit**: Penetration checks, dependency scans, and risk assessment are mandatory.
3. **Release**: Generate `PRODUCTION_RELEASE_NOTES.md`.
4. **Final Gate**: No PI can ship if any DOD item is pending in the Manifest.

> [!IMPORTANT]
> **Command**: To trigger this phase, say **"Hardening Protocol for Project Initiative [X]"**.
> **Initialization**: To start a new PI release cycle, say **"start PI-[X] with epics [X-Y]"**. This is a **mandatory** gate before production deployment.

### 📝 Core Workflow Rules (Applies to All)

- **Read the Backlog**: Check `project-management/backlog.md` to understand current priorities.
- **Backlog Update**: Move/Link the item in `backlog.md` under **🔍 Ready for Review** when starting.
- **Approval**: **Wait for explicit approval** on plans/designs before code execution.
- **Epic Mastery**: At the end of every finished epic, perform a gap analysis.
- **No-Gap Policy**: Never start a new epic if there are unresolved gaps between requirements, designs, database, or current implementation in the previous epic.
- **Completion**: Update `backlog.md` to **✅ Verified** when confirmed.

## AI Interaction Guidelines

**CRITICAL**: Before starting any ticket work, you MUST follow this sequence:

1. **Read WORKFLOW_DECISION_GATE** (`project-management/WORKFLOW_DECISION_GATE.md`)
   - Answer the three decision questions
   - Record your track choice (A or B)
   - Proceed with the appropriate workflow

2. **Read relevant rules** based on your track:
   - All tracks: `.agent/rules/CORE_PRINCIPLES.md`
   - All code: `.agent/rules/CODE_QUALITY.md`
   - Execution: `.agent/rules/WORKFLOW.md`
   - Problems: `.agent/rules/EMERGENCIES.md`

3. **Then proceed** with the specific track (Lean or Full)

### Additional Interaction Guidelines

- **Project Initialization (Tech Stack Sync)**: When initializing a new project or writing the first lines of code, you MUST verify that `ci/ci_config.sh` has been configured for the correct tech stack (e.g., flutter, npm, cargo). If it is still using placeholder values, stop and ask the human to configure it.
- **Testing Constraints (Tech Stack Sync)**: When initializing a new project, verify that the project has a Component Testing library configured natively (e.g., `flutter_test`, `jest`, `react-testing-library`). If a primary testing framework is missing, you must install and configure it before writing any feature code.
- **The Self-Improvement Loop (`ai_lessons.md`)**: BEFORE starting any task or writing code, read `project-management/ai_lessons.md`. This is your perpetual memory. If you are corrected by the user during your session, you must add the correction to this file so future agents do not repeat the mistake.
- **Context First**: Before creating a implementation plan, ensure the feature has a documented **User Flow**. If missing, ask the human to brainstorm the story (from loading screen to journey end). Once created, sync requirements and database schema to the user flow. Use `project-management/design_template/user_flow.md` as a base.
- **Reference Mockup Implementation (CRITICAL)**: If a ticket's `design/README.md` contains a `## Reference Mockups` section with paths to `.html` mockups, you MUST read those specific HTML files and implement the UI to match them. Note that the designs are for inspiration only and not to be followed exactly; you may need to add additional fields, buttons, or data based on the database schema and requirements. Do not invent boilerplate UI if a mockup exists, but ensure it meets all functional needs.
- **Stitch Interaction Guidelines**: When generating screen designs from Stitch:
  1. Use the **Ideate Mode**.
  2. Instruct Stitch to wait: "I will provide the `vision` and `style_guide` which defines the ambiance and visual tokens for my project. Use this for all UI elements. I want to generate screens **one-by-one**. Please wait for my specific screen request from the `user_flow`."
  3. Sequence: Paste `vision.md` → `style_guide.md` → `user_flow.md`.
  4. Generate screens one-by-one as requested.
- **Epic Scoping**: If tasked with a new Epic, follow the iterative scoping workflow: generate documentation (Requirements -> Design -> Planning) for the entire Epic's tickets BEFORE starting any implementation.
- **Human Collaboration**: Respect the human operator's role as project manager. Always wait for explicit approval on the `implementation_plan.md` before writing production code.
- **Design Alignment**: Every ticket MUST be anchored to the Design Bible. Ensure implementation matches the behavior and visuals defined in the interaction guide and style guide.
- **Backlog Duty**: Proactively suggest tasks from the `backlog.md` if the current objective is met.
- Update phase docs when significant changes or decisions are made.

## Skills (Extend Your Capabilities)

Skills are packaged capabilities that teach you new competencies, patterns, and best practices. Check for installed skills in the project's skill directory and use them to enhance your work.

### Using Installed Skills

1. **Check for skills**: Look for `SKILL.md` files in the project's skill directory
2. **Read skill instructions**: Each skill contains detailed guidance on when and how to use it
3. **Apply skill knowledge**: Follow the patterns, commands, and best practices defined in the skill

### Key Installed Skills

- **memory**: Use AI DevKit's memory service via CLI commands when MCP is unavailable. Read the skill for detailed `memory store` and `memory search` command usage.

### When to Reference Skills

- Before implementing features that match a skill's domain
- When MCP tools are unavailable but skill provides CLI alternatives
- To follow established patterns and conventions defined in skills

## Knowledge Memory (Always Use When Helpful)

The AI assistant should proactively use knowledge memory throughout all interactions.

> **Tip**: If MCP is unavailable, use the **memory skill** for detailed CLI command reference.

### When to Search Memory

- Before starting any task, search for relevant project conventions, patterns, or decisions
- When you need clarification on how something was done before
- To check for existing solutions to similar problems
- To understand project-specific terminology or standards

**How to search**:

- Use `memory.searchKnowledge` MCP tool with relevant keywords, tags, and scope
- If MCP tools are unavailable, use `npx ai-devkit memory search` CLI command (see memory skill for details)
- Example: Search for "authentication patterns" when implementing auth features

### When to Store Memory

- After making important architectural or design decisions
- When discovering useful patterns or solutions worth reusing
- If the user explicitly asks to "remember this" or save guidance
- When you establish new conventions or standards for the project

**How to store**:

- Use `memory.storeKnowledge` MCP tool
- If MCP tools are unavailable, use `npx ai-devkit memory store` CLI command (see memory skill for details)
- Include clear title, detailed content, relevant tags, and appropriate scope
- Make knowledge specific and actionable, not generic advice

### Memory Best Practices

- **Be Proactive**: Search memory before asking the user repetitive questions
- **Be Specific**: Store knowledge that's actionable and reusable
- **Use Tags**: Tag knowledge appropriately for easy discovery (e.g., "api", "testing", "architecture")
- **Scope Appropriately**: Use `global` for general patterns, `project:<name>` for project-specific knowledge

## Testing & Quality

- Write tests alongside implementation
- Follow the testing strategy defined in `web-applications/project-management/epics/EPIC-NAME/tickets/T-XXX/testing/`
- Use `/writing-test` to generate unit and integration tests targeting 100% coverage
- Ensure code passes all tests before considering it complete

### Agent Prompt Validation

- Agent definitions and prompts live in `.agent/agents/` (see `.agent/agents/README.md` for architecture and file structure).
- To validate agent system prompts locally, run:

  ```bash
  node .agent/tests/validate_prompts.js
  ```

## Documentation

- **The Retrofit Protocol (Living Artifacts)**: If implementation realities force a deviation from the initial `design/README.md` or `requirements/README.md`, you MUST autonomously update those documents to maintain a single source of truth.
- Update phase documentation when requirements or design changes
- Keep inline code comments focused and relevant
- Document architectural decisions and their rationale
- Use mermaid diagrams for any architectural or data-flow visuals (update existing diagrams if needed)
- Record test coverage results and outstanding gaps in `web-applications/project-management/epics/EPIC-NAME/tickets/T-XXX/testing/`

## Key Commands

**Standardized Slash Command Pathways**: Activating any of these commands locks you into a specific persona (e.g., executing `/writing-test` locks you strictly into QA mode). Do not perform unrelated architectural redesigns or UI tweaks while in a targeted command mode.

**BOB Orchestration System**:
The `/bob` command is the central orchestrator for this project framework. It reads the project status and guides you through the SDLC phases.

- **What it does**: Reads `framework/framework_status.json`, determines the current phase and step, and either advances automatically or waits for user input
- **How to invoke**: When user says `/bob`, run `cd engine; npm run start -- bob`
- **Phase Structure**: Product Definition → Epic Planning → Ticket Execution → Verification → Release
- **When to use**: Start here if you're unsure what to do next; BOB will show you the current phase and required next action
- **Dashboard Generation**: If user input is required, BOB creates `project-management/dashboard.md` with clear guidance and recommended commands
- **Integration**: BOB commands other specialized agents (`/execute-plan`, `/writing-test`, `/handoff`, etc.) as needed

**GStack Specialist Gates (Rigor Enforcement)**:
The GStack toolset is integrated as mandatory "Specialist Gates" at critical SDLC junctions.

- **Founder Mode (`/plan-ceo-review`)**: Triggered after Phase 4 (Product Definition) requirements are finalized. Ensures high product ambition and alignment before architecture begins.
- **Tech Lead Mode (`/plan-eng-review`)**: Triggered as a Triple-Gate:
  1. **Phase 5 (Architecture)**: Post API/DB design.
  2. **Phase 8 (Epic Hardening)**: Post implementation validation.
  3. **Phase 9 (PI Hardening)**: Post release candidate build.
- **Release Mode (`/ship`)**: Triggered in Phase 8 (Epic Hardening) to finalize PRs and branch syncing.
- **QA Mode (`/qa`)**: Use during Phase 7 (Development) for automated, diff-aware verifying of code changes.
- **Browsing (`/browse`)**: Primary tool for all visual and interactive verification needs. Use for stateful, persistent browser sessions.

**AI SDLC Engine**:
To autonomously execute a ticket through its strict phases with Circuit Breaker protections:

- Run `npm run start --prefix ./engine -- run T-XXX` to progress the ticket state.

When working on this project, you can run commands to:

- **Session Continuity (The Handoff Protocol)**:
  - `/handoff`: Stop work, summarize current state, blockers, and exact next steps into `project-management/ACTIVE_SESSION.md`.
  - `/resume`: Read `project-management/ACTIVE_SESSION.md` immediately upon starting a new session to regain context.
- Understand project requirements and goals (`review-requirements`)
- Review architectural decisions (`review-design`)
- Plan and execute tasks (`execute-plan`)
- Verify implementation against design (`check-implementation`)
- Writing tests (`writing-test`)
- Perform structured code reviews (`code-review`)
- Log salient changes (`/log`)
- Product discovery (`/discover`)
- Gap Analysis (`/check-implementation` or "Audit Epic X against PRD")
- Epic Hardening ("Start the Epic Hardening protocol for Epic X")
- PI Hardening ("Hardening Protocol for Project Initiative [X]")
- Task epic planning (`/task`)
- UAT Phase Analysis (`/uat-phase`)

## Activity Log Requirement

**Agents should maintain a high-level history of major changes in `activity-log.md`.**

- Use the `/log` command after completing significantly complex work or making architectural decisions.
- Keep entries concise and focused on "what" and "why".

## Progressive Discovery

**Agents should minimize context consumption by only reading relevant documentation.**

- Start with root `index.md` or `README.md`.
- Only drill into specialized subfolders (e.g., specific ticket folders or specialized rules) when the task requires it.

## 🔄 Legacy Retrofitting & Migration Commands

When the user gives a migration command, follow these technical protocols:

### "Retrofit existing project [Name]"

1.  **Audit First**: Do not skip to implementation. Perform a "Gap Analysis" on legacy code against a newly drafted `PRD.md`.
2.  **Epic Grouping**: Assist the user in mapping existing files to the new Epic structure in `web-applications/project-management/epics/`.
3.  **Harden Baseline**: Guide the user through creating Threat Models and API Contracts for legacy features.
4.  **PI Baseline**: Initialize `PI-0` to establish the production baseline.

### "Migrate project to Three-Layer SDLC"

1.  **Structural Move**: Realign ticket folders into Epic-themed containers.
2.  **Metadata Generation**: Generate `epic_metadata.json` for all realigned Epics.
3.  **Retroactive Audit**: Run "Audit Epic [X] against PRD" for all realigned features.

## Specialized Rules

Rules have been consolidated for clarity. See `.agent/rules/CONSOLIDATION_GUIDE.md` for full details.

### Core Rules (Read All of These)

- `CORE_PRINCIPLES.md`: Universal development principles for all code
- `CODE_QUALITY.md`: Testing, code style, and review standards
- `WORKFLOW.md`: Task parallelization, error recovery, execution approach
- `EMERGENCIES.md`: Escalation procedures and crisis management

### Language & Stack-Specific Rules

Available in `.agent/rules/` for reference:

- `javascript.md`: JS/TS best practices and conventions
- `python.md`: Python code style and patterns
- `flutter.md`: Flutter/Dart development rules
- `react.md`: React-specific patterns and practices
- `fastapi.md`: FastAPI backend conventions
- `security.md`: Security rules (project-specific)

### Deprecated Rules (See Consolidation Guide)

These have been consolidated into core rules above. Do not reference directly:

- ~~`tdd.md`~~ → Use CODE_QUALITY.md
- ~~`parallelism.md`~~ → Use WORKFLOW.md
- ~~`circuit-breaker.md`~~ → Use WORKFLOW.md and EMERGENCIES.md
- ~~`requirements.md`~~ → Use WORKFLOW_DECISION_GATE.md
- ~~`task-creator.md`~~ → Use WORKFLOW.md
- ~~`review.md`~~ → Use CODE_QUALITY.md
- ~~`productmanager.md`~~ → See design templates instead
- ~~`user-testing.md`~~ → See design templates instead
- ~~`agent-orchestrator.md`~~ → Operational detail, not a rule
