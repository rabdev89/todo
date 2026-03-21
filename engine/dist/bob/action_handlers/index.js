"use strict";
/**
 * Bob Action Handlers Index
 *
 * Registry of all action handlers for the Bob workflow engine.
 * Imports and exports all handlers from specific modules.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActionHandlers = void 0;
exports.getHandler = getHandler;
exports.hasHandler = hasHandler;
// Import framework handlers
const framework_1 = require("./framework");
// Import project handlers
const project_1 = require("./project");
// Import development handlers
const development_1 = require("./development");
// Import architecture handlers
const architecture_1 = require("./architecture");
// Import planning handlers
const planning_1 = require("./planning");
const consolidations_1 = require("./consolidations");
// Import GStack handlers
const gstack_1 = require("./gstack");
/**
 * Action handler registry
 * Maps action names to handler functions
 */
exports.ActionHandlers = {
    // Phase 1: Framework Bootstrap
    validate_repository_structure: framework_1.validateRepositoryStructure,
    validate_framework_version: framework_1.validateFrameworkVersion,
    run_framework_diagnostics: framework_1.runFrameworkDiagnostics,
    validate_framework_setup: framework_1.validateFrameworkSetup,
    // Phase 2: Framework Installation
    install_framework_dependencies: framework_1.installFrameworkDependencies,
    validate_environment: framework_1.validateEnvironment,
    run_framework_tests: framework_1.runFrameworkTests,
    generate_health_report: framework_1.generateHealthReport,
    start_engine_services: framework_1.startEngineServices,
    start_watchdog_service: framework_1.startWatchdogService,
    initialize_services: framework_1.initializeServices,
    // Phase 3: Project Initialization
    start_project_init: project_1.startProjectInit,
    select_project_type: project_1.selectProjectType,
    // Aliases for new compact project_initialization steps
    detect_project_type: project_1.selectProjectType,
    //prompt_project_type: promptProjectType,
    generate_tech_stack: project_1.generateTechStack,
    // alias: allow handler lookup by the compact step id
    generate_project_context: project_1.generateProjectContext,
    generate_project_management_structure: project_1.generateProjectManagementStructure,
    initialize_management_structure: project_1.generateProjectManagementStructure,
    validate_framework_project_alignment: project_1.validateFrameworkProjectAlignment,
    // Phase 4: Product Definition
    generate_vision_document: project_1.generateVisionDocument,
    user_review_vision: project_1.userReviewVision,
    generate_user_flow: project_1.generateUserFlow,
    user_review_user_flow: project_1.userReviewUserFlow,
    validate_user_flow: project_1.validateUserFlow,
    generate_requirements: project_1.generateRequirements,
    user_review_requirements: project_1.userReviewRequirements,
    generate_design_bible: project_1.generateDesignBible,
    approve_design_bible: project_1.approveDesignBible,
    // Phase 5: Technical Architecture
    generate_architecture_design: architecture_1.generateArchitectureDesign,
    validate_tech_stack: architecture_1.validateTechStack,
    generate_database_schema: architecture_1.generateDatabaseSchema,
    generate_api_contracts: architecture_1.generateApiContracts,
    // Phase 6: Project Planning
    generate_epics: planning_1.generateEpics,
    review_epics: planning_1.reviewEpics,
    generate_tickets: planning_1.generateTickets,
    validate_tickets: planning_1.validateTickets,
    generate_project_timeline: planning_1.generateProjectTimeline,
    // Phase 7: Development
    select_next_ticket: development_1.selectNextTicket,
    scope_ticket: development_1.scopeTicket,
    generate_code: development_1.generateCode,
    review_code: development_1.reviewCode,
    generate_unit_tests: development_1.generateUnitTests,
    run_tests: development_1.runTests,
    trigger_swarm: development_1.triggerSwarm,
    // Phase 8: Epic Hardening
    run_integration_tests: development_1.runIntegrationTests,
    generate_threat_model: development_1.generateThreatModel,
    lock_api_contracts: development_1.lockApiContracts,
    run_verification_gate: development_1.runVerificationGate,
    compress_epic_knowledge: development_1.compressEpicKnowledge,
    fix_bugs: development_1.fixBugs,
    update_documentation: development_1.updateDocumentation,
    validate_epic: development_1.validateEpic,
    // Phase 9: PI Hardening
    run_system_tests: development_1.runSystemTests,
    run_performance_tests: development_1.runPerformanceTests,
    run_security_audit: development_1.runSecurityAudit,
    build_release_candidate: development_1.buildReleaseCandidate,
    // Consolidated handlers (medium-priority groups)
    pi_hardening_combined: consolidations_1.consolidatePIHardening,
    // Phase 10: UAT
    setup_continue_project_uat: project_1.setupContinueProjectUat,
    setup_uat_environment: development_1.setupUatEnvironment,
    run_uat: development_1.runUat,
    collect_uat_feedback: development_1.collectUatFeedback,
    fix_uat_bugs: development_1.fixUatBugs,
    // Phase 11: Release Preparation
    generate_release_notes: development_1.generateReleaseNotes,
    generate_deployment_scripts: development_1.generateDeploymentScripts,
    generate_rollback_plan: development_1.generateRollbackPlan,
    generate_deployment_checklist: development_1.generateDeploymentChecklist,
    release_preparation_combined: consolidations_1.consolidateReleasePreparation,
    // Phase 12: Deployment
    validate_pre_launch: development_1.validatePreLaunch,
    deploy_to_production: development_1.deployToProduction,
    verify_deployment: development_1.verifyDeployment,
    // Phase 13: Post-Launch Monitoring
    monitoring_setup: development_1.setupMonitoring,
    error_tracking_setup: development_1.setupErrorTracking,
    performance_monitoring: development_1.monitorPerformance,
    monitoring_combined: consolidations_1.consolidateMonitoring,
    // GStack Specialist Gates
    ceo_product_audit: gstack_1.ceoProductAudit,
    eng_arch_audit: gstack_1.engArchAudit,
    eng_epic_audit: gstack_1.engEpicAudit,
    eng_pi_readiness_audit: gstack_1.engPiReadinessAudit,
    ship_epic: gstack_1.shipEpic,
    expert_code_review: gstack_1.expertCodeReview,
    visual_regression_qa: gstack_1.visualRegressionQa,
    epic_retrospective: gstack_1.epicRetrospective,
    interactive_ui_verification: gstack_1.interactiveUiVerification,
    import_browser_sessions: gstack_1.importBrowserSessions
};
/**
 * Get handler for an action
 */
function getHandler(action) {
    return exports.ActionHandlers[action] || null;
}
/**
 * Check if handler exists
 */
function hasHandler(action) {
    return action in exports.ActionHandlers;
}
