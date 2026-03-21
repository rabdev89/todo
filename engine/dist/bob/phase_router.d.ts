/**
 * Bob Phase Router
 *
 * Navigates the phase/step workflow and determines next actions.
 */
import type { Phase, Step } from './types';
export interface NavigationResult {
    phase: Phase;
    step: Step;
    isFirstStep: boolean;
    isLastStep: boolean;
    isLastPhase: boolean;
    nextStep: string | null;
    nextPhase: string | null;
}
export declare class BobPhaseRouter {
    /**
     * Get current phase and step with navigation context
     */
    static getCurrentPosition(): Promise<NavigationResult>;
    /**
     * Check if current step requires user input
     */
    static requiresUserInput(): Promise<boolean>;
    /**
     * Get the required action for current step
     */
    static getRequiredAction(): Promise<string>;
    /**
     * Validate that we can transition to the next step/phase
     */
    static canAdvance(): Promise<{
        canAdvance: boolean;
        reason?: string;
    }>;
    /**
     * Jump to a specific phase and step
     */
    static jumpTo(phaseId: string, stepId?: string): Promise<void>;
    /**
     * Skip the current phase if it's skippable
     */
    static skipCurrentPhase(): Promise<boolean>;
    /**
     * Get all steps in current phase
     */
    static getPhaseSteps(phaseId?: string): Promise<Step[]>;
    /**
     * Get phase definition by ID
     */
    static getPhase(phaseId?: string): Promise<Phase>;
    /**
     * Gate: before running Epic Hardening, ensure all tickets meet Layer 1 baseline.
     * Uses ticket metadata flags for implementation/tests/approval.
     */
    private static checkEpicHardeningGate;
    /**
     * Gate: before running PI Hardening, ensure all epics are approved for release.
     */
    private static checkPiHardeningGate;
    /**
     * Get workflow progress percentage
     */
    static getProgress(): Promise<{
        percentage: number;
        phasesCompleted: number;
        phasesTotal: number;
        stepsCompleted: number;
        stepsTotal: number;
    }>;
}
//# sourceMappingURL=phase_router.d.ts.map