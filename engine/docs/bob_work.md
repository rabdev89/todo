# BOB — Implementation & Consolidated Phases (bob_work)

This document is the authoritative implementation summary for the BOB engine after the initial consolidation work. It contains:

- A concise but literal explanation of how BOB executes phases and actions in the engine.
- The updated phase/step layout after consolidation of early-phase checks and service startup.
- The action → handler mapping and where handlers live in the codebase.
- What was changed, how it was verified, and recommended next steps.

Use this file as the main developer-facing reference for the current BOB implementation.

---

## 1) How BOB literally works (engine runtime flow)

1. Phase definitions: `framework/phases_definition.json` contains the ordered list of phases, each with steps and a `required_action` for each step.

2. Engine orchestration: `engine/src/bob/bob_engine.ts` implements the main loop:
   - Loads current state via `BobStateManager.getCurrentState()` (reads `web-applications/bob/framework_status.json`).
   - Resolves the current phase and step definitions using `BobStateManager.getPhaseAndStep()` (reads `phases_definition.json`).
   - Calls `BobPhaseRouter.canAdvance()` to ensure gates are satisfied.
   - Marks the step as `running` and builds a context pack via `buildBobActionContextPack()`.
   - Executes the step's action using `BobEngine.executeAction()` which resolves the handler from the action registry (`getHandler(action)`).
   - On handler success: `BobStateManager.updateStepStatus()` → `BobStateManager.advanceState()` → `BobStateManager.updateMetrics()` → `BobDashboardGenerator.generate()`.
   - On handler failure: the engine records the failure via `BobStateManager.recordError()` and marks the step as `failed`.

3. Action handlers registry: `engine/src/bob/action_handlers/index.ts` maps action-name strings (e.g. `validate_repository_structure`) to functions exported from handler modules (e.g. `framework.ts`). The registry is the single source the engine uses to call behavior.

4. Handler contract: each handler implements the `ActionHandler` signature and returns an `ActionResult`:

   ```ts
   export const someHandler: ActionHandler = async (context) => ({
     success: boolean,
     data?: any,
     error?: string,
     logs?: string[]
   });
   ```

5. State persistence: `BobStateManager` reads/writes `web-applications/bob/framework_status.json`. The `reset()` routine rebuilds the status structure based on the current `phases_definition.json` (useful when definitions change).

6. Phase navigation: `BobStateManager.advanceState()` uses `next_step` values from phase definitions to move within a phase, and moves to the next phase when a step has no `next_step`.

---

## 2) Consolidations applied (what changed)

Work completed: we consolidated early framework checks and service startup to reduce redundant steps and centralize validation/startup logic. Specifically:

- Phase 1 (Framework Bootstrap): merged three steps into one
  - Before: `check_repo_integrity` (validate_repository_structure)
            `check_framework_version` (validate_framework_version)
            `run_self_diagnostics` (run_framework_diagnostics)
  - After: `check_framework_setup` → `validate_framework_setup`
    - Implementation: `validateFrameworkSetup` calls the three existing handlers and returns a combined result.

- Phase 2 (Framework Installation): merged service start into a single step
  - Before: `framework_start` (start_engine_services) + `engine_watchdog_start` (start_watchdog_service)
  - After: `initialize_services` → `initialize_services`
    - Implementation: `initializeServices` calls `startEngineServices` and `startWatchdogService` and returns combined status and logs.

Notes:
- The consolidation preserved user gates (Phase 4, Phase 6, Phase 10) and did not change any user-input behavior.
- The original individual handlers remain available in code; the registry now points to the consolidated handlers. This allows quick rollback by re-mapping registry entries if required.

---

## 3) Updated phases and steps (compiled view)

Below is the relevant portion of `phases_definition.json` after consolidation (early phases shown with consolidated steps):

- Phase: `framework_bootstrap`
  - Step: `check_framework_setup` — action: `validate_framework_setup` (combined repository/version/diagnostics)

- Phase: `framework_installation`
  - Step: `framework_install` — action: `initialize_services` (combined: install deps, env check, tests, health report, start services)

All subsequent phases (project_initialization, product_definition, technical_architecture, etc.) remain unchanged for now.

