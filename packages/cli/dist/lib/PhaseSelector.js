"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PhaseSelector = void 0;
const inquirer_1 = __importDefault(require("inquirer"));
const types_1 = require("../types");
class PhaseSelector {
    async selectPhases(all, phases) {
        let selectedPhases = [];
        if (all) {
            selectedPhases = [...types_1.AVAILABLE_PHASES];
        }
        else if (phases) {
            selectedPhases = this.parsePhaseString(phases);
        }
        else {
            selectedPhases = await this.promptPhaseSelection();
        }
        if (selectedPhases.length === 0) {
            console.log('No phases selected.');
            return [];
        }
        return selectedPhases;
    }
    async promptPhaseSelection() {
        const answers = await inquirer_1.default.prompt([
            {
                type: 'checkbox',
                name: 'phases',
                message: 'Which phases do you want to initialize? (or use --all flag)',
                choices: types_1.AVAILABLE_PHASES.map(phase => ({
                    name: types_1.PHASE_DISPLAY_NAMES[phase],
                    value: phase,
                    checked: true
                }))
            }
        ]);
        return answers.phases;
    }
    parsePhaseString(phases) {
        return phases.split(',').map(p => p.trim());
    }
    displaySelectionSummary(selected) {
        if (selected.length === 0) {
            console.log('No phases selected.');
            return;
        }
        console.log('\nSelected phases:');
        selected.forEach(phase => {
            console.log(`  ${types_1.PHASE_DISPLAY_NAMES[phase]}`);
        });
        console.log('');
    }
}
exports.PhaseSelector = PhaseSelector;
//# sourceMappingURL=PhaseSelector.js.map