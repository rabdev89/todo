import { Phase, EnvironmentCode } from "../types";
export declare class TemplateManager {
    private templatesDir;
    private targetDir;
    constructor(targetDir?: string);
    copyPhaseTemplate(phase: Phase): Promise<string>;
    fileExists(phase: Phase): Promise<boolean>;
    setupMultipleEnvironments(environmentIds: EnvironmentCode[]): Promise<string[]>;
    checkEnvironmentExists(envId: EnvironmentCode): Promise<boolean>;
    private setupSingleEnvironment;
    private copyCommands;
    private copyCursorSpecificFiles;
    private copyGeminiSpecificFiles;
    /**
     * Generate TOML content for Gemini commands.
     * Uses triple quotes for multi-line strings.
     */
    private generateTomlContent;
    /**
     * Copy command templates to the global folder for a specific environment.
     * Global folders are located in the user's home directory.
     */
    copyCommandsToGlobal(envCode: EnvironmentCode): Promise<string[]>;
    /**
     * Check if any global commands already exist for a specific environment.
     */
    checkGlobalCommandsExist(envCode: EnvironmentCode): Promise<boolean>;
}
