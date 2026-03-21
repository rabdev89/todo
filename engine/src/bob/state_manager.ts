/**
 * Bob State Manager
 *
 * Manages the framework-level state (not ticket-level).
 * Integrates with existing StateManager for ticket operations.
 */

import fs from 'fs-extra';
import path from 'path';
import type {
  FrameworkStatus,
  PhaseDefinition,
  Phase,
  Step,
  StepState,
  PhaseState,
  FrameworkError
} from '../bob/types';

import { BobConfig } from '../shared/config';

const config = BobConfig.getInstance();
const ROOT_DIR = config.getRootDir();
const FRAMEWORK_DIR = path.join(ROOT_DIR, config.getDirectory('framework'));
const PROJECT_DIR = path.join(ROOT_DIR, config.getDirectory('dashboard'));
const STATUS_FILE = path.join(PROJECT_DIR, 'framework_status.json');
const PHASES_FILE = path.join(FRAMEWORK_DIR, 'phases_definition.json');

export class BobStateManager {
  /**
   * Read the current framework status
   */
  static async loadStatus(): Promise<FrameworkStatus> {
    // If status file doesn't exist, try to copy from framework template
    if (!await fs.pathExists(STATUS_FILE)) {
      const templatePath = path.join(FRAMEWORK_DIR, 'framework_status.json');
      const schemaPath = path.join(FRAMEWORK_DIR, 'framework_status.schema.json');
      const targetSchemaPath = path.join(PROJECT_DIR, 'framework_status.schema.json');

      if (await fs.pathExists(templatePath)) {
        // Ensure project directory exists
        await fs.ensureDir(PROJECT_DIR);
        // Copy template to project directory
        await fs.copy(templatePath, STATUS_FILE);
        // Copy schema to project directory if it exists
        if (await fs.pathExists(schemaPath)) {
          await fs.copy(schemaPath, targetSchemaPath);
        }
      } else {
        throw new Error(`Framework status file not found at ${STATUS_FILE} and template not found at ${templatePath}.`);
      }
    }

    const data = await fs.readFile(STATUS_FILE, 'utf8');
    const parsed = JSON.parse(data) as FrameworkStatus;
    
    // Update last_updated timestamp
    parsed.last_updated = new Date().toISOString();
    
    return parsed;
  }

  /**
   * Save the framework status
   */
  static async saveStatus(status: FrameworkStatus): Promise<void> {
    status.last_updated = new Date().toISOString();
    await fs.ensureDir(PROJECT_DIR);
    await fs.writeFile(STATUS_FILE, JSON.stringify(status, null, 2), 'utf8');
  }

  /**
   * Load phase definitions
   */
  static async loadPhaseDefinitions(): Promise<PhaseDefinition> {
    if (!await fs.pathExists(PHASES_FILE)) {
      throw new Error(`Phase definitions not found at ${PHASES_FILE}`);
    }

    const data = await fs.readFile(PHASES_FILE, 'utf8');
    return JSON.parse(data) as PhaseDefinition;
  }

  /**
   * Get current phase and step
   */
  static async getCurrentState(): Promise<{ phase: string; step: string; status: FrameworkStatus }> {
    const status = await this.loadStatus();
    return {
      phase: status.current_phase,
      step: status.current_step,
      status
    };
  }

  /**
   * Update step status within a phase
   */
  static async updateStepStatus(
    phaseId: string,
    stepId: string,
    stepStatus: StepState['status'],
    result?: Record<string, unknown> | null,
    error?: string | null
  ): Promise<void> {
    const status = await this.loadStatus();
    
    if (!status.phases[phaseId]) {
      throw new Error(`Phase ${phaseId} not found in status`);
    }

    if (!status.phases[phaseId].steps[stepId]) {
      throw new Error(`Step ${stepId} not found in phase ${phaseId}`);
    }

    const step = status.phases[phaseId].steps[stepId];
    const now = new Date().toISOString();

    step.status = stepStatus;
    
    if (stepStatus === 'running' && !step.started_at) {
      step.started_at = now;
    }
    
    if (stepStatus === 'completed' || stepStatus === 'failed' || stepStatus === 'skipped') {
      step.completed_at = now;
    }
    
    if (result !== undefined) {
      step.result = result;
    }
    
    if (error !== undefined) {
      step.error = error;
    }

    await this.saveStatus(status);
  }

