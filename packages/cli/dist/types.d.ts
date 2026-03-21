export type Phase = 'requirements' | 'design' | 'planning' | 'implementation' | 'testing' | 'deployment' | 'monitoring';
export interface EnvironmentDefinition {
    code: string;
    name: string;
    contextFileName: string;
    commandPath: string;
    skillPath?: string;
    description?: string;
    isCustomCommandPath?: boolean;
    customCommandExtension?: string;
    globalCommandPath?: string;
}
export type EnvironmentCode = 'cursor' | 'claude' | 'github' | 'gemini' | 'codex' | 'windsurf' | 'kilocode' | 'amp' | 'opencode' | 'roo' | 'antigravity';
export interface DevKitConfig {
    version: string;
    environments: EnvironmentCode[];
    initializedPhases: Phase[];
    createdAt: string;
    updatedAt: string;
}
export interface SkillRegistriesConfig {
    registries?: Record<string, string>;
}
export interface GlobalDevKitConfig {
    skills?: SkillRegistriesConfig;
}
export interface PhaseMetadata {
    phase: string;
    title: string;
    description: string;
}
export declare const AVAILABLE_PHASES: Phase[];
export declare const PHASE_DISPLAY_NAMES: Record<Phase, string>;
