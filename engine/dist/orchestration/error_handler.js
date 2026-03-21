"use strict";
/**
 * Error Handler
 *
 * Parses errors and applies autonomous fixes.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorHandler = void 0;
const command_executor_1 = require("./command_executor");
class ErrorHandler {
    /**
     * Analyze command result for errors
     */
    static analyzeError(result) {
        const { stderr, exitCode } = result;
        // Missing dependency errors
        if (stderr.includes('Cannot find module') || stderr.includes('Module not found')) {
            return {
                type: 'missing_dependency',
                message: 'Missing npm package',
                fixable: true,
                suggestedFix: 'Run npm install'
            };
        }
        if (stderr.includes('command not found') || stderr.includes('is not recognized')) {
            return {
                type: 'missing_dependency',
                message: 'Command not found in PATH',
                fixable: false
            };
        }
        // Permission errors
        if (stderr.includes('Permission denied') || stderr.includes('EACCES')) {
            return {
                type: 'permission_denied',
                message: 'Permission denied',
                fixable: true,
                suggestedFix: 'Check file permissions or run with sudo'
            };
        }
        // Network errors
        if (stderr.includes('ENOTFOUND') || stderr.includes('ECONNREFUSED') || stderr.includes('network')) {
            return {
                type: 'network',
                message: 'Network connectivity issue',
                fixable: false
            };
        }
        // Timeout
        if (exitCode === -1 || stderr.includes('timed out')) {
            return {
                type: 'timeout',
                message: 'Command timed out',
                fixable: true,
                suggestedFix: 'Increase timeout or check command'
            };
        }
        // Syntax errors
        if (stderr.includes('SyntaxError') || stderr.includes('Parse error')) {
            return {
                type: 'syntax_error',
                message: 'Syntax error in code',
                fixable: false
            };
        }
        return {
            type: 'unknown',
            message: stderr || 'Unknown error',
            fixable: false
        };
    }
    /**
     * Attempt to fix an error automatically
     */
    static async applyFix(analysis, originalCommand, cwd) {
        switch (analysis.type) {
            case 'missing_dependency':
                if (originalCommand.includes('npm')) {
                    return await this.fixMissingDependency(cwd);
                }
                break;
            case 'permission_denied':
                return await this.fixPermissionDenied(originalCommand, cwd);
                break;
            case 'timeout':
                return await this.fixTimeout(originalCommand, cwd);
                break;
        }
        return {
            applied: false,
            success: false,
            message: `No automatic fix available for ${analysis.type}`
        };
    }
    /**
     * Fix missing npm dependency
     */
    static async fixMissingDependency(cwd) {
        try {
            console.log('🔧 Attempting to fix missing dependency with npm install...');
            const result = await command_executor_1.CommandExecutor.executeCommand('npm install', {
                cwd,
                timeout: 120000 // 2 minutes for npm install
            });
            if (result.success) {
                return {
                    applied: true,
                    success: true,
                    message: 'Successfully installed dependencies'
                };
            }
            else {
                return {
                    applied: true,
                    success: false,
                    message: `Failed to install dependencies: ${result.stderr}`
                };
            }
        }
        catch (error) {
            return {
                applied: true,
                success: false,
                message: `Error during dependency installation: ${error.message}`
            };
        }
    }
    /**
     * Fix permission denied (basic attempt)
     */
    static async fixPermissionDenied(originalCommand, cwd) {
        // For now, just suggest manual fix
        // In a real implementation, might try chmod or sudo
        return {
            applied: false,
            success: false,
            message: 'Permission denied - manual intervention required'
        };
    }
    /**
     * Fix timeout by retrying with longer timeout
     */
    static async fixTimeout(originalCommand, cwd) {
        try {
            console.log('🔧 Retrying command with longer timeout...');
            const result = await command_executor_1.CommandExecutor.executeCommand(originalCommand, {
                cwd,
                timeout: 120000 // 2 minutes
            });
            return {
                applied: true,
                success: result.success,
                message: result.success ? 'Command succeeded with longer timeout' : 'Command still failed'
            };
        }
        catch (error) {
            return {
                applied: true,
                success: false,
                message: `Retry failed: ${error.message}`
            };
        }
    }
    /**
     * Handle command failure with analysis and fix attempt
     */
    static async handleCommandFailure(result, maxRetries = 2) {
        const analysis = this.analyzeError(result);
        console.log(`🔍 Error Analysis: ${analysis.type} - ${analysis.message}`);
        if (!analysis.fixable) {
            return { fixed: false, finalResult: result };
        }
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            console.log(`🔧 Fix attempt ${attempt}/${maxRetries}`);
            const fixResult = await this.applyFix(analysis, result.command);
            if (fixResult.success) {
                // Try the original command again
                console.log('🔄 Retrying original command...');
                const retryResult = await command_executor_1.CommandExecutor.executeCommand(result.command);
                if (retryResult.success) {
                    return { fixed: true, finalResult: retryResult };
                }
            }
            if (!fixResult.applied) {
                break; // No more fixes to try
            }
        }
        return { fixed: false, finalResult: result };
    }
}
exports.ErrorHandler = ErrorHandler;
