import { IValidationGuard, GuardResult } from './base_guard';
import { ArchitectureGuard } from '../architecture_guard';
import path from 'path';

export class ArchitectureConsistencyGuard implements IValidationGuard {
    name = 'Architecture Consistency';
    description = 'Enforces layer boundaries and import rules';

    async run(ticketId: string): Promise<GuardResult> {
        const guard = new ArchitectureGuard();
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
            output: ArchitectureGuard.formatViolations(result),
            details: result
        };
    }
}
