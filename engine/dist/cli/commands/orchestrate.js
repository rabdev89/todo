"use strict";
/**
 * Orchestration CLI Command
 *
 * CLI integration for the collaborative orchestration system.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.orchestrationCommand = void 0;
const commander_1 = require("commander");
const orchestration_controller_1 = require("../../orchestration/orchestration_controller");
exports.orchestrationCommand = new commander_1.Command('orchestrate')
    .description('Run Bob + IDE AI collaborative orchestration')
    .option('-a, --auto', 'Run continuously until blocked or completed')
    .option('-s, --single', 'Run only a single step')
    .option('-m, --max-steps <number>', 'Maximum number of steps to run', '10')
    .option('--no-prompt', 'Disable user input prompts')
    .action(async (options) => {
    try {
        if (options.single) {
            console.log('🔄 Running single orchestration step...\n');
            await orchestration_controller_1.OrchestrationController.runSingleStep();
        }
        else {
            const auto = options.auto || false;
            const maxSteps = parseInt(options.maxSteps, 10) || 10;
            const promptForInput = !options.noPrompt;
            await orchestration_controller_1.OrchestrationController.run({
                auto,
                maxSteps,
                promptForInput
            });
        }
    }
    catch (error) {
        console.error(`\n❌ Orchestration failed: ${error.message}\n`);
        process.exit(1);
    }
});
