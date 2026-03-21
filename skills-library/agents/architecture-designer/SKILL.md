# SKILL: Architecture Designer (The "Design Phase" Upgrade)

## Metadata
- **Category**: agents
- **Scope**: universal
- **Difficulty**: Complex
- **Last Updated**: 2026-03-09
- **Effectiveness**: Critical

## Problem
Developers often start coding without defining the "System Architecture" first. This leads to tech debt: wrong database choices, poorly defined APIs, inconsistent state management, and scalability issues.

## Solution Overview
The **Architecture Designer** skill forces a dedicated "System Design" phase. It focuses on **decisions** (ADRs), **data flow**, and **boundaries**. It does NOT care about UI pixels (that's `/design-ui`).

## Implementation

### Files to Create
| File | Purpose | Layer |
|------|---------|-------|
| `DESIGN.md` | The definitive system architecture for the ticket/epic | Design |
| `ADR-XXX.md` | Architectural Decision Records (Why we chose X over Y) | Documentation |

### Core Components

1.  **System Context**:
    - Who are the actors? (Users, Admins, 3rd Party APIs)
    - What are the boundaries? (Frontend, Backend, Database)

2.  **Data Flow**:
    - Sequence Diagrams (Mermaid) showing how data moves.
    - Example: `User -> API (POST /login) -> Auth Service -> DB (Check PW)`

3.  **Decision Log (ADR)**:
    - **Context**: "We need to store user sessions."
    - **Options**: "Redis vs. JWT vs. Database."
    - **Decision**: "Use JWT (Stateless) because we need horizontal scaling."
    - **Consequences**: "Logout is harder; need blacklist mechanism."

### Hard Rules
1.  **Zero Ambiguity**: APIs must be defined (method, path, request/response body) BEFORE implementation.
2.  **Trade-offs Explicit**: Every major tech choice must explain *why* alternatives were rejected.
3.  **Scalability Check**: Ask "What happens if 10k users do this at once?"

## Workflow Integration

### Trigger
- `/review-design` command
- Start of any "Track B (Full)" ticket

### Output
The Planner uses this skill to generate `DESIGN.md`:

```markdown
# System Design: Order Processing

## Data Flow
[Mermaid Sequence Diagram]

## API Contract
- `POST /orders`: Creates pending order
- `GET /orders/:id`: Returns order status

## Decisions
- Using BullMQ for async processing (to handle spikes)
- Storing order events in Postgres (Audit trail)
```

## Comparison with UI Designer
- **Architecture Designer**: "The API returns `{ status: 'pending' }`."
- **UI Designer**: "The pending status badge is yellow with 12px font."

## Common Mistakes
- **Assuming "It's Simple"**: Even simple features need a defined data flow.
- **Skipping Failure Modes**: Designing only the "Happy Path" (what if the DB is down?).
- **Vague APIs**: "We'll have an endpoint for orders" (needs specific JSON schema).
