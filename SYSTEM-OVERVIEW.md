# System Overview

> **BOB - AI Software Development Workflow Framework: Conceptual guide to the system philosophy, workflows, and design principles.**

Audience: humans and agents looking for **high-level concepts**.  
For step-by-step phases, commands, and concrete workflows, use `project-management/WORKFLOW_OVERVIEW.md` as the canonical procedural reference.

---

## 🎯 What Is This?

The **BOB - AI Software Development Workflow Framework** is a structured system for AI-assisted software development that separates **developer velocity**, **feature hardening**, and **production readiness** into distinct, measurable phases.

### Core Philosophy

> **"Move fast with safety nets, not speed limits."**

Traditional development either:

- **Moves too fast** → Technical debt, bugs, security issues
- **Moves too slow** → Bureaucracy, missed opportunities

This framework provides **guardrails, not gates**:

- Automate the boring parts (documentation, validation)
- Accelerate the creative parts (implementation, experimentation)
- Verify at every level (ticket → epic → production)

---

## 🏛️ The Three Layers

```
┌─────────────────────────────────────────────────────────────────┐
│ LAYER 3: PI (Production Initiative)                             │
│ "Is this ready for real users?"                                 │
│ ─────────────────────────────────────                           │
│ • Cross-epic integration testing                                │
│ • Security audit & penetration testing                          │
│ • 100% test coverage enforcement                                │
│ • Zero-mock policy verification                                 │
│ • Production deployment with monitoring                         │
│                                                                 │
│ Threshold: 70/70 (100%) - No exceptions                         │
└──────────────────────────────────┬──────────────────────────────┘
                                   │
                                   │ Multiple hardened epics
                                   ▼
┌─────────────────────────────────────────────────────────────────┐
│ LAYER 2: EPIC (Release Hardening)                               │
│ "Does this feature work end-to-end?"                          │
│ ─────────────────────────────────────                           │
│ • Integration testing across tickets                            │
│ • Threat modeling & security review                             │
│ • API contract finalization                                     │
│ • Database schema validation                                    │
│ • E2E user journey testing                                      │
│ • Version tagging                                               │
│                                                                 │
│ Threshold: 63/70 (90%) - Enterprise ready                       │
└──────────────────────────────────┬──────────────────────────────┘
                                   │
                                   │ Multiple completed tickets
                                   ▼
┌─────────────────────────────────────────────────────────────────┐
│ LAYER 1: TICKET (Developer Velocity)                            │
│ "Can I ship this individual task?"                              │
│ ─────────────────────────────────────                           │
│ • Requirements → Design → Implement → Validate                  │
│ • Atomic commits                                                │
│ • File Guard scope enforcement                                  │
│ • 70-point quality gate                                         │
│ • Breath-based execution (parallel where safe)                  │
│                                                                 │
│ Threshold: 56/70 (80%) - Feature complete                       │
└─────────────────────────────────────────────────────────────────┘
```

### Why Three Layers?

| Problem                      | Layer 1 Solution   | Layer 2 Solution  | Layer 3 Solution  |
| ---------------------------- | ------------------ | ----------------- | ----------------- |
| "I don't know if this works" | File Guard + Tests | Integration tests | E2E journey tests |
| "What about security?"       | Basic validation   | Threat model      | Penetration test  |
| "Does it scale?"             | Not measured       | API contracts     | Load testing      |
| "Can we rollback?"           | Git history        | Version tags      | Blue/green deploy |

Each layer adds **more rigor without slowing down the layers below**.

---

## 🤖 The Agent System

### Four Specialized Agents

