/**
 * Bob Engine - Main Orchestrator
 *
 * Core engine that executes the framework workflow.
 * Reads state, determines next step, executes action, advances state.
 */
import type { BobCommandOptions, BobCommandResult } from './types';
export declare class BobEngine {
    /**
     * Main entry point - execute the next step
     */
    static run(options?: BobCommandOptions): Promise<BobCommandResult>;
    /**
     * Execute the action for a step using registered handlers
     */
    private static executeAction;
    /**
     * Show current status (dashboard)
     */
    static showStatus(): Promise<string>;
    /**
     * Get detailed status for programmatic use
     */
    static getStatus(): Promise<{
        phase: string;
        step: string;
        status: string;
        progress: number;
        canAdvance: boolean;
    }>;
}
//# sourceMappingURL=bob_engine.d.ts.map