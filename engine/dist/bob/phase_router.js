"use strict";
/**
 * Bob Phase Router
 *
 * Navigates the phase/step workflow and determines next actions.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BobPhaseRouter = void 0;
const state_manager_1 = require("./state_manager");
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
class BobPhaseRouter {
    /**
     * Get current phase and step with navigation context
     */
    static async getCurrentPosition() {
        const { phase: phaseId, step: stepId } = await state_manager_1.BobStateManager.getCurrentState();
        const phases = await state_manager_1.BobStateManager.loadPhaseDefinitions();
        const phaseIndex = phases.phases.findIndex(p => p.id === phaseId);
        const phase = phases.phases[phaseIndex];
        if (!phase) {
            throw new Error(`Phase ${phaseId} not found in definitions`);
        }
        const stepIndex = phase.steps.findIndex(s => s.id === stepId);
        const step = phase.steps[stepIndex];
        if (!step) {
            throw new Error(`Step ${stepId} not found in phase ${phaseId}`);
        }
        const isFirstStep = stepIndex === 0;
        const isLastStep = stepIndex === phase.steps.length - 1;
        const isLastPhase = phaseIndex === phases.phases.length - 1;
        // Determine next step
        let nextStep = null;
        if (!isLastStep) {
            nextStep = phase.steps[stepIndex + 1].id;
        }
        // Determine next phase
        let nextPhase = null;
        if (!isLastPhase) {
            nextPhase = phases.phases[phaseIndex + 1].id;
        }
        return {
            phase,
            step,
            isFirstStep,
            isLastStep,
            isLastPhase,
            nextStep,
            nextPhase
        };
    }
    /**
     * Check if current step requires user input
     */
    static async requiresUserInput() {
        const { phase, step } = await this.getCurrentPosition();
        return !!step.user_input_required;
    }
    /**
     * Get the required action for current step
     */
    static async getRequiredAction() {
        const { step } = await this.getCurrentPosition();
        return step.required_action || '';
    }
    /**
     * Validate that we can transition to the next step/phase
     */
    static async canAdvance() {
        const status = await state_manager_1.BobStateManager.loadStatus();
        const position = await this.getCurrentPosition();
        // If project type requests this phase to be skipped, allow advancing so skipCurrentPhase can run
        try {
            const shouldSkip = await state_manager_1.BobStateManager.shouldSkipPhase(position.phase.id);
            if (shouldSkip) {
                return { canAdvance: true };
            }
        }
        catch {
            // ignore errors from shouldSkipPhase
        }
        if (position.step.user_input_required && status.status !== 'waiting_user') {
            return {
                canAdvance: false,
                reason: 'User input required before advancing'
            };
        }
        // Check if step is already running
        const stepState = status.phases[position.phase.id].steps[position.step.id];
        if (stepState.status === 'running') {
            return {
                canAdvance: false,
                reason: 'Step is currently running'
            };
        }
        // Enforce layer preconditions when entering hardening phases
        if (position.phase.id === 'epic_hardening' && position.isFirstStep) {
            const gate = await this.checkEpicHardeningGate();
            if (!gate.canAdvance) {
                return gate;
            }
        }
        if (position.phase.id === 'pi_hardening' && position.isFirstStep) {
            const gate = await this.checkPiHardeningGate();
            if (!gate.canAdvance) {
                return gate;
            }
        }
        // Check if we're at the end
        if (position.isLastStep && position.isLastPhase) {
            return {
                canAdvance: false,
                reason: 'Workflow is complete'
            };
        }
        return { canAdvance: true };
    }
    /**
     * Jump to a specific phase and step
     */
    static async jumpTo(phaseId, stepId) {
        const phases = await state_manager_1.BobStateManager.loadPhaseDefinitions();
        const status = await state_manager_1.BobStateManager.loadStatus();
        const phase = phases.phases.find(p => p.id === phaseId);
        if (!phase) {
            throw new Error(`Phase ${phaseId} not found`);
        }
        const targetStepId = stepId || phase.steps[0].id;
        const step = phase.steps.find(s => s.id === targetStepId);
        if (!step) {
            throw new Error(`Step ${targetStepId} not found in phase ${phaseId}`);
        }
        status.current_phase = phaseId;
        status.current_step = targetStepId;
        status.status = 'pending';
        await state_manager_1.BobStateManager.saveStatus(status);
    }
    /**
     * Skip the current phase if it's skippable
     */
    static async skipCurrentPhase() {
        const { phase } = await this.getCurrentPosition();
        // Allow skipping if the phase is marked skippable OR the project type requests skipping
        const shouldSkipByProject = await (async () => {
            try {
                return await state_manager_1.BobStateManager.shouldSkipPhase(phase.id);
            }
            catch {
                return false;
            }
        })();
        if (!phase.skippable && !shouldSkipByProject) {
            return false;
        }
        const phases = await state_manager_1.BobStateManager.loadPhaseDefinitions();
        const status = await state_manager_1.BobStateManager.loadStatus();
        const phaseIndex = phases.phases.findIndex(p => p.id === phase.id);
        if (phaseIndex + 1 >= phases.phases.length) {
            return false;
        }
        const nextPhase = phases.phases[phaseIndex + 1];
        // Mark current phase as skipped
        await state_manager_1.BobStateManager.updatePhaseStatus(phase.id, 'skipped');
        // Move to next phase
        status.current_phase = nextPhase.id;
        status.current_step = nextPhase.steps[0].id;
        status.metadata.skipped_phases.push(phase.id);
        await state_manager_1.BobStateManager.saveStatus(status);
        return true;
    }
    /**
     * Get all steps in current phase
     */
    static async getPhaseSteps(phaseId) {
        const phases = await state_manager_1.BobStateManager.loadPhaseDefinitions();
        const status = await state_manager_1.BobStateManager.loadStatus();
        const targetPhaseId = phaseId || status.current_phase;
        const phase = phases.phases.find(p => p.id === targetPhaseId);
        if (!phase) {
            throw new Error(`Phase ${targetPhaseId} not found`);
        }
        return phase.steps;
    }
    /**
     * Get phase definition by ID
     */
    static async getPhase(phaseId) {
        const phases = await state_manager_1.BobStateManager.loadPhaseDefinitions();
        const status = await state_manager_1.BobStateManager.loadStatus();
        const targetPhaseId = phaseId || status.current_phase;
        const phase = phases.phases.find(p => p.id === targetPhaseId);
        if (!phase) {
            throw new Error(`Phase ${targetPhaseId} not found`);
        }
        return phase;
    }
    /**
     * Gate: before running Epic Hardening, ensure all tickets meet Layer 1 baseline.
     * Uses ticket metadata flags for implementation/tests/approval.
     */
    static async checkEpicHardeningGate() {
        const rootDir = path_1.default.resolve(__dirname, '../../..');
        const epicsDir = path_1.default.join(rootDir, 'web-applications', 'project-management', 'epics');
        if (!await fs_extra_1.default.pathExists(epicsDir)) {
            return {
                canAdvance: false,
                reason: 'No epics directory found for Epic Hardening'
            };
        }
        const epics = await fs_extra_1.default.readdir(epicsDir);
        const issues = [];
        for (const epic of epics) {
            const epicPath = path_1.default.join(epicsDir, epic);
            const stat = await fs_extra_1.default.stat(epicPath);
            if (!stat.isDirectory() || epic.includes('template')) {
                continue;
            }
            const ticketsDir = path_1.default.join(epicPath, 'tickets');
            if (!await fs_extra_1.default.pathExists(ticketsDir)) {
                continue;
            }
            const tickets = await fs_extra_1.default.readdir(ticketsDir);
            for (const ticket of tickets) {
                const ticketDir = path_1.default.join(ticketsDir, ticket);
                const ticketStat = await fs_extra_1.default.stat(ticketDir).catch(() => null);
                if (!ticketStat || !ticketStat.isDirectory()) {
                    continue;
                }
                const metaFile = path_1.default.join(ticketDir, 'metadata.json');
                if (!await fs_extra_1.default.pathExists(metaFile)) {
                    issues.push(`Missing metadata.json for ticket ${ticket} in epic ${epic}`);
                    continue;
                }
                try {
                    const raw = await fs_extra_1.default.readFile(metaFile, 'utf8');
                    const meta = JSON.parse(raw);
                    const implementationDone = meta.implementation_done === true;
                    const testsDone = meta.tests_done === true;
                    const approved = meta.approved === true;
                    if (!implementationDone || !testsDone || !approved) {
                        issues.push(`Ticket ${ticket} in epic ${epic} not ready: ` +
                            `implementation_done=${implementationDone}, tests_done=${testsDone}, approved=${approved}`);
                    }
                }
                catch {
                    issues.push(`Invalid metadata.json for ticket ${ticket} in epic ${epic}`);
                }
            }
        }
        if (issues.length > 0) {
            return {
                canAdvance: false,
                reason: `Epic Hardening gate failed: ${issues[0]}`
            };
        }
        return { canAdvance: true };
    }
    /**
     * Gate: before running PI Hardening, ensure all epics are approved for release.
     */
    static async checkPiHardeningGate() {
        const rootDir = path_1.default.resolve(__dirname, '../../..');
        const epicsDir = path_1.default.join(rootDir, 'web-applications', 'project-management', 'epics');
        if (!await fs_extra_1.default.pathExists(epicsDir)) {
            return {
                canAdvance: false,
                reason: 'No epics directory found for PI Hardening'
            };
        }
        const epics = await fs_extra_1.default.readdir(epicsDir);
        const issues = [];
        for (const epic of epics) {
            const epicPath = path_1.default.join(epicsDir, epic);
            const stat = await fs_extra_1.default.stat(epicPath);
            if (!stat.isDirectory() || epic.includes('template')) {
                continue;
            }
            const metaFile = path_1.default.join(epicPath, 'epic_metadata.json');
            if (!await fs_extra_1.default.pathExists(metaFile)) {
                issues.push(`Missing epic_metadata.json for epic ${epic}`);
                continue;
            }
            try {
                const raw = await fs_extra_1.default.readFile(metaFile, 'utf8');
                const meta = JSON.parse(raw);
                const approved = meta.approved_for_release === true;
                if (!approved) {
                    issues.push(`Epic ${epic} not approved for release (approved_for_release=${approved})`);
                }
            }
            catch {
                issues.push(`Invalid epic_metadata.json for epic ${epic}`);
            }
        }
        if (issues.length > 0) {
            return {
                canAdvance: false,
                reason: `PI Hardening gate failed: ${issues[0]}`
            };
        }
        return { canAdvance: true };
    }
    /**
     * Get workflow progress percentage
     */
    static async getProgress() {
        const status = await state_manager_1.BobStateManager.loadStatus();
        const phases = await state_manager_1.BobStateManager.loadPhaseDefinitions();
        let stepsCompleted = 0;
        let stepsTotal = 0;
        for (const phase of phases.phases) {
            const phaseState = status.phases[phase.id];
            for (const step of phase.steps) {
                stepsTotal++;
                const stepState = phaseState?.steps[step.id];
                if (stepState?.status === 'completed' || stepState?.status === 'skipped') {
                    stepsCompleted++;
                }
            }
        }
        const phasesCompleted = phases.phases.filter(p => status.phases[p.id]?.status === 'completed' ||
            status.phases[p.id]?.status === 'skipped').length;
        const percentage = stepsTotal > 0 ? Math.round((stepsCompleted / stepsTotal) * 100) : 0;
        return {
            percentage,
            phasesCompleted,
            phasesTotal: phases.phases.length,
            stepsCompleted,
            stepsTotal
        };
    }
}
exports.BobPhaseRouter = BobPhaseRouter;
