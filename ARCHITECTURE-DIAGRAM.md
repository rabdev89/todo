# BOB - AI Software Development Workflow Framework - Architecture Diagram

> **Deprecated**: This file is kept for historical diagrams only.  
> For up-to-date architecture and workflow, use `SYSTEM-OVERVIEW.md` (conceptual) and `project-management/WORKFLOW_OVERVIEW.md` (procedural).

> **Visual overview of the framework's architecture, components, and data flow.**

---

## 🏗️ High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           USER INTERFACE LAYER                               │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐       │
│  │  CLI Tool   │  │  IDE Plugin │  │   Chat UI   │  │  Web Dashboard│       │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘       │
└─────────┼────────────────┼────────────────┼────────────────┼────────────────┘
          │                │                │                │
          └────────────────┴────────────────┴────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         COMMAND & ORCHESTRATION LAYER                      │
│                                                                              │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                    Command Parser & Router                         │   │
│   │  /execute-plan  /verify-ticket  /discover  /autonomous  /scope-epic │   │
│   └─────────────────────────────┬─────────────────────────────────────┘   │
│                                 │                                            │
│   ┌─────────────────────────────┴─────────────────────────────────────┐   │
│   │                      Orchestrator Engine                           │   │
│   │   ┌───────────┐   ┌───────────┐   ┌───────────┐   ┌───────────┐ │   │
│   │   │  Agent    │   │  Phase    │   │  File     │   │  Circuit  │ │   │
│   │   │  Runner   │──▶│  Runner   │──▶│  Guard    │──▶│  Breaker  │ │   │
│   │   └───────────┘   └───────────┘   └───────────┘   └───────────┘ │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────┬───────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           AGENT LAYER                                       │
│                                                                              │
│   ┌───────────────────────────────────────────────────────────────────┐    │
│   │                        Researcher Agent                            │    │
│   │   Input: Ticket, PRD, Codebase                                       │    │
│   │   Output: RESEARCH.md (patterns, skills, codebase map)              │    │
│   │   Skills: skills-library search, memory MCP, codebase grep        │    │
│   └─────────────────────────────────┬─────────────────────────────────┘    │
│                                     │                                        │
│                                     ▼                                        │
│   ┌───────────────────────────────────────────────────────────────────┐    │
│   │                         Planner Agent                              │    │
│   │   Input: RESEARCH.md, PRD, ticket metadata                       │    │
│   │   Output: BLUEPRINT.md (tasks, must-haves, file scope)            │    │
│   │   Skills: Task decomposition, breath grouping, skills integration   │    │
│   └─────────────────────────────────┬─────────────────────────────────┘    │
│                                     │                                        │
│                                     ▼                                        │
│   ┌───────────────────────────────────────────────────────────────────┐    │
│   │                        Executor Agent                              │    │
│   │   Input: BLUEPRINT.md, skills library                            │    │
│   │   Output: RECORD.md + working code                               │    │
│   │   Skills: Code generation, validation, atomic commits             │    │
│   └─────────────────────────────────┬─────────────────────────────────┘    │
│                                     │                                        │
│                                     ▼                                        │
│   ┌───────────────────────────────────────────────────────────────────┐    │
│   │                        Verifier Agent                              │    │
│   │   Input: BLUEPRINT, RECORD, implementation                       │    │
│   │   Output: VERIFICATION.md (PASS/PARTIAL/FAIL + 70-point score)     │    │
│   │   Skills: Quality gates, skill checklist validation               │    │
│   └───────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│   Supporting: Debugger Agent (on-demand troubleshooting)                    │
└─────────────────────────────────┬───────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          SKILLS LIBRARY LAYER                               │
│                                                                              │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                    index.json (Searchable Registry)                  │   │
│   │   26 Skills | 9 Categories | Multi-stack coverage                   │   │
│   └──────────────────────────────┬──────────────────────────────────────┘   │
│                                  │                                          │
│   ┌──────────────────────────────┴──────────────────────────────────────┐   │
│   │                      Skill Categories                             │   │
│   │  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐   │   │
│   │  │   Agents   │ │Methodology │ │  Frontend  │ │   Backend  │   │   │
│   │  │  (5 skills)│ │  (4 skills)│ │  (2 skills)│ │  (1 skill) │   │   │
│   │  └────────────┘ └────────────┘ └────────────┘ └────────────┘   │   │
│   │  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐   │   │
│   │  │    Auth    │ │  Database  │ │   Forms    │ │    API     │   │   │
│   │  │  (1 skill) │ │  (1 skill) │ │  (1 skill) │ │  (1 skill) │   │   │
│   │  └────────────┘ └────────────┘ └────────────┘ └────────────┘   │   │
│   │  ┌────────────────────────────────────────────────────────────┐   │   │
│   │  │                    Architecture (7 skills)                  │   │   │
│   │  │  Error Handling | Caching | Logging | Background Jobs      │   │   │
│   │  │  Rate Limiting | File Upload | Feature Flags             │   │   │
│   │  └────────────────────────────────────────────────────────────┘   │   │
│   └───────────────────────────────────────────────────────────────────┘   │
└──────────────────────────────────┬──────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           ENGINE LAYER                                      │
│                                                                              │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                        Phase Runner                                  │   │
│   │   Requirements → Design → Implement → Validate → Deploy             │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│   ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐           │
│   │   File Guard     │  │ Architecture     │  │   Dependency     │           │
│   │   (Scope         │  │   Guard          │  │   Engine         │           │
│   │   Enforcement)   │  │   (Layer Rules)  │  │   (DAG Resolution)│           │
│   └──────────────────┘  └──────────────────┘  └──────────────────┘           │
│                                                                              │
│   ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐           │
│   │   Validation     │  │   Circuit        │  │   Learning       │           │
│   │   Runner         │  │   Breaker        │  │   Layer          │           │
│   │   (70-Point      │  │   (Failure       │  │   (Telemetry    │           │
│   │   Checklist)     │  │   Detection)     │  │   & Insights)    │           │
│   └──────────────────┘  └──────────────────┘  └──────────────────┘           │
└──────────────────────────────────┬───────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         PROJECT LAYER (Epic/Ticket)                        │
│                                                                              │
│   project-management/                                                        │
│   ├── epics/                                                                 │
│   │   ├── epic-001/                                                          │
│   │   │   ├── tickets/T-001/                                                 │
│   │   │   │   ├── requirements/README.md                                     │
│   │   │   │   ├── design/README.md                                           │
│   │   │   │   ├── planning/BLUEPRINT.md ← Planner Output                   │
│   │   │   │   ├── implementation/RECORD.md ← Executor Output                 │
│   │   │   │   ├── testing/VERIFICATION.md ← Verifier Output                 │
│   │   │   │   └── metadata.json                                              │
│   │   │   └── epic_metadata.json                                             │
│   │   └── PI-001_Manifest.md                                                 │
│   └── backlog.md                                                             │
│                                                                              │
│   web-applications/    ← Actual code lives here                              │
│   ├── bob-framework/                                                              │
│   └── ...                                                                    │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Data Flow: Ticket Lifecycle

