import * as fs from 'fs';
import * as path from 'path';
import { StateManager, TicketMetadata } from './state_manager';

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
    
    // Execution metrics
    phasesExecuted: string[];
    filesModified: string[];
    filesCreated: string[];
    
    // Timing
    startedAt?: string;
    completedAt?: string;
    durationMinutes?: number;
    
    // Quality metrics
    attempts: number;
    testPassRate: number;
    lintErrors: number;
    validationPassed: boolean;
    
    // Outcome
    status: 'completed' | 'failed' | 'cancelled';
    circuitBreakerTriggered?: boolean;
    
    // Context
    dependenciesCount: number;
    allowedFilesCount: number;
}

export interface LearningMetrics {
    totalTickets: number;
    completedTickets: number;
    failedTickets: number;
    averageDurationMinutes: number;
    averageAttempts: number;
    
    // File volatility
    fileChangeFrequency: Map<string, number>;
    
    // Phase metrics
    phaseFailureRates: Map<string, number>;
    
    // Layer metrics
    layerDistribution: Map<string, number>;
    
    // Complexity signals
    highComplexityTickets: string[]; // Tickets with >5 files or >3 attempts
}

export interface ArchitectureSignal {
    type: 'coupling' | 'volatility' | 'complexity';
    description: string;
    affectedFiles: string[];
    recommendation: string;
    confidence: number; // 0-1
}

export class LearningLayer {
    private dataDir: string;
    private historyPath: string;
    private metricsPath: string;
    private signalsPath: string;

    constructor(dataDir: string = '.engine/learning') {
        this.dataDir = path.resolve(process.cwd(), dataDir);
        this.historyPath = path.join(this.dataDir, 'ticket_history.json');
        this.metricsPath = path.join(this.dataDir, 'metrics.json');
        this.signalsPath = path.join(this.dataDir, 'signals.json');
        
        this.ensureDataDir();
    }

    private ensureDataDir(): void {
        if (!fs.existsSync(this.dataDir)) {
            fs.mkdirSync(this.dataDir, { recursive: true });
        }
    }

    /**
     * Record ticket execution result
     */
    async recordTicketExecution(record: TicketExecutionRecord): Promise<void> {
        const history = this.loadHistory();
        
        // Check if ticket already recorded (update if so)
        const existingIndex = history.findIndex(h => h.ticketId === record.ticketId);
        if (existingIndex >= 0) {
            history[existingIndex] = record;
        } else {
            history.push(record);
        }
        
        this.saveHistory(history);
        
        // Recalculate metrics after new record
        await this.recalculateMetrics();
        
        // Detect architecture signals
        const signals = this.detectSignals(history);
        this.saveSignals(signals);
    }

