# Workflow Execution Rules

**How to execute work efficiently and safely** without loops, exhaustion, or overcomplication.

---

## Step 1: Always Use the Decision Gate FIRST

Before starting ANY ticket work:

1. Open `project-management/WORKFLOW_DECISION_GATE.md`
2. Answer the three questions
3. Record your decision in `TRACK_DECISION.md` in the ticket folder
4. Proceed with the correct track (Lean or Full)

**This is non-negotiable.** No ticket work begins without this decision.

---

## Step 2: Error Recovery & Escalation

### Autonomous Recovery (Try These First)

When a command fails, attempt these fixes before escalating:

1. **Dependency issues** → `npm install` / `pip install` / `flutter pub get`
2. **File not found** → Check path, verify case sensitivity
3. **Type errors** → Run build, read full error, adjust
4. **Authorization errors** → Verify credentials, check permissions
5. **Network failures** → Retry with exponential backoff
6. **Timeouts** → Increase timeout, check for hanging processes

**These fixes should take < 5 minutes each.**

### When to Escalate (Circuit Breaker)

**Core Rule**: Stop and escalate when:
- You've attempted 3 times with **no measurable progress**
- OR the error pattern repeats (same root cause, same error)
- OR you're retrying the same command hoping for different results

**Examples**:
- Tried `npm install` 3 times, still missing dependency → Escalate
- Changed code 3 times, test still fails with same error → Escalate
- Running same build command repeatedly → Escalate (not debugging)
- Getting permission denied, retrying without fixing permissions → Escalate

### Escalation Template

When you escalate, provide:

```
**Issue**: [One sentence describing the problem]

**What happened**: [The error message + stack trace]

**What I tried**:
1. [Attempt 1 and result]
2. [Attempt 2 and result]  
3. [Attempt 3 and result]

**Why I'm escalating**: [Which circuit breaker condition was met]

**My hypothesis**: [What I think the real issue is]

**Recommended next steps**: [What COULD fix this, even if you can't do it]
```

---

## Combining Rules: The Full Workflow

```
1. CHECK DECISION GATE
   ↓
2. CHOOSE TRACK (Lean or Full)
   ↓
3. EXECUTE WORK
   → If error: Try autonomous recovery (< 5 min)
   → If still failing: Check circuit breaker
   ↓
4. Escalate if no progress OR update memory and continue
```

---

## By Track

### Track A (Lean) Workflow

- Sequential execution
- Autonomous error recovery only
- Quick decision → Code → Test → Done

### Track B (Full) Workflow

- Sequential or parallel phases as needed
- More robust error recovery
- Decision → Requirements → Design → Plan → Code → Test → Review → Done

---

## Key Rules

1. **Decision Gate First**: Every ticket starts with track decision
2. **Fast Recovery**: Error fixes take minutes, not hours
3. **Escalate Early**: No progress in 3 attempts = escalate, don't loop
4. **Document Decisions**: Record why you chose this path
5. **Update Memory**: After significant work, save lessons learned

---

## Anti-patterns

✗ Skipping decision gate to save time  
✗ Retrying the same command 10 times expecting different results  
✗ Ignoring circuit breaker triggers  
✗ Automating something that needs human judgment  
✗ Getting exhausted from repetitive failures  
✗ Not updating memory with discoveries

---

## Step 3: Update Repository Memory

After completing significant work:

1. Ask: "What would help the next agent do similar work?"
2. If answer is something valuable, save it:
   - Pattern discovered? → Save to repo memory
   - Gotcha/trap found? → Save to repo memory
   - Validation method that works? → Save to repo memory
3. Keep entries short and actionable (not essays)

---

## When You're Stuck

If you're confused:
1. Re-read the decision gate
2. Check if you're in a circuit breaker condition
3. Ask: "Is this a tool problem or a design problem?"
4. Escalate if unclear (see EMERGENCIES.md)
