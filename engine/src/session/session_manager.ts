/**
 * Session Persistence Manager
 * 
 * Manages session-based query history, context caching, and learning
 * for the Repository Intelligence system.
 * 
 * Integrates with packages/memory for database storage.
 * Phase 5: Session Persistence & Parallel Processing
 */

import * as path from 'path';
import { DatabaseConnection, getDatabase, initializeSchema } from '@ai-devkit/memory';
import { ContextPack } from '../repo_intelligence/context';
import { SearchResult } from '../repo_intelligence/search';
import { DetectedPattern } from '../repo_intelligence/patterns';

interface Session {
  id: string;
  projectPath: string;
  startTime: number;
  lastActivity: number;
  queryCount: number;
  knowledgeScope: string;
}

interface QueryRecord {
  id: string;
  sessionId: string;
  query: string;
  queryType: string;
  results: SearchResult[];
  patterns: DetectedPattern[];
  filesAccessed: string[];
  effectiveness: number;
  duration: number;
  timestamp: number;
}

interface CachedContext {
  ticketId: string;
  sessionId: string;
  contextPack: ContextPack;
  generatedAt: number;
  ttl: number;
  accessCount: number;
  lastAccessed: number;
}

interface SessionContext {
  patterns: Map<string, number>;
  fileRelevance: Map<string, number>;
}

function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * SessionManager handles session persistence for Repository Intelligence
 * 
 * Features:
 * - Session creation and management
 * - Query history tracking
 * - Context caching with TTL
 * - File relevance learning
 * - Cross-reference with global knowledge
 */
export class SessionManager {
  private db: DatabaseConnection;
  private currentSession?: Session;
  
  /**
   * Create a new SessionManager
   * @param dbPath Path to SQLite database (defaults to engine/sessions/session_data.db)
   */
  constructor(dbPath?: string) {
    const defaultPath = path.join(process.cwd(), 'engine', 'sessions', 'session_data.db');
    this.db = getDatabase({ dbPath: dbPath || defaultPath });
    
    // Ensure session schema is initialized
    initializeSchema(this.db);
  }
  
  /**
   * Create a new session for a project
   * @param projectPath Path to the project being worked on
   * @returns Session ID
   */
  async createSession(projectPath: string): Promise<string> {
    const sessionId = generateUUID();
    const now = Date.now();
    const knowledgeScope = `session:${sessionId}`;
    
    this.db.execute(
      `INSERT INTO sessions (id, project_path, start_time, last_activity, query_count, knowledge_scope)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [sessionId, projectPath, now, now, 0, knowledgeScope]
    );
    
    this.currentSession = {
      id: sessionId,
      projectPath,
      startTime: now,
      lastActivity: now,
      queryCount: 0,
      knowledgeScope
    };
    
    console.log(`Session created: ${sessionId} for ${projectPath}`);
    return sessionId;
  }
  
  /**
   * Get session details by ID
   * @param sessionId Session ID
   * @returns Session object or undefined if not found
   */
  async getSession(sessionId: string): Promise<Session | undefined> {
    const row = this.db.queryOne<{
      id: string;
      project_path: string;
      start_time: number;
      last_activity: number;
      query_count: number;
      knowledge_scope: string;
    }>(
      `SELECT * FROM sessions WHERE id = ?`,
      [sessionId]
    );
    
    if (!row) return undefined;
    
    return {
      id: row.id,
      projectPath: row.project_path,
      startTime: row.start_time,
      lastActivity: row.last_activity,
      queryCount: row.query_count,
      knowledgeScope: row.knowledge_scope
    };
  }
  
  /**
   * Set the current active session
   * @param sessionId Session ID to set as current
   */
  async setCurrentSession(sessionId: string): Promise<void> {
    const session = await this.getSession(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }
    this.currentSession = session;
  }
  
  /**
   * Get the current active session
   * @returns Current session or undefined
   */
  getCurrentSession(): Session | undefined {
    return this.currentSession;
  }
  
  /**
   * Record a query in the session history
   * @param sessionId Session ID
   * @param query Query text
   * @param results Search results
   * @param patterns Detected patterns
   * @param duration Query duration in milliseconds
   * @returns Query ID
   */
  async recordQuery(
    sessionId: string,
    query: string,
    results: SearchResult[],
    patterns: DetectedPattern[],
    duration: number
  ): Promise<string> {
    const queryId = generateUUID();
    const now = Date.now();
    
    // Record query in history
    this.db.execute(
      `INSERT INTO query_history 
       (id, session_id, query_text, query_type, results_json, patterns_json, duration_ms, timestamp, effectiveness)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        queryId,
        sessionId,
        query,
        'context_build',
        JSON.stringify(results),
        JSON.stringify(patterns),
        duration,
        now,
        0.5 // Initial neutral effectiveness
      ]
    );
    
