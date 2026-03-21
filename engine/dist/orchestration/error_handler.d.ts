/**
 * Error Handler
 *
 * Parses errors and applies autonomous fixes.
 */
import { CommandResult } from './command_executor';
export interface ErrorAnalysis {
    type: 'missing_dependency' | 'permission_denied' | 'syntax_error' | 'timeout' | 'network' | 'unknown';
    message: string;
    fixable: boolean;
    suggestedFix?: string;
}
export interface FixResult {
    applied: boolean;
    success: boolean;
    message: string;
    newCommand?: string;
}
export declare class ErrorHandler {
    /**
     * Analyze command result for errors
     */
    static analyzeError(result: CommandResult): ErrorAnalysis;
    /**
     * Attempt to fix an error automatically
     */
    static applyFix(analysis: ErrorAnalysis, originalCommand: string, cwd?: string): Promise<FixResult>;
    /**
     * Fix missing npm dependency
     */
    private static fixMissingDependency;
    /**
     * Fix permission denied (basic attempt)
     */
    private static fixPermissionDenied;
    /**
     * Fix timeout by retrying with longer timeout
     */
    private static fixTimeout;
    /**
     * Handle command failure with analysis and fix attempt
     */
    static handleCommandFailure(result: CommandResult, maxRetries?: number): Promise<{
        fixed: boolean;
        finalResult: CommandResult;
    }>;
}
//# sourceMappingURL=error_handler.d.ts.map