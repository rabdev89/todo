# Emergencies & Escalation

**What to do when things break, go sideways, or don't fit the normal flow.**

---

## Definition: When to Escalate

You are in an emergency situation when:

- You've hit the circuit breaker condition (cannot continue normally)
- The normal workflow cannot proceed
- You encounter something not covered by these rules
- You lack the authority/tools to make a decision
- The situation involves security, compliance, or customer impact

---

## Escalation Protocol

### Step 1: Gather Information

Collect these details before escalating:

```
**Situation**: [What happened?]
**Impact**: [What broke? What's blocked?]
**Severity**: [Can work continue on other tasks? Yes/No]

**What I've tried**:
1. [Specific action and result]
2. [Specific action and result]
3. [Specific action and result]

**What I think is happening**: [Your best hypothesis]

**What I need to proceed**: [Information, permission, or tool]

**Time since this started**: [How long?]
```

### Step 2: Choose Escalation Path

**Low Severity** (work can continue elsewhere)
- Update the ticket with issue details
- Continue with different tasks
- Check back in 1 hour

**Medium Severity** (some work blocked)
- Pause current task
- Document issue clearly
- Wait for guidance
- Work on non-blocked tasks

**High Severity** (all work blocked)
- Stop immediately
- Escalate with full context
- Wait for response before proceeding
- Make status visible

### Step 3: Communicate

Write a clear escalation in the ticket or dashboard:

```markdown
## 🚨 Escalation Required

**Issue**: [One sentence]

**Severity**: Critical / High / Medium

**Context**:
- Current phase/task: [Where in workflow]
- What I was doing: [Specific action]
- What went wrong: [The error/situation]

**My analysis**:
[Why this can't be resolved autonomously]

**Information needed**:
- [ ] Decision on how to handle this
- [ ] Permission to do X
- [ ] Information about Y
- [ ] Other: _______

**Blocking**: [What work is prevented by this issue]

**Next steps**: [What happens when this is resolved]
```

---

## Common Emergency Scenarios

### Scenario 1: Dependency Conflict
**Situation**: Two packages require incompatible versions of a library

**What to do**:
1. Document the exact conflict
2. Identify which packages are in conflict
3. Check if one package has newer versions
4. Escalate with: exact packages, versions, options for resolution
5. Don't proceed with workarounds (they create debt)

### Scenario 2: Data Loss or Corruption
**Situation**: Something went wrong and data might be lost

**What to do**:
1. STOP immediately - don't do anything else
2. Check if there's a recent backup
3. Verify what's actually lost (might be recoverable)
4. Escalate with: what was lost, when it was lost, impact
5. Wait for database/backup expert

### Scenario 3: Security Issue Discovered
**Situation**: You discovered a vulnerability or security flaw

**What to do**:
1. Don't commit it or document it in logs
2. Don't tell people about it broadly (security disclosure)
3. Create a private ticket/escalation
4. Describe the issue technically
5. Wait for security team guidance

### Scenario 4: Test Suite Broken
**Situation**: Tests that were passing now fail, blocking all new work

**What to do**:
1. Check if it's a test flake (intermittent failure)
2. Run tests multiple times - are they consistently failing?
3. If consistent: identify what changed
4. If nothing you changed broke it, investigate in parallel
5. Escalate only if blocking work for > 15 minutes

### Scenario 5: File System or Permission Issue
**Situation**: Can't write files, permission denied, path issues

**What to do**:
1. Verify the path exists and is correct
2. Check file permissions: `ls -la` (Linux/Mac) or `icacls` (Windows)
3. Verify you have write access to the directory
4. Try creating a test file in the directory
5. If none of that works, escalate with exact permission errors

### Scenario 6: Unclear or Conflicting Requirements
**Situation**: You don't understand what's being asked, or requirements contradict

**What to do**:
1. Document specifically what's unclear
2. Ask clarifying questions in the ticket
3. Wait for responses before guessing
4. If still unclear after responses, escalate
5. DON'T guess at requirements - that creates rework

---

## Recovery from Escalation

Once escalated issue is resolved:

1. **Verify the fix**: Make sure the escalation is actually resolved
2. **Resume work**: Return to normal workflow
3. **Document lessons**: Update these rules if applicable
4. **Follow up**: Make sure any changes are actually deployed/merged

---

## Preventing Emergencies

**These practices reduce escalations:**

- Use the decision gate (catches complexity early)
- Read error messages fully (not just the first line)
- Ask clarifying questions before starting (not halfway through)
- Save/commit frequently (limits rollback scope)
- Test locally before pushing (catches issues early)
- Document assumptions (prevents misunderstandings)

---

## When in Doubt

ask these questions:

1. **Can I continue work on something else?** → Yes: Medium severity, continue elsewhere
2. **Can I proceed if I make an assumption?** → No: Don't assume, ask clarification
3. **Is this a one-off issue or systemic?** → Systemic: escalate, don't workaround
4. **Do I have enough information to fix this?** → No: Escalate with info request
5. **Is this a security issue?** → Yes: Private escalation, not public

---

## After-Action Review

When an escalation is resolved, do this (takes 5 min):

```markdown
## 🔍 Post-Escalation Review

**What happened**: [Brief recap]

**Root cause**: [Why did this occur]

**How it was resolved**: [What action fixed it]

**What could prevent this next time**:
- [ ] Documentation update
- [ ] Tool/automation
- [ ] Process change
- [ ] Training material

**Updated by**: [Your name]
**Date**: [Today]
```

Update this rules document if you found a gap.
