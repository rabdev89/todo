export interface EmbeddingOptions {
    model?: string;
    batchSize?: number;
    cachePath?: string;
}
export declare class EmbeddingService {
    private ollama;
    private model;
    private cache;
    private cachePath;
    constructor(options?: EmbeddingOptions);
    private loadCache;
    private saveCache;
    generateEmbedding(text: string): Promise<number[]>;
    generateBatchEmbeddings(texts: string[], batchSize?: number): Promise<number[][]>;
    embedQuery(query: string): Promise<number[]>;
    cosineSimilarity(a: number[], b: number[]): Promise<number>;
    findSimilar(queryEmbedding: number[], candidateEmbeddings: number[][], threshold?: number): Promise<Array<{
        index: number;
        similarity: number;
    }>>;
    private generateCacheKey;
    getCacheStats(): {
        size: number;
        model: string;
        cachePath: string;
    };
    clearCache(): void;
    testConnection(): Promise<boolean>;
    checkModel(): Promise<boolean>;
}
//# sourceMappingURL=embeddings.d.ts.map