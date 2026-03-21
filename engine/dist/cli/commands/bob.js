"use strict";
/**
 * Bob CLI Command
 *
 * CLI integration for the Bob orchestration engine.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.bobStatusCommand = exports.bobCommand = void 0;
const commander_1 = require("commander");
const bob_engine_1 = require("../../bob/bob_engine");
const state_manager_1 = require("../../bob/state_manager");
const dashboard_generator_1 = require("../../bob/dashboard_generator");
const logger_1 = require("../../bob/logger");
exports.bobCommand = new commander_1.Command('bob')
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
            await logger_1.BobLogger.info('Bob CLI reset requested');
            await state_manager_1.BobStateManager.reset();
            const dashboardPath = await dashboard_generator_1.BobDashboardGenerator.generate();
            console.log('✅ Framework reset to initial state\n');
            console.log(`📊 Dashboard: ${dashboardPath}\n`);
            await logger_1.BobLogger.info('Bob CLI reset completed', { dashboardPath });
            return; // Important: return here to prevent continuing to BobEngine.run()
        }
        if (options.rollback) {
            console.log('⏪ Rolling back to previous step...\n');
            await logger_1.BobLogger.info('Bob CLI rollback requested');
            await state_manager_1.BobStateManager.rollbackPreviousStep();
            const dashboardPath = await dashboard_generator_1.BobDashboardGenerator.generate();
            console.log('✅ Rolled back successfully\n');
            console.log(`📊 Dashboard: ${dashboardPath}\n`);
            await logger_1.BobLogger.info('Bob CLI rollback completed', { dashboardPath });
            return;
        }
        if (options.phase) {
            console.log(`➡️  Jumping to phase: ${options.phase}\n`);
            console.log('⚠️  Phase jump not yet implemented\n');
            await logger_1.BobLogger.warn('Bob CLI phase jump requested but not implemented', {
                phase: options.phase
            });
            return;
        }
        await logger_1.BobLogger.info('Bob CLI command invoked', {
            auto: options.auto,
            mode: options.mode
        });
        const result = await bob_engine_1.BobEngine.run({
            auto: options.auto,
            mode: options.mode
        });
        await logger_1.BobLogger.info('Bob CLI command completed', {
            success: result.success,
            phase: result.phase,
            step: result.step,
            message: result.message
        });
        process.exit(result.success ? 0 : 1);
    }
    catch (error) {
        console.error(`\n❌ Bob command failed: ${error.message}\n`);
        await logger_1.BobLogger.error('Bob CLI command failed', { message: error.message });
        process.exit(1);
    }
});
exports.bobStatusCommand = new commander_1.Command('bob-status')
    .description('Show current Bob framework status')
    .action(async () => {
    try {
        await bob_engine_1.BobEngine.showStatus();
    }
    catch (error) {
        console.error(`\n❌ Failed to show status: ${error.message}\n`);
        process.exit(1);
    }
});
