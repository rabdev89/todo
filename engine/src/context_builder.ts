import * as fs from 'fs';
import * as path from 'path';
import { StateManager, TicketMetadata } from './state_manager';
import { DependencyEngine } from './dependency_engine';
import { ArchitectureGuard } from './architecture_guard';
import { FileGuard } from './file_guard';
import { SessionManager } from './session/session_manager';
import { ContextCacheManager } from './session/context_cache_manager';
import { SearchResult } from './repo_intelligence/search';
import { DetectedPattern } from './repo_intelligence/patterns';
import { ArchitectureRegistry } from './architecture_registry';
import { ContextCompressor, PhaseContextBuilder, CompressedFile } from './context_compression';

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
    architectureContext?: ArchitectureContext; // Phase 6: Module-level architecture info
    projectContext?: ProjectContext;
    generatedAt: string;
    // Phase 5: Session learning metadata
    learnedFromSession?: boolean;
    globalKnowledge?: Array<{
        title: string;
        content: string;
        tags: string[];
    }>;
    // Phase 6: Compression metadata
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
    maxFileSize: number;      // Max bytes to include per file
    maxFiles: number;         // Max number of files in context
    includeDependencyOutputs: boolean;
    includeArchitectureRules: boolean;
    contextOutputDir: string;
    // Phase 5: Session persistence options
    enableSessionPersistence?: boolean;
    sessionId?: string;
    // Phase 6: Architecture registry and compression
    enableArchitectureRegistry?: boolean;
    enableContextCompression?: boolean;
    compressionOptions?: {
        maxLinesPerFile?: number;
        summarizeThreshold?: number;
    };
}

export class ContextBuilder {
    private config: ContextBuilderConfig;
    private dependencyEngine: DependencyEngine;
    private archGuard: ArchitectureGuard;
    private archRegistry?: ArchitectureRegistry;
    private compressor?: ContextCompressor;
    // Phase 5: Session components
    private sessionManager?: SessionManager;
    private contextCache?: ContextCacheManager;

    constructor(config?: Partial<ContextBuilderConfig>) {
        this.config = {
            maxFileSize: 50000,        // 50KB per file
            maxFiles: 20,              // 20 files max
            includeDependencyOutputs: true,
            includeArchitectureRules: true,
            contextOutputDir: '.context',
            enableSessionPersistence: false,
            // Phase 6: Enable by default
            enableArchitectureRegistry: true,
            enableContextCompression: true,
            compressionOptions: {
                maxLinesPerFile: 100,
                summarizeThreshold: 50
            },
            ...config
        };
        this.dependencyEngine = DependencyEngine.getInstance();
        this.archGuard = new ArchitectureGuard();
        
        // Phase 6: Initialize architecture registry
        if (this.config.enableArchitectureRegistry) {
            this.archRegistry = ArchitectureRegistry.getInstance();
        }
        
        // Phase 6: Initialize compression
        if (this.config.enableContextCompression) {
            this.compressor = new ContextCompressor(this.config.compressionOptions);
        }
        
        // Phase 5: Initialize session components if enabled
        if (this.config.enableSessionPersistence) {
            this.sessionManager = new SessionManager();
            this.contextCache = new ContextCacheManager();
        }
    }

    /**
     * Build context pack for a ticket
     * Phase 5: Enhanced with caching and session learning
     */
    async buildContext(ticketId: string): Promise<AgentContextPack> {
        // Phase 5: Check cache first
        if (this.contextCache) {
            const cached = await this.contextCache.get(ticketId);
            if (cached) {
                console.log(`Using cached context for ${ticketId}`);
                return cached;
            }
        }
        
        const ticket = await StateManager.getMetadata(ticketId);
        
        // Collect all context components
        const dependencies = await this.buildDependencyContext(ticket);
        const relevantFiles = await this.findRelevantFiles(ticket);
        const allowedFiles = await FileGuard.previewScope(ticketId);
        const architectureRules = this.buildArchitectureContext(ticket);
        const projectContext = await this.buildProjectContext(ticketId);

        let contextPack: AgentContextPack = {
            ticketId,
            goal: ticket.title || 'No title',
            currentPhase: ticket.current_phase || 'requirements',
            dependencies,
            relevantFiles: relevantFiles.slice(0, this.config.maxFiles),
            allowedFiles,
            architectureRules,
            projectContext,
            generatedAt: new Date().toISOString()
        };
        
        // Phase 5: Enhance with session learning
        if (this.config.enableSessionPersistence && this.sessionManager && this.config.sessionId) {
            contextPack = await this.enhanceWithLearning(contextPack, this.config.sessionId);
        }
        
        // Phase 5: Cross-reference with global knowledge
        if (this.sessionManager) {
            const globalKnowledge = await this.sessionManager.getRelevantKnowledge(
                `${contextPack.goal}`,
                3
            );
            contextPack.globalKnowledge = globalKnowledge.map(k => ({
                title: k.title,
                content: k.content,
                tags: k.tags
            }));
        }

        // Phase 5: Cache the result
        if (this.contextCache && this.config.sessionId) {
            await this.contextCache.set(ticketId, this.config.sessionId, contextPack);
        }

        return contextPack;
    }
    
