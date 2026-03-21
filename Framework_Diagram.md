# BOB - AI Software Development Workflow Framework - Architecture Diagrams

> **Deprecated**: This file is kept for historical ASCII diagrams only.  
> For current lifecycle, phases, and command mapping, use `project-management/WORKFLOW_OVERVIEW.md` and `BOB_README.md`.

> **Visual representation of the BOB - AI Software Development Workflow Framework architecture, phases, and workflows**

---

## 1. BOB - AI Software Development Workflow Framework Lifecycle (6 Phases)

```
+==============================================================================+
|                      BOB - AI SOFTWARE DEVELOPMENT WORKFLOW FRAMEWORK v1.0 -- COMPLETE SYSTEM MAP            |
+==============================================================================+


================================================================================
 1. THE LIFECYCLE -- How a project flows from idea to production
================================================================================

  +---------------+   +---------------+   +---------------+   +---------------+
  |  Phase 1      |-->|  Phase 2      |-->|  Phase 3      |-->|  Phase 4      |
  |  INSTALL      |   |  PROJECT INIT |   |  DEVELOPMENT  |   |  TESTING      |
  +-------+-------+   +-------+-------+   +-------+-------+   +-------+-------+
          |                   |                   |                   |
   make install      ai-engine        Epic Scoping        UAT Phase
   make test         project-init     Ticket Gen          Bug Fixes
   make start        vision.md        Code Gen            Validation
   Hourly Check      user_flow.md     Epic Hardening      QA Cycle
          |                   |                   |                   |
          v                   v                   v                   v
  +-------+-------+   +-------+-------+   +-------+-------+   +-------+-------+
  |  Phase 5      |   |  Phase 6      |   |               |   |               |
  |  DEPLOYMENT   |-->|  MAINTENANCE  |   |               |   |               |
  +-------+-------+   +---------------+   +---------------+   +---------------+
          |
   Release Prep
   Pre-Launch
   Post-Launch
   Monitoring
          |
          v
  +----------------------------------+
  |      PRODUCTION / LIVE           |
  +----------------------------------+


================================================================================
 2. PHASE 1 DETAIL -- Installation Process
================================================================================

  +---------------+     +---------------+     +---------------+
  | Prerequisites | --> | Install Deps  | --> | Health Check  |
  |  Check        |     |  & Services   |     |  (JSON out)   |
  +-------+-------+     +-------+-------+     +-------+-------+
          |                     |                     |
     Node.js | npm          engine npm i        framework-health.json
     Python | Docker        memory npm i        Check: Qdrant, Ollama,
     Ollama install        Qdrant Docker         SQLite, Engine
                            Model pull
                            requirements.txt


================================================================================
 3. PHASE 2 DETAIL -- Project Initialization
================================================================================

                           +-----------------+
                           | ai-engine       |
                           | project-init    |
                           +--------+--------+
                                    |
              +-----------------------+-----------------------+
              |                       |                       |
        +-----v-----+          +-----v-----+          +-----v-----+
        |   NEW     |          | CONTINUE  |          |  MIGRATE  |
        |  PROJECT  |          | EXISTING  |          |  LEGACY   |
        +-----+-----+          +-----+-----+          +-----+-----+
              |                       |                       |
    Interactive       Detect Tech       Backup metadata.json
    Prompts:          Stack:            Run continue logic
    - Project Name    - package.json    Log migration
    - Project Path    - requirements.txt  timestamp
              |                       |                       |
              +-----------------------+-----------------------+
                                    |
                          +---------v---------+
                          |  Generate Folders:|
                          |  - epics/         |
                          |  - tickets/       |
                          |  - design/        |
                          |  - src/           |
                          |  - tests/         |
                          |  - docs/          |
                          +---------+---------+
                                    |
                          +---------v---------+
                          | Generate Files:   |
                          | - tech_stack.json |
                          | - vision.md       |
                          | - user_flow.md    |
                          +-------------------+


================================================================================
 4. PHASE 3 DETAIL -- Development Workflow
================================================================================

  +-----------------+     +-----------------+     +-----------------+
  |  Epic Scoping   | --> | Ticket Generate | --> |  Code Execute   |
  |  /scope-epic    |     |  generate_tickets|    |  ai-engine run  |
  +-------+---------+     +--------+--------+     +--------+--------+
          |                        |                      |
   Read: screen_list.md     Auto-create:          Breath-based
   Plan tickets needed       - Ticket folders        Execution
   (T-055, T-056...)         - planning/README.md    Autonomous |
                             - metadata.json         Manual mode
                                                     |
                                                     v
                                            +-------+--------+
                                            | Quality Gates: |
                                            | - ci/verify.sh   |
                                            | - ci/pipeline.sh |
                                            +----------------+
                                                     |
                                                     v
  +-----------------+     +-----------------+     +-----------------+
  |  Epic Hardening | <-- |  Ticket Done    | <-- |  Validate       |
  |  8-step protocol|       |  [DONE]         |       |  Score ≥56/70   |
  +-------+---------+     +-----------------+     +-----------------+
          |
          v
  +-----------------+     +-----------------+
  |  PI Hardening   | --> |  Release Ready  |
  |  PI Manifest    |     |  git tag v1.X.X |
  +-----------------+     +-----------------+


================================================================================
 5. SERVICE MONITORING LOOP -- Hourly Health Checks
================================================================================

  +-------------------------------------------------------------+
  |  AI AGENT EVERY 60 MINUTES                                  |
  |                                                             |
  |  +----------------+    Read    +---------------------------+ |
  |  |  make status  | <--------- | last-status-check.txt   | |
  |  +-------+--------+            +---------------------------+ |
  |          |                                                  |
  |          v                                                  |
  |  +-------+--------+    No / Expired    +----------------+ |
  |  | Check timestamp| -------------------> |  make start    | |
  |  +-------+--------+                     |  (restart svcs)| |
  |          | Yes                          +-------+--------+ |
  |          | Healthy                               |        |
  |          v                                       v        |
  |  +-------+--------+    Still bad      +----------------+ |
  |  |  make test     | -----------------> | Update flag    | |
  |  |  (verify)      |                     +-------+--------+ |
  |  +-------+--------+                             |           |
  |          |                                      v           |
  |          v                          +-------------------+ |
  |  +-------+--------+                  | Log to:            | |
  |  | Log result to  |                  | health-check-log.txt| |
  |  | health-check-  |                  +-------------------+ |
  |  | log.txt         |                                         |
  |  +----------------+                                         |
  |                                                             |
  |  CIRCUIT BREAKER: If restart fails twice                    |
  |  --> Stop and ask human for assistance                        |
  +-------------------------------------------------------------+


================================================================================
 6. QUALITY GATES -- 3-Layer Verification System
================================================================================

  +-----------------+     +-----------------+     +-----------------+
  |   LAYER 1       |     |   LAYER 2       |     |   LAYER 3       |
  |   TICKET        | --> |   EPIC          | --> |   PI            |
  |                 |     |                 |     |                 |
  | ci/verify.sh    |     | ci/pipeline.sh  |     | ci/verify.sh    |
  |                 |     |                 |     | --layer3        |
  | Threshold:      |     | Threshold:      |     | Threshold:      |
  | 56/70 (80%)     |     | 63/70 (90%)     |     | 70/70 (100%)    |
  +--------+--------+     +--------+--------+     +--------+--------+
           |                       |                       |
           v                       v                       v
  +-----------------+     +-----------------+     +-----------------+
  | Checks:         |     | Checks:         |     | Checks:         |
  | - Unit tests    |     | - Integration   |     | - Zero Mock     |
  | - Linting       |     | - Static analysis|    | - 100% BE cov   |
  | - Manual valid  |     | - Dependency scan|    | - FE tests init |
  | - Context       |     | - Env validation |    | - Security audit|
  +-----------------+     +-----------------+     +-----------------+
           |                       |                       |
           v                       v                       v
  +-----------------+     +-----------------+     +-----------------+
  | Mark [DONE]     |     | threat_model.md |     | PI Manifest     |
  |                 |     | api_contract.md |     | Release Notes   |
  +-----------------+     +-----------------+     +-----------------+


================================================================================
 7. COMMAND QUICK REFERENCE
================================================================================

  FRAMEWORK LIFECYCLE:
  +----------------------+------------------------------------------+
  | make install         | Install all dependencies & tools         |
  | make test            | Run health checks -> framework-health.json|
  | make start           | Start Qdrant, Ollama services            |
  | make status          | Check service status                     |
  | make stop            | Stop all services                        |
  +----------------------+------------------------------------------+

  PROJECT INITIALIZATION:
  +----------------------+------------------------------------------+
  | ai-engine project-init --type new      | New clean slate project  |
  | ai-engine project-init --type continue | Continue existing        |
  | ai-engine project-init --type migrate  | Migrate from legacy      |
  +----------------------+------------------------------------------+

  REPOSITORY INTELLIGENCE:
  +----------------------+------------------------------------------+
  | ai-engine index-repo --parallel        | Index with parallel proc |
  | ai-engine index-repo --workers 8       | Index with 8 workers     |
  | ai-engine session start                | Start new session        |
  | ai-engine session list                 | List active sessions     |
  | ai-engine search "query"               | Semantic search          |
  +----------------------+------------------------------------------+

  TICKET WORKFLOW:
  +----------------------+------------------------------------------+
  | ai-engine run T-XXX    | Execute ticket T-XXX                     |
  | ai-engine status T-XXX | Check ticket status                      |
  | /scope-epic            | Scope epic and generate tickets          |
  | bash ci/verify.sh      | Run Layer 1 quality gate                   |
  +----------------------+------------------------------------------+


================================================================================
 8. FILE STRUCTURE REFERENCE
================================================================================

  bob-framework/
  |
  ├── Makefile                          Framework lifecycle commands
  ├── framework-health.json             Health check output (auto)
  ├── Framework_Overview.md             This audit document
  ├── Framework_Diagram.md              ASCII diagrams (this file)
  ├── AGENTS_COMMANDS_INDEX.md          Complete command reference
  ├── AGENTS_PROMPTS_INDEX.md           Natural language mappings
  ├── bob-framework-FLOW-OVERVIEW.md         High-level architecture
  |
  ├── .agent/
  │   ├── rules/                        18 rule files
  │   │   ├── service_monitoring.md     Hourly check rule
  │   │   ├── command_enforcement.md    Command standards
  │   │   ├── circuit_breaker.md        Failure recovery
  │   │   └── ...                       (15 more rules)
  │   ├── workflows/                    32 workflow files
  │   │   ├── scope-epic.md             Epic scoping
  │   │   ├── init-project.md           Project init
  │   │   ├── execute-plan.md           Ticket execution
  │   │   └── ...                       (29 more workflows)
  │   └── flags/                        Health check timestamps
  │       ├── last-status-check.txt
  │       └── health-check-log.txt
  │
  ├── ci/                               Quality gate scripts
  │   ├── verify.sh                     Layer 1 (56/70)
  │   ├── pipeline.sh                   Layer 2 (63/70)
  │   ├── quality_check.sh
  │   ├── lint.sh
  │   └── security_scan.sh
  │
  └── engine/                           CLI engine
      └── src/
          └── cli/
              └── commands/
                  ├── framework-test.ts
                  ├── project-init.ts
                  ├── framework-start.ts
                  ├── session.ts
                  └── index-repo.ts
```

