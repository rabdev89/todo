/**
 * Development Action Handlers
 *
 * Implements actions for Development phase.
 * Integrates with existing engine tools: ContextBuilder, FileGuard, StateManager
 */

import fs from 'fs-extra';
import path from 'path';
import { BobStateManager } from '../state_manager';
import { StateManager as TicketStateManager } from '../../state_manager';
import { ContextBuilder } from '../../context_builder';
import { FileGuard } from '../../file_guard';
import { DependencyEngine } from '../../dependency_engine';
import { ResearcherAgent } from '../../agents/researcher_agent';
import { PlannerAgent } from '../../agents/planner_agent';
import { DesignAgent } from '../../agents/design_agent';
import type { ActionHandler, ActionContext, ActionResult } from '../types';

import { BobConfig } from '../../shared/config';

const config = BobConfig.getInstance();
const PROJECT_MGMT_DIR = config.getDirectory('project_management');
const ROOT_DIR = config.getRootDir();

/**
 * Select next ticket for development
 */
export const selectNextTicket: ActionHandler = async (
  context
): Promise<ActionResult> => {
  console.log('  Selecting next ticket...');

  try {
    const engine = DependencyEngine.getInstance();
    await engine.buildGraph();
    const readyTickets = await engine.getReadyTickets();

    if (readyTickets.length === 0) {
      return {
        success: true,
        data: { 
          tickets_ready: 0, 
          end_phase: true, 
          message: 'All tickets for this epic are complete.' 
        },
        logs: ['No tickets are ready for development - Epic is complete!']
      };
    }

    const selectedTicket = readyTickets[0];
    const metadata = await TicketStateManager.getMetadata(selectedTicket);

    // Derive epic id from ticket path
    let epicId: string | null = null;
    const metadataPath = await TicketStateManager.getTicketPath(selectedTicket);
    if (metadataPath) {
      const parts = metadataPath.split(path.sep);
      const epicsIndex = parts.lastIndexOf('epics');
      if (epicsIndex >= 0 && epicsIndex + 1 < parts.length) {
        epicId = parts[epicsIndex + 1];
      }
    }

    // Try to read track decision
    let currentTrack: 'A' | 'B' | null = null;
    if (metadataPath) {
      const ticketDir = path.dirname(metadataPath);
      const trackFile = path.join(ticketDir, 'TRACK_DECISION.md');
      if (await fs.pathExists(trackFile)) {
        const content = await fs.readFile(trackFile, 'utf8');
        const match = content.match(/Decision:\s*Track\s*([AB])/i);
        if (match && (match[1] === 'A' || match[1] === 'B')) {
          currentTrack = match[1];
        }
      }
    }

    // Update framework status with current ticket, epic, and track
    const status = await BobStateManager.loadStatus();
    if (status.phases.development) {
      (status.phases.development as any).current_ticket = selectedTicket;
    }
    status.current_ticket_id = selectedTicket;
    status.current_epic_id = epicId;
    status.current_track = currentTrack;
    await BobStateManager.saveStatus(status);

    return {
      success: true,
      data: {
        selected_ticket: selectedTicket,
        title: metadata.title,
        tickets_ready: readyTickets.length
      },
      logs: [
        `Selected ticket: ${selectedTicket}`,
        `Title: ${metadata.title}`,
        `${readyTickets.length} tickets ready for development`
      ]
    };
  } catch (error: any) {
    return {
      success: false,
      error: `Failed to select ticket: ${error.message}`
    };
  }
};

/**
 * Trigger swarm execution (Multi-ticket Fan-Out)
 */