    /**
     * Phase 5: Enhance context with session learning
     */
    private async enhanceWithLearning(
        baseContext: AgentContextPack,
        sessionId: string
    ): Promise<AgentContextPack> {
        if (!this.sessionManager) return baseContext;
        
        // Get learned patterns for this session
        const sessionContext = await this.sessionManager.getSessionContext(sessionId);
        
        // Boost confidence for frequently seen patterns
        // Note: This is a placeholder - actual pattern matching would need integration
        // with the pattern detection system
        
        // Re-rank files based on learned preferences
        const rankedFiles = baseContext.relevantFiles.map(filePath => {
            const learnedRelevance = sessionContext.fileRelevance.get(filePath) || 0.5;
            return { path: filePath, relevance: learnedRelevance };
        });
        
        // Sort by learned relevance
        rankedFiles.sort((a, b) => b.relevance - a.relevance);
        
        baseContext.relevantFiles = rankedFiles.map(f => f.path);
        baseContext.learnedFromSession = true;
        
        return baseContext;
    }
    
    /**
     * Phase 5: Record query for learning (call after context is used)
     */
    async recordQueryUsage(
        ticketId: string,
        filesUsed: string[],
        effectiveness: number
    ): Promise<void> {
        if (!this.sessionManager || !this.config.sessionId) return;
        
        const ticket = await StateManager.getMetadata(ticketId);
        const query = ticket.title;
        
        // Convert files to SearchResult format
        const results: SearchResult[] = filesUsed.map(file => ({
            id: file,
            file,
            lineStart: 0,
            lineEnd: 0,
            content: '',
            relevance: effectiveness,
            chunkType: 'code'
        }));
        
        await this.sessionManager.recordQuery(
            this.config.sessionId,
            query,
            results,
            [], // Patterns would come from pattern detection
            0   // Duration not tracked here
        );
    }

    /**
     * Generate context markdown file
     */
    async generateContextFile(ticketId: string): Promise<string> {
        const pack = await this.buildContext(ticketId);
        
        // Ensure output directory exists
        const outputDir = path.resolve(process.cwd(), this.config.contextOutputDir);
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        const outputPath = path.join(outputDir, `${ticketId}.md`);
        const markdown = this.renderContextMarkdown(pack);
        
        fs.writeFileSync(outputPath, markdown, 'utf8');
        
        return outputPath;
    }

    /**
     * Build dependency context - what this ticket depends on
     */
    private async buildDependencyContext(ticket: TicketMetadata): Promise<DependencyContext[]> {
        const contexts: DependencyContext[] = [];
        const deps = ticket.depends_on || [];

        for (const depId of deps) {
            try {
                const dep = await StateManager.getMetadata(depId);
                const fileScope = dep.file_scope || { allowed: [] };
                
                contexts.push({
                    ticketId: depId,
                    status: dep.status,
                    filesModified: fileScope.allowed || [],
                    summary: dep.metadata?.summary as string
                });
            } catch (error) {
                // Dependency not found, skip
                contexts.push({
                    ticketId: depId,
                    status: 'unknown',
                    filesModified: [],
                    summary: 'Dependency ticket not found'
                });
            }
        }

        return contexts;
    }

