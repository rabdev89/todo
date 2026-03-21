import { StateManager, TicketMetadata } from './state_manager';
import fs from 'fs-extra';
import path from 'path';

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
    edges: Map<string, string[]>; // ticket_id -> list of tickets it depends on
}

export interface DependencyCheck {
    can_execute: boolean;
    blocked_by: string[];
    ready_dependencies: string[];
    pending_dependencies: string[];
}

export class DependencyEngine {
    private static instance: DependencyEngine;
    private graph: DependencyGraph = { nodes: new Map(), edges: new Map() };

    static getInstance(): DependencyEngine {
        if (!DependencyEngine.instance) {
            DependencyEngine.instance = new DependencyEngine();
        }
        return DependencyEngine.instance;
    }

    /**
     * Build dependency graph from all tickets in project
     */
    async buildGraph(): Promise<DependencyGraph> {
        const nodes = new Map<string, DependencyNode>();
        const edges = new Map<string, string[]>();

        // Load all tickets from web-applications/project-management/epics
        const epicsPath = StateManager.getTicketPath;
        // Note: We'll scan through all epics to find tickets
        const tickets = await this.loadAllTickets();

        for (const ticket of tickets) {
            const node: DependencyNode = {
                ticket_id: ticket.ticket_id,
                status: ticket.status,
                current_phase: ticket.current_phase || 'requirements',
                depends_on: ticket.depends_on || [],
                blocks: ticket.blocks || []
            };
            nodes.set(ticket.ticket_id, node);
            edges.set(ticket.ticket_id, ticket.depends_on || []);
        }

        // Detect cycles
        const cycles = this.detectCycles(nodes, edges);
        if (cycles.length > 0) {
            throw new Error(`Dependency cycles detected: ${cycles.join(', ')}`);
        }

        this.graph = { nodes, edges };
        return this.graph;
    }

    /**
     * Check if a ticket can execute (all dependencies completed)
     */
    async canExecute(ticketId: string): Promise<DependencyCheck> {
        const ticket = await StateManager.getMetadata(ticketId);
        const dependencies = ticket.depends_on || [];

        const blocked_by: string[] = [];
        const ready_dependencies: string[] = [];
        const pending_dependencies: string[] = [];

        for (const depId of dependencies) {
            try {
                const dep = await StateManager.getMetadata(depId);
                if (dep.status === 'completed') {
                    ready_dependencies.push(depId);
                } else {
                    blocked_by.push(depId);
                    pending_dependencies.push(depId);
                }
            } catch (error) {
                // Dependency ticket doesn't exist
                blocked_by.push(depId);
                pending_dependencies.push(depId);
            }
        }

        return {
            can_execute: blocked_by.length === 0,
            blocked_by,
            ready_dependencies,
            pending_dependencies
        };
    }

    /**
     * Get execution order for a set of tickets (topological sort)
     */
    getExecutionOrder(ticketIds: string[]): string[] {
        const visited = new Set<string>();
        const result: string[] = [];
        const temp = new Set<string>(); // For cycle detection

        const visit = (id: string) => {
            if (temp.has(id)) {
                throw new Error(`Circular dependency detected involving ${id}`);
            }
            if (visited.has(id)) return;

            temp.add(id);
            const deps = this.graph.edges.get(id) || [];
            
            for (const dep of deps) {
                if (this.graph.nodes.has(dep)) {
                    visit(dep);
                }
            }

            temp.delete(id);
            visited.add(id);
            result.push(id);
        };

        for (const id of ticketIds) {
            if (!visited.has(id)) {
                visit(id);
            }
        }

        return result;
    }

    /**
     * Get all tickets that are ready to execute (dependencies satisfied)
     */
    async getReadyTickets(): Promise<string[]> {
        const ready: string[] = [];
        
        for (const [ticketId, node] of this.graph.nodes) {
            if (node.status !== 'completed') {
                const check = await this.canExecute(ticketId);
                if (check.can_execute) {
                    ready.push(ticketId);
                }
            }
        }

        return ready;
    }