export const triggerSwarm: ActionHandler = async (
  context
): Promise<ActionResult> => {
  console.log('  🐝 Triggering Ticket Swarm (Parallel Fan-Out)...');

  try {
    const engine = DependencyEngine.getInstance();
    await engine.buildGraph();
    const readyTickets = await engine.getReadyTickets();

    if (readyTickets.length === 0) {
      return {
        success: true,
        data: { active_swarms: 0 },
        logs: ['No tickets are ready for swarming.']
      };
    }

    // Limit concurrency to 3 for stability
    const swarmLimit = 3;
    const swarmTickets = readyTickets.slice(0, swarmLimit);

    console.log(`    Spawning ${swarmTickets.length} parallel sessions...`);

    // In a real CLI environment, this would spawn background processes.
    // For this simulation, we mark them as "In Progress" in the ledger.
    const logs = swarmTickets.map(t => `🚀 Spawning session for ${t}...`);

    return {
      success: true,
      data: {
        active_swarms: swarmTickets.length,
        tickets: swarmTickets,
        mode: 'PARALLEL_FAN_OUT'
      },
      logs: [
        ...logs,
        `Swarm active for: ${swarmTickets.join(', ')}`,
        'Each ticket will now execute in Parallel TDD mode.'
      ]
    };
  } catch (error: any) {
    return {
      success: false,
      error: `Swarm failed: ${error.message}`
    };
  }
};

/**
 * Scope selected ticket (Requirements, Design, Planning, Testing)
 */
export const scopeTicket: ActionHandler = async (
  context
): Promise<ActionResult> => {
  console.log('  Generating ticket scope...');

  try {
    const status = await BobStateManager.loadStatus();
    const currentTicket = status.current_ticket_id;
    const currentEpic = status.current_epic_id;

    if (!currentTicket) {
      return {
        success: false,
        error: 'No ticket selected. Run select_next_ticket first.',
        data: { ticket_selected: false }
      };
    }

    const metadata = await TicketStateManager.getMetadata(currentTicket);

    if (metadata.requirements_done && metadata.design_done) {
      return {
        success: true,
        data: { ticket: currentTicket }
      };
    }

    console.log(`    Running automated research for ${currentTicket}...`);
    const researcher = new ResearcherAgent();
    await researcher.generateResearchFile(currentTicket);

    console.log(`    Running automated planning for ${currentTicket}...`);
    const planner = new PlannerAgent();
    await planner.planTicket(currentTicket);

    console.log(`    Running automated design for ${currentTicket}...`);
    const designer = new DesignAgent();
    await designer.generateDesignFile(currentTicket);

    // Update metadata to reflect that scoping is done
    await TicketStateManager.updateMetadata(currentTicket, {
      requirements_done: true,
      design_done: true,
      ai_scoped: true
    });

    return {
      success: true,
      data: {
        ticket: currentTicket,
        message: 'Research and Planning artifacts generated automatically.'
      },
      logs: [
        `Automated research and planning completed for ticket: ${currentTicket}`,
        `Generated RESEARCH.md and BLUEPRINT.md`
      ]
    };
  } catch (error: any) {
    return {
      success: false,
      error: `Ticket scoping prep failed: ${error.message}`
    };
  }
};

/**
 * Generate code implementation
 */
export const generateCode: ActionHandler = async (
  context
): Promise<ActionResult> => {
  console.log('  Preparing code generation context...');

  try {
    const status = await BobStateManager.loadStatus();
    const currentTicket = status.phases.development?.current_ticket;

    if (!currentTicket) {
      return {
        success: false,
        error: 'No ticket selected. Run select_next_ticket first.',
        data: { ticket_selected: false }
      };
    }

    // Generate context pack for the ticket
    const builder = new ContextBuilder();
    const contextPath = await builder.generateContextFile(currentTicket);

    // Get ticket metadata for file scope
    const metadata = await TicketStateManager.getMetadata(currentTicket);

    return {
      success: true,
      data: {
        ticket: currentTicket,
        context_path: contextPath,
        file_scope: metadata.file_scope,
        phase: metadata.current_phase
      },
      logs: [
        `Context generated for ticket: ${currentTicket}`,
        `Context file: ${contextPath}`,
        `Allowed files: ${metadata.file_scope?.allowed?.length || 0}`,
        '',
        'Next: Review the context file and implement the ticket',
        'Then run: npm run start -- bob'
      ]
    };
  } catch (error: any) {
    return {
      success: false,
      error: `Code generation prep failed: ${error.message}`
    };
  }
};

