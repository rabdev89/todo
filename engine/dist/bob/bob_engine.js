"use strict";
/**
 * Bob Engine - Main Orchestrator
 *
 * Core engine that executes the framework workflow.
 * Reads state, determines next step, executes action, advances state.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.BobEngine = void 0;
const state_manager_1 = require("./state_manager");
const phase_router_1 = require("./phase_router");
const dashboard_generator_1 = require("./dashboard_generator");
const context_pack_1 = require("./context_pack");
const logger_1 = require("./logger");
const action_handlers_1 = require("./action_handlers");
const health_check_1 = require("../validation/health_check");
class BobEngine {
    /**
     * Main entry point - execute the next step
     */
    static async run(options = {}) {
        console.log('🤖 Bob starting...\n');
        await logger_1.BobLogger.info('BobEngine.run invoked', { options });
        try {
            // Pre-flight health check
            const health = await (0, health_check_1.validateSystemState)();
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
            const { phase: phaseId, step: stepId, status } = await state_manager_1.BobStateManager.getCurrentState();
            const { phase, step } = await state_manager_1.BobStateManager.getPhaseAndStep(phaseId, stepId);
            console.log(`Current Phase: ${phase.name} (${phaseId})`);
            console.log(`Current Step: ${step.name} (${stepId})`);
            console.log(`Status: ${status.status}\n`);
            await logger_1.BobLogger.info('Loaded current state', {
                phaseId,
                stepId,
                status: status.status,
                mode: status.mode,
                project_type: status.project_type,
                project_name: status.project_name
            });
            // Check if reset requested
            if (options.reset) {
                await state_manager_1.BobStateManager.reset();
                await dashboard_generator_1.BobDashboardGenerator.generate();
                await logger_1.BobLogger.info('Framework reset to initial state');
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
                await dashboard_generator_1.BobDashboardGenerator.generate();
                await logger_1.BobLogger.info('Workflow already completed', { phaseId, stepId });
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
                await dashboard_generator_1.BobDashboardGenerator.generate();
                await logger_1.BobLogger.info('Waiting for user input', { phaseId, stepId, stepName: step.name });
                return {
                    success: true,
                    message,
                    phase: phaseId,
                    step: stepId,
                    requiresUserInput: true
                };
            }
            // Check if we can advance
            const canAdvance = await phase_router_1.BobPhaseRouter.canAdvance();
            if (!canAdvance.canAdvance) {
                let message = `⛔ Cannot advance: ${canAdvance.reason}`;
                console.log(message);
                if (stepId === 'vision_generation') {
                    message = `⏸️  Vision details required. Please read vision_questionnaire.md, populate vision_questionnaire.md with the project information, and then run 'npm run bob' to generate the vision.md document.`;
                }
                console.log(message);
                await logger_1.BobLogger.warn('Cannot advance', {
                    phaseId,
                    stepId,
                    reason: canAdvance.reason
                });
                try {
                    await state_manager_1.BobStateManager.recordError(phaseId, stepId, canAdvance.reason || 'Cannot advance');
                }
                catch {
                    // ignore errors while recording gate failure
                }
                await dashboard_generator_1.BobDashboardGenerator.generate();
                return {
                    success: false,
                    message,
                    phase: phaseId,
                    step: stepId
                };
            }
            // Check if phase should be skipped
            const shouldSkip = await state_manager_1.BobStateManager.shouldSkipPhase(phaseId);
            if (shouldSkip) {
                console.log(`⏭️  Skipping phase: ${phase.name} (based on project type)\n`);
                await phase_router_1.BobPhaseRouter.skipCurrentPhase();
                await dashboard_generator_1.BobDashboardGenerator.generate();
                await logger_1.BobLogger.info('Skipping phase based on project type', {
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
            await state_manager_1.BobStateManager.updateStepStatus(phaseId, stepId, 'running');
            await logger_1.BobLogger.info('Step marked as running', {
                phaseId,
                stepId,
                stepName: step.name
            });
            const actionContextPack = await (0, context_pack_1.buildBobActionContextPack)(phaseId, stepId, phase, step, status);
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
            await logger_1.BobLogger.info('Prepared action context', {
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
                await state_manager_1.BobStateManager.updateStepStatus(phaseId, stepId, 'failed', null, message);
                await state_manager_1.BobStateManager.recordError(phaseId, stepId, message);
                await dashboard_generator_1.BobDashboardGenerator.generate();
                await logger_1.BobLogger.error('Missing required_action for step', {
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
            await logger_1.BobLogger.info('Executed action handler', {
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
                    Object.entries(result.data.required_fields).forEach(([field, config]) => {
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
                await logger_1.BobLogger.info('AI input required', {
                    phaseId,
                    stepId,
                    requiredFields: result.data.required_fields ? Object.keys(result.data.required_fields) : [],
                    statusFile: result.data.status_file
                });
                await dashboard_generator_1.BobDashboardGenerator.generate();
                // Reset status to pending so it can be re-run after AI input
                await state_manager_1.BobStateManager.updateStepStatus(phaseId, stepId, 'pending');
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
                await state_manager_1.BobStateManager.updateStepStatus(phaseId, stepId, 'completed', result.data || null);
                // Advance to next step/phase (handle potential breakout from loops)
                const advanced = await state_manager_1.BobStateManager.advanceState(Boolean(result.data?.end_phase));
                // Update metrics
                await state_manager_1.BobStateManager.updateMetrics();
                // Generate dashboard
                await dashboard_generator_1.BobDashboardGenerator.generate();
                const nextMessage = advanced.isNewPhase
                    ? `🎉 Completed phase: ${phase.name}. Moving to ${advanced.phase}.`
                    : `✅ Completed step: ${step.name}. Next: ${advanced.step}`;
                console.log(nextMessage + '\n');
                await logger_1.BobLogger.info('Step completed successfully', {
                    phaseId,
                    stepId,
                    stepName: step.name,
                    advancedPhase: advanced.phase,
                    advancedStep: advanced.step,
                    isNewPhase: advanced.isNewPhase
                });
                // Auto mode: continue if requested
                if (options.auto && !step.user_input_required) {
                    const nextState = await state_manager_1.BobStateManager.getCurrentState();
                    if (nextState.status.status !== 'completed' && nextState.status.status !== 'waiting_user') {
                        console.log('🔄 Auto mode: continuing to next step...\n');
                        await logger_1.BobLogger.info('Auto mode continuing to next step', {
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
            }
            else {
                // Mark step as failed
                await state_manager_1.BobStateManager.updateStepStatus(phaseId, stepId, 'failed', null, result.error || 'Unknown error');
                await state_manager_1.BobStateManager.recordError(phaseId, stepId, result.error || 'Step execution failed');
                await dashboard_generator_1.BobDashboardGenerator.generate();
                const errorMessage = `❌ Step failed: ${result.error || 'Unknown error'}`;
                console.log(errorMessage + '\n');
                await logger_1.BobLogger.error('Step execution failed', {
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
        }
        catch (error) {
            const errorMessage = `💥 Bob engine error: ${error.message}`;
            console.error(errorMessage);
            console.error(error.stack);
            await logger_1.BobLogger.error('Bob engine exception', {
                message: error.message,
                stack: error.stack
            });
            // Try to record the error
            try {
                const { phase, step } = await state_manager_1.BobStateManager.getCurrentState();
                await state_manager_1.BobStateManager.recordError(phase, step, error.message);
                await dashboard_generator_1.BobDashboardGenerator.generate();
            }
            catch {
                // Ignore errors during error recording
            }
            const { phase, step } = await state_manager_1.BobStateManager.getCurrentState();
            await logger_1.BobLogger.error('Bob engine returning failure', {
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
    static async executeAction(action, context) {
        const handler = (0, action_handlers_1.getHandler)(action);
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
    static async showStatus() {
        const output = await dashboard_generator_1.BobDashboardGenerator.generateConsoleOutput();
        console.log(output);
        const dashboardPath = await dashboard_generator_1.BobDashboardGenerator.generate();
        console.log(`\n📊 Dashboard updated: ${dashboardPath}\n`);
        return dashboardPath;
    }
    /**
     * Get detailed status for programmatic use
     */
    static async getStatus() {
        const { phase, step, status } = await state_manager_1.BobStateManager.getCurrentState();
        const progress = await phase_router_1.BobPhaseRouter.getProgress();
        const canAdvance = await phase_router_1.BobPhaseRouter.canAdvance();
        return {
            phase,
            step,
            status: status.status,
            progress: progress.percentage,
            canAdvance: canAdvance.canAdvance
        };
    }
}
exports.BobEngine = BobEngine;
