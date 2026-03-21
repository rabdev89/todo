import { SearchService } from './search';
import { PatternDetector, DetectedPattern } from './patterns';
import { RepoStorage } from './storage';
export interface Ticket {
    id: string;
    title: string;
    description: string;
    status?: string;
    priority?: string;
    tags?: string[];
}
export interface ContextPack {
    ticket: {
        id: string;
        title: string;
        description: string;
    };
    files: Array<{
        path: string;
        relevance: number;
        content: string;
        lineStart: number;
        lineEnd: number;
        chunkType: 'code' | 'comment' | 'docstring';
    }>;
    symbols: Array<{
        name: string;
        type: string;
        file: string;
        lineStart: number;
        lineEnd: number;
        signature?: string;
        docstring?: string;
    }>;
    patterns: DetectedPattern[];
    dependencies: string[];
    skillSuggestions: string[];
    rationale: string;
    confidence: number;
    metadata: {
        totalFiles: number;
        totalSymbols: number;
        patternsCount: number;
        searchType: string;
    };
}
export declare class ContextBuilder {
    private search;
    private patterns;
    private storage;
    constructor(searchService: SearchService, patternDetector: PatternDetector, storage: RepoStorage);
    buildContext(ticket: Ticket): Promise<ContextPack>;
    private extractKeywordsFromTicket;
    private suggestSkills;
    private calculateConfidence;
    private generateRationale;
    buildContextForQuery(query: string): Promise<Partial<ContextPack>>;
    getProjectOverview(): Promise<{
        patterns: DetectedPattern[];
        stats: any;
        recommendations: string[];
    }>;
}
//# sourceMappingURL=context.d.ts.map