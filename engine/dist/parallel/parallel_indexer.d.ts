/**
 * Parallel Indexer
 *
 * High-performance multi-threaded file indexer.
 * Uses worker pool to parse files in parallel for 3-5x speedup.
 *
 * Phase 5: Session Persistence & Parallel Processing
 */
import { WorkerPool } from './worker_pool';
interface ParsedFile {
    path: string;
    language: string;
    imports: string[];
    exports: string[];
    functions: Array<{
        name: string;
        lineStart: number;
        lineEnd: number;
        signature?: string;
        docstring?: string;
    }>;
    classes: Array<{
        name: string;
        lineStart: number;
        lineEnd: number;
        methods: string[];
    }>;
    complexity: number;
    lines: number;
}
interface FileIndex {
    files: {
        [path: string]: ParsedFile;
    };
    lastUpdated: number;
}
interface IndexOptions {
    repoPath: string;
    include?: string[];
    exclude?: string[];
    batchSize?: number;
    onProgress?: (completed: number, total: number) => void;
}
/**
 * ParallelIndexer provides multi-threaded file indexing
 *
 * Performance:
 * - Small repo (100 files): ~10 sec (3x faster)
 * - Medium repo (1000 files): ~30 sec (4x faster)
 * - Large repo (5000 files): ~2-3 min (4x faster)
 */
export declare class ParallelIndexer {
    private workerPool;
    private storage;
    private batchSize;
    constructor();
    /**
     * Index a repository in parallel
     * @param options Index options
     * @returns FileIndex with parsed files
     */
    index(options: IndexOptions): Promise<FileIndex>;
    /**
     * Process a batch of files
     */
    private processBatch;
    /**
     * Find all files to index
     */
    private findFiles;
    /**
     * Detect programming language from file extension
     */
    private detectLanguage;
    /**
     * Split files into batches
     */
    private createBatches;
    /**
     * Get pool statistics
     */
    getStats(): ReturnType<WorkerPool['getStats']>;
    /**
     * Shut down the indexer
     */
    shutdown(): Promise<void>;
}
export {};
//# sourceMappingURL=parallel_indexer.d.ts.map