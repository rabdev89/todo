import * as fs from 'fs';
import * as path from 'path';
import { globSync } from 'glob';

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
  dependencies: string[]; // Other modules this depends on
  exposedInterfaces: string[]; // Public methods/exports
  createdAt: string;
  updatedAt: string;
  tickets: string[]; // Tickets that modified this module
}

export type ModuleType = 
  | 'service' 
  | 'manager' 
  | 'repository' 
  | 'controller' 
  | 'component' 
  | 'model' 
  | 'utility' 
  | 'middleware' 
  | 'handler' 
  | 'config';

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

export class ArchitectureRegistry {
  private static instance: ArchitectureRegistry;
  private registryPath: string;
  private data: ArchitectureRegistryData;
  private autoSave: boolean;

  constructor(registryPath?: string, autoSave = true) {
    this.registryPath = registryPath || this.getDefaultRegistryPath();
    this.autoSave = autoSave;
    this.data = this.loadOrCreate();
  }

  static getInstance(registryPath?: string): ArchitectureRegistry {
    if (!ArchitectureRegistry.instance) {
      ArchitectureRegistry.instance = new ArchitectureRegistry(registryPath);
    }
    return ArchitectureRegistry.instance;
  }

  private getDefaultRegistryPath(): string {
    return path.resolve(process.cwd(), 'engine', 'architecture', 'registry.json');
  }

  private loadOrCreate(): ArchitectureRegistryData {
    if (fs.existsSync(this.registryPath)) {
      try {
        const content = fs.readFileSync(this.registryPath, 'utf8');
        return JSON.parse(content);
      } catch (error) {
        console.warn(`Failed to load registry, creating new: ${error}`);
        return this.createDefault();
      }
    }
    return this.createDefault();
  }

  private createDefault(): ArchitectureRegistryData {
    const projectName = this.inferProjectName();
    return {
      version: '1.0.0',
      projectName,
      lastUpdated: new Date().toISOString(),
      modules: {},
      patterns: {
        naming: {
          service: '*Service.ts',
          manager: '*Manager.ts',
          repository: '*Repository.ts',
          controller: '*Controller.ts'
        },
        structure: {
          services: ['src/services/**/*', 'src/business/**/*'],
          models: ['src/models/**/*', 'src/entities/**/*'],
          controllers: ['src/controllers/**/*', 'src/api/**/*'],
          utils: ['src/utils/**/*', 'src/helpers/**/*']
        }
      }
    };
  }

  private inferProjectName(): string {
    const packagePath = path.resolve(process.cwd(), 'package.json');
    if (fs.existsSync(packagePath)) {
      try {
        const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
        return pkg.name || 'unknown-project';
      } catch {
        // Fall through
      }
    }
    return path.basename(process.cwd());
  }

  /**
   * Register a new module in the architecture
   */
  registerModule(
    name: string,
    type: ModuleType,
    primaryFile: string,
    options: {
      description?: string;
      responsibilities?: string[];
      dependencies?: string[];
      exposedInterfaces?: string[];
      secondaryFiles?: string[];
      ticketId?: string;
    } = {}
  ): ModuleEntry {
    const now = new Date().toISOString();
    const existing = this.data.modules[name];

    const moduleEntry: ModuleEntry = {
      name,
      type,
      primaryFile: path.normalize(primaryFile),
      secondaryFiles: options.secondaryFiles?.map(f => path.normalize(f)) || existing?.secondaryFiles || [],
      description: options.description || existing?.description,
      responsibilities: options.responsibilities || existing?.responsibilities || [],
      dependencies: options.dependencies || existing?.dependencies || [],
      exposedInterfaces: options.exposedInterfaces || existing?.exposedInterfaces || [],
      createdAt: existing?.createdAt || now,
      updatedAt: now,
      tickets: existing?.tickets || []
    };

    // Add ticket reference if provided
    if (options.ticketId && !moduleEntry.tickets.includes(options.ticketId)) {
      moduleEntry.tickets.push(options.ticketId);
    }

    this.data.modules[name] = moduleEntry;
    this.data.lastUpdated = now;

    if (this.autoSave) {
      this.save();
    }

    return moduleEntry;
  }

  /**
   * Get a module by name
   */
  getModule(name: string): ModuleEntry | undefined {
    return this.data.modules[name];
  }

  /**
   * Query modules by criteria
   */
  query(query: RegistryQuery): ModuleEntry[] {
    return Object.values(this.data.modules).filter(module => {
      if (query.type && module.type !== query.type) return false;
      if (query.name && !module.name.toLowerCase().includes(query.name.toLowerCase())) return false;
      if (query.filePath) {
        const normalizedQuery = path.normalize(query.filePath);
        const matchesFile = module.primaryFile === normalizedQuery ||
                           module.secondaryFiles.includes(normalizedQuery);
        if (!matchesFile) return false;
      }
      if (query.responsibility) {
        const hasResponsibility = module.responsibilities.some(r =>
          r.toLowerCase().includes(query.responsibility!.toLowerCase())
        );
        if (!hasResponsibility) return false;
      }
      return true;
    });
  }

