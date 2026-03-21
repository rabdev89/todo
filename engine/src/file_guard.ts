import { spawn } from 'child_process';
import { glob, globSync } from 'glob';
import path from 'path';
import { StateManager } from './state_manager';
import { BobConfig } from './shared/config';

const config = BobConfig.getInstance();

/**
 * File Guard - Enforces file scope restrictions for tickets
 * 
 * Tech-agnostic: Works with any project type
 * Prevents AI from modifying files outside declared ticket scope
 */

export interface FileScopeConfig {
    allowed: string[];      // Glob patterns for allowed files
    excluded: string[];     // Glob patterns to exclude (overrides allowed)
    require_explicit_scope: boolean; // If true, tickets without scope are blocked
}

export interface FileChange {
    path: string;
    change_type: 'added' | 'modified' | 'deleted' | 'renamed';
}

export interface GuardResult {
    allowed: boolean;
    violations: FileViolation[];
    checked_files: number;
}

export interface FileViolation {
    file: string;
    change_type: string;
    reason: string;
}

export class FileGuard {
    private static config: FileScopeConfig = {
        allowed: [],
        excluded: [],
        require_explicit_scope: false
    };

    /**
     * Load file guard configuration
     */
    static loadConfig(configPath?: string): FileScopeConfig {
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
    static async checkTicketScope(
        ticketId: string, 
        baseRef: string = 'HEAD'
    ): Promise<GuardResult> {
        const ticket = await StateManager.getMetadata(ticketId);
        const fileScope = ticket.file_scope || { allowed: [], excluded: [] };
        
        // Get changed files from git
        const changes = await this.getGitChanges(baseRef);
        
        const violations: FileViolation[] = [];
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
            const isAllowed = this.isFileAllowed(
                change.path, 
                allowedPatterns, 
                excludedPatterns
            );

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
    static async previewScope(ticketId: string): Promise<string[]> {
        const ticket = await StateManager.getMetadata(ticketId);
        const fileScope = ticket.file_scope || { allowed: [], excluded: [] };
        
        if (!fileScope.allowed || fileScope.allowed.length === 0) {
            return [];
        }

        const allowedFiles: string[] = [];
        
        for (const pattern of fileScope.allowed) {
            const matches = globSync(pattern, { 
                cwd: config.getRootDir(),
                dot: true 
            });
            allowedFiles.push(...matches);
        }

        // Apply exclusions
        const filtered: string[] = [];
        for (const file of allowedFiles) {
            let excluded = false;
            for (const excludePattern of fileScope.excluded || []) {
                const excludeMatches = globSync(excludePattern, { cwd: config.getRootDir() });
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
    static validateScopePatterns(patterns: string[]): { valid: boolean; errors: string[] } {
        const errors: string[] = [];

        for (const pattern of patterns) {
            try {
                // Test if glob pattern is valid by attempting compilation
                globSync(pattern, { cwd: config.getRootDir() });
            } catch (error) {
                errors.push(`Invalid glob pattern: ${pattern}`);
            }
        }

        return { valid: errors.length === 0, errors };
    }

    /**
     * Check if a single file matches allowed patterns and doesn't match excluded
     */
    private static isFileAllowed(
        filePath: string,
        allowedPatterns: string[],
        excludedPatterns: string[]
    ): boolean {
        // Check against excluded patterns first
        for (const excludePattern of excludedPatterns) {
            const matches = globSync(excludePattern, { cwd: config.getRootDir() });
            const absoluteMatches = matches.map((m: string) => path.resolve(m));
            if (absoluteMatches.includes(path.resolve(filePath))) {
                return false;
            }
        }

        // Check against allowed patterns
        for (const allowPattern of allowedPatterns) {
            const matches = globSync(allowPattern, { cwd: config.getRootDir() });
            const absoluteMatches = matches.map((m: string) => path.resolve(m));
            if (absoluteMatches.includes(path.resolve(filePath))) {
                return true;
            }
        }

        return false;
    }

    /**
     * Get list of changed files from git
     */
    private static async getGitChanges(baseRef: string = 'HEAD'): Promise<FileChange[]> {
        return new Promise((resolve, reject) => {
            const changes: FileChange[] = [];
            
            // Get diff against base ref or HEAD
            const args = baseRef === 'HEAD' 
                ? ['diff', '--name-status', 'HEAD']
                : ['diff', '--name-status', baseRef];

            const child = spawn('git', args, {
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
                    if (!line.trim()) continue;
                    
                    const parts = line.split('\t');
                    const status = parts[0];
                    const filePath = parts[1];

                    let changeType: FileChange['change_type'] = 'modified';
                    
                    if (status.startsWith('A')) changeType = 'added';
                    else if (status.startsWith('D')) changeType = 'deleted';
                    else if (status.startsWith('M')) changeType = 'modified';
                    else if (status.startsWith('R')) changeType = 'renamed';

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
    static formatViolations(result: GuardResult): string {
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
