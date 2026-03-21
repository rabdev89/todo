# AI Development Runtime - Engine

The execution engine for AI-assisted development. Enforces governance, manages dependencies, and controls AI context.

## Overview

This engine transforms your AI development framework from documentation into an operational system with:

- **Phase Runner**: Enforces SDLC phase progression
- **Dependency Engine**: DAG-based ticket execution ordering
- **File Guard**: Prevents unauthorized file modifications
- **Architecture Guard**: Enforces layer boundaries
- **Architecture Registry**: Persistent module structure tracking (Phase 6)
- **Context Builder**: Generates focused AI context packs
- **Context Compression**: Token optimization for AI context (Phase 6)
- **Learning Layer**: Captures telemetry for continuous improvement

## Installation

```bash
cd engine
npm install
```

> **⚠️ REQUIRED: You must actively use this system.** This is not an automatic background tool. Tickets need `metadata.json` files with proper schema, and you must run CLI commands to enforce governance. See [Usage Requirements](#usage-requirements) below.

## Usage Requirements

To effectively utilize this system, you must:

* Actively run CLI commands to enforce governance and advance phases
* Ensure tickets have proper `metadata.json` files with the required schema
* Regularly check the status of tickets and dependencies
* Use the system to generate context and validate file scope

## CLI Commands

> 📄 **Full command reference:** [engine/docs/ai_engine.md](docs/ai_engine.md)

```bash
# Quick start examples
npm run start -- run T-123        # Autonomous SDLC execution
npm run start -- status T-123     # Check ticket status
npm run start -- validate T-123   # Run all guards
npm run start -- next             # List ready tickets
```

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      CLI Layer                               │
│  (commands: run, status, deps, context, validate, insights) │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                   Governance Layer                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Phase Runner │  │    State     │  │  Validation  │      │
│  │              │  │   Manager    │  │   Runner     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                   Execution Layer                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Dependency  │  │   Context    │  │   Learning   │      │
│  │   Engine     │  │   Builder    │  │    Layer     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│  ┌──────────────┐  ┌──────────────┐                        │
│  │ Architecture │  │   Context    │                        │
│  │   Registry   │  │ Compression  │                        │
│  └──────────────┘  └──────────────┘                        │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                    Safety Layer                              │
│  ┌──────────────┐  ┌──────────────┐                        │
│  │  File Guard  │  │   Architecture │                    │
│  │              │  │     Guard       │                    │
│  └──────────────┘  └──────────────┘                        │
└─────────────────────────────────────────────────────────────┘
```

## Configuration

### Ticket Metadata Schema

Tickets must include a `metadata.json` with:

```json
{
  "ticket_id": "T-123",
  "title": "Implement login service",
  "status": "draft",
  "ticket_type": "feature",
  "current_phase": "requirements",
  "depends_on": ["T-100", "T-101"],
  "file_scope": {
    "allowed": ["src/services/authService.ts", "tests/authService.test.ts"],
    "excluded": []
  },
  "layer": "service"
}
```

### Architecture Rules

Create `engine/config/architecture_rules.json`:

```json
{
  "layers": [
    {
      "name": "ui",
      "patterns": ["src/ui/**/*", "src/components/**/*"],
      "allowedImports": ["service", "model", "utils"],
      "description": "UI layer"
    },
    {
      "name": "service",
      "patterns": ["src/services/**/*"],
      "allowedImports": ["model", "utils", "infra"],
      "description": "Business logic"
    },
    {
      "name": "model",
      "patterns": ["src/models/**/*"],
      "allowedImports": ["utils"],
      "description": "Data models"
    }
  ],
  "strictMode": false,
  "excludePatterns": ["**/*.test.*"]
}
```

### Architecture Registry Configuration

The architecture registry stores module metadata in `engine/architecture/registry.json`:

```json
{
  "version": "1.0.0",
  "projectName": "my-project",
  "lastUpdated": "2024-01-15T10:30:00Z",
  "modules": {
    "AuthService": {
      "name": "AuthService",
      "type": "service",
      "primaryFile": "src/services/auth.ts",
      "secondaryFiles": ["src/types/auth.ts"],
      "description": "Handles user authentication",
      "responsibilities": ["login", "logout", "token-refresh"],
      "dependencies": ["UserRepository", "TokenManager"],
      "exposedInterfaces": ["login", "logout", "refreshToken"],
      "createdAt": "2024-01-10T08:00:00Z",
      "updatedAt": "2024-01-15T10:30:00Z",
      "tickets": ["T-042", "T-055"]
    }
  },
  "patterns": {
    "naming": {
      "service": "*Service.ts",
      "manager": "*Manager.ts",
      "repository": "*Repository.ts"
    },
    "structure": {
      "services": ["src/services/**/*"],
      "models": ["src/models/**/*"]
    }
  }
}
```

## How It Works

### 1. Dependency Enforcement

Tickets declare dependencies via `depends_on`. The engine:
- Builds a DAG from all tickets
- Detects cycles
- Only allows execution when dependencies are `completed`

```bash
# Check if ticket can execute
npm run start -- status T-123
# Shows: Can execute: ✗ No, Blocked by: T-100
```

### 2. File Scope Enforcement

Tickets declare allowed files via `file_scope.allowed`. The engine:
- Checks git diff against allowed patterns
- Blocks commits that modify out-of-scope files
- Supports glob patterns

```bash
# Preview what files a ticket can modify
npm run start -- validate T-123
```

### 3. Architecture Enforcement

Layer rules prevent architectural erosion:
- UI cannot import database layer
- Services cannot import UI components
- Each layer has allowed import targets

### 4. Context Generation

AI receives focused context instead of reading arbitrary files:

```bash
# Generate .context/T-123.md
npm run start -- context T-123
```

Context includes:
- Ticket goal and current phase
- Dependency files (for reference)
- Allowed files (scope)
- Architecture rules for the layer
- Project documentation links

### 5. Architecture Registry (Phase 6)

Persistent module structure tracking prevents code duplication and architectural drift:

```bash
# Register a new module
npm run start -- architecture register AuthService service src/services/auth.ts \
  --description "Handles authentication" \
  --responsibilities "login,logout,token-refresh"

# Query existing modules
npm run start -- architecture query --type service

# Check for existing modules before creating new ones
npm run start -- architecture suggest "user authentication" --type service

# Auto-detect modules from codebase
npm run start -- architecture update --scan

# Export documentation
npm run start -- architecture export --output ARCHITECTURE.md
```

**Benefits:**
- Prevents service fragmentation (e.g., authService.ts, authManager.ts, tokenService.ts)
- Tracks module dependencies
- Suggests existing modules for new responsibilities
- Maintains architecture state across many tickets

### 6. Context Compression (Phase 6)

Reduces AI token usage from ~20k to ~800-1500 tokens per ticket:

```bash
# Generate compressed context
npm run start -- context T-123 --compress
```

**Compression strategies:**
- Summarizes large files (>50 lines)
- Extracts only key sections (imports, exports, types, signatures)
- Phase-specific context subsets
- Smart file selection via Architecture Registry

**Token savings:**
- Without compression: ~10k-20k tokens
- With compression: ~800-1500 tokens
- Typical savings: 80-90%

### 7. Learning System

After each ticket completes, the engine records:
- Files modified
- Phases executed
- Attempts (circuit breaker tracking)
- Duration
- Pass/fail status

```bash
# View insights
npm run start -- insights
```

Insights include:
- File volatility (most changed files)
- Phase failure rates
- Architecture coupling detection
- Ticket complexity recommendations

## Integration with AI Workflow

### Standard Workflow

1. **Create ticket** with dependencies and file scope
2. **Check status**: `ai-engine status T-123`
3. **Generate context**: `ai-engine context T-123`
4. **AI reads context** from `.context/T-123.md`
5. **AI implements** within file scope
6. **Validate**: `ai-engine validate T-123`
7. **Run engine**: `ai-engine run T-123` (advances phase)
8. **Repeat** until complete

### Circuit Breaker

If validation fails 3 times:
- Circuit breaker triggers
- Human intervention required
- Failure count tracked in metadata

## Tech Agnostic Design

The engine works with any tech stack:

- **Web projects**: Patterns like `src/components/**/*`, `src/services/**/*`
- **Mobile**: `lib/ui/**/*`, `lib/services/**/*`
- **Backend**: `internal/handlers/**/*`, `internal/models/**/*`
- **Multi-language**: Supports TS, JS, Python, Dart, Rust import parsing

Configure via `architecture_rules.json` and ticket `file_scope`.

## File Structure

```
engine/
├── src/
│   ├── index.ts                    # CLI entry point
│   ├── phase_runner.ts             # Phase orchestration
│   ├── state_manager.ts            # Ticket metadata I/O
│   ├── validation_runner.ts        # CI verification hook
│   ├── dependency_engine.ts        # DAG and dependency logic
│   ├── file_guard.ts               # File scope enforcement
│   ├── architecture_guard.ts       # Layer/import validation
│   ├── architecture_registry.ts    # Persistent module tracking (Phase 6)
│   ├── context_builder.ts          # AI context generation
│   ├── context_compression.ts      # Token optimization (Phase 6)
│   ├── learning_layer.ts           # Telemetry and analytics
│   ├── agent_orchestrator.ts       # Agent coordination
│   ├── skills_library.ts           # Skills discovery
│   ├── parallel/                   # Parallel execution utils
│   ├── repo_intelligence/          # Code indexing and search
│   ├── session/                    # Session management
│   ├── schemas/
│   │   └── ticket_schema.ts        # Zod validation schemas
│   └── cli/commands/
│       ├── architecture.ts         # Architecture registry CLI
│       ├── context.ts              # Context generation CLI
│       ├── index-repo.ts           # Repository indexing
│       ├── search.ts               # Code search commands
│       ├── research.ts             # Research agent commands
│       ├── session.ts              # Session management CLI
│       ├── framework-test.ts       # Health checks
│       ├── framework-start.ts     # Service startup
│       └── project-init.ts        # Project initialization
├── architecture/                   # Architecture registry data
│   └── registry.json               # Module definitions
├── config/
│   └── architecture_rules.json     # Layer rule configuration
├── commands.json                   # Machine-readable command registry
├── commands.schema.json            # Command registry schema
├── package.json
└── tsconfig.json
```

## License

MIT
