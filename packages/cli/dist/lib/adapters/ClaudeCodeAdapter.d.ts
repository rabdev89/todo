/**
 * Claude Code Adapter
 *
 * Detects running Claude Code agents by reading session files
 * from ~/.claude/ directory and correlating with running processes.
 */
import type { AgentAdapter, AgentInfo, ProcessInfo } from './AgentAdapter';
/**
 * Claude Code Adapter
 *
 * Detects Claude Code agents by:
 * 1. Finding running claude processes
 * 2. Reading session files from ~/.claude/projects/
 * 3. Matching sessions to processes via CWD
 * 4. Extracting status from session JSONL
 * 5. Extracting summary from history.jsonl
 */
export declare class ClaudeCodeAdapter implements AgentAdapter {
    readonly type: "Claude Code";
    /** Threshold in minutes before considering a session idle */
    private static readonly IDLE_THRESHOLD_MINUTES;
    private claudeDir;
    private projectsDir;
    private historyPath;
    constructor();
    /**
     * Check if this adapter can handle a given process
     */
    canHandle(processInfo: ProcessInfo): boolean;
    /**
     * Detect running Claude Code agents
     */
    detectAgents(): Promise<AgentInfo[]>;
    /**
     * Read all Claude Code sessions
     */
    private readSessions;
    /**
     * Read a session JSONL file
     * Only reads last 100 lines for performance with large files
     */
    private readSessionLog;
    /**
     * Read history.jsonl for user prompts
     * Only reads last 100 lines for performance
     */
    private readHistory;
    /**
     * Determine agent status from session entry
     */
    private determineStatus;
    /**
     * Generate unique agent name
     * Uses project basename, appends slug if multiple sessions for same project
     */
    private generateAgentName;
    /**
     * Truncate summary to ~40 characters
     */
    private truncateSummary;
    /**
     * Get relative time display (e.g., "2m ago", "just now")
     */
    private getRelativeTime;
}
