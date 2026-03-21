/**
 * Agent Manager
 *
 * Orchestrates agent detection across multiple adapter types.
 * Manages adapter registration and aggregates results from all adapters.
 */
import type { AgentAdapter, AgentInfo } from './adapters/AgentAdapter';
/**
 * Agent Manager Class
 *
 * Central manager for detecting AI agents across different types.
 * Supports multiple adapters (Claude Code, Gemini CLI, etc.)
 *
 * @example
 * ```typescript
 * const manager = new AgentManager();
 * manager.registerAdapter(new ClaudeCodeAdapter());
 *
 * const agents = await manager.listAgents();
 * console.log(`Found ${agents.length} agents`);
 * ```
 */
export declare class AgentManager {
    private adapters;
    /**
     * Register an adapter for a specific agent type
     *
     * @param adapter Agent adapter to register
     * @throws Error if an adapter for this type is already registered
     *
     * @example
     * ```typescript
     * manager.registerAdapter(new ClaudeCodeAdapter());
     * ```
     */
    registerAdapter(adapter: AgentAdapter): void;
    /**
     * Unregister an adapter by type
     *
     * @param type Agent type to unregister
     * @returns True if adapter was removed, false if not found
     */
    unregisterAdapter(type: string): boolean;
    /**
     * Get all registered adapters
     *
     * @returns Array of registered adapters
     */
    getAdapters(): AgentAdapter[];
    /**
     * Check if an adapter is registered for a specific type
     *
     * @param type Agent type to check
     * @returns True if adapter is registered
     */
    hasAdapter(type: string): boolean;
    /**
     * List all running AI agents detected by registered adapters
     *
     * Queries all registered adapters and aggregates results.
     * Handles errors gracefully - if one adapter fails, others still run.
     *
     * @returns Array of detected agents from all adapters
     *
     * @example
     * ```typescript
     * const agents = await manager.listAgents();
     *
     * agents.forEach(agent => {
     *   console.log(`${agent.name}: ${agent.status}`);
     * });
     * ```
     */
    listAgents(): Promise<AgentInfo[]>;
    /**
     * Sort agents by status priority
     *
     * Priority order: waiting > running > idle > unknown
     * This ensures agents that need attention appear first.
     *
     * @param agents Array of agents to sort
     * @returns Sorted array of agents
     */
    private sortAgentsByStatus;
    /**
     * Get count of registered adapters
     *
     * @returns Number of registered adapters
     */
    getAdapterCount(): number;
    /**
     * Clear all registered adapters
     */
    clear(): void;
    /**
     * Resolve an agent by name (exact or partial match)
     *
     * @param input Name to search for
     * @param agents List of agents to search within
     * @returns Matched agent (unique), array of agents (ambiguous), or null (none)
     */
    resolveAgent(input: string, agents: AgentInfo[]): AgentInfo | AgentInfo[] | null;
}
