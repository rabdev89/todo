# Unified Skills Library Schema

**Version**: 1.0.0  
**Status**: Draft  
**Last Updated**: 2024-03-07

---

## Overview

This document defines the unified schema for all skills in bob-framework. All skills—whether agent behaviors, implementation patterns, or methodologies—follow this consistent format.

---

## Skill Types

| Type | Purpose | Location | Example |
|------|---------|----------|---------|
| `agent` | Agent behavior and rules | `skills-library/agents/{agent}/` | executor, planner, researcher |
| `pattern` | Implementation patterns | `skills-library/patterns/{domain}/` | jwt-auth, repository-pattern |
| `methodology` | Cross-cutting practices | `skills-library/methodology/{topic}/` | debugging, testing, workflow |

---

## Frontmatter Specification

All skills MUST include this YAML frontmatter:

```yaml
---
# Required Identity
id: jwt-auth-v1                    # Unique ID: {name}-{version}
name: JWT Authentication           # Human-readable name
version: 1.0.0                     # SemVer

# Required Classification
category: authentication           # Domain category
type: pattern                      # agent | pattern | methodology
scope: service                     # ui | service | model | infra | universal

# Required Metadata
last_updated: 2024-03-07           # ISO 8601 date
author: bob-framework                   # Creator

# Optional but Recommended
difficulty: Medium                 # Simple | Medium | Complex
status: active                     # active | deprecated | draft
stacks: [fastapi, express, django] # Supported tech stacks
universal: false                   # True if tech-agnostic

# Optional Tracking (auto-populated)
effectiveness: 0.95                # Success rate 0-1
usage_count: 12                    # Times applied
last_used: 2024-03-06              # Last application date

# Optional Relations
requires: [password-hashing-v1]    # Prerequisite skill IDs
related: [oauth-v1, session-v1]    # Related skill IDs
replaces: [custom-jwt-v1]          # Deprecated alternatives
replaced_by: null                  # If deprecated, what replaces it

# Optional Tags for Search
tags: [auth, jwt, security, tokens, http-only]
---
```

### Field Definitions

#### Required Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique identifier: `{kebab-name}-v{major}` e.g., `jwt-auth-v1` |
| `name` | string | Human-readable name |
| `version` | string | SemVer format |
| `category` | string | Domain category (see Categories) |
| `type` | string | `agent`, `pattern`, or `methodology` |
| `scope` | string | Where it applies: `ui`, `service`, `model`, `infra`, `universal` |
| `last_updated` | date | ISO 8601 format |
| `author` | string | Creator identifier |

#### Optional Fields

| Field | Type | Description |
|-------|------|-------------|
| `difficulty` | string | `Simple`, `Medium`, `Complex` |
| `status` | string | `active`, `deprecated`, `draft` |
| `stacks` | array | Tech stacks supported (for patterns) |
| `universal` | boolean | True if applies to all stacks |
| `effectiveness` | number | 0.0 - 1.0 success rate |
| `usage_count` | integer | Times applied |
| `last_used` | date | Last application |
| `requires` | array | Prerequisite skill IDs |
| `related` | array | Related skill IDs |
| `replaces` | array | Skills this replaces |
| `replaced_by` | string | If deprecated, replacement ID |
| `tags` | array | Search keywords |

---

## Categories

Skills are organized by domain:

| Category | Description | Examples |
|----------|-------------|----------|
| `agents` | Agent behaviors | executor, planner, researcher, verifier |
| `authentication` | Auth patterns | jwt-auth, oauth, rbac, sessions |
| `authorization` | Permission patterns | rbac, abac, claims-based |
| `database` | Data access patterns | repository, migrations, queries |
| `frontend` | UI patterns | state-management, routing, forms |
| `backend` | API patterns | rest-api, graphql, middleware |
| `forms` | Form handling | validation, multi-step, file-upload |
| `testing` | Testing patterns | unit-testing, e2e, mocking |
| `deployment` | Deploy patterns | ci-cd, containers, serverless |
| `security` | Security patterns | input-validation, encryption, csrf |
| `performance` | Optimization | caching, lazy-loading, pagination |
| `methodology` | Practices | debugging, code-review, workflow |
| `integration` | Third-party | stripe, zoom, oauth-providers |
| `infrastructure` | Infra patterns | docker, k8s, terraform |
| `realtime` | Real-time patterns | websockets, sse, polling |
| `state-management` | State patterns | redux, pinia, provider |
| `error-handling` | Error patterns | global-handler, retry-logic |

---

## Standard Sections

