# AI Agent System

The AI Agent System provides specialized AI agents for planning, execution, verification, and research. Each agent has a focused responsibility and specific capabilities.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     COMMAND LAYER                            │
│  /discover → /execute-plan → /verify-ticket                  │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                     AGENT LAYER                              │
│                                                             │
│  ┌─────────────┐   ┌─────────────┐   ┌─────────────┐         │
│  │  RESEARCHER │ → │   PLANNER   │ → │  EXECUTOR   │         │
│  │             │   │             │   │             │         │
│  │ - Maps      │   │ - Creates   │   │ - Writes    │         │
│  │   codebase  │   │   BLUEPRINT │   │   code      │         │
│  │ - Discovers │   │ - Searches  │   │ - Commits   │         │
│  │   patterns  │   │   skills    │   │   atomically│         │
│  │ - Finds     │   │ - Defines   │   │ - Validates │         │
│  │   skills    │   │   scope     │   │   with CI   │         │
│  └─────────────┘   └─────────────┘   └──────┬──────┘         │
│                                               │               │
│                                               ↓               │
│                                        ┌─────────────┐       │
│                                        │  VERIFIER   │       │
│                                        │             │       │
│                                        │ - Validates │       │
│                                        │   output    │       │
│                                        │ - 70-point  │       │
│                                        │   check     │       │
│                                        │ - Reports   │       │
│                                        │   PASS/FAIL │       │
│                                        └─────────────┘       │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                     ENGINE LAYER                             │
│  Phase Runner, File Guard, Architecture Guard, Learning Layer │
└─────────────────────────────────────────────────────────────┘
```

## Agents

### 1. Researcher Agent (`researcher`)
**Purpose**: Discover patterns, map codebase, find relevant skills

**When to use**:
- Before planning a ticket to understand existing patterns
- When entering a new codebase
- To find reusable patterns for a problem

**Capabilities**:
- Read: All project files, skills library
- Search: Memory MCP, codebase grep
- Write: Research reports, pattern documentation

**Output**: `RESEARCH.md` with discovered patterns and recommendations

---

### 2. Planner Agent (`planner`)
**Purpose**: Create detailed implementation plans (BLUEPRINT)

**When to use**:
- Starting a new ticket in the Implement phase
- When requirements need to be broken down into tasks
- Before execution to define scope and approach

**Capabilities**:
- Read: PRD, FRD, ticket metadata, research reports
- Search: Skills library for relevant patterns
- Write: BLUEPRINT.md with tasks and must-haves

**Output**: `BLUEPRINT.md` with:
- Task breakdown with dependencies
- Must-have checklist
- File scope definition
- Skills to apply
- Breath groupings for parallel execution

---

### 3. Executor Agent (`executor`)
**Purpose**: Implement code according to BLUEPRINT

**When to use**:
- Executing an implementation plan
- Writing code for a ticket
- Converting BLUEPRINT into working code

**Capabilities**:
- Read: BLUEPRINT.md, skills library, project files
- Write: Code, tests, documentation
- Bash: Run CI commands, git operations
- Tools: File Guard (enforces scope), Architecture Guard (layer validation)

**Rules**:
- Never claim completion without verification
- Make atomic commits after each task
- Apply honesty protocols (admit when stuck)
- Enforce file scope boundaries

**Output**: `RECORD.md` with:
- What was built
- Files modified
- Test results
- Blockers encountered
- Honesty assessment

---

### 4. Verifier Agent (`verifier`)
**Purpose**: Validate implementation against requirements

**When to use**:
- After code implementation
- Before marking ticket complete
- When running validation gates

**Capabilities**:
- Read: BLUEPRINT must-haves, RECORD.md, output files
- Bash: Run CI pipeline, verification gates
- Tools: 70-point validation checklist

**Rules**:
- Independent from executor (no bias)
- Goal-backward verification (check requirements, not just code)
- Prove PASS with evidence
- Flag FAIL with specific issues

**Output**: `VERIFICATION.md` with:
- PASS / PARTIAL / FAIL status
- Must-have checklist with ✓/✗
- 70-point checklist results
- Issues found
- Recommendations

---

### 5. Security Engineer Agent (`security-engineer`)
**Purpose**: Identify risks, threat modeling, and security hardening

**When to use**:
- `/security-audit` requests
- Before major releases (Epic Hardening)
- Tickets involving auth, payments, or PII

**Capabilities**:
- Threat Modeling (STRIDE)
- Vulnerability Assessment (OWASP Top 10)
- Secure Code Review

**Output**: `SECURITY_AUDIT.md` with:
- Threat model
- Vulnerability findings (Critical/High/Med/Low)
- Remediation steps

---

### 6. UI Designer Agent (`ui-designer`)
**Purpose**: Create visual systems, components, and interaction patterns

**When to use**:
- `/design-ui` requests
- Design phase for UI tickets
- Updating style guide or tokens

**Capabilities**:
- Design System Management
- Component Architecture
- Accessibility Review (WCAG AA)

**Output**: `UI_SPEC.md` with:
- Visual specs (layout, spacing, colors)
- Component states and hierarchy
- Accessibility requirements

---

### 7. Architecture Designer Agent (`architecture-designer`)
**Purpose**: Define system architecture, data flows, and API contracts; record decisions.

**When to use**:
- `/review-design` triggers
- Start of Track B (Full) tickets
- When introducing new services or APIs

**Capabilities**:
- Produce `DESIGN.md` with context, flows, and explicit API contracts
- Create ADRs capturing options, decisions, and consequences
- Validate scalability and failure modes

**Output**:
- `DESIGN.md` and `ADR-XXX.md` entries as needed

---

## Agent Orchestration

### Sequential Flow (Default)
```
Research → Plan → Execute → Verify
```

### Parallel Flow (Breath-Based)
```
Research → Plan
                ↓
         [Breath 1] ─┬─ Execute Task A
                     ├─ Execute Task B  (parallel)
                     └─ Execute Task C
                ↓
         [Breath 2] ─┬─ Execute Task D
                     └─ Execute Task E  (parallel)
                ↓
              Verify All
