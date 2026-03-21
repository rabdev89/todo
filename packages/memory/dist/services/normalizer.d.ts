/**
 * Normalize title for deduplication
 */
export declare function normalizeTitle(title: string): string;
/**
 * Normalize content for hashing
 */
export declare function normalizeContent(content: string): string;
/**
 * Generate SHA-256 hash of normalized content for deduplication
 */
export declare function hashContent(content: string): string;
/**
 * Normalize tags
 */
export declare function normalizeTags(tags: string[]): string[];
/**
 * Validate and normalize scope
 */
export declare function normalizeScope(scope?: string): string;
//# sourceMappingURL=normalizer.d.ts.map