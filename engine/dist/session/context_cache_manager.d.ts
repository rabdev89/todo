/**
 * Context Cache Manager
 *
 * Manages caching of AgentContextPack objects for fast retrieval.
 * Uses packages/memory database for persistent caching with TTL support.
 *
 * Phase 5: Session Persistence & Parallel Processing
 */
import { AgentContextPack } from '../context_builder';
/**
 * ContextCacheManager handles persistent caching of context packs
 *
 * Features:
 * - Database-backed caching (survives process restarts)
 * - TTL (Time To Live) support for automatic expiration
 * - LRU (Least Recently Used) eviction when cache is full
 * - File change invalidation
 */
export declare class ContextCacheManager {
    private db;
    private maxCacheSize;
    private defaultTTL;
    /**
     * Create a new ContextCacheManager
     * @param dbPath Path to SQLite database (defaults to engine/sessions/session_data.db)
     */
    constructor(dbPath?: string);
    /**
     * Get cached context for a ticket
     * @param ticketId Ticket ID
     * @returns AgentContextPack or null if not found/expired
     */
    get(ticketId: string): Promise<AgentContextPack | null>;
    /**
     * Store context in cache
     * @param ticketId Ticket ID
     * @param sessionId Session ID
     * @param context AgentContextPack to cache
     * @param ttl Time to live in milliseconds (optional, defaults to 24 hours)
     */
    set(ticketId: string, sessionId: string, context: AgentContextPack, ttl?: number): Promise<void>;
    /**
     * Invalidate cached context for a ticket
     * @param ticketId Ticket ID
     */
    invalidate(ticketId: string): Promise<void>;
    /**
     * Invalidate all contexts that include a specific file
     * Called when a file changes to ensure cached contexts are fresh
     * @param filePath Path of changed file
     * @returns Number of contexts invalidated
     */
    invalidateOnFileChange(filePath: string): Promise<number>;
    /**
     * Invalidate all contexts for a session
     * @param sessionId Session ID
     */
    invalidateSession(sessionId: string): Promise<void>;
    /**
     * Get cache statistics
     * @returns Cache stats
     */
    getStats(): Promise<{
        totalContexts: number;
        avgAccessCount: number;
        oldestContext: number | null;
    }>;
    /**
     * Clean up expired contexts
     * @returns Number of contexts removed
     */
    cleanupExpired(): Promise<number>;
    /**
     * Evict least recently used context when cache is full
     */
    private evictLRU;
    /**
     * Close the database connection
     */
    close(): void;
}
//# sourceMappingURL=context_cache_manager.d.ts.map