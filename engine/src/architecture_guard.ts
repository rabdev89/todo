import * as fs from 'fs';
import * as path from 'path';
import { globSync } from 'glob';
import { BobConfig } from './shared/config';

const config = BobConfig.getInstance();

/**
 * Architecture Guard - Enforces layer boundaries and import rules
 * 
 * Tech-agnostic: Configurable for any project architecture
 * Prevents architectural erosion (e.g., UI importing database layer)
 */

export interface LayerRule {
    name: string;
    patterns: string[];        // Glob patterns matching files in this layer
    allowedImports: string[]; // Layer names this layer can import from
    description?: string;
}

export interface ArchitectureConfig {
    layers: LayerRule[];
    strictMode: boolean;      // If true, any unmatched file triggers violation
    excludePatterns: string[]; // Files to exclude from checking
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
    layersDetected: Map<string, string[]>; // layer -> files
}

export class ArchitectureGuard {
    private config: ArchitectureConfig;

    constructor(config?: ArchitectureConfig) {
        this.config = config || this.loadDefaultConfig();
    }

    /**
     * Load configuration from file or use defaults
     */
    static loadConfig(configPath?: string): ArchitectureConfig {
        if (configPath && fs.existsSync(configPath)) {
            const content = fs.readFileSync(configPath, 'utf8');
            return JSON.parse(content);
        }
        return this.getDefaultConfig();
    }

    /**
     * Default configuration - tech agnostic examples
     */
    static getDefaultConfig(): ArchitectureConfig {
        return {
            layers: [
                {
                    name: 'ui',
                    patterns: ['src/ui/**/*', 'src/components/**/*', 'src/pages/**/*'],
                    allowedImports: ['service', 'model', 'utils', 'types'],
                    description: 'UI components and pages'
                },
                {
                    name: 'service',
                    patterns: ['src/services/**/*', 'src/api/**/*', 'src/business/**/*'],
                    allowedImports: ['model', 'utils', 'types', 'infra'],
                    description: 'Business logic and services'
                },
                {
                    name: 'model',
                    patterns: ['src/models/**/*', 'src/entities/**/*', 'src/domain/**/*'],
                    allowedImports: ['utils', 'types'],
                    description: 'Data models and entities'
                },
                {
                    name: 'utils',
                    patterns: ['src/utils/**/*', 'src/helpers/**/*', 'src/lib/**/*'],
                    allowedImports: ['types'],
                    description: 'Utility functions'
                },
                {
                    name: 'infra',
                    patterns: ['src/infra/**/*', 'src/db/**/*', 'src/repository/**/*'],
                    allowedImports: ['model', 'utils', 'types'],
                    description: 'Infrastructure and database access'
                },
                {
                    name: 'types',
                    patterns: ['src/types/**/*', 'src/interfaces/**/*'],
                    allowedImports: [],
                    description: 'Shared type definitions'
                }
            ],
            strictMode: false,
            excludePatterns: [
                '**/*.test.*',
                '**/*.spec.*',
                '**/node_modules/**',
                '**/.git/**'
            ]
        };
    }

    private loadDefaultConfig(): ArchitectureConfig {
        return ArchitectureGuard.getDefaultConfig();
    }

    /**
     * Check imports in files for architecture violations
     */
    async checkImports(files?: string[]): Promise<ArchitectureCheckResult> {
        const violations: ImportViolation[] = [];
        const filesToCheck = files || this.getAllSourceFiles();
        const layersDetected = new Map<string, string[]>();

        // Build layer map
        for (const layer of this.config.layers) {
            layersDetected.set(layer.name, []);
        }

        for (const file of filesToCheck) {
            const layer = this.getLayerForFile(file);
            
            if (!layer) {
                if (this.config.strictMode) {
                    violations.push({
                        file,
                        layer: 'unknown',
                        importedFile: '',
                        importedLayer: '',
                        reason: 'File does not belong to any defined layer'
                    });
                }
                continue;
            }

            layersDetected.get(layer)!.push(file);

            // Parse imports from file
            const imports = this.parseImports(file);
            
            for (const importedPath of imports) {
                const resolvedPath = this.resolveImportPath(file, importedPath);
                if (!resolvedPath) continue;

                const importedLayer = this.getLayerForFile(resolvedPath);
                if (!importedLayer) continue;

                // Check if import is allowed
                const layerRule = this.config.layers.find(l => l.name === layer);
                if (!layerRule) continue;

                if (!layerRule.allowedImports.includes(importedLayer)) {
                    violations.push({
                        file,
                        layer,
                        importedFile: resolvedPath,
                        importedLayer: importedLayer,
                        reason: `Layer '${layer}' cannot import from '${importedLayer}'. Allowed: [${layerRule.allowedImports.join(', ')}]`
                    });
                }
            }
        }

        return {
            valid: violations.length === 0,
            violations,
            filesChecked: filesToCheck.length,
            layersDetected
        };
    }

