import path from 'path';
import { StateManager } from './state_manager';
import { IValidationGuard, GuardResult as IGuardResult } from './guards/base_guard';
import { TscGuard } from './guards/tsc_guard';
import { LintGuard } from './guards/lint_guard';
import { CodeQualityGuard } from './guards/code_quality_guard';
import { TestGuard } from './guards/test_guard';
import { SecurityGuard } from './guards/security_guard';
import { DocumentationGuard } from './guards/documentation_guard';
import { ArchitectureConsistencyGuard } from './guards/architecture_consistency_guard';
import { FileScopeGuard } from './guards/file_scope_guard';

import { BobConfig } from './shared/config';

const config = BobConfig.getInstance();
const PROJECT_ROOT = config.getRootDir();

export interface ValidationResult {
    passed: boolean;
    score: number;
    maxScore: number;
    output: string;
    circuitBreakerTriggered: boolean;
}

export class ValidationRunner {
    private static guards: IValidationGuard[] = [
        new TscGuard(),
        new LintGuard(),
        new CodeQualityGuard(),
        new TestGuard(),
        new SecurityGuard(),
        new DocumentationGuard(),
        new ArchitectureConsistencyGuard(),
        new FileScopeGuard()
    ];

    /**
     * Executes the unified validation bridge
     * 
     * @param ticketId The ticket number (e.g., T-123)
     */
    static async runVerification(ticketId: string): Promise<ValidationResult> {
        try {
            const metadata = await StateManager.getMetadata(ticketId);
            let totalScore = 0;
            let totalMaxScore = 0;
            let combinedOutput = '';
            let circuitBreakerTriggered = false;

            combinedOutput += `\n════════════════════════════════════════════════════\n`;
            combinedOutput += `  UNIFIED VALIDATION BRIDGE — Ticket ${ticketId}\n`;
            combinedOutput += `  ${new Date().toISOString().replace('T', ' ').split('.')[0]}\n`;
            combinedOutput += `════════════════════════════════════════════════════\n\n`;

            for (const guard of this.guards) {
                const result = await guard.run(ticketId);
                totalScore += result.score;
                totalMaxScore += result.maxScore;
                
                const indicator = result.passed ? '✓' : (result.score > 0 ? '⚠' : '✗');
                combinedOutput += `${indicator} ${guard.name} (${result.score} / ${result.maxScore} pts)\n`;
                if (result.output) {
                    combinedOutput += `  ${result.output.replace(/\n/g, '\n  ')}\n\n`;
                }
            }

            const threshold = 56; // Layer 1 Threshold
            const passed = totalScore >= threshold;

            combinedOutput += `════════════════════════════════════════════════════\n`;
            combinedOutput += `  FINAL SCORE: ${totalScore} / ${totalMaxScore}\n`;
            combinedOutput += `  THRESHOLD:   ${threshold} / ${totalMaxScore} (80% — Layer 1 Ticket)\n`;
            combinedOutput += `════════════════════════════════════════════════════\n\n`;

            if (passed) {
                combinedOutput += `  ✓ GATE PASSED\n`;
                await StateManager.updateMetadata(ticketId, { failure_count: 0 });
            } else {
                combinedOutput += `  ✗ GATE FAILED\n`;
                const failures = (metadata.failure_count || 0) + 1;
                if (failures >= 3) {
                    circuitBreakerTriggered = true;
                    combinedOutput += `\n[CIRCUIT BREAKER ACTIVATED] AI failed ${failures} times continuously.`;
                }
                await StateManager.updateMetadata(ticketId, { failure_count: failures });
            }

            return {
                passed,
                score: totalScore,
                maxScore: totalMaxScore,
                output: combinedOutput,
                circuitBreakerTriggered
            };
        } catch (error) {
            return {
                passed: false,
                score: 0,
                maxScore: 70,
                output: `Internal error in validation runner: ${(error as any).message}`,
                circuitBreakerTriggered: false
            };
        }
    }
}
