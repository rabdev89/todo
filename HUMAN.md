# 🧑‍💻 Human Workflow Guide

# BOB - AI Software Development Workflow Framework: Human Operator Guide

This guide is for the human operator managing the BOB - AI Software Development Workflow Framework. Your role is to act as the **Orchestrator** and **Source of Truth** for the project.

## Overview

BOB is a structured AI-assisted development framework that operates through a rigorous **Three-Layer SDLC**:

- **Layer 1**: Developer Velocity (Ticket-level execution)
- **Layer 2**: Epic Hardening (Release readiness)
- **Layer 3**: Production Readiness (Enterprise-grade quality)

## Your Responsibilities

1. **Project Vision & Requirements**: Define the initial vision, PRD, FRD, and backlog.
2. **Workflow Oversight**: Ensure agents follow the documented workflow (see WORKFLOW_OVERVIEW.md).
3. **Quality Gates**: Approve designs, review implementations, and validate against requirements.
4. **Escalation**: Handle issues agents cannot resolve (e.g., requirement changes, complex decisions).
5. **Memory Management**: Update repository memory after major milestones.

## Workflow Reference

For detailed workflow steps, commands, and prompts, refer to:

- **WORKFLOW_OVERVIEW.md**: Complete end-to-end workflow with phases, commands, and prompts.
- **BOB_COMMANDS_MAPPING_TABLE.md**: Technical command mappings for /bob engine.
- **agents_commands_index.md** & **agents_prompts_index.md**: Command and prompt indices.
- **AGENTS.md** or **CLAUDE.md**: Agent rules and guidelines.

Do not duplicate workflow details here—maintain single source of truth by referencing these documents.

## Key Principles

- **Decision Gate**: Always select Track A (Lean) or B (Full) before starting tickets.
- **No Requirement Drift**: Agents must pause for human approval on scope changes.
- **Memory Updates**: Mandatory after tickets, epics, and PIs.
- **Circuit Breaker**: Escalate if blocked >10 minutes.

## Getting Started

1. Read WORKFLOW_OVERVIEW.md for the full workflow.
2. Initialize project with `npm run start -- project-init`.
3. Use /bob for autonomous execution once workflow is set up.

> **Guide for human project managers using the BOB - AI Software Development Workflow Framework.**

---

## 🔄 The Full Development Cycle

This framework follows a rigorous, document-driven lifecycle to ensure total alignment between your intent and the AI's execution.

### 1. Source of Truth (Foundation)

All strategic direction is housed in `project-management/project/`.

| File                   | Human's Job                                                                                                                  |
| :--------------------- | :--------------------------------------------------------------------------------------------------------------------------- |
| **`vision.md`**        | Keep the "North Star" clear. Define the values and ultimate success state.                                                   |
| **`PRD.md`**           | **PRD**: Product Requirements (Scope, Personas, and Roadmap). Define the boundaries of what is "In Scope" vs "Out of Scope". |
| **`FRD.md`**           | Define specific user interactions and persona-based capabilities.                                                            |
| **`epic_backlogs.md`** | Manage the breakdown of features. Ensure epics are logically structured.                                                     |
| **`backlog.md`**       | New unscoped ideas to refine into tickets.                                                                                   |

Choose if you are starting a new project or resuming work on an existing project.

## 🚀 Starting a New Project

To initialize a new project, upload the files from the Project Foundation Folder `project-management/project_template` use this prompt with an AI Architect e.g chatGPT, grok, Gemini or Claude:

```markdown
I am using the [AI-Assisted Development Framework](https://github.com/blueprinttradingfx-cpu/ai-assisted-development) to build a new project.

Act as a Senior Solution Architect. Your goal is to help me define the project foundation by filling out `vision.md`, `PRD.md`, `FRD.md`, and `epic_backlogs.md`.

Please interview me to gather all necessary details. Ask questions covering:

1. The core vision and "Why" behind the project.
2. Target audience and key problems being solved.
3. High-level feature roadmap (MVP and beyond).
4. Technical constraints or preferences.
```

Put this new files on `project-management/project/`.

### Tech Stack Initialization

