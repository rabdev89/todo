import { IValidationGuard, GuardResult } from './base_guard';
export declare class SecurityGuard implements IValidationGuard {
    name: string;
    description: string;
    run(ticketId: string): Promise<GuardResult>;
    private execGit;
}
//# sourceMappingURL=security_guard.d.ts.map