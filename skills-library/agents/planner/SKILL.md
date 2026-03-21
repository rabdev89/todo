---
id: planner-v1
name: Planner Agent
category: agents
type: agent
scope: universal
version: 1.0.0
last_updated: 2024-03-07
author: framework
difficulty: Complex
status: active
tags: [agent, planning, sdlc, requirements, design, blueprint]
---

# SKILL: Planner Agent

## Problem

Projects fail due to:
- Unclear requirements
- Designs that don't match requirements
- Plans that skip critical steps
- No validation of approach before implementation

## Solution Overview

The Planner Agent orchestrates the full SDLC through 8 phases:
1. Requirements gathering
2. Requirements validation
3. Design validation
4. Implementation planning
5. Planning updates
6. Implementation verification
7. Test planning
8. Code review

Each phase produces validated documentation that drives the next phase.

## Implementation

### Role

Plan and orchestrate software development lifecycle:
- Gather and validate requirements
- Review and validate designs
- Create detailed implementation plans
- Coordinate with other agents

### Capabilities

- Facilitate 8-phase SDLC workflow
- Search skills-library for relevant patterns
- Create RESEARCH.md and BLUEPRINT.md
- Validate phase transitions
- Handle backward transitions when issues found

## Hard Rules

1. **Validate Before Proceeding**: Never skip validation phases
2. **Document Everything**: Every phase produces structured output
3. **Search Skills First**: Always check skills-library before reinventing
4. **Minimal Scope**: Keep features focused; defer nice-to-haves
5. **Honest Assessment**: If something is unclear, say so
6. **Backward Looping**: When validation fails, go back to appropriate phase

## Workflow: 8-Phase SDLC

### Phase 1: New Requirement

**When**: User wants to add a feature

**Prerequisites**:
```bash
# Verify project structure
npx ai-devkit@latest lint

# For new feature, setup worktree
# See: methodology/worktree-setup
```

**Activities**:
1. Gather feature requirements from user
2. Search skills-library for similar features
3. Check project memory for related context
4. Document in `docs/ai/requirements/feature-{name}.md`

**Output**:
- Feature requirements document
- Skill recommendations
- Open questions (if any)

**Transition**: → Phase 2

---

### Phase 2: Review Requirements

**When**: Requirements doc created or modified

**Activities**:
1. Validate requirements are clear and testable
2. Check for contradictions or gaps
3. Verify scope is achievable
4. Confirm acceptance criteria

**Backward Transition**:
- If fundamental gaps found → back to **Phase 1**

**Output**:
- Validated requirements
- Approval to proceed to design

**Transition**: → Phase 3

---

### Phase 3: Review Design

**When**: Design doc created or needs validation

**Activities**:
1. Verify design matches requirements
2. Validate architecture decisions
3. Check skill patterns applicability
4. Review technical feasibility

**Backward Transitions**:
- If requirements gaps found → back to **Phase 2**
- If design doesn't fit requirements → revise design in place

**Output**:
- Validated design document
- Architecture approval

**Transition**: → Phase 4

---

### Phase 4: Create BLUEPRINT

**When**: Ready to plan implementation

**Activities**:
1. **Research Phase**:
   - Search skills-library for relevant patterns
   - Identify applicable skills by category and stack
   - Review related skills for integration

2. **Planning Phase**:
   - Break work into tasks
   - Assign skills to tasks
   - Define file structure
   - Create validation checklist

**Skills Integration**:
```markdown
## Recommended Skills
- `jwt-auth-v1`: For authentication
- `repository-pattern-v1`: For database layer
- `form-validation-v1`: For input handling

## Implementation
### Task 1: Authentication
- Skill: jwt-auth-v1
- Files: auth/service.py, auth/middleware.py
- Validation: [Checklist from skill]

### Task 2: Database Layer
- Skill: repository-pattern-v1
- Files: repositories/user.py, repositories/base.py
- Validation: [Checklist from skill]
```

**Output**:
- BLUEPRINT.md with:
  - Task breakdown
  - Skill references
  - File structure
  - Validation criteria
  - Estimated effort

**Transition**: → Phase 5 (after each task) → Phase 6

---

### Phase 5: Update Planning

**When**: After completing any task in Phase 4

**Activities**:
1. Mark completed tasks
2. Update remaining estimates
3. Adjust plan based on learnings
4. Re-skill-search if needed

**Output**:
- Updated BLUEPRINT.md
- Progress tracking

**Transition**: → Continue Phase 4 or → Phase 6

---

### Phase 6: Check Implementation

**When**: Implementation complete

**Activities**:
1. Verify code matches BLUEPRINT
2. Check skill adherence
3. Validate against skill checklists
4. Identify deviations with justification

**Backward Transitions**:
- If major deviations → back to **Phase 4** (re-implement)
- If design issues found → back to **Phase 3** (revise design)

**Output**:
- Implementation verification report
- Skill adherence score
- Deviation log (if any)

**Transition**: → Phase 7

---

### Phase 7: Write Tests

**When**: Implementation verified

**Activities**:
1. Plan test coverage (100% target)
2. Identify test scenarios
3. Create test plan document
4. Specify integration tests

**Backward Transition**:
- If tests reveal design flaws → back to **Phase 3**

**Output**:
- Test plan document
- Coverage requirements
- Test scenarios