```

### Handoff Protocol

Each agent produces a standardized handoff document:

```markdown
## Agent Handoff: [agent-name]

**Ticket**: T-XXX
**Agent**: [name]
**Timestamp**: [ISO date]
**Status**: [complete | blocked | failed]

### Input Context
[What the agent received]

### Actions Taken
[What the agent did]

### Output Produced
[Files created/modified]

### Blockers
[Any issues encountered]

### Next Agent
[Which agent should run next]

### Context for Next Agent
[Key information for continuity]
```

## Commands

| Command | Agent | Purpose |
|---------|-------|---------|
| `/discover` | Researcher | Discover patterns and map codebase |
| `/execute-plan` | Executor | Implement BLUEPRINT |
| `/verify-ticket` | Verifier | Validate implementation |
| `/autonomous` | All | Run complete pipeline |

## Skills Integration

Each agent has access to the skills library:

```
skills-library/
├── AVAILABLE_TOOLS_REFERENCE.md  # Master index
├── [category]/
│   └── SKILL-NAME.md            # Pattern documentation
└── methodology/
    └── complexity-divider.md    # Meta patterns
```

Agents search skills based on:
- Ticket description keywords
- Layer being modified (ui, service, model)
- Phase being executed
- Historical effectiveness (learning layer)

## Honesty Protocols

All agents follow WARRIOR honesty principles:

1. **Admit Unknowns**: If information is missing, say so
2. **Flag Assumptions**: Explicitly state what you're assuming
3. **Evidence-Based**: Claims must be backed by code/tests
4. **No False Completion**: Never claim done without verification
5. **Quantify Confidence**: Rate confidence levels (0-100%)

## Integration with Engine

The agent system **uses** the engine components:

```
Agent System                    Engine
─────────────────────────────────────────────
planner          →       Phase Runner (checks phase)
executor         →       File Guard (enforces scope)
executor         →       Architecture Guard (layer validation)
verifier         →       Validation Runner (CI pipeline)
All agents       →       Learning Layer (records telemetry)
```

Agents add **intelligence** on top of the engine's **enforcement**.

## Quick Start

- Agents are defined in this directory and registered in `registry.json`.
- Use the workflow commands (`/discover`, `/execute-plan`, `/verify-ticket`, `/autonomous`) described in `.agent/workflows/*.md` and `AGENTS.md` to activate them as part of the SDLC.
- To sanity-check agent prompts locally, run:

  ```bash
  node .agent/tests/validate_prompts.js
  ```

## File Structure

```
.agent/
├── agents/
│   ├── researcher/
│   │   └── system-prompt.md
│   ├── planner/
│   │   └── system-prompt.md
│   ├── executor/
│   │   └── system-prompt.md
│   ├── verifier/
│   │   └── system-prompt.md
│   ├── EXAMPLE.md
│   ├── README.md
│   └── registry.json
├── orchestrator/
│   └── agent-runner.ts
└── tests/
    └── validate_prompts.js
```
