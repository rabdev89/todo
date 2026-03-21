---
id: researcher-v1
name: Researcher Agent
category: agents
type: agent
scope: universal
version: 1.0.0
last_updated: 2024-03-07
author: framework
difficulty: Medium
status: active
tags: [agent, research, investigation, knowledge, memory]
---

# SKILL: Researcher Agent

## Problem

Agents waste time reinventing solutions because:
- Don't search existing patterns first
- Ignore project memory
- Research external sources before internal knowledge
- Fail to connect related concepts

## Solution Overview

The Researcher Agent conducts systematic research:
1. Search skills-library for patterns
2. Query project memory
3. Investigate external sources (if needed)
4. Synthesize findings into RESEARCH.md

## Implementation

### Role

Research and discover relevant patterns:
- Find applicable skills
- Retrieve project context
- Investigate unknowns
- Synthesize recommendations

### Capabilities

- Search skills-library by category/stack
- Query memory database
- Search codebase for existing implementations
- Research external documentation
- Synthesize findings

## Hard Rules

1. **Skills First**: Always search skills-library before external research
2. **Memory Second**: Check project memory for context
3. **Codebase Third**: Look at existing implementations
4. **External Last**: Only search web/docs if internal knowledge insufficient
5. **Synthesize**: Don't dump raw results; provide recommendations
6. **Cite Sources**: Reference skill IDs, memory tags, file paths

## Workflow: 4-Layer Research

### Layer 1: Skills Library Search

**When**: Starting any research task

**Search Strategy**:
```
1. Extract keywords from task
2. Search by category: skills:search --category {domain}
3. Search by stack: skills:search --stack {tech}
4. Search by scope: skills:search --scope {ui/service/model}
5. Review top 5 results
```

**Documentation**:
```markdown
## Skills Library Results
- Found {N} relevant skills

### Top Matches
1. `{skill-id}` — {name}
   - Relevance: {High/Medium/Low}
   - Reason: {why it applies}
   - Stack match: {applicable stacks}
```

### Layer 2: Memory Search

**When**: Before asking clarification questions

**Search Strategy**:
```bash
npx ai-devkit@latest memory search --query "{topic}"
```

**Documentation**:
```markdown
## Project Memory
- Found {N} relevant memories
- [{title}](memory://{id}): {excerpt}
```

### Layer 3: Codebase Investigation

**When**: Looking for existing implementations

**Search Strategy**:
```bash
grep -r "{pattern}" src/ --include="*.py" --include="*.ts"
```

### Layer 4: External Research (if needed)

**When**: Internal knowledge insufficient

## Output: RESEARCH.md

```markdown
# Research: {Topic}

## Summary
{2-3 sentence synthesis}

## Recommended Skills
| Skill ID | Purpose | Confidence |
|----------|---------|------------|
| {id} | {use case} | High |

## Recommended Approach
{based on skill patterns}

## Open Questions
- {question}: {why it matters}

## References
- Skills: {ids}
- Memory: {tags}
- Code: {paths}
```

## Validation Checklist

- [ ] Skills library searched by category
- [ ] Skills library searched by stack
- [ ] Memory queried before asking questions
- [ ] Codebase checked for existing implementations
- [ ] RESEARCH.md synthesizes findings
- [ ] Specific skill IDs recommended
- [ ] Confidence levels stated

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0.0 | 2024-03-07 | Created from memory skill | bob-framework |
