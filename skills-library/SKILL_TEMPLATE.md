---
id: skill-template-v1
name: Skill Template
category: methodology
type: pattern
scope: universal
version: 1.0.0
last_updated: 2024-03-07
author: bob-framework
difficulty: Medium
status: draft
stacks: []
universal: true
tags: [template, example]
---

# SKILL: {Name}

## Problem

What problem does this solve? Describe:
- The context where this applies
- Pain points developers face
- Why existing solutions are insufficient
- Consequences of not using this pattern

## Solution Overview

High-level approach in 2-3 sentences:
- Core concept
- Key benefits
- When to use / when NOT to use

## Implementation

### Files to Create

| File | Purpose | Layer | Stack |
|------|---------|-------|-------|
| `path/to/file.py` | Description | service | fastapi |
| `path/to/file.js` | Description | service | express |

### Code Patterns

#### Stack: {Stack1}

```python
# Example code for Stack1
class ExampleService:
    def method(self) -> Result:
        # Implementation
        pass
```

Key points:
- Important consideration 1
- Important consideration 2
- Best practice to follow

#### Stack: {Stack2}

```javascript
// Example code for Stack2
class ExampleService {
  method() {
    // Implementation
  }
}
```

Key points:
- Stack2-specific note
- Library recommendation
- Configuration required

### Configuration

Environment variables or config files needed:
- `VAR_NAME` — Description of what this does
- `CONFIG_KEY` — Another important setting

## Key Principles

1. **Principle Name**: Description of why this matters and how to apply it
2. **Another Principle**: Explanation with examples
3. **Third Principle**: Context where this applies

## Stack Variations

### {Stack1}

- Library recommendations: `library-name`
- Common patterns: specific to this stack
- Gotchas: things to watch out for

### {Stack2}

- Different approach required
- Alternative libraries
- Stack-specific constraints

## Integration

- **Related Skill** (`skill-id-v1`): How they work together
- **Prerequisite Skill** (`skill-id-v1`): What to implement first
- **Next Step** (`skill-id-v1`): What to add after this

## Common Mistakes

- **Mistake Name**: Why it's wrong and how to avoid it
- **Another Mistake**: Description of the anti-pattern and solution
- **Third Mistake**: What happens when you do this wrong

## Validation Checklist

- [ ] Specific, testable criteria 1
- [ ] Specific, testable criteria 2
- [ ] Specific, testable criteria 3
- [ ] Specific, testable criteria 4
- [ ] Specific, testable criteria 5

## Testing Strategy

### Unit Tests
- What to test
- Expected test cases
- Edge cases to cover

### Integration Tests
- Full flow verification
- Cross-component testing
- Performance benchmarks

## References

### Internal
- [Related Skill](skill-id-v1) — Why it relates
- [Prerequisite](skill-id-v1) — What you need first

### External
- [External Resource](https://example.com) — What it provides
- [Documentation](https://docs.example.com) — Official docs

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0.0 | 2024-03-07 | Initial release | bob-framework |

---

## Usage Instructions

To create a new skill from this template:

1. Copy this file: `cp SKILL_TEMPLATE.md your-skill-name.md`
2. Update the YAML frontmatter (especially `id`, `name`, `category`, `type`)
3. Fill in all sections
4. Remove this "Usage Instructions" section
5. Validate with: `ai-engine skills:validate your-skill-name.md`
6. Add to index: `ai-engine skills:index`

For agent skills, also include:
- Role definition
- Hard rules
- Workflow phases
- Integration with other agents

For methodology skills, focus on:
- Process steps
- When to use
- Decision trees
- Common pitfalls
