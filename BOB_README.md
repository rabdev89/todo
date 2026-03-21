# Bob Framework Orchestration

Audience: **human operators and engine maintainers**.

Agents should use `bob_agent_collaboration.md` and `AGENTS.md` for their /bob collaboration contract.

**Bob** is a collaborative orchestration system that enables seamless workflow between Bob (the planner) and IDE AI agents (the executors). It transforms AI-assisted development into an autonomous engine that manages the entire SDLC.

## 🚀 Quick Start

The main entry point for the orchestration system is the `/bob` slash command, which resolves to the Bob Engine.

```bash
# Execute single orchestration step (Recommended)
/bob run

# Run specific ticket execution
/bob run T-XXX

# Run continuously until blocked (Auto-pilot)
npm run start -- orchestrate --auto

# Reset framework state (Emergency only)
npm run start -- bob --reset
```

## 🤖 What is Bob?

Bob transforms AI-assisted development from reactive conversations into proactive, orchestrated workflows:

- **Collaborative Execution** - Bob plans steps, AI agents execute safely.
- **8 Specialized Agents** - Specialized behavior for research, planning, security, and UI.
- **33 Stack-Agnostic Skills** - Automated pattern discovery and application.
- **Intelligent Error Handling** - Autonomous fixes for common issues (npm install, retries).
- **User Input Gates** - Clear guidance via `dashboard.md` when human decisions are needed.
- **State Persistence** - Tracks progress across sessions in `framework_status.json`.
- **Live Dashboard** - Real-time status and next steps in `web-applications/bob/dashboard.md`.

## Architecture

```
User Input / CLI
      │
      ▼
OrchestrationController
      │
      ├─ OrchestrationLoop
      │   ├─ reads framework_status.json
      │   ├─ determines current phase/step
      │   ├─ gets recommended commands
      │   └─ executes via CommandExecutor
      │
      ├─ ErrorHandler (autonomous fixes)
      ├─ ResultReporter (status updates)
      └─ Dashboard Generator (user guidance)
```

## Core Components

### Orchestration Loop

- **orchestration_loop.ts** - Main workflow logic
- Reads current framework state
- Determines next actions
- Executes commands safely
- Handles user input requirements

### Command Execution

- **command_executor.ts** - Safe command execution with timeout
- **error_handler.ts** - Autonomous error fixing (dependencies, retries)
- **result_reporter.ts** - Status updates and workflow advancement

### State Management

- **framework_status.json** - Current workflow state
- **phases_definition.json** - Workflow phase definitions
- **dashboard.md** - Generated user guidance

### CLI Integration

- **orchestrate.ts** - Commander.js CLI command
- Options: `--auto`, `--single`, `--max-steps`, `--no-prompt`

## 📑 The 13 Phases

| Phase | Name                   | Description                     | Skippable |
| :---- | :--------------------- | :------------------------------ | :-------- |
| 1     | Framework Bootstrap    | Verify repository integrity     | No        |
| 2     | Framework Installation | Install dependencies            | No        |
| 3     | Project Initialization | Set up project                  | Yes       |
| 4     | Product Definition     | Vision, user flow, requirements | No        |
| 5     | Technical Architecture | Design system                   | No        |
| 6     | Project Planning       | Generate epics/tickets          | No        |
| 7     | Development            | Implement features              | No        |
| 8     | Epic Hardening         | Integration testing             | Yes       |
| 9     | PI Hardening           | System testing                  | Yes       |
| 10    | UAT                    | User acceptance testing         | Yes       |
| 11    | Release Preparation    | Generate artifacts              | Yes       |
| 12    | Deployment             | Deploy to production            | No        |
| 13    | Post-Launch Monitoring | Setup monitoring                | Yes       |

## ⌨️ Commands

### CLI Commands

```bash
# Main orchestration command (Recommended)
/bob run

# Run specific ticket
/bob run T-XXX

# Run continuously until blocked
npm run start -- orchestrate --auto

# Execute only one step
npm run start -- orchestrate --single

# Run with limited steps
npm run start -- orchestrate --max-steps 3

# Run without user prompts
npm run start -- orchestrate --auto --no-prompt

# Check framework status
npm run start -- bob-status

# Reset framework state
npm run start -- bob --reset
```

### Command Options

- `--single` - Execute only one step and exit.
- `--auto` - Run continuously until blocked or completed.
- `--max-steps <number>` - Limit maximum steps to run (default: 10).
- `--no-prompt` - Skip user input prompts (for automated runs).

