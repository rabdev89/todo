# BOB - AI Software Development Workflow Framework - Prompts Index

> **Complete index of all prompt templates and their corresponding command sequences**
>
> This document serves as the single source of truth for mapping natural language prompts to actionable commands.

---

## 🎯 1. Simple Prompts (1:1 Prompt → Command)

These prompts have a direct, one-to-one mapping to a single command or action.

### Framework Lifecycle

| Prompt                      | Command        | When to Use          |
| --------------------------- | -------------- | -------------------- |
| **"Install the framework"** | `make install` | Initial setup        |
| **"Set up the framework"**  | `make install` | Alternative phrasing |
| **"Get started"**           | `make install` | Getting started      |
| **"Start working"**         | `make start`   | Begin development    |
| **"Check services"**        | `make status`  | Verify health        |
| **"Test the framework"**    | `make test`    | Run health checks    |
| **"Stop services"**         | `make stop`    | End session          |
| **"Clean framework"**       | `make clean`   | Reset environment    |
| **"Show help"**             | `make help`    | Command reference    |

### Repository Intelligence

| Prompt                      | Command                           | When to Use                |
| --------------------------- | --------------------------------- | -------------------------- |
| **"Index the repo"**        | `ai-engine index-repo --parallel` | Initial indexing           |
| **"Scan the code"**         | `ai-engine index-repo --parallel` | Alternative phrasing       |
| **"Parse the repo"**        | `ai-engine index-repo --parallel` | Another alternative        |
| **"Build the index"**       | `ai-engine index-repo --parallel` | Building search index      |
| **"Search for [query]"**    | `ai-engine search "<query>"`      | Find code                  |
| **"Find symbol [name]"**    | `ai-engine symbols <name>`        | Locate functions/classes   |
| **"Show repo stats"**       | `ai-engine stats`                 | View metrics               |
| **"Research T-XXX"**        | `ai-engine research T-XXX`        | Gather context             |
| **"Plan T-XXX"**            | `ai-engine plan T-XXX`            | Create implementation plan |
| **"Execute T-XXX"**         | `ai-engine execute T-XXX`         | Run implementation         |
| **"Verify T-XXX"**          | `ai-engine verify T-XXX`          | Validate work              |
| **"Show agent status"**     | `ai-engine agent-status T-XXX`    | Check pipeline             |
| **"Select workflow track"** | `npm run start -- decision-gate`  | Track A/B selection        |
| **"Check parallel work"**   | `npm run start -- next`           | Validate independent work  |

### Session Management

| Prompt                   | Command                      | When to Use             |
| ------------------------ | ---------------------------- | ----------------------- |
| **"Start session"**      | `ai-engine session start`    | New development session |
| **"List sessions"**      | `ai-engine session list`     | Find existing sessions  |
| **"Show session stats"** | `ai-engine session stats`    | Review activity         |
| **"Current session"**    | `ai-engine session current`  | Show active session     |
| **"Switch session"**     | `ai-engine session use <id>` | Resume work             |
| **"Handoff"**            | `/handoff`                   | End session             |
| **"Resume"**             | `/resume`                    | Start session           |
| **"Log this"**           | `/log`                       | Document changes        |
| **"Align with project"** | `/align-agent`               | Gain context            |

### Agent Slash Commands

