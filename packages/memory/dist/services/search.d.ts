/**
 * FTS5 Query Builder
 * Converts natural language queries to FTS5 match expressions
 */
/**
 * Build FTS5 query from natural language input
 *
 * Strategy:
 * - Split query into words
 * - Use prefix matching (*) for partial matches
 * - Escape special characters
 */
export declare function buildFtsQuery(query: string): string;
/**
 * Build FTS5 query with column boosting
 * Uses bm25() with weights: title=10, content=5, tags=1
 */
export declare function buildSearchQuery(ftsQuery: string, scope?: string | null, limit?: number): {
    sql: string;
    params: unknown[];
};
/**
 * Build simple search query without FTS (fallback for empty queries)
 */
export declare function buildSimpleQuery(scope?: string | null, limit?: number): {
    sql: string;
    params: unknown[];
};
//# sourceMappingURL=search.d.ts.map