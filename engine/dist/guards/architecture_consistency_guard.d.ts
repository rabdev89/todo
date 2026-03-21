import { IValidationGuard, GuardResult } from './base_guard';
export declare class ArchitectureConsistencyGuard implements IValidationGuard {
    name: string;
    description: string;
    run(ticketId: string): Promise<GuardResult>;
}
//# sourceMappingURL=architecture_consistency_guard.d.ts.map