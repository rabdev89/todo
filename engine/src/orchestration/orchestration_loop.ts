/**
 * Orchestration Loop
 *
 * Main orchestration logic for Bob + IDE AI collaboration.
 */

import fs from 'fs-extra';
import path from 'path';
import { BobStateManager } from '../bob/state_manager';
import { BobPhaseRouter } from '../bob/phase_router';
import { CommandExecutor, CommandResult } from './command_executor';
import { ErrorHandler } from './error_handler';
import { ResultReporter, ExecutionReport } from './result_reporter';
import { getRecommendedCommands } from '../shared/command_mapping';
import type { FrameworkStatus } from '../bob/types';

interface PhaseDefinition {
  id: string;
  steps: Record<string, {
    id: string;
    required_action: string;
    user_input_required: boolean;
  }>;
}

export class OrchestrationLoop {
  private static readonly FRAMEWORK_DIR = path.resolve(__dirname, '../../../framework');
  private static readonly PHASES_FILE = path.join(this.FRAMEWORK_DIR, 'phases_definition.json');

  /**
   * Main orchestration loop
   */
  static async run(): Promise<{ success: boolean; message: string; blocked: boolean }> {
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
      const commands = getRecommendedCommands(stepDetails.required_action);
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
      const report = ResultReporter.generateReport(
        status.current_step,
        status.current_phase,
        stepDetails.required_action,
        commands,
        results
      );

      // Report to console
      ResultReporter.reportToConsole(report);

      // Update framework status
      await ResultReporter.updateFrameworkStatus(report);

      // Advance workflow
      const advanced = await ResultReporter.advanceWorkflow();

      const message = report.overallSuccess
        ? `Step completed successfully${advanced ? ' - workflow advanced' : ''}`
        : 'Step failed - check errors above';

      return {
        success: report.overallSuccess,
        message,
        blocked: !report.overallSuccess
      };

    } catch (error: any) {
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
  private static async readFrameworkStatus(): Promise<FrameworkStatus> {
    return await BobStateManager.loadStatus();
  }

  /**
   * Get current step details
   */
  private static async getCurrentStepDetails(status: FrameworkStatus): Promise<any> {
    const phases = await BobStateManager.loadPhaseDefinitions();
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
  private static async executeCommands(commands: string[]): Promise<CommandResult[]> {
    const results: CommandResult[] = [];

    for (const command of commands) {
      console.log(`\n▶️  Executing: ${command}`);

      let result = await CommandExecutor.executeCommand(command);

      // If failed, try to fix
      if (!result.success) {
        console.log('❌ Command failed, attempting fixes...');
        const { fixed, finalResult } = await ErrorHandler.handleCommandFailure(result);
        result = finalResult;

        if (fixed) {
          console.log('✅ Error fixed automatically');
        } else {
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
