import { IValidationGuard, GuardResult } from './base_guard';
export declare class LintGuard implements IValidationGuard {
    name: string;
    description: string;
    run(ticketId: string): Promise<GuardResult>;
}
//# sourceMappingURL=lint_guard.d.ts.map