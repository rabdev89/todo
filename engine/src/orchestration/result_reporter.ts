/**
 * Result Reporter
 *
 * Reports execution results and advances workflow state.
 */

import { CommandResult } from './command_executor';
import { BobStateManager } from '../bob/state_manager';
import { BobEngine } from '../bob/bob_engine';
import path from 'path';

export interface ExecutionReport {
  stepId: string;
  phaseId: string;
  action: string;
  commands: string[];
  results: CommandResult[];
  overallSuccess: boolean;
  duration: number;
  timestamp: string;
  errors: string[];
  fixesApplied: string[];
}

export class ResultReporter {
  private static readonly DASHBOARD_FILE = path.join(
    __dirname,
    '../../../web-applications/bob/dashboard.md'
  );

  /**
   * Generate execution report
   */
  static generateReport(
    stepId: string,
    phaseId: string,
    action: string,
    commands: string[],
    results: CommandResult[]
  ): ExecutionReport {
    const overallSuccess = results.every(r => r.success);
    const totalDuration = results.reduce((sum, r) => sum + r.duration, 0);
    const errors = results
      .filter(r => !r.success)
      .map(r => `${r.command}: ${r.stderr}`);
    const fixesApplied: string[] = []; // Would be populated by error handler

    return {
      stepId,
      phaseId,
      action,
      commands,
      results,
      overallSuccess,
      duration: totalDuration,
      timestamp: new Date().toISOString(),
      errors,
      fixesApplied
    };
  }

  /**
   * Report results to console
   */
  static reportToConsole(report: ExecutionReport): void {
    console.log('\n' + '='.repeat(60));
    console.log('📊 EXECUTION REPORT');
    console.log('='.repeat(60));

    console.log(`Phase: ${report.phaseId}`);
    console.log(`Step: ${report.stepId}`);
    console.log(`Action: ${report.action}`);
    console.log(`Status: ${report.overallSuccess ? '✅ SUCCESS' : '❌ FAILED'}`);
    console.log(`Duration: ${report.duration}ms`);
    console.log(`Commands: ${report.commands.length}`);

    if (report.errors.length > 0) {
      console.log('\n❌ Errors:');
      report.errors.forEach(error => console.log(`  - ${error}`));
    }

    if (report.fixesApplied.length > 0) {
      console.log('\n🔧 Fixes Applied:');
      report.fixesApplied.forEach(fix => console.log(`  - ${fix}`));
    }

    console.log('='.repeat(60) + '\n');
  }

  /**
   * Update framework status with execution results
   */
  static async updateFrameworkStatus(
    report: ExecutionReport
  ): Promise<void> {
    try {
      const status = await BobStateManager.loadStatus();

      // Find the current step
      const phase = status.phases[report.phaseId];
      if (!phase) {
        console.warn(`Phase ${report.phaseId} not found in status`);
        return;
      }

      const step = phase.steps[report.stepId];
      if (!step) {
        console.warn(`Step ${report.stepId} not found in phase ${report.phaseId}`);
        return;
      }

      // Update step status
      step.status = report.overallSuccess ? 'completed' : 'failed';
      step.completed_at = new Date().toISOString();

      // Add result data
      step.result = {
        success: report.overallSuccess,
        duration: report.duration,
        commands_executed: report.commands.length,
        errors: report.errors,
        timestamp: report.timestamp
      };

      // Update phase if all steps completed
      const allStepsCompleted = Object.values(phase.steps).every(s => s.status === 'completed');
      if (allStepsCompleted) {
        phase.status = 'completed';
        phase.completed_at = new Date().toISOString();
      }

      // Update overall status
      status.last_updated = new Date().toISOString();
      if (report.overallSuccess) {
        status.status = 'running'; // Let Bob determine next state
      } else {
        status.status = 'failed';
        status.errors.push({
          phase: report.phaseId,
          step: report.stepId,
          message: report.errors.join('; '),
          timestamp: report.timestamp
        });
      }

      await BobStateManager.saveStatus(status);
      console.log('✅ Framework status updated');

    } catch (error: any) {
      console.error(`❌ Failed to update framework status: ${error.message}`);
    }
  }

  /**
   * Advance workflow by running Bob
   */
  static async advanceWorkflow(): Promise<boolean> {
    try {
      console.log('🚀 Advancing workflow with Bob...');

      // Run Bob to advance state
      const result = await BobEngine.run({ auto: false });

      if (result.success) {
        console.log('✅ Workflow advanced successfully');
        return true;
      } else {
        console.log('❌ Workflow advancement failed');
        return false;
      }
    } catch (error: any) {
      console.error(`❌ Error advancing workflow: ${error.message}`);
      return false;
    }
  }

  /**
   * Generate summary for user
   */
  static generateUserSummary(report: ExecutionReport): string {
    const status = report.overallSuccess ? '✅ Completed' : '❌ Failed';
    const duration = `${Math.round(report.duration / 1000)}s`;

    let summary = `${status} - ${report.stepId} (${duration})\n`;

    if (report.errors.length > 0) {
      summary += `\nErrors:\n${report.errors.map(e => `• ${e}`).join('\n')}`;
    }

    if (report.fixesApplied.length > 0) {
      summary += `\nFixes Applied:\n${report.fixesApplied.map(f => `• ${f}`).join('\n')}`;
    }

    return summary;
  }
}