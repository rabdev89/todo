-- Repository Intelligence Database Schema
-- SQLite database for code indexing and semantic search

-- Core tables
CREATE TABLE IF NOT EXISTS files (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    path TEXT UNIQUE NOT NULL,
    language TEXT NOT NULL,
    last_modified INTEGER NOT NULL,
    lines_count INTEGER NOT NULL,
    content_hash TEXT NOT NULL,
    indexed_at INTEGER DEFAULT (unixepoch())
);

-- Code symbols (functions, classes, methods, etc.)
CREATE TABLE IF NOT EXISTS symbols (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    file_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('function', 'class', 'method', 'interface', 'type', 'variable', 'constant', 'enum')),
    line_start INTEGER NOT NULL,
    line_end INTEGER NOT NULL,
    signature TEXT,
    docstring TEXT,
    is_exported BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (file_id) REFERENCES files(id) ON DELETE CASCADE
);

-- Import/dependency tracking
CREATE TABLE IF NOT EXISTS imports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    file_id INTEGER NOT NULL,
    imported_name TEXT NOT NULL,
    source_module TEXT,
    is_external BOOLEAN DEFAULT FALSE,
    line_number INTEGER,
    FOREIGN KEY (file_id) REFERENCES files(id) ON DELETE CASCADE
);

-- Call graph (who calls whom)
CREATE TABLE IF NOT EXISTS call_graph (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    caller_symbol_id INTEGER NOT NULL,
    callee_symbol_id INTEGER NOT NULL,
    file_id INTEGER NOT NULL,
    line_number INTEGER,
    FOREIGN KEY (caller_symbol_id) REFERENCES symbols(id) ON DELETE CASCADE,
    FOREIGN KEY (callee_symbol_id) REFERENCES symbols(id) ON DELETE CASCADE,
    FOREIGN KEY (file_id) REFERENCES files(id) ON DELETE CASCADE,
    UNIQUE(caller_symbol_id, callee_symbol_id, file_id, line_number)
);

-- Code chunks for semantic search
CREATE TABLE IF NOT EXISTS code_chunks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    file_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    start_line INTEGER NOT NULL,
    end_line INTEGER NOT NULL,
    chunk_type TEXT DEFAULT 'code' CHECK(chunk_type IN ('code', 'comment', 'docstring')),
    FOREIGN KEY (file_id) REFERENCES files(id) ON DELETE CASCADE
);

-- Pattern detection cache
CREATE TABLE IF NOT EXISTS detected_patterns (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pattern_name TEXT NOT NULL,
    confidence REAL NOT NULL CHECK(confidence >= 0 AND confidence <= 1),
    evidence_files TEXT NOT NULL, -- JSON array of file paths
    detected_at INTEGER DEFAULT (unixepoch())
);

-- Index metadata
CREATE TABLE IF NOT EXISTS index_metadata (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at INTEGER DEFAULT (unixepoch())
);

-- Insert initial metadata
INSERT OR REPLACE INTO index_metadata (key, value) VALUES 
    ('schema_version', '1.0'),
    ('created_at', unixepoch());

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_symbols_file ON symbols(file_id);
CREATE INDEX IF NOT EXISTS idx_symbols_name ON symbols(name);
CREATE INDEX IF NOT EXISTS idx_symbols_type ON symbols(type);
CREATE INDEX IF NOT EXISTS idx_imports_file ON imports(file_id);
CREATE INDEX IF NOT EXISTS idx_imports_name ON imports(imported_name);
CREATE INDEX IF NOT EXISTS idx_call_graph_caller ON call_graph(caller_symbol_id);
CREATE INDEX IF NOT EXISTS idx_call_graph_callee ON call_graph(callee_symbol_id);
CREATE INDEX IF NOT EXISTS idx_chunks_file ON code_chunks(file_id);
