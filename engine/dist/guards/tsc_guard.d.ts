import { IValidationGuard, GuardResult } from './base_guard';
export declare class TscGuard implements IValidationGuard {
    name: string;
    description: string;
    run(ticketId: string): Promise<GuardResult>;
}
//# sourceMappingURL=tsc_guard.d.ts.map