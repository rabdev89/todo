/**
 * Orchestration Loop
 *
 * Main orchestration logic for Bob + IDE AI collaboration.
 */
export declare class OrchestrationLoop {
    private static readonly FRAMEWORK_DIR;
    private static readonly PHASES_FILE;
    /**
     * Main orchestration loop
     */
    static run(): Promise<{
        success: boolean;
        message: string;
        blocked: boolean;
    }>;
    /**
     * Read framework status
     */
    private static readFrameworkStatus;
    /**
     * Get current step details
     */
    private static getCurrentStepDetails;
    /**
     * Execute commands with error handling
     */
    private static executeCommands;
}
//# sourceMappingURL=orchestration_loop.d.ts.map