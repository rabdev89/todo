# Repository Intelligence Documentation

## Overview

Repository Intelligence provides AI-powered codebase understanding, enabling agents to intelligently query and understand your codebase instead of blind file reading.

## Architecture

The system follows the Fire-Flow architecture pattern with these key components:

### 1. Code Indexer (`src/repo_intelligence/indexer.ts`)
**Purpose**: Parses source files into searchable chunks
**Technology**: tree-sitter for universal code parsing
**Features**:
- Supports Python, TypeScript, JavaScript
- Extracts symbols (functions, classes, variables)
- Creates semantic chunks for embedding
- File watching for auto-reindexing

### 2. Storage Layer (`src/repo_intelligence/storage.ts`)
**Purpose**: Persistent storage for code metadata and vectors
**Technology**: Qdrant + JSON files
**Features**:
- Vector storage for semantic search
- JSON metadata (no database dependencies)
- Symbol indexing
- File relationship tracking

### 3. Embedding Service (`src/repo_intelligence/embeddings.ts`)
**Purpose**: Generates semantic embeddings for code chunks
**Technology**: Ollama (nomic-embed-text)
**Features**:
- Local embeddings (no API keys)
- Graceful fallback when unavailable
- Batch processing for efficiency

### 4. Search Service (`src/repo_intelligence/search.ts`)
**Purpose**: Intelligent code search and retrieval
**Features**:
- Semantic search with embeddings
- Keyword search as fallback
- Symbol search (functions, classes)
- Dependency tracking

### 5. Pattern Detector (`src/repo_intelligence/patterns.ts`)
**Purpose**: Identifies architectural patterns in code
**Features**:
- 15+ built-in patterns (Repository, Service, Factory, etc.)
- Confidence scoring
- Pattern-specific insights

### 6. Context Builder (`src/repo_intelligence/context.ts`)
**Purpose**: Assembles relevant context for AI agents
**Features**:
- Intelligent context packing
- Relevance scoring
- Skill suggestions
- Confidence metrics

### 7. Researcher Agent (`src/agents/researcher_agent.ts`)
**Purpose**: Orchestrates Repository Intelligence for research tasks
**Features**:
- Ticket-based research
- Query-based research
- Project overview generation
- Insight and recommendation generation

## Installation

1. **Install Dependencies**
```bash
cd engine
npm install
```

2. **Index Your Codebase**
```bash
# Index all source files
node dist/index.js index-repo -p ../web-applications

# Optional: Watch for changes
node dist/index.js index-repo -p ../web-applications --watch
```

3. **Generate Embeddings** (Optional)
```bash
# Install and start Ollama
ollama pull nomic-embed-text
ollama serve

# Generate embeddings
node dist/index.js embed
```

## Usage

### CLI Commands

| Command | Description | Example |
|---------|-------------|---------|
| `index-repo` | Index repository | `node dist/index.js index-repo -p ../web-applications` |
| `search` | Search code | `node dist/index.js search "authentication"` |
| `symbols` | Find symbols | `node dist/index.js symbols "UserService"` |
| `embed` | Generate embeddings | `node dist/index.js embed` |
| `repo-research` | Research with AI | `node dist/index.js repo-research "authentication" --query` |
| `overview` | Project overview | `node dist/index.js overview` |
| `stats` | Repository stats | `node dist/index.js stats` |

### Research Examples

**Query Research**:
```bash
node dist/index.js repo-research "authentication" --query
```

**Ticket Research**:
```bash
node dist/index.js repo-research "T-001"
```

**Project Overview**:
```bash
node dist/index.js overview
```

## Integration with Agents

### Context Builder Integration
```typescript
import { ContextBuilder } from './repo_intelligence/context';

const contextBuilder = new ContextBuilder(searchService, patternDetector, storage);
const context = await contextBuilder.buildContextForTicket("T-001");
```

### Researcher Agent Integration
```typescript
import { ResearcherAgent } from './agents/researcher_agent';

const researcher = new ResearcherAgent();
const results = await researcher.researchQuery("authentication");
```

## Pattern Detection

The system automatically detects these architectural patterns:

### Core Patterns
- **Repository Pattern**: Data access abstraction
- **Service Layer**: Business logic encapsulation
- **Dependency Injection**: Loose coupling
- **FastAPI**: Web framework patterns

### Design Patterns
- **Observer**: Event-driven architecture
- **Factory**: Object creation abstraction
- **Singleton**: Single instance management
- **Command**: Request encapsulation
- **Strategy**: Algorithm selection

### Infrastructure Patterns
- **Middleware**: Request/response processing
- **Error Handling**: Exception management
- **Configuration**: Settings management
- **Logging**: Audit trail
- **Caching**: Performance optimization
- **Validation**: Input verification

## Data Flow

```
Source Files → tree-sitter → Code Chunks
                                   ↓
                              JSON Storage
                                   ↓
                           Ollama → Embeddings
                                   ↓
                              Qdrant (Vectors)
                                   ↓
                         Context Builder → AI Agents
```

## Configuration

### Environment Variables
```bash
# Ollama configuration
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=nomic-embed-text

# Qdrant configuration
QDRANT_URL=http://localhost:6333
```

### File Patterns
```typescript
// Default include patterns
const DEFAULT_INCLUDE = [
  '**/*.py',
  '**/*.ts',
  '**/*.js',
  '**/*.tsx',
  '**/*.jsx'
];

// Default exclude patterns
const DEFAULT_EXCLUDE = [
  'node_modules/**',
  'dist/**',
  'build/**',
  '__pycache__/**',
  '*.pyc'
];
```

## Troubleshooting

### Common Issues

1. **Ollama Connection Failed**
   - Ensure Ollama is running: `ollama serve`
   - Check model: `ollama pull nomic-embed-text`

2. **Qdrant Connection Failed**
   - Ensure Qdrant is running: `docker run -p 6333:6333 qdrant/qdrant`
   - Check URL: http://localhost:6333

3. **No Search Results**
   - Re-index repository: `node dist/index.js index-repo -p ../web-applications`
   - Check file patterns match your source files

### Debug Mode
```bash
# Enable debug logging
DEBUG=repo-intelligence node dist/index.js search "test"
```

## Performance

### Indexing Performance
- **Small projects** (< 1000 files): < 30 seconds
- **Medium projects** (1000-5000 files): 1-2 minutes
- **Large projects** (> 5000 files): 5+ minutes

### Search Performance
- **Semantic search**: 100-500ms (with embeddings)
- **Keyword search**: 10-50ms
- **Symbol search**: 5-20ms

### Storage Requirements
- **Code metadata**: ~1MB per 1000 files
- **Embeddings**: ~1KB per chunk (depends on model)
- **Vectors**: Similar to embeddings size

## Security

### Local-First
- All processing happens locally
- No external API calls
- No data leaves your environment

### File Access
- Respects .gitignore
- Configurable include/exclude patterns
- Safe file system operations

## Future Enhancements

### Planned Features
1. **Session Persistence**: Cross-query memory
2. **Parallel Indexing**: Faster processing for large repos
3. **More Patterns**: 50+ architectural patterns
4. **Language Support**: Java, C#, Go, Rust
5. **Web UI**: Visual exploration interface

### Integration Roadmap
1. **Agent Registry**: Full agent system integration
2. **Skills Library**: Pattern-based skill suggestions
3. **CI/CD Pipeline**: Automated reindexing
4. **Monitoring**: Performance and usage metrics
