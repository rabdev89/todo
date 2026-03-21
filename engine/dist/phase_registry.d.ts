export declare enum PhaseType {
    REQUIREMENTS = "requirements",
    DESIGN = "design",
    IMPLEMENT = "implement",
    VALIDATE = "validate",
    DONE = "done"
}
export interface PhaseDefinition {
    id: PhaseType;
    description: string;
    nextPhase: PhaseType | null;
    requiresValidation: boolean;
}
export declare const PHASE_REGISTRY: Record<PhaseType, PhaseDefinition>;
/**
 * Returns the sequence of phases
 */
export declare function getNextPhase(currentPhase: string, ticketType?: string): PhaseType | null;
//# sourceMappingURL=phase_registry.d.ts.map