/**
 * Session Persistence Manager
 *
 * Manages session-based query history, context caching, and learning
 * for the Repository Intelligence system.
 *
 * Integrates with packages/memory for database storage.
 * Phase 5: Session Persistence & Parallel Processing
 */
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
export declare class SessionManager {
    private db;
    private currentSession?;
    /**
     * Create a new SessionManager
     * @param dbPath Path to SQLite database (defaults to engine/sessions/session_data.db)
     */
    constructor(dbPath?: string);
    /**
     * Create a new session for a project
     * @param projectPath Path to the project being worked on
     * @returns Session ID
     */
    createSession(projectPath: string): Promise<string>;
    /**
     * Get session details by ID
     * @param sessionId Session ID
     * @returns Session object or undefined if not found
     */
    getSession(sessionId: string): Promise<Session | undefined>;
    /**
     * Set the current active session
     * @param sessionId Session ID to set as current
     */
    setCurrentSession(sessionId: string): Promise<void>;
    /**
     * Get the current active session
     * @returns Current session or undefined
     */
    getCurrentSession(): Session | undefined;
    /**
     * Record a query in the session history
     * @param sessionId Session ID
     * @param query Query text
     * @param results Search results
     * @param patterns Detected patterns
     * @param duration Query duration in milliseconds
     * @returns Query ID
     */
    recordQuery(sessionId: string, query: string, results: SearchResult[], patterns: DetectedPattern[], duration: number): Promise<string>;
    /**
     * Record file access for learning
     * @param sessionId Session ID
     * @param filePath File path accessed
     * @param relevance Initial relevance score
     */
    private recordFileAccess;
    /**
     * Find similar queries in session history
     * @param sessionId Session ID
     * @param query Query text to match
     * @param limit Maximum number of results
     * @returns Array of similar query records
     */
    findSimilarQueries(sessionId: string, query: string, limit?: number): Promise<QueryRecord[]>;
    /**
     * Get learned context for a session
     * @param sessionId Session ID
     * @returns Patterns and file relevance maps
     */
    getSessionContext(sessionId: string): Promise<SessionContext>;
    /**
     * Update query effectiveness based on user actions
     * @param queryId Query ID
     * @param effectiveness New effectiveness score (0-1)
     */
    updateEffectiveness(queryId: string, effectiveness: number): Promise<void>;
    /**
     * List recent sessions
     * @param limit Maximum number of sessions to return
     * @returns Array of session objects
     */
    listSessions(limit?: number): Promise<Session[]>;
    /**
     * Get session statistics
     * @param sessionId Session ID
     * @returns Statistics object
     */
    getSessionStats(sessionId: string): Promise<{
        queryCount: number;
        learnedPatterns: string[];
        topFiles: string[];
    }>;
    /**
     * Clean up old sessions
     * @param maxAge Maximum age in milliseconds (default 30 days)
     * @returns Number of sessions deleted
     */
    cleanupOldSessions(maxAge?: number): Promise<number>;
    /**
     * Extract keywords from query text for FTS5 search
     * @param query Query text
     * @returns Array of keywords
     */
    private extractKeywords;
    /**
     * Cross-reference with global knowledge from packages/memory
     * @param query Query string
     * @param limit Maximum results
     * @returns Knowledge items
     */
    getRelevantKnowledge(query: string, limit?: number): Promise<Array<{
        title: string;
        content: string;
        tags: string[];
        scope: string;
    }>>;
    /**
     * Close the database connection
     */
    close(): void;
}
export { Session, QueryRecord, SessionContext, CachedContext };
//# sourceMappingURL=session_manager.d.ts.map