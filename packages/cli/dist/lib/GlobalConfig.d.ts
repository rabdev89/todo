import { GlobalDevKitConfig } from '../types';
export declare class GlobalConfigManager {
    exists(): Promise<boolean>;
    read(): Promise<GlobalDevKitConfig | null>;
    getSkillRegistries(): Promise<Record<string, string>>;
    private getGlobalConfigPath;
}
