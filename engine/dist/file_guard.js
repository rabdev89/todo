"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileGuard = void 0;
const child_process_1 = require("child_process");
const glob_1 = require("glob");
const path_1 = __importDefault(require("path"));
const state_manager_1 = require("./state_manager");
const config_1 = require("./shared/config");
const config = config_1.BobConfig.getInstance();
class FileGuard {
    static config = {
        allowed: [],
        excluded: [],
        require_explicit_scope: false
    };
    /**
     * Load file guard configuration
     */
    static loadConfig(configPath) {
        // Default config - can be overridden via file_guard.json
        return {
            allowed: [],
            excluded: [
                '.git/**',
                'node_modules/**',
                '.env*',
                '*.lock'
            ],
            require_explicit_scope: false
        };
    }
    /**
     * Check if file changes are within ticket scope
     */
    static async checkTicketScope(ticketId, baseRef = 'HEAD') {
        const ticket = await state_manager_1.StateManager.getMetadata(ticketId);
        const fileScope = ticket.file_scope || { allowed: [], excluded: [] };
        // Get changed files from git
        const changes = await this.getGitChanges(baseRef);
        const violations = [];
        const allowedPatterns = fileScope.allowed || [];
        const excludedPatterns = fileScope.excluded || [];
        // If explicit scope is required and none defined, block all changes
        if (this.config.require_explicit_scope && allowedPatterns.length === 0) {
            return {
                allowed: false,
                violations: changes.map(c => ({
                    file: c.path,
                    change_type: c.change_type,
                    reason: 'No file_scope defined for ticket'
                })),
                checked_files: changes.length
            };
        }
        // If no scope defined, allow all (unless require_explicit_scope)
        if (allowedPatterns.length === 0) {
            return {
                allowed: true,
                violations: [],
                checked_files: changes.length
            };
        }
        // Check each changed file against scope
        for (const change of changes) {
            const isAllowed = this.isFileAllowed(change.path, allowedPatterns, excludedPatterns);
            if (!isAllowed) {
                violations.push({
                    file: change.path,
                    change_type: change.change_type,
                    reason: `File not in ticket scope. Allowed patterns: ${allowedPatterns.join(', ')}`
                });
            }
        }
        return {
            allowed: violations.length === 0,
            violations,
            checked_files: changes.length
        };
    }
    /**
     * Preview what files a ticket would be allowed to modify
     */
    static async previewScope(ticketId) {
        const ticket = await state_manager_1.StateManager.getMetadata(ticketId);
        const fileScope = ticket.file_scope || { allowed: [], excluded: [] };
        if (!fileScope.allowed || fileScope.allowed.length === 0) {
            return [];
        }
        const allowedFiles = [];
        for (const pattern of fileScope.allowed) {
            const matches = (0, glob_1.globSync)(pattern, {
                cwd: config.getRootDir(),
                dot: true
            });
            allowedFiles.push(...matches);
        }
        // Apply exclusions
        const filtered = [];
        for (const file of allowedFiles) {
            let excluded = false;
            for (const excludePattern of fileScope.excluded || []) {
                const excludeMatches = (0, glob_1.globSync)(excludePattern, { cwd: config.getRootDir() });
                if (excludeMatches.includes(file)) {
                    excluded = true;
                    break;
                }
            }
            if (!excluded) {
                filtered.push(file);
            }
        }
        return [...new Set(filtered)]; // Remove duplicates
    }
    /**
     * Validate that file scope patterns are valid globs
     */
    static validateScopePatterns(patterns) {
        const errors = [];
        for (const pattern of patterns) {
            try {
                // Test if glob pattern is valid by attempting compilation
                (0, glob_1.globSync)(pattern, { cwd: config.getRootDir() });
            }
            catch (error) {
                errors.push(`Invalid glob pattern: ${pattern}`);
            }
        }
        return { valid: errors.length === 0, errors };
    }
    /**
     * Check if a single file matches allowed patterns and doesn't match excluded
     */
    static isFileAllowed(filePath, allowedPatterns, excludedPatterns) {
        // Check against excluded patterns first
        for (const excludePattern of excludedPatterns) {
            const matches = (0, glob_1.globSync)(excludePattern, { cwd: config.getRootDir() });
            const absoluteMatches = matches.map((m) => path_1.default.resolve(m));
            if (absoluteMatches.includes(path_1.default.resolve(filePath))) {
                return false;
            }
        }
        // Check against allowed patterns
        for (const allowPattern of allowedPatterns) {
            const matches = (0, glob_1.globSync)(allowPattern, { cwd: config.getRootDir() });
            const absoluteMatches = matches.map((m) => path_1.default.resolve(m));
            if (absoluteMatches.includes(path_1.default.resolve(filePath))) {
                return true;
            }
        }
        return false;
    }
    /**
     * Get list of changed files from git
     */
    static async getGitChanges(baseRef = 'HEAD') {
        return new Promise((resolve, reject) => {
            const changes = [];
            // Get diff against base ref or HEAD
            const args = baseRef === 'HEAD'
                ? ['diff', '--name-status', 'HEAD']
                : ['diff', '--name-status', baseRef];
            const child = (0, child_process_1.spawn)('git', args, {
                cwd: config.getRootDir(),
                shell: true
            });
            let output = '';
            child.stdout.on('data', (data) => {
                output += data.toString();
            });
            child.on('close', (code) => {
                if (code !== 0 && code !== 1) { // git diff returns 1 when there are differences
                    resolve(changes);
                    return;
                }
                const lines = output.trim().split('\n');
                for (const line of lines) {
                    if (!line.trim())
                        continue;
                    const parts = line.split('\t');
                    const status = parts[0];
                    const filePath = parts[1];
                    let changeType = 'modified';
                    if (status.startsWith('A'))
                        changeType = 'added';
                    else if (status.startsWith('D'))
                        changeType = 'deleted';
                    else if (status.startsWith('M'))
                        changeType = 'modified';
                    else if (status.startsWith('R'))
                        changeType = 'renamed';
                    changes.push({
                        path: filePath,
                        change_type: changeType
                    });
                }
                resolve(changes);
            });
            child.on('error', (err) => {
                // If git is not available, return empty (non-blocking)
                resolve([]);
            });
        });
    }
    /**
     * Format violations for display
     */
    static formatViolations(result) {
        if (result.allowed) {
            return '✓ All file changes within ticket scope';
        }
        let output = `✗ File scope violations (${result.violations.length} files):\n`;
        for (const v of result.violations) {
            output += `  - ${v.file} (${v.change_type}): ${v.reason}\n`;
        }
        return output;
    }
}
exports.FileGuard = FileGuard;
