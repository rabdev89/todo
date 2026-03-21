export interface GuardResult {
    passed: boolean;
    score: number;
    maxScore: number;
    output: string;
    details?: any;
}

export interface IValidationGuard {
    name: string;
    description: string;
    run(ticketId: string): Promise<GuardResult>;
}
