"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PhaseRunner = void 0;
const state_manager_1 = require("./state_manager");
const phase_registry_1 = require("./phase_registry");
const validation_runner_1 = require("./validation_runner");
const researcher_agent_1 = require("./agents/researcher_agent");
const planner_agent_1 = require("./agents/planner_agent");
const executor_agent_1 = require("./agents/executor_agent");
const verifier_agent_1 = require("./agents/verifier_agent");
const design_agent_1 = require("./agents/design_agent");
class PhaseRunner {
    /**
     * Executes the next logical phase for a ticket based on its current state.
     * This orchestrates the lifecycle progression.
     * @param ticketId The ticket ID
     * @param depth Recursion depth to prevent infinite loops
     */
    static async advanceTicket(ticketId, depth = 0) {
        if (depth > 5) {
            console.warn(`[Engine] Maximum recursion depth reached for ${ticketId}. Stopping autonomous advancement.`);
            return;
        }
        const metadata = await state_manager_1.StateManager.getMetadata(ticketId);
        let currentPhase = metadata.current_phase;
        if (!currentPhase) {
            currentPhase = phase_registry_1.PhaseType.REQUIREMENTS;
            await state_manager_1.StateManager.updateMetadata(ticketId, { current_phase: currentPhase });
        }
        if (currentPhase === phase_registry_1.PhaseType.DONE || metadata.status === 'completed') {
            console.log(`[Engine] Ticket ${ticketId} is already DONE.`);
            return;
        }
        console.log(`[Engine] Ticket ${ticketId} is currently in phase: ${currentPhase}`);
        const phaseDef = phase_registry_1.PHASE_REGISTRY[currentPhase];
        // 1. Validation Hooks
        if (phaseDef.id === phase_registry_1.PhaseType.VALIDATE) {
            console.log(`[Engine] Running rigorous circuit-breaker validations for ${ticketId}...`);
            const result = await validation_runner_1.ValidationRunner.runVerification(ticketId);
            if (!result.passed) {
                console.error(`[Engine] Validation block failed for ${ticketId}. Reverting back to IMPLEMENT phase.`);
                console.log(`[Engine] Validation Output:\n${result.output}`);
                // Return ticket back to implementation phase to try fixing the bugs
                await state_manager_1.StateManager.updateMetadata(ticketId, { current_phase: phase_registry_1.PhaseType.IMPLEMENT });
                if (result.circuitBreakerTriggered) {
                    console.error(`[Engine] CIRCUIT BREAKER TRIGGERED! Human intervention required.`);
                }
                return;
            }
            console.log(`[Engine] Validation passed!`);
        }
        // 2. AI Agent Invocation
        console.log(`\n======================================================`);
        console.log(`[Engine Hook] 🤖 INVOKING AUTONOMOUS AGENT: ${currentPhase.toUpperCase()}`);
        console.log(`======================================================`);
        try {
            switch (currentPhase) {
                case phase_registry_1.PhaseType.REQUIREMENTS:
                    console.log(`[Agent] Requirements phase detected.`);
                    console.log(`AI ACTION REQUIRED: Please generate the requirements/README.md for ${ticketId} based on the PRD and Epic Backlog.`);
                    return;
                case phase_registry_1.PhaseType.DESIGN:
                    const researcher = new researcher_agent_1.ResearcherAgent();
                    const researchPath = await researcher.generateResearchFile(ticketId);
                    console.log(`[Agent] Researcher completed: ${researchPath}`);
                    const planner = new planner_agent_1.PlannerAgent();
                    const planResult = await planner.planTicket(ticketId);
                    console.log(`[Agent] Planner completed: ${planResult.blueprintPath}`);
                    const designer = new design_agent_1.DesignAgent();
                    const designPath = await designer.generateDesignFile(ticketId);
                    console.log(`[Agent] Designer completed: ${designPath}`);
                    await state_manager_1.StateManager.updateMetadata(ticketId, {
                        design_done: true,
                        ai_scoped: true
                    });
                    break;
                case phase_registry_1.PhaseType.IMPLEMENT:
                    const executor = new executor_agent_1.ExecutorAgent();
                    const execResult = await executor.executeTicket(ticketId);
                    console.log(`[Agent] Executor completed: ${execResult.recordPath}`);
                    await state_manager_1.StateManager.updateMetadata(ticketId, {
                        implementation_done: true
                    });
                    break;
                case phase_registry_1.PhaseType.VALIDATE:
                    const verifier = new verifier_agent_1.VerifierAgent();
                    const verifyResult = await verifier.verifyTicket(ticketId);
                    console.log(`[Agent] Verifier completed: ${verifyResult.verificationPath}`);
                    await state_manager_1.StateManager.updateMetadata(ticketId, {
                        tests_done: true
                    });
                    break;
            }
        }
        catch (error) {
            console.error(`[Engine] Agent execution failed for ${ticketId}:`, error.message);
            return;
        }
        console.log(`======================================================\n`);
        // 3. State Advancement
        const nextPhase = (0, phase_registry_1.getNextPhase)(currentPhase, metadata.ticket_type);
        if (nextPhase) {
            console.log(`[Engine State] Transitioning ticket ${ticketId}: ${currentPhase} -> ${nextPhase}`);
            await state_manager_1.StateManager.updateMetadata(ticketId, { current_phase: nextPhase });
            // Recursive call for Zero-Touch flow
            console.log(`[Engine Core] ⚡ Continuing to next phase autonomously...\n`);
            return this.advanceTicket(ticketId, depth + 1);
        }
        else {
            console.log(`[Engine State] Ticket ${ticketId} has reached the end of the SDLC.`);
            await state_manager_1.StateManager.updateMetadata(ticketId, { status: 'completed', current_phase: phase_registry_1.PhaseType.DONE, implementation_done: true });
        }
    }
}
exports.PhaseRunner = PhaseRunner;