Immediately open `ci/ci_config.sh` and update the deployment variables (`APP_DIR`, `LINT_CMD`, `TEST_CMD`, `BUILD_CMD`) to match your chosen tech stack (e.g., React, Flutter, Node.js). This ensures the local SDLC pipeline functions correctly for your specific app.

---

### 2. Design Phase (Planning & Prep)

Before coding, define the visual and behavioral foundation of your project. This includes creating the "Design Bible" and generating high-fidelity mockups.

See **[design.md](./project-management/design/design.md)** for detailed instructions, AI prompts, and the Stitch workflow.

---

### 3. Screen Alignment (The Living Screen List)

Before asking the AI to write any code or draft any tickets, you must align the generated designs with your Epics.

1. **The Screen List**: Open `project-management/design/screen_list.md`.
2. **Update Status**: For every screen you exported from Stitch, check the box `[x] Generated`.
3. **Map to Epics**: Ensure every generated screen is logically grouped under the correct Epic heading within `screen_list.md`. This is the critical handoff point between Design and Implementation.

---

### 4. Ticket Generation (Alignment)

After the strategic planning and high-fidelity design phases are complete, we move to **Epic Scoping**. Instead of generating 100+ tickets at once, we focus on scoping the technical roadmap for a specific **Epic** (as defined in `epic_backlogs.md`).

**The Goal**: Iterate through ALL epics in `epic_backlogs.md` and generate their corresponding tickets BEFORE starting any feature implementation.

1. **Inform the AI**: Use this comprehensive prompt to ensure total alignment for the chosen Epic. **Repeat this for EACH epic in your backlog until the entire project is mapped out.**

   > **Prompt**: "I have completed the strategic planning and exported the final designs into `project-management/design/`.
   >
   > Your task is to **scope and generate all implementation tickets** (T-XXX to T-XXX) required to build the specific Epic: **[EPIC NAME]**.
   >
   > **Requirements for Scoping:**
   >
   > 1. **Alignment**: Every ticket's requirements MUST be anchored to the **Project Foundation** (Vision, PRD, FRD, Epic Backlog).
   > 2. **Design Fidelity**: Every ticket's design MUST follow the **Design Bible** (Sitemap, Style Guide, Interaction Guide, etc.). Crucially, you MUST reference the specific exported mockups in the `## Reference Mockups` section with the path to the `.html` file.
   > 3. **Reference Mockups (CRITICAL RULES)**: When generating tickets, explicitly instruct the AI agent executing the ticket that if a `## Reference Mockups` section exists, it MUST read the specified `.html` mockup file and base its Flutter implementation EXACTLY on that mockup. It should not invent generic UI if a mockup is provided.
   > 4. **Traceability**: Each ticket's `design/README.md` MUST include a direct link to its corresponding exported mockup in standard Markdown format.
   > 5. **Structure**: Each ticket must follow the standard phase-based structure (Requirements -> Design -> Planning -> Implementation -> Testing).
   > 6. **Sync**: Read `project-management/design/screen_list.md` and explicitly link the generated tickets to the specific screens by updating their `- **Ticket**: T-XXX` field.
   > 7. **Gap Handling**: If the generated screens in Stitch reveal a missing user flow, or if there is a gap between the documented requirements and the available exported mockups, you MUST identify this gap. Provide instructions to the human to generate the necessary missing screens in Stitch, and update both the `requirements/README.md` and `design/README.md` to ensure they are fully synced and mapped.
   > 8. **Completeness**: Break down the entire Epic into manageable, sequential tickets.
   >
   > Do not start implementation yet. Focus exclusively on generating the full documentation for this Epic's tickets first."

2. **Scoping**: Review the AI's proposed ticket list. Ensure it covers the end-to-end user journey defined in the Sitemap.
3. **Validation & Iteration**: Check each ticket's `requirements/README.md` and `design/README.md`.
   - Ensure they reference the correct functional requirements from the FRD.
   - **CRITICAL**: Verify that each ticket contains a file path link to its relevant design mockup index.
   - **Ticket Sync Status**: Verify that the AI correctly updated the `- **Ticket**: T-XXX` field for the relevant screens in `screen_list.md`.
   - **Iterate**: Once the current epic is fully scoped and validated, move to the next epic in `epic_backlogs.md` until the entire project is mapped.

