import { IValidationGuard, GuardResult } from './base_guard';
export declare class TestGuard implements IValidationGuard {
    name: string;
    description: string;
    run(ticketId: string): Promise<GuardResult>;
}
//# sourceMappingURL=test_guard.d.ts.map