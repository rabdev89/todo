import type { FrameworkStatus, Step } from './types';
export interface SelectedSkills {
    skills: string[];
    patterns: string[];
}
export declare function selectSkillsForContext(layer: FrameworkStatus['current_layer'], step: Step): Promise<SelectedSkills>;
//# sourceMappingURL=skills_registry.d.ts.map