    // Update session stats
    this.db.execute(
      `UPDATE sessions 
       SET query_count = query_count + 1, last_activity = ?
       WHERE id = ?`,
      [now, sessionId]
    );
    
    // Update current session if applicable
    if (this.currentSession?.id === sessionId) {
      this.currentSession.queryCount++;
      this.currentSession.lastActivity = now;
    }
    
    // Store file relevance data
    for (const result of results) {
      await this.recordFileAccess(sessionId, result.file, result.relevance);
    }
    
    return queryId;
  }
  
  /**
   * Record file access for learning
   * @param sessionId Session ID
   * @param filePath File path accessed
   * @param relevance Initial relevance score
   */
  private async recordFileAccess(
    sessionId: string,
    filePath: string,
    relevance: number
  ): Promise<void> {
    const now = Date.now();
    
    // Upsert file relevance (insert or update)
    this.db.execute(
      `INSERT INTO file_relevance (session_id, file_path, relevance_score, access_count, last_accessed)
       VALUES (?, ?, ?, 1, ?)
       ON CONFLICT(session_id, file_path) DO UPDATE SET
       relevance_score = (relevance_score + excluded.relevance_score) / 2,
       access_count = access_count + 1,
       last_accessed = excluded.last_accessed`,
      [sessionId, filePath, relevance, now]
    );
  }
  
  /**
   * Find similar queries in session history
   * @param sessionId Session ID
   * @param query Query text to match
   * @param limit Maximum number of results
   * @returns Array of similar query records
   */
  async findSimilarQueries(
    sessionId: string,
    query: string,
    limit: number = 5
  ): Promise<QueryRecord[]> {
    // Build FTS5 query
    const keywords = this.extractKeywords(query);
    const ftsQuery = keywords.join(' OR ');
    
    const rows = this.db.query<{
      id: string;
      session_id: string;
      query_text: string;
      query_type: string;
      results_json: string;
      patterns_json: string;
      files_accessed: string;
      effectiveness: number;
      duration_ms: number;
      timestamp: number;
      rank: number;
    }>(
      `SELECT qh.*, rank
       FROM query_history qh
       JOIN query_history_fts fts ON fts.rowid = qh.rowid
       WHERE qh.session_id = ? 
       AND query_history_fts MATCH ?
       ORDER BY rank
       LIMIT ?`,
      [sessionId, ftsQuery, limit]
    );
    
    return rows.map((row: any) => ({
      id: row.id,
      sessionId: row.session_id,
      query: row.query_text,
      queryType: row.query_type,
      results: JSON.parse(row.results_json || '[]'),
      patterns: JSON.parse(row.patterns_json || '[]'),
      filesAccessed: row.files_accessed ? JSON.parse(row.files_accessed) : [],
      effectiveness: row.effectiveness,
      duration: row.duration_ms,
      timestamp: row.timestamp
    }));
  }
  
  /**
   * Get learned context for a session
   * @param sessionId Session ID
   * @returns Patterns and file relevance maps
   */
  async getSessionContext(sessionId: string): Promise<SessionContext> {
    // Get pattern frequency from this session
    const patternRows = this.db.query<{ patterns_json: string }>(
      `SELECT patterns_json 
       FROM query_history 
       WHERE session_id = ?`,
      [sessionId]
    );
    
    const patterns = new Map<string, number>();
    for (const row of patternRows) {
      try {
        const queryPatterns: DetectedPattern[] = JSON.parse(row.patterns_json || '[]');
        for (const pattern of queryPatterns) {
          patterns.set(pattern.name, (patterns.get(pattern.name) || 0) + 1);
        }
      } catch {
        // Skip invalid JSON
      }
    }
    
    // Get file relevance scores
    const fileRows = this.db.query<{ file_path: string; relevance_score: number }>(
      `SELECT file_path, relevance_score 
       FROM file_relevance 
       WHERE session_id = ?
       ORDER BY relevance_score DESC`,
      [sessionId]
    );
    
    const fileRelevance = new Map<string, number>();
    for (const row of fileRows) {
      fileRelevance.set(row.file_path, row.relevance_score);
    }
    
    return { patterns, fileRelevance };
  }
  
  /**
   * Update query effectiveness based on user actions
   * @param queryId Query ID
   * @param effectiveness New effectiveness score (0-1)
   */
  async updateEffectiveness(queryId: string, effectiveness: number): Promise<void> {
    this.db.execute(
      `UPDATE query_history SET effectiveness = ? WHERE id = ?`,
      [effectiveness, queryId]
    );
  }
  
  /**
   * List recent sessions
   * @param limit Maximum number of sessions to return
   * @returns Array of session objects
   */
  async listSessions(limit: number = 10): Promise<Session[]> {
    const rows = this.db.query<{
      id: string;
      project_path: string;
      start_time: number;
      last_activity: number;
      query_count: number;
      knowledge_scope: string;
    }>(
      `SELECT * FROM sessions 
       ORDER BY last_activity DESC 
       LIMIT ?`,
      [limit]
    );
    
    return rows.map((row: any) => ({
      id: row.id,
      projectPath: row.project_path,
      startTime: row.start_time,
      lastActivity: row.last_activity,
      queryCount: row.query_count,
      knowledgeScope: row.knowledge_scope
    }));
  }
  
  /**
   * Get session statistics
   * @param sessionId Session ID
   * @returns Statistics object
   */
  async getSessionStats(sessionId: string): Promise<{
    queryCount: number;
    learnedPatterns: string[];
    topFiles: string[];
  }> {
    const session = await this.getSession(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }
    
    const context = await this.getSessionContext(sessionId);
    
    // Get top patterns
    const learnedPatterns = Array.from(context.patterns.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name]) => name);
    
    // Get top files
    const topFiles = Array.from(context.fileRelevance.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([path]) => path);
    
    return {
      queryCount: session.queryCount,
      learnedPatterns,
      topFiles
    };
  }
  
  /**
   * Clean up old sessions
   * @param maxAge Maximum age in milliseconds (default 30 days)
   * @returns Number of sessions deleted
   */
  async cleanupOldSessions(maxAge: number = 30 * 24 * 60 * 60 * 1000): Promise<number> {
    const cutoff = Date.now() - maxAge;
    
    const result = this.db.execute(
      `DELETE FROM sessions WHERE last_activity < ?`,
      [cutoff]
    );
    
    return result.changes || 0;
  }
  
  /**
   * Extract keywords from query text for FTS5 search
   * @param query Query text
   * @returns Array of keywords
   */
  private extractKeywords(query: string): string[] {
    return query
      .toLowerCase()
      .split(/\s+/)
      .filter(word => word.length > 3)
      .filter(word => !['this', 'that', 'with', 'from', 'where', 'then', 'than'].includes(word));
  }
  
  /**
   * Cross-reference with global knowledge from packages/memory
   * @param query Query string
   * @param limit Maximum results
   * @returns Knowledge items
   */
  async getRelevantKnowledge(query: string, limit: number = 3): Promise<Array<{
    title: string;
    content: string;
    tags: string[];
    scope: string;
  }>> {
    // Use packages/memory search via SQL
    const keywords = this.extractKeywords(query);
    const ftsQuery = keywords.join(' OR ');
    
    const rows = this.db.query<{
      title: string;
      content: string;
      tags: string;
      scope: string;
    }>(
      `SELECT k.title, k.content, k.tags, k.scope
       FROM knowledge k
       JOIN knowledge_fts fts ON k.rowid = fts.rowid
       WHERE knowledge_fts MATCH ?
       ORDER BY bm25(knowledge_fts, 10.0, 5.0, 1.0)
       LIMIT ?`,
      [ftsQuery, limit]
    );
    
    return rows.map((row: any) => ({
      title: row.title,
      content: row.content,
      tags: row.tags ? JSON.parse(row.tags) : [],
      scope: row.scope
    }));
  }
  
  /**
   * Close the database connection
   */
  close(): void {
    this.db.close();
  }
}

export { Session, QueryRecord, SessionContext, CachedContext };
