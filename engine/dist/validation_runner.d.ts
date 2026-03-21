export interface ValidationResult {
    passed: boolean;
    score: number;
    maxScore: number;
    output: string;
    circuitBreakerTriggered: boolean;
}
export declare class ValidationRunner {
    private static guards;
    /**
     * Executes the unified validation bridge
     *
     * @param ticketId The ticket number (e.g., T-123)
     */
    static runVerification(ticketId: string): Promise<ValidationResult>;
}
//# sourceMappingURL=validation_runner.d.ts.map