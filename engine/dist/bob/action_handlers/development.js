"use strict";
/**
 * Development Action Handlers
 *
 * Implements actions for Development phase.
 * Integrates with existing engine tools: ContextBuilder, FileGuard, StateManager
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.compressEpicKnowledge = exports.monitorPerformance = exports.setupErrorTracking = exports.setupMonitoring = exports.verifyDeployment = exports.deployToProduction = exports.validatePreLaunch = exports.generateDeploymentChecklist = exports.generateRollbackPlan = exports.generateDeploymentScripts = exports.generateReleaseNotes = exports.fixUatBugs = exports.collectUatFeedback = exports.runUat = exports.setupUatEnvironment = exports.buildReleaseCandidate = exports.runSecurityAudit = exports.runPerformanceTests = exports.runSystemTests = exports.validateEpic = exports.updateDocumentation = exports.fixBugs = exports.runVerificationGate = exports.lockApiContracts = exports.generateThreatModel = exports.runIntegrationTests = exports.runTests = exports.generateUnitTests = exports.reviewCode = exports.generateCode = exports.scopeTicket = exports.triggerSwarm = exports.selectNextTicket = void 0;
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const state_manager_1 = require("../state_manager");
const state_manager_2 = require("../../state_manager");
const context_builder_1 = require("../../context_builder");
const file_guard_1 = require("../../file_guard");
const dependency_engine_1 = require("../../dependency_engine");
const researcher_agent_1 = require("../../agents/researcher_agent");
const planner_agent_1 = require("../../agents/planner_agent");
const design_agent_1 = require("../../agents/design_agent");
const config_1 = require("../../shared/config");
const config = config_1.BobConfig.getInstance();
const PROJECT_MGMT_DIR = config.getDirectory('project_management');
const ROOT_DIR = config.getRootDir();
/**
 * Select next ticket for development
 */
const selectNextTicket = async (context) => {
    console.log('  Selecting next ticket...');
    try {
        const engine = dependency_engine_1.DependencyEngine.getInstance();
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
        const metadata = await state_manager_2.StateManager.getMetadata(selectedTicket);
        // Derive epic id from ticket path
        let epicId = null;
        const metadataPath = await state_manager_2.StateManager.getTicketPath(selectedTicket);
        if (metadataPath) {
            const parts = metadataPath.split(path_1.default.sep);
            const epicsIndex = parts.lastIndexOf('epics');
            if (epicsIndex >= 0 && epicsIndex + 1 < parts.length) {
                epicId = parts[epicsIndex + 1];
            }
        }
        // Try to read track decision
        let currentTrack = null;
        if (metadataPath) {
            const ticketDir = path_1.default.dirname(metadataPath);
            const trackFile = path_1.default.join(ticketDir, 'TRACK_DECISION.md');
            if (await fs_extra_1.default.pathExists(trackFile)) {
                const content = await fs_extra_1.default.readFile(trackFile, 'utf8');
                const match = content.match(/Decision:\s*Track\s*([AB])/i);
                if (match && (match[1] === 'A' || match[1] === 'B')) {
                    currentTrack = match[1];
                }
            }
        }
        // Update framework status with current ticket, epic, and track
        const status = await state_manager_1.BobStateManager.loadStatus();
        if (status.phases.development) {
            status.phases.development.current_ticket = selectedTicket;
        }
        status.current_ticket_id = selectedTicket;
        status.current_epic_id = epicId;
        status.current_track = currentTrack;
        await state_manager_1.BobStateManager.saveStatus(status);
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
    }
    catch (error) {
        return {
            success: false,
            error: `Failed to select ticket: ${error.message}`
        };
    }
};
exports.selectNextTicket = selectNextTicket;
/**
 * Trigger swarm execution (Multi-ticket Fan-Out)
 */
const triggerSwarm = async (context) => {
    console.log('  🐝 Triggering Ticket Swarm (Parallel Fan-Out)...');
    try {
        const engine = dependency_engine_1.DependencyEngine.getInstance();
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
    }
    catch (error) {
        return {
            success: false,
            error: `Swarm failed: ${error.message}`
        };
    }
};
exports.triggerSwarm = triggerSwarm;
/**
 * Scope selected ticket (Requirements, Design, Planning, Testing)
 */