```
┌─────────────────────────────────────────────────────────────────┐
│                    RESEARCHER AGENT                             │
│                    "What should I know?"                         │
│ ─────────────────────────────────────────                        │
│ Before planning, the Researcher explores:                       │
│ • Existing patterns in the codebase                             │
│ • Relevant skills from the library                              │
│ • Similar past implementations                                  │
│ • Architectural constraints                                     │
│                                                                 │
│ Output: RESEARCH.md with confidence score, patterns, skills   │
│                                                                 │
│ When to use: Complex tickets, new codebase areas, uncertainty    │
└──────────────────────────────────┬──────────────────────────────┘
                                   │ "Found patterns X, Y, Z"
                                   ▼
┌─────────────────────────────────────────────────────────────────┐
│                    PLANNER AGENT                                │
│                    "What exactly should I build?"                │
│ ─────────────────────────────────────────                        │
│ The Planner creates a BLUEPRINT:                                │
│ • Task breakdown (what to build)                                │
│ • Must-have checklist (definition of done)                    │
│ • File scope (what can be touched)                              │
│ • Breath groups (what can be parallel)                          │
│ • Skills to apply (patterns to follow)                          │
│                                                                 │
│ Output: BLUEPRINT.md with 8-15 tasks, 2-4 breaths              │
│                                                                 │
│ When to use: Starting implementation phase                      │
└──────────────────────────────────┬──────────────────────────────┘
                                   │ "8 tasks in 3 breaths"
                                   ▼
┌─────────────────────────────────────────────────────────────────┐
│                    EXECUTOR AGENT                               │
│                    "Let's build it."                             │
│ ─────────────────────────────────────────                        │
│ The Executor implements the BLUEPRINT:                          │
│ • One task at a time                                            │
│ • Atomic commits after each task                                │
│ • Follows skills library patterns                               │
│ • Runs File Guard for scope validation                          │
│ • Validates each breath before continuing                       │
│                                                                 │
│ Output: RECORD.md + working code + tests                        │
│                                                                 │
│ When to use: Implementation phase (/execute-plan)               │
└──────────────────────────────────┬──────────────────────────────┘
                                   │ "All 8 tasks complete"
                                   ▼
┌─────────────────────────────────────────────────────────────────┐
│                    VERIFIER AGENT                               │
│                    "Prove it works."                             │
│ ─────────────────────────────────────────                        │
│ The Verifier validates independently:                           │
│ • Checks BLUEPRINT must-haves                                   │
│ • Runs 70-point validation checklist                            │
│ • Verifies skill adherence                                      │
│ • Tests actually test the requirements                          │
│                                                                 │
│ Output: VERIFICATION.md with PASS/PARTIAL/FAIL + score          │
│                                                                 │
│ When to use: After implementation (/verify-ticket)              │
└─────────────────────────────────────────────────────────────────┘
```

### Agent Handoffs

Each agent produces **standardized output** at the **ticket root** that the next agent consumes:

```
RESEARCH.md → PLANNER → BLUEPRINT.md → EXECUTOR → RECORD.md → VERIFIER → VERIFICATION.md
     │            │             │             │               │
     ▼            ▼             ▼             ▼               ▼
Patterns      Tasks         Code Implementation Tests         Final Score
Confidence    Must-haves    Tests               Validation    PASS/FAIL
Skills        File scope    Commits             Evidence      Recommendations
```

### Why Specialized Agents?

**Single-Agent Approach (Bad)**:

- Same AI tries to research, plan, code, and verify
- Conflicts of interest (can't objectively verify own work)
- Context overflow (too much in one conversation)
- No standardization

**Multi-Agent Approach (Good)**:

- Each agent has focused responsibility
- Verifier is **independent** from Executor
- Standardized handoff documents
- Can parallelize (multiple executors on different breaths)

---

## 📚 The Skills Library

### What Is a Skill?

A **Skill** is a documented, reusable pattern for solving a specific problem:

````yaml
---
id: jwt-auth-v1
name: JWT Authentication
stacks: [fastapi, express, django]
---

## Problem
Users need secure authentication without session state.

## Solution
JSON Web Tokens with refresh token rotation.

## Implementation
### Files to Create
| File | Purpose |
|------|---------|
| token_service.py | Generate/validate tokens |

### Code: FastAPI
```python
class TokenService:
    ACCESS_TOKEN_EXPIRY = '15m'
    REFRESH_TOKEN_EXPIRY = '7d'
````

### Validation Checklist

- [ ] Access tokens expire ≤15 minutes
- [ ] Refresh tokens expire ≤7 days

```

### Skill Categories

| Category | Example Skills | When Used |
|----------|---------------|-----------|
| **Agents** | ui-designer-v1, security-engineer-v1 | AI behavior |
| **Methodology** | breath-based-execution-v1, testing-patterns-v1 | Process |
| **Frontend** | flutter-provider-v1, react-state-v1 | UI patterns |
| **Backend** | fastapi-structure-v1, grpc-api-v1 | API patterns |
| **Auth & API** | jwt-auth-v1, api-design-v1 | Security & Communication |
| **Database** | repository-pattern-v1, db-migrations-v1 | Data access |
| **Architecture** | event-driven-architecture-v1, caching-v1 | Infrastructure |

### How Skills Drive the Workflow

```

1. User: "Build JWT authentication"
   │
   ▼
2. Researcher searches index.json
   Query: category="authentication", stack="fastapi"
   Result: jwt-auth-v1, oauth-v1, session-auth-v1
   │
   ▼
3. Planner includes in BLUEPRINT.md
   "Apply jwt-auth-v1 for token handling"
   │
   ▼
4. Executor loads jwt-auth-v1
   Copies code patterns, follows checklist
   │
   ▼
5. Verifier checks against checklist
   "jwt-auth-v1 checklist: 9/10 passed"

```

### Why Skills Matter

**Without Skills**:
- Every AI session reinvents patterns
- Inconsistent implementations
- No knowledge accumulation

**With Skills**:
- Patterns documented once, used everywhere
- Consistent quality
- Self-improving (effectiveness scores)
- Framework-agnostic (works across projects)

---

## 🛡️ Safety Mechanisms

### 1. File Guard (Scope Enforcement)

**Problem**: AI modifies files outside the ticket's scope.

**Solution**: File Guard validates every change:
```

Allowed Files: src/auth/\*
Attempted: src/payment/gateway.py

❌ VIOLATION: Payment gateway outside auth scope
Action: Block commit, alert user

```

### 2. Architecture Guard (Layer Rules)

**Problem**: Circular dependencies, UI layer importing database, or violating path boundaries.

**Solution**: Enforces layer architecture and path resolution via `BobConfig`:
```

UI → Service → Repository → Model

Violation: UI layer importing repository directly
❌ Blocked: UI can only import Services

```
Path resolution is handled via a dynamic "walk-up" strategy, ensuring portability across environments.

### 3. Circuit Breaker (Failure Detection)

**Problem**: AI gets stuck in loops, repeated failures.

**Solution**: Count failures, escalate to human:
```

T-045: Login feature
Attempt 1: FAIL (missing password hash)
Attempt 2: FAIL (wrong hash algorithm)
Attempt 3: FAIL (hash comparison failing)

🛑 CIRCUIT BREAKER TRIGGERED
Reason: 3 consecutive failures
Action: Handoff to human with full context

```

### 4. 70-Point Validation Gate (Automated)

**Problem**: Subjective "is this done?" decisions.

**Solution**: Objective, automated scoring integrated into `PhaseRunner`:

| Category | Points | Checks |
|----------|--------|--------|
| Functionality | 10 | Feature works, edge cases handled |
| Code Quality | 15 | No lint errors, consistent naming |
| Testing | 15 | Unit tests, >80% coverage |
| Architecture | 15 | Follows layer rules |
| Security | 10 | No secrets, input validation |
| Documentation | 5 | README, code comments |

Thresholds:
- **Layer 1**: 56/70 (80%) - Ticket complete
- **Layer 2**: 63/70 (90%) - Epic hardened
- **Layer 3**: 70/70 (100%) - Production ready

---

## 🔄 Workflows

### Manual Workflow (Human in the Loop)

```

User: /scope-epic user-auth
AI: Created 8 tickets
User: /execute-plan T-001
AI: Researched, planned, implemented
User: [reviews] "Looks good"
AI: Verified: 68/70 PASS
User: /execute-plan T-002
...

```

**Good for**: Complex features, learning, new patterns.

### Autonomous Workflow (AI-Driven)

```

User: /autonomous epic-001
AI: [Loops through all 8 tickets automatically]
Research → Plan → Execute → Verify
[On failure]: Debug → Retry
[On success]: Next ticket
[On 3 failures]: Circuit breaker → Human

```

**Good for**: Well-scoped epics, routine work, regression fixes.

### Hybrid Workflow (Default)

```

Epic Start: /scope-epic (manual)
│
├── Ticket 1-3: /bob run (auto)
│
├── Ticket 4: Complex → /execute-plan (interactive)
│
├── Ticket 5-7: /bob run (auto)
│
└── Epic End: Hardening Protocol (manual review)

```

**Good for**: Most real-world scenarios.

---

## 📦 Project Structure

```

project-root/
│
├── vision.md # Project vision
├── PRD.md # Product requirements
├── FRD.md # Functional requirements
├── system_architecture.md # Technical architecture
├── epic_backlogs.md # Epic tracking
│
├── project-management/
│ ├── epics/
│ │ ├── epic-001/
│ │ │ ├── epic_metadata.json
│ │ │ ├── threat_model.md
│ │ │ ├── api_contract.md
│ │ │ └── tickets/
│ │ │ ├── T-001/
│ │ │ │ ├── metadata.json
│ │ │ │ ├── RESEARCH.md ← Researcher
│ │ │ │ ├── BLUEPRINT.md ← Planner
│ │ │ │ ├── RECORD.md ← Executor
│ │ │ │ └── VERIFICATION.md ← Verifier
│ │ │ ├── T-002/
│ │ │ └── ...
│ │ └── PI-001_Manifest.md
│ ├── backlog.md
│ ├── DASHBOARD.md
│ └── ACTIVE_SESSION.md
│
├── web-applications/ # Actual code
│ ├── bob/ # Framework Dashboard
│ └── ...
│
├── .agent/ # AI configuration
│ ├── agents/ # Agent system prompts
│ ├── rules/ # Domain-specific rules
│ └── workflows/ # Command workflows
│
├── skills-library/ # Reusable patterns
│ ├── index.json # Searchable registry
│ ├── agents/ # Agent skills
│ ├── methodology/ # Process skills
│ └── patterns/ # Technical skills
│
├── engine/ # Orchestration engine (TypeScript)
│ └── ...
│
└── ci/ # CI/CD scripts
├── verify.sh # 70-point gate
├── pipeline.sh # Full CI
└── ci_config.sh # Tech stack config

```

---

## 🎯 Success Metrics

| Metric | Target | How Measured |
|--------|--------|--------------|
| Ticket Completion Rate | 95% | % reaching DONE |
| Verification Pass Rate | 90% | % scoring ≥ threshold |
| Autonomous Success | 85% | % of /autonomous completing |
| Skill Adoption | 80% | % of tickets using skills |
| Time to Complete | -30% | vs traditional development |
| Quality Score | Maintain | 70-point average |

---

## 🎓 Key Concepts

**Breath**: A group of independent tasks that can be executed in parallel.

**Must-Have**: A requirement that must be met for ticket completion. Checked by Verifier.

**File Scope**: Explicit list of files that can be modified. Enforced by File Guard.

**Skill**: Documented pattern with code examples, validation checklist, and success metrics.

**70-Point Gate**: Objective quality scoring across 6 categories.

**Circuit Breaker**: Safety mechanism that escalates to human after repeated failures.

**Layer 1/2/3**: Progressive rigor: ticket → epic → production.

---

## 📖 Documentation Map

| Document | Purpose |
|----------|---------|
| `ARCHITECTURE-DIAGRAM.md` | Visual system architecture |
| `AGENTS.md` | Core Command & Rule Reference |
| `SYSTEM-OVERVIEW.md` | This document - concepts |
| `SKILLS_INVENTORY.md` | [Full Skills Inventory](./skills-library/SKILLS_INVENTORY.md) |
| `agents_prompts_index.md` | Official prompt registry |

---

## 🤝 Philosophy in Practice

### When to Override the AI

**Override when**:
- AI suggests insecure approaches
- Business logic doesn't match domain knowledge
- User experience feels wrong
- Technical decisions have long-term consequences

**Don't override when**:
- Code style preferences (trust the framework)
- File organization (trust File Guard)
- Test coverage requirements (trust 70-point gate)
- Documentation (trust the process)

### Trust but Verify

The framework is designed to be **trustworthy by default**:
- File Guard catches scope violations
- Verifier catches quality issues
- Circuit breaker catches runaway loops

But **you're always in control**:
- Review any plan before execution
- Stop autonomous mode anytime
- Override any decision
- Reject verification results

---

> **Next Steps**:
> - See `ARCHITECTURE-DIAGRAM.md` for technical details
> - See `COMMAND-REFERENCE.md` for all available commands
> - See `SKILLS_INVENTORY.md` for available patterns
> - Start with `/init-project` or `/scope-epic`
```
