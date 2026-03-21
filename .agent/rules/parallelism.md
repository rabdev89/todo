# Parallelism Protocol

> **Layer**: Execution (Layer 1 — Ticket-Level)
> **Enforced by**: All agents before beginning any multi-task sprint
> **Overrides**: None. This protocol is mandatory.

---

## Purpose

Agents MUST NOT execute tasks sequentially by default. Sequential execution wastes time and fails to reflect real-world parallel development. This protocol defines how agents classify, group, and execute tasks in parallel "breaths" — maximising velocity while preventing conflicts.

---

## Step 1 — Task Classification

Before executing any group of tasks, the agent MUST classify each task into one of two categories:

### ✅ INDEPENDENT
A task is INDEPENDENT if ALL of the following are true:
- It touches **different files or modules** than every other task in the group
- It has **no runtime dependency** on another task's output (it does not consume an artifact produced by another task in this group)
- It does **not mutate shared state**: database schema, global TypeScript types, `.env` config, shared constants, or authentication middleware
- It does **not modify the same Epic or ticket status** as another concurrent task

### 🔒 DEPENDENT
A task is DEPENDENT if ANY of the following are true:
- It imports from, extends, or overwrites a file being modified by another task
- It requires a database migration, schema change, or seeded data produced by another task
- It is blocked in the ticket backlog by another task (explicit dependency declared in the Epic)
- It modifies a shared interface, type definition, or API contract relied upon by other tasks

---

## Step 2 — Breath Formation

Group all INDEPENDENT tasks into a single **breath**. A breath is a parallel execution unit.

```
Breath 1: [Task A, Task C, Task E]   ← all INDEPENDENT, run simultaneously
Breath 2: [Task B]                   ← DEPENDENT on Breath 1 output
Breath 3: [Task D, Task F]           ← INDEPENDENT, run simultaneously after Breath 2
```

Rules:
- A breath may contain **any number** of INDEPENDENT tasks
- A DEPENDENT task always forms its **own breath** or is placed after the breath it depends on
- Breaths are executed **sequentially** — Breath 2 never starts until Breath 1 is fully verified
- Tasks within a breath are executed **in parallel**

---

## Step 3 — Execution

When executing a breath:
1. Spawn parallel sub-tasks for each INDEPENDENT task in the breath
2. Each sub-task runs to completion independently
3. Do NOT merge or integrate outputs until ALL tasks in the breath are complete
4. Log each task's completion status to `activity-log.md` before proceeding

---

## Step 4 — Conflict Detection

If a conflict is discovered mid-breath (e.g. two tasks unexpectedly modified the same file):
1. **Pause** the breath immediately
2. Re-classify the conflicting tasks as DEPENDENT
3. Restructure the remaining breaths accordingly
4. Log the conflict and reclassification to `activity-log.md`
5. Continue from the corrected breath plan

---

## Example: Feature Sprint with 5 Tickets

| Ticket | Description | Classification | Reason |
|--------|-------------|----------------|--------|
| T-01 | Build `/auth/login` endpoint | INDEPENDENT | Isolated module |
| T-02 | Build `/auth/register` endpoint | INDEPENDENT | Isolated module |
| T-03 | Add JWT middleware | DEPENDENT | T-01 and T-02 must exist first |
| T-04 | Write unit tests for login | DEPENDENT | Requires T-01 output |
| T-05 | Update README auth section | INDEPENDENT | No code dependencies |

**Resulting breath plan:**
```
Breath 1: [T-01, T-02, T-05]   ← parallel
Breath 2: [T-03]               ← sequential (depends on Breath 1)
Breath 3: [T-04]               ← sequential (depends on T-01 from Breath 1)
```

---

## Constraints

- Agents MUST document their breath plan in the ticket/Epic before starting execution
- Agents MUST NOT skip the classification step, even for small groups of 2 tasks
- If in doubt, classify as DEPENDENT — correctness over speed