---

## 9. Mermaid Alternative Diagrams

For systems that support Mermaid rendering, here are flowchart versions:

---

## 9.1 Framework Lifecycle Flow

```mermaid
flowchart LR
    A["git clone<br/>bob-framework"] --> B["make install"]
    B --> C["make test"]
    C --> D{"Health<br/>Check?"}
    D -->|Healthy| E["make start"]
    D -->|Unhealthy| F["Fix Issues"]
    F --> C
    E --> G["Services<br/>Running"]
    G --> H[".agent/flags/<br/>last-status-check.txt"]
    
    style A fill:#e1f5ff
    style E fill:#d4edda
    style G fill:#d4edda
    style F fill:#f8d7da
```

---

## 9.2 Five Phase Workflow

```mermaid
flowchart TB
    subgraph "Phase 1: Installation"
        P1["Framework Init<br/>make install"]
        P1B["Framework Test<br/>make test"]
        P1C["Framework Start<br/>make start"]
        P1 --> P1B --> P1C
    end
    
    subgraph "Phase 2: Project Init"
        P2{"Project Type?"}
        P2A["New Project<br/>ai-engine project-init --type new"]
        P2B["Continue Existing<br/>ai-engine project-init --type continue"]
        P2C["Migrate Legacy<br/>ai-engine project-init --type migrate"]
        P2 -->|New| P2A
        P2 -->|Continue| P2B
        P2 -->|Migrate| P2C
    end
    
    subgraph "Phase 3: Development"
        P3A["Epic Scoping<br/>/scope-epic"]
        P3B["Ticket Generation<br/>generate_tickets.py"]
        P3C["Code Generation<br/>ai-engine run T-XXX"]
        P3D["Epic Hardening<br/>8-step protocol"]
        P3E["PI Hardening<br/>Release prep"]
        P3A --> P3B --> P3C --> P3D --> P3E
    end
    
    subgraph "Phase 4: Testing"
        P4["UAT Phase<br/>Ad hoc bug fixes"]
    end
    
    subgraph "Phase 5: Deployment"
        P5A["Release Prep"]
        P5B["Pre-Launch"]
        P5C["Post-Launch<br/>Monitoring"]
        P5A --> P5B --> P5C
    end
    
    P1C --> P2
    P2A --> P3A
    P2B --> P3A
    P2C --> P3A
    P3E --> P4
    P4 --> P5A
    
    style P1 fill:#e1f5ff
    style P2 fill:#fff3cd
    style P3A fill:#d4edda
    style P3B fill:#d4edda
    style P3C fill:#d4edda
    style P4 fill:#e2e3ff
    style P5A fill:#ffe1f0
```

