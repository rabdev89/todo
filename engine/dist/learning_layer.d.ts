/**
 * Learning Layer - Telemetry capture and analytics for AI development
 *
 * Tech-agnostic: Works with any project type
 * Captures structured data from ticket execution to improve the system
 */
export interface TicketExecutionRecord {
    ticketId: string;
    epicId?: string;
    title: string;
    ticketType: string;
    layer?: string;
    phasesExecuted: string[];
    filesModified: string[];
    filesCreated: string[];
    startedAt?: string;
    completedAt?: string;
    durationMinutes?: number;
    attempts: number;
    testPassRate: number;
    lintErrors: number;
    validationPassed: boolean;
    status: 'completed' | 'failed' | 'cancelled';
    circuitBreakerTriggered?: boolean;
    dependenciesCount: number;
    allowedFilesCount: number;
}
export interface LearningMetrics {
    totalTickets: number;
    completedTickets: number;
    failedTickets: number;
    averageDurationMinutes: number;
    averageAttempts: number;
    fileChangeFrequency: Map<string, number>;
    phaseFailureRates: Map<string, number>;
    layerDistribution: Map<string, number>;
    highComplexityTickets: string[];
}
export interface ArchitectureSignal {
    type: 'coupling' | 'volatility' | 'complexity';
    description: string;
    affectedFiles: string[];
    recommendation: string;
    confidence: number;
}
export declare class LearningLayer {
    private dataDir;
    private historyPath;
    private metricsPath;
    private signalsPath;
    constructor(dataDir?: string);
    private ensureDataDir;
    /**
     * Record ticket execution result
     */
    recordTicketExecution(record: TicketExecutionRecord): Promise<void>;
    /**
     * Load ticket history
     */
    loadHistory(): TicketExecutionRecord[];
    private saveHistory;
    /**
     * Calculate aggregate metrics from history
     */
    calculateMetrics(history?: TicketExecutionRecord[]): LearningMetrics;
    private recalculateMetrics;
    /**
     * Detect architecture signals from history
     */
    detectSignals(history?: TicketExecutionRecord[]): ArchitectureSignal[];
    private saveSignals;
    /**
     * Generate insights for ai_lessons.md
     */
    generateInsights(): string;
    /**
     * Get ticket recommendation based on patterns
     */
    getTicketRecommendation(ticketId: string): string | null;
    /**
     * Export data for external analysis
     */
    exportData(): {
        history: TicketExecutionRecord[];
        metrics: LearningMetrics;
        signals: ArchitectureSignal[];
    };
}
//# sourceMappingURL=learning_layer.d.ts.map