"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.phaseCommand = phaseCommand;
const inquirer_1 = __importDefault(require("inquirer"));
const Config_1 = require("../lib/Config");
const TemplateManager_1 = require("../lib/TemplateManager");
const types_1 = require("../types");
const terminal_ui_1 = require("../util/terminal-ui");
async function phaseCommand(phaseName) {
    const configManager = new Config_1.ConfigManager();
    const templateManager = new TemplateManager_1.TemplateManager();
    if (!(await configManager.exists())) {
        terminal_ui_1.ui.error('AI DevKit not initialized. Run `ai-devkit init` first.');
        return;
    }
    let phase;
    if (phaseName && types_1.AVAILABLE_PHASES.includes(phaseName)) {
        phase = phaseName;
    }
    else if (phaseName) {
        terminal_ui_1.ui.error(`Unknown phase "${phaseName}". Available phases: ${types_1.AVAILABLE_PHASES.join(', ')}`);
        return;
    }
    else {
        const config = await configManager.read();
        const availableToAdd = types_1.AVAILABLE_PHASES.filter(p => !config?.initializedPhases.includes(p));
        if (availableToAdd.length === 0) {
            terminal_ui_1.ui.warning('All phases are already initialized.');
            const { shouldReinitialize } = await inquirer_1.default.prompt([
                {
                    type: 'confirm',
                    name: 'shouldReinitialize',
                    message: 'Would you like to reinitialize a phase?',
                    default: false
                }
            ]);
            if (!shouldReinitialize) {
                return;
            }
        }
        const { selectedPhase } = await inquirer_1.default.prompt([
            {
                type: 'list',
                name: 'selectedPhase',
                message: 'Which phase would you like to add?',
                choices: types_1.AVAILABLE_PHASES.map(p => ({
                    name: types_1.PHASE_DISPLAY_NAMES[p],
                    value: p
                }))
            }
        ]);
        phase = selectedPhase;
    }
    const exists = await templateManager.fileExists(phase);
    let shouldCopy = true;
    if (exists) {
        const { overwrite } = await inquirer_1.default.prompt([
            {
                type: 'confirm',
                name: 'overwrite',
                message: `${types_1.PHASE_DISPLAY_NAMES[phase]} already exists. Overwrite?`,
                default: false
            }
        ]);
        shouldCopy = overwrite;
    }
    if (!shouldCopy) {
        terminal_ui_1.ui.warning(`Cancelled adding ${phase} phase.`);
        return;
    }
    const file = await templateManager.copyPhaseTemplate(phase);
    await configManager.addPhase(phase);
    terminal_ui_1.ui.success(`${types_1.PHASE_DISPLAY_NAMES[phase]} created successfully!`);
    terminal_ui_1.ui.info(`  Location: ${file}\n`);
}
//# sourceMappingURL=phase.js.map