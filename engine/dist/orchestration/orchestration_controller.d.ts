/**
 * Orchestration Controller
 *
 * Main controller for the Bob + IDE AI collaborative workflow.
 */
export interface OrchestrationOptions {
    auto?: boolean;
    maxSteps?: number;
    promptForInput?: boolean;
}
export declare class OrchestrationController {
    /**
     * Run the orchestration loop
     */
    static run(options?: OrchestrationOptions): Promise<void>;
    /**
     * Handle user input requirements
     */
    private static handleUserInput;
    /**
     * Update dashboard with user input requirements
     */
    private static updateDashboardWithUserInputRequirements;
    /**
     * Generate dashboard content with user input requirements
     */
    private static generateUserInputDashboard;
    /**
     * Prompt user to continue in manual mode
     */
    private static promptContinue;
    /**
     * Run single step (for testing)
     */
    static runSingleStep(): Promise<void>;
}
//# sourceMappingURL=orchestration_controller.d.ts.map