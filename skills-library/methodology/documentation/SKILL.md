---
id: documentation-v1
name: Documentation Writing
category: methodology
type: methodology
scope: universal
version: 1.0.0
last_updated: 2024-03-07
author: bob-framework
difficulty: Medium
status: active
tags: [documentation, writing, review, clarity, technical-writing]
---

# SKILL: Documentation Writing

## Problem

Documentation fails when:
- Novices can't understand it
- Missing prerequisites or examples
- Not actionable (can't follow along)
- Poor structure, hard to navigate

## Solution Overview

Systematic documentation review and improvement:
1. Review as a novice would experience it
2. Rate 4 key dimensions
3. Identify issues by priority
4. Suggest concrete fixes

## Implementation

### When to Use

- Reviewing existing documentation
- Creating new docs
- Auditing READMEs
- Evaluating API documentation

### Review Dimensions (Rate 1-5)

| Dimension | Question | Rating |
|-----------|----------|--------|
| **Clarity** | Can a novice understand without help? | 1-5 |
| **Completeness** | Prerequisites, examples, edge cases covered? | 1-5 |
| **Actionability** | Can users copy-paste and follow along? | 1-5 |
| **Structure** | Logical flow from simple to complex? | 1-5 |

### Priority Levels

- **High**: Blocks novices from succeeding
- **Medium**: Causes confusion but workaround exists  
- **Low**: Polish and nice-to-have

## Workflow

### Step 1: Read as Novice

Clear your expert knowledge. Ask:
- What would I need to know first?
- Where would I get stuck?
- What terms might confuse me?

### Step 2: Rate Dimensions

Score each aspect 1-5 with notes:

```markdown
| Aspect | Rating | Notes |
|--------|--------|-------|
| Clarity | 3/5 | "API key" not explained, jargon used |
| Completeness | 4/5 | Good examples, missing error handling |
| Actionability | 2/5 | Commands don't work as written |
| Structure | 5/5 | Clear progression |
```

### Step 3: Identify Issues

List specific problems with line numbers:

```markdown
**Issues:**
1. [High] API key setup not explained (line 15)
2. [Medium] Error response not documented (line 42)
3. [Low] Could use more examples (throughout)
```

### Step 4: Suggest Concrete Fixes

Provide exact text, not vague advice:

```markdown
**Suggested Fixes:**

1. **API Key Setup** (line 15)
   Add:
   ```bash
   # Get your API key from https://example.com/settings
   export API_KEY="your_key_here"
   ```

2. **Error Handling** (line 42)
   Add section:
   ## Error Responses
   - `401 Unauthorized`: Invalid API key
   - `429 Too Many Requests`: Rate limit exceeded
```

## Key Principles

1. **Novice Mindset**: Review as if you've never seen it before
2. **Concrete Fixes**: Provide exact text, not "make it clearer"
3. **Actionable**: User should be able to follow without asking questions
4. **Rated**: Quantify quality for tracking improvement
5. **Prioritized**: Focus on blockers first

## Validation Checklist

- [ ] Reviewed from novice perspective
- [ ] All 4 dimensions rated 1-5
- [ ] Specific issues identified with line numbers
- [ ] Issues prioritized (High/Medium/Low)
- [ ] Concrete fix text provided
- [ ] Examples are copy-pasteable
- [ ] Prerequisites listed
- [ ] No unstated assumptions

## Output Template

```markdown
## [Document Name] Review

| Aspect | Rating | Notes |
|--------|--------|-------|
| Clarity | X/5 | {notes} |
| Completeness | X/5 | {notes} |
| Actionability | X/5 | {notes} |
| Structure | X/5 | {notes} |

**Issues:**
1. [High] {description} (line X)
2. [Medium] {description} (line X)
3. [Low] {description} (line X)

**Suggested Fixes:**
- {concrete fix with example text}

**Overall**: {PASS / NEEDS_WORK}
```

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0.0 | 2024-03-07 | Migrated from technical-writer skill | bob-framework |
