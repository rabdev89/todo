import { IValidationGuard, GuardResult } from './base_guard';
import { FileGuard } from '../file_guard';

export class FileScopeGuard implements IValidationGuard {
    name = 'File Scope Integrity';
    description = 'Prevents modifications outside the declared ticket scope';

    async run(ticketId: string): Promise<GuardResult> {
        const result = await FileGuard.checkTicketScope(ticketId);
        
        const maxScore = 20;
        let score = maxScore;

        if (!result.allowed) {
            // Deduct points based on violations
            const penalty = Math.min(maxScore, result.violations.length * 5);
            score -= penalty;
        }

        return {
            passed: result.allowed,
            score,
            maxScore,
            output: FileGuard.formatViolations(result),
            details: result
        };
    }
}
