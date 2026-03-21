# Implementation Plan: Unified Skills Library (Option C)

## Goal
Merge `skills/` and `skills-library/` into a Fire-Flow style unified system where skills are first-class citizens integrated with agents and commands.

**Timeline**: 2-3 weeks  
**Priority**: High (blocks effective agent system)  
**Effort**: ~40 hours

---

## Current State Audit

### `skills/` (Behavior Instructions)
```
skills/
├── capture-knowledge/SKILL.md      → Knowledge capture rules
├── debug/SKILL.md                  → Debugging protocol
├── dev-lifecycle/SKILL.md          → 8-phase SDLC workflow
├── memory/SKILL.md                 → Memory CLI usage
├── simplify-implementation/SKILL.md → Simplification rules
├── technical-writer/SKILL.md       → Doc writing guide
└── workflow/SKILL.md               → Workflow patterns
```

**Characteristics**:
- YAML frontmatter (`name`, `description`)
- Behavioral rules for agents
- Instructions, not code patterns
- Referenced by skill name in prompts

### `skills-library/` (Implementation Patterns)
```
skills-library/
├── flutter/
│   ├── PROVIDER_STATE_MANAGEMENT.md
│   └── API_INTEGRATION.md
├── python-fastapi/
│   └── PROJECT_STRUCTURE.md
├── authentication/
│   └── JWT_AUTH.md
├── database/
│   └── REPOSITORY_PATTERN.md
└── forms/
    └── FORM_VALIDATION.md
```

**Characteristics**:
- Standard format: Metadata, Problem, Solution, Implementation, Validation
- Tech-agnostic with stack-specific code
- Validation checklists included
- No automatic discovery

---

## Target State: Unified Skills Library

```
skills-library/
├── index.json                      # Searchable registry (auto-generated)
├── README.md                       # Usage guide
├── AVAILABLE_SKILLS.md             # Human-readable index
│
├── agents/                         # Formerly skills/
│   ├── executor/
│   │   └── SKILL.md                # Agent behavior + patterns
│   ├── planner/
│   │   └── SKILL.md
│   ├── researcher/
│   │   └── SKILL.md
│   └── verifier/
│       └── SKILL.md
│
├── patterns/                       # Implementation patterns
│   ├── authentication/
│   │   ├── JWT_AUTH.md
│   │   ├── OAUTH.md
│   │   └── RBAC.md
│   ├── database/
│   │   ├── REPOSITORY_PATTERN.md
│   │   ├── MIGRATIONS.md
│   │   └── QUERY_OPTIMIZATION.md
│   ├── frontend/
│   │   ├── flutter/
│   │   │   ├── PROVIDER_STATE_MANAGEMENT.md
│   │   │   └── API_INTEGRATION.md
│   │   ├── react/
│   │   └── vue/
│   ├── backend/
│   │   ├── fastapi/
│   │   ├── express/
│   │   └── django/
│   └── forms/
│       └── VALIDATION.md
│
└── methodology/                    # Cross-cutting patterns
    ├── debugging/
    ├── testing/
    ├── deployment/
    └── workflow/
```

---

## Phase 1: Design Unified Schema (Week 1, Days 1-2)

### 1.1 Unified Skill Format

All skills use consistent frontmatter:

```yaml
---
# Identity
id: jwt-auth-v1                    # Unique identifier
name: JWT Authentication
version: 1.0.0

# Classification
category: authentication           # Domain
type: pattern                    # pattern | agent | methodology
scope: service                     # ui | service | model | infra | universal
difficulty: Medium                 # Simple | Medium | Complex

# Applicability
stacks: [fastapi, express, django] # Tech stacks supported
universal: false                   # True if tech-agnostic

# Metadata
effectiveness: 0.95                # Success rate (0-1)
usage_count: 12                    # Times used
last_updated: 2024-03-07
author: bob-framework

# Relations
requires: [password-hashing]       # Prerequisite skills
related: [oauth, session-auth]     # Related skills
replaces: [custom-jwt]             # Deprecated alternatives
---
```

### 1.2 Standard Sections

Every skill file contains:

```markdown
# SKILL: {Name}

## Metadata (YAML frontmatter above)

## Problem
What problem does this solve?

## Solution Overview
High-level approach

## Implementation
### Files to Create
| File | Purpose | Layer |

### Code Patterns
#### Stack: {Stack1}
```code
```
#### Stack: {Stack2}
```code
```

## Key Principles
1. [Stack-agnostic rule]

## Stack Variations
### {Stack1}
- [Specific considerations]

## Validation Checklist
- [ ] [Specific check]

## Integration
- [Skill name]: [How they work together]

## Common Mistakes
- [Mistake]: [Why wrong, how to avoid]

## References
- [Links]
```