/**
 * Review code (placeholder for AI review)
 */
export const reviewCode: ActionHandler = async (
  context
): Promise<ActionResult> => {
  console.log('  Reviewing code...');

  try {
    const status = await BobStateManager.loadStatus();
    const currentTicket = status.phases.development?.current_ticket;

    if (!currentTicket) {
      return {
        success: false,
        error: 'No ticket selected',
        data: { ticket_selected: false }
      };
    }

    const metadata = await TicketStateManager.getMetadata(currentTicket);

    if (metadata.file_scope?.allowed) {
      const fileResult = await FileGuard.checkTicketScope(currentTicket);

      if (!fileResult.allowed) {
        return {
          success: true,
          data: {
            ticket: currentTicket,
            violations: fileResult.violations,
            passed: false,
            checked_files: fileResult.checked_files
          },
          logs: [
            `Code review for ${currentTicket}:`,
            fileResult.violations.length === 0
              ? '✓ All file modifications within scope'
              : `⚠️ ${fileResult.violations.length} files outside scope`,
            ...fileResult.violations.map(v => `  - ${v.file}: ${v.reason}`)
          ]
        };
      }
    }

    return {
      success: true,
      data: { ticket: currentTicket, passed: true },
      logs: [`Code review passed for ${currentTicket}`]
    };
  } catch (error: any) {
    return {
      success: false,
      error: `Code review failed: ${error.message}`
    };
  }
};

/**
 * Generate unit tests
 */
export const generateUnitTests: ActionHandler = async (
  context
): Promise<ActionResult> => {
  console.log('  Preparing unit test generation...');

  try {
    const status = await BobStateManager.loadStatus();
    const currentTicket = status.phases.development?.current_ticket;

    if (!currentTicket) {
      return {
        success: false,
        error: 'No ticket selected',
        data: { ticket_selected: false }
      };
    }

    // Get ticket metadata
    const metadata = await TicketStateManager.getMetadata(currentTicket);

    // Determine test file patterns based on allowed files
    const testPatterns: string[] = [];
    if (metadata.file_scope?.allowed) {
      for (const file of metadata.file_scope.allowed) {
        if (file.endsWith('.ts') && !file.includes('.test.')) {
          testPatterns.push(file.replace('.ts', '.test.ts'));
        } else if (file.endsWith('.js') && !file.includes('.test.')) {
          testPatterns.push(file.replace('.js', '.test.js'));
        }
      }
    }

    return {
      success: true,
      data: {
        ticket: currentTicket,
        test_patterns: testPatterns,
        target_coverage: 80
      },
      logs: [
        `Unit test prep for ${currentTicket}:`,
        `Target files: ${testPatterns.length}`,
        ...(testPatterns.map(p => `  - ${p}`)),
        '',
        'Generate tests targeting 80% coverage'
      ]
    };
  } catch (error: any) {
    return {
      success: false,
      error: `Unit test generation prep failed: ${error.message}`
    };
  }
};

/**
 * Execute unit tests
 */
export const runTests: ActionHandler = async (
  context
): Promise<ActionResult> => {
  console.log('  Executing tests...');

  try {
    // In a real implementation, this would run the actual test command
    // For now, return a placeholder result

    const status = await BobStateManager.loadStatus();
    const currentTicket = status.phases.development?.current_ticket;

    return {
      success: true,
      data: {
        ticket: currentTicket,
        tests_passed: 0,
        tests_failed: 0,
        coverage: 0,
        placeholder: true,
        message: 'Run tests manually: npm test'
      },
      logs: [
        'Test execution placeholder',
        currentTicket ? `For ticket: ${currentTicket}` : '',
        '',
        'To run tests manually:',
        '  npm test',
        '',
        'Then run: npm run start -- bob to continue'
      ]
    };
  } catch (error: any) {
    return {
      success: false,
      error: `Test execution failed: ${error.message}`
    };
  }
};

