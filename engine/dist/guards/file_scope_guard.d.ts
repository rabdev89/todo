import { IValidationGuard, GuardResult } from './base_guard';
export declare class FileScopeGuard implements IValidationGuard {
    name: string;
    description: string;
    run(ticketId: string): Promise<GuardResult>;
}
//# sourceMappingURL=file_scope_guard.d.ts.map