```
┌─────────────┐
│  User Story   │ (From PRD)
└──────┬──────┘
       │
       ▼
┌─────────────┐     ┌─────────────┐
│  Researcher  │────▶│  RESEARCH.md │
│  (/discover) │     │  - Patterns   │
└─────────────┘     │  - Skills     │
                    │  - Code Map   │
                    └──────┬──────┘
                           │
                           ▼
┌─────────────┐     ┌─────────────┐
│   Planner   │────▶│ BLUEPRINT.md │
│  (/plan)    │     │  - Tasks     │
└─────────────┘     │  - Must-Haves│
                    │  - File Scope│
                    └──────┬──────┘
                           │
                           ▼
┌─────────────┐     ┌─────────────┐
│   Executor  │────▶│  RECORD.md   │
│ (/execute)  │     │  + Code      │
└─────────────┘     └──────┬──────┘
                           │
                           ▼
┌─────────────┐     ┌─────────────┐
│   Verifier  │────▶│ VERIFICATION.│
│ (/verify)   │     │    md       │
└─────────────┘     │  PASS/FAIL  │
                    └─────────────┘
```

---

## 🧠 Agent Collaboration Flow

```
┌────────────────────────────────────────────────────────────────────────────┐
│                        AGENT HANDOFF PROTOCOL                              │
│                                                                            │
│  ┌──────────┐        ┌──────────┐        ┌──────────┐        ┌─────────┐ │
│  │Researcher│───────▶│  Planner │───────▶│ Executor │───────▶│Verifier │ │
│  └──────────┘        └──────────┘        └──────────┘        └─────────┘ │
│       │                  │                  │                  │          │
│       │                  │                  │                  │          │
│  Input:              Input:               Input:              Input:       │
│  - Ticket            - RESEARCH.md      - BLUEPRINT.md     - BLUEPRINT │
│  - PRD               - PRD               - Skills             - RECORD.md │
│  - Codebase          - Ticket Meta       - Codebase          - Code      │
│                                                                            │
│  Output:             Output:             Output:             Output:     │
│  - RESEARCH.md       - BLUEPRINT.md      - RECORD.md        - VERIF.   │
│  - Skill IDs         - Task Breakdown    - Code             - 70-pt Score│
│  - Confidence        - Must-Haves        - Tests             - Issues     │
│                                                                            │
│  Handoff:            Handoff:            Handoff:           Handoff:    │
│  "Found patterns X   "Plan covers all    "All tasks         "93/100.     │
│   and Y, need       requirements with    complete, 2        3 issues      │
│   decisions on Z"     8 tasks in 3       minor issues"      found"       │
│                       breaths"                                            │
└────────────────────────────────────────────────────────────────────────────┘
```

