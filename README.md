# BOB — Agentic SDLC Orchestrator

**BOB** (AI Software Development Workflow Framework) is an **Agentic SDLC Orchestrator**: an autonomous AI engine that manages the entire SDLC — from requirements gathering to production-ready deployment. *Agentic SDLC Orchestrator* denotes AI-driven automation across the full lifecycle, with multi-agent coordination, phase/state management, and human-in-the-loop gates.

Bob transforms complex ideas into high-quality codebases by orchestrating specialized AI agents through a rigorous Three-Layer process. Whether you are bootstrapping a new project or scaling an existing one, Bob ensures architectural integrity, security compliance, and developer velocity without the 'prompt-and-pray' guesswork.

## 📦 Installation

For the fastest setup, including project migration and continuous orchestration, please refer to the:

> [!IMPORTANT]
> **[QUICK INSTALLATION GUIDE](./QUICK_INSTALLATION_GUIDE.md)**

### Prerequisites

- **Node.js** (v18+) - [Download](https://nodejs.org/)
- **npm** (v9+) - Included with Node.js
- **Python** (v3.8+) - Required for UI/UX Design Intelligence [Download](https://python.org/)
- **Docker** - For Qdrant vector database [Download](https://docker.com/)
- **Ollama** - For local embeddings [Download](https://ollama.ai/)

---

## 🏛️ Three-Layer SDLC

```
Layer 1: TICKET (Velocity)          Layer 2: EPIC (Hardening)         Layer 3: PI (Production)
├── Fast iteration                   ├── Integration testing           ├── Cross-epic flows
├── File Guard scope                 ├── Threat modeling               ├── Security audit
├── 70-point gate (56/70)            ├── 70-point gate (63/70)         ├── 70-point gate (70/70)
└── Breath-based execution           └── Version tagging               └── Production deploy
```

| Layer | Focus                | Threshold    | When                  |
| ----- | -------------------- | ------------ | --------------------- |
| **1** | Developer velocity   | 56/70 (80%)  | Individual tickets    |
| **2** | Feature hardening    | 63/70 (90%)  | Epic release          |
| **3** | Production readiness | 70/70 (100%) | Production deployment |

---

## 🤖 Agent System

Four specialized agents work sequentially:

```
Researcher → Planner → Executor → Verifier
     │           │          │          │
     ▼           ▼          ▼          ▼
RESEARCH.md  BLUEPRINT.md  RECORD.md  VERIFICATION.md
```

| Agent          | Purpose                         | Output             |
| -------------- | ------------------------------- | ------------------ |
| **Researcher** | Discover patterns, map codebase | `RESEARCH.md`      |
| **Planner**    | Create implementation plan      | `BLUEPRINT.md`     |
| **Executor**   | Implement code following plan   | `RECORD.md` + code |
| **Verifier**   | Validate independently          | `VERIFICATION.md`  |

---

## 📚 Skills Library

**33 skills** across 9 categories, framework-agnostic:

| Category     | Skills | Example                 |
| ------------ | ------ | ----------------------- |
| Agents       | 8      | ui-designer-v1, security-engineer-v1 |
| Methodology  | 6      | breath-based-execution-v1 |
| Architecture | 11     | event-driven-architecture-v1 |
| Frontend     | 2      | flutter-provider-v1     |
| Backend      | 1      | fastapi-structure-v1    |
| Auth & API   | 3      | jwt-auth-v1, api-design-v1 |
| Core Systems | 2      | repository-pattern-v1, form-validation-v1 |

Every agent automatically searches and applies relevant skills from [SKILLS_INVENTORY.md](./skills-library/SKILLS_INVENTORY.md).

---

## 🛡️ Safety Mechanisms

| Mechanism              | Purpose           | Trigger                |
| ---------------------- | ----------------- | ---------------------- |
| **File Guard**         | Scope enforcement | Out-of-scope edits     |
| **Architecture Guard** | Layer rules       | Wrong imports          |
| **Circuit Breaker**    | Failure detection | 3 consecutive failures |
| **70-Point Gate**      | Quality scoring   | <80% score             |

---

## 📖 Documentation

| Document                        | Purpose                         |
| ------------------- | ------------------------------- |
| `ARCHITECTURE-DIAGRAM.md` | Visual system architecture      |
| `AGENTS.md` | Core Command & Rule Reference   |
| `SYSTEM-OVERVIEW.md` | Concepts and philosophy         |
| `SKILLS_INVENTORY.md` | [Full Skills Inventory](./skills-library/SKILLS_INVENTORY.md) |
| `agents_prompts_index.md` | Official prompt registry        |

---

## 🔧 Framework Principles

> **Project-Agnostic**: Works across web apps, mobile, APIs  
> **Tech-Agnostic**: FastAPI, Express, Flutter, React, etc.  
> **Starter Framework**: Bootstrap quickly, scale safely

---

## 📊 System Status

| Component         | Status                              |
| ----------------- | ----------------------------------- |
| Agent System      | ✅ 4 agents active (8 specialized)  |
| Skills Library    | ✅ 33 skills, indexed               |
| Three-Layer SDLC  | ✅ All layers operational           |
| Safety Mechanisms | ✅ File/Architecture/Circuit guards |
| Documentation     | ✅ Complete                         |

---

## 🏗️ Project Structure

- **[project-management/](./project-management/)**: The Source of Truth.
  - `project/`: Foundation files (Vision, PRD, FRD, Epic Backlog).
  - `design/`: The Design Bible (Sitemap, Style Guide, Interaction Specs).
  - `epics/`: Active Epics containing scoped tickets and release-level hardening documents.
- **[web-applications/](./web-applications/)**: Core application codebases.
  - **[bob/](./web-applications/bob/)**: Framework Dashboard and Status (TUI/GUI context).
- **[ci/](./ci/)**: Tech-agnostic CI/CD pipeline scripts (Lint, Test, Security, Enforce Workflow). Configure via `ci/ci_config.sh`.
- **[packages/](./packages/)**: Shared libraries and tools (including MCP memory).
- **[skills/](./skills/)**: Custom AI instructions and domain-specific capabilities.
- **[.agent/rules/](./.agent/rules/)**: Specialized behavioral guidelines (JS, TDD, Product Management, etc.) and best-practice instructions.

## 🤝 For Human Operators

If you are a human managing this project, please refer to the dedicated guide for initialization, curation, and verification:

> [!TIP]
> **[HUMAN.md – The Human Operator's Manual](./HUMAN.md)**

---

MIT | Inspired by [AI DevKit](https://github.com/codeaholicguy/ai-devkit)