  /**
   * Update phase status
   */
  static async updatePhaseStatus(
    phaseId: string,
    phaseStatus: PhaseState['status']
  ): Promise<void> {
    const status = await this.loadStatus();
    
    if (!status.phases[phaseId]) {
      throw new Error(`Phase ${phaseId} not found in status`);
    }

    const phase = status.phases[phaseId];
    const now = new Date().toISOString();

    phase.status = phaseStatus;

    if (phaseStatus === 'running' && !phase.started_at) {
      phase.started_at = now;
    }

    if (phaseStatus === 'completed' || phaseStatus === 'failed' || phaseStatus === 'skipped') {
      phase.completed_at = now;
    }

    await this.saveStatus(status);
  }

  /**
   * Advance to next step or phase
   */
  static async advanceState(forceNextPhase: boolean = false): Promise<{ phase: string; step: string; isNewPhase: boolean }> {
    const status = await this.loadStatus();
    const phases = await this.loadPhaseDefinitions();

    const currentPhase = phases.phases.find(p => p.id === status.current_phase);
    if (!currentPhase) {
      throw new Error(`Current phase ${status.current_phase} not found in definitions`);
    }

    const currentStep = currentPhase.steps.find(s => s.id === status.current_step);
    if (!currentStep) {
      throw new Error(`Current step ${status.current_step} not found in phase ${status.current_phase}`);
    }

    // Check if there's a next step in current phase (unless forced to next phase)
    if (currentStep.next_step && !forceNextPhase) {
      status.current_step = currentStep.next_step;
      status.current_layer = this.getLayerForPhase(status.current_phase);
      await this.saveStatus(status);
      return { phase: status.current_phase, step: status.current_step, isNewPhase: false };
    }

    // Move to next phase
    const currentPhaseIndex = phases.phases.findIndex(p => p.id === status.current_phase);
    if (currentPhaseIndex + 1 < phases.phases.length) {
      const nextPhase = phases.phases[currentPhaseIndex + 1];
      
      // Mark current phase as completed
      await this.updatePhaseStatus(status.current_phase, 'completed');
      
      // Move to next phase
      status.current_phase = nextPhase.id;
      status.current_step = nextPhase.steps[0].id;
      status.current_layer = this.getLayerForPhase(status.current_phase);
      await this.updatePhaseStatus(status.current_phase, 'running');
      
      await this.saveStatus(status);
      return { phase: status.current_phase, step: status.current_step, isNewPhase: true };
    }

    // End of workflow
    status.status = 'completed';
    status.current_layer = null;
    await this.saveStatus(status);
    return { phase: status.current_phase, step: status.current_step, isNewPhase: false };
  }

  /**
   * Rollback to the logically previous step
   */
  static async rollbackPreviousStep(): Promise<void> {
    const status = await this.loadStatus();
    const phases = await this.loadPhaseDefinitions();

    const currentPhaseIndex = phases.phases.findIndex(p => p.id === status.current_phase);
    if (currentPhaseIndex === -1) {
      throw new Error(`Current phase ${status.current_phase} not found in definitions`);
    }

    const currentPhase = phases.phases[currentPhaseIndex];
    const currentStepIndex = currentPhase.steps.findIndex(s => s.id === status.current_step);
    if (currentStepIndex === -1) {
      throw new Error(`Current step ${status.current_step} not found`);
    }

    let targetPhase = currentPhase;
    let targetStep = currentPhase.steps[currentStepIndex - 1];

    if (currentStepIndex === 0) {
      // Need to go to previous phase
      if (currentPhaseIndex > 0) {
        targetPhase = phases.phases[currentPhaseIndex - 1];
        targetStep = targetPhase.steps[targetPhase.steps.length - 1];
      } else {
        throw new Error('Already at the very first step, cannot rollback further');
      }
    }

    // Reset current step
    status.phases[currentPhase.id].steps[currentPhase.steps[currentStepIndex].id].status = 'pending';
    status.phases[currentPhase.id].steps[currentPhase.steps[currentStepIndex].id].result = null;

    // Reset target step
    status.phases[targetPhase.id].steps[targetStep.id].status = 'pending';
    status.phases[targetPhase.id].steps[targetStep.id].result = null;

    if (currentStepIndex === 0 && currentPhaseIndex > 0) {
      status.phases[currentPhase.id].status = 'pending';
      status.phases[targetPhase.id].status = 'running';
    }

    status.current_phase = targetPhase.id;
    status.current_step = targetStep.id;
    status.current_layer = this.getLayerForPhase(targetPhase.id);

    await this.saveStatus(status);
  }

  /**
   * Record an error
   */
  static async recordError(phase: string, step: string, message: string): Promise<void> {
    const status = await this.loadStatus();
    
    const error: FrameworkError = {
      phase,
      step,
      message,
      timestamp: new Date().toISOString()
    };

    status.errors.push(error);
    await this.saveStatus(status);
  }

