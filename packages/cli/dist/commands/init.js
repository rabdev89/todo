"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initCommand = initCommand;
const child_process_1 = require("child_process");
const inquirer_1 = __importDefault(require("inquirer"));
const Config_1 = require("../lib/Config");
const TemplateManager_1 = require("../lib/TemplateManager");
const EnvironmentSelector_1 = require("../lib/EnvironmentSelector");
const PhaseSelector_1 = require("../lib/PhaseSelector");
const types_1 = require("../types");
const env_1 = require("../util/env");
const terminal_ui_1 = require("../util/terminal-ui");
function isGitAvailable() {
    try {
        (0, child_process_1.execSync)('git --version', { stdio: 'ignore' });
        return true;
    }
    catch {
        return false;
    }
}
function ensureGitRepository() {
    if (!isGitAvailable()) {
        terminal_ui_1.ui.warning('Git is not installed or not available on the PATH. Skipping repository initialization.');
        return;
    }
    try {
        (0, child_process_1.execSync)('git rev-parse --is-inside-work-tree', { stdio: 'ignore' });
    }
    catch {
        try {
            (0, child_process_1.execSync)('git init', { stdio: 'ignore' });
            terminal_ui_1.ui.success('Initialized a new git repository');
        }
        catch (error) {
            terminal_ui_1.ui.error(`Failed to initialize git repository: ${error instanceof Error ? error.message : error}`);
        }
    }
}
async function initCommand(options) {
    const configManager = new Config_1.ConfigManager();
    const templateManager = new TemplateManager_1.TemplateManager();
    const environmentSelector = new EnvironmentSelector_1.EnvironmentSelector();
    const phaseSelector = new PhaseSelector_1.PhaseSelector();
    ensureGitRepository();
    if (await configManager.exists()) {
        const { shouldContinue } = await inquirer_1.default.prompt([
            {
                type: 'confirm',
                name: 'shouldContinue',
                message: 'AI DevKit is already initialized. Do you want to reconfigure?',
                default: false
            }
        ]);
        if (!shouldContinue) {
            terminal_ui_1.ui.warning('Initialization cancelled.');
            return;
        }
    }
    let selectedEnvironments = options.environment || [];
    if (selectedEnvironments.length === 0) {
        terminal_ui_1.ui.info('AI Environment Setup');
        selectedEnvironments = await environmentSelector.selectEnvironments();
    }
    if (selectedEnvironments.length === 0) {
        terminal_ui_1.ui.warning('No environments selected. Initialization cancelled.');
        return;
    }
    for (const envCode of selectedEnvironments) {
        if (!(0, env_1.isValidEnvironmentCode)(envCode)) {
            terminal_ui_1.ui.error(`Invalid environment code: ${envCode}`);
            return;
        }
    }
    const existingEnvironments = [];
    for (const envId of selectedEnvironments) {
        if (await templateManager.checkEnvironmentExists(envId)) {
            existingEnvironments.push(envId);
        }
    }
    let shouldProceedWithSetup = true;
    if (existingEnvironments.length > 0) {
        terminal_ui_1.ui.warning(`The following environments are already set up: ${existingEnvironments.join(', ')}`);
        shouldProceedWithSetup = await environmentSelector.confirmOverride(existingEnvironments);
    }
    if (!shouldProceedWithSetup) {
        terminal_ui_1.ui.warning('Environment setup cancelled.');
        return;
    }
    const selectedPhases = await phaseSelector.selectPhases(options.all, options.phases);
    if (selectedPhases.length === 0) {
        terminal_ui_1.ui.warning('No phases selected. Nothing to initialize.');
        return;
    }
    terminal_ui_1.ui.text('Initializing AI DevKit...', { breakline: true });
    let config = await configManager.read();
    if (!config) {
        config = await configManager.create();
        terminal_ui_1.ui.success('Created configuration file');
    }
    await configManager.setEnvironments(selectedEnvironments);
    terminal_ui_1.ui.success('Updated configuration with selected environments');
    environmentSelector.displaySelectionSummary(selectedEnvironments);
    phaseSelector.displaySelectionSummary(selectedPhases);
    terminal_ui_1.ui.text('Setting up environment templates...', { breakline: true });
    const envFiles = await templateManager.setupMultipleEnvironments(selectedEnvironments);
    envFiles.forEach(file => {
        terminal_ui_1.ui.success(`Created ${file}`);
    });
    for (const phase of selectedPhases) {
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
        if (shouldCopy) {
            await templateManager.copyPhaseTemplate(phase);
            await configManager.addPhase(phase);
            terminal_ui_1.ui.success(`Created ${phase} phase`);
        }
        else {
            terminal_ui_1.ui.warning(`Skipped ${phase} phase`);
        }
    }
    terminal_ui_1.ui.text('AI DevKit initialized successfully!', { breakline: true });
    terminal_ui_1.ui.info('Next steps:');
    terminal_ui_1.ui.text('  • Review and customize templates in docs/ai/');
    terminal_ui_1.ui.text('  • Your AI environments are ready to use with the generated configurations');
    terminal_ui_1.ui.text('  • Run `ai-devkit phase <name>` to add more phases later');
    terminal_ui_1.ui.text('  • Run `ai-devkit init` again to add more environments\n');
}
//# sourceMappingURL=init.js.map