/**
 * Parallel Embedding Service
 * 
 * Generates embeddings in parallel with controlled concurrency.
 * Respects Ollama rate limits while maximizing throughput.
 * 
 * Phase 5: Session Persistence & Parallel Processing
 */

import { EmbeddingService } from '../repo_intelligence/embeddings';

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
export class ParallelEmbeddingService {
  private embeddingService: EmbeddingService;
  private qdrant: any;
  private config: Required<EmbeddingConfig>;

  constructor(config: EmbeddingConfig = {}) {
    this.embeddingService = new EmbeddingService();
    this.qdrant = null;
    
    this.config = {
      batchSize: config.batchSize ?? 10,
      concurrency: config.concurrency ?? 2, // Ollama-safe default
      retryAttempts: config.retryAttempts ?? 3,
      retryDelay: config.retryDelay ?? 1000
    };
  }

  /**
   * Generate embeddings for chunks in parallel
   * @param chunks Code chunks to embed
   * @param onProgress Optional progress callback
   * @returns Number of successfully embedded chunks
   */
  async generateEmbeddings(
    chunks: CodeChunk[],
    onProgress?: (completed: number, total: number) => void
  ): Promise<number> {
    if (chunks.length === 0) return 0;

    console.log(`🔄 Generating embeddings for ${chunks.length} chunks...`);
    console.log(`   Batch size: ${this.config.batchSize}, Concurrency: ${this.config.concurrency}`);

    let completed = 0;
    let failed = 0;
    const startTime = Date.now();

    // Split into batches
    const batches = this.createBatches(chunks, this.config.batchSize);

    // Process batches with controlled concurrency
    const queue: Promise<void>[] = [];
    let batchIndex = 0;

    const processNextBatch = async (): Promise<void> => {
      const currentIndex = batchIndex++;
      if (currentIndex >= batches.length) return;

      const batch = batches[currentIndex];
      
      try {
        await this.processBatch(batch);
        completed += batch.length;
      } catch (error: any) {
        console.error(`Batch ${currentIndex} failed:`, error.message);
        failed += batch.length;
      }

      if (onProgress) {
        onProgress(completed, chunks.length);
      }

      // Progress update
      const percent = Math.round((completed / chunks.length) * 100);
      console.log(`   Progress: ${completed}/${chunks.length} (${percent}%)`);

      // Process next batch
      await processNextBatch();
    };

    // Start workers up to concurrency limit
    const workers = Math.min(this.config.concurrency, batches.length);
    for (let i = 0; i < workers; i++) {
      queue.push(processNextBatch());
    }

    await Promise.all(queue);

    const duration = (Date.now() - startTime) / 1000;
    console.log(`\n✅ Embedded ${completed} chunks in ${duration.toFixed(1)}s`);
    
    if (failed > 0) {
      console.log(`⚠️ ${failed} chunks failed to embed`);
    }

    return completed;
  }

  /**
   * Process a batch of chunks
   */
  private async processBatch(chunks: CodeChunk[]): Promise<void> {
    // Generate embeddings for each chunk in the batch
    const embeddings: Array<{ chunk: CodeChunk; embedding: number[] }> = [];

    for (const chunk of chunks) {
      let attempt = 0;
      let success = false;

      while (attempt < this.config.retryAttempts && !success) {
        try {
          const embedding = await this.embeddingService.generateEmbedding(chunk.content);
          embeddings.push({ chunk, embedding });
          success = true;
        } catch (error: any) {
          attempt++;
          if (attempt >= this.config.retryAttempts) {
            throw new Error(`Failed to embed chunk ${chunk.id} after ${this.config.retryAttempts} attempts: ${error.message}`);
          }
          // Wait before retry
          await this.delay(this.config.retryDelay * attempt);
        }
      }
    }

    // Store in Qdrant
    if (embeddings.length > 0) {
      await this.storeInQdrant(embeddings);
    }
  }

  /**
   * Store embeddings in Qdrant
   */
  private async storeInQdrant(
    embeddings: Array<{ chunk: CodeChunk; embedding: number[] }>
  ): Promise<void> {
    const points = embeddings.map(({ chunk, embedding }) => ({
      id: chunk.id,
      vector: embedding,
      payload: {
        file: chunk.file,
        content: chunk.content,
        lineStart: chunk.lineStart,
        lineEnd: chunk.lineEnd,
        chunkType: chunk.chunkType
      }
    }));

    try {
      if (!this.qdrant) {
        const mod: any = await import('@qdrant/js-client-rest');
        const QdrantClient = mod.QdrantClient;
        this.qdrant = new QdrantClient({
          url: 'http://localhost:6333',
          timeout: 10000
        });
      }
      await this.qdrant.upsert('code_chunks', { points });
    } catch (error: any) {
      throw new Error(`Failed to store embeddings in Qdrant: ${error.message}`);
    }
  }

  /**
   * Split chunks into batches
   */
  private createBatches<T>(items: T[], batchSize: number): T[][] {
    const batches: T[][] = [];
    for (let i = 0; i < items.length; i += batchSize) {
      batches.push(items.slice(i, i + batchSize));
    }
    return batches;
  }

  /**
   * Delay for a specified duration
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Update configuration
   */
  setConfig(config: Partial<EmbeddingConfig>): void {
    this.config = { ...this.config, ...config };
  }
}