| Prompt                          | Command                 | When to Use           |
| ------------------------------- | ----------------------- | --------------------- |
| **"Scope epic"**                | `/scope-epic`           | Create epic tickets   |
| **"Review requirements"**       | `/review-requirements`  | Validate requirements |
| **"Review design"**             | `/review-design`        | Validate design       |
| **"Execute plan"**              | `/execute-plan`         | Implementation        |
| **"Write tests"**               | `/writing-test`         | Generate tests        |
| **"Check implementation"**      | `/check-implementation` | Validate vs design    |
| **"Update planning"**           | `/update-planning`      | Sync planning         |
| **"Code review"**               | `/code-review`          | Review code           |
| **"Capture knowledge"**         | `/capture-knowledge`    | Document insights     |
| **"Frontend test suite"**       | `/frontend-test-suite`  | Frontend testing      |
| **"Backend test suite"**        | `/backend-test-suite`   | Backend testing       |
| **"Autonomous"**                | `/autonomous`           | Execute automatically |
| **"Verify ticket"**             | `/verify-ticket`        | Quality check         |
| **"Security audit"**            | `/security-audit`       | Security check        |
| **"Design UI"**                 | `/design-ui`            | UI design             |
| **"Debug"**                     | `/debug`                | Debug issues          |
| **"Discover"**                  | `/discover`             | Explore patterns      |
| **"Review"**                    | `/review`               | Quick review          |
| **"Reflect"**                   | `/reflect`              | Document failures     |
| **"Remember"**                  | `/remember`             | Save patterns         |
| **"Dashboard"**                 | `/dashboard`            | Project overview      |
| **"UAT phase"**                 | `/uat-phase`            | UAT analysis          |
| **"Update repository memory"**  | `/remember`             | After major work      |
| **"Enforce circuit breaker"**   | `/handoff`              | When blocked          |
| **"Prevent requirement drift"** | `/reflect`              | Issue discovery       |
| **"Audit layer 1"**             | `/audit-layer-1`        | Epic audit            |
| **"Harden epic"**               | `/harden-epic`          | Epic hardening        |
| **"Pre-harden PI"**             | `/pre-harden-pi`        | PI pre-hardening      |
| **"Init PI"**                   | `/init-pi`              | PI manifest setup     |
| **"Harden PI"**                 | `/harden-pi`            | PI hardening          |
| **"Retrofit"**                  | `/retrofit`             | Legacy adoption       |
| **"Migrate SDLC"**              | `/migrate-sdlc`         | Framework migration   |

### Discovery & Analysis

| Prompt                                  | Command                               | When to Use      |
| --------------------------------------- | ------------------------------------- | ---------------- |
| **"Check implementation for Epic [X]"** | `"Check implementation for Epic [X]"` | Epic validation  |
| **"Audit Epic [X] against PRD"**        | `"Audit Epic [X] against PRD"`        | Gap analysis     |
| **"Discover backlog"**                  | `/discover`                           | Backlog analysis |
| **"Analyze new entries"**               | `/discover`                           | Priority scoping |

### Project Initialization

| Prompt                                        | Command         | When to Use         |
| --------------------------------------------- | --------------- | ------------------- |
| **"Act as Senior Solution Architect"**        | `/init-project` | Foundation setup    |
| **"Define project foundation"**               | `/init-project` | Vision/PRD creation |
| **"Help me define the project"**              | `/init-project` | Project scoping     |
| **"Adopt AI-Assisted Development Framework"** | `/align-agent`  | Framework alignment |
| **"Analyze current codebase"**                | `/align-agent`  | Context sync        |

### SDLC Engine Commands

| Prompt                       | Command                                             | When to Use          |
| ---------------------------- | --------------------------------------------------- | -------------------- |
| **"Run AI SDLC Engine"**     | `npm run start --prefix ./engine -- run T-XXX`      | Autonomous execution |
| **"Check Ticket Status"**    | `npm run start --prefix ./engine -- status T-XXX`   | Status check         |
| **"Show Dependency Tree"**   | `npm run start --prefix ./engine -- deps T-XXX`     | Dependencies         |
| **"List Ready Tickets"**     | `npm run start --prefix ./engine -- next`           | Ready tickets        |
| **"Generate AI Context"**    | `npm run start --prefix ./engine -- context T-XXX`  | Context pack         |
| **"Validate Ticket Scope"**  | `npm run start --prefix ./engine -- validate T-XXX` | Scope validation     |
| **"Show Learning Insights"** | `npm run start --prefix ./engine -- insights`       | Learning metrics     |

### Epic & PI Management

