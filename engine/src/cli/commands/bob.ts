/**
 * Bob CLI Command
 *
 * CLI integration for the Bob orchestration engine.
 */

import { Command } from 'commander';
import { BobEngine } from '../../bob/bob_engine';
import { BobStateManager } from '../../bob/state_manager';
import { BobDashboardGenerator } from '../../bob/dashboard_generator';
import { BobLogger } from '../../bob/logger';

export const bobCommand = new Command('bob')
  .description('Execute Bob framework orchestration workflow')
  .option('-a, --auto', 'Run continuously until blocked')
  .option('-p, --phase <phase>', 'Jump to specific phase')
  .option('-b, --rollback', 'Rollback to the previous step in the framework status')
  .option('-r, --reset', 'Reset framework to initial state')
  .option('-m, --mode <mode>', 'Set mode (full/lean)', 'full')
  .action(async (options) => {
    try {
      if (options.reset) {
        console.log('🔄 Resetting framework state...\n');
        await BobLogger.info('Bob CLI reset requested');
        await BobStateManager.reset();
        const dashboardPath = await BobDashboardGenerator.generate();
        console.log('✅ Framework reset to initial state\n');
        console.log(`📊 Dashboard: ${dashboardPath}\n`);
        await BobLogger.info('Bob CLI reset completed', { dashboardPath });
        return; // Important: return here to prevent continuing to BobEngine.run()
      }

      if (options.rollback) {
        console.log('⏪ Rolling back to previous step...\n');
        await BobLogger.info('Bob CLI rollback requested');
        await BobStateManager.rollbackPreviousStep();
        const dashboardPath = await BobDashboardGenerator.generate();
        console.log('✅ Rolled back successfully\n');
        console.log(`📊 Dashboard: ${dashboardPath}\n`);
        await BobLogger.info('Bob CLI rollback completed', { dashboardPath });
        return;
      }

      if (options.phase) {
        console.log(`➡️  Jumping to phase: ${options.phase}\n`);
        console.log('⚠️  Phase jump not yet implemented\n');
        await BobLogger.warn('Bob CLI phase jump requested but not implemented', {
          phase: options.phase
        });
        return;
      }

      await BobLogger.info('Bob CLI command invoked', {
        auto: options.auto,
        mode: options.mode
      });

      const result = await BobEngine.run({
        auto: options.auto,
        mode: options.mode
      });

      await BobLogger.info('Bob CLI command completed', {
        success: result.success,
        phase: result.phase,
        step: result.step,
        message: result.message
      });

      process.exit(result.success ? 0 : 1);
    } catch (error: any) {
      console.error(`\n❌ Bob command failed: ${error.message}\n`);
      await BobLogger.error('Bob CLI command failed', { message: error.message });
      process.exit(1);
    }
  });

export const bobStatusCommand = new Command('bob-status')
  .description('Show current Bob framework status')
  .action(async () => {
    try {
      await BobEngine.showStatus();
    } catch (error: any) {
      console.error(`\n❌ Failed to show status: ${error.message}\n`);
      process.exit(1);
    }
  });