4. **Execution Workflow**: Once the full set of tickets for **ALL epics** is validated and in the backlog, development begins: **Work on tickets one-by-one sequentially.** (Use the AI SDLC Engine by running `npm run start --prefix ./engine -- run T-001` to enforce strict phase progression).

### 4. Execution (Implementation & Testing)

The coding phase where the application comes to life.

- **One-by-One**: Work on tickets sequentially. Use the AI SDLC Engine (`npm run start --prefix ./engine -- run T-XXX`) for autonomous execution.
- **Reference Mockup Implementation (CRITICAL)**: If a ticket's `design/README.md` contains a `## Reference Mockups` section with paths to `.html` mockups, the AI MUST read those specific HTML files and implement the UI to match them exactly. Do not allow the AI to invent boilerplate UI if a mockup exists.
- **Manual Verification**: You must verify every feature against the ticket's success criteria.

---

### 5. PI Pre-Hardening (Testing Baseline)

Before an Epic can officially enter the PI Hardening Phase, you must ensure the testing baseline is robust.

- **Command**: Tell the AI: **"Initialize Pre-Hardening Testing for PI-[X]"**
- **Expectation**:
  - **Backend**: The AI must write tests for _every single service_ (no skips) and run coverage explicitly on `app/services` targeting **80-100% true coverage**.
  - **Frontend**: The AI must write **Functional & Persona Tests** simulating real user journeys across the Epics (e.g., Onboarding, Decision Engine).
  - **Reporting**: The AI must output a test coverage report mapping the coverage **per Epic**.

---

### 6. Project Initiative (PI) Layer (Production Readiness)

The PI layer groups multiple Epics for a major production release. This is the final quality gate.

- **Initialization**: When you are ready to group epics for a release, tell the AI:
  > **Prompt**: "start PI-1 with epics 0-9"
- **Required Gate**: PI hardening is **mandatory** before any production deployment. It ensures no mock data, full test coverage, and security compliance.
- **Workflow**: It is not required to be done "asap" during development, but must be completed before the final release.

---

## 🔄 Adopting the Framework (Existing Projects)

If you have an existing project (possibly already deployed) and want to adopt this AI-Assisted Development Framework for future scaling and maintenance, follow these steps. You do **not** need to redo the discovery interviews, but you must "anchor" the AI to your current codebase first.

### 1. Retrofit the Foundation (Scenario 1: Existing Code)

If you have an existing project in `web-applications/`, you can still use the Epic/PI layers to manage its evolution:

- **Command**: Tell the AI: **"Retrofit existing project [Name]"**
- **What it does**: The AI will analyze your existing code, help you draft foundation docs, create legacy epics, and establish a **PI-0 Manifest** baseline.
- **Steps**:
  1.  **Define "Legacy" Epics**: Create `epic_backlogs.md` mapping features to Epics.
  2.  **Create Epic Containers**: folders in `web-applications/project-management/epics/`.
  3.  **Establish a Baseline**: Run the **Epic Hardening Protocol** on legacy epics.

### 2. Upgrading to Three-Layer SDLC (Scenario 2: Workflow Migration)

If you are migrating from an older version of the framework that only used tickets:

- **Command**: Tell the AI: **"Migrate project to Three-Layer SDLC"**
- **What it does**: The AI realigns your ticket folders into Epics, generates metadata, and performs a retroactive gap analysis.
- **Steps**:
  1.  **Structural Realignment**: Move ticket folders into `web-applications/project-management/epics/`.
  2.  **Generate Metadata**: Generate `epic_metadata.json` for realigned Epics.
  3.  **Retroactive Gap Analysis**: Run: "Audit Epic [X] against PRD".

See **[migration_guide.md](./migration_guide.md)** for detailed steps and commands for both scenarios.

### 3. Initialize the AI Workflow

Use this prompt with your AI Coding agent to align it with the codebase and start the structured implementation cycle:

