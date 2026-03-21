export declare class DesignAgent {
    private pythonPath;
    private skillPath;
    constructor();
    generateDesignFile(ticketId: string): Promise<string>;
    private extractMockTokens;
    private extractStyleGuideTokens;
    private synthesizeDesignSpec;
    private generateFallbackDesign;
    /**
     * Generates 3 distinct design directions for the project level Design Bible.
     * Leverages ui-ux-pro-max reasoning engine.
     */
    generateProjectBibleDirections(query: string, domain?: string, flavors?: {
        name: string;
        prompt: string;
    }[]): Promise<any[]>;
}
//# sourceMappingURL=design_agent.d.ts.map