| Prompt                                 | Command                                            | When to Use         |
| -------------------------------------- | -------------------------------------------------- | ------------------- |
| **"Start Epic Hardening protocol"**    | `"Start the Epic Hardening protocol for Epic [X]"` | Epic hardening      |
| **"Initialize Pre-Hardening Testing"** | `"Initialize Pre-Hardening Testing for PI-[X]"`    | PI preparation      |
| **"Hardening Protocol for PI"**        | `"Hardening Protocol for Project Initiative [X]"`  | PI hardening        |
| **"Start PI with epics"**              | `start PI-[X] with epics [X-Y]`                    | PI initialization   |
| **"Handle UAT Testing Phase"**         | `/uat-phase`                                       | UAT management      |
| **"Execute Layer 1 verification"**     | `/verify-ticket`                                   | Ticket verification |
| **"Execute Epic audit"**               | `/audit-layer-1`                                   | Epic quality check  |
| **"Execute Epic hardening"**           | `/harden-epic`                                     | Epic hardening      |
| **"Initialize PI pre-hardening"**      | `/pre-harden-pi`                                   | PI testing          |
| **"Initialize PI manifest"**           | `/init-pi`                                         | PI setup            |
| **"Execute PI hardening"**             | `/harden-pi`                                       | PI validation       |

### Migration & Retrofit

| Prompt                                  | Command                                 | When to Use       |
| --------------------------------------- | --------------------------------------- | ----------------- |
| **"Retrofit existing project"**         | `"Retrofit existing project [Name]"`    | Legacy adoption   |
| **"Migrate to Three-Layer SDLC"**       | `"Migrate project to Three-Layer SDLC"` | Structure upgrade |
| **"Run gap analysis"**                  | `/retrofit`                             | Gap analysis      |
| **"Move tickets into Epic containers"** | `/migrate-sdlc`                         | Ticket migration  |

### Quality Gates

| Prompt               | Command                                                              | When to Use          |
| -------------------- | -------------------------------------------------------------------- | -------------------- |
| **"Verify quality"** | `bash ci/verify.sh`                                                  | Layer 1 verification |
| **"Verify epic"**    | `bash ci/verify.sh --layer2`                                         | Epic hardening       |
| **"Verify PI"**      | `bash ci/verify.sh --layer3`                                         | Production           |
| **"Run pipeline"**   | `ci/pipeline.sh`                                                     | CI pipeline          |
| **"Quality check"**  | `python packages/code-quality-checking/quality-check.py --mode epic` | Epic gate            |

---

## 🚀 2. Composite Prompts (Multiple Actions)

These prompts trigger complex workflows with multiple steps and commands.

### Framework Setup & Diagnostics

| Prompt                     | Command Sequence                                        | When to Use               |
| -------------------------- | ------------------------------------------------------- | ------------------------- |
| **"Set up the framework"** | `make install` → `make test`                            | Complete initial setup    |
| **"Start working"**        | `make start` → `ai-engine session start`                | Begin development session |
| **"Services are down"**    | `make status` → `make start` → `make status`            | Recovery from failure     |
| **"Something's broken"**   | `make status` → `make test` → Identify failed component | Diagnostics               |
| **"Reindex failed"**       | Check error → `ai-engine index-repo --reset --parallel` | Fix indexing              |

### Ticket Workflows

| Prompt                   | Command Sequence                                                       | When to Use             |
| ------------------------ | ---------------------------------------------------------------------- | ----------------------- |
| **"Run T-XXX"**          | `ai-engine status T-XXX` → `ai-engine run T-XXX` → `bash ci/verify.sh` | Execute complete ticket |
| **"Do T-001"**           | `ai-engine status T-001` → `ai-engine run T-001` → `bash ci/verify.sh` | Short form              |
| **"Implement T-001"**    | `ai-engine status T-001` → `ai-engine run T-001` → `bash ci/verify.sh` | Implementation          |
| **"Work on T-001"**      | `ai-engine status T-001` → `ai-engine run T-001` → `bash ci/verify.sh` | General work            |
| **"Check my work"**      | `ai-engine validate T-XXX` → `bash ci/verify.sh`                       | Self-validation         |
| **"Did I do it right?"** | `ai-engine validate T-XXX` → `bash ci/verify.sh`                       | Quality check           |
| **"Verify changes"**     | `ai-engine validate T-XXX` → `bash ci/verify.sh`                       | Final verification      |