```markdown
I am adopting the AI-Assisted Development Framework for this existing project in `web-applications/`.
1. **Analysis**: Read and analyze the current codebase and the foundation files in `project-management/project/` and `project-management/design/`.
2. **Gap Analysis**: Perform a comparison between the existing source code and the documented PRD/FRD.
3. **Workflow Shift**: Moving forward, we will use the **Epic Scoping** workflow for all new work.
4. **Backlog Refinement**: Propose the next logical features/tickets for the `backlog.md`.
5. **Alignment**: Ensure all new tickets are anchored to the existing codebase and the newly created PRD/FRD.
6. **Standards**: Interview me about the **Coding Standards** used in this project and help me generate specialized **Domain-Specific Rules** in `.agent/rules/`.

> # Human Operator's Manual

> **Guide for human project managers using the BOB - AI Software Development Workflow Framework.**

> You are the conductor. The AI is the orchestra.

---

## Your Role

As the human operator, you:
- **Define** the vision and goals (`vision.md`)
- **Approve** plans and designs at checkpoints
- **Verify** AI output against requirements
- **Decide** when to override the AI
- **Own** the final product quality

The AI accelerates execution. You ensure alignment.

---

## Quick Start (New Project)

| Step | Action | You Do | AI Does |
|------|--------|--------|---------|
| 1 | Initialize | `/init-project` | Creates structure |
| 2 | Vision | Fill `vision.md` | Understands goals |
| 3 | PRD/FRD | Draft requirements | Expands details |
| 4 | Design | Create mockups | Implements precisely |
| 5 | Scope | `/scope-epic name` | Generates tickets |
| 6 | Execute | `/execute-plan T-001` | Builds feature |
| 7 | Verify | Review output | Marks DONE |

---

## The Complete Workflow

### 1. Foundation Phase (Strategy & Requirements)

**Goal**: Define what you're building and why.

| Document | Your Input | AI Output |
|----------|-----------|-----------|
| `vision.md` | Core concept, target users | Refined vision |
| `PRD.md` | Product features | Detailed requirements |
| `FRD.md` | Functional needs | Technical specs |
| `epic_backlogs.md` | High-level epics | Scoped epics |
| `system_architecture.md` | Tech preferences | Architecture plan |

**See**: `project-management/project/` for templates

---

### 2. Design Phase (Visual Foundation)

**Goal**: Create the "Design Bible" before coding.

| Deliverable | Tool | Output |
|-------------|------|--------|
| Sitemap | AI + You | `sitemap.md` |
| Style Guide | Stitch/AI | `style_guide.md` |
| Interaction Guide | You + AI | `interaction_guide.md` |
| User Flow | You + AI | `user_flow.md` |
| Mockups | Stitch | `.html` files |

**Critical**: Every screen needs a mockup before ticket generation.

---

### 3. Screen Alignment (Living Screen List)

**Goal**: Ensure designs match epics before coding.

**Steps**:
1. Open `project-management/design/screen_list.md`
2. Check `[x] Generated` for every exported mockup
3. Map each screen to correct Epic heading
4. Verify ticket links in screen list

**This is the handoff point between Design → Implementation**

---

### 4. Ticket Generation (Epic Scoping)

**Goal**: Scope ALL epics before building ANY.

**Repeat for each epic**:

```
You: "Scope epic [EPIC NAME]"