## User Input Gates

The orchestration system automatically detects when human input is required and generates comprehensive guidance in `dashboard.md`. Common user input scenarios:

1. **Project Type Selection** - Choose between new project, continuation, or migration
2. **Vision Review** - Review and approve generated vision documents
3. **User Flow Validation** - Confirm user journey mappings
4. **Epic Review** - Validate generated project epics
5. **UAT Execution** - Perform user acceptance testing

When user input is required:

1. Orchestration pauses
2. Dashboard is updated with detailed instructions
3. User completes the required action
4. Run orchestration again to continue

## Error Handling

The system includes autonomous error recovery:

- **Dependency Issues** - Automatically runs `npm install`
- **Command Timeouts** - 30-second timeout with retry logic
- **Permission Errors** - Attempts to fix common permission issues
- **Network Failures** - Retry with exponential backoff

Unrecoverable errors are reported to the dashboard for manual intervention.

## State Files

### framework/phases_definition.json

Defines the workflow phases, steps, and required actions. Maps each step to specific commands that should be executed.

### framework/framework_status.json

Tracks current workflow state:

- Current phase and step
- Execution status (pending, running, waiting_user, completed, failed)
- Project configuration (type, name)
- Error history and metrics

### web-applications/bob/dashboard.md

Auto-generated user guidance document containing:

- Current phase and step details
- Progress indicators
- Recommended next actions
- Detailed instructions for user input requirements

## Command Mapping

Actions are mapped to commands via `engine/src/shared/command_mapping.ts`, which is synced with the BOB_COMMANDS_MAPPING_TABLE. This ensures consistent command execution across the framework.

## 📁 File Structure

```
bob-ai/
├── engine/
│   └── src/
│       ├── orchestration/
│       │   ├── orchestration_loop.ts      # Main workflow logic
│       │   ├── command_executor.ts        # Safe command execution
│       │   ├── error_handler.ts           # Autonomous error fixing
│       │   ├── result_reporter.ts         # Status updates
│       │   └── orchestration_controller.ts # Main controller
│       ├── shared/
│       │   └── command_mapping.ts         # Action → command mapping
│       ├── bob/
│       │   ├── state_manager.ts           # State I/O operations
│       │   ├── phase_router.ts            # Phase navigation
│       │   ├── dashboard_generator.ts     # Dashboard creation
│       │   └── action_handlers/           # Legacy action handlers
│       └── cli/commands/
│           └── orchestrate.ts             # CLI command
├── framework/
│   ├── phases_definition.json             # Phase definitions
│   ├── framework_status.json              # Runtime state
│   └── dashboard.md                       # Generated dashboard
└── web-applications/bob/
    └── dashboard.md                       # User guidance
```

## Integration with Existing Engine

The orchestration system integrates with existing engine components:

- **BobStateManager** - Reads/writes framework status
- **BobPhaseRouter** - Determines current phase/step position
- **Dashboard Generator** - Creates user guidance documents
- **Command Mapping** - Maps actions to executable commands

## 🛠️ Troubleshooting

### "Framework status file not found"

```bash
cd engine
npm run start -- bob --reset
```

### Command execution fails

- Check that the command exists in `command_mapping.ts`.
- Verify the action is defined in `phases_definition.json`.
- Ensure dependencies are installed.

### User input not detected

- Check `framework_status.json` for `status: "waiting_user"`.
- Verify `dashboard.md` contains guidance.
- Run orchestration again after completing user action.

### Build errors

```bash
cd engine
npm install
npm run build
```

---

## 🗺️ Roadmap

- [x] Core orchestration loop
- [x] Command execution with error handling
- [x] User input detection and dashboard generation
- [x] CLI integration
- [x] Shared command mapping
- [ ] Full action handler implementations
- [ ] Advanced error recovery patterns
- [ ] Multi-step transaction support
- [ ] Workflow visualization
- [ ] Performance monitoring

---

## 📝 Extending the System

### Modifying Workflow Phases

1. Edit `framework/phases_definition.json` to add/modify phases or steps.
2. Update action mappings if needed.
3. Test the workflow changes.

### Adding Error Recovery

1. Extend `error_handler.ts` with new recovery patterns.
2. Update `command_executor.ts` if needed.
3. Test error scenarios.

---

## 📄 License

MIT
