export interface IndexOptions {
    repoPath: string;
    include?: string[];
    exclude?: string[];
    watch?: boolean;
    parallel?: boolean;
    workers?: number;
}
export declare class CodeIndexer {
    private storage;
    private parsers;
    private watcher?;
    private isWatching;
    private currentRepoPath;
    private currentInclude;
    private currentExclude;
    constructor(dataPath?: string);
    index(options: IndexOptions): Promise<{
        files: number;
        symbols: number;
        imports: number;
        duration: number;
        changed: number;
    }>;
    private startWatching;
    private incrementalIndex;
    /**
     * Phase 5: Parallel indexing using worker threads
     */
    private indexParallel;
    private detectLanguage;
    private extractFromTree;
    private extractFunctionSymbol;
    private extractClassSymbol;
    private extractMethodSymbol;
    private extractImport;
    private extractDocstring;
    private isExported;
    private storeCodeChunks;
    private generateId;
    reset(): void;
    close(): void;
    initializeVectorStorage(): Promise<void>;
}
//# sourceMappingURL=indexer.d.ts.map