  /**
   * Get all modules of a specific type
   */
  getByType(type: ModuleType): ModuleEntry[] {
    return this.query({ type });
  }

  /**
   * Check if a module exists for given functionality
   * Helps prevent code duplication by suggesting existing modules
   */
  suggestExistingModule(
    desiredResponsibility: string,
    desiredType: ModuleType
  ): SuggestionResult | null {
    const candidates = this.getByType(desiredType);
    
    for (const module of candidates) {
      // Check for exact name match
      if (module.name.toLowerCase() === desiredResponsibility.toLowerCase()) {
        return {
          existingModule: module,
          reason: `Module with exact name '${module.name}' already exists`,
          confidence: 'high'
        };
      }

      // Check for responsibility overlap
      for (const responsibility of module.responsibilities) {
        if (this.hasSignificantOverlap(responsibility, desiredResponsibility)) {
          return {
            existingModule: module,
            reason: `Existing module handles similar responsibility: '${responsibility}'`,
            confidence: 'medium'
          };
        }
      }
    }

    return null;
  }

  /**
   * Suggest which module should handle a new responsibility
   */
  suggestModuleForResponsibility(responsibility: string): ModuleEntry | null {
    // Look for existing modules with similar responsibilities
    const allModules = Object.values(this.data.modules);
    let bestMatch: { module: ModuleEntry; score: number } | null = null;

    for (const module of allModules) {
      let score = 0;
      
      // Score based on responsibility similarity
      for (const moduleResp of module.responsibilities) {
        const similarity = this.calculateSimilarity(responsibility, moduleResp);
        score += similarity;
      }

      // Boost score for service/manager types (typically handle responsibilities)
      if (module.type === 'service' || module.type === 'manager') {
        score *= 1.2;
      }

      if (bestMatch === null || score > bestMatch.score) {
        bestMatch = { module, score };
      }
    }

    // Only return if confidence is reasonable
    if (bestMatch && bestMatch.score > 0.3) {
      return bestMatch.module;
    }

    return null;
  }

  /**
   * Get dependencies for a module (recursive)
   */
  getDependencyTree(moduleName: string, visited = new Set<string>()): ModuleEntry[] {
    if (visited.has(moduleName)) return []; // Prevent cycles
    
    const module = this.getModule(moduleName);
    if (!module) return [];

    visited.add(moduleName);
    const dependencies: ModuleEntry[] = [module];

    for (const depName of module.dependencies) {
      const depTree = this.getDependencyTree(depName, visited);
      dependencies.push(...depTree);
    }

    return dependencies;
  }

  /**
   * Auto-scan codebase to detect modules
   */
  autoDetectModules(
    sourcePath: string = './src',
    ticketId?: string
  ): { added: ModuleEntry[]; existing: string[] } {
    const result = { added: [] as ModuleEntry[], existing: [] as string[] };
    const patterns = this.data.patterns.naming;

    for (const [type, pattern] of Object.entries(patterns)) {
      const globPattern = path.join(sourcePath, '**', pattern.replace('*', '*'));
      const files = globSync(globPattern, { cwd: process.cwd() });

      for (const file of files) {
        const name = path.basename(file, path.extname(file));
        
        if (this.data.modules[name]) {
          result.existing.push(name);
          continue;
        }

        // Extract exposed interfaces (simplified)
        const interfaces = this.extractInterfaces(file);

        const module = this.registerModule(
          name,
          type as ModuleType,
          file,
          {
            description: `Auto-detected ${type} module`,
            exposedInterfaces: interfaces,
            ticketId
          }
        );

        result.added.push(module);
      }
    }

    return result;
  }

  /**
   * Update module dependencies based on imports
   */
  updateDependencies(moduleName: string, imports: string[]): void {
    const module = this.getModule(moduleName);
    if (!module) return;

    const newDeps: string[] = [];

    for (const imp of imports) {
      // Find which module owns this import
      for (const [name, mod] of Object.entries(this.data.modules)) {
        if (imp.includes(path.basename(mod.primaryFile, path.extname(mod.primaryFile)))) {
          if (!newDeps.includes(name) && name !== moduleName) {
            newDeps.push(name);
          }
        }
      }
    }

    if (newDeps.length > 0) {
      module.dependencies = [...new Set([...module.dependencies, ...newDeps])];
      module.updatedAt = new Date().toISOString();
      
      if (this.autoSave) {
        this.save();
      }
    }
  }

