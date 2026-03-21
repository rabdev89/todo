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
exports.SkillsLibrary = void 0;
const fs = __importStar(require("fs-extra"));
const path = __importStar(require("path"));
const glob_1 = require("glob");
class SkillsLibrary {
    static LIBRARY_PATH = 'skills-library';
    /**
     * Search skills by keyword
     */
    static search(options) {
        const { query, category, scope, tech, limit = 10 } = options;
        // Get all skill files
        const skillFiles = (0, glob_1.globSync)(`${this.LIBRARY_PATH}/**/*.md`, { ignore: ['**/README.md', '**/AVAILABLE_SKILLS.md', '**/TEMPLATE.md'] });
        let results = [];
        for (const file of skillFiles) {
            const content = fs.readFileSync(file, 'utf8');
            const skill = this.parseSkill(file, content);
            if (!skill)
                continue;
            // Apply filters
            if (category && skill.category !== category)
                continue;
            if (scope && skill.scope !== scope)
                continue;
            if (tech && !content.toLowerCase().includes(tech.toLowerCase()))
                continue;
            // Search by query
            if (query) {
                const queryLower = query.toLowerCase();
                const searchableText = `${skill.name} ${skill.category} ${content}`.toLowerCase();
                if (!searchableText.includes(queryLower))
                    continue;
                // Calculate relevance score
                skill['_relevance'] = this.calculateRelevance(queryLower, searchableText);
            }
            results.push(skill);
        }
        // Sort by relevance if query provided
        if (query) {
            results.sort((a, b) => b._relevance - a._relevance);
        }
        return results.slice(0, limit);
    }
    /**
     * Get skills by category
     */
    static getByCategory(category) {
        return this.search({ category, limit: 100 });
    }
    /**
     * Get all available categories
     */
    static getCategories() {
        const categories = (0, glob_1.globSync)(`${this.LIBRARY_PATH}/*/`, {
            ignore: ['**/node_modules/**']
        });
        return categories
            .map(cat => path.basename(cat))
            .filter(cat => !['README.md', 'AVAILABLE_SKILLS.md'].includes(cat));
    }
    /**
     * Get skill by exact name
     */
    static getSkill(name) {
        const results = this.search({ query: name, limit: 1 });
        return results[0] || null;
    }
    /**
     * Parse skill metadata from markdown file
     */
    static parseSkill(filePath, content) {
        const filename = path.basename(filePath, '.md');
        const category = path.basename(path.dirname(filePath));
        // Extract metadata from frontmatter
        const metadataMatch = content.match(/## Metadata\n([\s\S]*?)(?=\n##|$)/);
        let scope;
        let difficulty;
        let effectiveness;
        if (metadataMatch) {
            const metadata = metadataMatch[1];
            const scopeMatch = metadata.match(/\*\*Scope\*\*:\s*(.+)/);
            if (scopeMatch)
                scope = scopeMatch[1].trim();
            const difficultyMatch = metadata.match(/\*\*Difficulty\*\*:\s*(.+)/);
            if (difficultyMatch)
                difficulty = difficultyMatch[1].trim();
            const effectivenessMatch = metadata.match(/\*\*Effectiveness\*\*:\s*(.+)/);
            if (effectivenessMatch)
                effectiveness = effectivenessMatch[1].trim();
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
    static calculateRelevance(query, text) {
        let score = 0;
        // Title match (highest weight)
        if (text.includes(`skill: ${query}`))
            score += 10;
        if (text.includes(query))
            score += 5;
        // Category match
        if (text.includes(`category: ${query}`))
            score += 3;
        // Multiple occurrences
        const occurrences = (text.match(new RegExp(query, 'g')) || []).length;
        score += Math.min(occurrences, 5);
        return score;
    }
    /**
     * Get skills for a specific tech stack
     */
    static getByTech(tech) {
        const techCategories = {
            'flutter': ['flutter', 'ui-components', 'state-management'],
            'fastapi': ['python-fastapi', 'api-patterns'],
            'react': ['ui-components', 'state-management'],
            'typescript': ['api-patterns', 'validation'],
            'python': ['python-fastapi', 'database']
        };
        const categories = techCategories[tech.toLowerCase()] || [];
        let results = [];
        for (const category of categories) {
            results = results.concat(this.getByCategory(category));
        }
        return results;
    }
    /**
     * Get skills suitable for a layer
     */
    static getByLayer(layer) {
        const layerMap = {
            'ui': ['flutter', 'ui-components', 'forms', 'state-management'],
            'service': ['api-patterns', 'authentication', 'error-handling'],
            'model': ['database', 'validation'],
            'infra': ['database', 'error-handling']
        };
        const categories = layerMap[layer] || [];
        let results = [];
        for (const category of categories) {
            results = results.concat(this.getByCategory(category));
        }
        return results;
    }
    /**
     * Format skill for display
     */
    static formatSkill(skill) {
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
    static searchCLI(args) {
        const options = {};
        // Parse CLI arguments
        for (let i = 0; i < args.length; i++) {
            const arg = args[i];
            if (arg === '--category' || arg === '-c') {
                options.category = args[++i];
            }
            else if (arg === '--scope' || arg === '-s') {
                options.scope = args[++i];
            }
            else if (arg === '--tech' || arg === '-t') {
                options.tech = args[++i];
            }
            else if (arg === '--limit' || arg === '-l') {
                options.limit = parseInt(args[++i], 10);
            }
            else if (!arg.startsWith('--') && !options.query) {
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
exports.SkillsLibrary = SkillsLibrary;
// CLI entry point
if (require.main === module) {
    SkillsLibrary.searchCLI(process.argv.slice(2));
}
