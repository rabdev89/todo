/**
 * Bob Action Handlers Index
 *
 * Registry of all action handlers for the Bob workflow engine.
 * Imports and exports all handlers from specific modules.
 */

import type { ActionHandler } from '../types';

// Import framework handlers
import {
  validateRepositoryStructure,
  validateFrameworkVersion,
  runFrameworkDiagnostics,
  validateFrameworkSetup,
  installFrameworkDependencies,
  validateEnvironment,
  runFrameworkTests,
  generateHealthReport,
  startEngineServices,
  startWatchdogService,
  initializeServices
} from './framework';

// Import project handlers
import {
  startProjectInit,
  selectProjectType,
  promptProjectType,
  validateFrameworkProjectAlignment,
  generateTechStack,
  generateProjectContext,
  generateProjectManagementStructure,
  generateVisionDocument,
  userReviewVision,
  generateUserFlow,
  userReviewUserFlow,
  validateUserFlow,
  generateRequirements,
  userReviewRequirements,
  generateDesignBible,
  approveDesignBible,
  setupContinueProjectUat
} from './project';

// Import development handlers
import {
  selectNextTicket,
  scopeTicket,
  generateCode,
  reviewCode,
  generateUnitTests,
  runTests,
  runIntegrationTests,
  generateThreatModel,
  lockApiContracts,
  runVerificationGate,
  fixBugs,
  updateDocumentation,
  validateEpic,
  runSystemTests,
  runPerformanceTests,
  runSecurityAudit,
  buildReleaseCandidate,
  setupUatEnvironment,
  runUat,
  collectUatFeedback,
  fixUatBugs,
  generateReleaseNotes,
  generateDeploymentScripts,
  generateRollbackPlan,
  generateDeploymentChecklist,
  validatePreLaunch,
  deployToProduction,
  verifyDeployment,
  setupMonitoring,
  setupErrorTracking,
  monitorPerformance,
  compressEpicKnowledge,
  triggerSwarm
} from './development';

// Import architecture handlers
import {
  generateArchitectureDesign,
  validateTechStack,
  generateDatabaseSchema,
  generateApiContracts
} from './architecture';

// Import planning handlers
import {
  generateEpics,
  reviewEpics,
  generateTickets,
  validateTickets,
  generateProjectTimeline
} from './planning';
import {
  consolidatePIHardening,
  consolidateReleasePreparation,
  consolidateMonitoring
} from './consolidations';

// Import GStack handlers
import {
  ceoProductAudit,
  engArchAudit,
  engEpicAudit,
  engPiReadinessAudit,
  shipEpic,
  expertCodeReview,
  visualRegressionQa,
  epicRetrospective,
  interactiveUiVerification,
  importBrowserSessions
} from './gstack';

/**
 * Action handler registry
 * Maps action names to handler functions
 */
