import { IValidationGuard, GuardResult } from './base_guard';
export declare class CodeQualityGuard implements IValidationGuard {
    name: string;
    description: string;
    run(ticketId: string): Promise<GuardResult>;
}
//# sourceMappingURL=code_quality_guard.d.ts.map