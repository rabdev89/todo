/**
 * Bob Engine - Main Orchestrator
 *
 * Core engine that executes the framework workflow.
 * Reads state, determines next step, executes action, advances state.
 */

import { BobStateManager } from './state_manager';
import { BobPhaseRouter } from './phase_router';
import { BobDashboardGenerator } from './dashboard_generator';
import { buildBobActionContextPack } from './context_pack';
import { BobLogger } from './logger';
import type {
  ActionResult,
  ActionContext,
  FrameworkStatus,
  BobCommandOptions,
  BobCommandResult
} from './types';

import { getHandler } from './action_handlers';
import { validateSystemState } from '../validation/health_check';

export class BobEngine {
  /**
   * Main entry point - execute the next step
   */
  static async run(options: BobCommandOptions = {}): Promise<BobCommandResult> {
    console.log('🤖 Bob starting...\n');
    await BobLogger.info('BobEngine.run invoked', { options });
    try {
      // Pre-flight health check
      const health = await validateSystemState();
      if (!health.valid) {
        console.error('\n❌ System Health Check Failed:');
        health.errors.forEach(err => console.error(`  - ${err}`));
        console.log('');
        return {
          success: false,
          message: `System health check failed: ${health.errors[0]}`,
          phase: 'unknown',
          step: 'unknown'
        };
      }
      if (health.warnings.length > 0) {
        console.log('⚠️  System Health Check Warnings:');
        health.warnings.forEach(warn => console.log(`  - ${warn}`));
        console.log('');
      }

      // Load current state
      const { phase: phaseId, step: stepId, status } = await BobStateManager.getCurrentState();
      const { phase, step } = await BobStateManager.getPhaseAndStep(phaseId, stepId);

      console.log(`Current Phase: ${phase.name} (${phaseId})`);
      console.log(`Current Step: ${step.name} (${stepId})`);
      console.log(`Status: ${status.status}\n`);
      await BobLogger.info('Loaded current state', {
        phaseId,
        stepId,
        status: status.status,
        mode: status.mode,
        project_type: status.project_type,
        project_name: status.project_name
      });

      // Check if reset requested
      if (options.reset) {
        await BobStateManager.reset();
        await BobDashboardGenerator.generate();
        await BobLogger.info('Framework reset to initial state');
        return {
          success: true,
          message: 'Framework reset to initial state',
          phase: phaseId,
          step: stepId
        };
      }

      // Check if workflow is complete
      if (status.status === 'completed') {
        const message = '✅ Framework workflow is complete!';
        console.log(message);
        await BobDashboardGenerator.generate();
        await BobLogger.info('Workflow already completed', { phaseId, stepId });
        return {
          success: true,
          message,
          phase: phaseId,
          step: stepId
        };
      }

      // Check if waiting for user input
      if (status.status === 'waiting_user') {
        const message = `⏸️  Waiting for user input: ${step.name}`;
        console.log(message);
        console.log(`Run 'npm run start -- bob' again after providing input.\n`);
        await BobDashboardGenerator.generate();
        await BobLogger.info('Waiting for user input', { phaseId, stepId, stepName: step.name });
        return {
          success: true,
          message,
          phase: phaseId,
          step: stepId,
          requiresUserInput: true
        };
      }

      // Check if we can advance
      const canAdvance = await BobPhaseRouter.canAdvance();
      if (!canAdvance.canAdvance) {
        let message = `⛔ Cannot advance: ${canAdvance.reason}`;
        console.log(message);
        if(stepId === 'vision_generation'){
          message = `⏸️  Vision details required. Please read vision_questionnaire.md, populate vision_questionnaire.md with the project information, and then run 'npm run bob' to generate the vision.md document.`;
        }
        console.log(message);
        await BobLogger.warn('Cannot advance', {
          phaseId,
          stepId,
          reason: canAdvance.reason
        });
        try {
          await BobStateManager.recordError(phaseId, stepId, canAdvance.reason || 'Cannot advance');
        } catch {
          // ignore errors while recording gate failure
        }
        await BobDashboardGenerator.generate();
        return {
          success: false,
          message,
          phase: phaseId,
          step: stepId
        };
      }


      // Check if phase should be skipped
      const shouldSkip = await BobStateManager.shouldSkipPhase(phaseId);
      if (shouldSkip) {
        console.log(`⏭️  Skipping phase: ${phase.name} (based on project type)\n`);
        await BobPhaseRouter.skipCurrentPhase();
        await BobDashboardGenerator.generate();
        await BobLogger.info('Skipping phase based on project type', {
          phaseId,
          phaseName: phase.name
        });
        return {
          success: true,
          message: `Skipped phase: ${phase.name}`,
          phase: phaseId,
          step: stepId
        };
      }

      // Mark step as running
      await BobStateManager.updateStepStatus(phaseId, stepId, 'running');
      await BobLogger.info('Step marked as running', {
        phaseId,
        stepId,
        stepName: step.name
      });

      const actionContextPack = await buildBobActionContextPack(phaseId, stepId, phase, step, status);
      console.log(`Persona: ${actionContextPack.personaId ?? 'n/a'}`);
      console.log(`Layer: ${actionContextPack.layer ?? 'n/a'}`);
      console.log(`Track: ${actionContextPack.track ?? 'n/a'}`);
      console.log(`Executing: ${step.required_action}`);
      if (actionContextPack.recommendedCommands.length > 0) {
        console.log(`Recommended commands: ${actionContextPack.recommendedCommands.join(' | ')}`);
      }
      if (actionContextPack.skills.length > 0 || actionContextPack.patterns.length > 0) {
        console.log('');
        if (actionContextPack.skills.length > 0) {
          console.log(`Skills: ${actionContextPack.skills.join(', ')}`);
        }
        if (actionContextPack.patterns.length > 0) {
          console.log(`Patterns: ${actionContextPack.patterns.join(', ')}`);
        }
      }
      if (actionContextPack.docPaths.length > 0) {
        console.log('');
        console.log(`Docs: ${actionContextPack.docPaths.join(', ')}`);
      }
      console.log('');
      await BobLogger.info('Prepared action context', {
        phaseId,
        stepId,
        requiredAction: step.required_action,
        personaId: actionContextPack.personaId,
        layer: actionContextPack.layer,
        track: actionContextPack.track,
        docPaths: actionContextPack.docPaths
      });

      const actionName = step.required_action;
      if (!actionName) {
        const message = `No required_action defined for step: ${step.id}`;
        console.error(message);
        await BobStateManager.updateStepStatus(phaseId, stepId, 'failed', null, message);
        await BobStateManager.recordError(phaseId, stepId, message);
        await BobDashboardGenerator.generate();
        await BobLogger.error('Missing required_action for step', {
          phaseId,
          stepId,
          stepName: step.name
        });
        return {
          success: false,
          message,
          phase: phaseId,
          step: stepId
        };
      }

      const result = await this.executeAction(actionName, { phase, step, status });
      await BobLogger.info('Executed action handler', {
        phaseId,
        stepId,
        action: actionName,
        success: result.success,
        error: result.error
      });

      // Handle AI-driven input requirement
      if (result.data?.requires_ai_input) {
        console.log('\n🤖 AI Agent Input Required\n');
        console.log('This action requires information from an AI agent.\n');
        
        if (result.data.ai_prompt) {
          console.log('📋 AI Prompt:\n');
          console.log(result.data.ai_prompt);
        }
        
        if (result.data.required_fields) {
          console.log('📝 Required Fields:\n');
          Object.entries(result.data.required_fields).forEach(([field, config]: [string, any]) => {
            console.log(`  ${field}:`);
            console.log(`    Description: ${config.description}`);
            if (config.options) {
              console.log(`    Options: ${config.options.join(', ')}`);
            }
            if (config.example) {
              console.log(`    Example: ${config.example}`);
            }
          });
          console.log('');
        }
        
        console.log(`📂 Update file: ${result.data.status_file || 'framework_status.json'}\n`);
        console.log('Then call: npm run start -- bob\n');
        
        await BobLogger.info('AI input required', {
          phaseId,
          stepId,
          requiredFields: result.data.required_fields ? Object.keys(result.data.required_fields) : [],
          statusFile: result.data.status_file
        });
        
        await BobDashboardGenerator.generate();
        
        // Reset status to pending so it can be re-run after AI input
        await BobStateManager.updateStepStatus(phaseId, stepId, 'pending');

        return {
          success: false,
          message: '⏸️  Awaiting AI Agent Input - Update configuration file and retry',
          phase: phaseId,
          step: stepId,
          requires_ai_input: true,
          ai_context: result.data
        };
      }

      // Handle result
      if (result.success) {
        // Mark step as completed
        await BobStateManager.updateStepStatus(phaseId, stepId, 'completed', result.data || null);
        
        // Advance to next step/phase (handle potential breakout from loops)
        const advanced = await BobStateManager.advanceState(Boolean(result.data?.end_phase));
        
        // Update metrics
        await BobStateManager.updateMetrics();
        
        // Generate dashboard
        await BobDashboardGenerator.generate();

        const nextMessage = advanced.isNewPhase 
          ? `🎉 Completed phase: ${phase.name}. Moving to ${advanced.phase}.`
          : `✅ Completed step: ${step.name}. Next: ${advanced.step}`;
        
        console.log(nextMessage + '\n');
        await BobLogger.info('Step completed successfully', {
          phaseId,
          stepId,
          stepName: step.name,
          advancedPhase: advanced.phase,
          advancedStep: advanced.step,
          isNewPhase: advanced.isNewPhase
        });

        // Auto mode: continue if requested
        if (options.auto && !step.user_input_required) {
          const nextState = await BobStateManager.getCurrentState();
          if (nextState.status.status !== 'completed' && nextState.status.status !== 'waiting_user') {
            console.log('🔄 Auto mode: continuing to next step...\n');
            await BobLogger.info('Auto mode continuing to next step', {
              phaseId: nextState.phase,
              stepId: nextState.step,
              status: nextState.status.status
            });
            return this.run(options);
          }
        }

        return {
          success: true,
          message: nextMessage,
          phase: advanced.phase,
          step: advanced.step,
          next_step: advanced.step
        };
      } else {
        // Mark step as failed
        await BobStateManager.updateStepStatus(phaseId, stepId, 'failed', null, result.error || 'Unknown error');
        await BobStateManager.recordError(phaseId, stepId, result.error || 'Step execution failed');
        await BobDashboardGenerator.generate();

        const errorMessage = `❌ Step failed: ${result.error || 'Unknown error'}`;
        console.log(errorMessage + '\n');
        await BobLogger.error('Step execution failed', {
          phaseId,
          stepId,
          stepName: step.name,
          error: result.error
        });

        return {
          success: false,
          message: errorMessage,
          phase: phaseId,
          step: stepId
        };
      }
    } catch (error: any) {
      const errorMessage = `💥 Bob engine error: ${error.message}`;
      console.error(errorMessage);
      console.error(error.stack);
      await BobLogger.error('Bob engine exception', {
        message: error.message,
        stack: error.stack
      });

      // Try to record the error
      try {
        const { phase, step } = await BobStateManager.getCurrentState();
        await BobStateManager.recordError(phase, step, error.message);
        await BobDashboardGenerator.generate();
      } catch {
        // Ignore errors during error recording
      }

      const { phase, step } = await BobStateManager.getCurrentState();
      await BobLogger.error('Bob engine returning failure', {
        phase,
        step,
        message: errorMessage
      });
      return {
        success: false,
        message: errorMessage,
        phase,
        step
      };
    }
  }