export const ActionHandlers: Record<string, ActionHandler> = {
  // Phase 1: Framework Bootstrap
  validate_repository_structure: validateRepositoryStructure,
  validate_framework_version: validateFrameworkVersion,
  run_framework_diagnostics: runFrameworkDiagnostics,
  validate_framework_setup: validateFrameworkSetup,

  // Phase 2: Framework Installation
  install_framework_dependencies: installFrameworkDependencies,
  validate_environment: validateEnvironment,
  run_framework_tests: runFrameworkTests,
  generate_health_report: generateHealthReport,
  start_engine_services: startEngineServices,
  start_watchdog_service: startWatchdogService,
  initialize_services: initializeServices,

  // Phase 3: Project Initialization
  start_project_init: startProjectInit,
  select_project_type: selectProjectType,
  // Aliases for new compact project_initialization steps
  detect_project_type: selectProjectType,
  //prompt_project_type: promptProjectType,
  generate_tech_stack: generateTechStack,
  // alias: allow handler lookup by the compact step id
  generate_project_context: generateProjectContext,
  generate_project_management_structure: generateProjectManagementStructure,
  initialize_management_structure: generateProjectManagementStructure,
  validate_framework_project_alignment: validateFrameworkProjectAlignment,

  // Phase 4: Product Definition
  generate_vision_document: generateVisionDocument,
  user_review_vision: userReviewVision,
  generate_user_flow: generateUserFlow,
  user_review_user_flow: userReviewUserFlow,
  validate_user_flow: validateUserFlow,
  generate_requirements: generateRequirements,
  user_review_requirements: userReviewRequirements,
  generate_design_bible: generateDesignBible,
  approve_design_bible: approveDesignBible,

  // Phase 5: Technical Architecture
  generate_architecture_design: generateArchitectureDesign,
  validate_tech_stack: validateTechStack,
  generate_database_schema: generateDatabaseSchema,
  generate_api_contracts: generateApiContracts,

  // Phase 6: Project Planning
  generate_epics: generateEpics,
  review_epics: reviewEpics,
  generate_tickets: generateTickets,
  validate_tickets: validateTickets,
  generate_project_timeline: generateProjectTimeline,

  // Phase 7: Development
  select_next_ticket: selectNextTicket,
  scope_ticket: scopeTicket,
  generate_code: generateCode,
  review_code: reviewCode,
  generate_unit_tests: generateUnitTests,
  run_tests: runTests,
  trigger_swarm: triggerSwarm,

  // Phase 8: Epic Hardening
  run_integration_tests: runIntegrationTests,
  generate_threat_model: generateThreatModel,
  lock_api_contracts: lockApiContracts,
  run_verification_gate: runVerificationGate,
  compress_epic_knowledge: compressEpicKnowledge,
  fix_bugs: fixBugs,
  update_documentation: updateDocumentation,
  validate_epic: validateEpic,

  // Phase 9: PI Hardening
  run_system_tests: runSystemTests,
  run_performance_tests: runPerformanceTests,
  run_security_audit: runSecurityAudit,
  build_release_candidate: buildReleaseCandidate,
  // Consolidated handlers (medium-priority groups)
  pi_hardening_combined: consolidatePIHardening,

  // Phase 10: UAT
  setup_continue_project_uat: setupContinueProjectUat,
  setup_uat_environment: setupUatEnvironment,
  run_uat: runUat,
  collect_uat_feedback: collectUatFeedback,
  fix_uat_bugs: fixUatBugs,

  // Phase 11: Release Preparation
  generate_release_notes: generateReleaseNotes,
  generate_deployment_scripts: generateDeploymentScripts,
  generate_rollback_plan: generateRollbackPlan,
  generate_deployment_checklist: generateDeploymentChecklist,
  release_preparation_combined: consolidateReleasePreparation,

  // Phase 12: Deployment
  validate_pre_launch: validatePreLaunch,
  deploy_to_production: deployToProduction,
  verify_deployment: verifyDeployment,

  // Phase 13: Post-Launch Monitoring
  monitoring_setup: setupMonitoring,
  error_tracking_setup: setupErrorTracking,
  performance_monitoring: monitorPerformance,
  monitoring_combined: consolidateMonitoring,

  // GStack Specialist Gates
  ceo_product_audit: ceoProductAudit,
  eng_arch_audit: engArchAudit,
  eng_epic_audit: engEpicAudit,
  eng_pi_readiness_audit: engPiReadinessAudit,
  ship_epic: shipEpic,
  expert_code_review: expertCodeReview,
  visual_regression_qa: visualRegressionQa,
  epic_retrospective: epicRetrospective,
  interactive_ui_verification: interactiveUiVerification,
  import_browser_sessions: importBrowserSessions
};

/**
 * Get handler for an action
 */
export function getHandler(action: string): ActionHandler | null {
  return ActionHandlers[action] || null;
}

/**
 * Check if handler exists
 */
export function hasHandler(action: string): boolean {
  return action in ActionHandlers;
}
