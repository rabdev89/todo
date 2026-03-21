import { CompressedFile } from './context_compression';
/**
 * Context Builder - Generates focused context packs for AI execution
 *
 * Tech-agnostic: Works with any project type
 * Prevents AI from reading arbitrary files by composing relevant context
 *
 * Phase 6: Enhanced with Architecture Registry and Context Compression
 * - Reduced token usage through intelligent compression
 * - Persistent architecture awareness
 * - Phase-specific context subsets
 */
export interface AgentContextPack {
    ticketId: string;
    goal: string;
    currentPhase: string;
    dependencies: DependencyContext[];
    relevantFiles: string[];
    allowedFiles: string[];
    architectureRules?: string;
    architectureContext?: ArchitectureContext;
    projectContext?: ProjectContext;
    generatedAt: string;
    learnedFromSession?: boolean;
    globalKnowledge?: Array<{
        title: string;
        content: string;
        tags: string[];
    }>;
    compressionInfo?: {
        originalFiles: number;
        compressedFiles: number;
        estimatedTokens: number;
        compressionRatio: number;
    };
    compressedContent?: Map<string, CompressedFile>;
}
export interface DependencyContext {
    ticketId: string;
    status: string;
    filesModified: string[];
    summary?: string;
}
export interface ArchitectureContext {
    primaryModule?: string;
    relatedModules: string[];
    suggestedFiles: string[];
    moduleInstructions: string;
    layerRules: string;
}
export interface ProjectContext {
    name: string;
    description?: string;
    techStack?: string[];
    relevantDocs: string[];
}
export interface ContextBuilderConfig {
    maxFileSize: number;
    maxFiles: number;
    includeDependencyOutputs: boolean;
    includeArchitectureRules: boolean;
    contextOutputDir: string;
    enableSessionPersistence?: boolean;
    sessionId?: string;
    enableArchitectureRegistry?: boolean;
    enableContextCompression?: boolean;
    compressionOptions?: {
        maxLinesPerFile?: number;
        summarizeThreshold?: number;
    };
}
export declare class ContextBuilder {
    private config;
    private dependencyEngine;
    private archGuard;
    private archRegistry?;
    private compressor?;
    private sessionManager?;
    private contextCache?;
    constructor(config?: Partial<ContextBuilderConfig>);
    /**
     * Build context pack for a ticket
     * Phase 5: Enhanced with caching and session learning
     */
    buildContext(ticketId: string): Promise<AgentContextPack>;
    /**
     * Phase 5: Enhance context with session learning
     */
    private enhanceWithLearning;
    /**
     * Phase 5: Record query for learning (call after context is used)
     */
    recordQueryUsage(ticketId: string, filesUsed: string[], effectiveness: number): Promise<void>;
    /**
     * Generate context markdown file
     */
    generateContextFile(ticketId: string): Promise<string>;
    /**
     * Build dependency context - what this ticket depends on
     */
    private buildDependencyContext;
    /**
     * Find files relevant to this ticket
     * Includes: dependency files, layer files, related by git history
     */
    private findRelevantFiles;
    /**
     * Build architecture context for ticket's layer
     */
    private buildArchitectureContext;
    /**
     * Build project-level context
     */
    private buildProjectContext;
    /**
     * Render context pack as markdown
     */
    private renderContextMarkdown;
    /**
     * Helper: Glob files
     */
    private globFiles;
    /**
     * Infer project name from directory or package.json
     */
    private inferProjectName;
    /**
     * Clean up old context files
     */
    cleanup(maxAgeHours?: number): void;
    /**
     * Build architecture context using the Architecture Registry
     * Provides module-level insights for better context accuracy
     */
    private buildArchitectureRegistryContext;
    /**
     * Infer module name from ticket metadata
     */
    private inferModuleFromTicket;
    /**
     * Compress context files for token optimization
     */
    private compressContextFiles;
    /**
     * Generate compressed context file with token optimization
     */
    generateCompressedContextFile(ticketId: string): Promise<string>;
    /**
     * Render optimized context markdown with compression info
     */
    private renderOptimizedContextMarkdown;
    /**
     * Helper: Read file content safely
     */
    private readFileSafe;
}
//# sourceMappingURL=context_builder.d.ts.map