### Readiness Checks

| Prompt                            | Command Sequence                                    | When to Use            |
| --------------------------------- | --------------------------------------------------- | ---------------------- |
| **"What's the status of T-001?"** | `ai-engine status T-001`                            | Check progress         |
| **"Is it ready?"**                | `ai-engine status T-001` → Check phase/dependencies | Pre-execution          |
| **"Can I start T-001?"**          | `ai-engine status T-001` → `ai-engine deps T-001`   | Check readiness        |
| **"What should I work on?"**      | `ai-engine next` → `ai-engine status <ticket>`      | Find next task         |
| **"Show ready tickets"**          | `ai-engine next`                                    | List unblocked tickets |

### Epic & PI Management

| Prompt                                              | Command Sequence                                                              | When to Use          |
| --------------------------------------------------- | ----------------------------------------------------------------------------- | -------------------- |
| **"Start Epic Hardening for Epic [X]"**             | Verify all tickets done → Run 8-step sequence → `bash ci/verify.sh --layer2`  | Epic completion      |
| **"Harden Epic [X]"**                               | Same as above                                                                 | Short form           |
| **"Prepare Epic [X] for release"**                  | Same as above                                                                 | Alternative phrasing |
| **"Is Epic [X] ready for hardening?"**              | Check ticket statuses → Report gaps                                           | Pre-hardening check  |
| **"Start PI Hardening for PI-[X]"**                 | Verify all epics hardened → PI 8-step sequence → `bash ci/verify.sh --layer3` | Release prep         |
| **"Hardening Protocol for Project Initiative [X]"** | Same as above                                                                 | Formal trigger       |

### Planning & Scoping

| Prompt                                                | Command Sequence                                          | When to Use          |
| ----------------------------------------------------- | --------------------------------------------------------- | -------------------- |
| **"Plan this feature"**                               | `/scope-epic` → `/review-requirements` → `/review-design` | New feature planning |
| **"Break down this epic"**                            | `/scope-epic`                                             | Decompose epic       |
| **"I have completed strategic planning"**             | `/scope-epic [NAME]`                                      | Epic scoping         |
| **"Act as Senior Solution Architect"**                | `/init-project`                                           | Foundation creation  |
| **"Help me define project foundation"**               | `/init-project`                                           | Vision/PRD setup     |
| **"Analyze new entries in backlog"**                  | `/discover` → `/scope-epic`                               | Priority scoping     |
| **"I am adopting AI-Assisted Development Framework"** | `/align-agent`                                            | Framework adoption   |

### Execution & Development

| Prompt                                   | Command Sequence                               | When to Use           |
| ---------------------------------------- | ---------------------------------------------- | --------------------- |
| **"Start working on T-XXX"**             | `/execute-plan`                                | Ticket implementation |
| **"Run npm start engine"**               | `npm run start --prefix ./engine -- run T-XXX` | Autonomous execution  |
| **"Generate unit and functional tests"** | `/writing-test`                                | Test creation         |
| **"Target 80-100% coverage"**            | `/writing-test` → `/frontend-test-suite`       | Coverage goals        |
| **"Review active codebase"**             | `/code-review`                                 | Code review           |
| **"Compare current implementation"**     | `/check-implementation`                        | Design alignment      |
| **"Log architectural changes"**          | `/log`                                         | Documentation         |

### Verification & Hardening

