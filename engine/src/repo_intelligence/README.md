# Repository Intelligence - Phase 1 Implementation

> **Status**: Core indexing infrastructure built  
> **Next**: Install dependencies and test indexing

---

## ✅ What Was Built

### 1. Database Schema (`schema.sql`)
- Files table (track all source files)
- Symbols table (functions, classes, methods)
- Imports table (dependencies between files)
- Call graph table (who calls whom)
- Code chunks table (for semantic search)
- Detected patterns table (architecture patterns)

### 2. Database Manager (`database.ts`)
- SQLite wrapper with better-sqlite3
- Auto-initialization on first run
- Reset capability for clean re-indexing

### 3. Code Indexer (`indexer.ts`)
- Parses TypeScript/JavaScript via ts-morph
- Parses Python via regex (tree-sitter ready)
- Extracts: functions, classes, methods, imports
- Calculates content hashes for incremental updates
- Stores code in chunks for semantic search

### 4. CLI Command (`index-repo`)
```bash
npm run engine -- index-repo              # Index web-applications/
npm run engine -- index-repo --reset      # Reset and re-index
npm run engine -- index-repo --watch     # Watch for changes
```

---

## 📦 Files Created

```
engine/src/
├── repo_intelligence/
│   ├── index.ts           # Module exports
│   ├── schema.sql         # Database schema
│   ├── database.ts        # Database manager
│   ├── indexer.ts         # Code parsing & indexing
│   └── README.md          # This file
├── cli/commands/
│   └── index-repo.ts      # CLI command
└── index.ts               # Updated with new command
```

---

## 🚀 Next Steps to Test

### 1. Install Dependencies

```bash
cd engine
npm install
```

This installs:
- `better-sqlite3` - Fast SQLite
- `ts-morph` - TypeScript AST parser
- `glob` - File discovery
- Plus existing dependencies

### 2. Test Indexing

```bash
# Index the web-applications directory
npm run engine -- index-repo

# You should see:
# 🔍 Indexing repository: .../web-applications
#    Progress: 0/150 files
#    ...
# ✅ Indexing complete!
#    Files indexed: 150
#    Symbols found: 450
#    Imports found: 200
#    Duration: 3.2s
```

### 3. Verify Database

```bash
# Check the database was created
ls -la repo_index.db

# Query it directly
sqlite3 repo_index.db "SELECT COUNT(*) FROM files;"
sqlite3 repo_index.db "SELECT COUNT(*) FROM symbols;"
```

---

## 🔧 Troubleshooting

### Issue: `better-sqlite3` fails to install
**Fix**: Install build tools
```bash
# Windows
npm install --global windows-build-tools

# Mac
xcode-select --install

# Linux
sudo apt-get install build-essential
```

### Issue: TypeScript errors about missing modules
**Fix**: Install dev dependencies
```bash
npm install --save-dev @types/node @types/glob
```

---

## 📊 Expected Output

After running `index-repo`, you should have:

| Table | Expected Count | Description |
|-------|---------------|-------------|
| `files` | 100-500 | Source files indexed |
| `symbols` | 300-2000 | Functions, classes, methods |
| `imports` | 200-1000 | Import statements |
| `code_chunks` | 500-5000 | Searchable code segments |

---

## 🎯 Phase 1 Success Criteria

- [ ] `npm install` completes without errors
- [ ] `index-repo` command runs successfully
- [ ] Database file `repo_index.db` created
- [ ] Tables populated with data
- [ ] Incremental indexing works (unchanged files skipped)

**Once these pass → Ready for Phase 2 (Semantic Embeddings)**
