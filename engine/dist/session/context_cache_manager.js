"use strict";
/**
 * Context Cache Manager
 *
 * Manages caching of AgentContextPack objects for fast retrieval.
 * Uses packages/memory database for persistent caching with TTL support.
 *
 * Phase 5: Session Persistence & Parallel Processing
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContextCacheManager = void 0;
const path = __importStar(require("path"));
const memory_1 = require("@ai-devkit/memory");
/**
 * ContextCacheManager handles persistent caching of context packs
 *
 * Features:
 * - Database-backed caching (survives process restarts)
 * - TTL (Time To Live) support for automatic expiration
 * - LRU (Least Recently Used) eviction when cache is full
 * - File change invalidation
 */
class ContextCacheManager {
    db;
    maxCacheSize = 100;
    defaultTTL = 24 * 60 * 60 * 1000; // 24 hours in ms
    /**
     * Create a new ContextCacheManager
     * @param dbPath Path to SQLite database (defaults to engine/sessions/session_data.db)
     */
    constructor(dbPath) {
        const defaultPath = path.join(process.cwd(), 'engine', 'sessions', 'session_data.db');
        this.db = (0, memory_1.getDatabase)({ dbPath: dbPath || defaultPath });
        // Ensure session schema is initialized
        (0, memory_1.initializeSchema)(this.db);
    }
    /**
     * Get cached context for a ticket
     * @param ticketId Ticket ID
     * @returns AgentContextPack or null if not found/expired
     */
    async get(ticketId) {
        const row = this.db.queryOne(`SELECT * FROM context_cache WHERE ticket_id = ?`, [ticketId]);
        if (!row)
            return null;
        // Check TTL
        const now = Date.now();
        if (now - row.generated_at > row.ttl) {
            await this.invalidate(ticketId);
            return null;
        }
        // Update access stats
        this.db.execute(`UPDATE context_cache 
       SET access_count = access_count + 1, last_accessed = ?
       WHERE ticket_id = ?`, [now, ticketId]);
        try {
            return JSON.parse(row.context_json);
        }
        catch (error) {
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
    async set(ticketId, sessionId, context, ttl) {
        // Check cache size and evict if needed
        const countRow = this.db.queryOne(`SELECT COUNT(*) as count FROM context_cache`);
        if (countRow && countRow.count >= this.maxCacheSize) {
            await this.evictLRU();
        }
        const now = Date.now();
        const ttlValue = ttl || this.defaultTTL;
        this.db.execute(`INSERT INTO context_cache 
       (ticket_id, session_id, context_json, generated_at, ttl, access_count, last_accessed)
       VALUES (?, ?, ?, ?, ?, 0, ?)
       ON CONFLICT(ticket_id) DO UPDATE SET
       context_json = excluded.context_json,
       generated_at = excluded.generated_at,
       ttl = excluded.ttl,
       access_count = 0,
       last_accessed = excluded.last_accessed`, [ticketId, sessionId, JSON.stringify(context), now, ttlValue, now]);
    }
    /**
     * Invalidate cached context for a ticket
     * @param ticketId Ticket ID
     */
    async invalidate(ticketId) {
        this.db.execute(`DELETE FROM context_cache WHERE ticket_id = ?`, [ticketId]);
    }
    /**
     * Invalidate all contexts that include a specific file
     * Called when a file changes to ensure cached contexts are fresh
     * @param filePath Path of changed file
     * @returns Number of contexts invalidated
     */
    async invalidateOnFileChange(filePath) {
        // Find all contexts that include this file
        const rows = this.db.query(`SELECT ticket_id FROM context_cache 
       WHERE context_json LIKE ?`, [`%${filePath}%`]);
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
    async invalidateSession(sessionId) {
        this.db.execute(`DELETE FROM context_cache WHERE session_id = ?`, [sessionId]);
    }
    /**
     * Get cache statistics
     * @returns Cache stats
     */
    async getStats() {
        const totalRow = this.db.queryOne(`SELECT COUNT(*) as count FROM context_cache`);
        const avgRow = this.db.queryOne(`SELECT AVG(access_count) as avg FROM context_cache`);
        const oldestRow = this.db.queryOne(`SELECT MIN(generated_at) as generated_at FROM context_cache`);
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
    async cleanupExpired() {
        const now = Date.now();
        const result = this.db.execute(`DELETE FROM context_cache WHERE ? - generated_at > ttl`, [now]);
        return result.changes || 0;
    }
    /**
     * Evict least recently used context when cache is full
     */
    async evictLRU() {
        // Remove least recently used
        this.db.execute(`DELETE FROM context_cache 
       WHERE ticket_id = (
         SELECT ticket_id FROM context_cache 
         ORDER BY last_accessed ASC 
         LIMIT 1
       )`);
    }
    /**
     * Close the database connection
     */
    close() {
        this.db.close();
    }
}
exports.ContextCacheManager = ContextCacheManager;
