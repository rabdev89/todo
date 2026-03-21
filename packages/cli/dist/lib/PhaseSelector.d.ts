import { Phase } from '../types';
export declare class PhaseSelector {
    selectPhases(all?: boolean, phases?: string): Promise<Phase[]>;
    private promptPhaseSelection;
    private parsePhaseString;
    displaySelectionSummary(selected: Phase[]): void;
}