    /**
     * Get which layer a file belongs to
     */
    getLayerForFile(filePath: string): string | null {
        for (const layer of this.config.layers) {
            for (const pattern of layer.patterns) {
                const matches = globSync(pattern, { cwd: process.cwd() });
                const absoluteMatches = matches.map((m: string) => path.resolve(m));
                if (absoluteMatches.includes(path.resolve(filePath))) {
                    return layer.name;
                }
            }
        }
        return null;
    }

    /**
     * Check if a specific import would be allowed
     */
    isImportAllowed(fromFile: string, importPath: string): boolean {
        const fromLayer = this.getLayerForFile(fromFile);
        if (!fromLayer) return true; // Unknown layer, allow

        const resolvedPath = this.resolveImportPath(fromFile, importPath);
        if (!resolvedPath) return true; // Can't resolve, allow (external dep)

        const toLayer = this.getLayerForFile(resolvedPath);
        if (!toLayer) return true; // Unknown target layer, allow

        const layerRule = this.config.layers.find(l => l.name === fromLayer);
        if (!layerRule) return true;

        return layerRule.allowedImports.includes(toLayer);
    }

    /**
     * Get allowed imports for a file
     */
    getAllowedImports(filePath: string): string[] {
        const layer = this.getLayerForFile(filePath);
        if (!layer) return [];

        const layerRule = this.config.layers.find(l => l.name === layer);
        if (!layerRule) return [];

        // Return example import patterns for each allowed layer
        const allowed: string[] = [];
        for (const allowedLayer of layerRule.allowedImports) {
            const targetLayer = this.config.layers.find(l => l.name === allowedLayer);
            if (targetLayer) {
                allowed.push(...targetLayer.patterns);
            }
        }
        return allowed;
    }

