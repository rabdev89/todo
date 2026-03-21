/**
 * Development Action Handlers
 *
 * Implements actions for Development phase.
 * Integrates with existing engine tools: ContextBuilder, FileGuard, StateManager
 */
import type { ActionHandler } from '../types';
/**
 * Select next ticket for development
 */
export declare const selectNextTicket: ActionHandler;
/**
 * Trigger swarm execution (Multi-ticket Fan-Out)
 */
export declare const triggerSwarm: ActionHandler;
/**
 * Scope selected ticket (Requirements, Design, Planning, Testing)
 */
export declare const scopeTicket: ActionHandler;
/**
 * Generate code implementation
 */
export declare const generateCode: ActionHandler;
/**
 * Review code (placeholder for AI review)
 */
export declare const reviewCode: ActionHandler;
/**
 * Generate unit tests
 */
export declare const generateUnitTests: ActionHandler;
/**
 * Execute unit tests
 */
export declare const runTests: ActionHandler;
export declare const runIntegrationTests: ActionHandler;
export declare const generateThreatModel: ActionHandler;
export declare const lockApiContracts: ActionHandler;
export declare const runVerificationGate: ActionHandler;
export declare const fixBugs: ActionHandler;
export declare const updateDocumentation: ActionHandler;
export declare const validateEpic: ActionHandler;
export declare const runSystemTests: ActionHandler;
export declare const runPerformanceTests: ActionHandler;
export declare const runSecurityAudit: ActionHandler;
export declare const buildReleaseCandidate: ActionHandler;
export declare const setupUatEnvironment: ActionHandler;
export declare const runUat: ActionHandler;
export declare const collectUatFeedback: ActionHandler;
export declare const fixUatBugs: ActionHandler;
export declare const generateReleaseNotes: ActionHandler;
export declare const generateDeploymentScripts: ActionHandler;
export declare const generateRollbackPlan: ActionHandler;
export declare const generateDeploymentChecklist: ActionHandler;
export declare const validatePreLaunch: ActionHandler;
export declare const deployToProduction: ActionHandler;
export declare const verifyDeployment: ActionHandler;
export declare const setupMonitoring: ActionHandler;
export declare const setupErrorTracking: ActionHandler;
export declare const monitorPerformance: ActionHandler;
export declare const compressEpicKnowledge: ActionHandler;
//# sourceMappingURL=development.d.ts.map