    /**
     * Find files relevant to this ticket
     * Includes: dependency files, layer files, related by git history
     */
    private async findRelevantFiles(ticket: TicketMetadata): Promise<string[]> {
        const relevant = new Set<string>();

        // 1. Files from dependencies
        const deps = ticket.depends_on || [];
        for (const depId of deps) {
            try {
                const dep = await StateManager.getMetadata(depId);
                const fileScope = dep.file_scope || { allowed: [] };
                for (const file of fileScope.allowed || []) {
                    relevant.add(file);
                }
            } catch (error) {
                // Skip
            }
        }

        // 2. Files from same layer (if layer is defined)
        if (ticket.layer) {
            const layerFiles = this.archGuard.getLayerForFile('.'); // Get all files for layer
            // Note: This is a simplified approach - in practice you'd scan layer patterns
        }

        // 3. Files this ticket is allowed to modify
        const fileScope = ticket.file_scope || { allowed: [] };
        for (const pattern of fileScope.allowed || []) {
            const matches = this.globFiles(pattern);
            for (const file of matches) {
                relevant.add(file);
            }
        }

        return Array.from(relevant);
    }

    /**
     * Build architecture context for ticket's layer
     */
    private buildArchitectureContext(ticket: TicketMetadata): string | undefined {
        if (!this.config.includeArchitectureRules) return undefined;

        const layer = ticket.layer;
        if (!layer) return undefined;

        const allowedImports = this.archGuard.getAllowedImports('src/' + layer);
        
        return `Layer: ${layer}\nAllowed imports: ${allowedImports.join(', ') || 'none'}`;
    }

    /**
     * Build project-level context
     */
    private async buildProjectContext(ticketId?: string): Promise<ProjectContext | undefined> {
        const relevantDocs: string[] = [];
        
        // Check for project foundation docs
        const docPaths = [
            'project-management/vision.md',
            'project-management/PRD.md',
            'project-management/FRD.md',
            'design-system/MASTER.md',
            'README.md'
        ];

        for (const docPath of docPaths) {
            const fullPath = path.resolve(process.cwd(), docPath);
            if (fs.existsSync(fullPath)) {
                relevantDocs.push(docPath);
            }
        }

        // Check for ticket-specific docs if ticketId provided
        if (ticketId) {
            const ticketDir = await StateManager.getTicketDirPath(ticketId);
            if (ticketDir) {
                const ticketDocs = [
                    'requirements/README.md',
                    'design/README.md',
                    'planning/README.md',
                    'testing/README.md'
                ];

                for (const doc of ticketDocs) {
                    const fullPath = path.join(ticketDir, doc);
                    if (fs.existsSync(fullPath)) {
                        // Use relative path for context pack
                        relevantDocs.push(path.relative(process.cwd(), fullPath));
                    }
                }
            }
        }

        if (relevantDocs.length === 0) return undefined;

        return {
            name: this.inferProjectName(),
            relevantDocs
        };
    }

    /**
     * Render context pack as markdown
     */
    private renderContextMarkdown(pack: AgentContextPack): string {
        let md = `# AI Context Pack: ${pack.ticketId}\n\n`;
        md += `**Generated**: ${pack.generatedAt}\n\n`;
        
        md += `## Goal\n\n${pack.goal}\n\n`;
        md += `## Current Phase\n\n${pack.currentPhase}\n\n`;

        // Dependencies
        if (pack.dependencies.length > 0) {
            md += `## Dependencies\n\n`;
            for (const dep of pack.dependencies) {
                md += `- **${dep.ticketId}** (${dep.status})\n`;
                if (dep.filesModified.length > 0) {
                    md += `  - Files: ${dep.filesModified.join(', ')}\n`;
                }
                if (dep.summary) {
                    md += `  - Summary: ${dep.summary}\n`;
                }
            }
            md += '\n';
        }

        // Relevant Files
        if (pack.relevantFiles.length > 0) {
            md += `## Relevant Files\n\n`;
            for (const file of pack.relevantFiles) {
                md += `- \`${file}\`\n`;
            }
            md += '\n';
        }

        // Allowed Files (scope)
        if (pack.allowedFiles.length > 0) {
            md += `## Allowed Files (Ticket Scope)\n\n`;
            for (const file of pack.allowedFiles.slice(0, 10)) {
                md += `- \`${file}\`\n`;
            }
            if (pack.allowedFiles.length > 10) {
                md += `- ... and ${pack.allowedFiles.length - 10} more\n`;
            }
            md += '\n';
        }

        // Architecture Rules
        if (pack.architectureRules) {
            md += `## Architecture Rules\n\n${pack.architectureRules}\n\n`;
        }

        // Project Context
        if (pack.projectContext) {
            md += `## Project Context\n\n`;
            md += `**Project**: ${pack.projectContext.name}\n\n`;
            if (pack.projectContext.relevantDocs.length > 0) {
                md += `**Reference Documents**:\n`;
                for (const doc of pack.projectContext.relevantDocs) {
                    md += `- ${doc}\n`;
                }
            }
            md += '\n';
        }

        md += `---\n\n`;
        md += `**Instructions**: Focus only on the files in "Allowed Files" section. `;
        md += `Do not modify files outside this scope. `;
        md += `Reference the dependency files for context but do not change them.\n`;

        return md;
    }