---

## 9.3 Service Monitoring Loop

```mermaid
sequenceDiagram
    participant Agent as AI Agent
    participant Flag as .agent/flags/<br/>last-status-check.txt
    participant Status as make status
    participant Services as Framework<br/>Services
    participant Log as health-check-log.txt
    
    loop Every 60 minutes
        Agent->>Flag: Read timestamp
        alt Timestamp > 60 min OR services down
            Agent->>Status: Execute check
            Status->>Services: Query health
            Services-->>Status: Return status
            Status-->>Agent: Show results
            alt Services unhealthy
                Agent->>Services: make start (restart)
                Agent->>Services: make test (verify)
            end
            Agent->>Flag: Update timestamp
            Agent->>Log: Append check result
        else Within 60 min and healthy
            Agent->>Agent: Continue work
        end
    end
    
    alt Restart fails twice
        Agent->>Agent: Trigger Circuit Breaker
        Agent->>Agent: Stop and ask human
    end
```

---

## 9.4 Project Initialization Flow

```mermaid
flowchart TD
    START(["User: Initialize Project"]) --> CMD["ai-engine project-init"]
    CMD --> TYPE{"Select Type"}
    
    TYPE -->|new| NEW["New Project Flow"]
    TYPE -->|continue| CONT["Continue Existing"]
    TYPE -->|migrate| MIG["Migrate Legacy"]
    
    subgraph "New Project Details"
        NEW --> INPUT["Prompt:<br/>- Project Name<br/>- Project Path"]
        INPUT --> FOLDERS["Create Folders:<br/>- web-applications/project-management/epics<br/>- project-management/tickets<br/>- project-management/design<br/>- src/<br/>- tests/<br/>- docs/"]
        FOLDERS --> FILES["Generate Files:<br/>- tech_stack.json<br/>- vision.md (template)<br/>- user_flow.md (template)"]
    end
    
    subgraph "Continue Existing"
        CONT --> DETECT["Detect Tech Stack:<br/>- package.json → Node<br/>- requirements.txt → Python"]
        DETECT --> ADAPT["Create project-management/<br/>folders + tech_stack.json"]
    end
    
    subgraph "Migrate Legacy"
        MIG --> BACKUP["Backup:<br/>project_metadata.json → .bak"]
        BACKUP --> APPLY["Apply continue logic"]
        APPLY --> LOG["Log migration timestamp"]
    end
    
    FILES --> NEXT["Next Steps:<br/>1. cd project-path<br/>2. ai-engine index-repo --parallel<br/>3. ai-engine session start"]
    ADAPT --> NEXT
    LOG --> NEXT
    
    style NEW fill:#d4edda
    style CONT fill:#fff3cd
    style MIG fill:#ffe1f0
```

