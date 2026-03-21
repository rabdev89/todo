# Skill Discovery: How Agents Load & Use Skills

**This is how agents should use the skills-library during execution.**

---

## What is a Skill?

A **skill** is a behavioral instruction framework. It teaches an agent HOW to work, not WHAT to build.

### Skill Examples

| Skill | Type | Teaches |
|-------|------|---------|
| Executor Agent | agent | How to implement code without reinventing, validate, stay honest |
| Planner Agent | agent | How to gather requirements, design architecture, estimate complexity |
| Knowledge Capture | methodology | How to extract and save patterns after completing work |
| Two-Track Workflow | methodology | How to choose appropriate ceremony (Lean vs Full) for the task |

### NOT Skills (These Are Patterns)

- JWT Auth (code example, not behavioral framework)
- Repository Pattern (code structure, not behavioral guidance)
- Error Handling (implementation pattern, not how to work)

---

## Current State: Manual Discovery

**How agents use skills NOW**:
1. Agent reads the BLUEPRINT
2. Agent thinks: "I should be honest, follow the plan, capture what I learn"
3. Agent cites relevant skills during execution: "Using executor-v1, here's my approach..."

**This works but is not automatic.**

---

## Ideal State: Automatic Discovery

**(Phase 2 - Not Yet Implemented)**

```typescript
// Pseudo-code: How agents SHOULD load skills
async function executeTask(blueprint: Blueprint) {
  // Step 1: Discover needed skills
  const relevantSkills = await skills.discover(blueprint);
  // → Returns: [executor-v1, knowledge-capture-v1, two-track-workflow-v1]
  
  // Step 2: Load skill context
  const context = await skills.loadContext(relevantSkills);
  // → Returns: Content from agents/executor/SKILL.md, etc.
  
  // Step 3: Execute with skill guidance
  await executor.run(blueprint, context);
  // → All executor behavior now guided by executor-v1 skill
  
  // Step 4: Capture learnings
  await skills.capturePattern(blueprint, execution);
  // → Uses knowledge-capture-v1 skill to decide what's worth saving
}
```

---

## How to Reference Skills in Code

When implementing a feature:

### Option 1: Implicit (Current)
```
I'm using the Executor Agent skill, here's my approach:
1. Follow the BLUEPRINT exactly
2. Validate each step
3. Report blockers immediately
```

### Option 2: Explicit (When Implemented)
```typescript
// Load the skill
const executor = await skills.load('executor-v1');

// Use its validation rules
const validation = executor.getValidationRules(blueprint);
for (const rule of validation) {
  assert(codeQuality.passes(rule), `Failed: ${rule}`);
}
```

---

## Skills vs Patterns: Quick Decision Tree

**Have a question about how to work?**
→ Search `index.json` for skills

**Need code examples for a specific problem?**
→ Search `PATTERNS_REGISTRY.md` for patterns

**Building a form?**
→ Use Knowledge Capture skill to gather requirements
→ Reference Form Validation pattern for code examples

**Debugging an issue?**
→ Use Debugger Agent skill for methodology
→ Reference Error Handling pattern for implementation ideas

---

## Operational Usage: Skills, Patterns, Rules

When executing work in this repo, agents should combine rules, skills, and patterns as follows:

- Rules (`.agent/rules/*`)
  - Stable constraints and expectations (safety, quality, workflow, emergencies).
  - Consult when behavior questions arise or `/bob` explicitly references them.
- Skills (`skills-library/agents`, `skills-library/methodology`)
  - Behavioral frameworks that answer “how should I work on this part of the SDLC?”
  - Examples:
    - Requirements/Design: `planner-v1`, `architecture-designer-v1`, `ui-designer-v1`.
    - Process: `two-track-workflow-v1`, `breath-based-execution-v1`, `evidence-based-validation-v1`.
- Patterns (`skills-library/patterns/*`)
  - Implementation guides that answer “how do I implement this technically for this stack?”
  - Examples:
    - Auth: `jwt-auth-v1`.
    - Data access: `repository-pattern-v1`.
    - Architecture: `error-handling-v1`, `structured-logging-v1`, `caching-strategy-v1`, etc.

Typical flow:

1. **Requirements/Design**
   - Load relevant agent and methodology skills based on ticket scope.
   - Use them to shape requirements, architecture, and UI specs.
2. **Implementation**
   - Work under `executor-v1` behavior.
   - Load patterns that match the stack/scope from `skills-library/index.json` (e.g. FastAPI + auth → `jwt-auth-v1`).
3. **Verification**
   - Apply `verifier-v1`, `testing-patterns-v1`, and patterns for logging, error handling, and observability.