All skills MUST include these sections in order:

```markdown
# SKILL: {Name}

[YAML frontmatter above]

## Problem

What problem does this solve? Be specific:
- Context where this applies
- Pain points addressed
- Why existing solutions fall short

## Solution Overview

High-level approach:
- Core concept (2-3 sentences)
- Key benefits
- When to use / when not to use

## Implementation

### Files to Create

| File | Purpose | Layer | Stack |
|------|---------|-------|-------|
| `auth/jwt_service.py` | Token generation | service | fastapi |
| `auth/middleware.py` | Route protection | service | fastapi |

### Code Patterns

#### Stack: {Stack1}

```python
# FastAPI example
class JWTService:
    def create_token(self, user_id: str) -> str:
        ...
```

Key points:
- Use HS256 for simplicity, RS256 for microservices
- Store secrets in environment variables
- Set appropriate expiration (15min access, 7day refresh)

#### Stack: {Stack2}

```javascript
// Express example
const jwt = require('jsonwebtoken');

function generateToken(userId) {
  return jwt.sign({ sub: userId }, process.env.JWT_SECRET, { expiresIn: '15m' });
}
```

### Configuration

Environment variables needed:
- `JWT_SECRET` — signing key (min 256 bits)
- `JWT_ALGORITHM` — HS256 or RS256
- `JWT_ACCESS_EXPIRY` — access token TTL
- `JWT_REFRESH_EXPIRY` — refresh token TTL

## Key Principles

1. **Security First**: Never expose secrets in code or logs
2. **Expiration Strategy**: Short-lived access tokens, long-lived refresh tokens
3. **Token Storage**: HTTP-only cookies or secure mobile storage
4. **Rotation**: Refresh tokens should be single-use
5. **Revocation**: Maintain blocklist for compromised tokens

## Stack Variations

### FastAPI

- Use `python-jose` or `PyJWT` library
- Implement as dependency injection
- Leverage Pydantic for token validation

### Express

- Use `jsonwebtoken` package
- Implement as middleware
- Combine with `passport-jwt` for strategy

### Django

- Use `djangorestframework-simplejwt`
- Configure in settings.py
- Leverage built-in user model

## Integration

- **Password Hashing** (`password-hashing-v1`): Hash before storing
- **Repository Pattern** (`repository-pattern-v1`): Store tokens in DB
- **RBAC** (`rbac-v1`): Add roles to token claims
- **API Rate Limiting** (`rate-limit-v1`): Prevent brute force

## Common Mistakes

- **Storing secrets in code**: Use environment variables, never commit secrets
- **No token expiration**: Always set exp; infinite tokens are security risk
- **Missing refresh rotation**: Reusing refresh tokens allows replay attacks
- **Storing sensitive data in token**: JWT is decode-able; don't put PII inside
- **Not validating issuer/audience**: Verify tokens are from expected source

## Validation Checklist

- [ ] Access tokens expire in ≤15 minutes
- [ ] Refresh tokens expire in ≤7 days and are single-use
- [ ] Secrets stored in environment variables (not code)
- [ ] Token validation includes signature, expiration, issuer checks
- [ ] Refresh endpoint invalidates old refresh token on use
- [ ] Logout endpoint adds token to blocklist until expiration
- [ ] HTTPS only in production (cookies have Secure flag)
- [ ] HTTP-only cookies for web (prevent XSS token theft)
- [ ] Proper error responses (401 for missing/invalid, 403 for insufficient permissions)
- [ ] Rate limiting on auth endpoints (prevent brute force)

## Testing Strategy

### Unit Tests
- Token generation with valid/invalid payloads
- Token validation with expired signatures
- Refresh token rotation logic

### Integration Tests
- Full login → access → refresh → logout flow
- Concurrent request handling with near-expiry tokens
- Blocklist effectiveness

## References

### Internal
- [OAuth2 Implementation](oauth-v1)
- [RBAC Authorization](rbac-v1)
- [Password Hashing](password-hashing-v1)

### External
- [JWT.io](https://jwt.io) — Token debugger
- [RFC 7519](https://tools.ietf.org/html/rfc7519) — JWT spec
- [OWASP JWT Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_for_Java_Cheat_Sheet.html)

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0.0 | 2024-03-07 | Initial release | bob-framework |
```

---

## Agent Skills Format

Agent skills include behavior rules plus integration guidance:

```yaml
---
id: executor-v1
name: Executor Agent
category: agents
type: agent
scope: universal
version: 1.0.0
last_updated: 2024-03-07
author: bob-framework
---

# Executor Agent

## Role

Execute implementation tasks with honesty protocols and skill integration.

## Capabilities

- Read and understand BLUEPRINT.md
- Load and apply relevant skills
- Write production-quality code
- Validate against checklists
- Report progress and blockers

## Hard Rules

1. **Never modify without approval**: Show plan, wait for user OK
2. **Follow skill patterns**: When BLUEPRINT references a skill, use it exactly
3. **Validate as you go**: Check off validation items during implementation
4. **Report honestly**: If stuck, say so immediately
5. **Stay in scope**: Don't add features not in BLUEPRINT

## Workflow

### Phase 1: Preparation
1. Read BLUEPRINT.md
2. Identify all referenced skill IDs
3. Load each skill from skills-library
4. Extract code patterns for current stack
5. Note validation checklist items

### Phase 2: Implementation
For each task in BLUEPRINT:
1. Check if referenced skills apply
2. Copy skill code pattern as starting point
3. Adapt to project context (naming, types, etc.)
4. Check off validation items as completed
5. Write tests for new code

### Phase 3: Validation
1. Run all tests
2. Verify against skill checklists
3. Check for common mistakes
4. Produce completion report

## Skills Integration

### Auto-Search
Before starting work:
```
Search skills-library for:
- Category matching task domain
- Stack matching project tech
- Scope matching implementation layer
```

### Pattern Loading
When BLUEPRINT references `jwt-auth-v1`:
1. Load `skills-library/patterns/authentication/JWT_AUTH.md`
2. Extract "Code Patterns" section for current stack
3. Use as implementation template
4. Follow "Key Principles" exactly

### Effectiveness Reporting
After using a skill:
1. Did the pattern work as expected? (yes/no)
2. Any deviations needed? (describe)
3. Time saved vs custom implementation? (estimate)

Report via: `ai-engine skills:feedback {skill-id} {success}`

## Output Format

### Progress Updates
```
[PROGRESS] Task 2/5: JWT Service
- Using pattern: jwt-auth-v1
- Files created: auth/jwt_service.py, auth/middleware.py
- Checklist: 8/10 items complete
- Blockers: None
```

### Completion Report
```
[DONE] Authentication Implementation
- Skills applied: jwt-auth-v1, repository-pattern-v1
- Files modified: 5
- Tests added: 12
- Validation: 100% checklist items passed
- Deviations: None
```

## Error Handling

### On Skill Not Found
```
[WARNING] Skill oauth-v2 not found in library
Options:
1. Search for alternatives: `ai-engine skills:search oauth`
2. Implement custom solution
3. Request skill creation
Proceeding with option 1...
```

### On Validation Failure
```
[BLOCKED] Task 3/5: Token Refresh
- Checklist item failed: "Refresh tokens are single-use"
- Current implementation allows reuse
- Fix required before proceeding
```

## Integration with Other Agents

- **Planner**: Receives BLUEPRINT.md, executes it
- **Researcher**: Can request skill search during complex tasks
- **Verifier**: Validates output, reports skill adherence score
```

---

## Methodology Skills Format