  /**
   * Execute the action for a step using registered handlers
   */
  private static async executeAction(
    action: string,
    context: ActionContext
  ): Promise<ActionResult> {
    const handler = getHandler(action);
    
    if (!handler) {
      console.log(`⚠️  No handler found for action: ${action}`);
      return {
        success: false,
        error: `Unknown action: ${action}`
      };
    }

    return handler(context);
  }

  /**
   * Show current status (dashboard)
   */
  static async showStatus(): Promise<string> {
    const output = await BobDashboardGenerator.generateConsoleOutput();
    console.log(output);
    
    const dashboardPath = await BobDashboardGenerator.generate();
    console.log(`\n📊 Dashboard updated: ${dashboardPath}\n`);
    
    return dashboardPath;
  }

  /**
   * Get detailed status for programmatic use
   */
  static async getStatus(): Promise<{
    phase: string;
    step: string;
    status: string;
    progress: number;
    canAdvance: boolean;
  }> {
    const { phase, step, status } = await BobStateManager.getCurrentState();
    const progress = await BobPhaseRouter.getProgress();
    const canAdvance = await BobPhaseRouter.canAdvance();

    return {
      phase,
      step,
      status: status.status,
      progress: progress.percentage,
      canAdvance: canAdvance.canAdvance
    };
  }
}