    /**
     * Helper: Glob files
     */
    private globFiles(pattern: string): string[] {
        try {
            const glob = require('glob');
            return glob.globSync(pattern, { cwd: process.cwd() });
        } catch (error) {
            return [];
        }
    }

    /**
     * Infer project name from directory or package.json
     */
    private inferProjectName(): string {
        // Try package.json
        const packagePath = path.resolve(process.cwd(), 'package.json');
        if (fs.existsSync(packagePath)) {
            try {
                const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
                if (pkg.name) return pkg.name;
            } catch (error) {
                // Fall through
            }
        }

        // Use directory name
        return path.basename(process.cwd());
    }

    /**
     * Clean up old context files
     */
    cleanup(maxAgeHours: number = 24): void {
        const outputDir = path.resolve(process.cwd(), this.config.contextOutputDir);
        if (!fs.existsSync(outputDir)) return;

        const now = Date.now();
        const maxAge = maxAgeHours * 60 * 60 * 1000;

        const files = fs.readdirSync(outputDir);
        for (const file of files) {
            const filePath = path.join(outputDir, file);
            const stats = fs.statSync(filePath);
            
            if (now - stats.mtime.getTime() > maxAge) {
                fs.unlinkSync(filePath);
            }
        }
    }

    // ==================== Phase 6: Architecture Registry Integration ====================

    /**
     * Build architecture context using the Architecture Registry
     * Provides module-level insights for better context accuracy
     */
    private async buildArchitectureRegistryContext(
        ticket: TicketMetadata
    ): Promise<ArchitectureContext | undefined> {
        if (!this.archRegistry || !this.config.enableArchitectureRegistry) {
            return undefined;
        }

        // Try to find a matching module for this ticket
        const moduleName = this.inferModuleFromTicket(ticket);
        if (!moduleName) {
            return undefined;
        }

        // Query the registry for module information
        const moduleContext = this.archRegistry.buildContextForTicket(moduleName);
        if (!moduleContext) {
            return undefined;
        }

        // Build layer rules from ArchitectureGuard
        const layer = ticket.layer;
        let layerRules = '';
        if (layer) {
            const allowedImports = this.archGuard.getAllowedImports('src/' + layer);
            layerRules = `Layer: ${layer}\nAllowed imports: ${allowedImports.join(', ') || 'none'}`;
        }

        return {
            primaryModule: moduleContext.primaryModule.name,
            relatedModules: moduleContext.relatedModules.map(m => m.name),
            suggestedFiles: moduleContext.suggestedFiles,
            moduleInstructions: moduleContext.instructions,
            layerRules
        };
    }

    /**
     * Infer module name from ticket metadata
     */
    private inferModuleFromTicket(ticket: TicketMetadata): string | null {
        const searchText = ticket.title;
        
        // Common patterns: "Add X to YModule", "Fix ZService", "Update WManager"
        const patterns = [
            /(\w+(?:Service|Manager|Repository|Controller|Component))/i,
            /(\w+(?:Model|Handler|Middleware|Utility))/i
        ];

        for (const pattern of patterns) {
            const match = searchText.match(pattern);
            if (match) {
                return match[1];
            }
        }

        // Try to match from allowed files
        const fileScope = ticket.file_scope || { allowed: [] };
        for (const pattern of fileScope.allowed || []) {
            // Extract potential module name from file path
            const fileName = path.basename(pattern, path.extname(pattern));
            if (fileName && fileName !== '*') {
                return fileName;
            }
        }

        return null;
    }

    // ==================== Phase 6: Context Compression ====================