    /**
     * Load ticket history
     */
    loadHistory(): TicketExecutionRecord[] {
        if (!fs.existsSync(this.historyPath)) {
            return [];
        }
        
        try {
            const data = fs.readFileSync(this.historyPath, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            console.warn('Failed to load ticket history:', error);
            return [];
        }
    }

    private saveHistory(history: TicketExecutionRecord[]): void {
        fs.writeFileSync(this.historyPath, JSON.stringify(history, null, 2), 'utf8');
    }

    /**
     * Calculate aggregate metrics from history
     */
    calculateMetrics(history?: TicketExecutionRecord[]): LearningMetrics {
        const records = history || this.loadHistory();
        
        if (records.length === 0) {
            return {
                totalTickets: 0,
                completedTickets: 0,
                failedTickets: 0,
                averageDurationMinutes: 0,
                averageAttempts: 0,
                fileChangeFrequency: new Map(),
                phaseFailureRates: new Map(),
                layerDistribution: new Map(),
                highComplexityTickets: []
            };
        }

        // Basic counts
        const completedTickets = records.filter(r => r.status === 'completed');
        const failedTickets = records.filter(r => r.status === 'failed');
        
        // Duration calculation
        const durations = records
            .filter(r => r.durationMinutes)
            .map(r => r.durationMinutes!);
        const avgDuration = durations.length > 0 
            ? durations.reduce((a, b) => a + b, 0) / durations.length 
            : 0;
        
        // Attempts calculation
        const avgAttempts = records.reduce((sum, r) => sum + r.attempts, 0) / records.length;

        // File volatility
        const fileChangeFreq = new Map<string, number>();
        for (const record of records) {
            for (const file of record.filesModified) {
                fileChangeFreq.set(file, (fileChangeFreq.get(file) || 0) + 1);
            }
        }

        // Phase failure rates
        const phaseFailures = new Map<string, { total: number; failed: number }>();
        for (const record of records) {
            for (const phase of record.phasesExecuted) {
                const current = phaseFailures.get(phase) || { total: 0, failed: 0 };
                current.total++;
                if (record.status === 'failed') {
                    current.failed++;
                }
                phaseFailures.set(phase, current);
            }
        }
        
        const phaseFailureRates = new Map<string, number>();
        for (const [phase, stats] of phaseFailures) {
            phaseFailureRates.set(phase, stats.failed / stats.total);
        }

        // Layer distribution
        const layerDist = new Map<string, number>();
        for (const record of records) {
            if (record.layer) {
                layerDist.set(record.layer, (layerDist.get(record.layer) || 0) + 1);
            }
        }

        // High complexity tickets
        const highComplexity = records
            .filter(r => r.filesModified.length > 5 || r.attempts > 3)
            .map(r => r.ticketId);

        return {
            totalTickets: records.length,
            completedTickets: completedTickets.length,
            failedTickets: failedTickets.length,
            averageDurationMinutes: Math.round(avgDuration),
            averageAttempts: Math.round(avgAttempts * 10) / 10,
            fileChangeFrequency: fileChangeFreq,
            phaseFailureRates,
            layerDistribution: layerDist,
            highComplexityTickets: [...new Set(highComplexity)]
        };
    }

    private async recalculateMetrics(): Promise<void> {
        const history = this.loadHistory();
        const metrics = this.calculateMetrics(history);
        
        // Convert Maps to plain objects for JSON serialization
        const serialized = {
            ...metrics,
            fileChangeFrequency: Object.fromEntries(metrics.fileChangeFrequency),
            phaseFailureRates: Object.fromEntries(metrics.phaseFailureRates),
            layerDistribution: Object.fromEntries(metrics.layerDistribution)
        };
        
        fs.writeFileSync(this.metricsPath, JSON.stringify(serialized, null, 2), 'utf8');
    }

    /**
     * Detect architecture signals from history
     */
    detectSignals(history?: TicketExecutionRecord[]): ArchitectureSignal[] {
        const records = history || this.loadHistory();
        const signals: ArchitectureSignal[] = [];

        if (records.length < 5) return signals; // Need minimum data

        // Signal 1: File volatility (files changed in >20% of tickets)
        const fileFreq = new Map<string, number>();
        for (const record of records) {
            for (const file of record.filesModified) {
                fileFreq.set(file, (fileFreq.get(file) || 0) + 1);
            }
        }
        
        const threshold = records.length * 0.2;
        const volatileFiles: string[] = [];
        for (const [file, count] of fileFreq) {
            if (count > threshold) {
                volatileFiles.push(file);
            }
        }
        
        if (volatileFiles.length > 0) {
            signals.push({
                type: 'volatility',
                description: `Files modified in >20% of tickets`,
                affectedFiles: volatileFiles,
                recommendation: 'Consider extracting shared logic or splitting responsibilities',
                confidence: Math.min(volatileFiles.length / 5, 1)
            });
        }

        // Signal 2: Co-change detection (files that change together)
        const coChangePairs = new Map<string, number>();
        for (const record of records) {
            const files = record.filesModified;
            for (let i = 0; i < files.length; i++) {
                for (let j = i + 1; j < files.length; j++) {
                    const pair = [files[i], files[j]].sort().join('::');
                    coChangePairs.set(pair, (coChangePairs.get(pair) || 0) + 1);
                }
            }
        }
        
        const tightCoupling: string[] = [];
        for (const [pair, count] of coChangePairs) {
            if (count > 3) {
                const [file1, file2] = pair.split('::');
                tightCoupling.push(`${file1} <-> ${file2}`);
            }
        }
        
        if (tightCoupling.length > 0) {
            signals.push({
                type: 'coupling',
                description: 'Files frequently change together (tight coupling)',
                affectedFiles: tightCoupling,
                recommendation: 'Consider merging into single module or extracting shared abstraction',
                confidence: Math.min(tightCoupling.length / 5, 1)
            });
        }

        // Signal 3: Complexity concentration
        const complexTickets = records.filter(r => 
            r.filesModified.length > 5 || r.attempts > 2
        );
        
        if (complexTickets.length > records.length * 0.3) {
            signals.push({
                type: 'complexity',
                description: `High complexity tickets: ${complexTickets.length}/${records.length}`,
                affectedFiles: complexTickets.flatMap(t => t.filesModified),
                recommendation: 'Review ticket scoping - consider smaller, more focused tickets',
                confidence: complexTickets.length / records.length
            });
        }

        return signals;
    }

    private saveSignals(signals: ArchitectureSignal[]): void {
        fs.writeFileSync(this.signalsPath, JSON.stringify(signals, null, 2), 'utf8');
    }

    /**
     * Generate insights for ai_lessons.md
     */
    generateInsights(): string {
        const metrics = this.calculateMetrics();
        const signals = this.detectSignals();
        
        let insights = `# AI Development Insights\n\n`;
        insights += `*Generated: ${new Date().toISOString()}*\n\n`;
        
        // Metrics summary
        insights += `## Metrics Summary\n\n`;
        insights += `- **Total Tickets**: ${metrics.totalTickets}\n`;
        insights += `- **Success Rate**: ${Math.round((metrics.completedTickets / metrics.totalTickets) * 100)}%\n`;
        insights += `- **Average Duration**: ${metrics.averageDurationMinutes} minutes\n`;
        insights += `- **Average Attempts**: ${metrics.averageAttempts}\n\n`;
        
        // High volatility files
        const sortedFiles = [...metrics.fileChangeFrequency.entries()]
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);
        
        if (sortedFiles.length > 0) {
            insights += `## High Volatility Files\n\n`;
            for (const [file, count] of sortedFiles) {
                insights += `- \`${file}\`: ${count} modifications\n`;
            }
            insights += '\n';
        }

        // Architecture signals
        if (signals.length > 0) {
            insights += `## Architecture Signals\n\n`;
            for (const signal of signals) {
                insights += `### ${signal.type.toUpperCase()} (${Math.round(signal.confidence * 100)}% confidence)\n\n`;
                insights += `${signal.description}\n\n`;
                insights += `**Recommendation**: ${signal.recommendation}\n\n`;
                if (signal.affectedFiles.length > 0) {
                    insights += `**Affected**: ${signal.affectedFiles.slice(0, 3).join(', ')}${signal.affectedFiles.length > 3 ? '...' : ''}\n\n`;
                }
            }
        }

        // Recommendations
        if (metrics.averageAttempts > 2) {
            insights += `## Recommendations\n\n`;
            insights += `1. **High retry rate detected** (${metrics.averageAttempts} avg attempts)\n`;
            insights += `   - Consider adding more detailed requirements\n`;
            insights += `   - Implement stricter pre-validation\n\n`;
        }

        if (metrics.highComplexityTickets.length > metrics.totalTickets * 0.2) {
            insights += `2. **Large tickets detected** (${metrics.highComplexityTickets.length} tickets with >5 files)\n`;
            insights += `   - Recommended max: 4 files per ticket\n`;
            insights += `   - Split large features into smaller increments\n\n`;
        }

        return insights;
    }

