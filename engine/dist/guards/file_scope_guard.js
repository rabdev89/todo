"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileScopeGuard = void 0;
const file_guard_1 = require("../file_guard");
class FileScopeGuard {
    name = 'File Scope Integrity';
    description = 'Prevents modifications outside the declared ticket scope';
    async run(ticketId) {
        const result = await file_guard_1.FileGuard.checkTicketScope(ticketId);
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
            output: file_guard_1.FileGuard.formatViolations(result),
            details: result
        };
    }
}
exports.FileScopeGuard = FileScopeGuard;