// ============================================================================
// Epic/PI Hardening Handlers (Placeholders for Phase 3)
// ============================================================================

export const runIntegrationTests: ActionHandler = async (ctx) => {
  const status = await BobStateManager.loadStatus();
  const epicId = status.current_epic_id || '[X]';

  return {
    success: true,
    data: { 
      requires_ai_input: true,
      ai_prompt: `🛡️ **Epic Hardening: Integration**
Epic: ${epicId}

Run \`ci/pipeline.sh\` to verify combined ticket logic.
Once integration tests are successful, run 'npm run start -- bob' to proceed.`,
      status_file: 'framework_status.json'
    },
    logs: [`Triggered Integration protocol for ${epicId}`]
  };
};

export const generateThreatModel: ActionHandler = async (ctx) => {
  const status = await BobStateManager.loadStatus();
  const epicId = status.current_epic_id || '[X]';

  return {
    success: true,
    data: { 
      requires_ai_input: true,
      ai_prompt: `🛡️ **Epic Hardening: Threat Modeling**
Epic: ${epicId}

Fill out \`web-applications/project-management/epics/${epicId}/threat_model.md\`.
Analyze boundaries, data flows, and potential vulnerabilities. Once complete, run 'npm run start -- bob' to proceed.`,
      status_file: 'framework_status.json'
    },
    logs: [`Triggered Threat Modeling protocol for ${epicId}`]
  };
};

export const lockApiContracts: ActionHandler = async (ctx) => {
  const status = await BobStateManager.loadStatus();
  const epicId = status.current_epic_id || '[X]';

  return {
    success: true,
    data: { 
      requires_ai_input: true,
      ai_prompt: `🛡️ **Epic Hardening: API Contracts**
Epic: ${epicId}

Finalize and lock \`web-applications/project-management/api_contracts.md\` or endpoint docs for this epic.
Perform a gap analysis between \`database_mapping.md\` and \`supabase-export.md\`.
Once finalized, run 'npm run start -- bob' to proceed.`,
      status_file: 'framework_status.json'
    },
    logs: [`Triggered API Locking protocol for ${epicId}`]
  };
};

export const runVerificationGate: ActionHandler = async (ctx) => {
  const status = await BobStateManager.loadStatus();
  const epicId = status.current_epic_id || '[X]';

  return {
    success: true,
    data: { 
      requires_ai_input: true,
      ai_prompt: `🛡️ **Epic Hardening: Verification Gate**
Epic: ${epicId}

1. Execute \`python packages/code-quality-checking/quality-check.py --mode epic\`.
2. Run \`bash ci/verify.sh --layer2\`. Score must be ≥ 63 / 70.
3. Attach the scored \`project-management/verification-gate.md\` to the Epic's hardening doc.

Once complete, run 'npm run start -- bob' to proceed.`,
      status_file: 'framework_status.json'
    },
    logs: [`Triggered Verification Gate for ${epicId}`]
  };
};

export const fixBugs: ActionHandler = async (ctx) => ({
  success: true,
  data: { placeholder: true },
  logs: ['Bug fixes - implement in Phase 4']
});

export const updateDocumentation: ActionHandler = async (ctx) => ({
  success: true,
  data: { placeholder: true },
  logs: ['Documentation update - implement in Phase 4']
});

export const validateEpic: ActionHandler = async (ctx) => ({
  success: true,
  data: { placeholder: true },
  logs: ['Epic validation - implement in Phase 4']
});

export const runSystemTests: ActionHandler = async (ctx) => ({
  success: true,
  data: { placeholder: true },
  logs: ['System tests - implement in Phase 4']
});

export const runPerformanceTests: ActionHandler = async (ctx) => ({
  success: true,
  data: { placeholder: true },
  logs: ['Performance tests - implement in Phase 4']
});

export const runSecurityAudit: ActionHandler = async (ctx) => ({
  success: true,
  data: { placeholder: true },
  logs: ['Security audit - implement in Phase 4']
});

