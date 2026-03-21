/**
 * Parallel Embedding Service
 *
 * Generates embeddings in parallel with controlled concurrency.
 * Respects Ollama rate limits while maximizing throughput.
 *
 * Phase 5: Session Persistence & Parallel Processing
 */
interface CodeChunk {
    id: string;
    file: string;
    content: string;
    lineStart: number;
    lineEnd: number;
    chunkType: 'code' | 'comment' | 'docstring';
}
interface EmbeddingConfig {
    batchSize?: number;
    concurrency?: number;
    retryAttempts?: number;
    retryDelay?: number;
}
/**
 * ParallelEmbeddingService generates embeddings with controlled concurrency
 *
 * Features:
 * - Respects Ollama concurrency limits (default 2)
 * - Batch processing for efficiency
 * - Retry logic for failed embeddings
 * - Progress tracking
 */
export declare class ParallelEmbeddingService {
    private embeddingService;
    private qdrant;
    private config;
    constructor(config?: EmbeddingConfig);
    /**
     * Generate embeddings for chunks in parallel
     * @param chunks Code chunks to embed
     * @param onProgress Optional progress callback
     * @returns Number of successfully embedded chunks
     */
    generateEmbeddings(chunks: CodeChunk[], onProgress?: (completed: number, total: number) => void): Promise<number>;
    /**
     * Process a batch of chunks
     */
    private processBatch;
    /**
     * Store embeddings in Qdrant
     */
    private storeInQdrant;
    /**
     * Split chunks into batches
     */
    private createBatches;
    /**
     * Delay for a specified duration
     */
    private delay;
    /**
     * Update configuration
     */
    setConfig(config: Partial<EmbeddingConfig>): void;
}
export {};
//# sourceMappingURL=parallel_embedding_service.d.ts.map