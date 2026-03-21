import type { SearchResultItem } from '../types';
interface RawSearchResult {
    id: string;
    title: string;
    content: string;
    tags: string;
    scope: string;
    bm25_score: number;
}
interface RankingContext {
    contextTags?: string[];
    queryScope?: string | null;
}
/**
 * Apply ranking formula to search results
 *
 * Formula: final_score = bm25_score × tag_boost + scope_boost
 */
export declare function rankResults(results: RawSearchResult[], context: RankingContext): SearchResultItem[];
export {};
//# sourceMappingURL=ranker.d.ts.map