    /**
     * Get dependency tree for visualization
     */
    getDependencyTree(ticketId: string, depth: number = 0): string {
        const node = this.graph.nodes.get(ticketId);
        if (!node) return `${'  '.repeat(depth)}${ticketId} [NOT FOUND]`;

        const status = node.status === 'completed' ? '✓' : '○';
        let result = `${'  '.repeat(depth)}${status} ${ticketId} (${node.current_phase})\n`;

        const deps = this.graph.edges.get(ticketId) || [];
        for (const dep of deps) {
            result += this.getDependencyTree(dep, depth + 1);
        }

        return result;
    }

    /**
     * Get all tickets that will be unblocked when this ticket completes
     */
    getUnblockedTickets(ticketId: string): string[] {
        const unblocked: string[] = [];
        
        for (const [id, node] of this.graph.nodes) {
            if (node.depends_on.includes(ticketId)) {
                unblocked.push(id);
            }
        }

        return unblocked;
    }

    /**
     * Validate that all dependency references exist
     */
    async validateDependencies(): Promise<{ valid: boolean; errors: string[] }> {
        const errors: string[] = [];

        for (const [ticketId, node] of this.graph.nodes) {
            for (const depId of node.depends_on) {
                if (!this.graph.nodes.has(depId)) {
                    errors.push(`Ticket ${ticketId} depends on non-existent ticket ${depId}`);
                }
            }
        }

        return { valid: errors.length === 0, errors };
    }

    /**
     * Detect cycles in dependency graph
     */
    private detectCycles(
        nodes: Map<string, DependencyNode>, 
        edges: Map<string, string[]>
    ): string[][] {
        const cycles: string[][] = [];
        const visited = new Set<string>();
        const stack = new Set<string>();
        const path: string[] = [];

        const visit = (id: string) => {
            if (stack.has(id)) {
                // Found cycle - extract cycle from path
                const cycleStart = path.indexOf(id);
                cycles.push([...path.slice(cycleStart), id]);
                return;
            }

            if (visited.has(id)) return;

            visited.add(id);
            stack.add(id);
            path.push(id);

            const deps = edges.get(id) || [];
            for (const dep of deps) {
                if (nodes.has(dep)) {
                    visit(dep);
                }
            }

            path.pop();
            stack.delete(id);
        };

        for (const id of nodes.keys()) {
            if (!visited.has(id)) {
                visit(id);
            }
        }

        return cycles;
    }

    /**
     * Load all tickets from the project
     * Scans all epic directories
     */
    private async loadAllTickets(): Promise<TicketMetadata[]> {
        const tickets: TicketMetadata[] = [];

        const epicsDir = path.resolve(__dirname, '../../web-applications/project-management/epics');
        
        if (!await fs.pathExists(epicsDir)) {
            return tickets;
        }

        const epics = await fs.readdir(epicsDir);
        
        for (const epic of epics) {
            const epicPath = path.join(epicsDir, epic);
            const stat = await fs.stat(epicPath);
            
            if (!stat.isDirectory() || epic === 'epic_template') continue;

            const ticketsDir = path.join(epicPath, 'tickets');
            if (!await fs.pathExists(ticketsDir)) continue;

            const ticketDirs = await fs.readdir(ticketsDir);
            
            for (const ticketDir of ticketDirs) {
                const metadataPath = path.join(ticketsDir, ticketDir, 'metadata.json');
                
                if (await fs.pathExists(metadataPath)) {
                    try {
                        const data = await fs.readFile(metadataPath, 'utf8');
                        const parsed = JSON.parse(data);
                        tickets.push(parsed);
                    } catch (error) {
                        // Skip invalid tickets
                        console.warn(`Warning: Could not load ticket from ${metadataPath}`);
                    }
                }
            }
        }

        return tickets;
    }
}