---

## 9.5 Epic & Ticket Workflow

```mermaid
flowchart LR
    subgraph "Epic Scoping"
        SCOPE["/scope-epic<br/>Workflow"]
        READ["Read:<br/>screen_list.md"]
        PLAN["Plan Tickets:<br/>T-055, T-056..."]
        SCAFFOLD["generate_tickets.py<br/>Auto-scaffold"]
    end
    
    subgraph "Ticket Structure"
        TICKET["T-XXX/"]
        REQ["requirements/<br/>README.md"]
        DES["design/<br/>README.md"]
        PLAN2["planning/<br/>README.md"]
        IMPL["implementation/<br/>README.md"]
        TEST["testing/<br/>README.md"]
        META["metadata.json"]
    end
    
    subgraph "Execution"
        EXEC["ai-engine run T-XXX"]
        STATUS["ai-engine status T-XXX"]
        VALIDATE["bash ci/verify.sh"]
    end
    
    SCOPE --> READ --> PLAN --> SCAFFOLD
    SCAFFOLD --> TICKET
    TICKET --> REQ
    TICKET --> DES
    TICKET --> PLAN2
    TICKET --> IMPL
    TICKET --> TEST
    TICKET --> META
    PLAN2 --> EXEC
    EXEC --> STATUS
    STATUS --> VALIDATE
    
    style SCOPE fill:#e1f5ff
    style SCAFFOLD fill:#d4edda
    style EXEC fill:#fff3cd
```

