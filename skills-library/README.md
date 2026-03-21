# BOB Skills Library

**Strategy**: Local growth. Patterns extracted from real projects, not external registries.

Reusable **skills** (behavioral frameworks) + **patterns** (code examples) that scale with your tech stack.

## 🎯 Key Distinction

| **Skills** | **Patterns** |
|:---|:---|
| HOW to work | WHAT to build |
| Behavioral frameworks | Code implementations |
| Executor, Planner, Debugger agents | JWT auth, form validation, error handling |
| In: `index.json`, `agents/`, `methodology/` | In: `patterns/[domain]/` |

## 📚 Quick Start

- **Using skills?** → Read [SKILL_DISCOVERY.md](SKILL_DISCOVERY.md)
- **Using patterns?** → Read [PATTERNS_REGISTRY.md](PATTERNS_REGISTRY.md)
- **Growing patterns?** → Read [OPTION_A_LOCAL_GROWTH.md](OPTION_A_LOCAL_GROWTH.md)
- **Adding new skills?** → Check [SCHEMA.md](SCHEMA.md) and [SKILL_TEMPLATE.md](SKILL_TEMPLATE.md)

## Architecture

```
skills-library/
├── index.json                     # Truthful registry (28 skills)
├── SKILL_DISCOVERY.md             # How agents load skills
├── PATTERNS_REGISTRY.md           # Code implementation patterns
├── OPTION_A_LOCAL_GROWTH.md       # Growth strategy (YOU ARE HERE)
│
├── agents/                        # Agent behavior skills
│   ├── executor/SKILL.md          # How to implement code
│   ├── planner/SKILL.md           # How to plan features
│   ├── researcher/SKILL.md        # How to research solutions
│   ├── debugger/SKILL.md          # How to debug systematically
│   ├── verifier/SKILL.md          # How to verify quality
│   ├── security-engineer/SKILL.md # Security engineering & auditing
│   ├── ui-designer/SKILL.md       # UI design system engineering
│   └── architecture-designer/SKILL.md # System architecture & ADRs
│
├── methodology/                   # Cross-cutting methodology skills
│   ├── workflow/SKILL.md          # Two-track workflow decision
│   ├── documentation/SKILL.md     # How to write documentation
│   ├── knowledge-capture/SKILL.md # How to extract patterns
│   ├── breath-based-execution/SKILL.md # Parallel breath-based execution
│   ├── evidence-based-validation/SKILL.md # Evidence-driven validation
│   └── [other methodology skills]/
│
└── patterns/                      # Code implementation patterns (grows over time)
    ├── frontend/
    │   ├── flutter/               # Flutter UI patterns
    │   ├── react/                 # React patterns (add as you use)
    │   └── vue/                   # Vue patterns (add as you use)
    ├── backend/
    │   ├── python-fastapi/        # FastAPI patterns
    │   ├── express/               # Express patterns (add as you use)
    │   └── django/                # Django patterns (add as you use)
    ├── authentication/            # Auth patterns (multi-stack)
    ├── database/                  # Database patterns (multi-stack)
    ├── forms/                     # Form validation patterns
    ├── api/                       # API design patterns
    ├── architecture/              # Cross-cutting patterns
    └── [new domains]/             # Add as needed
```

## Skill Format

Each skill follows a standard format:

```markdown
# SKILL: [Name]

## Metadata
- **Category**: [category]
- **Scope**: [layer]
- **Difficulty**: [Simple/Medium/Complex]
- **Last Updated**: [date]
- **Effectiveness**: [High/Medium/Low] (tracked by Learning Layer)

## Problem
[What problem does this solve?]

## Solution Overview
[High-level approach]

## Implementation

### Files to Create
| File | Purpose | Layer |
|------|---------|-------|
| [path] | [description] | [ui/service/model] |

### Code Pattern
```[language]
[Code example showing the pattern]
```

### Key Principles
1. [Principle 1]
2. [Principle 2]

## Variations

### Variation A: [Name]
[When to use, differences from main pattern]

### Variation B: [Name]
[When to use, differences from main pattern]

## Integration

### With Other Skills
- [Skill name]: [How they work together]

### Dependencies
- [What must exist first]

## Examples

### Example 1: [Scenario]
[Concrete implementation example]

### Example 2: [Scenario]
[Concrete implementation example]

## Common Mistakes
- [Mistake 1]: [Why it's wrong, how to avoid]
- [Mistake 2]: [Why it's wrong, how to avoid]

## Validation Checklist
- [ ] [Specific check 1]
- [ ] [Specific check 2]

## References
- [Links to related skills]
- [Links to external resources]

## Success Metrics
- [Metric 1]: [How measured]
- [Metric 2]: [How measured]
```

