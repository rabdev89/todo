import { StateManager } from './state_manager';
import { PHASE_REGISTRY, getNextPhase, PhaseType } from './phase_registry';
import { ValidationRunner } from './validation_runner';
import { ResearcherAgent } from './agents/researcher_agent';
import { PlannerAgent } from './agents/planner_agent';
import { ExecutorAgent } from './agents/executor_agent';
import { VerifierAgent } from './agents/verifier_agent';
import { DesignAgent } from './agents/design_agent';

export class PhaseRunner {
    /**
     * Executes the next logical phase for a ticket based on its current state.
     * This orchestrates the lifecycle progression.
     * @param ticketId The ticket ID
     * @param depth Recursion depth to prevent infinite loops
     */
    static async advanceTicket(ticketId: string, depth: number = 0): Promise<void> {
        if (depth > 5) {
            console.warn(`[Engine] Maximum recursion depth reached for ${ticketId}. Stopping autonomous advancement.`);
            return;
        }

        const metadata = await StateManager.getMetadata(ticketId);
        
        let currentPhase = metadata.current_phase as PhaseType;
        if (!currentPhase) {
            currentPhase = PhaseType.REQUIREMENTS;
            await StateManager.updateMetadata(ticketId, { current_phase: currentPhase });
        }

        if (currentPhase === PhaseType.DONE || metadata.status === 'completed') {
            console.log(`[Engine] Ticket ${ticketId} is already DONE.`);
            return;
        }

        console.log(`[Engine] Ticket ${ticketId} is currently in phase: ${currentPhase}`);
        const phaseDef = PHASE_REGISTRY[currentPhase];

        // 1. Validation Hooks
        if (phaseDef.id === PhaseType.VALIDATE) {
            console.log(`[Engine] Running rigorous circuit-breaker validations for ${ticketId}...`);
            const result = await ValidationRunner.runVerification(ticketId);
            
            if (!result.passed) {
                console.error(`[Engine] Validation block failed for ${ticketId}. Reverting back to IMPLEMENT phase.`);
                console.log(`[Engine] Validation Output:\n${result.output}`);
                
                // Return ticket back to implementation phase to try fixing the bugs
                await StateManager.updateMetadata(ticketId, { current_phase: PhaseType.IMPLEMENT });
                
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
                case PhaseType.REQUIREMENTS:
                    console.log(`[Agent] Requirements phase detected.`);
                    console.log(`AI ACTION REQUIRED: Please generate the requirements/README.md for ${ticketId} based on the PRD and Epic Backlog.`);
                    return; 
                case PhaseType.DESIGN:
                    const researcher = new ResearcherAgent();
                    const researchPath = await researcher.generateResearchFile(ticketId);
                    console.log(`[Agent] Researcher completed: ${researchPath}`);

                    const planner = new PlannerAgent();
                    const planResult = await planner.planTicket(ticketId);
                    console.log(`[Agent] Planner completed: ${planResult.blueprintPath}`);

                    const designer = new DesignAgent();
                    const designPath = await designer.generateDesignFile(ticketId);
                    console.log(`[Agent] Designer completed: ${designPath}`);
                    
                    await StateManager.updateMetadata(ticketId, { 
                        design_done: true,
                        ai_scoped: true 
                    });
                    break;
                case PhaseType.IMPLEMENT:
                    const executor = new ExecutorAgent();
                    const execResult = await executor.executeTicket(ticketId);
                    console.log(`[Agent] Executor completed: ${execResult.recordPath}`);
                    await StateManager.updateMetadata(ticketId, { 
                        implementation_done: true 
                    });
                    break;
                case PhaseType.VALIDATE:
                    const verifier = new VerifierAgent();
                    const verifyResult = await verifier.verifyTicket(ticketId);
                    console.log(`[Agent] Verifier completed: ${verifyResult.verificationPath}`);
                    await StateManager.updateMetadata(ticketId, { 
                        tests_done: true 
                    });
                    break;
            }
        } catch (error: any) {
            console.error(`[Engine] Agent execution failed for ${ticketId}:`, error.message);
            return;
        }

        console.log(`======================================================\n`);

        // 3. State Advancement
        const nextPhase = getNextPhase(currentPhase, metadata.ticket_type);
        if (nextPhase) {
            console.log(`[Engine State] Transitioning ticket ${ticketId}: ${currentPhase} -> ${nextPhase}`);
            await StateManager.updateMetadata(ticketId, { current_phase: nextPhase });
            
            // Recursive call for Zero-Touch flow
            console.log(`[Engine Core] ⚡ Continuing to next phase autonomously...\n`);
            return this.advanceTicket(ticketId, depth + 1);
        } else {
            console.log(`[Engine State] Ticket ${ticketId} has reached the end of the SDLC.`);
            await StateManager.updateMetadata(ticketId, { status: 'completed', current_phase: PhaseType.DONE, implementation_done: true });
        }
    }
}