AI:
├── Analyzes PRD/FRD requirements
├── Maps to design mockups
├── Generates 5-15 tickets
├── Creates metadata.json per ticket
└── Links to screen_list.md
```

**Checkpoints**:
- [ ] Tickets cover end-to-end user journey
- [ ] Each ticket references correct mockup
- [ ] No gaps between requirements and designs

**Then**: Work tickets one-by-one sequentially.

---

### 5. Execution (Build & Test)

**Goal**: Implement with quality gates.

| Mode | Command | When to Use |
|------|---------|-------------|
| **Manual** | `/execute-plan T-XXX` | Complex features, learning |
| **Autonomous** | `/autonomous epic-XXX` | Well-scoped, routine work |

**Implementation Rules**:
- AI reads mockup `.html` files exactly
- No boilerplate UI invented
- Every feature needs manual verification
- Use AI SDLC Engine: `npm run start --prefix ./engine -- run T-XXX`

---

### 6. Pre-Hardening (Testing Baseline)

**Goal**: Ensure robust test coverage before PI.

**Command**: *"Initialize Pre-Hardening Testing for PI-[X]"*

| Component | Target | Evidence |
|-----------|--------|----------|
| Backend | 80-100% coverage | `app/services` report |
| Frontend | Functional + Persona tests | User journey simulations |
| Reporting | Per-epic coverage map | Coverage report |

---

### 7. PI Layer (Production Release)

**Goal**: Final quality gate for production.

**Command**: *"start PI-1 with epics 0-9"*

**Mandatory Checks**:
- [ ] Zero mock data in FE/API
- [ ] 100% backend test coverage
- [ ] Security audit complete
- [ ] Cross-epic E2E tests pass

**Required before**: Production deployment

---

## Adopting Framework (Existing Projects)

### Scenario 1: Existing Code (Retrofit)

**Command**: *"Retrofit existing project [Name]"*

| Step | Action | Output |
|------|--------|--------|
| 1 | Analyze code | Gap analysis vs PRD |
| 2 | Define epics | `epic_backlogs.md` |
| 3 | Create containers | `web-applications/project-management/epics/` |
| 4 | Baseline | `PI-0 Manifest` |

### Scenario 2: Workflow Migration

**Command**: *"Migrate project to Three-Layer SDLC"*

| Step | Action | Output |
|------|--------|--------|
| 1 | Realign tickets | Move to `epics/` folders |
| 2 | Generate metadata | `epic_metadata.json` |
| 3 | Audit | Gap analysis per epic |

**See**: `migration_guide.md` for detailed steps

---

## Managing the Backlog

### Adding Ideas

**Don't**: "AI, add dark mode"

**Do**: Add to `backlog.md` under `## Raw Ideas`

> Example: "Add dark mode toggle to settings. Persist in localStorage."

### Discovery Phase

**Command**: *"Analyze backlog. Pick top priority and scope it."*

AI will:
- Review raw ideas
- Suggest priority
- Draft initial requirements

---

## Checkpoint Approval (Don't Skip)

### Plan Approval (`BLUEPRINT.md`)

**Look for**:
- Complexity estimates
- New dependencies
- "User Review Required" alerts

**Action**: Approve or provide feedback

### Design Approval

**Look for**:
- Architectural changes
- Monorepo impacts
- PRD alignment

**Action**: Verify against product goals

---

## Verification Checklist

When AI marks `DONE`:

- [ ] **Review**: Check `RECORD.md` and code
- [ ] **Manual Test**: Try the feature yourself
- [ ] **Compare**: Match against mockup
- [ ] **Complete**: Mark `Verified` in `backlog.md`

---

## Rules for Success

| Rule | Why It Matters |
|------|---------------|
| **Stay in `web-applications/`** | All code lives here |
| **Guard the Brain** | Reject changes conflicting with `vision.md` |
| **Be the Tie-Breaker** | Final authority on decisions |
| **Use Checkpoints** | Catch misalignment early |
| **Verify Everything** | AI accelerates, you validate |

---

## Domain-Specific Rules

After setup, tell AI:

> *"Create domain-level rules in `.agent/rules/` for [Tech Stack] with best practices. Mandate 80-100% test coverage for all tickets using domain-specific test workflows."*

This ensures:
- Industry standard patterns
- Consistent code quality
- Tech-appropriate testing

---

## When to Override the AI

**Override When**:
- Security concerns
- Business logic mismatch
- UX feels wrong
- Long-term consequences unclear

**Don't Override**:
- Code style (trust framework)
- File organization (trust File Guard)
- Test requirements (trust 70-point gate)
- Documentation (trust the process)

---

## Reference

| Document | Purpose |
|----------|---------|
| `AGENTS.md` | AI behavior rules |
| `ARCHITECTURE-DIAGRAM.md` | System overview |
| `COMMAND-REFERENCE.md` | All commands |
| `migration_guide.md` | Migration steps |
| `backlog.md` | Project backlog |

---

> **Framework Version**: 1.0  
> **Last Updated**: 2024-03-07  
> **Status**: Active