## 🔄 How Skills Grow (Option A Strategy)

Skills library grows organically from real project work:

```
Project 1: Flutter App
  → Discover form validation pattern
  → Extract to patterns/flutter/FORM_VALIDATION.md
  → Documented with code examples

Project 2: FastAPI + React  
  → Discover token refresh strategy
  → Extract to patterns/fastapi/TOKEN_REFRESH.md
  → Discover API client pattern
  → Extract to patterns/react/API_CLIENT.md

Year 1 Result: 5+ proven patterns across 3 stacks
Year 2 Result: 20+ patterns (comprehensive coverage)
```

**See**: [OPTION_A_LOCAL_GROWTH.md](OPTION_A_LOCAL_GROWTH.md) for detailed strategy.

## 📋 Current Inventory (March 2026)

### Skills (Behavioral Frameworks)
| Category | Count | Status |
|:---|:---:|:---|
| **Agent skills** | 5 | ✅ Active |
| **Methodology skills** | 3 | ✅ Active |
| **Total skills** | **8** | **Truthful** |

See: [index.json](index.json) for complete list

### Patterns (Code Implementations)
| Domain | Count | Example |
|:---|:---:|:---|
| Frontend (Flutter) | 2 | Form handling, API integration |
| Backend (FastAPI) | 1 | Project structure |
| Authentication | 1 | JWT token management |
| Database | 1 | Repository pattern |
| Forms | 1 | Validation framework |
| Architecture | 7 | Error handling, caching, logging, etc. |
| **Total patterns** | **15** | **Growing** |

See: [PATTERNS_REGISTRY.md](PATTERNS_REGISTRY.md) for complete list

**Gap areas**: React, Express, Django, advanced patterns (will be filled as projects demand them)

## 🎓 Using Skills During Development

### When Implementing Code

1. **Load Executor Agent Skill**: Understand how to work
   ```
   "Never modify without approval"
   "Readability > brevity"
   "Validate as you go"
   ```

2. **Search patterns**: Does a similar pattern exist?
   ```
   Need JWT? → patterns/authentication/JWT_AUTH.md
   Need form validation? → patterns/forms/FORM_VALIDATION.md
   ```

3. **Execute with discipline**: Follow skill validation checklists

### When Completing Work

1. **Step 3: Update Repository Memory** (from WORKFLOW.md)
   ```
   "What pattern would help the next agent?"
   ```

2. **Extract if valuable**:
   ```
   → Create patterns/[domain]/NEW_PATTERN.md
   → Document with code + checklist
   → Add to PATTERNS_REGISTRY.md
   ```

3. **Pattern becomes reusable** for next similar project

See: [SKILL_DISCOVERY.md](SKILL_DISCOVERY.md) for detailed guidance

## 🏗️ Adding a New Pattern

Found a reusable solution? Extract it:

```bash
# 1. Create file
skills-library/patterns/[domain]/PATTERN_NAME.md

# 2. Use SKILL_TEMPLATE.md structure
# 3. Document: Problem → Solution → Code Examples → Checklist

# 4. Update PATTERNS_REGISTRY.md
# | Pattern Name | Stack | File | Status |
# | ... | ... | ... | ✅ |

# 5. Update index.json (optional, when pattern proven)
```

Pattern is now available for next project with same stack.

## 📂 File Contents

