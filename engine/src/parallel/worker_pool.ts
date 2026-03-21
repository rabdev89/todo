/**
 * Worker Pool
 * 
 * Manages a pool of worker threads for parallel processing.
 * Handles task queuing, worker lifecycle, and error recovery.
 * 
 * Phase 5: Session Persistence & Parallel Processing
 */

import { Worker } from 'worker_threads';
import * as path from 'path';
import * as os from 'os';

interface WorkerTask {
  id: string;
  type: 'parse' | 'embed' | 'pattern';
  data: any;
  resolve: (result: any) => void;
  reject: (error: Error) => void;
  timeout: NodeJS.Timeout;
}

interface WorkerPoolOptions {
  minWorkers?: number;
  maxWorkers?: number;
  taskTimeout?: number;
  idleTimeout?: number;
}

interface WorkerState {
  worker: Worker;
  busy: boolean;
  lastUsed: number;
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
export class WorkerPool {
  private workers: Map<number, WorkerState> = new Map();
  private queue: WorkerTask[] = [];
  private activeTasks: Map<string, WorkerTask> = new Map();
  private taskCounter: number = 0;
  private options: Required<WorkerPoolOptions>;
  private workerScript: string;
  private shutdown: boolean = false;
  private idleCheckInterval?: NodeJS.Timeout;

  constructor(workerScript: string, options: WorkerPoolOptions = {}) {
    this.workerScript = workerScript;
    this.options = {
      minWorkers: options.minWorkers ?? 2,
      maxWorkers: options.maxWorkers ?? os.cpus().length,
      taskTimeout: options.taskTimeout ?? 30000,
      idleTimeout: options.idleTimeout ?? 60000
    };

    // Initialize minimum workers
    this.initializeMinWorkers();
    
    // Start idle worker cleanup
    this.startIdleCleanup();
  }

  /**
   * Execute a task in a worker thread
   * @param type Task type
   * @param data Task data
   * @returns Promise resolving to task result
   */
  async execute<T>(type: string, data: any): Promise<T> {
    if (this.shutdown) {
      throw new Error('Worker pool is shutting down');
    }

    return new Promise((resolve, reject) => {
      this.taskCounter++;
      const taskId = `task-${this.taskCounter}-${Date.now()}`;

      const timeout = setTimeout(() => {
        this.handleTaskTimeout(taskId);
      }, this.options.taskTimeout);

      const task: WorkerTask = {
        id: taskId,
        type: type as any,
        data,
        resolve,
        reject,
        timeout
      };

      this.queue.push(task);
      this.processQueue();
    });
  }

  /**
   * Execute multiple tasks in parallel with limited concurrency
   * @param tasks Array of task definitions
   * @param concurrency Maximum concurrent tasks
   * @returns Promise resolving to array of results
   */
  async executeBatch<T>(
    tasks: Array<{ type: string; data: any }>,
    concurrency: number = this.options.maxWorkers
  ): Promise<T[]> {
    const results: T[] = new Array(tasks.length);
    let index = 0;

    const executeNext = async (): Promise<void> => {
      const currentIndex = index++;
      if (currentIndex >= tasks.length) return;

      const task = tasks[currentIndex];
      try {
        results[currentIndex] = await this.execute<T>(task.type, task.data);
      } catch (error: any) {
        results[currentIndex] = null as any;
        console.error(`Task ${currentIndex} failed:`, error.message);
      }
      await executeNext();
    };

    // Start workers up to concurrency limit
    const workers = Math.min(concurrency, tasks.length);
    await Promise.all(Array(workers).fill(null).map(() => executeNext()));

    return results;
  }

  /**
   * Get pool statistics
   */
  getStats(): {
    totalWorkers: number;
    busyWorkers: number;
    idleWorkers: number;
    queuedTasks: number;
    activeTasks: number;
  } {
    let busy = 0;
    let idle = 0;

    for (const state of this.workers.values()) {
      if (state.busy) {
        busy++;
      } else {
        idle++;
      }
    }

    return {
      totalWorkers: this.workers.size,
      busyWorkers: busy,
      idleWorkers: idle,
      queuedTasks: this.queue.length,
      activeTasks: this.activeTasks.size
    };
  }

