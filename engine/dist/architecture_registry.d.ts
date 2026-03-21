/**
 * Architecture Registry - Persistent module structure tracking
 *
 * Prevents code duplication and architectural drift across many tickets.
 * Provides explicit architecture knowledge that survives beyond AI context windows.
 *
 * Features:
 * - Track primary services, managers, and key components per module
 * - Enforce architectural boundaries beyond just layer rules
 * - Enable context builder to provide accurate, minimal context
 */
export interface ModuleEntry {
    name: string;
    type: ModuleType;
    primaryFile: string;
    secondaryFiles: string[];
    description?: string;
    responsibilities: string[];
    dependencies: string[];
    exposedInterfaces: string[];
    createdAt: string;
    updatedAt: string;
    tickets: string[];
}
export type ModuleType = 'service' | 'manager' | 'repository' | 'controller' | 'component' | 'model' | 'utility' | 'middleware' | 'handler' | 'config';
export interface ArchitectureRegistryData {
    version: string;
    projectName: string;
    lastUpdated: string;
    modules: Record<string, ModuleEntry>;
    patterns: {
        naming: Record<string, string>;
        structure: Record<string, string[]>;
    };
}
export interface RegistryQuery {
    type?: ModuleType;
    name?: string;
    filePath?: string;
    responsibility?: string;
}
export interface SuggestionResult {
    existingModule: ModuleEntry;
    reason: string;
    confidence: 'high' | 'medium' | 'low';
}
export declare class ArchitectureRegistry {
    private static instance;
    private registryPath;
    private data;
    private autoSave;
    constructor(registryPath?: string, autoSave?: boolean);
    static getInstance(registryPath?: string): ArchitectureRegistry;
    private getDefaultRegistryPath;
    private loadOrCreate;
    private createDefault;
    private inferProjectName;
    /**
     * Register a new module in the architecture
     */
    registerModule(name: string, type: ModuleType, primaryFile: string, options?: {
        description?: string;
        responsibilities?: string[];
        dependencies?: string[];
        exposedInterfaces?: string[];
        secondaryFiles?: string[];
        ticketId?: string;
    }): ModuleEntry;
    /**
     * Get a module by name
     */
    getModule(name: string): ModuleEntry | undefined;
    /**
     * Query modules by criteria
     */
    query(query: RegistryQuery): ModuleEntry[];
    /**
     * Get all modules of a specific type
     */
    getByType(type: ModuleType): ModuleEntry[];
    /**
     * Check if a module exists for given functionality
     * Helps prevent code duplication by suggesting existing modules
     */
    suggestExistingModule(desiredResponsibility: string, desiredType: ModuleType): SuggestionResult | null;
    /**
     * Suggest which module should handle a new responsibility
     */
    suggestModuleForResponsibility(responsibility: string): ModuleEntry | null;
    /**
     * Get dependencies for a module (recursive)
     */
    getDependencyTree(moduleName: string, visited?: Set<string>): ModuleEntry[];
    /**
     * Auto-scan codebase to detect modules
     */
    autoDetectModules(sourcePath?: string, ticketId?: string): {
        added: ModuleEntry[];
        existing: string[];
    };
    /**
     * Update module dependencies based on imports
     */
    updateDependencies(moduleName: string, imports: string[]): void;
    /**
     * Generate context information for a ticket
     * Used by ContextBuilder to provide accurate, minimal context
     */
    buildContextForTicket(ticketModule: string): {
        primaryModule: ModuleEntry;
        relatedModules: ModuleEntry[];
        suggestedFiles: string[];
        instructions: string;
    } | null;
    /**
     * Save registry to disk
     */
    save(): void;
    /**
     * Get full registry data
     */
    getData(): ArchitectureRegistryData;
    /**
     * Export registry as markdown documentation
     */
    exportDocumentation(): string;
    /**
     * Private helper: Check if two strings have significant word overlap
     */
    private hasSignificantOverlap;
    /**
     * Private helper: Calculate string similarity (0-1)
     */
    private calculateSimilarity;
    /**
     * Private helper: Extract public interfaces from a file
     */
    private extractInterfaces;
}
export default ArchitectureRegistry;
//# sourceMappingURL=architecture_registry.d.ts.map