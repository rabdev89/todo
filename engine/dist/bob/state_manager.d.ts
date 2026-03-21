/**
 * Bob State Manager
 *
 * Manages the framework-level state (not ticket-level).
 * Integrates with existing StateManager for ticket operations.
 */
import type { FrameworkStatus, PhaseDefinition, Phase, Step, StepState, PhaseState } from '../bob/types';
export declare class BobStateManager {
    /**
     * Read the current framework status
     */
    static loadStatus(): Promise<FrameworkStatus>;
    /**
     * Save the framework status
     */
    static saveStatus(status: FrameworkStatus): Promise<void>;
    /**
     * Load phase definitions
     */
    static loadPhaseDefinitions(): Promise<PhaseDefinition>;
    /**
     * Get current phase and step
     */
    static getCurrentState(): Promise<{
        phase: string;
        step: string;
        status: FrameworkStatus;
    }>;
    /**
     * Update step status within a phase
     */
    static updateStepStatus(phaseId: string, stepId: string, stepStatus: StepState['status'], result?: Record<string, unknown> | null, error?: string | null): Promise<void>;
    /**
     * Update phase status
     */
    static updatePhaseStatus(phaseId: string, phaseStatus: PhaseState['status']): Promise<void>;
    /**
     * Advance to next step or phase
     */
    static advanceState(forceNextPhase?: boolean): Promise<{
        phase: string;
        step: string;
        isNewPhase: boolean;
    }>;
    /**
     * Rollback to the logically previous step
     */
    static rollbackPreviousStep(): Promise<void>;
    /**
     * Record an error
     */
    static recordError(phase: string, step: string, message: string): Promise<void>;
    /**
     * Get phase and step by ID
     */
    static getPhaseAndStep(phaseId: string, stepId: string): Promise<{
        phase: Phase;
        step: Step;
    }>;
    /**
     * Check if a phase should be skipped based on project type
     */
    static shouldSkipPhase(phaseId: string): Promise<boolean>;
    private static getLayerForPhase;
    /**
     * Calculate and update metrics
     */
    static updateMetrics(): Promise<void>;
    /**
     * Reset framework to initial state
     */
    static reset(): Promise<void>;
}
//# sourceMappingURL=state_manager.d.ts.map