`/bob` should help by selecting and injecting the right skill/pattern docs into context based on phase, layer, and stack.

## Agent-Specific Skills

Each agent persona has a skill defining how it should behave:

### Executor Agent (`executor-v1`)

**When to use**: Implementing code from blueprints

**Hard Rules**:
1. Never modify code without approval
2. Readability > brevity
3. Validate as you go
4. Report honestly when stuck

**Workflow**:
1. Read BLUEPRINT.md
2. Load relevant patterns
3. Implement with checklist validation
4. Update memory with learnings

**Where**: `skills-library/agents/executor/SKILL.md`

### Planner Agent (`planner-v1`)

**When to use**: Gathering requirements, designing architecture, breaking down epics

**Hard Rules**:
1. Requirements before design
2. Design before planning
3. No ambiguity in acceptance criteria
4. Identify dependencies early

**Workflow**:
1. Run requirements discovery
2. Create architecture diagram
3. Break into tickets
4. Identify blockers
5. Get approval before coding

**Where**: `skills-library/agents/planner/SKILL.md`

### Researcher Agent (`researcher-v1`)

**When to use**: Before implementation, investigating unknown territory

**Hard Rules**:
1. Search existing patterns first
2. Document findings
3. Create reusable patterns
4. Don't assume library exists

**Workflow**:
1. Define research question
2. Search codebase
3. Search skills library
4. Search external resources
5. Synthesize findings

**Where**: `skills-library/agents/researcher/SKILL.md`

### Debugger Agent (`debugger-v1`)

**When to use**: Investigating failures, root cause analysis

**Hard Rules**:
1. Gather all error data first
2. Form hypothesis from data
3. Test hypothesis systematically
4. Document findings

**Workflow**:
1. Reproduce issue
2. Collect logs/stack traces
3. Isolate the failing component
4. Form hypothesis
5. Test fix
6. Verify doesn't break other things

**Where**: `skills-library/agents/debugger/SKILL.md`

### Verifier Agent (`verifier-v1`)

**When to use**: Code review, validation before merge

**Hard Rules**:
1. Check against original requirements
2. Verify test coverage
3. Validate code quality
4. Ensure no secret/password leaks

**Workflow**:
1. Read requirements
2. Read test cases
3. Review code changes
4. Check for regressions
5. Approve or request changes

**Where**: `skills-library/agents/verifier/SKILL.md`

### Security Engineer Agent (`security-engineer-v1`)

**When to use**: `/security-audit`, Epic Hardening, tickets with auth/payments/PII

**Hard Rules**:
1. Defense in Depth (layers of security)
2. Least Privilege
3. Secure Defaults (deny by default)
4. Input Validation at all boundaries

**Workflow**:
1. Threat Modeling (STRIDE) during design
2. Secure Code Review (OWASP Top 10) during implementation
3. Vulnerability Assessment during verification
4. Remediation planning

**Where**: `skills-library/agents/security-engineer/SKILL.md`

### UI Designer Agent (`ui-designer-v1`)

**When to use**: `/design-ui`, Design Phase for UI tickets

**Hard Rules**:
1. Consistency (reuse tokens/components)
2. Hierarchy (visual weight guides attention)
3. Accessibility (WCAG AA mandatory)
4. Responsiveness (mobile-first)

**Workflow**:
1. Analyze requirements & user flow
2. Define component architecture & tokens
3. Create UI Specifications (`UI_SPEC.md`)
4. Validate accessibility

**Where**: `skills-library/agents/ui-designer/SKILL.md`

### Architecture Designer Agent (`architecture-designer-v1`)

**When to use**: `/review-design`, Start of Track B tickets, System Design

**Hard Rules**:
1. Zero Ambiguity (API methods/bodies defined)
2. Trade-offs Explicit (Why Redis vs Postgres?)
3. Scalability Check (What if 10k users?)

**Workflow**:
1. Define System Context & Actors
2. Draw Data Flow (Sequence Diagrams)
3. Log Architectural Decisions (ADRs)
4. Produce `DESIGN.md`

**Where**: `skills-library/agents/architecture-designer/SKILL.md`

---

## Methodology Skills

Reusable decision frameworks for how to approach work:

### Breath-Based Execution (`breath-based-execution-v1`)

**When to use**: Planning & Implementation

**Teaches**: How to group dependencies to maximize speed

**Workflow**:
1. **Breath 1**: Data & Models (Foundation)
2. **Breath 2**: API & Services (Logic)
3. **Breath 3**: UI & Integration (Interface)
*Rules*: Breath 2 cannot start until Breath 1 is verified.