    /**
     * Get ticket recommendation based on patterns
     */
    getTicketRecommendation(ticketId: string): string | null {
        const history = this.loadHistory();
        const metrics = this.calculateMetrics(history);
        
        // Find similar tickets by layer/type
        const ticket = history.find(h => h.ticketId === ticketId);
        if (!ticket) return null;
        
        const similar = history.filter(h => 
            h.ticketId !== ticketId && 
            h.layer === ticket.layer &&
            h.ticketType === ticket.ticketType
        );
        
        if (similar.length === 0) return null;
        
        const avgFiles = similar.reduce((sum, h) => sum + h.filesModified.length, 0) / similar.length;
        const avgDuration = similar.reduce((sum, h) => sum + (h.durationMinutes || 0), 0) / similar.length;
        
        if (ticket.filesModified.length > avgFiles * 1.5) {
            return `Similar tickets average ${Math.round(avgFiles)} files. This ticket has ${ticket.filesModified.length} files. Consider splitting.`;
        }
        
        return null;
    }

    /**
     * Export data for external analysis
     */
    exportData(): {
        history: TicketExecutionRecord[];
        metrics: LearningMetrics;
        signals: ArchitectureSignal[];
    } {
        return {
            history: this.loadHistory(),
            metrics: this.calculateMetrics(),
            signals: this.detectSignals()
        };
    }
}
