"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DependencyEngine = void 0;
const state_manager_1 = require("./state_manager");
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
class DependencyEngine {
    static instance;
    graph = { nodes: new Map(), edges: new Map() };
    static getInstance() {
        if (!DependencyEngine.instance) {
            DependencyEngine.instance = new DependencyEngine();
        }
        return DependencyEngine.instance;
    }
    /**
     * Build dependency graph from all tickets in project
     */
    async buildGraph() {
        const nodes = new Map();
        const edges = new Map();
        // Load all tickets from web-applications/project-management/epics
        const epicsPath = state_manager_1.StateManager.getTicketPath;
        // Note: We'll scan through all epics to find tickets
        const tickets = await this.loadAllTickets();
        for (const ticket of tickets) {
            const node = {
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
    async canExecute(ticketId) {
        const ticket = await state_manager_1.StateManager.getMetadata(ticketId);
        const dependencies = ticket.depends_on || [];
        const blocked_by = [];
        const ready_dependencies = [];
        const pending_dependencies = [];
        for (const depId of dependencies) {
            try {
                const dep = await state_manager_1.StateManager.getMetadata(depId);
                if (dep.status === 'completed') {
                    ready_dependencies.push(depId);
                }
                else {
                    blocked_by.push(depId);
                    pending_dependencies.push(depId);
                }
            }
            catch (error) {
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
    getExecutionOrder(ticketIds) {
        const visited = new Set();
        const result = [];
        const temp = new Set(); // For cycle detection
        const visit = (id) => {
            if (temp.has(id)) {
                throw new Error(`Circular dependency detected involving ${id}`);
            }
            if (visited.has(id))
                return;
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
    async getReadyTickets() {
        const ready = [];
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
    getDependencyTree(ticketId, depth = 0) {
        const node = this.graph.nodes.get(ticketId);
        if (!node)
            return `${'  '.repeat(depth)}${ticketId} [NOT FOUND]`;
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
    getUnblockedTickets(ticketId) {
        const unblocked = [];
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
    async validateDependencies() {
        const errors = [];
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
    detectCycles(nodes, edges) {
        const cycles = [];
        const visited = new Set();
        const stack = new Set();
        const path = [];
        const visit = (id) => {
            if (stack.has(id)) {
                // Found cycle - extract cycle from path
                const cycleStart = path.indexOf(id);
                cycles.push([...path.slice(cycleStart), id]);
                return;
            }
            if (visited.has(id))
                return;
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
    async loadAllTickets() {
        const tickets = [];
        const epicsDir = path_1.default.resolve(__dirname, '../../web-applications/project-management/epics');
        if (!await fs_extra_1.default.pathExists(epicsDir)) {
            return tickets;
        }
        const epics = await fs_extra_1.default.readdir(epicsDir);
        for (const epic of epics) {
            const epicPath = path_1.default.join(epicsDir, epic);
            const stat = await fs_extra_1.default.stat(epicPath);
            if (!stat.isDirectory() || epic === 'epic_template')
                continue;
            const ticketsDir = path_1.default.join(epicPath, 'tickets');
            if (!await fs_extra_1.default.pathExists(ticketsDir))
                continue;
            const ticketDirs = await fs_extra_1.default.readdir(ticketsDir);
            for (const ticketDir of ticketDirs) {
                const metadataPath = path_1.default.join(ticketsDir, ticketDir, 'metadata.json');
                if (await fs_extra_1.default.pathExists(metadataPath)) {
                    try {
                        const data = await fs_extra_1.default.readFile(metadataPath, 'utf8');
                        const parsed = JSON.parse(data);
                        tickets.push(parsed);
                    }
                    catch (error) {
                        // Skip invalid tickets
                        console.warn(`Warning: Could not load ticket from ${metadataPath}`);
                    }
                }
            }
        }
        return tickets;
    }
}
exports.DependencyEngine = DependencyEngine;
