# Session Persistence

> **Phase 5 Feature: Cross-Query Memory for AI Agents**
>
> Session Persistence enables the Repository Intelligence system to learn from previous queries within a session, cache contexts for fast retrieval, and improve recommendations over time.

## Overview

Session Persistence transforms the Repository Intelligence system from a stateless query engine into a learning system that:

- **Remembers**: Tracks query history and file access patterns
- **Caches**: Stores computed contexts for fast retrieval (24h TTL)
- **Learns**: Improves file relevance scoring based on actual usage
- **Integrates**: Cross-references with global knowledge base

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      SESSION PERSISTENCE                         │
│                                                                  │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────┐  │
│  │ SessionManager   │  │ ContextCache     │  │ Learning     │  │
│  │                  │  │ Manager          │  │ Layer        │  │
│  │ • Create session │  │                  │  │              │  │
│  │ • Track queries  │  │ • Get/Set cache  │  │ • Pattern    │  │
│  │ • File relevance │  │ • TTL eviction   │  │   frequency  │  │
│  │ • Session stats  │  │ • LRU eviction   │  │ • File       │  │
│  └────────┬─────────┘  └────────┬─────────┘  │   ranking    │  │
│           │                     │            └──────────────┘  │
│           └──────────┬──────────┘                               │
│                      │                                          │
│           ┌──────────▼──────────┐                              │
│           │ packages/memory       │                              │
│           │ (SQLite + FTS5)       │                              │
│           │                       │                              │
│           │ • sessions table      │                              │
│           │ • query_history table │                              │
│           │ • context_cache table │                              │
│           │ • file_relevance table│                              │
│           └───────────────────────┘                              │
└─────────────────────────────────────────────────────────────────┘
```

## Components

### 1. SessionManager (`engine/src/session/session_manager.ts`)

Manages session lifecycle and query history.

**Key Features:**
- Create and track sessions per project
- Record queries with results and patterns
- Track file access with relevance scoring
- Find similar queries using FTS5 search
- Cross-reference with global knowledge

**API:**
```typescript
// Create a new session
const sessionId = await sessionManager.createSession('/path/to/project');

// Record a query for learning
await sessionManager.recordQuery(sessionId, query, results, patterns, duration);

// Get session context (learned patterns and file relevance)
const context = await sessionManager.getSessionContext(sessionId);

// Find similar past queries
const similar = await sessionManager.findSimilarQueries(sessionId, query);
```

### 2. ContextCacheManager (`engine/src/session/context_cache_manager.ts`)

Provides persistent caching of context packs.

**Key Features:**
- Database-backed caching (survives restarts)
- TTL (Time To Live) automatic expiration (default 24h)
- LRU (Least Recently Used) eviction when full
- File change invalidation

**API:**
```typescript
// Cache a context
await cacheManager.set(ticketId, sessionId, contextPack, ttl);

// Retrieve cached context
const context = await cacheManager.get(ticketId);

// Invalidate on file change
await cacheManager.invalidateOnFileChange(filePath);
```

### 3. ContextBuilder Integration (`engine/src/context_builder.ts`)

Enhanced to support session persistence.

**New Options:**
```typescript
const builder = new ContextBuilder({
    enableSessionPersistence: true,
    sessionId: process.env.AI_SESSION_ID
});

// Build context with caching and learning
const context = await builder.buildContext(ticketId);

// Record usage for learning
await builder.recordQueryUsage(ticketId, filesUsed, effectiveness);
```

## Database Schema

### Tables (in `packages/memory`)

**sessions**: Session metadata
```sql
id TEXT PRIMARY KEY
project_path TEXT NOT NULL
start_time INTEGER NOT NULL
last_activity INTEGER NOT NULL
query_count INTEGER DEFAULT 0
knowledge_scope TEXT -- Links to knowledge table
```

**query_history**: Query tracking with FTS5
```sql
id TEXT PRIMARY KEY
session_id TEXT NOT NULL
query_text TEXT NOT NULL
query_type TEXT -- 'search', 'context_build', 'pattern_detect'
results_json TEXT -- JSON array
patterns_json TEXT -- JSON array
files_accessed TEXT -- JSON array
effectiveness REAL DEFAULT 0.5
duration_ms INTEGER
timestamp INTEGER NOT NULL
-- FTS5 virtual table for text search
```

**context_cache**: Persistent caching
```sql
ticket_id TEXT PRIMARY KEY
session_id TEXT NOT NULL
context_json TEXT NOT NULL -- Serialized context
generated_at INTEGER NOT NULL
ttl INTEGER DEFAULT 86400000 (24h)
access_count INTEGER DEFAULT 0
last_accessed INTEGER
```

**file_relevance**: Learned file importance
```sql
id INTEGER PRIMARY KEY
session_id TEXT NOT NULL
file_path TEXT NOT NULL
relevance_score REAL DEFAULT 0.5
access_count INTEGER DEFAULT 0
last_accessed INTEGER
UNIQUE(session_id, file_path)
```

## CLI Commands

### Session Management

```bash
# Create a new session
ai-engine session start