If you want a full regenerated, flattened list of all phases and steps, I can produce a JSON or human-readable table extracted from `framework/phases_definition.json`.

## 4) AI Driver (CLI Entry Points)

The `ai-engine` CLI provides direct access to specialized agents and engine utilities.

### Primary Entry Points
- **`npm run bob`**: Executes the high-level Bob orchestration loop (Phases 1-13).
- **`npm run ai-engine -- run <ticketId>`**: Runs the autonomous SDLC engine for a specific ticket.

### Specialized Agents (The Pipeline)
The engine supports a sequential pipeline of agents:
1. **`npm run ai-engine -- research <ticketId>`** → Mapping & discovery (`RESEARCH.md`).
2. **`npm run ai-engine -- plan <ticketId>`** → Implementation design (`BLUEPRINT.md`).
3. **`npm run ai-engine -- execute <ticketId>`** → Code implementation (`RECORD.md`).
4. **`npm run ai-engine -- verify <ticketId>`** → Independent validation (`VERIFICATION.md`).

Use **`npm run ai-engine -- pipeline <ticketId>`** to run the complete sequence automatically.

### Repository Intelligence
- **`npm run ai-engine -- index-repo`**: Build vector index for semantic search.
- **`npm run ai-engine -- search <query>`**: Semantic search across the repository.
- **`npm run ai-engine -- overview`**: Generate architectural insights and recommendations.

### Utility & Status
- **`npm run ai-engine -- status <ticketId>`**: Check ticket phase, metadata, and dependencies.
- **`npm run ai-engine -- next`**: Identify tickets ready for execution.
- **`npm run ai-engine -- context <ticketId>`**: Generate a compressed context pack.
- **`npm run ai-engine -- validate <ticketId>`**: Run File and Architecture guards manually.
- **`npm run ai-engine -- agent-status <ticketId>`**: Check status of agent-generated artifacts.

---

## 5) Flattened phases and steps (merged view)

Below is a flattened table of every phase and step generated from `framework/phases_definition.json`.