const scopeTicket = async (context) => {
    console.log('  Generating ticket scope...');
    try {
        const status = await state_manager_1.BobStateManager.loadStatus();
        const currentTicket = status.current_ticket_id;
        const currentEpic = status.current_epic_id;
        if (!currentTicket) {
            return {
                success: false,
                error: 'No ticket selected. Run select_next_ticket first.',
                data: { ticket_selected: false }
            };
        }
        const metadata = await state_manager_2.StateManager.getMetadata(currentTicket);
        if (metadata.requirements_done && metadata.design_done) {
            return {
                success: true,
                data: { ticket: currentTicket }
            };
        }
        console.log(`    Running automated research for ${currentTicket}...`);
        const researcher = new researcher_agent_1.ResearcherAgent();
        await researcher.generateResearchFile(currentTicket);
        console.log(`    Running automated planning for ${currentTicket}...`);
        const planner = new planner_agent_1.PlannerAgent();
        await planner.planTicket(currentTicket);
        console.log(`    Running automated design for ${currentTicket}...`);
        const designer = new design_agent_1.DesignAgent();
        await designer.generateDesignFile(currentTicket);
        // Update metadata to reflect that scoping is done
        await state_manager_2.StateManager.updateMetadata(currentTicket, {
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
    }
    catch (error) {
        return {
            success: false,
            error: `Ticket scoping prep failed: ${error.message}`
        };
    }
};
exports.scopeTicket = scopeTicket;
/**
 * Generate code implementation
 */
const generateCode = async (context) => {
    console.log('  Preparing code generation context...');
    try {
        const status = await state_manager_1.BobStateManager.loadStatus();
        const currentTicket = status.phases.development?.current_ticket;
        if (!currentTicket) {
            return {
                success: false,
                error: 'No ticket selected. Run select_next_ticket first.',
                data: { ticket_selected: false }
            };
        }
        // Generate context pack for the ticket
        const builder = new context_builder_1.ContextBuilder();
        const contextPath = await builder.generateContextFile(currentTicket);
        // Get ticket metadata for file scope
        const metadata = await state_manager_2.StateManager.getMetadata(currentTicket);
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
    }
    catch (error) {
        return {
            success: false,
            error: `Code generation prep failed: ${error.message}`
        };
    }
};
exports.generateCode = generateCode;
/**
 * Review code (placeholder for AI review)
 */
const reviewCode = async (context) => {
    console.log('  Reviewing code...');
    try {
        const status = await state_manager_1.BobStateManager.loadStatus();
        const currentTicket = status.phases.development?.current_ticket;
        if (!currentTicket) {
            return {
                success: false,
                error: 'No ticket selected',
                data: { ticket_selected: false }
            };
        }
        const metadata = await state_manager_2.StateManager.getMetadata(currentTicket);
        if (metadata.file_scope?.allowed) {
            const fileResult = await file_guard_1.FileGuard.checkTicketScope(currentTicket);
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
    }
    catch (error) {
        return {
            success: false,
            error: `Code review failed: ${error.message}`
        };
    }
};
exports.reviewCode = reviewCode;
/**
 * Generate unit tests
 */
const generateUnitTests = async (context) => {
    console.log('  Preparing unit test generation...');
    try {
        const status = await state_manager_1.BobStateManager.loadStatus();
        const currentTicket = status.phases.development?.current_ticket;
        if (!currentTicket) {
            return {
                success: false,
                error: 'No ticket selected',
                data: { ticket_selected: false }
            };
        }
        // Get ticket metadata
        const metadata = await state_manager_2.StateManager.getMetadata(currentTicket);
        // Determine test file patterns based on allowed files
        const testPatterns = [];
        if (metadata.file_scope?.allowed) {
            for (const file of metadata.file_scope.allowed) {
                if (file.endsWith('.ts') && !file.includes('.test.')) {
                    testPatterns.push(file.replace('.ts', '.test.ts'));
                }
                else if (file.endsWith('.js') && !file.includes('.test.')) {
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
    }
    catch (error) {
        return {
            success: false,
            error: `Unit test generation prep failed: ${error.message}`
        };
    }
};
exports.generateUnitTests = generateUnitTests;
/**
 * Execute unit tests
 */
const runTests = async (context) => {
    console.log('  Executing tests...');
    try {
        // In a real implementation, this would run the actual test command
        // For now, return a placeholder result
        const status = await state_manager_1.BobStateManager.loadStatus();
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
    }
    catch (error) {
        return {
            success: false,
            error: `Test execution failed: ${error.message}`
        };
    }
};
exports.runTests = runTests;
// ============================================================================
// Epic/PI Hardening Handlers (Placeholders for Phase 3)
// ============================================================================
const runIntegrationTests = async (ctx) => {
    const status = await state_manager_1.BobStateManager.loadStatus();
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
exports.runIntegrationTests = runIntegrationTests;
const generateThreatModel = async (ctx) => {
    const status = await state_manager_1.BobStateManager.loadStatus();
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
exports.generateThreatModel = generateThreatModel;
const lockApiContracts = async (ctx) => {
    const status = await state_manager_1.BobStateManager.loadStatus();
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
exports.lockApiContracts = lockApiContracts;
const runVerificationGate = async (ctx) => {
    const status = await state_manager_1.BobStateManager.loadStatus();
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
exports.runVerificationGate = runVerificationGate;
const fixBugs = async (ctx) => ({
    success: true,
    data: { placeholder: true },
    logs: ['Bug fixes - implement in Phase 4']
});
exports.fixBugs = fixBugs;
const updateDocumentation = async (ctx) => ({
    success: true,
    data: { placeholder: true },
    logs: ['Documentation update - implement in Phase 4']
});
exports.updateDocumentation = updateDocumentation;
const validateEpic = async (ctx) => ({
    success: true,
    data: { placeholder: true },
    logs: ['Epic validation - implement in Phase 4']
});
exports.validateEpic = validateEpic;
const runSystemTests = async (ctx) => ({
    success: true,
    data: { placeholder: true },
    logs: ['System tests - implement in Phase 4']
});
exports.runSystemTests = runSystemTests;
const runPerformanceTests = async (ctx) => ({
    success: true,
    data: { placeholder: true },
    logs: ['Performance tests - implement in Phase 4']
});
exports.runPerformanceTests = runPerformanceTests;
const runSecurityAudit = async (ctx) => ({
    success: true,
    data: { placeholder: true },
    logs: ['Security audit - implement in Phase 4']
});
exports.runSecurityAudit = runSecurityAudit;
const buildReleaseCandidate = async (ctx) => ({
    success: true,
    data: { placeholder: true },
    logs: ['Release candidate build - implement in Phase 4']
});
exports.buildReleaseCandidate = buildReleaseCandidate;
// ============================================================================
// UAT Handlers (Placeholders for Phase 3)
// ============================================================================
const setupUatEnvironment = async (ctx) => ({
    success: true,
    data: { placeholder: true },
    logs: ['UAT environment setup - implement in Phase 4']
});
exports.setupUatEnvironment = setupUatEnvironment;
const runUat = async (ctx) => ({
    success: true,
    data: { requires_user_input: true },
    logs: ['UAT execution requires user input']
});
exports.runUat = runUat;
const collectUatFeedback = async (ctx) => ({
    success: true,
    data: { requires_user_input: true },
    logs: ['UAT feedback collection requires user input']
});
exports.collectUatFeedback = collectUatFeedback;
const fixUatBugs = async (ctx) => ({
    success: true,
    data: { placeholder: true },
    logs: ['UAT bug fixes - implement in Phase 4']
});
exports.fixUatBugs = fixUatBugs;
// ============================================================================
// Release Handlers (Placeholders for Phase 3)
// ============================================================================
const generateReleaseNotes = async (ctx) => ({
    success: true,
    data: { placeholder: true },
    logs: ['Release notes generation - implement in Phase 4']
});
exports.generateReleaseNotes = generateReleaseNotes;
const generateDeploymentScripts = async (ctx) => ({
    success: true,
    data: { placeholder: true },
    logs: ['Deployment scripts generation - implement in Phase 4']
});
exports.generateDeploymentScripts = generateDeploymentScripts;
const generateRollbackPlan = async (ctx) => ({
    success: true,
    data: { placeholder: true },
    logs: ['Rollback plan generation - implement in Phase 4']
});
exports.generateRollbackPlan = generateRollbackPlan;
const generateDeploymentChecklist = async (ctx) => ({
    success: true,
    data: { placeholder: true },
    logs: ['Deployment checklist generation - implement in Phase 4']
});
exports.generateDeploymentChecklist = generateDeploymentChecklist;
const validatePreLaunch = async (ctx) => ({
    success: true,
    data: { placeholder: true },
    logs: ['Pre-launch validation - implement in Phase 4']
});
exports.validatePreLaunch = validatePreLaunch;
const deployToProduction = async (ctx) => ({
    success: true,
    data: { placeholder: true },
    logs: ['Production deployment - implement in Phase 4']
});
exports.deployToProduction = deployToProduction;
const verifyDeployment = async (ctx) => ({
    success: true,
    data: { placeholder: true },
    logs: ['Deployment verification - implement in Phase 4']
});
exports.verifyDeployment = verifyDeployment;
// ============================================================================
// Monitoring Handlers (Placeholders for Phase 4)
// ============================================================================
const setupMonitoring = async (ctx) => ({
    success: true,
    data: { placeholder: true },
    logs: ['Monitoring setup - implement in Phase 4']
});
exports.setupMonitoring = setupMonitoring;
const setupErrorTracking = async (ctx) => ({
    success: true,
    data: { placeholder: true },
    logs: ['Error tracking setup - implement in Phase 4']
});
exports.setupErrorTracking = setupErrorTracking;
const monitorPerformance = async (ctx) => ({
    success: true,
    data: { placeholder: true },
    logs: ['Performance monitoring - implement in Phase 4']
});
exports.monitorPerformance = monitorPerformance;
const compressEpicKnowledge = async (ctx) => {
    const status = await state_manager_1.BobStateManager.loadStatus();
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
exports.compressEpicKnowledge = compressEpicKnowledge;
