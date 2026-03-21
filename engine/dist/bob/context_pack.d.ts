import type { FrameworkStatus, Phase, Step } from './types';
export interface BobActionContextPack {
    layer: FrameworkStatus['current_layer'];
    phaseId: string;
    stepId: string;
    requiredAction: string;
    recommendedCommands: string[];
    track: FrameworkStatus['current_track'];
    ticketId: string | null;
    epicId: string | null;
    piId: string | null;
    personaId: string | null;
    docPaths: string[];
    skills: string[];
    patterns: string[];
}
export declare function buildBobActionContextPack(phaseId: string, stepId: string, phase: Phase, step: Step, state: FrameworkStatus): Promise<BobActionContextPack>;
//# sourceMappingURL=context_pack.d.ts.map