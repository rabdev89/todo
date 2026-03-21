/**
 * Framework Action Handlers
 *
 * Implements actions for Framework Bootstrap and Installation phases.
 * Uses existing engine components where possible.
 */
import type { ActionHandler } from '../types';
/**
 * Validate repository structure exists
 */
export declare const validateRepositoryStructure: ActionHandler;
/**
 * Validate framework version compatibility
 */
export declare const validateFrameworkVersion: ActionHandler;
/**
 * Run framework diagnostics
 */
export declare const runFrameworkDiagnostics: ActionHandler;
/**
 * Install framework dependencies
 */
export declare const installFrameworkDependencies: ActionHandler;
/**
 * Validate runtime environment
 */
export declare const validateEnvironment: ActionHandler;
/**
 * Run framework tests
 */
export declare const runFrameworkTests: ActionHandler;
/**
 * Generate health report
 */
export declare const generateHealthReport: ActionHandler;
/**
 * Start engine services
 */
export declare const startEngineServices: ActionHandler;
/**
 * Start watchdog service
 */
export declare const startWatchdogService: ActionHandler;
/**
 * Consolidated: Validate the whole framework setup
 * Combines repository structure, version validation, and diagnostics
 */
export declare const validateFrameworkSetup: ActionHandler;
/**
 * Consolidated: Initialize services (engine services + watchdog)
 */
export declare const initializeServices: ActionHandler;
//# sourceMappingURL=framework.d.ts.map