| Prompt                                 | Command Sequence                                                                        | When to Use           |
| -------------------------------------- | --------------------------------------------------------------------------------------- | --------------------- |
| **"Run bash ci verify"**               | `/verify-ticket` → `bash ci/verify.sh`                                                  | Ticket verification   |
| **"Generate verification report"**     | `/verify-ticket`                                                                        | Quality reporting     |
| **"Execute quality check epic"**       | `/audit-layer-1` → `python packages/code-quality-checking/quality-check.py --mode epic` | Epic audit            |
| **"Start Epic Hardening protocol"**    | `/harden-epic` → [8-step sequence]                                                      | Epic hardening        |
| **"Fill out threat models"**           | `/harden-epic`                                                                          | Security analysis     |
| **"Initialize Pre-Hardening Testing"** | `/pre-harden-pi` → Test generation                                                      | PI preparation        |
| **"Write tests for every service"**    | `/pre-harden-pi`                                                                        | Comprehensive testing |
| **"Start PI with Epics"**              | `/init-pi` → PI manifest creation                                                       | PI setup              |
| **"Enforce DOD Checklist"**            | `/harden-pi` → Full validation                                                          | PI hardening          |
| **"Handle UAT Testing Phase"**         | `/uat-phase` → Bug fixing → Rule generation                                             | UAT management        |

### Migration & Retrofit

| Prompt                                  | Command Sequence                               | When to Use       |
| --------------------------------------- | ---------------------------------------------- | ----------------- |
| **"Retrofit existing project [Name]"**  | `/retrofit` → Gap analysis against drafted PRD | Legacy adoption   |
| **"Migrate to Three-Layer SDLC"**       | `/migrate-sdlc` → Ticket reorganization        | Structure upgrade |
| **"Move tickets into Epic containers"** | `/migrate-sdlc` → Epic container creation      | Migration         |

### Advanced Automation

| Prompt                                 | Command Sequence                           | When to Use             |
| -------------------------------------- | ------------------------------------------ | ----------------------- |
| **"Execute all tickets autonomously"** | `/autonomous` → Full pipeline              | Uninterrupted execution |
| **"Initiate state-tracing"**           | `/debug` → Bug hunting                     | Systematic debugging    |
| **"Extract solution into rule"**       | `/remember` → `.agent/rules/` creation     | Pattern extraction      |
| **"Analyze why approach failed"**      | `/reflect` → `ai_lessons.md` documentation | Failure analysis        |
| **"Generate visual dashboard"**        | `/dashboard` → Progress visualization      | Project overview        |

### Context Management

| Prompt                          | Command Sequence                                                       | When to Use        |
| ------------------------------- | ---------------------------------------------------------------------- | ------------------ |
| **"I need to switch contexts"** | `/handoff` → Set new AI_SESSION_ID → `/resume`                         | Context switch     |
| **"Session not found"**         | `ai-engine session list` → Export correct ID                           | Fix session issues |
| **"Context is wrong"**          | `ai-engine index-repo --reset --parallel` → `ai-engine research T-XXX` | Reset context      |

### Knowledge & Learning

| Prompt                           | Command Sequence                                                | When to Use           |
| -------------------------------- | --------------------------------------------------------------- | --------------------- |
| **"What did we learn?"**         | `ai-engine insights` → `ai-engine session stats $AI_SESSION_ID` | Learning review       |
| **"Show insights"**              | `ai-engine insights`                                            | Review metrics        |
| **"What patterns did we find?"** | `/capture-knowledge`                                            | Pattern documentation |

### Debugging & Recovery

| Prompt                   | Command Sequence                       | When to Use         |
| ------------------------ | -------------------------------------- | ------------------- |
| **"Fix this issue"**     | `/debug`                               | Autonomous fixing   |
| **"Something's broken"** | `make status` → `make test` → `/debug` | Diagnostics and fix |

---

## 🎯 3. Epic Hardening - Full Sequence (Complex Composite)

**Prompt:** _"Start the Epic Hardening protocol for Epic [X]"_

**Action:** The agent will follow the 8-step hardening sequence:

