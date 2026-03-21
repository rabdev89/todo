# Workflow Decision Gate

**MANDATORY**: Every ticket must pass through this gate BEFORE starting work.

This determines whether you use **Track A (Lean)** or **Track B (Full)** workflow.

---

## Decision Matrix

Answer these questions in order. The FIRST "yes" determines your track.

### Quick Decision Table

| Condition                                                                 | Track      |
|--------------------------------------------------------------------------|------------|
| Touches DB schema, external APIs, auth, payments, or PII                 | Track B    |
| Modifies shared types/interfaces, global config, or env variables        | Track B    |
| New feature (not a small tweak), or architectural refactor               | Track B    |
| Integration with external service, ML/algorithmic work, perf-critical    | Track B    |
| Uncertain scope or expected effort ≥ 4 hours                             | Track B    |
| Simple bug fix in a single file, no schema/API change, < 4 hours         | Track A    |

When in doubt, default to **Track B (Full)** unless the human explicitly says otherwise.

### Question 1: Scope Check
**Does this work touch 3+ files OR modify shared state?**
- Database schema changes? → **TRACK B (Full)**
- API/GraphQL contract changes? → **TRACK B (Full)**
- Shared type definitions or interfaces? → **TRACK B (Full)**
- Global configuration or env variables? → **TRACK B (Full)**
- Authentication or authorization logic? → **TRACK B (Full)**

**If yes to any above**: Stop here. → **TRACK B (Full)**

### Question 2: Complexity Check
**Even if < 3 files, is this complex?**
- New feature (not existing feature modification)? → **TRACK B (Full)**
- Architectural change or refactor? → **TRACK B (Full)**
- Machine learning or algorithm implementation? → **TRACK B (Full)**
- Integration with external service? → **TRACK B (Full)**
- Performance-critical or security-sensitive code? → **TRACK B (Full)**

**If yes to any above**: Stop here. → **TRACK B (Full)**

### Question 3: Estimated Effort
**If you've reached here, how long will this take?**
- < 4 hours with high confidence? → **TRACK A (Lean)**
- 4+ hours OR uncertain? → **TRACK B (Full)**

---

## Track Assignment

### ✅ TRACK A (Lean)
**Use when:**
- Bug fix in single component/file
- Small UI tweak or copy change
- Simple logic update (no schema/API impact)
- < 4 hours effort, high confidence

**Minimal docs**: `implementation_plan.md` only

**Estimated time**: Hours to 1 day including docs and testing

### 📋 TRACK B (Full)
**Use when:**
- New feature implementation
- Multi-file changes
- Schema/API/type changes
- Architecture decisions
- Uncertain scope or long effort estimate

**Full documentation**: requirements, design, planning, testing, code review

**Estimated time**: Days to weeks

---

## Implementation Steps

### 1. Initial Decision (5 minutes)
- [ ] Answer all three questions above
- [ ] Record decision in ticket folder as `TRACK_DECISION.md`:

```markdown
# Track Decision for [Ticket ID]

**Decision**: Track [A/B]

**Reasoning**: [2-3 sentences explaining which criteria triggered this decision]

**Date**: [Today]
**Decided by**: [Name]
```

### 2. Proceed with Correct Track
- [ ] **Track A**: Start `implementation_plan.md`, proceed to code
- [ ] **Track B**: Initialize full ticket structure, start requirements phase

### 3. Lock In Decision
- [ ] Track decision made explicit before any code written
- [ ] Shared with user if in semi-autonomous mode
- [ ] Cannot change tracks mid-execution without escalation

---

## Decision Examples

### Example 1: Bug Fix
**Issue**: Sidebar doesn't close on mobile when user taps outside

**Files to change**: 1 file (`components/Sidebar.tsx`)

**Questions**:
1. Scope Check: No schema/API/type changes → No
2. Complexity Check: Simple click handler fix → No
3. Effort: 1 hour → < 4 hours → **TRACK A (Lean)**

**Decision**: Track A — bug fix, single file, quick fix

---

### Example 2: New Feature
**Issue**: Add dark mode toggle to app

**Files to change**: 10+ (components, context, CSS variables, storage)

**Questions**:
1. Scope Check: Global theme context → Yes → **TRACK B (Full)**

**Decision**: Track B — architectural change, multiple files, new feature

---

### Example 3: Uncertain Scope
**Issue**: Refactor authentication flow

**Files to change**: Unknown (might be 3-10)

**Questions**:
1. Scope Check: Auth logic change → Yes → **TRACK B (Full)**

**Decision**: Track B — security-sensitive, scope unclear initially

---

## Rules

1. **No defaults**: Every ticket must have explicit track decision recorded
2. **Visible decision**: The track choice is communicated to the user
3. **No track switching**: Once started, track cannot change without escalation
4. **Quick decision**: Gate should take < 5 minutes to complete
5. **Honest assessment**: Don't force-fit complex work into Track A to save effort
6. **Escalate if unsure**: When in doubt between A and B, choose B

---

## Integration with Skills

This gate feeds into: **SKILL: Two-Track Development Workflow**

Once track is decided here, proceed with the workflow defined in that skill.

---

## Checklist for Agents

Use this gate only when:

- Scoping a new ticket or epic for the first time
- Re-evaluating track after a major scope change

You do **not** need to re-read this file before every implementation step.

Before starting work on a new ticket:

- [ ] Answer all three decision questions (or use the quick decision table)
- [ ] Record decision in `TRACK_DECISION.md`
- [ ] Verify track assignment with user (if applicable)
- [ ] Proceed with correct workflow track (Track A or Track B)
- [ ] Link ticket decision from backlog.md (if applicable)