### 1.3 Agent Skills Format

Agent skills combine behavior + patterns:

```yaml
---
id: executor-v1
name: Executor Agent
type: agent
scope: universal
---

# Executor Agent

## Role
Execute implementation tasks with honesty protocols.

## Hard Rules
- Do not modify code until user approves plan
- Follow skill patterns when available
- Validate against skill checklists

## Workflow
1. Load BLUEPRINT.md
2. Search skills-library for relevant patterns
3. Execute with skill guidance
4. Validate outputs

## Skills Integration
- Auto-search skills before implementation
- Reference skill IDs in commit messages
- Update skill effectiveness after use
```

---

## Phase 2: Migrate Existing Skills (Week 1, Days 3-5)

### 2.1 Migrate `skills/` → `skills-library/agents/`

| Current | New Location | Changes |
|---------|--------------|---------|
| `skills/dev-lifecycle/SKILL.md` | `skills-library/agents/planner/SKILL.md` | Add frontmatter, standard sections |
| `skills/simplify-implementation/SKILL.md` | `skills-library/agents/executor/SKILL.md` | Merge with executor behavior |
| `skills/debug/SKILL.md` | `skills-library/agents/debugger/SKILL.md` | New agent type |
| `skills/memory/SKILL.md` | `skills-library/agents/researcher/SKILL.md` | Merge into researcher |
| `skills/technical-writer/SKILL.md` | `skills-library/methodology/documentation/SKILL.md` | Convert to pattern |
| `skills/workflow/SKILL.md` | `skills-library/methodology/workflow/SKILL.md` | Convert to pattern |
| `skills/capture-knowledge/SKILL.md` | `skills-library/methodology/knowledge-capture/SKILL.md` | Convert to pattern |

### 2.2 Migrate `skills-library/` → `skills-library/patterns/`

| Current | New Location | Changes |
|---------|--------------|---------|
| `flutter/PROVIDER_STATE_MANAGEMENT.md` | `patterns/frontend/flutter/STATE_MANAGEMENT.md` | Add frontmatter |
| `flutter/API_INTEGRATION.md` | `patterns/frontend/flutter/API_INTEGRATION.md` | Add frontmatter |
| `python-fastapi/PROJECT_STRUCTURE.md` | `patterns/backend/fastapi/PROJECT_STRUCTURE.md` | Add frontmatter |
| `authentication/JWT_AUTH.md` | `patterns/authentication/JWT_AUTH.md` | Add frontmatter |
| `database/REPOSITORY_PATTERN.md` | `patterns/database/REPOSITORY_PATTERN.md` | Add frontmatter |
| `forms/FORM_VALIDATION.md` | `patterns/forms/VALIDATION.md` | Add frontmatter |

### 2.3 Migration Script

Create `scripts/migrate-skills.ts`:

```typescript
// Pseudocode
function migrateSkill(oldPath: string, newPath: string) {
  const content = readFile(oldPath);
  
  // Extract frontmatter or create default
  const frontmatter = parseOrCreateFrontmatter(content);
  
  // Add standard sections if missing
  const sections = ensureStandardSections(content);
  
  // Generate ID from path
  const id = generateSkillId(newPath);
  
  // Write new format
  writeFile(newPath, formatSkill({ id, frontmatter, sections }));
}
```

---

## Phase 3: Build Indexing System (Week 2, Days 1-3)

### 3.1 Index Schema

`skills-library/index.json`:

```json
{
  "version": "1.0.0",
  "generated_at": "2024-03-07T10:00:00Z",
  "skills_count": 42,
  "categories": {
    "authentication": ["jwt-auth-v1", "oauth-v1", "rbac-v1"],
    "database": ["repository-pattern-v1", "migrations-v1"],
    "agents": ["executor-v1", "planner-v1", "researcher-v1"]
  },
  "skills": {
    "jwt-auth-v1": {
      "id": "jwt-auth-v1",
      "name": "JWT Authentication",
      "path": "patterns/authentication/JWT_AUTH.md",
      "category": "authentication",
      "type": "pattern",
      "scope": "service",
      "difficulty": "Medium",
      "stacks": ["fastapi", "express", "django"],
      "effectiveness": 0.95,
      "usage_count": 12,
      "last_updated": "2024-03-07",
      "tags": ["auth", "jwt", "security"]
    }
  }
}
```

