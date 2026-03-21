import * as fs from 'fs-extra';
import * as path from 'path';
import { globSync } from 'glob';

/**
 * Skills Library Search Utility
 * 
 * Provides search capabilities for the skills library
 */

export interface Skill {
  name: string;
  file: string;
  category: string;
  scope?: string;
  difficulty?: string;
  effectiveness?: string;
  content: string;
  _relevance?: number;  // Internal scoring for search ranking
}

export interface SearchOptions {
  query?: string;
  category?: string;
  scope?: string;
  tech?: string;
  limit?: number;
}

export class SkillsLibrary {
  private static readonly LIBRARY_PATH = 'skills-library';

  /**
   * Search skills by keyword
   */
  static search(options: SearchOptions): Skill[] {
    const { query, category, scope, tech, limit = 10 } = options;
    
    // Get all skill files
    const skillFiles = globSync(
      `${this.LIBRARY_PATH}/**/*.md`,
      { ignore: ['**/README.md', '**/AVAILABLE_SKILLS.md', '**/TEMPLATE.md'] }
    );

    let results: Skill[] = [];

    for (const file of skillFiles) {
      const content = fs.readFileSync(file, 'utf8');
      const skill = this.parseSkill(file, content);

      if (!skill) continue;

      // Apply filters
      if (category && skill.category !== category) continue;
      if (scope && skill.scope !== scope) continue;
      if (tech && !content.toLowerCase().includes(tech.toLowerCase())) continue;
      
      // Search by query
      if (query) {
        const queryLower = query.toLowerCase();
        const searchableText = `${skill.name} ${skill.category} ${content}`.toLowerCase();
        
        if (!searchableText.includes(queryLower)) continue;
        
        // Calculate relevance score
        skill['_relevance'] = this.calculateRelevance(queryLower, searchableText);
      }

      results.push(skill);
    }

    // Sort by relevance if query provided
    if (query) {
      results.sort((a: any, b: any) => b._relevance - a._relevance);
    }

    return results.slice(0, limit);
  }

  /**
   * Get skills by category
   */
  static getByCategory(category: string): Skill[] {
    return this.search({ category, limit: 100 });
  }

  /**
   * Get all available categories
   */
  static getCategories(): string[] {
    const categories = globSync(`${this.LIBRARY_PATH}/*/`, {
      ignore: ['**/node_modules/**']
    });

    return categories
      .map(cat => path.basename(cat))
      .filter(cat => !['README.md', 'AVAILABLE_SKILLS.md'].includes(cat));
  }

  /**
   * Get skill by exact name
   */
  static getSkill(name: string): Skill | null {
    const results = this.search({ query: name, limit: 1 });
    return results[0] || null;
  }

  /**
   * Parse skill metadata from markdown file
   */
  private static parseSkill(filePath: string, content: string): Skill | null {
    const filename = path.basename(filePath, '.md');
    const category = path.basename(path.dirname(filePath));

    // Extract metadata from frontmatter
    const metadataMatch = content.match(/## Metadata\n([\s\S]*?)(?=\n##|$)/);
    
    let scope: string | undefined;
    let difficulty: string | undefined;
    let effectiveness: string | undefined;

    if (metadataMatch) {
      const metadata = metadataMatch[1];
      
      const scopeMatch = metadata.match(/\*\*Scope\*\*:\s*(.+)/);
      if (scopeMatch) scope = scopeMatch[1].trim();
      
      const difficultyMatch = metadata.match(/\*\*Difficulty\*\*:\s*(.+)/);
      if (difficultyMatch) difficulty = difficultyMatch[1].trim();
      
      const effectivenessMatch = metadata.match(/\*\*Effectiveness\*\*:\s*(.+)/);
      if (effectivenessMatch) effectiveness = effectivenessMatch[1].trim();
    }

    // Extract skill name from title
    const titleMatch = content.match(/# SKILL:\s*(.+)/);
    const name = titleMatch ? titleMatch[1].trim() : filename;

    return {
      name,
      file: filePath,
      category,
      scope,
      difficulty,
      effectiveness,
      content
    };
  }

  /**
   * Calculate relevance score for search
   */
  private static calculateRelevance(query: string, text: string): number {
    let score = 0;
    
    // Title match (highest weight)
    if (text.includes(`skill: ${query}`)) score += 10;
    if (text.includes(query)) score += 5;
    
    // Category match
    if (text.includes(`category: ${query}`)) score += 3;
    
    // Multiple occurrences
    const occurrences = (text.match(new RegExp(query, 'g')) || []).length;
    score += Math.min(occurrences, 5);

    return score;
  }

  /**
   * Get skills for a specific tech stack
   */
  static getByTech(tech: string): Skill[] {
    const techCategories: Record<string, string[]> = {
      'flutter': ['flutter', 'ui-components', 'state-management'],
      'fastapi': ['python-fastapi', 'api-patterns'],
      'react': ['ui-components', 'state-management'],
      'typescript': ['api-patterns', 'validation'],
      'python': ['python-fastapi', 'database']
    };

    const categories = techCategories[tech.toLowerCase()] || [];
    let results: Skill[] = [];

    for (const category of categories) {
      results = results.concat(this.getByCategory(category));
    }

    return results;
  }

  /**
   * Get skills suitable for a layer
   */
  static getByLayer(layer: string): Skill[] {
    const layerMap: Record<string, string[]> = {
      'ui': ['flutter', 'ui-components', 'forms', 'state-management'],
      'service': ['api-patterns', 'authentication', 'error-handling'],
      'model': ['database', 'validation'],
      'infra': ['database', 'error-handling']
    };

    const categories = layerMap[layer] || [];
    let results: Skill[] = [];

    for (const category of categories) {
      results = results.concat(this.getByCategory(category));
    }

    return results;
  }

  /**
   * Format skill for display
   */
  static formatSkill(skill: Skill): string {
    return `
📄 ${skill.name}
   Category: ${skill.category}
   Scope: ${skill.scope || 'N/A'}
   Difficulty: ${skill.difficulty || 'N/A'}
   Effectiveness: ${skill.effectiveness || 'N/A'}
   File: ${skill.file}
`;
  }

  /**
   * CLI search interface
   */
  static searchCLI(args: string[]): void {
    const options: SearchOptions = {};
    
    // Parse CLI arguments
    for (let i = 0; i < args.length; i++) {
      const arg = args[i];
      
      if (arg === '--category' || arg === '-c') {
        options.category = args[++i];
      } else if (arg === '--scope' || arg === '-s') {
        options.scope = args[++i];
      } else if (arg === '--tech' || arg === '-t') {
        options.tech = args[++i];
      } else if (arg === '--limit' || arg === '-l') {
        options.limit = parseInt(args[++i], 10);
      } else if (!arg.startsWith('--') && !options.query) {
        options.query = arg;
      }
    }

    const results = this.search(options);

    if (results.length === 0) {
      console.log('\n❌ No skills found matching your criteria.\n');
      return;
    }

    console.log(`\n🔍 Found ${results.length} skill(s):\n`);
    
    for (const skill of results) {
      console.log(this.formatSkill(skill));
    }
  }
}

// CLI entry point
if (require.main === module) {
  SkillsLibrary.searchCLI(process.argv.slice(2));
}
