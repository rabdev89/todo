export declare class VerifierAgent {
    constructor();
    verifyTicket(ticketId: string, options?: {
        contractOnly?: boolean;
    }): Promise<{
        verificationPath: string;
        content: string;
    }>;
    private generateVerificationTemplate;
}
//# sourceMappingURL=verifier_agent.d.ts.map