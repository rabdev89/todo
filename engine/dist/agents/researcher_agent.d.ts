import { ContextPack } from '../repo_intelligence/context';
export declare class ResearcherAgent {
    private contextBuilder;
    private storage;
    constructor(dataPath?: string);
    researchTicket(ticketId: string): Promise<{
        context: ContextPack;
        insights: string[];
        recommendations: string[];
    }>;
    generateResearchFile(ticketId: string): Promise<string>;
    researchQuery(query: string): Promise<{
        context: any;
        insights: string[];
    }>;
    private generateInsights;
    private generateQueryInsights;
    private generateRecommendations;
    getProjectOverview(): Promise<{
        patterns: any[];
        stats: any;
        recommendations: string[];
        insights: string[];
    }>;
    close(): void;
}
//# sourceMappingURL=researcher_agent.d.ts.map