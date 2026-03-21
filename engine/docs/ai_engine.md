# AI Engine Commands & Gap Analysis

This document tracks the status of `ai-engine` CLI commands and their integration with the underlying agent framework.

## 🚀 Core SDLC Engine
Commands that manage the lifecycle of a ticket through the Three-Layer SDLC.

| Command | Description | Used by BOB? | Validated | Status | Details |
|---------|-------------|--------------|-----------|--------|---------|
| `run <ticketId>` | Orchestrates **Zero-Touch** SDLC | Yes | Yes | ✅ Autonomous | Fully automated recursive phase advancement. |
| `status <ticketId>` | Show current status and phase | Yes | Yes | ✅ Integrated | View ticket metadata and progress. |
| `deps <ticketId>` | Show ticket dependency tree | Yes | Yes | ✅ Integrated | Visualizes blockers and dependencies. |
| `next` | List tickets ready for execution | Yes | Yes | ✅ Integrated | Shows unblocked tickets in queue. |
| `context <ticketId>` | Generate AI context pack | Helper | Yes | ✅ Functional | Concentrates relevant files for AI. |
| `validate <ticketId>` | Run guards without advancing | No | Yes | ✅ Functional | Manual scope and architecture checks. |
| `insights` | Show learning metrics | No | Yes | ✅ Functional | Displays data from the Learning Layer. |

## 🔬 Repository Intelligence (RI)
Commands for codebase understanding, pattern detection, and semantic search.

| Command | Description | Used by BOB? | Validated | Status | Details |
|---------|-------------|--------------|-----------|--------|---------|
| `research <ticketId>` | Discovers context and patterns | Yes | Yes | ✅ Bridged | Now bridges to `ResearcherAgent`. |
| `overview` | Project-wide analysis | Helper | Yes | ✅ Bridged | High-level patterns and stats. |
| `index-repo` | Index codebase for search | Yes | Yes | ✅ Integrated | Required for semantic search. |
| `search <query>` | Semantic search (Vector DB) | Yes | Yes | ✅ Integrated | Finding relevant code by meaning. |
| `symbols <query>` | Semantic symbol search | Yes | Yes | ✅ Integrated | Specific class/function discovery. |
| `dependents <s>` | Find symbol dependents | Yes | Yes | ✅ Integrated | Impact analysis for changes. |
| `embed` | Generate all embeddings | Maintenance| Yes | ✅ Integrated | Manual vector sync for RI. |
| `stats` | Show RI index statistics | Helper | Yes | ✅ Integrated | Debugging vector db status. |

## 🤖 Agent System
Commands that invoke specialized agents for specific development phases.

| Command | Description | Used by BOB? | Validated | Status | Details |
|---------|-------------|--------------|-----------|--------|---------|
| `plan <ticketId>` | Create implementation blueprint | Yes | Yes | ✅ Bridged | Calls `PlannerAgent` -> `design/README.md`. |
| `execute <ticketId>` | Implement code changes | Yes | Yes | ✅ Bridged | Calls `ExecutorAgent` -> `RECORD.md`. |
| `verify <ticketId>` | Independent verification | Yes | Yes | ✅ Bridged | Calls `VerifierAgent` -> `VERIFICATION.md`. |
| `agent-status <t>` | Check execution artifact status | Helper | Yes | ✅ Functional | Visual tracker for agent outputs. |
| `agents` | List available agents | Helper | Yes | ✅ Functional | Documentation helper for personas. |

## 🛠️ Framework & Maintenance
Infrastructure and project setup commands.

| Command | Description | Used by BOB? | Validated | Status | Details |
|---------|-------------|--------------|-----------|--------|---------|
| `project-init` | Initialize/Migrate a project | Setup | Yes | ✅ Functional | Sets up folders and `tech_stack.json`. |
| `framework-start` | Start docker/local services | DevOps | Yes | ✅ Functional | Initializes Qdrant and health checks. |
| `framework-test` | Run health check & generate report | Yes | Yes | ✅ Integrated | Validates system readiness. |
| `session` | Manage persistence session | Yes | Yes | ✅ Integrated | Stores execution history in SQLite. |
| `bob` | Start Bob orchestration | Orchestrator| Yes | ✅ Integrated | Main framework entry point. |
| `bob --rollback` | Rollback framework state | Orchestrator| Yes | ✅ Integrated | Securely rewinds state manager logically by one step. |
| `architecture` | Manage architectural registry | No | Yes | ✅ Functional | Registry for pattern enforcement. |

## Gap Summary

1. **Zero-Touch Maturity**: The `run` command is now fully autonomous, recursively invoking agents (`Planner`, `Executor`, `Verifier`) and transitioning phases without manual intervention.
2. **Redundancy Removed**: `repo-research` was successfully deprecated and merged into `research`.
3. **Advanced Guards**: `validate` and `architecture` commands are available for manual use but could be more deeply integrated into the automated `run` loop.
4. **Learning Loop**: `insights` is functional but requires more user-accessible visualization in the Bob Dashboard.