- **index.json** - Truthful registry of 8 actual skills, not aspirational claims
- **SKILL_DISCOVERY.md** - How agents should load and use skills
- **PATTERNS_REGISTRY.md** - Comprehensive pattern inventory with gaps noted
- **OPTION_A_LOCAL_GROWTH.md** - Strategic plan for organic pattern growth
- **SCHEMA.md** - Skill frontmatter specification
- **SKILL_TEMPLATE.md** - Template for new patterns
- **agents/** - Agent behavior skills (executor, planner, etc.)
- **methodology/** - Cross-cutting methodology skills  
- **patterns/** - Code implementation patterns (grows over time)

## ⚠️ Deprecated

The following are no longer used:

- ❌ `external-registry.json` - 70+ GitHub registries, never integrated
- ❌ `registry.json` - Metadata for unused registries
- ❌ Aspirational skill counts (old index.json claimed 26 skills, only 8 existed)

**Decision**: Focus on local, proven patterns instead of external infrastructure.

See: [OPTION_A_LOCAL_GROWTH.md](OPTION_A_LOCAL_GROWTH.md#removed-external-registries) for rationale

## 🚀 Next Steps

1. ✅ Decision locked: Local growth strategy (Option A)
2. Continue normal work, use Step 3 to extract patterns
3. Patterns grow from 15 → 30+ over next 12 months
4. Review quarterly what's being used, archive what's not
5. Eventually: Implement SKILL_LOADER for agent auto-discovery

## See Also

- [WORKFLOW_DECISION_GATE.md](../project-management/WORKFLOW_DECISION_GATE.md) - Mandatory first step
- [.agent/rules/WORKFLOW.md](../.agent/rules/WORKFLOW.md) - Step 3 pattern extraction process
- [framework/MEMORY_SEEDING.md](../framework/MEMORY_SEEDING.md) - Memory checkpoint integration
- [CLAUDE.md](../CLAUDE.md) - Agent interaction guidelines
  suggestSkillExtraction({
    pattern: extractPatternFromCode(),
    context: ticketContext,
    effectiveness: telemetry.effectivenessScore
  });
}
```

## Skill Search

Agents search skills using:

```typescript
// Search by keyword
skills.search({
  query: "flutter form validation",
  layer: "ui",
  tech: "flutter",
  limit: 5
});

// Search by category
skills.getByCategory("authentication");

// Search by effectiveness
skills.getMostEffective("api-patterns", 3);
```

## Versioning

Skills are versioned using Git:

```bash
# View skill history
git log --oneline skills-library/authentication/JWT_AUTH.md

# Rollback skill
git checkout [commit] -- skills-library/authentication/JWT_AUTH.md

# Compare versions
git diff HEAD~1 -- skills-library/authentication/JWT_AUTH.md
```

## Effectiveness Tracking

The Learning Layer tracks skill effectiveness:

```json
{
  "skill": "flutter-state-management",
  "applications": 15,
  "success_rate": 0.87,
  "avg_implementation_time": "4.2 hours",
  "common_issues": ["async initialization", "dispose handling"],
  "last_used": "2024-01-15"
}
```

Skills with low effectiveness are flagged for review.

## Comparison with Fire-Flow

| Feature | BOB Skills | Fire-Flow Skills |
|---------|-----------------|------------------|
| Structure | Category-based | Category-based |
| Format | Markdown + Metadata | Markdown |
| Search | Keyword + Layer + Tech | Keyword |
| Effectiveness Tracking | Learning Layer integration | Usage analytics |
| Auto-Extraction | Learning Layer suggests | Manual or pattern detection |
| Versioning | Git | Git |

## Future Enhancements

### Phase 2: Semantic Search
- Vector embeddings for skills
- Natural language queries
- Similarity matching

### Phase 3: Skill Composition
- Skills that reference other skills
- Skill templates with parameters
- Conditional skill application

### Phase 4: Skill Marketplace
- Import skills from community
- Export project-specific skills
- Skill ratings and reviews

## Integration with Agent System

```
┌────────────────────────────────────────┐
│         Agent Needs Pattern            │
└─────────────────┬──────────────────────┘
                  │
                  ↓
┌────────────────────────────────────────┐
│      Skills Library Search             │
│  - Keyword match                       │
│  - Layer filter                        │
│  - Tech filter                         │
│  - Effectiveness sort                  │
└─────────────────┬──────────────────────┘
                  │
                  ↓
┌────────────────────────────────────────┐
│      Agent Applies Skill               │
│  - Follows implementation guide        │
│  - Uses validation checklist           │
│  - Records effectiveness               │
└────────────────────────────────────────┘
```

## Quick Start

### For Agents

```markdown
When you need a pattern:

1. Check AVAILABLE_SKILLS.md for relevant category
2. Read skill files in that category
3. Select best match based on:
   - Relevance to task
   - Effectiveness rating
   - Layer compatibility
   - Tech stack match
4. Apply the pattern
5. Record results for Learning Layer
```

### For Humans

```bash
# List all skills
cat skills-library/AVAILABLE_SKILLS.md

# Find skills for flutter
grep -r "flutter" skills-library/ --include="*.md"

# Add new skill
cp skills-library/TEMPLATE.md skills-library/category/NEW_SKILL.md
# Edit, then commit: git add . && git commit -m "Add skill: NEW_SKILL"
```
