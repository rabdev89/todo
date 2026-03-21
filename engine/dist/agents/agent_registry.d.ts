export interface AgentConfig {
    name: string;
    description: string;
    promptFile: string;
    inputFiles: string[];
    outputFile: string;
}
export declare const AGENT_REGISTRY: Record<string, AgentConfig>;
export declare function getAgentConfig(name: string): AgentConfig | undefined;
export declare function getAllAgents(): AgentConfig[];
//# sourceMappingURL=agent_registry.d.ts.map