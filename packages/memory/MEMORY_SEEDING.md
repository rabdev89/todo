# Memory Seeding: Bootstrap Framework Knowledge for New Projects

**Problem Solved**: Every new project now starts with framework knowledge already in memory instead of agents discovering it through trial and error.

---

## What Is Memory Seeding?

When you initialize a new project, you inject framework knowledge directly into **repository memory** (`/memories/repo/`). This gives every agent working on the project instant access to:

- Decision gate concept and when to use it
- Error recovery pattern (3 attempts, < 5 min each)
- Circuit breaker triggers and escalation protocol
- Memory checkpoint integration
- Bot commands and when to use them
- Common mistakes to avoid
- Rules architecture overview

**Result**: Agents learn the framework in 5 minutes instead of 3+ hours.

---

## How to Use Memory Seeding

### At Project Initialization

1. **Copy the seed file** from framework root:
   ```
   framework/memory-seed.json
   ```

2. **Load it into project setup script**:
   ```bash
   # In your project setup, after creating /memories/repo/ directory:
   npx ai-devkit memory seed packages/memory/memory-seed.json
   # OR manually create entries from the JSON seed
   ```

3. **Verify entries exist**:
   ```bash
   ls -la /memories/repo/
   # Should contain 9 files:
   # - framework-decision-gate.md
   # - framework-error-recovery.md
   # - framework-circuit-breaker.md
   # - framework-memory-checkpoint.md
   # - framework-two-tracks.md
   # - framework-bob-commands.md
   # - framework-common-mistakes.md
   # - framework-rules-overview.md
   # - framework-scaffold-checklist.md
   ```

### Manual Seeding (If CLI Command Unavailable)

Create files in `/memories/repo/` with content from `memory-seed.json`:

```
/memories/repo/
├── framework-decision-gate.md
├── framework-error-recovery.md
├── framework-circuit-breaker.md
├── framework-memory-checkpoint.md
├── framework-two-tracks.md
├── framework-bob-commands.md
├── framework-common-mistakes.md
├── framework-rules-overview.md
└── framework-scaffold-checklist.md
```

Each file contains the **content** section from the JSON, using the **title** as the filename.

---

## What Agents See After Seeding

When an agent runs `memory search "decision gate"` or `memory search "error recovery"`, they get:

✅ **Instant framework knowledge** - No reading 30 pages of docs  
✅ **Task-specific patterns** - Error recovery, escalation, memory updates  
✅ **Decision criteria** - Which track to use, when to escalate  
✅ **Common traps** - What mistakes to avoid  
✅ **Quick reference** - Commands, rules structure, checklist  

**Time saved per agent per project**: ~3 hours

---

## Integration Points

### 1. **During Ticket Planning**
Agent reads WORKFLOW_DECISION_GATE.md (step 1), then searches memory for "decision gate" and sees the quick reference with track selection rules.

### 2. **During Error Recovery**
Agent hits an error, searches memory for "error recovery" and gets the 3-attempt, <5-min pattern immediately.

### 3. **During Escalation**
Agent searches memory for "circuit breaker" and sees exactly when to stop and what to include in escalation.

### 4. **At Work Completion**
Agent searches memory for "memory checkpoint" and understands Step 3 of workflow (what to save and why).

### 5. **For Stack-Specific Questions**
Agent searches memory for language+pattern (e.g., "flutter validation") and gets exact project patterns.

---

## Extending the Seed File

As a project develops, **add more entries** to memory:

Examples that emerge naturally:
- "React component testing pattern for this project"  
- "API contract validation we use"
- "Database migrations checklist"
- "Deployment failure gotchas"
- "Performance regression prevention"

These become **project-specific patterns** that stack on top of the framework seed.

---

## Why This Matters

**Before seeding**: New agent has to read 10+ files to understand framework, makes mistakes, learns slowly.  
**After seeding**: Agent searches memory once, gets what they need immediately.

**The math**:
- Agent cost: ~$0.02 per 1K tokens read
- Avoided reading: ~50K tokens of framework docs
- Benefit: $1 saved per agent per project × multiple agents = significant

**More importantly**: Consistent execution of framework patterns from day 1.

---

## See Also

- `packages/memory/memory-seed.json` - The seed file (what gets loaded)
- `project-management/WORKFLOW_DECISION_GATE.md` - The mandatory first step
- `.agent/rules/` - The 5 core rule files being seeded
- `skills-library/methodology/memory/SKILL.md` - How to use memory system