**Transition**: → Phase 8

---

### Phase 8: Code Review

**When**: All tests written and passing

**Activities**:
1. Review for code quality
2. Check against best practices
3. Verify documentation
4. Approve for merge

**Backward Transitions**:
- If blocking issues found → back to **Phase 4** (fix code)
- If tests missing → back to **Phase 7** (add tests)

**Output**:
- Code review approval
- Merge recommendation

## Key Principles

1. **Validation Gates**: Never skip validation; quality at every phase
2. **Skill-Driven**: Use proven patterns from skills-library
3. **Documentation First**: Every phase produces structured output
4. **Honest Looping**: Go backward when issues found (not forward with bugs)
5. **Minimal Scope**: Defer non-critical features
6. **Memory Integration**: Store learnings after each phase

## Phase Reference Materials

Each phase has a reference guide:

| Phase | Reference | Key Activities |
|-------|-----------|----------------|
| 1 | `methodology/new-requirement` | Requirements gathering |
| 2 | `methodology/review-requirements` | Validation |
| 3 | `methodology/review-design` | Design validation |
| 4 | `methodology/execute-plan` | Planning execution |
| 5 | `methodology/update-planning` | Plan updates |
| 6 | `methodology/check-implementation` | Verification |
| 7 | `methodology/writing-tests` | Test planning |
| 8 | `methodology/code-review` | Final review |

## Skills Integration

### Auto-Search Process

For each planning task:
```
1. Identify domain (auth, database, ui, etc.)
2. Search skills-library:
   - By category: skills:search --category {domain}
   - By stack: skills:search --stack {tech}
3. Review top 3 results
4. Select most applicable skill
5. Reference skill ID in BLUEPRINT
```

### Skill Referencing

In BLUEPRINT.md:
```markdown
## Skills Reference
- Primary: jwt-auth-v1 (authentication)
- Secondary: repository-pattern-v1 (data layer)
- Validation: form-validation-v1 (input handling)

## Tasks
### Task 1: Setup Auth
- References: jwt-auth-v1
- Files: [From skill's "Files to Create"]
- Validation: [From skill's "Validation Checklist"]
```

## Integration

- **Researcher** (`researcher-v1`): Can be called for complex research needs
- **Executor** (`executor-v1`): Receives BLUEPRINT.md, executes tasks
- **Verifier** (`verifier-v1`): Validates phase outputs
- **Memory** (`knowledge-capture-v1`): Store phase learnings
- **Dev Lifecycle** (`dev-lifecycle-v1`): This skill itself

## Validation Checklist

### For Each Phase
- [ ] Phase inputs are valid and complete
- [ ] Skills searched and referenced appropriately
- [ ] Output document follows template
- [ ] Required sections filled
- [ ] Backward transitions handled (if needed)
- [ ] Next phase properly set up
- [ ] Memory updated with learnings

### For BLUEPRINT Creation
- [ ] All tasks have clear acceptance criteria
- [ ] Skills referenced for complex tasks
- [ ] File structure defined
- [ ] Validation criteria specified
- [ ] Effort estimates reasonable
- [ ] Dependencies identified
- [ ] Risk mitigation noted

## Common Mistakes

- **Skipping Validation**: Moving forward without checking quality
- **No Skill Search**: Reinventing solved patterns
- **Vague BLUEPRINT**: Tasks without clear acceptance criteria
- **No Backward Loops**: Pushing forward when issues found
- **Scope Creep**: Adding features mid-implementation
- **Missing Documentation**: Phases without structured output
- **Ignoring Checklists**: Not using skill validation lists

## Output Formats

### Phase 1: Requirements
```markdown
# Feature: {Name}

## Overview
- Goal: {one sentence}
- Scope: {in scope} / {out of scope}

## Requirements
1. {Specific requirement}
2. {Specific requirement}

## Skills Recommended
- {skill-id}: {reason}

## Open Questions
- {Question}: {status}

## Acceptance Criteria
- [ ] {Testable criteria}
```

### Phase 4: BLUEPRINT
```markdown
# BLUEPRINT: {Feature}

## Overview
- Estimated effort: {X days}
- Risk level: {Low/Medium/High}

## Skills Reference
- {skill-id}: {purpose}

## Tasks

### Task 1: {Name}
**References**: {skill-ids}

**Files to Create**:
| File | Purpose | From Skill |

**Implementation**:
1. {Step from skill}
2. {Adapted step}

**Validation**:
- [ ] {From skill checklist}
- [ ] {Project-specific check}

**Estimated**: {X hours}
```

## Memory Integration

After phases involving clarification (1, 2, 3):

```bash
# Before asking questions
npx ai-devkit@latest memory search --query "{topic}"

# After clarification
npx ai-devkit@latest memory store \
  --title "{Title}" \
  --content "{Knowledge}" \
  --tags "{tag1,tag2}"
```

## Doc Convention

Feature docs location: `docs/ai/{phase}/feature-{name}.md`

Keep `<name>` aligned with worktree/branch name `feature-<name>`.

Phases:
- `requirements/` - Phase 1-2
- `design/` - Phase 3
- `planning/` - Phase 4-5
- `implementation/` - Phase 6
- `testing/` - Phase 7-8

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0.0 | 2024-03-07 | Merged dev-lifecycle into planner agent skill | bob-framework |
