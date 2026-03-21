import * as fs from 'fs';

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
  maxFileSize?: number;        // Max bytes before summarizing (default: 5000)
  maxLinesPerFile?: number;    // Max lines to include verbatim (default: 100)
  includeImports?: boolean;    // Always include import sections
  includeExports?: boolean;    // Always include export/public API
  includeDocstrings?: boolean; // Include docstrings/comments
  summarizeThreshold?: number;  // Lines before auto-summarize (default: 50)
}

export class ContextCompressor {
  private options: CompressionOptions;

  constructor(options: CompressionOptions = {}) {
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
  compressFile(filePath: string, content?: string): CompressedFile {
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
    if (totalLines <= this.options.summarizeThreshold!) {
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
  compressFiles(
    filePaths: string[],
    relevanceScores?: Map<string, number>
  ): Map<string, CompressedFile> {
    const result = new Map<string, CompressedFile>();

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
  renderCompressedContext(compressedFiles: Map<string, CompressedFile>): string {
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
  estimateTokens(compressedFiles: Map<string, CompressedFile>): number {
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
  private extractKeySections(filePath: string, lines: string[]): string[] {
    const sections: string[] = [];
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
  private extractImports(lines: string[], ext: string): string[] {
    const imports: string[] = [];

    if (['ts', 'tsx', 'js', 'jsx'].includes(ext)) {
      const importRegex = /^(import|const\s+.*\s+=\s+require)/;
      for (const line of lines) {
        if (importRegex.test(line.trim())) {
          imports.push(line.trim());
        }
      }
    } else if (ext === 'py') {
      const importRegex = /^(from|import)\s+/;
      for (const line of lines) {
        if (importRegex.test(line.trim())) {
          imports.push(line.trim());
        }
      }
    } else if (ext === 'dart') {
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
  private extractExports(lines: string[], ext: string): string[] {
    const exports: string[] = [];

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
    } else if (ext === 'py') {
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
  private extractTypeDefinitions(lines: string[], ext: string): string[] {
    const types: string[] = [];

    if (['ts', 'tsx'].includes(ext)) {
      const typeRegex = /^(export\s+)?(type|interface)\s+\w+/;
      let inType = false;
      let currentType: string[] = [];

      for (const line of lines) {
        if (typeRegex.test(line.trim())) {
          inType = true;
          currentType = [line];
        } else if (inType) {
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
  private extractSignatures(lines: string[], ext: string): string[] {
    const signatures: string[] = [];

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
          
          if (signatures.length >= 10) break;
        }
      }
    }

    return signatures;
  }

  /**
   * Generate summary of file content
   */
  private generateSummary(
    filePath: string,
    allLines: string[],
    keySections: string[]
  ): string {
    const ext = filePath.split('.').pop() || 'unknown';
    const fileName = filePath.split('/').pop() || filePath;
    
    // Count definitions
    let classCount = 0;
    let funcCount = 0;
    let exportCount = 0;

    for (const line of allLines) {
      const trimmed = line.trim();
      if (/^export\s+class|^class\s+/.test(trimmed)) classCount++;
      if (/^export\s+function|^function\s+|^def\s+/.test(trimmed)) funcCount++;
      if (/^export\s+/.test(trimmed)) exportCount++;
    }

    const parts: string[] = [];
    parts.push(`${allLines.length} lines`);
    if (classCount > 0) parts.push(`${classCount} classes`);
    if (funcCount > 0) parts.push(`${funcCount} functions`);
    if (exportCount > 0) parts.push(`${exportCount} exports`);
    parts.push(`${keySections.length} key sections extracted`);

    return parts.join(', ');
  }

  /**
   * Read file content safely
   */
  private readFile(filePath: string): string | null {
    try {
      return fs.readFileSync(filePath, 'utf8');
    } catch {
      return null;
    }
  }
}

/**
 * Utility to create phase-specific context subsets
 */
export class PhaseContextBuilder {
  /**
   * Build context appropriate for specific phase
   */
  static buildPhaseContext(
    phase: 'research' | 'design' | 'implement' | 'test' | 'validate',
    ticket: {
      title: string;
      description?: string;
      specs?: string;
    },
    relevantFiles: Map<string, CompressedFile>,
    architectureInfo?: string
  ): string {
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

  private static buildResearchContext(
    ticket: { title: string; description?: string },
    files: Map<string, CompressedFile>
  ): string {
    return `
## Research Phase Context

**Goal**: ${ticket.title}

**Description**: ${ticket.description || 'No description provided'}

**Relevant Code Files**: ${files.size}
${this.renderFileList(files)}

Focus: Discover patterns, understand existing implementations, identify reusable components.
    `.trim();
  }

  private static buildDesignContext(
    ticket: { title: string; specs?: string },
    files: Map<string, CompressedFile>,
    architectureInfo?: string
  ): string {
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

  private static buildImplementContext(
    ticket: { title: string },
    files: Map<string, CompressedFile>,
    architectureInfo?: string
  ): string {
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

  private static buildTestContext(
    ticket: { title: string },
    files: Map<string, CompressedFile>
  ): string {
    return `
## Test Phase Context

**Goal**: Write tests for ${ticket.title}

**Implementation Files**:
${this.renderFileSummaries(files)}

Focus: Target 80-100% coverage. Test edge cases and integration points.
    `.trim();
  }

  private static buildValidateContext(
    ticket: { title: string },
    files: Map<string, CompressedFile>
  ): string {
    return `
## Validation Phase Context

**Goal**: Validate ${ticket.title}

**Files to Review**:
${this.renderFileSummaries(files)}

Focus: Check against requirements, design docs, and architecture rules. Flag any drift.
    `.trim();
  }

  private static renderFileList(files: Map<string, CompressedFile>): string {
    return Array.from(files.keys())
      .map(f => `- \`${f}\``)
      .join('\n');
  }

  private static renderFileSummaries(files: Map<string, CompressedFile>): string {
    return Array.from(files.entries())
      .map(([path, file]) => `- \`${path}\`: ${file.summary}`)
      .join('\n');
  }
}

export default { ContextCompressor, PhaseContextBuilder };
