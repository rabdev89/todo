export interface BobConfigData {
    directories: {
        project_management: string;
        epics: string;
        dashboard: string;
        framework: string;
        web_apps: string;
        [key: string]: string;
    };
    patterns: {
        metadata_filename: string;
        default_branch: string;
        ticket_id_prefix: string;
        [key: string]: string;
    };
}
export declare class BobConfig {
    private static instance;
    private config;
    private rootDir;
    private constructor();
    static getInstance(): BobConfig;
    /**
     * Resolve a logical directory key to an absolute path
     */
    getDirectory(key: string): string;
    /**
     * Get a pattern value
     */
    getPattern(key: string): string;
    /**
     * Get the root directory of the workspace
     */
    getRootDir(): string;
}
//# sourceMappingURL=config.d.ts.map