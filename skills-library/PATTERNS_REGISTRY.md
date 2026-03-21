# Patterns Registry

**Note**: This is NOT a list of "skills". These are **code implementation patterns** — example implementations of common architectural challenges.

**Key Distinction**:
- **Skills** (`index.json`) = Behavioral instructions for agents + methodology decision frameworks
- **Patterns** (this file) = Code examples for solving specific technical problems
- **Relationship**: Skills guide HOW to work. Patterns show WHAT to build.

---

## Current Status

**Actual Pattern Files Found**: 15 implementation patterns  
**Location**: `skills-library/patterns/*/`  
**Format**: Markdown with code examples, no SKILL.md wrapper  

These exist on the filesystem but aren't "skills" because they don't have:
- SKILL.md wrapper with frontmatter
- Agent behavior guidance
- Methodology application scope

---

## Patterns by Domain

### Frontend Patterns

| Pattern | Stack | File | Status |
|---------|-------|------|--------|
| Flutter Provider State Management | Flutter | `patterns/frontend/flutter/STATE_MANAGEMENT.md` | ✅ Exists |
| Flutter API Integration | Flutter | `patterns/frontend/flutter/API_INTEGRATION.md` | ✅ Exists |

**Gap**: React, Vue, Svelte, Solid patterns needed.

### Backend Patterns

| Pattern | Stack | File | Status |
|---------|-------|------|--------|
| FastAPI Project Structure | FastAPI | `patterns/python-fastapi/PROJECT_STRUCTURE.md` | ✅ Exists |

**Gap**: Express, Django, NestJS, Go patterns needed.

### Authentication Patterns

| Pattern | Stack | File | Status |
|---------|-------|------|--------|
| JWT Authentication | Universal | `patterns/authentication/JWT_AUTH.md` | ✅ Exists |

**Gap**: OAuth, MFA, RBAC patterns needed.

### Database Patterns

| Pattern | Stack | File | Status |
|---------|-------|------|--------|
| Repository Pattern | SQLAlchemy | `patterns/database/REPOSITORY_PATTERN.md` | ✅ Exists |

**Gap**: Prisma, TypeORM, Mongoose, Django ORM, EF Core patterns needed.

### Form Validation Patterns

| Pattern | Stack | File | Status |
|---------|-------|------|--------|
| Form Validation | Universal | `patterns/forms/FORM_VALIDATION.md` | ✅ Exists |

**Gap**: Stack-specific patterns (React Hook Form, VeeValidate, Formik).

### API Patterns

| Pattern | Stack | File | Status |
|---------|-------|------|--------|
| API Design | Universal | `patterns/api/API_DESIGN.md` | ✅ Exists |

**Gap**: Versioning strategies, pagination more detail.

### Architecture Patterns

| Pattern | Domain | File | Status |
|---------|--------|------|--------|
| Error Handling | Universal | `patterns/architecture/ERROR_HANDLING.md` | ✅ Exists |
| Caching Strategy | Universal | `patterns/architecture/CACHING.md` | ✅ Exists |
| Structured Logging | Universal | `patterns/architecture/LOGGING.md` | ✅ Exists |
| Background Jobs | Universal | `patterns/architecture/BACKGROUND_JOBS.md` | ✅ Exists |
| Rate Limiting | Universal | `patterns/architecture/RATE_LIMITING.md` | ✅ Exists |
| File Upload & Storage | Universal | `patterns/architecture/FILE_UPLOAD.md` | ✅ Exists |
| Feature Flags | Universal | `patterns/architecture/FEATURE_FLAGS.md` | ✅ Exists |
| Testing Patterns | Universal | `patterns/methodology/TESTING.md` | ✅ Exists |

---

## How Patterns Relate to Skills

### Example: Building JWT Auth Feature

**Workflow**:
1. **Use Two-Track Workflow Skill** (`two-track-workflow-v1`)
   - Determines if this is Lean or Full track
   - Sets expectations for ceremony

2. **Use Knowledge Capture Skill** (`knowledge-capture-v1`)
   - After implementing JWT auth, capture what you learned
   - Save patterns for future projects

3. **Reference JWT Auth Pattern** (`patterns/authentication/JWT_AUTH.md`)
   - Copy code examples for your stack
   - Apply to your implementation
   - Validate against pattern's checklist

4. **Use Executor Agent Skill** (`executor-v1`)
   - Follow implementation discipline
   - Keep quality consistent
   - Report blockers honestly

---

## Adding New Patterns

When you discover a useful pattern during execution:

1. **Create markdown file** in `patterns/[domain]/[PATTERN_NAME].md`
2. **Document the pattern**:
   - Problem it solves
   - When to use it
   - Code examples for each relevant stack
   - Configuration needed
   - Validation checklist
   - Common mistakes
3. **Reference relevant skills**: Which behavioral skills apply when using this pattern?
4. **Document**: Add to this README under appropriate domain
5. **Move memory to pattern**: If you learned this via memory checkpoint, create the pattern file

---

## Integration Going Forward

### Phase 1 (Now)
- Patterns exist as markdown documentation
- Agents reference them manually
- No automatic discovery

### Phase 2 (Planned)
- Create PATTERN_LOADER in agent executor
- Agent can: `patterns.get('jwt-auth', stack='fastapi')`
- Auto-load relevant checklist

### Phase 3 (Future)
- Learning layer suggests new patterns after work completes
- Agents auto-discover needed patterns from BLUEPRINT
- Pattern effectiveness tracked (like skills)

---

## Previous Mistakes

**Old approach**: Tried to list patterns in `index.json` as "skills"
- Claimed 26 skills, 18 were patterns
- Confused agents about what they were using
- Made patterns seem like procedural guidance (they're code examples)

**This fix**: Separate registry for patterns, clear terminology
- Skills = behavioral frameworks
- Patterns = code implementations
- Agents understand the distinction

---

## Quick Reference

**Need a code pattern?** Search `patterns/[domain]/`  
**Need behavioral guidance?** Check `index.json` for skills  
**Not sure?** Read [SKILL_DISCOVERY.md](SKILL_DISCOVERY.md)  