    /**
     * Compress context files for token optimization
     */
    private async compressContextFiles(
        filePaths: string[]
    ): Promise<Map<string, CompressedFile>> {
        if (!this.compressor || !this.config.enableContextCompression) {
            // Return uncompressed
            const map = new Map<string, CompressedFile>();
            for (const path of filePaths) {
                const content = this.readFileSafe(path);
                if (content) {
                    const lines = content.split('\n');
                    map.set(path, {
                        path,
                        summary: `${lines.length} lines (uncompressed)`,
                        keySections: [content],
                        totalLines: lines.length,
                        compressedLines: lines.length,
                        compressionRatio: 1
                    });
                }
            }
            return map;
        }

        return this.compressor.compressFiles(filePaths);
    }

    /**
     * Generate compressed context file with token optimization
     */
    async generateCompressedContextFile(ticketId: string): Promise<string> {
        const pack = await this.buildContext(ticketId);
        
        // Compress relevant files
        const compressedFiles = await this.compressContextFiles(pack.relevantFiles);
        
        // Calculate compression stats
        const originalTokens = Array.from(compressedFiles.values())
            .reduce((sum, f) => sum + f.totalLines * 4, 0); // Rough estimate
        const compressedTokens = this.compressor?.estimateTokens(compressedFiles) || originalTokens;
        
        pack.compressionInfo = {
            originalFiles: pack.relevantFiles.length,
            compressedFiles: compressedFiles.size,
            estimatedTokens: compressedTokens,
            compressionRatio: compressedTokens / originalTokens
        };
        pack.compressedContent = compressedFiles;

        // Generate phase-specific optimized context
        const optimizedMarkdown = this.renderOptimizedContextMarkdown(pack, compressedFiles);
        
        // Ensure output directory exists
        const outputDir = path.resolve(process.cwd(), this.config.contextOutputDir);
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        const outputPath = path.join(outputDir, `${ticketId}_optimized.md`);
        fs.writeFileSync(outputPath, optimizedMarkdown, 'utf8');
        
        return outputPath;
    }

    /**
     * Render optimized context markdown with compression info
     */
    private renderOptimizedContextMarkdown(
        pack: AgentContextPack,
        compressedFiles: Map<string, CompressedFile>
    ): string {
        let md = `# AI Context Pack: ${pack.ticketId} (Optimized)\n\n`;
        md += `**Generated**: ${pack.generatedAt}\n`;
        
        if (pack.compressionInfo) {
            md += `**Token Estimate**: ~${pack.compressionInfo.estimatedTokens} tokens `;
            md += `(saved ${Math.round((1 - pack.compressionInfo.compressionRatio) * 100)}%)\n`;
        }
        md += '\n';
        
        md += `## Goal\n\n${pack.goal}\n\n`;
        md += `## Current Phase\n\n${pack.currentPhase}\n\n`;

        // Architecture Context
        if (pack.architectureContext) {
            md += `## Architecture Context\n\n`;
            md += `${pack.architectureContext.moduleInstructions}\n\n`;
            if (pack.architectureContext.layerRules) {
                md += `**Layer Rules**:\n${pack.architectureContext.layerRules}\n\n`;
            }
        }

        // Dependencies
        if (pack.dependencies.length > 0) {
            md += `## Dependencies\n\n`;
            for (const dep of pack.dependencies) {
                md += `- **${dep.ticketId}** (${dep.status})\n`;
                if (dep.filesModified.length > 0) {
                    md += `  - Files: ${dep.filesModified.join(', ')}\n`;
                }
            }
            md += '\n';
        }

        // Compressed Files
        md += `## Relevant Code (Compressed)\n\n`;
        for (const [filePath, file] of compressedFiles) {
            md += `### ${filePath}\n\n`;
            md += `> ${file.summary}\n\n`;
            
            if (file.keySections.length > 0) {
                md += '```\n';
                for (const section of file.keySections) {
                    md += section + '\n';
                }
                md += '```\n\n';
            }
        }

        // Allowed Files
        if (pack.allowedFiles.length > 0) {
            md += `## Allowed Files (Ticket Scope)\n\n`;
            for (const file of pack.allowedFiles) {
                md += `- \`${file}\`\n`;
            }
            md += '\n';
        }

        md += `---\n\n`;
        md += `**Instructions**: Focus only on the files in "Allowed Files" section. `;
        md += `Do not modify files outside this scope. `;
        md += `Reference the dependency files for context but do not change them.\n`;

        return md;
    }

    /**
     * Helper: Read file content safely
     */
    private readFileSafe(filePath: string): string | null {
        try {
            return fs.readFileSync(filePath, 'utf8');
        } catch {
            return null;
        }
    }
}