  /**
   * Generate context information for a ticket
   * Used by ContextBuilder to provide accurate, minimal context
   */
  buildContextForTicket(ticketModule: string): {
    primaryModule: ModuleEntry;
    relatedModules: ModuleEntry[];
    suggestedFiles: string[];
    instructions: string;
  } | null {
    const module = this.getModule(ticketModule);
    if (!module) return null;

    const related = this.getDependencyTree(ticketModule)
      .filter(m => m.name !== ticketModule);

    const suggestedFiles = [
      module.primaryFile,
      ...module.secondaryFiles,
      ...related.flatMap(m => [m.primaryFile, ...m.secondaryFiles])
    ];

    const instructions = `
Module Context for ${ticketModule}:
- Type: ${module.type}
- Primary file: ${module.primaryFile}
- Responsibilities: ${module.responsibilities.join(', ') || 'None defined'}
- Dependencies: ${module.dependencies.join(', ') || 'None'}
${related.length > 0 ? `
Related modules to reference (not modify):
${related.map(m => `  - ${m.name} (${m.type}): ${m.primaryFile}`).join('\n')}
` : ''}
Use existing module structure. Do not create new ${module.type}s for similar functionality.
    `.trim();

    return {
      primaryModule: module,
      relatedModules: related,
      suggestedFiles: [...new Set(suggestedFiles)],
      instructions
    };
  }

  /**
   * Save registry to disk
   */
  save(): void {
    const dir = path.dirname(this.registryPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(
      this.registryPath,
      JSON.stringify(this.data, null, 2),
      'utf8'
    );
  }

  /**
   * Get full registry data
   */
  getData(): ArchitectureRegistryData {
    return { ...this.data };
  }

  /**
   * Export registry as markdown documentation
   */
  exportDocumentation(): string {
    let md = `# Architecture Registry: ${this.data.projectName}\n\n`;
    md += `**Last Updated**: ${this.data.lastUpdated}\n\n`;

    // Group by type
    const byType = new Map<ModuleType, ModuleEntry[]>();
    for (const module of Object.values(this.data.modules)) {
      if (!byType.has(module.type)) {
        byType.set(module.type, []);
      }
      byType.get(module.type)!.push(module);
    }

    for (const [type, modules] of byType) {
      md += `## ${type.charAt(0).toUpperCase() + type.slice(1)}s\n\n`;
      
      for (const module of modules) {
        md += `### ${module.name}\n\n`;
        if (module.description) {
          md += `${module.description}\n\n`;
        }
        md += `- **Primary File**: \`${module.primaryFile}\`\n`;
        if (module.secondaryFiles.length > 0) {
          md += `- **Secondary Files**: ${module.secondaryFiles.map(f => `\`${f}\``).join(', ')}\n`;
        }
        if (module.responsibilities.length > 0) {
          md += `- **Responsibilities**: ${module.responsibilities.join(', ')}\n`;
        }
        if (module.dependencies.length > 0) {
          md += `- **Dependencies**: ${module.dependencies.join(' → ')}\n`;
        }
        md += '\n';
      }
    }

    return md;
  }

  /**
   * Private helper: Check if two strings have significant word overlap
   */
  private hasSignificantOverlap(a: string, b: string): boolean {
    const wordsA = a.toLowerCase().split(/\s+/);
    const wordsB = b.toLowerCase().split(/\s+/);
    const common = wordsA.filter(w => wordsB.includes(w));
    return common.length >= Math.min(wordsA.length, wordsB.length) * 0.5;
  }

  /**
   * Private helper: Calculate string similarity (0-1)
   */
  private calculateSimilarity(a: string, b: string): number {
    const wordsA = new Set(a.toLowerCase().split(/\s+/));
    const wordsB = new Set(b.toLowerCase().split(/\s+/));
    
    const intersection = new Set([...wordsA].filter(x => wordsB.has(x)));
    const union = new Set([...wordsA, ...wordsB]);
    
    return intersection.size / union.size;
  }

  /**
   * Private helper: Extract public interfaces from a file
   */
  private extractInterfaces(filePath: string): string[] {
    const interfaces: string[] = [];
    
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      
      // TypeScript/JavaScript exports
      const exportRegex = /export\s+(?:async\s+)?(?:function|class|const|let|var)\s+(\w+)/g;
      let match;
      while ((match = exportRegex.exec(content)) !== null) {
        interfaces.push(match[1]);
      }

      // Python class/function definitions
      if (filePath.endsWith('.py')) {
        const pyRegex = /^(?:class|def)\s+(\w+)/gm;
        while ((match = pyRegex.exec(content)) !== null) {
          interfaces.push(match[1]);
        }
      }
    } catch {
      // File might not exist or be readable
    }

    return interfaces;
  }
}

export default ArchitectureRegistry;