    /**
     * Parse imports from a source file
     * Supports TypeScript, JavaScript, and generic patterns
     */
    private parseImports(filePath: string): string[] {
        const imports: string[] = [];
        
        if (!fs.existsSync(filePath)) return imports;

        const ext = path.extname(filePath);
        const content = fs.readFileSync(filePath, 'utf8');

        // TypeScript/JavaScript imports
        if (['.ts', '.tsx', '.js', '.jsx', '.mjs'].includes(ext)) {
            // ES6 imports: import X from 'path' or import { X } from 'path'
            const es6Regex = /import\s+(?:(?:{[^}]*}|[^'"]*?)\s+from\s+)?['"]([^'"]+)['"];?/g;
            let match;
            while ((match = es6Regex.exec(content)) !== null) {
                if (!match[1].startsWith('.')) continue; // Only check relative imports
                imports.push(match[1]);
            }

            // CommonJS requires: require('path')
            const cjsRegex = /require\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
            while ((match = cjsRegex.exec(content)) !== null) {
                if (!match[1].startsWith('.')) continue;
                imports.push(match[1]);
            }

            // Dynamic imports: import('path')
            const dynamicRegex = /import\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
            while ((match = dynamicRegex.exec(content)) !== null) {
                if (!match[1].startsWith('.')) continue;
                imports.push(match[1]);
            }
        }

        // Python imports
        if (ext === '.py') {
            const pyRegex = /^(?:from|import)\s+([\w.]+)/gm;
            let match;
            while ((match = pyRegex.exec(content)) !== null) {
                imports.push(match[1]);
            }
        }

        // Dart/Flutter imports
        if (ext === '.dart') {
            const dartRegex = /import\s+['"]([^'"]+)['"];/g;
            let match;
            while ((match = dartRegex.exec(content)) !== null) {
                if (match[1].startsWith('package:') && !match[1].includes('dart:')) {
                    imports.push(match[1].replace('package:', './'));
                } else if (match[1].startsWith('.')) {
                    imports.push(match[1]);
                }
            }
        }

        // Rust imports
        if (ext === '.rs') {
            const rustRegex = /use\s+([^;]+);/g;
            let match;
            while ((match = rustRegex.exec(content)) !== null) {
                imports.push(match[1]);
            }
        }

        return imports;
    }

    /**
     * Resolve relative import path to absolute path
     */
    private resolveImportPath(fromFile: string, importPath: string): string | null {
        if (!importPath.startsWith('.')) {
            // External dependency - try to resolve if it matches layer patterns
            for (const layer of this.config.layers) {
                for (const pattern of layer.patterns) {
                    // Convert glob to potential path
                    const potentialPath = importPath.replace(/\//g, path.sep);
                    if (potentialPath.includes(layer.name) || 
                        pattern.includes(importPath.split('/')[0])) {
                        // This is a heuristic - external imports that match layer names
                        // are treated as if they belong to that layer
                        const matches = globSync(pattern, { cwd: config.getRootDir() });
                        if (matches.length > 0) {
                            return matches[0];
                        }
                    }
                }
            }
            return null;
        }

        const fromDir = path.dirname(fromFile);
        const extensions = ['.ts', '.tsx', '.js', '.jsx', '.py', '.dart', '.rs', ''];
        
        // Try with various extensions
        for (const ext of extensions) {
            const resolved = path.resolve(fromDir, importPath + ext);
            if (fs.existsSync(resolved)) {
                return resolved;
            }
            
            // Try index file
            const indexResolved = path.resolve(fromDir, importPath, 'index' + ext);
            if (fs.existsSync(indexResolved)) {
                return indexResolved;
            }
        }

        return null;
    }

    /**
     * Get all source files in the project
     */
    private getAllSourceFiles(): string[] {
        const files: string[] = [];
        
        for (const layer of this.config.layers) {
            for (const pattern of layer.patterns) {
                const matches = globSync(pattern, { cwd: process.cwd() });
                files.push(...matches);
            }
        }

        // Remove duplicates and excluded patterns
        const unique = [...new Set(files)];
        return unique.filter(file => {
            for (const exclude of this.config.excludePatterns) {
                const matches = globSync(exclude, { cwd: config.getRootDir() });
                if (matches.includes(file)) return false;
            }
            return true;
        });
    }

    /**
     * Format violations for display
     */
    static formatViolations(result: ArchitectureCheckResult): string {
        if (result.valid) {
            return '✓ No architecture violations detected';
        }

        let output = `✗ Architecture violations (${result.violations.length}):\n`;
        
        // Group by layer
        const byLayer = new Map<string, ImportViolation[]>();
        for (const v of result.violations) {
            if (!byLayer.has(v.layer)) {
                byLayer.set(v.layer, []);
            }
            byLayer.get(v.layer)!.push(v);
        }

        for (const [layer, violations] of byLayer) {
            output += `\n${layer} layer:\n`;
            for (const v of violations) {
                output += `  - ${path.basename(v.file)} imports from ${v.importedLayer}: ${v.importedFile}\n`;
                output += `    ${v.reason}\n`;
            }
        }

        return output;
    }

    /**
     * Generate architecture rules documentation
     */
    generateRulesDoc(): string {
        let doc = '# Architecture Layer Rules\n\n';
        
        for (const layer of this.config.layers) {
            doc += `## ${layer.name}\n\n`;
            doc += `${layer.description || 'No description'}\n\n`;
            doc += `- **Patterns**: ${layer.patterns.join(', ')}\n`;
            doc += `- **Can import from**: ${layer.allowedImports.join(', ') || 'nothing'}\n\n`;
        }

        return doc;
    }
}
