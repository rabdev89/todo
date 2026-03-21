-- Migration 002: Session persistence support
-- Extends existing knowledge schema with session/query tracking
-- Created for Phase 5: Session Persistence & Parallel Processing

-- Sessions table (linked to knowledge via scope at application level)
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  project_path TEXT NOT NULL,
  start_time INTEGER NOT NULL,
  last_activity INTEGER NOT NULL,
  query_count INTEGER DEFAULT 0,
  -- Link to knowledge scope for project-level insights (application-level, not FK)
  knowledge_scope TEXT
);

-- Query history for context learning
CREATE TABLE IF NOT EXISTS query_history (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  query_text TEXT NOT NULL,
  query_type TEXT, -- 'search', 'context_build', 'pattern_detect'
  results_json TEXT, -- JSON array of results
  patterns_json TEXT, -- JSON array of detected patterns
  files_accessed TEXT, -- JSON array of file paths
  effectiveness REAL DEFAULT 0.5, -- 0-1, learned from user actions
  duration_ms INTEGER, -- How long the query took
  timestamp INTEGER NOT NULL,
  FOREIGN KEY (session_id) REFERENCES sessions(id)
);

-- FTS5 virtual table for query text search
-- Column weights: query_text=5, query_type=1
CREATE VIRTUAL TABLE IF NOT EXISTS query_history_fts USING fts5(
  query_text,
  query_type,
  content='query_history',
  content_rowid='rowid',
  tokenize='porter unicode61'
);

-- Triggers to keep FTS in sync
CREATE TRIGGER IF NOT EXISTS query_history_ai AFTER INSERT ON query_history BEGIN
  INSERT INTO query_history_fts(rowid, query_text, query_type)
  VALUES (NEW.rowid, NEW.query_text, NEW.query_type);
END;

CREATE TRIGGER IF NOT EXISTS query_history_ad AFTER DELETE ON query_history BEGIN
  INSERT INTO query_history_fts(query_history_fts, rowid, query_text, query_type)
  VALUES ('delete', OLD.rowid, OLD.query_text, OLD.query_type);
END;

CREATE TRIGGER IF NOT EXISTS query_history_au AFTER UPDATE ON query_history BEGIN
  INSERT INTO query_history_fts(query_history_fts, rowid, query_text, query_type)
  VALUES ('delete', OLD.rowid, OLD.query_text, OLD.query_type);
  INSERT INTO query_history_fts(rowid, query_text, query_type)
  VALUES (NEW.rowid, NEW.query_text, NEW.query_type);
END;

-- Context cache for fast retrieval
CREATE TABLE IF NOT EXISTS context_cache (
  ticket_id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  context_json TEXT NOT NULL, -- Serialized ContextPack
  generated_at INTEGER NOT NULL,
  ttl INTEGER DEFAULT 86400000, -- 24 hours in ms
  access_count INTEGER DEFAULT 0,
  last_accessed INTEGER,
  FOREIGN KEY (session_id) REFERENCES sessions(id)
);

-- Learned file relevance (per session)
CREATE TABLE IF NOT EXISTS file_relevance (
  id INTEGER PRIMARY KEY,
  session_id TEXT NOT NULL,
  file_path TEXT NOT NULL,
  relevance_score REAL DEFAULT 0.5, -- 0-1
  access_count INTEGER DEFAULT 0,
  last_accessed INTEGER,
  FOREIGN KEY (session_id) REFERENCES sessions(id),
  UNIQUE(session_id, file_path)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_query_session ON query_history(session_id);
CREATE INDEX IF NOT EXISTS idx_query_timestamp ON query_history(timestamp);
CREATE INDEX IF NOT EXISTS idx_context_session ON context_cache(session_id);
CREATE INDEX IF NOT EXISTS idx_file_session ON file_relevance(session_id);
CREATE INDEX IF NOT EXISTS idx_file_path ON file_relevance(file_path);

-- Index for file lookup in context cache (for invalidation)
CREATE INDEX IF NOT EXISTS idx_context_json ON context_cache(context_json);
