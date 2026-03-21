/**
 * Worker Pool
 *
 * Manages a pool of worker threads for parallel processing.
 * Handles task queuing, worker lifecycle, and error recovery.
 *
 * Phase 5: Session Persistence & Parallel Processing
 */
interface WorkerPoolOptions {
    minWorkers?: number;
    maxWorkers?: number;
    taskTimeout?: number;
    idleTimeout?: number;
}
/**
 * WorkerPool manages a pool of worker threads for parallel processing
 *
 * Features:
 * - Dynamic worker scaling (min/max workers)
 * - Task queuing with priority
 * - Worker reuse for efficiency
 * - Automatic cleanup of idle workers
 * - Task timeout handling
 */
export declare class WorkerPool {
    private workers;
    private queue;
    private activeTasks;
    private taskCounter;
    private options;
    private workerScript;
    private shutdown;
    private idleCheckInterval?;
    constructor(workerScript: string, options?: WorkerPoolOptions);
    /**
     * Execute a task in a worker thread
     * @param type Task type
     * @param data Task data
     * @returns Promise resolving to task result
     */
    execute<T>(type: string, data: any): Promise<T>;
    /**
     * Execute multiple tasks in parallel with limited concurrency
     * @param tasks Array of task definitions
     * @param concurrency Maximum concurrent tasks
     * @returns Promise resolving to array of results
     */
    executeBatch<T>(tasks: Array<{
        type: string;
        data: any;
    }>, concurrency?: number): Promise<T[]>;
    /**
     * Get pool statistics
     */
    getStats(): {
        totalWorkers: number;
        busyWorkers: number;
        idleWorkers: number;
        queuedTasks: number;
        activeTasks: number;
    };
    /**
     * Gracefully shut down the worker pool
     * Waits for active tasks to complete, rejects queued tasks
     */
    terminate(): Promise<void>;
    private initializeMinWorkers;
    private createWorker;
    private replaceWorker;
    private getAvailableWorker;
    private processQueue;
    private handleWorkerMessage;
    private handleTaskTimeout;
    private startIdleCleanup;
}
export {};
//# sourceMappingURL=worker_pool.d.ts.map