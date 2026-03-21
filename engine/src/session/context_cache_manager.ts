/**
 * Context Cache Manager
 * 
 * Manages caching of AgentContextPack objects for fast retrieval.
 * Uses packages/memory database for persistent caching with TTL support.
 * 
 * Phase 5: Session Persistence & Parallel Processing
 */

import * as path from 'path';
import { DatabaseConnection, getDatabase, initializeSchema } from '@ai-devkit/memory';
import { AgentContextPack } from '../context_builder';

interface CachedContextRow {
  ticket_id: string;
  session_id: string;
  context_json: string;
  generated_at: number;
  ttl: number;
  access_count: number;
  last_accessed: number;
}

/**
 * ContextCacheManager handles persistent caching of context packs
 * 
 * Features:
 * - Database-backed caching (survives process restarts)
 * - TTL (Time To Live) support for automatic expiration
 * - LRU (Least Recently Used) eviction when cache is full
 * - File change invalidation
 */
export class ContextCacheManager {
  private db: DatabaseConnection;
  private maxCacheSize: number = 100;
  private defaultTTL: number = 24 * 60 * 60 * 1000; // 24 hours in ms
  
  /**
   * Create a new ContextCacheManager
   * @param dbPath Path to SQLite database (defaults to engine/sessions/session_data.db)
   */
  constructor(dbPath?: string) {
    const defaultPath = path.join(process.cwd(), 'engine', 'sessions', 'session_data.db');
    this.db = getDatabase({ dbPath: dbPath || defaultPath });
    
    // Ensure session schema is initialized
    initializeSchema(this.db);
  }
  
  /**
   * Get cached context for a ticket
   * @param ticketId Ticket ID
   * @returns AgentContextPack or null if not found/expired
   */
  async get(ticketId: string): Promise<AgentContextPack | null> {
    const row = this.db.queryOne<CachedContextRow>(
      `SELECT * FROM context_cache WHERE ticket_id = ?`,
      [ticketId]
    );
    
    if (!row) return null;
    
    // Check TTL
    const now = Date.now();
    if (now - row.generated_at > row.ttl) {
      await this.invalidate(ticketId);
      return null;
    }
    
    // Update access stats
    this.db.execute(
      `UPDATE context_cache 
       SET access_count = access_count + 1, last_accessed = ?
       WHERE ticket_id = ?`,
      [now, ticketId]
    );
    
    try {
      return JSON.parse(row.context_json) as AgentContextPack;
    } catch (error) {
      console.error(`Failed to parse cached context for ${ticketId}:`, error);
      await this.invalidate(ticketId);
      return null;
    }
  }
  
  /**
   * Store context in cache
   * @param ticketId Ticket ID
   * @param sessionId Session ID
   * @param context AgentContextPack to cache
   * @param ttl Time to live in milliseconds (optional, defaults to 24 hours)
   */
  async set(
    ticketId: string, 
    sessionId: string, 
    context: AgentContextPack, 
    ttl?: number
  ): Promise<void> {
    // Check cache size and evict if needed
    const countRow = this.db.queryOne<{ count: number }>(
      `SELECT COUNT(*) as count FROM context_cache`
    );
    
    if (countRow && countRow.count >= this.maxCacheSize) {
      await this.evictLRU();
    }
    
    const now = Date.now();
    const ttlValue = ttl || this.defaultTTL;
    
    this.db.execute(
      `INSERT INTO context_cache 
       (ticket_id, session_id, context_json, generated_at, ttl, access_count, last_accessed)
       VALUES (?, ?, ?, ?, ?, 0, ?)
       ON CONFLICT(ticket_id) DO UPDATE SET
       context_json = excluded.context_json,
       generated_at = excluded.generated_at,
       ttl = excluded.ttl,
       access_count = 0,
       last_accessed = excluded.last_accessed`,
      [ticketId, sessionId, JSON.stringify(context), now, ttlValue, now]
    );
  }
  
  /**
   * Invalidate cached context for a ticket
   * @param ticketId Ticket ID
   */
  async invalidate(ticketId: string): Promise<void> {
    this.db.execute(
      `DELETE FROM context_cache WHERE ticket_id = ?`,
      [ticketId]
    );
  }
  
  /**
   * Invalidate all contexts that include a specific file
   * Called when a file changes to ensure cached contexts are fresh
   * @param filePath Path of changed file
   * @returns Number of contexts invalidated
   */
  async invalidateOnFileChange(filePath: string): Promise<number> {
    // Find all contexts that include this file
    const rows = this.db.query<{ ticket_id: string }>(
      `SELECT ticket_id FROM context_cache 
       WHERE context_json LIKE ?`,
      [`%${filePath}%`]
    );
    
    for (const row of rows) {
      await this.invalidate(row.ticket_id);
    }
    
    console.log(`Invalidated ${rows.length} contexts containing ${filePath}`);
    return rows.length;
  }
  
  /**
   * Invalidate all contexts for a session
   * @param sessionId Session ID
   */
  async invalidateSession(sessionId: string): Promise<void> {
    this.db.execute(
      `DELETE FROM context_cache WHERE session_id = ?`,
      [sessionId]
    );
  }
  
  /**
   * Get cache statistics
   * @returns Cache stats
   */
  async getStats(): Promise<{
    totalContexts: number;
    avgAccessCount: number;
    oldestContext: number | null;
  }> {
    const totalRow = this.db.queryOne<{ count: number }>(
      `SELECT COUNT(*) as count FROM context_cache`
    );
    
    const avgRow = this.db.queryOne<{ avg: number }>(
      `SELECT AVG(access_count) as avg FROM context_cache`
    );
    
    const oldestRow = this.db.queryOne<{ generated_at: number }>(
      `SELECT MIN(generated_at) as generated_at FROM context_cache`
    );
    
    return {
      totalContexts: totalRow?.count || 0,
      avgAccessCount: avgRow?.avg || 0,
      oldestContext: oldestRow?.generated_at || null
    };
  }
  
  /**
   * Clean up expired contexts
   * @returns Number of contexts removed
   */
  async cleanupExpired(): Promise<number> {
    const now = Date.now();
    
    const result = this.db.execute(
      `DELETE FROM context_cache WHERE ? - generated_at > ttl`,
      [now]
    );
    
    return result.changes || 0;
  }
  
  /**
   * Evict least recently used context when cache is full
   */
  private async evictLRU(): Promise<void> {
    // Remove least recently used
    this.db.execute(
      `DELETE FROM context_cache 
       WHERE ticket_id = (
         SELECT ticket_id FROM context_cache 
         ORDER BY last_accessed ASC 
         LIMIT 1
       )`
    );
  }
  
  /**
   * Close the database connection
   */
  close(): void {
    this.db.close();
  }
}
