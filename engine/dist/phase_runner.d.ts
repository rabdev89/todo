export declare class PhaseRunner {
    /**
     * Executes the next logical phase for a ticket based on its current state.
     * This orchestrates the lifecycle progression.
     * @param ticketId The ticket ID
     * @param depth Recursion depth to prevent infinite loops
     */
    static advanceTicket(ticketId: string, depth?: number): Promise<void>;
}
//# sourceMappingURL=phase_runner.d.ts.map