### 3.2 Index Generator

Create `engine/src/skills/index-generator.ts`:

```typescript
export class SkillIndexGenerator {
  async generate(): Promise<SkillIndex> {
    const skills = await this.scanSkills();
    const index = this.buildIndex(skills);
    await this.writeIndex(index);
    return index;
  }

  private async scanSkills(): Promise<Skill[]> {
    // Walk skills-library/, parse all .md files
    // Extract frontmatter
    // Validate required fields
  }

  private buildIndex(skills: Skill[]): SkillIndex {
    // Group by category
    // Build search index
    // Calculate stats
  }
}
```

### 3.3 Search Implementation

Update `engine/src/skills/skills_library.ts`:

```typescript
export class SkillsLibrary {
  private index: SkillIndex;

  async search(query: SkillSearchQuery): Promise<SkillSearchResult[]> {
    // Search by:
    // - Keywords in name/description/tags
    // - Category
    // - Stack
    // - Scope (ui/service/model/infra)
    // - Difficulty
    
    // Score by relevance
    // Return ranked results
  }

  async getById(id: string): Promise<Skill | null> {
    // Direct lookup from index
  }

  async findRelated(skillId: string): Promise<Skill[]> {
    // Find skills in same category
    // Find skills with shared tags
  }
}
```

---

## Phase 4: Integrate with Agent System (Week 2, Days 4-5)

### 4.1 Researcher Agent Integration

Update `agents/researcher/system-prompt.md`:

```markdown
# Researcher Agent

## Workflow
1. Analyze ticket requirements
2. **Search skills-library for relevant patterns**
3. Research external sources if needed
4. Produce RESEARCH.md with skill recommendations

## Skills Search
Use this process:
```
For each requirement:
  - Identify domain (auth, database, ui, etc.)
  - Search skills-library: `skills.search({ category, stack })`
  - Record relevant skill IDs in RESEARCH.md
```

## Output Format
RESEARCH.md must include:
- Summary
- Relevant Skills (with IDs): ["jwt-auth-v1", "repository-pattern-v1"]
- Recommended Approach
- Open Questions
```

### 4.2 Planner Agent Integration

Update `agents/planner/system-prompt.md`:

```markdown
# Planner Agent

## Workflow
1. Read RESEARCH.md
2. Load referenced skills
3. Create BLUEPRINT.md with skill integration

## Skill Integration
BLUEPRINT.md sections:
- **Recommended Skills**: List skill IDs from research
- **File Structure**: Reference skill "Files to Create" tables
- **Implementation Steps**: Reference skill code patterns
- **Validation**: Include skill validation checklists

## Example
```markdown
## Recommended Skills
- `jwt-auth-v1`: JWT authentication pattern
- `repository-pattern-v1`: Database access layer

## Implementation
### Step 1: Authentication (from jwt-auth-v1)
Files to create:
- `auth/service.py` - Token generation
- `auth/middleware.py` - Route protection

### Validation
- [ ] Token refresh implemented (jwt-auth-v1 checklist)
- [ ] Password hashed with bcrypt (jwt-auth-v1 checklist)
```
```

### 4.3 Executor Agent Integration

Update `agents/executor/system-prompt.md`:

```markdown
# Executor Agent

## Workflow
1. Read BLUEPRINT.md
2. Load all referenced skills
3. Execute following skill patterns exactly
4. Validate against skill checklists

## Skill Loading
Before each task:
```
Load skills referenced in BLUEPRINT:
  - Read skill files
  - Extract code patterns for current stack
  - Note validation checklist items
```

## Execution Rules
- Use skill code patterns as starting point
- Adapt to project context
- Check off validation items as you complete them
- Report skill effectiveness after use
```

### 4.4 Verifier Agent Integration

Update `agents/verifier/system-prompt.md`:

```markdown
# Verifier Agent

## Workflow
1. Read implementation
2. Load skills referenced in BLUEPRINT
3. Validate against skill checklists
4. Produce VERIFICATION.md

## Validation Process
```
For each referenced skill:
  - Load skill's "Validation Checklist"
  - Check implementation against each item
  - Record pass/fail for each check
  - Calculate skill adherence score
```

## Output
VERIFICATION.md includes:
- Skill Checklist Results (by skill ID)
- Overall Adherence Score
- Deviations with Justification
```

---

## Phase 5: Add Skill Commands (Week 3, Days 1-2)

### 5.1 CLI Commands

Add to `engine/src/commands/skills.ts`:

```typescript
export const skillsCommands = {
  // Search skills
  'skills:search': {
    description: 'Search skills library',
    args: [
      { name: 'query', description: 'Search query' },
      { name: '--category', optional: true },
      { name: '--stack', optional: true },
      { name: '--scope', optional: true }
    ],
    handler: async (args) => {
      const results = await skillsLibrary.search(args);
      displayResults(results);
    }
  },

  // Show skill details
  'skills:show': {
    description: 'Display skill details',
    args: [{ name: 'skill-id' }],
    handler: async (args) => {
      const skill = await skillsLibrary.getById(args['skill-id']);
      displaySkill(skill);
    }
  },

  // Add new skill
  'skills:add': {
    description: 'Add new skill to library',
    args: [
      { name: 'name', description: 'Skill name' },
      { name: '--category', required: true },
      { name: '--type', required: true }
    ],
    handler: async (args) => {
      await createSkillTemplate(args);
      console.log('Edit the file and run skills:index to register');
    }
  },

  // Regenerate index
  'skills:index': {
    description: 'Regenerate skills index',
    handler: async () => {
      await skillIndexGenerator.generate();
      console.log('Skills index updated');
    }
  },

  // Update skill effectiveness
  'skills:feedback': {
    description: 'Report skill effectiveness',
    args: [
      { name: 'skill-id' },
      { name: 'success', description: 'true/false' }
    ],
    handler: async (args) => {
      await updateSkillEffectiveness(args['skill-id'], args.success);
    }
  }
};
```

### 5.2 Usage Examples

```bash
# Search for JWT patterns
ai-engine skills:search "jwt authentication"
ai-engine skills:search --category authentication --stack fastapi

# Show skill details
ai-engine skills:show jwt-auth-v1

# Add new skill
ai-engine skills:add "OAuth2 Implementation" --category authentication --type pattern

# After editing skill file
ai-engine skills:index

# Report skill worked/didn't work
ai-engine skills:feedback jwt-auth-v1 true
ai-engine skills:feedback jwt-auth-v1 false
```

---

## Phase 6: Testing & Validation (Week 3, Days 3-5)

### 6.1 Test Plan

| Test | Method | Expected Result |
|------|--------|-----------------|
| Index generation | Run `skills:index` | `index.json` created with all skills |
| Skill search | `skills:search jwt` | Returns JWT-related skills |
| Agent integration | Run full ticket flow | Researcher includes skill recommendations |
| Migration validation | Compare old vs new | All skills migrated with correct format |
| Effectiveness tracking | Use skill, report feedback | Score updates in index |

### 6.2 Validation Checklist

- [ ] All 7 skills from `skills/` migrated
- [ ] All 6 patterns from `skills-library/` migrated
- [ ] Index generates without errors
- [ ] Search returns relevant results
- [ ] Researcher agent outputs skill IDs
- [ ] Planner references skills in BLUEPRINT
- [ ] Executor loads and follows skill patterns
- [ ] Verifier checks skill validation lists
- [ ] CLI commands work end-to-end
- [ ] Documentation updated

---

## Migration Timeline

| Week | Days | Phase | Deliverable |
|------|------|-------|-------------|
| 1 | 1-2 | Design | Unified schema, frontmatter spec |
| 1 | 3-5 | Migration | All skills in new structure |
| 2 | 1-3 | Indexing | `index.json`, search API |
| 2 | 4-5 | Integration | Agents use skills |
| 3 | 1-2 | Commands | CLI commands work |
| 3 | 3-5 | Testing | All tests pass |

---

## Success Metrics

1. **Coverage**: All existing skills migrated
2. **Search Quality**: Relevant skills in top 3 results
3. **Agent Adoption**: 100% of tickets reference ≥1 skill
4. **Effectiveness**: Skills have effectiveness scores >0.8
5. **Usage**: >50% of implementations follow skill patterns

---

## Risks & Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| Migration takes longer | Delay | Do in parallel with new feature work |
| Agents ignore skills | Low adoption | Enforce via prompt engineering + validation |
| Skill format confusion | Inconsistent | Provide templates + linting |
| Index out of sync | Stale data | Auto-regenerate on skill add/edit |
| Too many skills | Overwhelming | Start with 20 essential skills only |

---

## Immediate Next Steps

1. **Approve this plan** → Begin Phase 1
2. **Create feature branch** → `feature/unified-skills-library`
3. **Start with schema design** → Document in `skills-library/SCHEMA.md`
4. **Migrate 1 skill as pilot** → `simplify-implementation` → `agents/executor`
5. **Test pilot** → Verify agent can load and follow it

---

*Ready to begin?*