  /**
   * Gracefully shut down the worker pool
   * Waits for active tasks to complete, rejects queued tasks
   */
  async terminate(): Promise<void> {
    this.shutdown = true;

    // Clear idle check interval
    if (this.idleCheckInterval) {
      clearInterval(this.idleCheckInterval);
    }

    // Reject all queued tasks
    while (this.queue.length > 0) {
      const task = this.queue.shift()!;
      clearTimeout(task.timeout);
      task.reject(new Error('Worker pool is shutting down'));
    }

    // Wait for active tasks to complete
    while (this.activeTasks.size > 0) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Terminate all workers
    const terminatePromises: Promise<void>[] = [];
    for (const [id, state] of this.workers.entries()) {
      terminatePromises.push(
        new Promise((resolve) => {
          state.worker.once('exit', () => resolve());
          state.worker.terminate();
        })
      );
    }

    await Promise.all(terminatePromises);
    this.workers.clear();
  }

  private initializeMinWorkers(): void {
    for (let i = 0; i < this.options.minWorkers; i++) {
      this.createWorker();
    }
  }

  private createWorker(): number {
    const workerId = Date.now() + Math.random();
    const worker = new Worker(this.workerScript);

    worker.on('message', (message) => {
      this.handleWorkerMessage(workerId, message);
    });

    worker.on('error', (error) => {
      console.error(`Worker ${workerId} error:`, error);
      this.replaceWorker(workerId);
    });

    worker.on('exit', (code) => {
      if (code !== 0 && !this.shutdown) {
        console.error(`Worker ${workerId} exited with code ${code}`);
        this.workers.delete(workerId);
        this.createWorker();
      }
    });

    this.workers.set(workerId, {
      worker,
      busy: false,
      lastUsed: Date.now()
    });

    return workerId;
  }

  private replaceWorker(workerId: number): void {
    const state = this.workers.get(workerId);
    if (state) {
      state.worker.terminate();
      this.workers.delete(workerId);
    }
    
    if (!this.shutdown) {
      this.createWorker();
    }
  }

  private getAvailableWorker(): number | null {
    for (const [id, state] of this.workers.entries()) {
      if (!state.busy) {
        state.busy = true;
        state.lastUsed = Date.now();
        return id;
      }
    }
    return null;
  }

  private processQueue(): void {
    if (this.queue.length === 0) return;

    // Try to get an available worker
    let workerId = this.getAvailableWorker();

    // If no workers available and we can create more, create one
    if (workerId === null && this.workers.size < this.options.maxWorkers) {
      workerId = this.createWorker();
      const state = this.workers.get(workerId)!;
      state.busy = true;
    }

    if (workerId === null) {
      // No workers available, will retry when one becomes free
      return;
    }

    const task = this.queue.shift()!;
    this.activeTasks.set(task.id, task);

    const state = this.workers.get(workerId)!;
    state.worker.postMessage({
      id: task.id,
      type: task.type,
      data: task.data
    });
  }

  private handleWorkerMessage(workerId: number, message: any): void {
    const { id, result, error } = message;
    const task = this.activeTasks.get(id);

    if (!task) {
      console.warn(`Received message for unknown task: ${id}`);
      return;
    }

    // Clear timeout
    clearTimeout(task.timeout);
    this.activeTasks.delete(id);

    // Mark worker as free
    const state = this.workers.get(workerId);
    if (state) {
      state.busy = false;
      state.lastUsed = Date.now();
    }

    // Resolve or reject the promise
    if (error) {
      task.reject(new Error(error));
    } else {
      task.resolve(result);
    }

    // Process next task if any
    this.processQueue();
  }

  private handleTaskTimeout(taskId: string): void {
    const task = this.activeTasks.get(taskId);
    if (task) {
      this.activeTasks.delete(taskId);
      task.reject(new Error(`Task ${taskId} timed out after ${this.options.taskTimeout}ms`));
      
      // Find and replace the worker handling this task
      for (const [id, state] of this.workers.entries()) {
        if (state.busy) {
          this.replaceWorker(id);
          break;
        }
      }
    }
  }

  private startIdleCleanup(): void {
    this.idleCheckInterval = setInterval(() => {
      if (this.shutdown) return;

      const now = Date.now();
      const workersToRemove: number[] = [];

      for (const [id, state] of this.workers.entries()) {
        // Don't go below minWorkers
        if (this.workers.size <= this.options.minWorkers) break;

        // Remove idle workers that haven't been used
        if (!state.busy && (now - state.lastUsed) > this.options.idleTimeout) {
          workersToRemove.push(id);
        }
      }

      for (const id of workersToRemove) {
        const state = this.workers.get(id);
        if (state) {
          state.worker.terminate();
          this.workers.delete(id);
        }
      }
    }, this.options.idleTimeout);
  }
}
