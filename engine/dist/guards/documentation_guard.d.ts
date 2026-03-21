import { IValidationGuard, GuardResult } from './base_guard';
export declare class DocumentationGuard implements IValidationGuard {
    name: string;
    description: string;
    run(ticketId: string): Promise<GuardResult>;
}
//# sourceMappingURL=documentation_guard.d.ts.map