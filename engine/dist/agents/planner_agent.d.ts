export declare class PlannerAgent {
    private contextBuilder;
    private storage;
    constructor(dataPath?: string);
    planTicket(ticketId: string): Promise<{
        blueprintPath: string;
        content: string;
    }>;
    private generateBlueprintTemplate;
    private extractRelevantFiles;
    close(): void;
}
//# sourceMappingURL=planner_agent.d.ts.map