---

## 9.6 Quality Gates Flow

```mermaid
flowchart TD
    subgraph "Layer 1: Ticket Level"
        L1_CMD["bash ci/verify.sh"]
        L1_CHECK["Checks:<br/>- Component Unit Tests<br/>- Linting<br/>- Manual validation<br/>- Context completeness"]
        L1_SCORE["Score: ≥56/70 (80%)"]
        L1_PASS{"Pass?"}
        L1_DONE["[DONE]"]
    end
    
    subgraph "Layer 2: Epic Level"
        L2_CMD["bash ci/pipeline.sh"]
        L2_CHECK["Checks:<br/>- Integration tests<br/>- Static analysis<br/>- Dependency scan<br/>- Env validation<br/>- threat_model.md<br/>- api_contract.md"]
        L2_SCORE["Score: ≥63/70 (90%)"]
        L2_PASS{"Pass?"}
        L2_TAG["git tag v1.X.X"]
    end
    
    subgraph "Layer 3: PI Level"
        L3_CMD["bash ci/verify.sh --layer3"]
        L3_CHECK["Checks:<br/>- Zero Mock Policy<br/>- 100% BE Coverage<br/>- FE Tests Init<br/>- Security Audit<br/>- PI Manifest Complete"]
        L3_SCORE["Score: ≥70/70 (100%)"]
        L3_PASS{"Pass?"}
        L3_RELEASE["PRODUCTION_RELEASE_NOTES.md"]
    end
    
    L1_CMD --> L1_CHECK --> L1_SCORE --> L1_PASS
    L1_PASS -->|Yes| L1_DONE
    L1_PASS -->|No| L1_CMD
    
    L1_DONE --> L2_CMD --> L2_CHECK --> L2_SCORE --> L2_PASS
    L2_PASS -->|Yes| L2_TAG
    L2_PASS -->|No| L2_CMD
    
    L2_TAG --> L3_CMD --> L3_CHECK --> L3_SCORE --> L3_PASS
    L3_PASS -->|Yes| L3_RELEASE
    L3_PASS -->|No| L3_CMD
    
    style L1_SCORE fill:#fff3cd
    style L2_SCORE fill:#e2e3ff
    style L3_SCORE fill:#d4edda
    style L1_DONE fill:#d4edda
    style L2_TAG fill:#d4edda
    style L3_RELEASE fill:#d4edda
```

---

## 9.7 Command Hierarchy

```mermaid
mindmap
  root((Framework<br/>Commands))
    Framework Lifecycle
      make install
      make test
      make start
      make status
      make stop
    Project Init
      ai-engine project-init --type new
      ai-engine project-init --type continue
      ai-engine project-init --type migrate
    Repository Intelligence
      ai-engine index-repo --parallel
      ai-engine index-repo --workers 8
      ai-engine session start
      ai-engine session list
      ai-engine session stats
      ai-engine search
      ai-engine research
    Ticket Workflow
      ai-engine run T-XXX
      ai-engine status T-XXX
      ai-engine validate T-XXX
      /scope-epic
      /execute-plan
    Quality Gates
      bash ci/verify.sh
      bash ci/pipeline.sh
      bash ci/quality_check.sh
      bash ci/security_scan.sh
```