```
1. **Integration**: Run `ci/pipeline.sh` to verify combined ticket logic.
2. **Threat Modeling**: Fill out `web-applications/project-management/epics/Epic-[X]/threat_model.md`.
3. **API Contracts**: Finalize and lock `web-applications/project-management/epics/Epic-[X]/api_contract.md`.
4. **Database Synchronization & Seeding**: Perform a gap analysis between `database_mapping.md` and `supabase-export.md`. Update the mapping to reflect live reality, then run `seed_comprehensive_data.py` using live user discovery to ensure the environment is ready for testing.
5. **E2E Journey**: Perform a full walkthrough of the user journey.
6. **Versioning**: Prepare semantic versioning tags for the Epic release.
7. **Code Quality Verification**: Execute `python packages/code-quality-checking/quality-check.py --mode epic`. All active applications must pass the "Epic" level gate (Linting, Formatting, Basic Complexity).
8. **Verification Gate**: Run `bash ci/verify.sh --layer2`. The Epic CANNOT be marked `HARDENED` unless the score is ≥ 63 / 70. Attach the scored `project-management/verification-gate.md` to the Epic's hardening doc. If the gate fails twice, activate the **Circuit Breaker Protocol**.
```

**Goal:** Transition from "feature complete" to "enterprise ready."
**Note:** This is a complex multi-step process that requires careful execution and validation at each stage.
**When to use:** Use this prompt when you want to harden an entire Epic and prepare it for production release.

---

## 🔄 4. Common Workflow Combinations

### Morning Startup

**Prompt:** _"Start my day"_

```bash
make status                           # Check services
ai-engine session list                # Find session
export AI_SESSION_ID=<id>             # Set session
ai-engine index-repo --parallel       # Ensure fresh index
ai-engine next                        # See ready tickets
```

### New Ticket Flow

**Prompt:** _"I want to work on ticket T-001"_

```bash
ai-engine status T-001                # Check if ready
ai-engine deps T-001                  # See dependencies
ai-engine research T-001              # Gather context
# ... implement ...
ai-engine validate T-001              # Check scope
bash ci/verify.sh                     # Verify quality
```

### Epic Completion

**Prompt:** _"Epic 3 is ready to ship"_

```bash
"Start Epic Hardening protocol for Epic 3"
# (runs full 8-step sequence)
```

### End of Day

**Prompt:** _"I'm done for today"_

```bash
ai-engine session stats $AI_SESSION_ID  # Review learning
/handoff                                 # Save state
```

### Context Switch

**Prompt:** _"Switch to T-002"_

```bash
/handoff                                # Save current
export AI_PREV_TICKET=$AI_CURRENT_TICKET
export AI_CURRENT_TICKET=T-002
ai-engine research T-002                # Load context
```

---

## 🎭 5. Prompt Variations (AI Should Recognize)

| Intent         | Recognizable Variations                                       |
| -------------- | ------------------------------------------------------------- |
| **Install**    | "set up the framework", "install dependencies", "get started" |
| **Index**      | "scan the code", "parse the repo", "build the index"          |
| **Research**   | "analyze this ticket", "gather context", "understand T-001"   |
| **Run Ticket** | "do T-001", "implement T-001", "work on T-001"                |
| **Harden**     | "prepare for release", "harden the epic", "get ready to ship" |
| **Check**      | "is it ready?", "can I start?", "what's the status?"          |
| **Validate**   | "did I do it right?", "check my work", "verify changes"       |
| **Handoff**    | "save state", "end session", "I'm done for today"             |
| **Resume**     | "continue", "restore context", "I'm back"                     |

---

## 📋 6. Quick Reference Card

```
INSTALL:      "install framework" → make install → make test
START:        "start working" → make start → ai-engine session start
INDEX:        "index repo" → ai-engine index-repo --parallel
RESEARCH:     "research T-001" → ai-engine research T-001
RUN:          "run T-001" → ai-engine status T-001 → ai-engine run T-001
VALIDATE:     "validate" → ai-engine validate T-001 → bash ci/verify.sh
HARDEN:       "harden Epic 3" → [8-step sequence]
HANDOFF:      "handoff" → /handoff
RESUME:       "resume" → /resume
DEBUG:        "debug" → /debug
```

---

## 🔗 7. See Also

- `agents_commands_index.md` - Complete command reference
- `AGENTS.md` - Framework optimization guidelines
- `Framework_Overview.md` - Framework architecture overview
- `.agent/workflows/` - Detailed workflow documentation