| Phase ID | Phase Name | Step ID | Step Name | Action | Next Step | Description |
|---|---|---|---|---|---|---|
| framework_bootstrap | Framework Bootstrap | check_framework_setup | Validate Framework Setup | validate_framework_setup | — | Run combined repository, version and diagnostics checks |
| framework_installation | Framework Installation | framework_install | Install & Initialize Framework | initialize_services | — | Install dependencies, validate environment, run tests, and start services |
| project_initialization | Project Initialization | detect_project_type | Detect Project Type | select_project_type | generate_project_context | Identify project type and select templates |
| project_initialization | Project Initialization | generate_project_context | Generate Project Context | generate_project_context | initialize_management_structure | Create tech_stack.json and environment configs |
| project_initialization | Project Initialization | initialize_management_structure | Initialize Management Structure | generate_project_management_structure | — | Create project folders and ticket templates |
| product_definition | Product Definition | vision_generation | Generate Vision Document | generate_vision_document | vision_review | Generate initial product vision document |
| product_definition | Product Definition | vision_review | Review Vision | user_review_vision | user_flow_creation | User reviews and approves product vision |
| product_definition | Product Definition | user_flow_creation | Create User Flow | generate_user_flow | user_flow_validation | Create user_flow.md with journey mapping |
| product_definition | Product Definition | user_flow_validation | Validate User Flow | validate_user_flow | requirements_alignment | Validate user flow logic and completeness |
| product_definition | Product Definition | requirements_alignment | Align Requirements | generate_requirements | — | Generate requirements from user flow |
| technical_architecture | Technical Architecture | architecture_design | Design Architecture | generate_architecture_design | tech_stack_validation | Generate system architecture design |
| technical_architecture | Technical Architecture | tech_stack_validation | Validate Tech Stack | validate_tech_stack | database_schema_planning | Validate tech stack compatibility |
| technical_architecture | Technical Architecture | database_schema_planning | Plan Database Schema | generate_database_schema | api_contract_definition | Design database schema and relationships |
| technical_architecture | Technical Architecture | api_contract_definition | Define API Contracts | generate_api_contracts | — | Define API structure and contracts |
| project_planning | Project Planning | epic_generation | Generate Epics | generate_epics | epic_review | Generate development epics from requirements |
| project_planning | Project Planning | epic_review | Review Epics | review_epics | ticket_generation | User validates and approves epics |
| project_planning | Project Planning | ticket_generation | Generate Tickets | generate_tickets | ticket_validation | Break epics into development tickets |
| project_planning | Project Planning | ticket_validation | Validate Tickets | validate_tickets | project_timeline_generation | Check ticket completeness and dependencies |
| project_planning | Project Planning | project_timeline_generation | Generate Project Timeline | generate_project_timeline | — | Generate development timeline and roadmap |
| development | Development | ticket_selection | Select Next Ticket | select_next_ticket | code_generation | Select next available ticket |
| development | Development | code_generation | Generate Code | generate_code | code_review_ai | Generate implementation code |
| development | Development | code_review_ai | AI Code Review | review_code | unit_test_generation | AI performs code review and quality checks |
| development | Development | unit_test_generation | Generate Unit Tests | generate_unit_tests | unit_test_execution | Generate unit tests for code |
| development | Development | unit_test_execution | Execute Unit Tests | run_tests | — | Execute unit tests and validate results |
| epic_hardening | Epic Hardening | integration_testing | Integration Testing | run_integration_tests | bug_fix_cycle | Test integrated features across components |
| epic_hardening | Epic Hardening | bug_fix_cycle | Bug Fix Cycle | fix_bugs | documentation_update | Fix discovered issues and regressions |
| epic_hardening | Epic Hardening | documentation_update | Update Documentation | update_documentation | epic_validation | Update documentation with changes |
| epic_hardening | Epic Hardening | epic_validation | Validate Epic Completion | validate_epic | — | Confirm epic completion and quality gates |
| pi_hardening | Program Increment Hardening | pi_hardening_combined | PI Hardening (combined) | pi_hardening_combined | — | Run system tests, perf tests, and security audits |
| uat | User Acceptance Testing | uat_environment_setup | Setup UAT Environment | setup_continue_project_uat | uat_execution | Prepare staging environment for UAT |
| uat | User Acceptance Testing | uat_execution | Execute UAT | run_uat | uat_feedback_collection | Execute user acceptance tests |
| release_preparation | Release Preparation | release_preparation_combined | Release Preparation (combined) | release_preparation_combined | — | Generate release notes and deployment scripts |
| deployment | Deployment | production_deployment | Production Deployment | deploy_to_production | deployment_verification | Deploy application to production |
| deployment | Deployment | deployment_verification | Verify Deployment | verify_deployment | — | Verify deployment success and health |

---

## 6) Files changed (implementations)

- `engine/src/index.ts`: Unified CLI entry point (`ai-engine`).
- `engine/src/bob/action_handlers/index.ts`: Action registry with consolidated steps.
- `engine/src/agents/`: Implementations for Researcher, Planner, Executor, and Verifier.
- `engine/src/repo_intelligence/`: Semantic search and repository indexing engine.

---

## 7) Verification summary

1. **State Reset**: `BobStateManager.reset()` rebuilt `framework_status.json` with the new step IDs.
2. **Action Execution**: Executed `validate_framework_setup` and confirmed composed result (repo checks, version, diagnostics).
3. **Automation Run**: Ran `BobEngine.run({auto:true})` to progress framework through installation.
4. **Final State**: Confirmed `framework_status.json` reflects completed bootstrap/installation and advanced to `project_initialization`.

---

## 8) Recommended next actions

- **Tests**: Expand unit tests for `validateFrameworkSetup` and `initializeServices` to cover failure scenarios.
- **Consolidation**: Apply similar consolidation patterns to `pi_hardening` and `release_preparation` (work in progress).
- **Telemetry**: Add execution duration metrics to help optimize long-running steps.

---

## 9) Appendix — quick commands

Reset status and run engine (PowerShell):
```powershell
cd engine
npx tsx -e "import('./src/state_manager').then(m=>m.StateManager.reset())"
npx tsx src/index.ts bob
```

Run agent pipeline for a ticket:
```powershell
npm run start -- pipeline T-001
```