---

## 9.8 File Structure Overview

```mermaid
graph LR
    subgraph "Root Level"
        README["README.md"]
        MAKEFILE["Makefile"]
        HEALTH["framework-health.json"]
        OVERVIEW["Framework_Overview.md"]
        DIAGRAM["Framework_Diagram.md"]
    end
    
    subgraph "Agent System"
        RULES[".agent/rules/<br/>18 rule files"]
        WORKFLOWS[".agent/workflows/<br/>32 workflows"]
        AGENTS[".agent/agents/<br/>5 agent types"]
        FLAGS[".agent/flags/<br/>Health check logs"]
    end
    
    subgraph "CI/CD"
        VERIFY["ci/verify.sh"]
        PIPELINE["ci/pipeline.sh"]
        QUALITY["ci/quality_check.sh"]
        LINT["ci/lint.sh"]
        SECURITY["ci/security_scan.sh"]
    end
    
    subgraph "Engine"
        CLI["engine/src/cli/"]
        COMMANDS["engine/src/cli/commands/<br/>framework-test.ts<br/>project-init.ts<br/>framework-start.ts<br/>session.ts<br/>index-repo.ts"]
    end
    
    subgraph "Documentation"
        CMD_INDEX["AGENTS_COMMANDS_INDEX.md"]
        PROMPT_INDEX["AGENTS_PROMPTS_INDEX.md"]
        CMD_GUIDE["AGENTS_COMMANDS_GUIDE.md"]
        ARCH["ARCHITECTURE-DIAGRAM.md"]
        TROUBLE["TROUBLESHOOTING.md"]
        FLOW["bob-framework-FLOW-OVERVIEW.md"]
    end
    
    MAKEFILE --> HEALTH
    CLI --> COMMANDS
    RULES --> FLAGS
```

---

## 9.9 Decision Flow: What Command to Use?

```mermaid
flowchart TD
    START(["Need to..."]) --> Q1{"Install or<br/>Manage Framework?"}
    
    Q1 -->|Yes| CMD1["Use: make <target>"]
    CMD1 --> C1A["install - First setup"]
    CMD1 --> C1B["test - Health check"]
    CMD1 --> C1C["start - Start services"]
    CMD1 --> C1D["status - Check status"]
    
    Q1 -->|No| Q2{"Initialize Project?"}
    Q2 -->|Yes| CMD2["Use: ai-engine project-init"]
    CMD2 --> C2A["--type new"]
    CMD2 --> C2B["--type continue"]
    CMD2 --> C2C["--type migrate"]
    
    Q2 -->|No| Q3{"Repository Work?"}
    Q3 -->|Yes| CMD3["Use: ai-engine <command>"]
    CMD3 --> C3A["index-repo --parallel"]
    CMD3 --> C3B["session start"]
    CMD3 --> C3C["search"]
    CMD3 --> C3D["research"]
    
    Q3 -->|No| Q4{"Ticket Work?"}
    Q4 -->|Yes| CMD4["Use: ai-engine run T-XXX"]
    CMD4 --> C4A["Check: ai-engine status T-XXX"]
    CMD4 --> C4B["Validate: bash ci/verify.sh"]
    
    Q4 -->|No| Q5{"Quality Check?"}
    Q5 -->|Yes| CMD5["Use: bash ci/<script>"]
    CMD5 --> C5A["verify.sh - Layer 1"]
    CMD5 --> C5B["pipeline.sh - Layer 2"]
    CMD5 --> C5C["security_scan.sh - Audit"]
    
    Q5 -->|No| END(["Refer to<br/>AGENTS_COMMANDS_INDEX.md"])
    
    style CMD1 fill:#e1f5ff
    style CMD2 fill:#fff3cd
    style CMD3 fill:#d4edda
    style CMD4 fill:#e2e3ff
    style CMD5 fill:#ffe1f0
```

---

*Diagrams rendered with Mermaid syntax*
