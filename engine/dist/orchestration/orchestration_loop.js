"use strict";
/**
 * Orchestration Loop
 *
 * Main orchestration logic for Bob + IDE AI collaboration.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrchestrationLoop = void 0;
const path_1 = __importDefault(require("path"));
const state_manager_1 = require("../bob/state_manager");
const command_executor_1 = require("./command_executor");
const error_handler_1 = require("./error_handler");
const result_reporter_1 = require("./result_reporter");
const command_mapping_1 = require("../shared/command_mapping");
class OrchestrationLoop {
    static FRAMEWORK_DIR = path_1.default.resolve(__dirname, '../../../framework');
    static PHASES_FILE = path_1.default.join(this.FRAMEWORK_DIR, 'phases_definition.json');
    /**
     * Main orchestration loop
     */
    static async run() {
        try {
            console.log('🤖 Starting Bob + IDE AI Orchestration Loop\n');
            // Read current status
            const status = await this.readFrameworkStatus();
            console.log(`📊 Current Status: ${status.status}`);
            console.log(`🎯 Phase: ${status.current_phase}`);
            console.log(`📝 Step: ${status.current_step}\n`);
            // Check if workflow is complete or failed
            if (status.status === 'completed') {
                return {
                    success: true,
                    message: 'Workflow completed successfully',
                    blocked: true
                };
            }
            if (status.status === 'failed') {
                return {
                    success: false,
                    message: 'Workflow failed - manual intervention required',
                    blocked: true
                };
            }
            // Check if waiting for user input
            if (status.status === 'waiting_user') {
                return {
                    success: true,
                    message: 'Waiting for user input',
                    blocked: true
                };
            }
            // Get current step details
            const stepDetails = await this.getCurrentStepDetails(status);
            if (!stepDetails) {
                return {
                    success: false,
                    message: 'Could not determine current step details',
                    blocked: true
                };
            }
            console.log(`🎬 Action Required: ${stepDetails.required_action}`);
            // Check if user input is required
            if (stepDetails.user_input_required) {
                console.log('👤 User input required - prompting user...');
                // This would be handled by prompting the user
                // For now, return blocked
                return {
                    success: true,
                    message: 'User input required for current step',
                    blocked: true
                };
            }
            // Get recommended commands
            const commands = (0, command_mapping_1.getRecommendedCommands)(stepDetails.required_action);
            if (commands.length === 0) {
                return {
                    success: false,
                    message: `No commands mapped for action: ${stepDetails.required_action}`,
                    blocked: true
                };
            }
            console.log(`🔧 Commands to execute: ${commands.length}`);
            commands.forEach((cmd, i) => console.log(`  ${i + 1}. ${cmd}`));
            console.log();
            // Execute commands
            const results = await this.executeCommands(commands);
            // Generate report
            const report = result_reporter_1.ResultReporter.generateReport(status.current_step, status.current_phase, stepDetails.required_action, commands, results);
            // Report to console
            result_reporter_1.ResultReporter.reportToConsole(report);
            // Update framework status
            await result_reporter_1.ResultReporter.updateFrameworkStatus(report);
            // Advance workflow
            const advanced = await result_reporter_1.ResultReporter.advanceWorkflow();
            const message = report.overallSuccess
                ? `Step completed successfully${advanced ? ' - workflow advanced' : ''}`
                : 'Step failed - check errors above';
            return {
                success: report.overallSuccess,
                message,
                blocked: !report.overallSuccess
            };
        }
        catch (error) {
            console.error(`❌ Orchestration loop failed: ${error.message}`);
            return {
                success: false,
                message: `Orchestration failed: ${error.message}`,
                blocked: true
            };
        }
    }
    /**
     * Read framework status
     */
    static async readFrameworkStatus() {
        return await state_manager_1.BobStateManager.loadStatus();
    }
    /**
     * Get current step details
     */
    static async getCurrentStepDetails(status) {
        const phases = await state_manager_1.BobStateManager.loadPhaseDefinitions();
        const phase = phases.phases.find(p => p.id === status.current_phase);
        if (!phase) {
            throw new Error(`Phase ${status.current_phase} not found in definitions`);
        }
        const step = phase.steps.find(s => s.id === status.current_step);
        if (!step) {
            throw new Error(`Step ${status.current_step} not found in phase ${status.current_phase}`);
        }
        return step;
    }
    /**
     * Execute commands with error handling
     */
    static async executeCommands(commands) {
        const results = [];
        for (const command of commands) {
            console.log(`\n▶️  Executing: ${command}`);
            let result = await command_executor_1.CommandExecutor.executeCommand(command);
            // If failed, try to fix
            if (!result.success) {
                console.log('❌ Command failed, attempting fixes...');
                const { fixed, finalResult } = await error_handler_1.ErrorHandler.handleCommandFailure(result);
                result = finalResult;
                if (fixed) {
                    console.log('✅ Error fixed automatically');
                }
                else {
                    console.log('❌ Could not fix error automatically');
                }
            }
            results.push(result);
            // Stop on first failure
            if (!result.success) {
                console.log('🛑 Stopping execution due to failure');
                break;
            }
        }
        return results;
    }
}
exports.OrchestrationLoop = OrchestrationLoop;
