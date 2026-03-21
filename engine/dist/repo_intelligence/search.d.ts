import { EmbeddingService } from './embeddings';
import { RepoStorage, CodeChunk } from './storage';
export interface SearchQuery {
    text?: string;
    type?: 'semantic' | 'keyword' | 'hybrid';
    filters?: {
        language?: string;
        filePattern?: string;
        symbolType?: string;
    };
    limit?: number;
    threshold?: number;
}
export interface SearchResult {
    id: string;
    file: string;
    lineStart: number;
    lineEnd: number;
    content: string;
    relevance: number;
    chunkType: 'code' | 'comment' | 'docstring';
    context?: {
        before: string[];
        after: string[];
    };
}
export declare class SearchService {
    private qdrant;
    private embeddings;
    private storage;
    constructor(embService: EmbeddingService, storage: RepoStorage);
    search(query: SearchQuery): Promise<SearchResult[]>;
    private semanticSearch;
    private keywordSearch;
    private getFilePath;
    searchSymbols(name: string, limit?: number): Promise<Array<{
        name: string;
        type: string;
        file: string;
        lineStart: number;
        lineEnd: number;
        signature?: string;
        docstring?: string;
    }>>;
    findDependents(symbolName: string): Promise<string[]>;
    searchFiles(pattern: string): Promise<Array<{
        path: string;
        language: string;
        linesCount: number;
        lastModified: number;
    }>>;
    getContextAroundChunk(chunkId: string, contextLines?: number): Promise<{
        before: CodeChunk[];
        target: CodeChunk;
        after: CodeChunk[];
    }>;
    getStats(): Promise<{
        totalFiles: number;
        totalSymbols: number;
        totalImports: number;
        totalChunks: number;
        vectorCount: number;
        cacheSize: number;
    }>;
}
//# sourceMappingURL=search.d.ts.map