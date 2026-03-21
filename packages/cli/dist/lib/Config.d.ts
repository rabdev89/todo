import { DevKitConfig, Phase, EnvironmentCode } from '../types';
export declare class ConfigManager {
    private configPath;
    constructor(targetDir?: string);
    exists(): Promise<boolean>;
    read(): Promise<DevKitConfig | null>;
    create(): Promise<DevKitConfig>;
    update(updates: Partial<DevKitConfig>): Promise<DevKitConfig>;
    addPhase(phase: Phase): Promise<DevKitConfig>;
    hasPhase(phase: Phase): Promise<boolean>;
    getEnvironments(): Promise<EnvironmentCode[]>;
    setEnvironments(environments: EnvironmentCode[]): Promise<DevKitConfig>;
    hasEnvironment(envId: EnvironmentCode): Promise<boolean>;
}
