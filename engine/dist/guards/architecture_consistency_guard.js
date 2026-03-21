"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArchitectureConsistencyGuard = void 0;
const architecture_guard_1 = require("../architecture_guard");
class ArchitectureConsistencyGuard {
    name = 'Architecture Consistency';
    description = 'Enforces layer boundaries and import rules';
    async run(ticketId) {
        const guard = new architecture_guard_1.ArchitectureGuard();
        const result = await guard.checkImports();
        const maxScore = 20;
        let score = maxScore;
        if (!result.valid) {
            // Deduct points based on number of violations
            const penalty = Math.min(maxScore, result.violations.length * 5);
            score -= penalty;
        }
        return {
            passed: result.valid,
            score,
            maxScore,
            output: architecture_guard_1.ArchitectureGuard.formatViolations(result),
            details: result
        };
    }
}
exports.ArchitectureConsistencyGuard = ArchitectureConsistencyGuard;
