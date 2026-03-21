/**
 * File Guard - Enforces file scope restrictions for tickets
 *
 * Tech-agnostic: Works with any project type
 * Prevents AI from modifying files outside declared ticket scope
 */
export interface FileScopeConfig {
    allowed: string[];
    excluded: string[];
    require_explicit_scope: boolean;
}
export interface FileChange {
    path: string;
    change_type: 'added' | 'modified' | 'deleted' | 'renamed';
}
export interface GuardResult {
    allowed: boolean;
    violations: FileViolation[];
    checked_files: number;
}
export interface FileViolation {
    file: string;
    change_type: string;
    reason: string;
}
export declare class FileGuard {
    private static config;
    /**
     * Load file guard configuration
     */
    static loadConfig(configPath?: string): FileScopeConfig;
    /**
     * Check if file changes are within ticket scope
     */
    static checkTicketScope(ticketId: string, baseRef?: string): Promise<GuardResult>;
    /**
     * Preview what files a ticket would be allowed to modify
     */
    static previewScope(ticketId: string): Promise<string[]>;
    /**
     * Validate that file scope patterns are valid globs
     */
    static validateScopePatterns(patterns: string[]): {
        valid: boolean;
        errors: string[];
    };
    /**
     * Check if a single file matches allowed patterns and doesn't match excluded
     */
    private static isFileAllowed;
    /**
     * Get list of changed files from git
     */
    private static getGitChanges;
    /**
     * Format violations for display
     */
    static formatViolations(result: GuardResult): string;
}
//# sourceMappingURL=file_guard.d.ts.map