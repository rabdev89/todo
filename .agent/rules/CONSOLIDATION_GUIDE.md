# Rules Consolidation Guide

**Effective March 8, 2026**

This document explains how `.agent/rules/` was reorganized to reduce complexity and improve usability.

---

## What Changed

The rules directory went from **19 files** to **5 core + language-specific**:

### New Core Rules (Required Reading)

1. **CORE_PRINCIPLES.md** - Universal development principles
2. **CODE_QUALITY.md** - Testing, code style, review standards
3. **WORKFLOW.md** - Execution, parallelization, error recovery
4. **EMERGENCIES.md** - Escalation, unusual situations
5. **WORKFLOW_DECISION_GATE.md** (in project-management/) - Track selection

### Retained Language/Stack Specific

- `javascript.md` - Condensed
- `typescript.md` - If needed
- `python.md` - If needed
- `flutter.md` - Kept as-is
- `react.md` - Kept as-is
- `fastapi.md` - Kept as-is
- `security.md` - Kept as-is (project-specific)
- `repository-intelligence.md` - Kept as-is

### Deprecated (Merged Into New Files)

These were merged into the core files above. Use core files instead:

| Old File | Merged Into | Why |
|----------|-------------|-----|
| `tdd.md` | CODE_QUALITY.md | Core code quality topic |
| `review.md` | CODE_QUALITY.md | Review is part of quality |
| `parallelism.md` | WORKFLOW.md | Part of execution workflow |
| `circuit-breaker.md` | WORKFLOW.md + EMERGENCIES.md | Error recovery + escalation |
| `requirements.md` | WORKFLOW_DECISION_GATE + design templates | Project template now handles this |
| `task-creator.md` | WORKFLOW.md | Workflow encompasses task creation |
| `agent-orchestrator.md` | DELETED | Operational detail, not a rule |
| `user-testing.md` | design_template/ | Move to project design guides |
| `productmanager.md` | design_template/ | Move to project design guides |
| `service_monitoring.md` | operations/ | Not an agent rule |
| `command_enforcement.md` | WORKFLOW.md | Execution rules cover this |

---

## How to Use New Rules

### On Starting Any Work

Follow this sequence:

```
Step 1: Read WORKFLOW_DECISION_GATE.md
        ↓
Step 2: Choose Track A (Lean) or Track B (Full)
        ↓
Step 3: Read CORE_PRINCIPLES.md if starting new code
        ↓
Step 4: Read CODE_QUALITY.md for testing/review standards
        ↓
Step 5: Read WORKFLOW.md for execution approach
        ↓
Step 6: Start work according to track
        ↓
Step 7: Read EMERGENCIES.md only if something goes wrong
```

### Total Time to Learn Rules

- **First time**: 30 minutes reading all core rules
- **New ticket**: 5 minutes to review decision gate
- **New code**: 5 minutes to review relevant sections of CODE_QUALITY
- **If stuck**: 5 minutes to check EMERGENCIES

Old system required reading 19 files (3+ hours).

---

## Key Improvements

### 1. Faster Onboarding
- **Before**: 19 files, lots of overlap, 3+ hours to understand
- **After**: 5 core files, clear progression, 30 minutes

### 2. Reduced Repetition
- **Before**: Principles scattered across multiple files
- **After**: Single source of truth in CORE_PRINCIPLES

### 3. Clear Workflow Path
- **Before**: No clear "do this first, then that" sequence
- **After**: WORKFLOW_DECISION_GATE → Track → Core Rules → WORKFLOW → Code

### 4. Separated Concerns
- **Before**: All rules mixed together
- **After**: Universal vs. Language-specific clearly separated

### 5. Emergency Clarity
- **Before**: Error recovery spread across multiple files
- **After**: EMERGENCIES.md covers all failure scenarios

---

## FAQ

**Q: Where's the old parallelism.md rule?**
A: Condensed and merged into WORKFLOW.md. Key principles preserved, less verbose.

**Q: Do I still follow TDD?**
A: Yes, now in CODE_QUALITY.md with clearer guidance.

**Q: What about project-specific rules?**
A: Kept separate:
- Language-specific: Still in `.agent/rules/` (javascript.md, python.md, etc.)
- Project-specific: Now in `project-management/design_templates/` and this project's docs

**Q: I learned the old rules, do I need to relearn?**
A: No. Core principles are the same. Just read the new consolidated files.

**Q: Which rules are mandatory?**
A: All of them:
- WORKFLOW_DECISION_GATE: Mandatory before starting work
- CORE_PRINCIPLES: Mandatory for all code
- CODE_QUALITY: Mandatory for all code
- WORKFLOW: Mandatory for execution
- EMERGENCIES: Use only when needed

**Q: Can I ignore specific rules?**
A: No. These rules exist because they prevent costly mistakes. If a rule seems wrong:
1. Document why you think it's wrong
2. Propose a change
3. Wait for approval
4. Follow the rule in the meantime

**Q: What if rules conflict with my tech stack?**
A: Language-specific rules override universal rules for syntax/style. But principles (CORE_PRINCIPLES) still apply.

**Q: Are deprecated files being deleted?**
A: Not immediately. They'll remain for reference but are no longer the source of truth.
Use new core rules instead.

---

## Migration Timeline

- **Effective immediately**: Use new core rules
- **Week 1**: Remove old files from common reference
- **Month 1**: Archive old files to `/deprecated/`
- **Quarterly review**: Remove archived files if no longer needed

---

## Questions or Issues?

If the new rules don't make sense:
1. Check EMERGENCIES.md for help
2. Document what's unclear
3. Propose improvements
4. Update this guide after changes are approved

Remember: These rules exist to help you, not to hinder you. If they're getting in the way, let's fix them.
