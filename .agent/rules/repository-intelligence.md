# Repository Intelligence Workflow Integration

## Overview

This document describes how Repository Intelligence integrates with the Three-Layer SDLC workflow.

## Integration Points

### Layer 1: Ticket-Level Flow (Research Phase)

**Before Repository Intelligence:**
```
Researcher → Manual file exploration → RESEARCH.md
```

**With Repository Intelligence:**
```
Researcher → Repo Intel Query → ContextPack → RESEARCH.md
```

**Commands:**
```bash
# Index repository (one-time setup)
npm run start --prefix ./engine -- index-repo -p ./web-applications

# Research with intelligent context
npm run start --prefix ./engine -- research T-001
```

**Output Enhancement:**
RESEARCH.md now includes:
- Detected architectural patterns
- Relevant files with relevance scores
- Suggested skills based on patterns
- Confidence metrics

### Layer 2: Epic-Level Flow (Pattern Consistency)

Repository Intelligence ensures pattern consistency across all tickets in an epic:

```bash
# Get epic-level overview
npm run start --prefix ./engine -- overview

# Check pattern distribution across epic
# Review architectural consistency
```

**Use Cases:**
- Verify all tickets follow detected patterns
- Identify architectural drift
- Ensure consistent implementation approaches

### Layer 3: PI-Level Flow (Production Intelligence)

Repository Intelligence provides codebase-wide insights:

```bash
# Full codebase analysis
npm run start --prefix ./engine -- overview

# Search across all indexed projects
npm run start --prefix ./engine -- search "payment processing"
```

## Workflow Commands

### Setup Commands

```bash
# Initialize Repository Intelligence
make setup-all

# Index codebase
make index

# Start file watching
make index-watch
```

### Research Commands

```bash
# Research specific functionality
make search QUERY="authentication"

# Research ticket
make research QUERY="T-001"

# Get project overview
make overview
```

### Agent Integration

```bash
# Run researcher with Repository Intelligence
make run-agent TICKET=T-001

# Run full pipeline
make run-pipeline TICKET=T-001
```

## Automation

### Pre-Implementation Hook

Before any implementation:

1. **Check if repository is indexed**
2. **Query relevant code** for the ticket
3. **Build context pack** with patterns and dependencies
4. **Generate RESEARCH.md** with intelligent insights

### Post-Implementation Hook

After implementation:

1. **Re-index modified files** (if watching disabled)
2. **Update pattern detection** with new code
3. **Verify pattern consistency**

## Best Practices

### For Researchers

1. **Always query Repository Intelligence first** before manual exploration
2. **Use semantic search** for concept-based queries
3. **Review detected patterns** to understand architecture
4. **Check confidence scores** - low scores indicate need for manual review

### For Planners

1. **Consider detected patterns** when creating BLUEPRINTs
2. **Use pattern-consistent approaches** in implementation plans
3. **Reference relevant files** from ContextPack

### For Executors

1. **Follow established patterns** detected in codebase
2. **Use suggested skills** from ContextPack
3. **Maintain architectural consistency**

### For Verifiers

1. **Verify pattern compliance** in implementation
2. **Check against ContextPack** recommendations
3. **Validate architectural consistency**

## Troubleshooting

### Repository Not Indexed

```bash
# Check index status
npm run start --prefix ./engine -- stats

# Re-index if needed
npm run start --prefix ./engine -- index-repo -p ./web-applications --reset
```

### No Search Results

```bash
# Check file patterns
npm run start --prefix ./engine -- stats

# Verify indexing completed
# Check if query matches indexed file types
```

### Low Confidence Scores

- **Expand search terms**: Try broader keywords
- **Check file patterns**: Ensure relevant files are included
- **Manual review**: Use insights as starting point, not final answer

## Performance Guidelines

### Indexing Performance

- **Small projects** (< 1000 files): < 60 seconds
- **Medium projects** (1000-5000 files): 1-3 minutes
- **Large projects** (> 5000 files): 5-10 minutes

### Search Performance

- **Keyword search**: < 50ms
- **Semantic search** (with embeddings): 100-500ms
- **Pattern detection**: Real-time during indexing

### Storage Requirements

- **Metadata**: ~1MB per 1000 files
- **Embeddings**: ~1KB per code chunk
- **Total**: Typically < 100MB for most projects

## Security & Privacy

### Local-First Architecture

- **100% local processing**: No data leaves your machine
- **No API keys required**: Zero cost, zero external dependencies
- **Docker-based services**: Qdrant runs locally

### Data Security

- **Vector storage**: Local Qdrant instance
- **Metadata**: JSON files in project directory
- **No cloud services**: Complete data privacy

## Integration Checklist

### For New Projects

- [ ] Run `make setup-all` to install dependencies
- [ ] Start Qdrant: `docker run -d --name qdrant -p 6333:6333 qdrant/qdrant`
- [ ] Index repository: `make index`
- [ ] Verify indexing: `make stats`
- [ ] Test search: `make search QUERY="test"`

### For Existing Projects

- [ ] Ensure `engine/` directory exists
- [ ] Run `make install` to install dependencies
- [ ] Configure `ci/ci_config.sh` for your tech stack
- [ ] Index existing codebase: `make index`
- [ ] Update agent prompts to use Repository Intelligence

### For CI/CD Integration

- [ ] Add indexing step to build pipeline
- [ ] Include pattern detection in code review
- [ ] Use Repository Intelligence for automated documentation
- [ ] Monitor indexing performance

## Future Enhancements

### Phase 5 (Planned)

- **Session Persistence**: Cross-query memory
- **Parallel Processing**: Multi-threaded indexing
- **50+ Patterns**: Expanded pattern library
- **Additional Languages**: Java, C#, Go, Rust support

### Advanced Features

- **Change Impact Analysis**: "What breaks if I change X?"
- **Documentation Sync**: Auto-update docs from code
- **Test Coverage Mapping**: "What code isn't tested?"
- **Cross-repo Search**: Search across multiple projects

## Summary

Repository Intelligence transforms the AI-assisted development workflow from manual exploration to intelligent, automated codebase understanding. It integrates seamlessly with all three layers of the SDLC, providing:

- **Faster research** (10x improvement)
- **Accurate context** (semantic search)
- **Pattern consistency** (automatic detection)
- **Zero cost** (100% local, no API keys)

For detailed technical documentation, see `engine/docs/REPOSITORY_INTELLIGENCE.md`.
