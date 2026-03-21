/**
 * Validates registry ID format
 * @param registryId - Expected format: "org/repo"
 * @throws Error if format is invalid or contains unsafe characters
 */
export declare function validateRegistryId(registryId: string): void;
/**
 * Validates skill name according to Agent Skills specification
 * @param skillName - Must be lowercase, alphanumeric with hyphens
 * @throws Error if name doesn't meet requirements
 */
export declare function validateSkillName(skillName: string): void;
/**
 * Extract skill description from SKILL.md frontmatter
 * @param content - Content of SKILL.md file
 * @returns Description from frontmatter or first non-empty paragraph
 */
export declare function extractSkillDescription(content: string): string;
