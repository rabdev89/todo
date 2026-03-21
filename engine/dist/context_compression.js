"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.PhaseContextBuilder = exports.ContextCompressor = void 0;
const fs = __importStar(require("fs"));
class ContextCompressor {
    options;
    constructor(options = {}) {
        this.options = {
            maxFileSize: 5000,
            maxLinesPerFile: 100,
            includeImports: true,
            includeExports: true,
            includeDocstrings: true,
            summarizeThreshold: 50,
            ...options
        };
    }
    /**
     * Compress a single file based on its size and content
     */
    compressFile(filePath, content) {
        const fileContent = content || this.readFile(filePath);
        if (!fileContent) {
            return {
                path: filePath,
                summary: 'File not found or empty',
                keySections: [],
                totalLines: 0,
                compressedLines: 0,
                compressionRatio: 1
            };
        }
        const lines = fileContent.split('\n');
        const totalLines = lines.length;
        // Small files: include verbatim
        if (totalLines <= this.options.summarizeThreshold) {
            return {
                path: filePath,
                summary: `Complete file (${totalLines} lines)`,
                keySections: [fileContent],
                totalLines,
                compressedLines: totalLines,
                compressionRatio: 1
            };
        }
        // Large files: extract key sections
        const keySections = this.extractKeySections(filePath, lines);
        const compressedContent = keySections.join('\n');
        const compressedLines = compressedContent.split('\n').length;
        return {
            path: filePath,
            summary: this.generateSummary(filePath, lines, keySections),
            keySections,
            totalLines,
            compressedLines,
            compressionRatio: compressedLines / totalLines
        };
    }
    /**
     * Compress multiple files for context pack
     */
    compressFiles(filePaths, relevanceScores) {
        const result = new Map();
        // Sort by relevance if scores provided
        const sortedPaths = relevanceScores
            ? filePaths.sort((a, b) => (relevanceScores.get(b) || 0.5) - (relevanceScores.get(a) || 0.5))
            : filePaths;
        for (const filePath of sortedPaths) {
            result.set(filePath, this.compressFile(filePath));
        }
        return result;
    }
    /**
     * Render compressed files as markdown
     */
    renderCompressedContext(compressedFiles) {
        let md = '';
        for (const [path, file] of compressedFiles) {
            md += `### ${path}\n\n`;
            md += `> ${file.summary}\n\n`;
            if (file.keySections.length > 0) {
                md += '```\n';
                for (const section of file.keySections) {
                    md += section + '\n';
                }
                md += '```\n\n';
            }
        }
        return md;
    }
    /**
     * Calculate total token estimate for compressed context
     * Rough estimate: 1 token ≈ 4 characters for code
     */
    estimateTokens(compressedFiles) {
        let totalChars = 0;
        for (const file of compressedFiles.values()) {
            totalChars += file.summary.length;
            for (const section of file.keySections) {
                totalChars += section.length;
            }
        }
        return Math.ceil(totalChars / 4);
    }
    /**
     * Extract key sections from file based on type
     */
    extractKeySections(filePath, lines) {
        const sections = [];
        const ext = filePath.split('.').pop()?.toLowerCase();
        // Extract imports
        if (this.options.includeImports) {
            const imports = this.extractImports(lines, ext || '');
            if (imports.length > 0) {
                sections.push('// Imports:\n' + imports.join('\n'));
            }
        }
        // Extract exports/public API
        if (this.options.includeExports) {
            const exports = this.extractExports(lines, ext || '');
            if (exports.length > 0) {
                sections.push('// Public API:\n' + exports.join('\n'));
            }
        }
        // Extract type definitions
        const types = this.extractTypeDefinitions(lines, ext || '');
        if (types.length > 0) {
            sections.push('// Types:\n' + types.join('\n'));
        }
        // Extract function/class signatures with docstrings
        const signatures = this.extractSignatures(lines, ext || '');
        if (signatures.length > 0) {
            sections.push('// Signatures:\n' + signatures.join('\n'));
        }
        return sections;
    }
    /**
     * Extract import statements
     */
    extractImports(lines, ext) {
        const imports = [];
        if (['ts', 'tsx', 'js', 'jsx'].includes(ext)) {
            const importRegex = /^(import|const\s+.*\s+=\s+require)/;
            for (const line of lines) {
                if (importRegex.test(line.trim())) {
                    imports.push(line.trim());
                }
            }
        }
        else if (ext === 'py') {
            const importRegex = /^(from|import)\s+/;
            for (const line of lines) {
                if (importRegex.test(line.trim())) {
                    imports.push(line.trim());
                }
            }
        }
        else if (ext === 'dart') {
            const importRegex = /^import\s+['"]/;
            for (const line of lines) {
                if (importRegex.test(line.trim())) {
                    imports.push(line.trim());
                }
            }
        }
        return imports.slice(0, 20); // Limit imports
    }
    /**
     * Extract export statements and public API
     */
    extractExports(lines, ext) {
        const exports = [];
        if (['ts', 'tsx', 'js', 'jsx'].includes(ext)) {
            const exportRegex = /^(export\s+(?:default\s+)?(?:class|interface|type|function|const|enum))/;
            for (const line of lines) {
                if (exportRegex.test(line.trim())) {
                    // Include this line and next for function/class signatures
                    const idx = lines.indexOf(line);
                    const snippet = lines.slice(idx, Math.min(idx + 3, lines.length));
                    exports.push(snippet.join('\n'));
                }
            }
        }
        else if (ext === 'py') {
            // Python doesn't have explicit exports, so look for public classes/functions
            const defRegex = /^(class|def)\s+([A-Z][a-zA-Z0-9_]*)/;
            for (const line of lines) {
                const match = line.trim().match(defRegex);
                if (match && !line.trim().startsWith('_')) {
                    exports.push(line.trim());
                }
            }
        }
        return exports.slice(0, 15);
    }
    /**
     * Extract type definitions
     */
    extractTypeDefinitions(lines, ext) {
        const types = [];
        if (['ts', 'tsx'].includes(ext)) {
            const typeRegex = /^(export\s+)?(type|interface)\s+\w+/;
            let inType = false;
            let currentType = [];
            for (const line of lines) {
                if (typeRegex.test(line.trim())) {
                    inType = true;
                    currentType = [line];
                }
                else if (inType) {
                    currentType.push(line);
                    if (line.trim() === '}' || (line.trim() === '' && currentType.length > 5)) {
                        types.push(currentType.join('\n'));
                        inType = false;
                        currentType = [];
                    }
                }
            }
        }
        return types.slice(0, 10);
    }
    /**
     * Extract function/method signatures with docstrings
     */
    extractSignatures(lines, ext) {
        const signatures = [];
        if (['ts', 'tsx', 'js', 'jsx', 'py'].includes(ext)) {
            const funcRegex = ext === 'py'
                ? /^(def|class)\s+\w+/
                : /^(\s*)(async\s+)?(function|get|set)\s+\w+|^(\s*)(async\s+)?\w+\s*[<(]/;
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                if (funcRegex.test(line)) {
                    // Look for docstring (Python) or JSDoc (TS/JS)
                    const docStart = Math.max(0, i - 5);
                    const docEnd = Math.min(lines.length, i + 3);
                    const snippet = lines.slice(docStart, docEnd);
                    signatures.push(snippet.join('\n'));
                    if (signatures.length >= 10)
                        break;
                }
            }
        }
        return signatures;
    }
    /**
     * Generate summary of file content
     */
    generateSummary(filePath, allLines, keySections) {
        const ext = filePath.split('.').pop() || 'unknown';
        const fileName = filePath.split('/').pop() || filePath;
        // Count definitions
        let classCount = 0;
        let funcCount = 0;
        let exportCount = 0;
        for (const line of allLines) {
            const trimmed = line.trim();
            if (/^export\s+class|^class\s+/.test(trimmed))
                classCount++;
            if (/^export\s+function|^function\s+|^def\s+/.test(trimmed))
                funcCount++;
            if (/^export\s+/.test(trimmed))
                exportCount++;
        }
        const parts = [];
        parts.push(`${allLines.length} lines`);
        if (classCount > 0)
            parts.push(`${classCount} classes`);
        if (funcCount > 0)
            parts.push(`${funcCount} functions`);
        if (exportCount > 0)
            parts.push(`${exportCount} exports`);
        parts.push(`${keySections.length} key sections extracted`);
        return parts.join(', ');
    }
    /**
     * Read file content safely
     */
    readFile(filePath) {
        try {
            return fs.readFileSync(filePath, 'utf8');
        }
        catch {
            return null;
        }
    }
}
exports.ContextCompressor = ContextCompressor;
/**
 * Utility to create phase-specific context subsets
 */
class PhaseContextBuilder {
    /**
     * Build context appropriate for specific phase
     */
    static buildPhaseContext(phase, ticket, relevantFiles, architectureInfo) {
        let context = '';
        switch (phase) {
            case 'research':
                context = this.buildResearchContext(ticket, relevantFiles);
                break;
            case 'design':
                context = this.buildDesignContext(ticket, relevantFiles, architectureInfo);
                break;
            case 'implement':
                context = this.buildImplementContext(ticket, relevantFiles, architectureInfo);
                break;
            case 'test':
                context = this.buildTestContext(ticket, relevantFiles);
                break;
            case 'validate':
                context = this.buildValidateContext(ticket, relevantFiles);
                break;
        }
        return context;
    }
    static buildResearchContext(ticket, files) {
        return `
## Research Phase Context

**Goal**: ${ticket.title}

**Description**: ${ticket.description || 'No description provided'}

**Relevant Code Files**: ${files.size}
${this.renderFileList(files)}

Focus: Discover patterns, understand existing implementations, identify reusable components.
    `.trim();
    }
    static buildDesignContext(ticket, files, architectureInfo) {
        return `
## Design Phase Context

**Goal**: ${ticket.title}

**Existing Code to Reference**:
${this.renderFileSummaries(files)}

${architectureInfo ? `**Architecture Constraints**:\n${architectureInfo}` : ''}

**Specifications**: ${ticket.specs || 'None provided'}

Focus: Create implementation plan that leverages existing patterns and follows architecture rules.
    `.trim();
    }
    static buildImplementContext(ticket, files, architectureInfo) {
        // For implementation, include more code detail
        let codeDetail = '';
        for (const [path, file] of files) {
            if (file.compressionRatio > 0.8) {
                // Include full content for minimally compressed files
                codeDetail += "\n### " + path + "\n```\n" + file.keySections.join('\n') + "\n```\n";
            }
        }
        return `
## Implementation Phase Context

**Goal**: ${ticket.title}

**Files to Modify**:
${this.renderFileList(files)}

**Reference Code**:
${codeDetail}

${architectureInfo ? `**Architecture Rules**:\n${architectureInfo}` : ''}

Focus: Implement according to BLUEPRINT.md. Only modify allowed files.
    `.trim();
    }
    static buildTestContext(ticket, files) {
        return `
## Test Phase Context

**Goal**: Write tests for ${ticket.title}

**Implementation Files**:
${this.renderFileSummaries(files)}

Focus: Target 80-100% coverage. Test edge cases and integration points.
    `.trim();
    }
    static buildValidateContext(ticket, files) {
        return `
## Validation Phase Context

**Goal**: Validate ${ticket.title}

**Files to Review**:
${this.renderFileSummaries(files)}

Focus: Check against requirements, design docs, and architecture rules. Flag any drift.
    `.trim();
    }
    static renderFileList(files) {
        return Array.from(files.keys())
            .map(f => `- \`${f}\``)
            .join('\n');
    }
    static renderFileSummaries(files) {
        return Array.from(files.entries())
            .map(([path, file]) => `- \`${path}\`: ${file.summary}`)
            .join('\n');
    }
}
exports.PhaseContextBuilder = PhaseContextBuilder;
exports.default = { ContextCompressor, PhaseContextBuilder };
