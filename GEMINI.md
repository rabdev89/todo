# BOB - Workflow Framework (Gemini Model Profile)

This file is a thin wrapper for Gemini-based agents.

- For all workflow rules, SDLC details, and agent behavior:
  - Read [AGENTS.md](AGENTS.md)
  - Read [project-management/WORKFLOW_OVERVIEW.md](project-management/WORKFLOW_OVERVIEW.md)
- Treat those documents as the canonical source of truth for:
  - Three-Layer SDLC
  - Track A vs Track B workflow
  - Agent personas and phases
  - Commands and quality gates

Model-specific notes for Gemini:

- Even with strong tool support and retrieval:
  - Prefer the Agent Core Contract and /bob-provided context over loading every rule file.
  - Do not use HUMAN.md as a rule source unless explicitly asked to summarize it for a human.
- Follow the rule precedence and workflows defined in AGENTS.md and WORKFLOW_OVERVIEW.md.

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

## Repository Intelligence (Codebase Understanding)

Repository Intelligence provides AI-powered codebase understanding, enabling agents to intelligently query and understand the codebase instead of blind file reading.

### When to Use Repository Intelligence

- **Research Phase**: Before implementing any feature, query the codebase to find relevant code, patterns, and dependencies
- **Pattern Detection**: Automatically detect architectural patterns (Repository, Service Layer, DI, etc.)
- **Context Building**: Build optimal context packs for AI agents with relevant files only
- **Semantic Search**: Search by meaning, not just keywords

### Available Commands

```bash
# Index repository for intelligent search
npm run start --prefix ./engine -- index-repo -p ./web-applications

# Search with semantic understanding
npm run start --prefix ./engine -- search "authentication"

# Find symbols (functions, classes, methods)
npm run start --prefix ./engine -- symbols "UserService"

# Research a ticket with AI
npm run start --prefix ./engine -- repo-research T-001

# Get project overview with patterns
npm run start --prefix ./engine -- overview

# Generate embeddings (requires Ollama)
npm run start --prefix ./engine -- embed
```

### Integration with Agent Workflow

The Researcher Agent automatically uses Repository Intelligence when available:

1. **Query**: Researcher queries "Find authentication code"
2. **ContextPack**: System returns relevant files, patterns, and dependencies
3. **Output**: Researcher generates RESEARCH.md with detected patterns

### Pattern Detection

Repository Intelligence automatically detects 15+ architectural patterns:
- **Core**: Repository, Service Layer, Dependency Injection, FastAPI
- **Design**: Observer, Factory, Singleton, Command, Strategy
- **Infrastructure**: Middleware, Error Handling, Configuration, Logging, Caching, Validation

### Requirements

- **Qdrant**: Vector database for semantic search (Docker)
- **Ollama**: Optional, for embeddings (local LLM)
- **No API Keys**: 100% local, zero cost

For detailed setup and usage, see `engine/docs/REPOSITORY_INTELLIGENCE.md`.

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

## Documentation

- **The Retrofit Protocol (Living Artifacts)**: If implementation realities force a deviation from the initial `design/README.md` or `requirements/README.md`, you MUST autonomously update those documents to maintain a single source of truth.
- Update phase documentation when requirements or design changes
- Keep inline code comments focused and relevant
- Document architectural decisions and their rationale
- Use mermaid diagrams for any architectural or data-flow visuals (update existing diagrams if needed)
- Record test coverage results and outstanding gaps in `web-applications/project-management/epics/EPIC-NAME/tickets/T-XXX/testing/`

## Key Commands

**Standardized Slash Command Pathways**: Activating any of these commands locks you into a specific persona (e.g., executing `/writing-test` locks you strictly into QA mode). Do not perform unrelated architectural redesigns or UI tweaks while in a targeted command mode.

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

Specialized rules are available in `.agent/rules/`:

- `javascript.md`: JS/TS best practices.
- `tdd.md`: Strict test-driven development discipline (Iron Law: no code without failing test).
- `verification.md`: Evidence-based claims (no completion claims without verification evidence).
- `security.md`: JWT and timing-safe comparison guidance.
- `productmanager.md`: Product discovery and story mapping.
- `task-creator.md`: Systematic task planning and execution.
- `ui.md`: UI/UX and motion design principles.
- `user-testing.md`: Test generation from user journeys.
- `agent-orchestrator.md`: Coordination for complex tasks.
- `requirements.md`: Systematic requirements analysis.
- `parallelism.md`: Breath-based parallel ticket execution protocol. Read before starting any multi-ticket sprint.
- `circuit-breaker.md`: Loop detection and escalation protocol. Applies to all autonomous and semi-autonomous execution.
- `repository-intelligence.md`: Codebase understanding and intelligent context building. Read before researching or implementing features.
