/**
 * Process Detection Utilities
 *
 * Utilities for detecting and inspecting running processes on the system.
 * Primarily focused on macOS/Unix-like systems using the `ps` command.
 */
import type { ProcessInfo } from '../lib/adapters/AgentAdapter';
/**
 * Options for listing processes
 */
export interface ListProcessesOptions {
    /** Filter processes by name pattern (case-insensitive) */
    namePattern?: string;
    /** Include only processes matching these PIDs */
    pids?: number[];
}
/**
 * List running processes on the system
 *
 * @param options Filtering options
 * @returns Array of process information
 *
 * @example
 * ```typescript
 * // List all Claude Code processes
 * const processes = listProcesses({ namePattern: 'claude' });
 *
 * // Get specific process info
 * const process = listProcesses({ pids: [12345] });
 * ```
 */
export declare function listProcesses(options?: ListProcessesOptions): ProcessInfo[];
/**
 * Get the current working directory for a specific process
 *
 * @param pid Process ID
 * @returns Working directory path, or empty string if unavailable
 */
export declare function getProcessCwd(pid: number): string;
/**
 * Get the TTY device for a specific process
 *
 * @param pid Process ID
 * @returns TTY device name (e.g., "ttys030"), or "?" if unavailable
 */
export declare function getProcessTty(pid: number): string;
/**
 * Check if a process with the given PID is running
 *
 * @param pid Process ID
 * @returns True if process is running
 */
export declare function isProcessRunning(pid: number): boolean;
/**
 * Get detailed information for a specific process
 *
 * @param pid Process ID
 * @returns Process information, or null if process not found
 */
export declare function getProcessInfo(pid: number): ProcessInfo | null;
