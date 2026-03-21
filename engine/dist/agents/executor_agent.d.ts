export declare class ExecutorAgent {
    constructor();
    executeTicket(ticketId: string, options?: {
        parallel?: boolean;
    }): Promise<{
        recordPath: string;
        content: string;
    }>;
    private generateRecordTemplate;
    private extractPlanItems;
}
//# sourceMappingURL=executor_agent.d.ts.map