```yaml
---
id: debugging-systematic-v1
name: Systematic Debugging
category: methodology
type: methodology
scope: universal
version: 1.0.0
last_updated: 2024-03-07
author: bob-framework
---

# SKILL: Systematic Debugging

## Problem

Random guessing wastes hours. Need structured approach to find and fix bugs.

## Solution Overview

5-phase debugging protocol:
1. **Reproduce** — Create minimal test case
2. **Isolate** — Binary search to locate cause
3. **Hypothesize** — Form theories, test predictions
4. **Fix** — Apply minimal surgical change
5. **Prevent** — Add test to prevent regression

## Implementation

### When to Use
- Any non-obvious bug (not typos)
- Intermittent issues
- Performance regressions
- Integration failures

### The DEBUG Protocol

#### D - Define the Problem
- [ ] Write down observed behavior
- [ ] Write down expected behavior
- [ ] Note when it started (git bisect if needed)
- [ ] Identify scope (affects all users? specific scenario?)

#### E - Establish Reproduction
- [ ] Create minimal test case
- [ ] Verify bug reproduces consistently
- [ ] Eliminate external dependencies
- [ ] Document exact steps

#### B - Binary Search Isolation
```
1. Identify code range (e.g., 1000 lines)
2. Add logging at midpoint
3. Determine if bug is before/after midpoint
4. Repeat with half the range
5. Continue until <20 lines identified
```

#### U - Understand Root Cause
- [ ] Trace data flow through suspect code
- [ ] Check assumptions (null? type? boundary?)
- [ ] Compare working vs broken state
- [ ] Identify exact line and condition

#### G - Generate Fix
- [ ] Form hypothesis about fix
- [ ] Test hypothesis (unit test first)
- [ ] Apply minimal change
- [ ] Verify fix works
- [ ] Check for side effects

## Key Principles

1. **Science, Not Magic**: Form hypotheses, test predictions
2. **Minimal Changes**: Fix root cause, not symptoms
3. **Reproduction First**: Can't verify fix without test case
4. **Git Bisect for History**: When did it break?
5. **Log Ruthlessly**: Add logging, not breakpoints

## Common Mistakes

- **Fixing symptoms**: Masking error without understanding cause
- **Shotgun debugging**: Changing multiple things at once
- **Assuming the cause**: Not verifying with data
- **Skipping reproduction**: "It works now" without understanding why
- **No regression test**: Bug comes back later

## Validation Checklist

- [ ] Bug has minimal reproduction case
- [ ] Root cause identified (specific line/condition)
- [ ] Fix addresses root cause, not symptom
- [ ] Fix is minimal (smallest possible change)
- [ ] All existing tests still pass
- [ ] New regression test added
- [ ] Fix verified in production-like environment
- [ ] Documentation updated if behavior changed

## Integration

- **Testing Strategy** (`testing-strategy-v1`): Add regression tests
- **Logging Patterns** (`logging-v1`): Instrument for debugging
- **Error Handling** (`error-handling-v1`): Improve error messages

## Tools

- `git bisect` — Find commit that introduced bug
- `console.log`/`print` — Fastest debugging (yes, really)
- Unit tests — Verify hypotheses quickly
- Debuggers — When logs aren't enough
```

---

## Validation

### Schema Validation

Use this checklist to validate skill files:

- [ ] YAML frontmatter present and valid
- [ ] All required fields present
- [ ] `id` follows naming convention
- [ ] `version` is valid SemVer
- [ ] `category` is from approved list
- [ ] `type` is one of: agent, pattern, methodology
- [ ] `scope` is one of: ui, service, model, infra, universal
- [ ] All sections present in correct order
- [ ] "Validation Checklist" section has ≥5 items
- [ ] Code examples are syntax-highlighted
- [ ] Internal links use skill IDs

### Testing

Before marking skill complete:

1. **Schema Test**: `ai-engine skills:validate {skill-file}`
2. **Search Test**: Can skill be found via search?
3. **Agent Test**: Agent can load and follow skill
4. **Integration Test**: Skill integrates with related skills

---

## Migration Guide

### Converting Old `skills/SKILL.md` → New Format

**Before** (`skills/simplify-implementation/SKILL.md`):
```yaml
---
name: simplify-implementation
description: Analyze and simplify...
---

# Simplify Implementation

## Hard Rules
- Do not modify until user approves

## Workflow
1. Gather Context
2. Analyze Complexity
...
```

**After** (`skills-library/methodology/simplification/SKILL.md`):
```yaml
---
id: simplification-v1
name: Code Simplification
category: methodology
type: methodology
scope: universal
version: 1.0.0
last_updated: 2024-03-07
author: bob-framework
difficulty: Medium
tags: [refactoring, complexity, readability]
---

# SKILL: Code Simplification

## Problem
Code becomes complex over time. Hard to read, maintain, and extend.

## Solution Overview
7-step simplification process:
1. Analyze complexity sources
2. Apply readability principles
3. Extract, consolidate, flatten
4. Validate no regressions

## Implementation

### When to Use
- Function >50 lines
- Nesting >3 levels deep
- Duplicate code blocks
- Unclear variable names

### Complexity Analysis
Check for:
- Deep nesting (if-in-if-in-if)
- Long parameter lists (>5)
- Magic numbers/strings
- Commented-out code
- Unused variables/functions

### Simplification Patterns

#### Extract Function
```python
# Before
if user and user.is_active and user.has_permission('admin'):
    if order and order.status == 'pending':
        process_order(order)

# After
def can_process_order(user, order):
    return (
        user and user.is_active and 
        user.has_permission('admin') and
        order and order.status == 'pending'
    )

if can_process_order(user, order):
    process_order(order)
```

## Key Principles
1. Readability over brevity
2. Explicit over implicit
3. Flatten nesting

## Validation Checklist
- [ ] No function >50 lines
- [ ] No nesting >3 levels
- [ ] No magic numbers
- [ ] All tests pass
```

---

*End of Schema Specification*