# List recent sessions
ai-engine session list
ai-engine session list -n 20

# Show session statistics
ai-engine session stats <session-id>

# Show current session
ai-engine session current

# Clean up old sessions
ai-engine session cleanup -d 30
```

### Using Sessions with Other Commands

```bash
# Set session for a command
export AI_SESSION_ID=<session-id>
ai-engine research T-001

# Or use inline
ai-engine research T-001 --session <session-id>
```

## Configuration

### Environment Variables

```bash
# Active session ID
export AI_SESSION_ID=xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx

# Session database location (optional)
export AI_SESSION_DB=./engine/sessions/session_data.db
```

### ContextBuilder Options

```typescript
interface ContextBuilderConfig {
    // ... existing options
    
    // Phase 5: Session persistence
    enableSessionPersistence?: boolean;  // Default: false
    sessionId?: string;                 // Required if enabled
}
```

## Usage Examples

### Basic Session Usage

```typescript
import { SessionManager } from './session/session_manager';
import { ContextBuilder } from './context_builder';

// 1. Create a session
const sessionManager = new SessionManager();
const sessionId = await sessionManager.createSession(process.cwd());
console.log(`Session: ${sessionId}`);

// 2. Build context with session
const builder = new ContextBuilder({
    enableSessionPersistence: true,
    sessionId
});

const context = await builder.buildContext('T-001');
// Context is now cached for this session

// 3. Record usage for learning
await builder.recordQueryUsage('T-001', filesActuallyUsed, 0.8);

sessionManager.close();
```

### Learning from Usage

```typescript
// First query
const context1 = await builder.buildContext('T-001');
// User selects files from context1
await builder.recordQueryUsage('T-001', ['src/auth.ts', 'src/user.ts'], 0.9);

// Later, similar query
const context2 = await builder.buildContext('T-002');
// Files are now ranked by learned relevance
// 'src/auth.ts' and 'src/user.ts' appear higher
```

### Finding Similar Queries

```typescript
const sessionManager = new SessionManager();
const sessionId = 'existing-session-id';

// Find similar past queries
const similar = await sessionManager.findSimilarQueries(
    sessionId,
    "authentication implementation",
    5
);

console.log(`Found ${similar.length} similar queries:`);
for (const query of similar) {
    console.log(`  - ${query.query} (${query.effectiveness} effectiveness)`);
}
```

## Performance Characteristics

| Metric | Value |
|--------|-------|
| Cache Hit Latency | < 5ms |
| Cache Miss Latency | Query time + 5ms |
| Database Size | ~1MB per 1000 queries |
| Max Cached Contexts | 100 (configurable) |
| Default TTL | 24 hours |
| FTS5 Query Time | < 100ms |

## Benefits

### For Developers

1. **Faster Iteration**: Cached contexts reduce query time by 50-80%
2. **Better Recommendations**: System learns which files you actually use
3. **Continuity**: Pick up where you left off in previous sessions
4. **Insights**: See patterns in your workflow

### For AI Agents

1. **Context Awareness**: Remember previous interactions in the session
2. **Improved Accuracy**: Learn from user file selections
3. **Consistency**: Similar queries get similar results
4. **Knowledge Integration**: Cross-reference with global knowledge

## Troubleshooting

### Session Not Found

```bash
# Check if session exists
ai-engine session list

# Create new session if needed
ai-engine session start
```

### Cache Not Working

```bash
# Check cache stats
ai-engine session stats <session-id>

# Clear cache manually
# Delete engine/sessions/session_data.db (WARNING: loses all session data)
```

### Performance Issues

```bash
# Clean up old sessions
ai-engine session cleanup -d 7  # Keep only last 7 days

# Check database size
ls -lh engine/sessions/session_data.db
```

## Migration from Phase 4

If upgrading from Phase 4:

1. Session Persistence is **opt-in** - existing code works unchanged
2. Add `enableSessionPersistence: true` to ContextBuilder options
3. Create a session and pass the ID
4. That's it - caching and learning are automatic

## Future Enhancements

Phase 6+ possibilities:

- **Cross-Session Learning**: Learn patterns across sessions
- **Semantic Similarity**: Use embeddings for query matching
- **Collaborative Learning**: Share patterns across team
- **Auto-Cleanup**: Smart retention based on importance

## See Also

- `improvement6.md` - Full Phase 5 implementation plan
- `packages/memory/README.md` - Memory package documentation
- `engine/docs/REPOSITORY_INTELLIGENCE.md` - Repository Intelligence overview