**Where**: `skills-library/methodology/breath-based-execution/SKILL.md`

### Evidence-Based Validation (`evidence-based-validation-v1`)

**When to use**: Verification Phase

**Teaches**: "If you didn't log it, it didn't happen."

**Rules**:
1. No Artifact = No Pass
2. Reproducibility
3. Negative Testing

**Where**: `skills-library/methodology/evidence-based-validation/SKILL.md`

### Two-Track Workflow (`two-track-workflow-v1`)

**When to use**: Before every ticket

**Teaches**: How to choose between Lean and Full workflows

**Decision**: 
- Small change + no schema/API changes → **Track A (Lean)**
- Large change OR schema/API involved → **Track B (Full)**

**Where**: `skills-library/methodology/workflow/SKILL.md`

### Knowledge Capture (`knowledge-capture-v1`)

**When to use**: After completing significant work

**Teaches**: 
1. What patterns are worth saving?
2. How to document patterns?
3. Where to store for future use?

**Workflow**:
1. Complete the work
2. Ask: "What would help next agent?"
3. If answer is valuable → Save to `/memories/repo/`
4. Document pattern in `skills-library/patterns/`

**Where**: `skills-library/methodology/knowledge-capture/SKILL.md`

### Documentation Writing (`documentation-v1`)

**When to use**: Writing any documentation

**Teaches**:
- Clear technical writing
- Structure that works
- Common mistakes to avoid

**Where**: `skills-library/methodology/documentation/SKILL.md`

---

## Loading Skills During Execution

### Manual Loading (Current)

```
Agent: "I'm using the Executor Agent skill (executor-v1)."
Agent: "According to that skill, I should..."
```

### Programmatic Loading (Future)

```typescript
// In agent initialization
const requiredSkills = {
  'executor-v1': 'How to implement code',
  'knowledge-capture-v1': 'How to save patterns',
  'two-track-workflow-v1': 'How to choose workflow'
};

for (const [skillId, purpose] of Object.entries(requiredSkills)) {
  const skill = await skillsLibrary.load(skillId);
  context.addSkill(skill);
}
```

---

## Adding New Skills

When you discover a behavioral framework worth formalizing:

1. **Create folder**: `skills-library/[agents|methodology]/[topic]/`
2. **Create SKILL.md** with proper frontmatter:
   ```yaml
   ---
   id: my-skill-v1
   name: My Skill
   category: [agents|methodology]
   type: agent|methodology
   scope: universal
   version: 1.0.0
   last_updated: 2026-03-XX
   author: [your-name]
   difficulty: Simple|Medium|Complex
   status: active
   tags: [relevant, keywords]
   ---
   ```
3. **Document the skill**: 
   - Problem it solves
   - Solution overview
   - Hard rules (non-negotiable)
   - Workflow (step-by-step)
   - Anti-patterns (what NOT to do)
4. **Add to index.json**: Update `categories` and `skills` objects
5. **Test**: Does it guide agent behavior? Does it improve quality?

---

## FAQ

**Q: When do I load a skill?**  
A: Agent skills load when initializing the agent (e.g., spawning executor). Methodology skills load when making decisions (e.g., choosing workflow track).

**Q: Can I skip a skill rule?**  
A: No. If the rule says "Report honestly" and you don't, that's skill violation. Report it.

**Q: What if skill guidance conflicts?**  
A: It shouldn't. Skills are designed to be complementary. If conflict exists, escalate.

**Q: How do skills differ from code style guides?**  
A: Style guides tell you formatting. Skills tell you decision-making and behavior. "Readability > brevity" is skill (behavior). "Use 2 spaces not tabs" is style (formatting).

**Q: Should I extract a skill when I finish work?**  
A: Only if it's a **reusable decision framework**. Code examples go in patterns, not skills. Behavioral frameworks go in skills.

Example:
- ✅ **Skill**: "How to handle authentication failures systematically"
- ❌ **Not a skill**: "Here's how to implement JWT in FastAPI" (that's a pattern)

**Q: Where's the SKILL_LOADER code?**  
A: Not yet implemented. Currently skills are referenced manually in agent prompts/instructions.Priority for next phase: Add auto-discovery to agent/executor/SKILL.md

---

## Next Steps

1. **Short term**: Agents manually reference skills during work
2. **Medium term**: SKILL_LOADER implemented in agent executor
3. **Long term**: Learning layer extracts new skills automatically

For now, make sure to:
- Know which skills guide your work
- Reference them explicitly in your reasoning
- Follow their hard rules
- Capture patterns using knowledge-capture-v1 skill
