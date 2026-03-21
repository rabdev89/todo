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
    _relevance?: number;
}
export interface SearchOptions {
    query?: string;
    category?: string;
    scope?: string;
    tech?: string;
    limit?: number;
}
export declare class SkillsLibrary {
    private static readonly LIBRARY_PATH;
    /**
     * Search skills by keyword
     */
    static search(options: SearchOptions): Skill[];
    /**
     * Get skills by category
     */
    static getByCategory(category: string): Skill[];
    /**
     * Get all available categories
     */
    static getCategories(): string[];
    /**
     * Get skill by exact name
     */
    static getSkill(name: string): Skill | null;
    /**
     * Parse skill metadata from markdown file
     */
    private static parseSkill;
    /**
     * Calculate relevance score for search
     */
    private static calculateRelevance;
    /**
     * Get skills for a specific tech stack
     */
    static getByTech(tech: string): Skill[];
    /**
     * Get skills suitable for a layer
     */
    static getByLayer(layer: string): Skill[];
    /**
     * Format skill for display
     */
    static formatSkill(skill: Skill): string;
    /**
     * CLI search interface
     */
    static searchCLI(args: string[]): void;
}
//# sourceMappingURL=skills_library.d.ts.map