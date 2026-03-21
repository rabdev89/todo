/**
 * Architecture Guard - Enforces layer boundaries and import rules
 *
 * Tech-agnostic: Configurable for any project architecture
 * Prevents architectural erosion (e.g., UI importing database layer)
 */
export interface LayerRule {
    name: string;
    patterns: string[];
    allowedImports: string[];
    description?: string;
}
export interface ArchitectureConfig {
    layers: LayerRule[];
    strictMode: boolean;
    excludePatterns: string[];
}
export interface ImportViolation {
    file: string;
    layer: string;
    importedFile: string;
    importedLayer: string;
    lineNumber?: number;
    reason: string;
}
export interface ArchitectureCheckResult {
    valid: boolean;
    violations: ImportViolation[];
    filesChecked: number;
    layersDetected: Map<string, string[]>;
}
export declare class ArchitectureGuard {
    private config;
    constructor(config?: ArchitectureConfig);
    /**
     * Load configuration from file or use defaults
     */
    static loadConfig(configPath?: string): ArchitectureConfig;
    /**
     * Default configuration - tech agnostic examples
     */
    static getDefaultConfig(): ArchitectureConfig;
    private loadDefaultConfig;
    /**
     * Check imports in files for architecture violations
     */
    checkImports(files?: string[]): Promise<ArchitectureCheckResult>;
    /**
     * Get which layer a file belongs to
     */
    getLayerForFile(filePath: string): string | null;
    /**
     * Check if a specific import would be allowed
     */
    isImportAllowed(fromFile: string, importPath: string): boolean;
    /**
     * Get allowed imports for a file
     */
    getAllowedImports(filePath: string): string[];
    /**
     * Parse imports from a source file
     * Supports TypeScript, JavaScript, and generic patterns
     */
    private parseImports;
    /**
     * Resolve relative import path to absolute path
     */
    private resolveImportPath;
    /**
     * Get all source files in the project
     */
    private getAllSourceFiles;
    /**
     * Format violations for display
     */
    static formatViolations(result: ArchitectureCheckResult): string;
    /**
     * Generate architecture rules documentation
     */
    generateRulesDoc(): string;
}
//# sourceMappingURL=architecture_guard.d.ts.map