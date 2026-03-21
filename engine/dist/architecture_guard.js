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
exports.ArchitectureGuard = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const glob_1 = require("glob");
const config_1 = require("./shared/config");
const config = config_1.BobConfig.getInstance();
class ArchitectureGuard {
    config;
    constructor(config) {
        this.config = config || this.loadDefaultConfig();
    }
    /**
     * Load configuration from file or use defaults
     */
    static loadConfig(configPath) {
        if (configPath && fs.existsSync(configPath)) {
            const content = fs.readFileSync(configPath, 'utf8');
            return JSON.parse(content);
        }
        return this.getDefaultConfig();
    }
    /**
     * Default configuration - tech agnostic examples
     */
    static getDefaultConfig() {
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
    loadDefaultConfig() {
        return ArchitectureGuard.getDefaultConfig();
    }
    /**
     * Check imports in files for architecture violations
     */
    async checkImports(files) {
        const violations = [];
        const filesToCheck = files || this.getAllSourceFiles();
        const layersDetected = new Map();
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
            layersDetected.get(layer).push(file);
            // Parse imports from file
            const imports = this.parseImports(file);
            for (const importedPath of imports) {
                const resolvedPath = this.resolveImportPath(file, importedPath);
                if (!resolvedPath)
                    continue;
                const importedLayer = this.getLayerForFile(resolvedPath);
                if (!importedLayer)
                    continue;
                // Check if import is allowed
                const layerRule = this.config.layers.find(l => l.name === layer);
                if (!layerRule)
                    continue;
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
    getLayerForFile(filePath) {
        for (const layer of this.config.layers) {
            for (const pattern of layer.patterns) {
                const matches = (0, glob_1.globSync)(pattern, { cwd: process.cwd() });
                const absoluteMatches = matches.map((m) => path.resolve(m));
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
    isImportAllowed(fromFile, importPath) {
        const fromLayer = this.getLayerForFile(fromFile);
        if (!fromLayer)
            return true; // Unknown layer, allow
        const resolvedPath = this.resolveImportPath(fromFile, importPath);
        if (!resolvedPath)
            return true; // Can't resolve, allow (external dep)
        const toLayer = this.getLayerForFile(resolvedPath);
        if (!toLayer)
            return true; // Unknown target layer, allow
        const layerRule = this.config.layers.find(l => l.name === fromLayer);
        if (!layerRule)
            return true;
        return layerRule.allowedImports.includes(toLayer);
    }
    /**
     * Get allowed imports for a file
     */
    getAllowedImports(filePath) {
        const layer = this.getLayerForFile(filePath);
        if (!layer)
            return [];
        const layerRule = this.config.layers.find(l => l.name === layer);
        if (!layerRule)
            return [];
        // Return example import patterns for each allowed layer
        const allowed = [];
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
    parseImports(filePath) {
        const imports = [];
        if (!fs.existsSync(filePath))
            return imports;
        const ext = path.extname(filePath);
        const content = fs.readFileSync(filePath, 'utf8');
        // TypeScript/JavaScript imports
        if (['.ts', '.tsx', '.js', '.jsx', '.mjs'].includes(ext)) {
            // ES6 imports: import X from 'path' or import { X } from 'path'
            const es6Regex = /import\s+(?:(?:{[^}]*}|[^'"]*?)\s+from\s+)?['"]([^'"]+)['"];?/g;
            let match;
            while ((match = es6Regex.exec(content)) !== null) {
                if (!match[1].startsWith('.'))
                    continue; // Only check relative imports
                imports.push(match[1]);
            }
            // CommonJS requires: require('path')
            const cjsRegex = /require\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
            while ((match = cjsRegex.exec(content)) !== null) {
                if (!match[1].startsWith('.'))
                    continue;
                imports.push(match[1]);
            }
            // Dynamic imports: import('path')
            const dynamicRegex = /import\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
            while ((match = dynamicRegex.exec(content)) !== null) {
                if (!match[1].startsWith('.'))
                    continue;
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
                }
                else if (match[1].startsWith('.')) {
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
    resolveImportPath(fromFile, importPath) {
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
                        const matches = (0, glob_1.globSync)(pattern, { cwd: config.getRootDir() });
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
    getAllSourceFiles() {
        const files = [];
        for (const layer of this.config.layers) {
            for (const pattern of layer.patterns) {
                const matches = (0, glob_1.globSync)(pattern, { cwd: process.cwd() });
                files.push(...matches);
            }
        }
        // Remove duplicates and excluded patterns
        const unique = [...new Set(files)];
        return unique.filter(file => {
            for (const exclude of this.config.excludePatterns) {
                const matches = (0, glob_1.globSync)(exclude, { cwd: config.getRootDir() });
                if (matches.includes(file))
                    return false;
            }
            return true;
        });
    }
    /**
     * Format violations for display
     */
    static formatViolations(result) {
        if (result.valid) {
            return '✓ No architecture violations detected';
        }
        let output = `✗ Architecture violations (${result.violations.length}):\n`;
        // Group by layer
        const byLayer = new Map();
        for (const v of result.violations) {
            if (!byLayer.has(v.layer)) {
                byLayer.set(v.layer, []);
            }
            byLayer.get(v.layer).push(v);
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
    generateRulesDoc() {
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
exports.ArchitectureGuard = ArchitectureGuard;
