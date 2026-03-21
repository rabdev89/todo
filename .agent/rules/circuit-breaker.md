# Circuit Breaker Protocol

> **Layer**: Execution (Layer 1 & 2)
> **Enforced by**: All agents during any autonomous or semi-autonomous execution
> **Overrides**: None. This protocol is mandatory and cannot be bypassed by task priority.

---

## Purpose

Agents operating autonomously can enter failure loops — repeatedly attempting an operation that will never succeed, consuming time and producing no value. The Circuit Breaker Protocol forces agents to detect, halt, and escalate these situations rather than continuing indefinitely.

---

## Trigger Conditions

The circuit breaker MUST activate when ANY of the following conditions are met:

### Condition 1 — Repetition Without Progress
The agent has attempted the **same operation 3 or more times** and each attempt produced either:
- The same error
- No measurable change in output
- A different error that still blocks the same goal

### Condition 2 — Cascading Failures
The agent has encountered **5 or more distinct errors** within a single ticket execution, regardless of whether they are related.

### Condition 3 — Circular Dependency Loop
The agent detects it is waiting on Task B to complete Task A, while Task B is waiting on Task A — a deadlock.

### Condition 4 — Verification Stall
The agent has attempted to pass a verification gate **3 or more times** on the same phase and has not improved its score.

### Condition 5 — Time Budget Exceeded
A single ticket has exceeded **2x its estimated complexity budget** (e.g. a "small" ticket has consumed effort equivalent to a "large" ticket with no completion).

---

## Response Protocol

When the circuit breaker activates, the agent MUST follow these steps **in order**:

### Step 1 — STOP
Immediately cease all execution on the triggering task. Do not attempt another retry.

### Step 2 — LOG
Write a structured entry to `activity-log.md` using the following format:

```markdown
## 🔴 CIRCUIT BREAKER TRIGGERED — [DATE TIME]

**Ticket**: [Ticket ID and title]
**Trigger Condition**: [Which condition activated the breaker — see above]
**Attempts Made**: [Number]
**Last Error / Symptom**:
> [Paste the exact error or describe the symptom]

**What Was Tried**:
1. [First approach]
2. [Second approach]
3. [Third approach]

**Current State of Files / Code**:
- [List any files modified, created, or deleted during the failed attempts]

**Recommended Next Step** (agent's best guess):
- [One concrete suggestion for the human operator]
```

### Step 3 — PRESERVE
Do not roll back any partial work. Leave modified files in place so the human operator can inspect them. If a file was left in a broken state, add an inline comment `// CIRCUIT BREAKER: incomplete — see activity-log.md`.

### Step 4 — ESCALATE
Surface the blocked state to the human operator. In the active session, output:

```
⛔ CIRCUIT BREAKER ACTIVATED

Task [Ticket ID] has been halted after [N] failed attempts.
Trigger: [condition name]
Details logged to: activity-log.md

Action required: Human review needed before this task can resume.
All other tasks in this breath/sprint are unaffected and will continue.
```

### Step 5 — CONTINUE
If the blocked task is part of a breath:
- **INDEPENDENT tasks** in the same breath continue unaffected
- **DEPENDENT tasks** downstream of the blocked task are also halted and logged
- The agent moves to the next available breath, skipping the blocked dependency chain

---

## Resetting the Circuit Breaker

A human operator resets the breaker by:
1. Reviewing `activity-log.md` entry for the blocked task
2. Resolving the root cause (using the 4-phase protocol in `.agent/workflows/debug.md`)
3. Adding a `RESET:` note to the activity log entry with the resolution
4. Re-opening the ticket and instructing the agent to retry

Agents MUST NOT self-reset the circuit breaker. Only human operators may do so.

---

## Breaker State Reference

| State | Meaning | Agent Action |
|-------|---------|--------------|
| 🟢 CLOSED | Normal operation | Execute freely |
| 🟡 WARNING | 2 failed attempts on same task | Log a warning, proceed with caution |
| 🔴 OPEN | Breaker triggered | STOP, LOG, ESCALATE |
| 🔵 HALF-OPEN | Human has reviewed and reset | Retry once with modified approach |
