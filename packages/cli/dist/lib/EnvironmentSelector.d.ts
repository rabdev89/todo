import { EnvironmentCode } from "../types";
export declare class EnvironmentSelector {
    selectEnvironments(): Promise<EnvironmentCode[]>;
    confirmOverride(conflicts: EnvironmentCode[]): Promise<boolean>;
    displaySelectionSummary(selected: EnvironmentCode[]): void;
    selectGlobalEnvironments(): Promise<EnvironmentCode[]>;
    selectSkillEnvironments(): Promise<EnvironmentCode[]>;
}
