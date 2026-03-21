/**
 * Dependency Engine - DAG-based ticket execution ordering
 *
 * Tech-agnostic: Works with any project structure
 * Enforces that tickets execute only when dependencies are satisfied
 */
export interface DependencyNode {
    ticket_id: string;
    status: string;
    current_phase: string;
    depends_on: string[];
    blocks: string[];
}
export interface DependencyGraph {
    nodes: Map<string, DependencyNode>;
    edges: Map<string, string[]>;
}
export interface DependencyCheck {
    can_execute: boolean;
    blocked_by: string[];
    ready_dependencies: string[];
    pending_dependencies: string[];
}
export declare class DependencyEngine {
    private static instance;
    private graph;
    static getInstance(): DependencyEngine;
    /**
     * Build dependency graph from all tickets in project
     */
    buildGraph(): Promise<DependencyGraph>;
    /**
     * Check if a ticket can execute (all dependencies completed)
     */
    canExecute(ticketId: string): Promise<DependencyCheck>;
    /**
     * Get execution order for a set of tickets (topological sort)
     */
    getExecutionOrder(ticketIds: string[]): string[];
    /**
     * Get all tickets that are ready to execute (dependencies satisfied)
     */
    getReadyTickets(): Promise<string[]>;
    /**
     * Get dependency tree for visualization
     */
    getDependencyTree(ticketId: string, depth?: number): string;
    /**
     * Get all tickets that will be unblocked when this ticket completes
     */
    getUnblockedTickets(ticketId: string): string[];
    /**
     * Validate that all dependency references exist
     */
    validateDependencies(): Promise<{
        valid: boolean;
        errors: string[];
    }>;
    /**
     * Detect cycles in dependency graph
     */
    private detectCycles;
    /**
     * Load all tickets from the project
     * Scans all epic directories
     */
    private loadAllTickets;
}
//# sourceMappingURL=dependency_engine.d.ts.map