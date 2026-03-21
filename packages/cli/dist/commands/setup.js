"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupCommand = setupCommand;
const inquirer_1 = __importDefault(require("inquirer"));
const path = __importStar(require("path"));
const TemplateManager_1 = require("../lib/TemplateManager");
const EnvironmentSelector_1 = require("../lib/EnvironmentSelector");
const env_1 = require("../util/env");
const terminal_ui_1 = require("../util/terminal-ui");
async function setupCommand(options) {
    if (!options.global) {
        terminal_ui_1.ui.warning('Please use --global flag to set up global commands.');
        terminal_ui_1.ui.info('Usage: ai-devkit setup --global');
        return;
    }
    await setupGlobalCommands();
}
async function setupGlobalCommands() {
    const templateManager = new TemplateManager_1.TemplateManager();
    const environmentSelector = new EnvironmentSelector_1.EnvironmentSelector();
    terminal_ui_1.ui.info('Global Setup\n');
    terminal_ui_1.ui.info('This will copy AI DevKit commands to your global environment folders.\n');
    const selectedEnvironments = await environmentSelector.selectGlobalEnvironments();
    if (selectedEnvironments.length === 0) {
        terminal_ui_1.ui.warning('No environments selected. Setup cancelled.');
        return;
    }
    environmentSelector.displaySelectionSummary(selectedEnvironments);
    for (const envCode of selectedEnvironments) {
        await processGlobalEnvironment(envCode, templateManager);
    }
    terminal_ui_1.ui.success('\nGlobal setup completed successfully!\n');
    terminal_ui_1.ui.info('Your commands are now available globally for the selected environments.');
}
async function processGlobalEnvironment(envCode, templateManager) {
    const envName = (0, env_1.getEnvironmentDisplayName)(envCode);
    const env = (0, env_1.getEnvironment)(envCode);
    if (!env || !env.globalCommandPath) {
        terminal_ui_1.ui.error(`${envName} does not support global setup.`);
        return;
    }
    terminal_ui_1.ui.info(`\nSetting up ${envName}...`);
    terminal_ui_1.ui.info(`  Global path: ~/${env.globalCommandPath}`);
    const commandsExist = await templateManager.checkGlobalCommandsExist(envCode);
    if (commandsExist) {
        const { shouldOverwrite } = await inquirer_1.default.prompt([
            {
                type: 'confirm',
                name: 'shouldOverwrite',
                message: `Global commands already exist for ${envName}. Overwrite?`,
                default: false
            }
        ]);
        if (!shouldOverwrite) {
            terminal_ui_1.ui.warning(`Skipped ${envName} (files already exist)`);
            return;
        }
    }
    try {
        const copiedFiles = await templateManager.copyCommandsToGlobal(envCode);
        terminal_ui_1.ui.success(`Copied ${copiedFiles.length} commands to ${envName} global folder`);
        copiedFiles.forEach(file => {
            const fileName = path.basename(file);
            terminal_ui_1.ui.info(`     • ${fileName}`);
        });
    }
    catch (error) {
        if (error instanceof Error) {
            terminal_ui_1.ui.error(`Failed to set up ${envName}: ${error.message}`);
        }
        else {
            terminal_ui_1.ui.error(`Failed to set up ${envName}`);
        }
    }
}
//# sourceMappingURL=setup.js.map