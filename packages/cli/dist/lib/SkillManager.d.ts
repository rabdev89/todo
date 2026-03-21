import { ConfigManager } from './Config';
import { GlobalConfigManager } from './GlobalConfig';
import { EnvironmentSelector } from './EnvironmentSelector';
interface InstalledSkill {
    name: string;
    registry: string;
    environments: string[];
}
interface UpdateResult {
    registryId: string;
    status: 'success' | 'skipped' | 'error';
    message: string;
    error?: Error;
}
interface UpdateSummary {
    total: number;
    successful: number;
    skipped: number;
    failed: number;
    results: UpdateResult[];
}
interface SkillEntry {
    name: string;
    registry: string;
    path: string;
    description: string;
    lastIndexed: number;
}
export declare class SkillManager {
    private configManager;
    private environmentSelector;
    private globalConfigManager;
    constructor(configManager: ConfigManager, environmentSelector?: EnvironmentSelector, globalConfigManager?: GlobalConfigManager);
    /**
     * Add a skill to the project
     * @param registryId - e.g., "anthropics/skills"
     * @param skillName - e.g., "frontend-design"
     */
    addSkill(registryId: string, skillName: string): Promise<void>;
    /**
     * List installed skills in the project
     */
    listSkills(): Promise<InstalledSkill[]>;
    /**
     * Remove a skill from the project
     * @param skillName - Name of the skill to remove
     */
    removeSkill(skillName: string): Promise<void>;
    /**
     * Update skills from registries
     * @param registryId - Optional specific registry to update (e.g., "anthropic/skills")
     * @returns UpdateSummary with detailed results
     */
    updateSkills(registryId?: string): Promise<UpdateSummary>;
    /**
     * Find skills by keyword across all registries
     * @param keyword - Search keyword to match against skill names and descriptions
     * @param options - Search options including refresh flag
     * @returns Array of matching skill entries
     */
    findSkills(keyword: string, options?: {
        refresh?: boolean;
    }): Promise<SkillEntry[]>;
    private fetchDefaultRegistry;
    private fetchMergedRegistry;
    private getInstallationTargets;
    private cloneRepositoryToCache;
    private filterSkillCapableEnvironments;
    /**
     * Display update summary with colored output
     * @param summary - UpdateSummary to display
     */
    private displayUpdateSummary;
    /**
     * Update a single registry
     * @param registryPath - Absolute path to registry directory
     * @param registryId - Registry identifier (e.g., "anthropic/skills")
     * @returns UpdateResult with status and message
     */
    private updateRegistry;
    /**
     * Ensure skill index is available and fresh
     * @param forceRefresh - Force rebuild regardless of TTL
     * @returns Skill index
     */
    private ensureSkillIndex;
    /**
     * Rebuild skill index and write to specified output path
     * @param outputPath - Optional custom output path (defaults to SKILL_INDEX_PATH)
     */
    rebuildIndex(outputPath?: string): Promise<void>;
    /**
     * Build skill index from all registries
     * @returns Complete skill index
     */
    private buildSkillIndex;
    /**
     * Search index by keyword
     * @param index - Skill index to search
     * @param keyword - Normalized lowercase keyword
     * @returns Matching skill entries
     */
    private searchSkillIndex;
}
export {};