  /**
   * Get phase and step by ID
   */
  static async getPhaseAndStep(phaseId: string, stepId: string): Promise<{ phase: Phase; step: Step }> {
    const phases = await this.loadPhaseDefinitions();
    
    const phase = phases.phases.find(p => p.id === phaseId);
    if (!phase) {
      throw new Error(`Phase ${phaseId} not found`);
    }

    const step = phase.steps.find(s => s.id === stepId);
    if (!step) {
      throw new Error(`Step ${stepId} not found in phase ${phaseId}`);
    }

    return { phase, step };
  }

  /**
   * Check if a phase should be skipped based on project type
   */
  static async shouldSkipPhase(phaseId: string): Promise<boolean> {
    const status = await this.loadStatus();
    
    // Check status metadata for explicit skip/un-skip first
    if (status.metadata?.skipped_phases) {
      if (status.metadata.skipped_phases.includes(phaseId)) {
        return true;
      }
      
      // Special case: If we are explicitly in the initialization phase, don't skip it 
      // even if it's a continue_project, to allow the fast-track steps to run.
      if (phaseId === 'project_initialization' && status.current_phase === 'project_initialization') {
        return false;
      }
    }

    const phases = await this.loadPhaseDefinitions();

    if (!status.project_type || !phases.project_types) {
      return false;
    }

    const projectType = phases.project_types[status.project_type];
    if (!projectType) {
      return false;
    }

    return projectType.skip_phases.includes(phaseId);
  }

  private static getLayerForPhase(phaseId: string): FrameworkStatus['current_layer'] {
    if (phaseId === 'development') {
      return 'ticket';
    }
    if (phaseId === 'epic_hardening') {
      return 'epic';
    }
    if (phaseId === 'pi_hardening' || phaseId === 'uat') {
      return 'pi';
    }
    return null;
  }

  /**
   * Calculate and update metrics
   */
  static async updateMetrics(): Promise<void> {
    const status = await this.loadStatus();
    const phases = await this.loadPhaseDefinitions();

    let completedPhases = 0;
    let completedSteps = 0;
    let totalSteps = 0;

    for (const phase of phases.phases) {
      const phaseState = status.phases[phase.id];
      if (phaseState?.status === 'completed') {
        completedPhases++;
      }

      for (const step of phase.steps) {
        totalSteps++;
        const stepState = phaseState?.steps[step.id];
        if (stepState?.status === 'completed') {
          completedSteps++;
        }
      }
    }

    status.metrics = {
      total_phases: phases.phases.length,
      completed_phases: completedPhases,
      total_steps: totalSteps,
      completed_steps: completedSteps,
      started_at: status.phases[phases.phases[0].id]?.started_at || null,
      estimated_completion: null // Could be calculated based on average phase times
    };

    await this.saveStatus(status);
  }

  /**
   * Reset framework to initial state
   */
  static async reset(): Promise<void> {
    const phases = await this.loadPhaseDefinitions();
    const existingStatus = await this.loadStatus().catch(() => null as FrameworkStatus | null);
    const initialPhase = phases.phases[0];
    const initialStep = initialPhase.steps[0];

    const now = new Date().toISOString();

    const resetPhases: FrameworkStatus['phases'] = {};
    for (const phase of phases.phases) {
      resetPhases[phase.id] = {
        status: 'pending',
        started_at: null,
        completed_at: null,
        steps: {}
      };

      for (const step of phase.steps) {
        resetPhases[phase.id].steps[step.id] = {
          status: 'pending',
          started_at: null,
          completed_at: null,
          result: null,
          error: null
        };
      }
    }

    const newStatus: FrameworkStatus = {
      framework_version: phases.framework_version,
      last_updated: now,
      current_phase: initialPhase.id,
      current_step: initialStep.id,
      current_layer: null,
      status: 'pending',
      mode: existingStatus?.mode || 'full',
      installation_type: existingStatus?.installation_type || 'normal',
      project_type: existingStatus?.project_type || null,
      project_name: existingStatus?.project_name || null,
      current_ticket_id: null,
      current_epic_id: null,
      current_pi_id: null,
      current_track: null,
      phases: resetPhases,
      metrics: {
        total_phases: phases.phases.length,
        completed_phases: 0,
        total_steps: phases.phases.reduce((acc, p) => acc + p.steps.length, 0),
        completed_steps: 0,
        started_at: null,
        estimated_completion: null
      },
      errors: [],
      metadata: {
        last_action: null,
        last_action_result: null,
        user_approvals_required: [],
        user_approvals_granted: [],
        skipped_phases: [],
        custom_data: {}
      }
    };

    await this.saveStatus(newStatus);
  }
}
