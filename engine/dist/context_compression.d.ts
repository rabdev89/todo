/**
 * Context Compression Utilities - Reduce token usage for AI context
 *
 * Strategy:
 * 1. Summarize code instead of including full content
 * 2. Extract only relevant sections from large files
 * 3. Compress repetitive patterns
 * 4. Prioritize by relevance score
 *
 * Target: Reduce context from ~20k tokens to ~800-1500 tokens per ticket
 */
export interface CompressedFile {
    path: string;
    summary: string;
    keySections: string[];
    totalLines: number;
    compressedLines: number;
    compressionRatio: number;
}
export interface CompressionOptions {
    maxFileSize?: number;
    maxLinesPerFile?: number;
    includeImports?: boolean;
    includeExports?: boolean;
    includeDocstrings?: boolean;
    summarizeThreshold?: number;
}
export declare class ContextCompressor {
    private options;
    constructor(options?: CompressionOptions);
    /**
     * Compress a single file based on its size and content
     */
    compressFile(filePath: string, content?: string): CompressedFile;
    /**
     * Compress multiple files for context pack
     */
    compressFiles(filePaths: string[], relevanceScores?: Map<string, number>): Map<string, CompressedFile>;
    /**
     * Render compressed files as markdown
     */
    renderCompressedContext(compressedFiles: Map<string, CompressedFile>): string;
    /**
     * Calculate total token estimate for compressed context
     * Rough estimate: 1 token ≈ 4 characters for code
     */
    estimateTokens(compressedFiles: Map<string, CompressedFile>): number;
    /**
     * Extract key sections from file based on type
     */
    private extractKeySections;
    /**
     * Extract import statements
     */
    private extractImports;
    /**
     * Extract export statements and public API
     */
    private extractExports;
    /**
     * Extract type definitions
     */
    private extractTypeDefinitions;
    /**
     * Extract function/method signatures with docstrings
     */
    private extractSignatures;
    /**
     * Generate summary of file content
     */
    private generateSummary;
    /**
     * Read file content safely
     */
    private readFile;
}
/**
 * Utility to create phase-specific context subsets
 */
export declare class PhaseContextBuilder {
    /**
     * Build context appropriate for specific phase
     */
    static buildPhaseContext(phase: 'research' | 'design' | 'implement' | 'test' | 'validate', ticket: {
        title: string;
        description?: string;
        specs?: string;
    }, relevantFiles: Map<string, CompressedFile>, architectureInfo?: string): string;
    private static buildResearchContext;
    private static buildDesignContext;
    private static buildImplementContext;
    private static buildTestContext;
    private static buildValidateContext;
    private static renderFileList;
    private static renderFileSummaries;
}
declare const _default: {
    ContextCompressor: typeof ContextCompressor;
    PhaseContextBuilder: typeof PhaseContextBuilder;
};
export default _default;
//# sourceMappingURL=context_compression.d.ts.map