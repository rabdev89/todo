/**
 * Bob Dashboard Generator
 *
 * Generates markdown dashboard showing current framework status.
 */
import type { Phase, Step, FrameworkStatus } from './types';
export interface DashboardData {
    currentPhase: Phase;
    currentStep: Step;
    phaseDescription: string;
    stepDescription: string;
    nextStep: string | null;
    nextStepName: string | null;
    userActionRequired: boolean;
    userActionDescription?: string;
    progress: {
        percentage: number;
        phasesCompleted: number;
        phasesTotal: number;
        stepsCompleted: number;
        stepsTotal: number;
    };
    recentErrors: string[];
    status: FrameworkStatus['status'];
    mode: string;
    projectType: string | null;
    projectName: string | null;
}
export declare class BobDashboardGenerator {
    /**
     * Generate dashboard data from current state
     */
    static generateData(): Promise<DashboardData>;
    /**
     * Generate markdown dashboard
     */
    static generate(): Promise<string>;
    /**
     * Render dashboard as markdown
     */
    private static renderMarkdown;
    /**
     * Render ASCII progress bar
     */
    private static renderProgressBar;
    /**
     * Get status icon
     */
    private static getStatusIcon;
    /**
     * Generate console output (for CLI display)
     */
    static generateConsoleOutput(): Promise<string>;
}
//# sourceMappingURL=dashboard_generator.d.ts.map