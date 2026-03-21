---
description: Execute Bob framework orchestration workflow
---

# Bob Framework Workflow

Execute the Bob orchestration engine to advance through the AI-assisted development framework phases.

## When to Use

Use this workflow when you want to:
- Initialize or continue framework setup
- Advance to the next phase/step in the workflow
- Check current framework status
- Reset the framework state

## Prerequisites

- Engine must have dependencies installed (`npm install` in `engine/` directory)
- `framework/phases_definition.json` and `framework/framework_status.json` must exist

## Workflow Steps

### 1. Check Current Status

// turbo
```bash
cd engine && npm run start -- bob-status
```

### 2. Execute Next Step

// turbo
```bash
cd engine && npm run start -- bob
```

### 3. Handle User Input (if required)

If the step requires user input:
- Review the dashboard at `framework/dashboard.md`
- Make necessary changes (select project type, review documents, etc.)
- Run the workflow again to continue

## Available Commands

| Command | Description |
|---------|-------------|
| `npm run start -- bob` | Execute next step |
| `npm run start -- bob --auto` | Run continuously until blocked |
| `npm run start -- bob --reset` | Reset to initial state |
| `npm run start -- bob-status` | Show current status |

## Workflow Phases

1. **Framework Bootstrap** - Verify repository and framework integrity
2. **Framework Installation** - Install dependencies and start services
3. **Project Initialization** - Set up project type and structure
4. **Product Definition** - Create vision, user flow, requirements
5. **Technical Architecture** - Design system architecture
6. **Project Planning** - Generate epics and tickets
7. **Development** - Implement features
8. **Epic Hardening** - Integration testing and bug fixes
9. **PI Hardening** - System testing and security audit
10. **UAT** - User acceptance testing
11. **Release Preparation** - Generate release artifacts
12. **Deployment** - Deploy to production
13. **Post-Launch Monitoring** - Setup monitoring

## Project Types

- `new_project` - Full 13-phase workflow
- `continue_project` - Skips bootstrap/installation
- `framework_migration` - Skips just bootstrap
- `quick_task` - Lean mode (development only)

## Examples

### Start a new project
```
/bob
# Follow prompts to select project type
# Continue running /bob until complete
```

### Continue existing work
```
/bob
# Framework will detect current phase and continue
```

### Reset and start over
```
# First reset the framework
cd engine && npm run start -- bob --reset

# Then run normally
/bob
```

## Troubleshooting

### "Framework status file not found"
Run `npm run start -- bob --reset` to initialize the framework state.

### "No handler found for action"
The action may not be fully implemented yet. Check the documentation for available features.

### Dependencies not installed
```bash
cd engine
npm install
```

## Dashboard

The framework generates a dashboard at `framework/dashboard.md` showing:
- Current phase and step
- Progress percentage
- Next steps
- User action requirements

## Integration with Existing Engine

Bob orchestration integrates with existing engine tools:
- **ContextBuilder** - Generates AI context packs for tickets
- **FileGuard** - Enforces file scope during development
- **DependencyEngine** - Manages ticket dependencies
- **StateManager** - Tracks ticket metadata

## Notes

- Each step must complete successfully before advancing
- User approval gates pause the workflow for human input
- Use `--auto` flag carefully - it runs until completion or user input required
- The framework is deterministic - same state always produces same next step