---

## 📦 Component Dependencies

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         DEPENDENCY GRAPH                                   │
│                                                                              │
│   Layer N+1 can depend on Layer N (never the reverse)                       │
│                                                                              │
│   ┌────────────────────────────────────────────────────────────────────┐    │
│   │  UI Layer (flutter, react, vue)                                   │    │
│   │   ├─ Can import: Services                                         │    │
│   │   └─ Cannot import: Repositories, Models directly                  │    │
│   └────────────────────────────┬─────────────────────────────────────┘    │
│                                │                                            │
│                                ▼                                            │
│   ┌────────────────────────────────────────────────────────────────────┐    │
│   │  Service Layer (business logic, external APIs)                    │    │
│   │   ├─ Can import: Repositories, Utils                              │    │
│   │   └─ Cannot import: UI, Database directly                         │    │
│   └────────────────────────────┬─────────────────────────────────────┘    │
│                                │                                            │
│                                ▼                                            │
│   ┌────────────────────────────────────────────────────────────────────┐    │
│   │  Repository Layer (data access, queries)                          │    │
│   │   ├─ Can import: Models, Database                                  │    │
│   │   └─ Cannot import: Services, UI                                   │    │
│   └────────────────────────────┬─────────────────────────────────────┘    │
│                                │                                            │
│                                ▼                                            │
│   ┌────────────────────────────────────────────────────────────────────┐    │
│   │  Model Layer (schemas, validation)                                │    │
│   │   └─ Can import: Nothing below (base layer)                       │    │
│   └────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│   Cross-Cutting:                                                            │
│   ├─ Skills Library (used by all agents)                                   │
│   ├─ Memory MCP (researcher, knowledge capture)                            │
│   ├─ Validation Gates (verifier, quality checks)                           │
│   └─ CI/CD Pipeline (autonomous execution)                                 │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🎯 Skills Integration Points

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                     SKILLS LIBRARY INTEGRATION                             │
│                                                                              │
│   Every agent searches and applies skills automatically:                     │
│                                                                              │
│   ┌─────────────────────────────────────────────────────────────────────┐  │
│   │                      index.json (Skills Registry)                    │  │
│   │   Search: category=X, stack=Y, tag=Z → skill_ids[]                │  │
│   └──────────────────────────────┬──────────────────────────────────────┘  │
│                                  │                                         │
│           ┌──────────────────────┼──────────────────────┐                   │
│           │                      │                      │                   │
│           ▼                      ▼                      ▼                   │
│   ┌───────────────┐      ┌───────────────┐      ┌───────────────┐          │
│   │   Researcher  │      │    Planner    │      │   Executor    │          │
│   │   "Found 3    │      │   "Apply      │      │   "Following  │          │
│   │    skills for │      │    jwt-auth   │      │    skill      │          │
│   │    auth"      │      │    pattern"   │      │    checklist" │          │
│   └───────────────┘      └───────────────┘      └───────────────┘          │
│           │                      │                      │                   │
│           ▼                      ▼                      ▼                   │
│   ┌─────────────────────────────────────────────────────────────────────┐  │
│   │                    Skills Applied to Ticket                        │  │
│   │   RESEARCH.md → Skills Recommendations                             │  │
│   │   BLUEPRINT.md → Skills Application                                │  │
│   │   RECORD.md → Skills Adherence                                     │  │
│   └─────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│   ┌─────────────────────────────────────────────────────────────────────┐  │
│   │                    Verifier Validation                             │  │
│   │   "jwt-auth-v1 checklist: 9/10 items passed"                         │  │
│   │   "Skill adherence: 90%"                                           │  │
│   └─────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Three-Layer Workflow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                     THREE-LAYER SDLC WORKFLOW                              │
│                                                                              │
│  LAYER 1: TICKET (Developer Velocity)                                       │
│  ┌─────────────────────────────────────────────────────────────────────┐  │
│  │  Feature Branch → Breath Execution → Autonomous Verification         │  │
│  │  Score Threshold: 56/70 (80%)                                       │  │
│  │  Focus: Fast iteration, single ticket                               │  │
│  └─────────────────────────────────────────────────────────────────────┘  │
│                                    │                                        │
│                                    │ (Merge to Epic branch)                 │
│                                    ▼                                        │
│  LAYER 2: EPIC (Release Hardening)                                          │
│  ┌─────────────────────────────────────────────────────────────────────┐  │
│  │  Integration → Threat Model → API Contract → E2E Testing          │  │
│  │  Score Threshold: 63/70 (90%)                                       │  │
│  │  Focus: Cross-ticket consistency, security                            │  │
│  └─────────────────────────────────────────────────────────────────────┘  │
│                                    │                                        │
│                                    │ (Tag release)                          │
│                                    ▼                                        │
│  LAYER 3: PI (Production Readiness)                                         │
│  ┌─────────────────────────────────────────────────────────────────────┐  │
│  │  Cross-Epic Audit → Security Blitz → 100% Coverage → Deployment   │  │
│  │  Score Threshold: 70/70 (100%)                                      │  │
│  │  Focus: Production safety, zero-mock, complete testing              │  │
│  └─────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 📊 System Capacity

