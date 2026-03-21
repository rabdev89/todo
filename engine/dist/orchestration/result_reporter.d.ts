/**
 * Result Reporter
 *
 * Reports execution results and advances workflow state.
 */
import { CommandResult } from './command_executor';
export interface ExecutionReport {
    stepId: string;
    phaseId: string;
    action: string;
    commands: string[];
    results: CommandResult[];
    overallSuccess: boolean;
    duration: number;
    timestamp: string;
    errors: string[];
    fixesApplied: string[];
}
export declare class ResultReporter {
    private static readonly DASHBOARD_FILE;
    /**
     * Generate execution report
     */
    static generateReport(stepId: string, phaseId: string, action: string, commands: string[], results: CommandResult[]): ExecutionReport;
    /**
     * Report results to console
     */
    static reportToConsole(report: ExecutionReport): void;
    /**
     * Update framework status with execution results
     */
    static updateFrameworkStatus(report: ExecutionReport): Promise<void>;
    /**
     * Advance workflow by running Bob
     */
    static advanceWorkflow(): Promise<boolean>;
    /**
     * Generate summary for user
     */
    static generateUserSummary(report: ExecutionReport): string;
}
//# sourceMappingURL=result_reporter.d.ts.map