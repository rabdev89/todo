export interface HealthCheckResult {
    valid: boolean;
    errors: string[];
    warnings: string[];
}
/**
 * Validates the core framework status and current ticket metadata.
 * This is a pre-flight check to prevent engine crashes.
 */
export declare function validateSystemState(): Promise<HealthCheckResult>;
//# sourceMappingURL=health_check.d.ts.map