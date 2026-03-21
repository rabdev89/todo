"use strict";
/**
 * Worker Pool
 *
 * Manages a pool of worker threads for parallel processing.
 * Handles task queuing, worker lifecycle, and error recovery.
 *
 * Phase 5: Session Persistence & Parallel Processing
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkerPool = void 0;
const worker_threads_1 = require("worker_threads");
const os = __importStar(require("os"));
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
class WorkerPool {
    workers = new Map();
    queue = [];
    activeTasks = new Map();
    taskCounter = 0;
    options;
    workerScript;
    shutdown = false;
    idleCheckInterval;
    constructor(workerScript, options = {}) {
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
    async execute(type, data) {
        if (this.shutdown) {
            throw new Error('Worker pool is shutting down');
        }
        return new Promise((resolve, reject) => {
            this.taskCounter++;
            const taskId = `task-${this.taskCounter}-${Date.now()}`;
            const timeout = setTimeout(() => {
                this.handleTaskTimeout(taskId);
            }, this.options.taskTimeout);
            const task = {
                id: taskId,
                type: type,
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
    async executeBatch(tasks, concurrency = this.options.maxWorkers) {
        const results = new Array(tasks.length);
        let index = 0;
        const executeNext = async () => {
            const currentIndex = index++;
            if (currentIndex >= tasks.length)
                return;
            const task = tasks[currentIndex];
            try {
                results[currentIndex] = await this.execute(task.type, task.data);
            }
            catch (error) {
                results[currentIndex] = null;
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
    getStats() {
        let busy = 0;
        let idle = 0;
        for (const state of this.workers.values()) {
            if (state.busy) {
                busy++;
            }
            else {
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
    async terminate() {
        this.shutdown = true;
        // Clear idle check interval
        if (this.idleCheckInterval) {
            clearInterval(this.idleCheckInterval);
        }
        // Reject all queued tasks
        while (this.queue.length > 0) {
            const task = this.queue.shift();
            clearTimeout(task.timeout);
            task.reject(new Error('Worker pool is shutting down'));
        }
        // Wait for active tasks to complete
        while (this.activeTasks.size > 0) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        // Terminate all workers
        const terminatePromises = [];
        for (const [id, state] of this.workers.entries()) {
            terminatePromises.push(new Promise((resolve) => {
                state.worker.once('exit', () => resolve());
                state.worker.terminate();
            }));
        }
        await Promise.all(terminatePromises);
        this.workers.clear();
    }
    initializeMinWorkers() {
        for (let i = 0; i < this.options.minWorkers; i++) {
            this.createWorker();
        }
    }
    createWorker() {
        const workerId = Date.now() + Math.random();
        const worker = new worker_threads_1.Worker(this.workerScript);
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
    replaceWorker(workerId) {
        const state = this.workers.get(workerId);
        if (state) {
            state.worker.terminate();
            this.workers.delete(workerId);
        }
        if (!this.shutdown) {
            this.createWorker();
        }
    }
    getAvailableWorker() {
        for (const [id, state] of this.workers.entries()) {
            if (!state.busy) {
                state.busy = true;
                state.lastUsed = Date.now();
                return id;
            }
        }
        return null;
    }
    processQueue() {
        if (this.queue.length === 0)
            return;
        // Try to get an available worker
        let workerId = this.getAvailableWorker();
        // If no workers available and we can create more, create one
        if (workerId === null && this.workers.size < this.options.maxWorkers) {
            workerId = this.createWorker();
            const state = this.workers.get(workerId);
            state.busy = true;
        }
        if (workerId === null) {
            // No workers available, will retry when one becomes free
            return;
        }
        const task = this.queue.shift();
        this.activeTasks.set(task.id, task);
        const state = this.workers.get(workerId);
        state.worker.postMessage({
            id: task.id,
            type: task.type,
            data: task.data
        });
    }
    handleWorkerMessage(workerId, message) {
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
        }
        else {
            task.resolve(result);
        }
        // Process next task if any
        this.processQueue();
    }
    handleTaskTimeout(taskId) {
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
    startIdleCleanup() {
        this.idleCheckInterval = setInterval(() => {
            if (this.shutdown)
                return;
            const now = Date.now();
            const workersToRemove = [];
            for (const [id, state] of this.workers.entries()) {
                // Don't go below minWorkers
                if (this.workers.size <= this.options.minWorkers)
                    break;
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
exports.WorkerPool = WorkerPool;
