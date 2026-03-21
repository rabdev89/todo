# SKILL: Breath-Based Parallel Execution

## Metadata
- **Category**: methodology
- **Scope**: universal
- **Difficulty**: Complex
- **Last Updated**: 2026-03-09
- **Effectiveness**: Very High

## Problem
Traditional linear execution (A -> B -> C) is slow and blocks downstream work unnecessarily. Developers often wait for a database schema to be "perfect" before writing a single line of API code, causing delays.

## Solution Overview
**Breath-Based Execution** organizes work into "Breaths" (phases of dependency). Tasks within the same Breath are **independent** and can be executed in parallel. The next Breath only starts when the previous one is verified.

## Implementation

### The Breath Structure

1.  **Breath 1: Foundation (Data & Models)**
    - Database Schema (SQL/Prisma)
    - Domain Models / Types
    - Core Utilities
    - *Verification: Schema validates, Types compile.*

2.  **Breath 2: Core Logic (API & Services)**
    - API Endpoints / Controllers
    - Service Layer Business Logic
    - Repository Layer
    - *Verification: Unit tests pass, API responds to mocks.*

3.  **Breath 3: Interface (UI & Integration)**
    - Frontend Components
    - State Management
    - Integration with API
    - *Verification: UI renders, E2E flows work.*

### Hard Rules
1.  **No Leaking**: Breath 2 code CANNOT exist until Breath 1 is verified.
2.  **Parallelism**: All tasks *within* a Breath MUST be executed in parallel if multiple agents/threads are available.
3.  **Stop-the-Line**: If verification fails at the end of a Breath, **do not proceed**. Fix it immediately.

## Workflow Integration

### Planning Phase
The `Planner Agent` must structure the `IMPLEMENTATION_PLAN.md` using Breaths:

```markdown
## Implementation Plan

### Breath 1: Foundation
- [ ] Create `User` table in Supabase
- [ ] Define `User` interface in `types.ts`

### Breath 2: Logic
- [ ] Implement `UserService.create()`
- [ ] Create `POST /users` endpoint

### Breath 3: UI
- [ ] Build `SignUpForm` component
- [ ] Connect form to API
```

### Execution Phase
The `Executor Agent` picks up all tasks in the current Breath.

## Examples

### Example: Building a Chat Feature

**Breath 1**:
- Create `messages` table.
- Define `Message` type.

**Breath 2**:
- Create `MessageService` (send, list).
- Implement WebSocket handler.

**Breath 3**:
- Build `ChatWindow` UI.
- Integrate socket client.

## Benefits
- **Speed**: UI team doesn't wait for API team; they just agree on the *contract* (Types) in Breath 1.
- **Focus**: Context switching is reduced; you focus on one layer at a time.
- **Safety**: You never build UI for an API that doesn't exist yet.

## Common Mistakes
- **Skipping Breaths**: Building UI before the database schema is final (leads to rework).
- **Giant Breaths**: Putting too much into one Breath (leads to merge conflicts).
