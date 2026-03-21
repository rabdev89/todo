"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRegistryId = validateRegistryId;
exports.validateSkillName = validateSkillName;
exports.extractSkillDescription = extractSkillDescription;
const gray_matter_1 = __importDefault(require("gray-matter"));
/**
 * Validates registry ID format
 * @param registryId - Expected format: "org/repo"
 * @throws Error if format is invalid or contains unsafe characters
 */
function validateRegistryId(registryId) {
    if (!/^[a-zA-Z0-9_-]+\/[a-zA-Z0-9_-]+$/.test(registryId)) {
        throw new Error(`Invalid registry ID format: "${registryId}". Expected format: "org/repo"`);
    }
    if (registryId.includes('..') || registryId.includes('~')) {
        throw new Error('Invalid characters in registry ID');
    }
}
/**
 * Validates skill name according to Agent Skills specification
 * @param skillName - Must be lowercase, alphanumeric with hyphens
 * @throws Error if name doesn't meet requirements
 */
function validateSkillName(skillName) {
    if (!/^[a-z0-9-]+$/.test(skillName)) {
        throw new Error(`Invalid skill name: "${skillName}". Must contain only lowercase letters, numbers, and hyphens.`);
    }
    if (skillName.startsWith('-') || skillName.endsWith('-')) {
        throw new Error('Skill name cannot start or end with a hyphen.');
    }
    if (skillName.includes('--')) {
        throw new Error('Skill name cannot contain consecutive hyphens.');
    }
}
/**
 * Extract skill description from SKILL.md frontmatter
 * @param content - Content of SKILL.md file
 * @returns Description from frontmatter or first non-empty paragraph
 */
function extractSkillDescription(content) {
    try {
        const parsed = (0, gray_matter_1.default)(content);
        // Try to get description from frontmatter
        if (parsed.data && parsed.data.description) {
            return String(parsed.data.description).trim();
        }
        // Fallback: use first non-empty paragraph from content
        const lines = parsed.content
            .split('\n')
            .filter((l) => l.trim() && !l.startsWith('#'));
        return lines[0]?.trim() || 'No description available';
    }
    catch (error) {
        // If parsing fails, return fallback
        return 'No description available';
    }
}
//# sourceMappingURL=skill.js.map