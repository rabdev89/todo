"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidationRunner = void 0;
const state_manager_1 = require("./state_manager");
const tsc_guard_1 = require("./guards/tsc_guard");
const lint_guard_1 = require("./guards/lint_guard");
const code_quality_guard_1 = require("./guards/code_quality_guard");
const test_guard_1 = require("./guards/test_guard");
const security_guard_1 = require("./guards/security_guard");
const documentation_guard_1 = require("./guards/documentation_guard");
const architecture_consistency_guard_1 = require("./guards/architecture_consistency_guard");
const file_scope_guard_1 = require("./guards/file_scope_guard");
const config_1 = require("./shared/config");
const config = config_1.BobConfig.getInstance();
const PROJECT_ROOT = config.getRootDir();
class ValidationRunner {
    static guards = [
        new tsc_guard_1.TscGuard(),
        new lint_guard_1.LintGuard(),
        new code_quality_guard_1.CodeQualityGuard(),
        new test_guard_1.TestGuard(),
        new security_guard_1.SecurityGuard(),
        new documentation_guard_1.DocumentationGuard(),
        new architecture_consistency_guard_1.ArchitectureConsistencyGuard(),
        new file_scope_guard_1.FileScopeGuard()
    ];
    /**
     * Executes the unified validation bridge
     *
     * @param ticketId The ticket number (e.g., T-123)
     */
    static async runVerification(ticketId) {
        try {
            const metadata = await state_manager_1.StateManager.getMetadata(ticketId);
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
                await state_manager_1.StateManager.updateMetadata(ticketId, { failure_count: 0 });
            }
            else {
                combinedOutput += `  ✗ GATE FAILED\n`;
                const failures = (metadata.failure_count || 0) + 1;
                if (failures >= 3) {
                    circuitBreakerTriggered = true;
                    combinedOutput += `\n[CIRCUIT BREAKER ACTIVATED] AI failed ${failures} times continuously.`;
                }
                await state_manager_1.StateManager.updateMetadata(ticketId, { failure_count: failures });
            }
            return {
                passed,
                score: totalScore,
                maxScore: totalMaxScore,
                output: combinedOutput,
                circuitBreakerTriggered
            };
        }
        catch (error) {
            return {
                passed: false,
                score: 0,
                maxScore: 70,
                output: `Internal error in validation runner: ${error.message}`,
                circuitBreakerTriggered: false
            };
        }
    }
}
exports.ValidationRunner = ValidationRunner;
