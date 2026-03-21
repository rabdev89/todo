/**
 * Orchestration CLI Command
 *
 * CLI integration for the collaborative orchestration system.
 */

import { Command } from 'commander';
import { OrchestrationController } from '../../orchestration/orchestration_controller';

export const orchestrationCommand = new Command('orchestrate')
  .description('Run Bob + IDE AI collaborative orchestration')
  .option('-a, --auto', 'Run continuously until blocked or completed')
  .option('-s, --single', 'Run only a single step')
  .option('-m, --max-steps <number>', 'Maximum number of steps to run', '10')
  .option('--no-prompt', 'Disable user input prompts')
  .action(async (options) => {
    try {
      if (options.single) {
        console.log('🔄 Running single orchestration step...\n');
        await OrchestrationController.runSingleStep();
      } else {
        const auto = options.auto || false;
        const maxSteps = parseInt(options.maxSteps, 10) || 10;
        const promptForInput = !options.noPrompt;

        await OrchestrationController.run({
          auto,
          maxSteps,
          promptForInput
        });
      }
    } catch (error: any) {
      console.error(`\n❌ Orchestration failed: ${error.message}\n`);
      process.exit(1);
    }
  });