| Component | Capacity | Scaling Strategy |
|-----------|----------|------------------|
| Agent Runner | 1 active per ticket | Sequential ticket processing |
| Skills Library | 26 skills, 100+ planned | Add skills incrementally |
| Verification Gate | 70-point checklist | Layer-specific thresholds |
| Circuit Breaker | 3 failures → human handoff | Auto-reset after fix |
| Parallel Execution | By breath groups | Independent tasks in parallel |
| Memory MCP | Unlimited | Persistent knowledge storage |

---

## 🔐 Security & Governance

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      SAFETY MECHANISMS                                     │
│                                                                              │
│   File Guard                    Architecture Guard          Circuit Breaker │
│   ├─ Scope enforcement          ├─ Layer rules            ├─ Failure     │
│   ├─ No out-of-scope edits      ├─ Import validation        │   tracking    │
│   └─ Git diff validation        ├─ No circular deps         ├─ 3 strikes    │
│                                 └─ Dependency direction     │   → human    │
│                                                             └─ Auto-escalate │
│                                                                              │
│   No-Gap Policy                Zero-Mock Policy            70-Point Gate    │
│   ├─ No new epic until         ├─ No mock data in prod    ├─ Objective     │
│   │  previous gaps resolved    ├─ Real API calls only      │   quality     │
│   └─ Gap analysis required     └─ Integration tested       └─ Score-based  │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🚀 Execution Modes

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         EXECUTION MODES                                     │
│                                                                              │
│   MANUAL MODE                      AUTONOMOUS MODE                          │
│   ┌─────────────────────────┐     ┌─────────────────────────────────────┐   │
│   │ User: /execute-plan T-1 │     │ User: /autonomous epic-001         │   │
│   │                         │     │                                     │   │
│   │ AI: Research → Plan    │     │ AI: Loop through all tickets:       │   │
│   │      (wait approval)   │     │     1. Research (auto)             │   │
│   │                         │     │     2. Plan (auto)                 │   │
│   │ User: Approve           │     │     3. Execute (auto)              │   │
│   │                         │     │     4. Verify (auto)               │   │
│   │ AI: Execute → Verify   │     │     5. If FAIL: Debug & retry    │   │
│   │                         │     │     6. If PASS: Next ticket        │   │
│   │ User: Review results    │     │                                     │   │
│   └─────────────────────────┘     │ Stop only on:                      │   │
│                                   │ - Circuit breaker triggered        │   │
│   Good for:                       │ - Human interruption               │   │
│   - Complex features              │ - All tickets complete             │   │
│   - New patterns                  │                                     │   │
│   - Learning                      │ Good for:                          │   │
│                                   │ - Well-scoped epics                │   │
│                                   │ - Routine implementations          │   │
│                                   │ - Regression fixes                 │   │
│                                   └─────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 📈 Extension Points

The framework is designed for extension:

| Extension | How | Example |
|-----------|-----|---------|
| **New Agent** | Add to `.agent/agents/` | Analytics Agent |
| **New Skill** | Create in `skills-library/` | payment-processing-v1 |
| **New Stack** | Add to skill `stacks` array | Go, Rust support |
| **New Command** | Add to `COMMANDS_AND_PROMPTS_INDEX.md` | `/analytics` |
| **New Guard** | Add to engine layer | Performance Guard |
| **New Integration** | MCP tool or skill | Jira, Linear, etc. |

---

## 🎯 Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Ticket Completion Rate | 95% | % of tickets reaching DONE |
| Verification Gate Pass | 90% | % scoring ≥ threshold |
| Skill Adoption | 80% | % of tickets using relevant skills |
| Autonomous Success | 85% | % of /autonomous epics completing |
| Time to Complete | -30% | vs manual development |
| Code Quality | Maintain | No regression in quality scores |

---

> **Related Documents**:
> - `SYSTEM-OVERVIEW.md` - Conceptual overview
> - `COMMAND-REFERENCE.md` - All available commands
> - `SKILLS_INVENTORY.md` - Skills roadmap

*This diagram represents the system architecture as of 2024-03-07*