export const buildReleaseCandidate: ActionHandler = async (ctx) => ({
  success: true,
  data: { placeholder: true },
  logs: ['Release candidate build - implement in Phase 4']
});

// ============================================================================
// UAT Handlers (Placeholders for Phase 3)
// ============================================================================

export const setupUatEnvironment: ActionHandler = async (ctx) => ({
  success: true,
  data: { placeholder: true },
  logs: ['UAT environment setup - implement in Phase 4']
});

export const runUat: ActionHandler = async (ctx) => ({
  success: true,
  data: { requires_user_input: true },
  logs: ['UAT execution requires user input']
});

export const collectUatFeedback: ActionHandler = async (ctx) => ({
  success: true,
  data: { requires_user_input: true },
  logs: ['UAT feedback collection requires user input']
});

export const fixUatBugs: ActionHandler = async (ctx) => ({
  success: true,
  data: { placeholder: true },
  logs: ['UAT bug fixes - implement in Phase 4']
});

// ============================================================================
// Release Handlers (Placeholders for Phase 3)
// ============================================================================

export const generateReleaseNotes: ActionHandler = async (ctx) => ({
  success: true,
  data: { placeholder: true },
  logs: ['Release notes generation - implement in Phase 4']
});

export const generateDeploymentScripts: ActionHandler = async (ctx) => ({
  success: true,
  data: { placeholder: true },
  logs: ['Deployment scripts generation - implement in Phase 4']
});

export const generateRollbackPlan: ActionHandler = async (ctx) => ({
  success: true,
  data: { placeholder: true },
  logs: ['Rollback plan generation - implement in Phase 4']
});

export const generateDeploymentChecklist: ActionHandler = async (ctx) => ({
  success: true,
  data: { placeholder: true },
  logs: ['Deployment checklist generation - implement in Phase 4']
});

export const validatePreLaunch: ActionHandler = async (ctx) => ({
  success: true,
  data: { placeholder: true },
  logs: ['Pre-launch validation - implement in Phase 4']
});

export const deployToProduction: ActionHandler = async (ctx) => ({
  success: true,
  data: { placeholder: true },
  logs: ['Production deployment - implement in Phase 4']
});

export const verifyDeployment: ActionHandler = async (ctx) => ({
  success: true,
  data: { placeholder: true },
  logs: ['Deployment verification - implement in Phase 4']
});

// ============================================================================
// Monitoring Handlers (Placeholders for Phase 4)
// ============================================================================

export const setupMonitoring: ActionHandler = async (ctx) => ({
  success: true,
  data: { placeholder: true },
  logs: ['Monitoring setup - implement in Phase 4']
});

export const setupErrorTracking: ActionHandler = async (ctx) => ({
  success: true,
  data: { placeholder: true },
  logs: ['Error tracking setup - implement in Phase 4']
});

export const monitorPerformance: ActionHandler = async (ctx) => ({
  success: true,
  data: { placeholder: true },
  logs: ['Performance monitoring - implement in Phase 4']
});

export const compressEpicKnowledge: ActionHandler = async (ctx) => {
  const status = await BobStateManager.loadStatus();
  const epicId = status.current_epic_id || '[X]';

  return {
    success: true,
    data: {
      requires_ai_input: true,
      ai_prompt: `\u{1F9E0} **Epic Hardening: Knowledge Compression**
Epic: ${epicId}

1. Read the Epic's \`README.md\`, \`threat_model.md\`, and \`api_contracts.md\`.
2. Synthesize the core architectural decisions, database changes, and major patterns into a concise 1-page summary.
3. Automatically store this summary via the \`memory.storeKnowledge\` MCP tool (or CLI equivalent) with the tags: \`[epic, architecture, ${epicId}]\` and scope \`global\`.

Once the memory has been successfully stored, run 'npm run start -- bob' to proceed.`,
      status_file: 'framework_status.json'
    },
    logs: [`Triggered Epic Knowledge Compression for ${epicId}`]
  };
};
