export type BobGateType = 'user' | 'none';
export type BobExpectation = {
    kind: 'repository-structure';
    requiredDirs: string[];
    requiredFiles: string[];
} | {
    kind: 'framework-version';
    minVersion?: string;
    maxVersion?: string;
} | {
    kind: 'diagnostics';
    mustPass: boolean;
} | {
    kind: 'health-files';
    files: string[];
} | {
    kind: 'log-signals';
    mustContain: string[];
} | {
    kind: 'artifacts';
    paths: string[];
} | {
    kind: 'custom';
    validatorName: string;
};
export interface BobActionTestCase {
    phase: string;
    activity: string;
    action: string;
    command: string;
    gate: BobGateType;
    expectedBehavior: string;
    expectations?: BobExpectation[];
    expectedLogSignals?: string[];
    expectedArtifacts?: string[];
}
export declare const BOB_ACTION_TEST_CASES: BobActionTestCase[];
export declare function runBobIntegrationSmoke(): Promise<void>;
export declare function runBobIntegrationAuto(): Promise<void>;
export declare function printBobActionTestCases(): void;
export declare function runBobForAction(action: string): Promise<import("./types").BobCommandResult>;
export declare function runValidateRepositoryStructure(): Promise<import("./types").BobCommandResult>;
export declare function runDocImplementationAlignmentForCase(test: BobActionTestCase): Promise<boolean>;
export declare function runDocImplementationAlignmentAll(): Promise<boolean>;
//# sourceMappingURL=bob_integration_tests.d.ts.map