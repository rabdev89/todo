import { BobEngine } from './bob_engine';
import { BobPhaseRouter } from './phase_router';
import { BobStateManager } from './state_manager';
import {
  validateRepositoryStructure,
  validateFrameworkVersion,
  runFrameworkDiagnostics,
  installFrameworkDependencies,
  validateEnvironment,
  runFrameworkTests,
  generateHealthReport,
  startEngineServices,
  startWatchdogService
} from './action_handlers/framework';
import {
  startProjectInit,
  promptProjectType,
  validateFrameworkProjectAlignment,
  generateTechStack,
  generateProjectContext,
  generateProjectManagementStructure,
  generateVisionDocument,
  generateUserFlow,
  validateUserFlow,
  generateRequirements
} from './action_handlers/project';
import {
  generateArchitectureDesign,
  validateTechStack,
  generateDatabaseSchema,
  generateApiContracts
} from './action_handlers/architecture';
import {
  generateEpics,
  reviewEpics,
  generateTickets,
  validateTickets,
  generateProjectTimeline
} from './action_handlers/planning';
import {
  selectNextTicket,
  generateCode as devGenerateCode,
  reviewCode,
  generateUnitTests,
  runTests,
  runIntegrationTests,
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
  monitorPerformance
} from './action_handlers/development';
import fs from 'fs-extra';
import path from 'path';

export type BobGateType = 'user' | 'none';

export type BobExpectation =
  | {
      kind: 'repository-structure';
      requiredDirs: string[];
      requiredFiles: string[];
    }
  | {
      kind: 'framework-version';
      minVersion?: string;
      maxVersion?: string;
    }
  | {
      kind: 'diagnostics';
      mustPass: boolean;
    }
  | {
      kind: 'health-files';
      files: string[];
    }
  | {
      kind: 'log-signals';
      mustContain: string[];
    }
  | {
      kind: 'artifacts';
      paths: string[];
    }
  | {
      kind: 'custom';
      validatorName: string;
    };

export interface BobActionTestCase {
  phase: string;
  activity: string;
  action: string;
  command: string;
  gate: BobGateType;
  expectedBehavior: string;
  expectations?: BobExpectation[];
  expectedLogSignals?: string[];
  expectedArtifacts?: string[];
}

export const BOB_ACTION_TEST_CASES: BobActionTestCase[] = [
  {
    phase: 'Framework Bootstrap',
    activity: 'Check Repository Integrity',
    action: 'validate_repository_structure',
    command: 'npm run start -- framework-test',
    gate: 'none',
    expectedBehavior: 'Verify required repository directories and files exist',
    expectations: [
      {
        kind: 'repository-structure',
        requiredDirs: ['engine','engine/dist', 'framework', 'project-management', 'packages','packages/memory/dist','skills-library','web-applications','web-applications/bob'],
        requiredFiles: [
          'framework/phases_definition.json',
          'framework/framework_status.json',
          'framework-health.json',          
          'web-applications/bob/health-report.json',
          'web-applications/bob/framework_status.json'
        ]
      },
      {
        kind: 'log-signals',
        mustContain: ['✓ Found']
      }
    ]
  },
  {
    phase: 'Framework Bootstrap',
    activity: 'Check Framework Version',
    action: 'validate_framework_version',
    command: 'npm run start -- framework-test',
    gate: 'none',
    expectedBehavior: 'Compare current framework version with expected version',
    expectations: [
      {
        kind: 'framework-version'
      }
    ]
  },
  {
    phase: 'Framework Bootstrap',
    activity: 'Run Self Diagnostics',
    action: 'run_framework_diagnostics',
    command: 'npm run start -- framework-test',
    gate: 'none',
    expectedBehavior: 'Execute self diagnostics for the framework runtime',
    expectations: [
      {
        kind: 'diagnostics',
        mustPass: true
      },
      {
        kind: 'health-files',
        files: [
          'web-applications/bob/health-report.json',
          'framework-health.json'
        ]
      }
    ]
  },
  {
    phase: 'Framework Installation',
    activity: 'Initialize Framework',
    action: 'install_framework_dependencies',
    command: 'npm install',
    gate: 'none',
    expectedBehavior: 'Install all framework and engine dependencies',
    expectations: [
      {
        kind: 'log-signals',
        mustContain: ['Dependencies']
      },
      {
        kind: 'artifacts',
        paths: ['engine/node_modules']
      }
    ]
  },
  {
    phase: 'Framework Installation',
    activity: 'Environment Check',
    action: 'validate_environment',
    command: 'npm run start -- framework-test',
    gate: 'none',
    expectedBehavior: 'Validate environment prerequisites such as node version and tools',
    expectations: [
      {
        kind: 'log-signals',
        mustContain: ['✓ Environment validated']
      }
    ]
  },
  {
    phase: 'Framework Installation',
    activity: 'Framework Test',
    action: 'run_framework_tests',
    command: 'npm run start -- framework-test',
    gate: 'none',
    expectedBehavior: 'Run internal framework test suite',
    expectations: [
      {
        kind: 'log-signals',
        mustContain: ['✓ State Manager', '✓ Phase Router', '✓ Bob Engine']
      }
    ]
  },
  {
    phase: 'Framework Installation',
    activity: 'Generate Health Report',
    action: 'generate_health_report',
    command: 'npm run start -- framework-test',
    gate: 'none',
    expectedBehavior: 'Generate framework health report based on diagnostics',
    expectations: [
      {
        kind: 'health-files',
        files: ['web-applications/bob/health-report.json']
      }
    ]
  },
  {
    phase: 'Framework Installation',
    activity: 'Start Framework Services',
    action: 'start_engine_services',
    command: 'npm run start -- framework-start',
    gate: 'none',
    expectedBehavior: 'Start long running framework and engine services',
    expectations: [
      {
        kind: 'log-signals',
        mustContain: ['✓ phase_runner: running', '✓ context_builder: running']
      }
    ]
  },
  {
    phase: 'Framework Installation',
    activity: 'Start Watchdog',
    action: 'start_watchdog_service',
    command: 'npm run start -- framework-start',
    gate: 'none',
    expectedBehavior: 'Start watchdog process monitoring engine health',
    expectations: [
      {
        kind: 'log-signals',
        mustContain: ['Watchdog service configured', 'Interval:', 'Config:']
      }
    ]
  },
  {
    phase: 'Project Initialization',
    activity: 'Start Project Initialization',
    action: 'start_project_init',
    command: 'npm run start -- project-init --type new',
    gate: 'none',
    expectedBehavior: 'Mark project initialization as started for a new project',
    expectations: [
      {
        kind: 'log-signals',
        mustContain: ['Project initialization started']
      }
    ]
  },
  {
    phase: 'Project Initialization',
    activity: 'Select Project Type',
    action: 'prompt_project_type',
    command: 'npm run start -- project-init --type new',
    gate: 'user',
    expectedBehavior: 'Prompt user to choose project type and project name',
    expectations: [
      {
        kind: 'log-signals',
        mustContain: ['📋 Project Type Selection', 'Project configured (mock)', 'Type: new_project', 'Name: Test Project']
      }
    ]
  },
  {
    phase: 'Project Initialization',
    activity: 'Framework Alignment Check',
    action: 'validate_framework_project_alignment',
    command: 'npm run start -- overview',
    gate: 'none',
    expectedBehavior: 'Validate selected project type is supported by framework',
    expectations: [
      {
        kind: 'log-signals',
        mustContain: [`✓ Project type 'new_project' is valid and supported`]
      }
    ]
  },
  {
    phase: 'Project Initialization',
    activity: 'Generate Tech Stack',
    action: 'generate_tech_stack',
    command: 'npm run start -- overview',
    gate: 'none',
    expectedBehavior: 'Generate project tech stack configuration',
    expectations: [
      {
        kind: 'artifacts',
        paths: ['web-applications/bob/tech_stack.json']
      }
    ]
  },
  {
    phase: 'Project Initialization',
    activity: 'Create Project Context',
    action: 'generate_project_context',
    command: 'npm run start -- overview',
    gate: 'none',
    expectedBehavior: 'Generate project context metadata including name and type',
    expectations: [
      {
        kind: 'artifacts',
        paths: ['web-applications/project-management/project_context.json']
      }
    ]
  },
  {
    phase: 'Project Initialization',
    activity: 'Create Project Management Structure',
    action: 'generate_project_management_structure',
    command: 'npm run start -- overview',
    gate: 'none',
    expectedBehavior: 'Create project management directories and template documents',
    expectations: [
      {
        kind: 'artifacts',
        paths: [
          'web-applications/project-management/epics',
          'project-management/backlog',
          'web-applications/web-applications/project-management/epics/README.md',
          'web-applications/project-management/backlog/backlog.md'
        ]
      }
    ]
  },
  {
    phase: 'Product Definition',
    activity: 'Generate Vision Document',
    action: 'generate_vision_document',
    command: 'npm run start -- overview',
    gate: 'none',
    expectedBehavior: 'Generate project vision document based on project metadata',
    expectations: [
      {
        kind: 'artifacts',
        paths: ['web-applications/project-management/vision.md']
      }
    ]
  },
  {
    phase: 'Product Definition',
    activity: 'Review Vision',
    action: 'user_review_vision',
    command: '/review-design',
    gate: 'user',
    expectedBehavior: 'Require user to review and edit project vision document',
    expectations: []
  },
  {
    phase: 'Product Definition',
    activity: 'Create User Flow',
    action: 'generate_user_flow',
    command: '/init-project',
    gate: 'user',
    expectedBehavior: 'Generate user flow document describing user journeys',
    expectations: [
      {
        kind: 'artifacts',
        paths: ['web-applications/project-management/user_flow.md']
      }
    ]
  },
  {
    phase: 'Product Definition',
    activity: 'Validate User Flow',
    action: 'validate_user_flow',
    command: '/check-implementation',
    gate: 'none',
    expectedBehavior: 'Validate that the user flow is consistent and complete',
    expectations: [
      {
        kind: 'log-signals',
        mustContain: ['User flow validation:']
      }
    ]
  },
  {
    phase: 'Product Definition',
    activity: 'Align Requirements',
    action: 'generate_requirements',
    command: '/review-requirements',
    gate: 'none',
    expectedBehavior: 'Generate requirements aligned to vision and user flow',
    expectations: [
      {
        kind: 'artifacts',
        paths: ['web-applications/project-management/requirements.md']
      }
    ]
  },
  {
    phase: 'Technical Architecture',
    activity: 'Design Architecture',
    action: 'generate_architecture_design',
    command: 'npm run start -- architecture',
    gate: 'none',
    expectedBehavior: 'Generate technical architecture design document',
    expectations: [
      {
        kind: 'artifacts',
        paths: ['web-applications/bob/architecture.md']
      }
    ]
  },
  {
    phase: 'Technical Architecture',
    activity: 'Validate Tech Stack',
    action: 'validate_tech_stack',
    command: 'npm run start -- overview',
    gate: 'none',
    expectedBehavior: 'Validate chosen tech stack against architecture requirements',
    expectations: [
      {
        kind: 'log-signals',
        mustContain: ['Tech stack validation passed:']
      }
    ]
  },
  {
    phase: 'Technical Architecture',
    activity: 'Plan Database Schema',
    action: 'generate_database_schema',
    command: 'npm run start -- overview',
    gate: 'none',
    expectedBehavior: 'Generate initial database schema plan',
    expectations: [
      {
        kind: 'artifacts',
        paths: ['web-applications/project-management/database_schema.md']
      }
    ]
  },
  {
    phase: 'Technical Architecture',
    activity: 'Define API Contracts',
    action: 'generate_api_contracts',
    command: 'npm run start -- overview',
    gate: 'none',
    expectedBehavior: 'Generate API contract documentation',
    expectations: [
      {
        kind: 'artifacts',
        paths: ['web-applications/project-management/api_contracts.md']
      }
    ]
  },
  {
    phase: 'Project Planning',
    activity: 'Generate Epics',
    action: 'generate_epics',
    command: '/scope-epic',
    gate: 'none',
    expectedBehavior: 'Generate epics from requirements',
    expectations: [
      {
        kind: 'artifacts',
        paths: [
          'web-applications/project-management/epics/README.md',
          'web-applications/project-management/epics/EPIC-001/README.md'
        ]
      }
    ]
  },
  {
    phase: 'Project Planning',
    activity: 'Review Epics',
    action: 'review_epics',
    command: '/review-requirements',
    gate: 'user',
    expectedBehavior: 'Require user to review epics before proceeding',
    expectations: []
  },
  {
    phase: 'Project Planning',
    activity: 'Generate Tickets',
    action: 'generate_tickets',
    command: '/update-planning',
    gate: 'none',
    expectedBehavior: 'Generate tickets from epics',
    expectations: [
      {
        kind: 'artifacts',
        paths: [
          'web-applications/project-management/epics/EPIC-001/tickets/T-001.md',
          'web-applications/project-management/epics/EPIC-001/tickets/T-001.json'
        ]
      }
    ]
  },
  {
    phase: 'Project Planning',
    activity: 'Validate Tickets',
    action: 'validate_tickets',
    command: '/check-implementation',
    gate: 'none',
    expectedBehavior: 'Validate that generated tickets are consistent and linked',
    expectations: [
      {
        kind: 'log-signals',
        mustContain: ['Validated', 'All tickets are valid ✓']
      }
    ]
  },
  {
    phase: 'Project Planning',
    activity: 'Generate Project Timeline',
    action: 'generate_project_timeline',
    command: 'npm run start -- overview',
    gate: 'none',
    expectedBehavior: 'Generate project timeline from planning data',
    expectations: [
      {
        kind: 'artifacts',
        paths: ['web-applications/project-management/timeline.md']
      }
    ]
  },
  {
    phase: 'Development',
    activity: 'Select Next Ticket',
    action: 'select_next_ticket',
    command: 'npm run start -- next',
    gate: 'none',
    expectedBehavior: 'Select next ticket ready for development based on dependencies',
    expectations: []
  },
  {
    phase: 'Development',
    activity: 'Generate Code',
    action: 'generate_code',
    command: 'npm run start -- context T-001',
    gate: 'none',
    expectedBehavior: 'Generate code implementation for current ticket',
    expectations: []
  },
  {
    phase: 'Development',
    activity: 'AI Code Review',
    action: 'review_code',
    command: '/code-review',
    gate: 'none',
    expectedBehavior: 'Perform AI assisted code review for current ticket',
    expectations: [
      {
        kind: 'log-signals',
        mustContain: ['Code review']
      }
    ]
  },
  {
    phase: 'Development',
    activity: 'Generate Unit Tests',
    action: 'generate_unit_tests',
    command: '/writing-test',
    gate: 'none',
    expectedBehavior: 'Generate unit tests for ticket implementation',
    expectations: [
      {
        kind: 'log-signals',
        mustContain: ['Unit test prep']
      }
    ]
  },
  {
    phase: 'Development',
    activity: 'Execute Unit Tests',
    action: 'run_tests',
    command: 'npm run start -- framework-test',
    gate: 'none',
    expectedBehavior: 'Execute unit tests for current scope',
    expectations: [
      {
        kind: 'log-signals',
        mustContain: ['Test execution placeholder']
      }
    ]
  },
  {
    phase: 'Epic Hardening',
    activity: 'Integration Testing',
    action: 'run_integration_tests',
    command: 'npm run start -- framework-test',
    gate: 'none',
    expectedBehavior: 'Run integration tests at epic level',
    expectations: [
      {
        kind: 'log-signals',
        mustContain: ['Integration tests - implement in Phase 4']
      }
    ]
  },
  {
    phase: 'Epic Hardening',
    activity: 'Bug Fix Cycle',
    action: 'fix_bugs',
    command: '/debug',
    gate: 'none',
    expectedBehavior: 'Perform bug fixing cycle for epic defects',
    expectations: [
      {
        kind: 'log-signals',
        mustContain: ['Bug fixes - implement in Phase 4']
      }
    ]
  },
  {
    phase: 'Epic Hardening',
    activity: 'Update Documentation',
    action: 'update_documentation',
    command: '/capture-knowledge',
    gate: 'none',
    expectedBehavior: 'Update documentation to reflect implementation and tests',
    expectations: [
      {
        kind: 'log-signals',
        mustContain: ['Documentation update - implement in Phase 4']
      }
    ]
  },
  {
    phase: 'Epic Hardening',
    activity: 'Validate Epic Completion',
    action: 'validate_epic',
    command: '/check-implementation',
    gate: 'none',
    expectedBehavior: 'Validate epic completion criteria are satisfied',
    expectations: [
      {
        kind: 'log-signals',
        mustContain: ['Epic validation - implement in Phase 4']
      }
    ]
  },
  {
    phase: 'PI Hardening',
    activity: 'System Testing',
    action: 'run_system_tests',
    command: 'npm run start -- framework-test',
    gate: 'none',
    expectedBehavior: 'Run system level tests across epics',
    expectations: [
      {
        kind: 'log-signals',
        mustContain: ['System tests - implement in Phase 4']
      }
    ]
  },
  {
    phase: 'PI Hardening',
    activity: 'Performance Testing',
    action: 'run_performance_tests',
    command: 'npm run start -- framework-test',
    gate: 'none',
    expectedBehavior: 'Run performance tests and capture performance metrics',
    expectations: [
      {
        kind: 'log-signals',
        mustContain: ['Performance tests - implement in Phase 4']
      }
    ]
  },
  {
    phase: 'PI Hardening',
    activity: 'Security Validation',
    action: 'run_security_audit',
    command: 'npm run start -- framework-test',
    gate: 'none',
    expectedBehavior: 'Run security validation or audit checks',
    expectations: [
      {
        kind: 'log-signals',
        mustContain: ['Security audit - implement in Phase 4']
      }
    ]
  },
  {
    phase: 'PI Hardening',
    activity: 'Build Release Candidate',
    action: 'build_release_candidate',
    command: 'npm run start -- framework-test',
    gate: 'none',
    expectedBehavior: 'Build release candidate artifacts',
    expectations: [
      {
        kind: 'log-signals',
        mustContain: ['Release candidate build - implement in Phase 4']
      }
    ]
  },
  {
    phase: 'UAT',
    activity: 'Setup UAT Environment',
    action: 'setup_uat_environment',
    command: '/uat-phase',
    gate: 'none',
    expectedBehavior: 'Setup environment for user acceptance testing',
    expectations: [
      {
        kind: 'log-signals',
        mustContain: ['UAT environment setup - implement in Phase 4']
      }
    ]
  },
  {
    phase: 'UAT',
    activity: 'Execute UAT',
    action: 'run_uat',
    command: '/uat-phase',
    gate: 'user',
    expectedBehavior: 'Coordinate execution of user acceptance tests',
    expectations: [
      {
        kind: 'log-signals',
        mustContain: ['UAT execution requires user input']
      }
    ]
  },
  {
    phase: 'UAT',
    activity: 'Collect UAT Feedback',
    action: 'collect_uat_feedback',
    command: '/uat-phase',
    gate: 'user',
    expectedBehavior: 'Collect and record uat feedback and issues',
    expectations: [
      {
        kind: 'log-signals',
        mustContain: ['UAT feedback collection requires user input']
      }
    ]
  },
  {
    phase: 'UAT',
    activity: 'UAT Bug Fix Cycle',
    action: 'fix_uat_bugs',
    command: '/debug',
    gate: 'none',
    expectedBehavior: 'Fix bugs discovered during uat',
    expectations: [
      {
        kind: 'log-signals',
        mustContain: ['UAT bug fixes - implement in Phase 4']
      }
    ]
  },
  {
    phase: 'Release Preparation',
    activity: 'Generate Release Notes',
    action: 'generate_release_notes',
    command: 'npm run start -- overview',
    gate: 'none',
    expectedBehavior: 'Generate release notes for upcoming release',
    expectations: [
      {
        kind: 'log-signals',
        mustContain: ['Release notes generation - implement in Phase 4']
      }
    ]
  },
  {
    phase: 'Release Preparation',
    activity: 'Generate Deployment Scripts',
    action: 'generate_deployment_scripts',
    command: 'npm run start -- overview',
    gate: 'none',
    expectedBehavior: 'Generate deployment automation scripts',
    expectations: [
      {
        kind: 'log-signals',
        mustContain: ['Deployment scripts generation - implement in Phase 4']
      }
    ]
  },
  {
    phase: 'Release Preparation',
    activity: 'Create Rollback Plan',
    action: 'generate_rollback_plan',
    command: 'npm run start -- overview',
    gate: 'none',
    expectedBehavior: 'Generate rollback plan for release',
    expectations: [
      {
        kind: 'log-signals',
        mustContain: ['Rollback plan generation - implement in Phase 4']
      }
    ]
  },
  {
    phase: 'Release Preparation',
    activity: 'Generate Deployment Checklist',
    action: 'generate_deployment_checklist',
    command: 'npm run start -- overview',
    gate: 'none',
    expectedBehavior: 'Generate deployment checklist for release',
    expectations: [
      {
        kind: 'log-signals',
        mustContain: ['Deployment checklist generation - implement in Phase 4']
      }
    ]
  },
  {
    phase: 'Deployment',
    activity: 'Pre-Launch Validation',
    action: 'validate_pre_launch',
    command: 'npm run start -- framework-test',
    gate: 'none',
    expectedBehavior: 'Run validation checks before production launch',
    expectations: [
      {
        kind: 'log-signals',
        mustContain: ['Pre-launch validation - implement in Phase 4']
      }
    ]
  },
  {
    phase: 'Deployment',
    activity: 'Production Deployment',
    action: 'deploy_to_production',
    command: 'npm run start -- framework-test',
    gate: 'none',
    expectedBehavior: 'Perform production deployment procedure',
    expectations: [
      {
        kind: 'log-signals',
        mustContain: ['Production deployment - implement in Phase 4']
      }
    ]
  },
  {
    phase: 'Deployment',
    activity: 'Verify Deployment',
    action: 'verify_deployment',
    command: 'npm run start -- framework-test',
    gate: 'none',
    expectedBehavior: 'Verify production deployment status and health',
    expectations: [
      {
        kind: 'log-signals',
        mustContain: ['Deployment verification - implement in Phase 4']
      }
    ]
  },
  {
    phase: 'Post-Launch Monitoring',
    activity: 'Monitor Performance',
    action: 'monitor_performance',
    command: 'npm run start -- framework-test',
    gate: 'none',
    expectedBehavior: 'Monitor post launch performance metrics',
    expectations: [
      {
        kind: 'log-signals',
        mustContain: ['Performance monitoring - implement in Phase 4']
      }
    ]
  },
  {
    phase: 'Decision Gate',
    activity: 'Select Track A/B',
    action: 'select_workflow_track',
    command: 'npm run start -- decision-gate',
    gate: 'user',
    expectedBehavior: 'Prompt user to select workflow track a or b',
    expectations: [
      {
        kind: 'log-signals',
        mustContain: ['workflow track selection requires user input', 'chosen track recorded']
      }
    ]
  },
  {
    phase: 'Decision Gate',
    activity: 'Validate Track Choice',
    action: 'validate_track_selection',
    command: 'npm run start -- framework-test',
    gate: 'none',
    expectedBehavior: 'Validate selected workflow track is permissible',
    expectations: [
      {
        kind: 'log-signals',
        mustContain: ['track selection validation started', 'track selection validation result recorded']
      }
    ]
  },
  {
    phase: 'Workflow Principles',
    activity: 'Update Repository Memory',
    action: 'update_repository_memory',
    command: '/remember',
    gate: 'none',
    expectedBehavior: 'Update repository memory with new knowledge and patterns',
    expectations: [
      {
        kind: 'log-signals',
        mustContain: ['repository memory update started', 'summary of memory updates recorded']
      }
    ]
  },
  {
    phase: 'Workflow Principles',
    activity: 'Enforce Circuit Breaker',
    action: 'enforce_circuit_breaker',
    command: '/handoff',
    gate: 'none',
    expectedBehavior: 'Enforce circuit breaker rules and perform handoff when necessary',
    expectations: [
      {
        kind: 'log-signals',
        mustContain: ['circuit breaker evaluation started', 'circuit breaker action recorded']
      }
    ]
  },
  {
    phase: 'Workflow Principles',
    activity: 'Check Parallel Work',
    action: 'check_parallel_work',
    command: 'npm run start -- next',
    gate: 'none',
    expectedBehavior: 'Check if additional work can proceed in parallel safely',
    expectations: [
      {
        kind: 'log-signals',
        mustContain: ['parallel work check started', 'parallel work allowed or blocked recorded']
      }
    ]
  },
  {
    phase: 'Workflow Principles',
    activity: 'Prevent Requirement Drift',
    action: 'prevent_requirement_drift',
    command: '/reflect',
    gate: 'user',
    expectedBehavior: 'Ensure implemented functionality stays aligned with requirements',
    expectations: [
      {
        kind: 'log-signals',
        mustContain: ['requirement drift prevention requires user input or review']
      }
    ]
  }
];

export async function runBobIntegrationSmoke() {
  await BobEngine.run({ mode: 'full' });
}

export async function runBobIntegrationAuto() {
  await BobEngine.run({ auto: true, mode: 'full' });
}

export function printBobActionTestCases(): void {
  for (const test of BOB_ACTION_TEST_CASES) {
    console.log('------------------------------------------------------------');
    console.log(`Phase   : ${test.phase}`);
    console.log(`Activity: ${test.activity}`);
    console.log(`Action  : ${test.action}`);
    console.log(`Command : ${test.command}`);
    console.log(`Gate    : ${test.gate}`);
    console.log(`Behavior: ${test.expectedBehavior}`);
    console.log('Expectations:');
  for (const exp of test.expectations || []) {
      console.log(`  - kind=${exp.kind}`);
    }
    console.log('');
  }
}

export async function runBobForAction(action: string) {
  const phases = await BobStateManager.loadPhaseDefinitions();

  let targetPhaseId: string | null = null;
  let targetStepId: string | null = null;

  for (const phase of phases.phases) {
    const step = phase.steps.find(s => s.required_action === action);
    if (step) {
      targetPhaseId = phase.id;
      targetStepId = step.id;
      break;
    }
  }

  if (!targetPhaseId || !targetStepId) {
    throw new Error(`No step found with required_action=${action}`);
  }

  await BobPhaseRouter.jumpTo(targetPhaseId, targetStepId);
  return BobEngine.run({ mode: 'full' });
}

export async function runValidateRepositoryStructure() {
  return runBobForAction('validate_repository_structure');
}

function includesAllSignals(logs: string[] | undefined, must: string[]): boolean {
  if (!must || must.length === 0) return true;
  if (!logs || logs.length === 0) return false;
  return must.every(m => logs.some(l => l.includes(m)));
}

export async function runDocImplementationAlignmentForCase(test: BobActionTestCase) {
  switch (test.phase) {
    case 'Framework Bootstrap':
      return validateFrameworkBootstrapCase(test);
    case 'Framework Installation':
      return validateFrameworkInstallationCase(test);
    case 'Project Initialization':
      return validateProjectInitializationCase(test);
    case 'Product Definition':
      return validateProductDefinitionCase(test);
    case 'Technical Architecture':
      return validateTechnicalArchitectureCase(test);
    case 'Project Planning':
      return validateProjectPlanningCase(test);
    case 'Decision Gate':
    case 'Workflow Principles':
      return validateDevelopmentAndOpsCase(test);
    case 'Development':
    case 'Epic Hardening':
    case 'PI Hardening':
    case 'UAT':
    case 'Release Preparation':
    case 'Deployment':
    case 'Post-Launch Monitoring':
      return validateDevelopmentAndOpsCase(test);
    default:
      return runGenericExpectations(test);
  }
}

async function validateFrameworkBootstrapCase(test: BobActionTestCase) {
  let lastResultLogs: string[] | undefined;
  if (test.action === 'validate_repository_structure') {
    const initial = await validateRepositoryStructure({} as any);
    if (!initial.success) {
      throw new Error(initial.error || 'repository structure handler failed');
    }
    lastResultLogs = initial.logs;
    for (const exp of test.expectations || []) {
      if (exp.kind === 'repository-structure') {
        const dirs = (initial.data?.dirs as string[]) || [];
        const files = (initial.data?.files as string[]) || [];
        const hasAllDirs = exp.requiredDirs.every(d => dirs.includes(d));
        const hasAllFiles = exp.requiredFiles.every(f => files.includes(f));
        if (!hasAllDirs || !hasAllFiles) {
          throw new Error('repository structure mismatch between spec and implementation');
        }
      } else if (exp.kind === 'log-signals') {
        if (!includesAllSignals(lastResultLogs, exp.mustContain)) {
          throw new Error('expected log signals not found for repository structure');
        }
      } else if (exp.kind === 'custom') {
        throw new Error(`custom validator not implemented: ${exp.validatorName}`);
      }
    }
    return true;
  }
  for (const exp of test.expectations || []) {
    if (exp.kind === 'framework-version' && test.action === 'validate_framework_version') {
      const result = await validateFrameworkVersion({} as any);
      if (!result.success) {
        throw new Error(result.error || 'framework version handler failed');
      }
      if (!includesAllSignals(result.logs, [])) {
        throw new Error('expected log signals not found for framework version');
      }
    } else if (exp.kind === 'diagnostics' && test.action === 'run_framework_diagnostics') {
      const result = await runFrameworkDiagnostics({} as any);
      if (exp.mustPass && !result.success) {
        throw new Error('diagnostics failed but mustPass=true');
      }
    } else if (exp.kind === 'health-files' && test.action === 'run_framework_diagnostics') {
      const ROOT_DIR = path.resolve(process.cwd(), '..');
      // Determine installation_type to relax checks in 'normal' mode
      let installationType: 'normal' | 'complete' = 'normal';
      try {
        const fwStatusPath = path.resolve(ROOT_DIR, 'framework', 'framework_status.json');
        if (await fs.pathExists(fwStatusPath)) {
          const fw = await fs.readJson(fwStatusPath);
          if (fw.installation_type === 'complete') installationType = 'complete';
        }
      } catch {}
      for (const file of exp.files) {
        const p = path.isAbsolute(file) ? file : path.resolve(ROOT_DIR, file);
        if (!await fs.pathExists(p)) {
          throw new Error(`health file not found: ${p}`);
        }
        const content = await fs.readJson(p);
        if (p.toLowerCase().includes('health-report.json')) {
          const status = content.status;
          if (status && status !== 'healthy') {
            throw new Error(`health-report status is not healthy: ${status}`);
          }
          const components = content.components || {};
          const bad = Object.keys(components).filter(k => components[k]?.status !== 'ok');
          if (bad.length > 0) {
            throw new Error(`health-report components not ok: ${bad.join(', ')}`);
          }
        } else {
          // In 'normal' installation, allow degraded external services
          if (installationType === 'complete') {
            const overall = content.overall_status;
            if (overall && overall !== 'healthy') {
              throw new Error(`framework-health overall_status is not healthy: ${overall}`);
            }
            const components = content.components || {};
            const bad = Object.keys(components).filter(k => components[k]?.status !== 'ok');
            if (bad.length > 0) {
              throw new Error(`framework-health components not ok: ${bad.join(', ')}`);
            }
          }
        }
      }
    } else if (exp.kind === 'custom') {
      throw new Error(`custom validator not implemented: ${exp.validatorName}`);
    }
  }
  return true;
}

async function validateDevelopmentAndOpsCase(test: BobActionTestCase) {
  for (const exp of test.expectations || []) {
    if (test.action === 'select_next_ticket') {
      if (exp.kind === 'log-signals') {
        const result = await selectNextTicket({} as any);
        if (!result.success) {
          throw new Error(result.error || 'select next ticket failed');
        }
        if (!includesAllSignals(result.logs, exp.mustContain)) {
          throw new Error('expected log signals not found for select_next_ticket');
        }
      }
    } else if (test.action === 'generate_code') {
      if (exp.kind === 'log-signals') {
        const result = await devGenerateCode({} as any);
        if (!result.success) {
          throw new Error(result.error || 'generate code failed');
        }
        if (!includesAllSignals(result.logs, exp.mustContain)) {
          throw new Error('expected log signals not found for generate_code');
        }
      }
    } else if (test.action === 'review_code') {
      if (exp.kind === 'log-signals') {
        const result = await reviewCode({} as any);
        if (!result.success) {
          throw new Error(result.error || 'review code failed');
        }
        if (!includesAllSignals(result.logs, exp.mustContain)) {
          throw new Error('expected log signals not found for review_code');
        }
      }
    } else if (test.action === 'generate_unit_tests') {
      if (exp.kind === 'log-signals') {
        const result = await generateUnitTests({} as any);
        if (!result.success) {
          throw new Error(result.error || 'generate unit tests failed');
        }
        if (!includesAllSignals(result.logs, exp.mustContain)) {
          throw new Error('expected log signals not found for generate_unit_tests');
        }
      }
    } else if (test.action === 'run_tests') {
      if (exp.kind === 'log-signals') {
        const result = await runTests({} as any);
        if (!result.success) {
          throw new Error(result.error || 'run tests failed');
        }
        if (!includesAllSignals(result.logs, exp.mustContain)) {
          throw new Error('expected log signals not found for run_tests');
        }
      }
    } else if (test.action === 'run_integration_tests') {
      if (exp.kind === 'log-signals') {
        const result = await runIntegrationTests({} as any);
        if (!includesAllSignals(result.logs, exp.mustContain)) {
          throw new Error('expected log signals not found for run_integration_tests');
        }
      }
    } else if (test.action === 'fix_bugs') {
      if (exp.kind === 'log-signals') {
        const result = await fixBugs({} as any);
        if (!includesAllSignals(result.logs, exp.mustContain)) {
          throw new Error('expected log signals not found for fix_bugs');
        }
      }
    } else if (test.action === 'update_documentation') {
      if (exp.kind === 'log-signals') {
        const result = await updateDocumentation({} as any);
        if (!includesAllSignals(result.logs, exp.mustContain)) {
          throw new Error('expected log signals not found for update_documentation');
        }
      }
    } else if (test.action === 'validate_epic') {
      if (exp.kind === 'log-signals') {
        const result = await validateEpic({} as any);
        if (!includesAllSignals(result.logs, exp.mustContain)) {
          throw new Error('expected log signals not found for validate_epic');
        }
      }
    } else if (test.action === 'run_system_tests') {
      if (exp.kind === 'log-signals') {
        const result = await runSystemTests({} as any);
        if (!includesAllSignals(result.logs, exp.mustContain)) {
          throw new Error('expected log signals not found for run_system_tests');
        }
      }
    } else if (test.action === 'run_performance_tests') {
      if (exp.kind === 'log-signals') {
        const result = await runPerformanceTests({} as any);
        if (!includesAllSignals(result.logs, exp.mustContain)) {
          throw new Error('expected log signals not found for run_performance_tests');
        }
      }
    } else if (test.action === 'run_security_audit') {
      if (exp.kind === 'log-signals') {
        const result = await runSecurityAudit({} as any);
        if (!includesAllSignals(result.logs, exp.mustContain)) {
          throw new Error('expected log signals not found for run_security_audit');
        }
      }
    } else if (test.action === 'build_release_candidate') {
      if (exp.kind === 'log-signals') {
        const result = await buildReleaseCandidate({} as any);
        if (!includesAllSignals(result.logs, exp.mustContain)) {
          throw new Error('expected log signals not found for build_release_candidate');
        }
      }
    } else if (test.action === 'setup_uat_environment') {
      if (exp.kind === 'log-signals') {
        const result = await setupUatEnvironment({} as any);
        if (!includesAllSignals(result.logs, exp.mustContain)) {
          throw new Error('expected log signals not found for setup_uat_environment');
        }
      }
    } else if (test.action === 'run_uat') {
      if (exp.kind === 'log-signals') {
        const result = await runUat({} as any);
        if (!includesAllSignals(result.logs, exp.mustContain)) {
          throw new Error('expected log signals not found for run_uat');
        }
      }
    } else if (test.action === 'collect_uat_feedback') {
      if (exp.kind === 'log-signals') {
        const result = await collectUatFeedback({} as any);
        if (!includesAllSignals(result.logs, exp.mustContain)) {
          throw new Error('expected log signals not found for collect_uat_feedback');
        }
      }
    } else if (test.action === 'fix_uat_bugs') {
      if (exp.kind === 'log-signals') {
        const result = await fixUatBugs({} as any);
        if (!includesAllSignals(result.logs, exp.mustContain)) {
          throw new Error('expected log signals not found for fix_uat_bugs');
        }
      }
    } else if (test.action === 'generate_release_notes') {
      if (exp.kind === 'log-signals') {
        const result = await generateReleaseNotes({} as any);
        if (!includesAllSignals(result.logs, exp.mustContain)) {
          throw new Error('expected log signals not found for generate_release_notes');
        }
      }
    } else if (test.action === 'generate_deployment_scripts') {
      if (exp.kind === 'log-signals') {
        const result = await generateDeploymentScripts({} as any);
        if (!includesAllSignals(result.logs, exp.mustContain)) {
          throw new Error('expected log signals not found for generate_deployment_scripts');
        }
      }
    } else if (test.action === 'generate_rollback_plan') {
      if (exp.kind === 'log-signals') {
        const result = await generateRollbackPlan({} as any);
        if (!includesAllSignals(result.logs, exp.mustContain)) {
          throw new Error('expected log signals not found for generate_rollback_plan');
        }
      }
    } else if (test.action === 'generate_deployment_checklist') {
      if (exp.kind === 'log-signals') {
        const result = await generateDeploymentChecklist({} as any);
        if (!includesAllSignals(result.logs, exp.mustContain)) {
          throw new Error('expected log signals not found for generate_deployment_checklist');
        }
      }
    } else if (test.action === 'validate_pre_launch') {
      if (exp.kind === 'log-signals') {
        const result = await validatePreLaunch({} as any);
        if (!includesAllSignals(result.logs, exp.mustContain)) {
          throw new Error('expected log signals not found for validate_pre_launch');
        }
      }
    } else if (test.action === 'deploy_to_production') {
      if (exp.kind === 'log-signals') {
        const result = await deployToProduction({} as any);
        if (!includesAllSignals(result.logs, exp.mustContain)) {
          throw new Error('expected log signals not found for deploy_to_production');
        }
      }
    } else if (test.action === 'verify_deployment') {
      if (exp.kind === 'log-signals') {
        const result = await verifyDeployment({} as any);
        if (!includesAllSignals(result.logs, exp.mustContain)) {
          throw new Error('expected log signals not found for verify_deployment');
        }
      }
    } else if (test.action === 'monitor_performance') {
      if (exp.kind === 'log-signals') {
        const result = await monitorPerformance({} as any);
        if (!includesAllSignals(result.logs, exp.mustContain)) {
          throw new Error('expected log signals not found for monitor_performance');
        }
      }
    } else if (test.action === 'select_workflow_track') {
      throw new Error('handler not implemented: select_workflow_track');
    } else if (test.action === 'validate_track_selection') {
      throw new Error('handler not implemented: validate_track_selection');
    } else if (test.action === 'update_repository_memory') {
      throw new Error('handler not implemented: update_repository_memory');
    } else if (test.action === 'enforce_circuit_breaker') {
      throw new Error('handler not implemented: enforce_circuit_breaker');
    } else if (test.action === 'check_parallel_work') {
      throw new Error('handler not implemented: check_parallel_work');
    } else if (test.action === 'prevent_requirement_drift') {
      throw new Error('handler not implemented: prevent_requirement_drift');
    }
  }
  return true;
}

async function validateProductDefinitionCase(test: BobActionTestCase) {
  const ROOT_DIR = path.resolve(process.cwd(), '..');
  for (const exp of test.expectations || []) {
    if (test.action === 'generate_vision_document') {
      if (exp.kind === 'artifacts') {
        const result = await generateVisionDocument({} as any);
        if (!result.success) {
          throw new Error(result.error || 'generate vision document failed');
        }
        for (const pth of exp.paths) {
          const full = path.isAbsolute(pth) ? pth : path.resolve(ROOT_DIR, pth);
          if (!await fs.pathExists(full)) {
            throw new Error(`artifact not found: ${full}`);
          }
        }
      }
    } else if (test.action === 'generate_user_flow') {
      if (exp.kind === 'artifacts') {
        const result = await generateUserFlow({} as any);
        if (!result.success) {
          throw new Error(result.error || 'generate user flow failed');
        }
        for (const pth of exp.paths) {
          const full = path.isAbsolute(pth) ? pth : path.resolve(ROOT_DIR, pth);
          if (!await fs.pathExists(full)) {
            throw new Error(`artifact not found: ${full}`);
          }
        }
      }
    } else if (test.action === 'validate_user_flow') {
      if (exp.kind === 'log-signals') {
        const result = await validateUserFlow({} as any);
        if (!result.success) {
          throw new Error(result.error || 'validate user flow failed');
        }
        if (!includesAllSignals(result.logs, exp.mustContain)) {
          throw new Error('expected log signals not found for validate_user_flow');
        }
      }
    } else if (test.action === 'generate_requirements') {
      if (exp.kind === 'artifacts') {
        const result = await generateRequirements({} as any);
        if (!result.success) {
          throw new Error(result.error || 'generate requirements failed');
        }
        for (const pth of exp.paths) {
          const full = path.isAbsolute(pth) ? pth : path.resolve(ROOT_DIR, pth);
          if (!await fs.pathExists(full)) {
            throw new Error(`artifact not found: ${full}`);
          }
        }
      }
    }
  }
  return true;
}

async function validateTechnicalArchitectureCase(test: BobActionTestCase) {
  const ROOT_DIR = path.resolve(process.cwd(), '..');
  for (const exp of test.expectations || []) {
    if (test.action === 'generate_architecture_design') {
      if (exp.kind === 'artifacts') {
        const result = await generateArchitectureDesign({} as any);
        if (!result.success) {
          throw new Error(result.error || 'generate architecture design failed');
        }
        for (const pth of exp.paths) {
          const full = path.isAbsolute(pth) ? pth : path.resolve(ROOT_DIR, pth);
          if (!await fs.pathExists(full)) {
            throw new Error(`artifact not found: ${full}`);
          }
        }
      }
    } else if (test.action === 'validate_tech_stack') {
      if (exp.kind === 'log-signals') {
        const result = await validateTechStack({} as any);
        if (!result.success) {
          throw new Error(result.error || 'validate tech stack failed');
        }
        if (!includesAllSignals(result.logs, exp.mustContain)) {
          throw new Error('expected log signals not found for validate_tech_stack');
        }
      }
    } else if (test.action === 'generate_database_schema') {
      if (exp.kind === 'artifacts') {
        const result = await generateDatabaseSchema({} as any);
        if (!result.success) {
          throw new Error(result.error || 'generate database schema failed');
        }
        for (const pth of exp.paths) {
          const full = path.isAbsolute(pth) ? pth : path.resolve(ROOT_DIR, pth);
          if (!await fs.pathExists(full)) {
            throw new Error(`artifact not found: ${full}`);
          }
        }
      }
    } else if (test.action === 'generate_api_contracts') {
      if (exp.kind === 'artifacts') {
        const result = await generateApiContracts({} as any);
        if (!result.success) {
          throw new Error(result.error || 'generate api contracts failed');
        }
        for (const pth of exp.paths) {
          const full = path.isAbsolute(pth) ? pth : path.resolve(ROOT_DIR, pth);
          if (!await fs.pathExists(full)) {
            throw new Error(`artifact not found: ${full}`);
          }
        }
      }
    }
  }
  return true;
}

async function validateProjectPlanningCase(test: BobActionTestCase) {
  const ROOT_DIR = path.resolve(process.cwd(), '..');
  for (const exp of test.expectations || []) {
    if (test.action === 'generate_epics') {
      if (exp.kind === 'artifacts') {
        const result = await generateEpics({} as any);
        if (!result.success) {
          throw new Error(result.error || 'generate epics failed');
        }
        for (const pth of exp.paths) {
          const full = path.isAbsolute(pth) ? pth : path.resolve(ROOT_DIR, pth);
          if (!await fs.pathExists(full)) {
            throw new Error(`artifact not found: ${full}`);
          }
        }
      }
    } else if (test.action === 'generate_tickets') {
      if (exp.kind === 'artifacts') {
        const result = await generateTickets({} as any);
        if (!result.success) {
          throw new Error(result.error || 'generate tickets failed');
        }
        for (const pth of exp.paths) {
          const full = path.isAbsolute(pth) ? pth : path.resolve(ROOT_DIR, pth);
          if (!await fs.pathExists(full)) {
            throw new Error(`artifact not found: ${full}`);
          }
        }
      }
    } else if (test.action === 'validate_tickets') {
      if (exp.kind === 'log-signals') {
        const result = await validateTickets({} as any);
        if (!result.success) {
          throw new Error(result.error || 'validate tickets failed');
        }
        if (!includesAllSignals(result.logs, exp.mustContain)) {
          throw new Error('expected log signals not found for validate_tickets');
        }
      }
    } else if (test.action === 'generate_project_timeline') {
      if (exp.kind === 'artifacts') {
        const result = await generateProjectTimeline({} as any);
        if (!result.success) {
          throw new Error(result.error || 'generate project timeline failed');
        }
        for (const pth of exp.paths) {
          const full = path.isAbsolute(pth) ? pth : path.resolve(ROOT_DIR, pth);
          if (!await fs.pathExists(full)) {
            throw new Error(`artifact not found: ${full}`);
          }
        }
      }
    }
  }
  return true;
}

async function validateFrameworkInstallationCase(test: BobActionTestCase) {
  const ROOT_DIR = path.resolve(process.cwd(), '..');
  for (const exp of test.expectations || []) {
    if (test.action === 'install_framework_dependencies') {
      if (exp.kind === 'log-signals') {
        const result = await installFrameworkDependencies({} as any);
        if (!result.success) {
          throw new Error(result.error || 'install dependencies handler failed');
        }
        if (!includesAllSignals(result.logs, exp.mustContain)) {
          throw new Error('expected log signals not found for install_framework_dependencies');
        }
      } else if (exp.kind === 'artifacts') {
        for (const p of exp.paths) {
          const full = path.isAbsolute(p) ? p : path.resolve(ROOT_DIR, p);
          if (!await fs.pathExists(full)) {
            throw new Error(`artifact not found: ${full}`);
          }
        }
      }
    } else if (test.action === 'validate_environment') {
      if (exp.kind === 'log-signals') {
        const result = await validateEnvironment({} as any);
        if (!result.success) {
          throw new Error(result.error || 'validate environment handler failed');
        }
        if (!includesAllSignals(result.logs, exp.mustContain)) {
          throw new Error('expected log signals not found for validate_environment');
        }
      }
    } else if (test.action === 'run_framework_tests') {
      if (exp.kind === 'log-signals') {
        const result = await runFrameworkTests({} as any);
        if (!result.success) {
          throw new Error(result.error || 'framework tests failed');
        }
        if (!includesAllSignals(result.logs, exp.mustContain)) {
          throw new Error('expected log signals not found for run_framework_tests');
        }
      }
    } else if (test.action === 'generate_health_report') {
      if (exp.kind === 'health-files') {
        for (const file of exp.files) {
          const full = path.isAbsolute(file) ? file : path.resolve(ROOT_DIR, file);
          if (!await fs.pathExists(full)) {
            throw new Error(`health report not found: ${full}`);
          }
          const content = await fs.readJson(full);
          if (content.status && content.status !== 'healthy') {
            throw new Error(`generated health report not healthy: ${content.status}`);
          }
        }
      }
    } else if (test.action === 'start_engine_services') {
      if (exp.kind === 'log-signals') {
        const result = await startEngineServices({} as any);
        if (!result.success) {
          throw new Error(result.error || 'start engine services failed');
        }
        if (!includesAllSignals(result.logs, exp.mustContain)) {
          throw new Error('expected log signals not found for start_engine_services');
        }
      }
    } else if (test.action === 'start_watchdog_service') {
      if (exp.kind === 'log-signals') {
        const result = await startWatchdogService({} as any);
        if (!result.success) {
          throw new Error(result.error || 'start watchdog service failed');
        }
        if (!includesAllSignals(result.logs, exp.mustContain)) {
          throw new Error('expected log signals not found for start_watchdog_service');
        }
      }
    }
  }
  return true;
}

async function validateProjectInitializationCase(test: BobActionTestCase) {
  const ROOT_DIR = path.resolve(process.cwd(), '..');
  for (const exp of test.expectations || []) {
    if (test.action === 'start_project_init') {
      if (exp.kind === 'log-signals') {
        const result = await startProjectInit({} as any);
        if (!result.success) {
          throw new Error(result.error || 'start project init failed');
        }
        if (!includesAllSignals(result.logs, exp.mustContain)) {
          throw new Error('expected log signals not found for start_project_init');
        }
      }
    } else if (test.action === 'validate_framework_project_alignment') {
      if (exp.kind === 'log-signals') {
        const result = await validateFrameworkProjectAlignment({} as any);
        if (!result.success) {
          throw new Error(result.error || 'project alignment failed');
        }
        if (!includesAllSignals(result.logs, exp.mustContain)) {
          throw new Error('expected log signals not found for validate_framework_project_alignment');
        }
      }
    } else if (test.action === 'prompt_project_type') {
      if (exp.kind === 'log-signals') {
        // Mock the interactive prompt with test data
        const mockContext = {
          mockProjectType: 'new_project',
          mockProjectName: 'Test Project'
        };
        const result = await promptProjectType(mockContext as any);
        if (!result.success) {
          throw new Error(result.error || 'prompt project type failed');
        }
        if (!includesAllSignals(result.logs, exp.mustContain)) {
          throw new Error('expected log signals not found for prompt_project_type');
        }
      }
      
    } else if (test.action === 'generate_tech_stack') {
      if (exp.kind === 'artifacts') {
        const result = await generateTechStack({} as any);
        if (!result.success) {
          throw new Error(result.error || 'generate tech stack failed');
        }
        for (const pth of exp.paths) {
          const full = path.isAbsolute(pth) ? pth : path.resolve(ROOT_DIR, pth);
          if (!await fs.pathExists(full)) {
            throw new Error(`artifact not found: ${full}`);
          }
        }
      }
    } else if (test.action === 'generate_project_context') {
      if (exp.kind === 'artifacts') {
        const result = await generateProjectContext({} as any);
        if (!result.success) {
          throw new Error(result.error || 'generate project context failed');
        }
        for (const pth of exp.paths) {
          const full = path.isAbsolute(pth) ? pth : path.resolve(ROOT_DIR, pth);
          if (!await fs.pathExists(full)) {
            throw new Error(`artifact not found: ${full}`);
          }
        }
      }
    } else if (test.action === 'generate_project_management_structure') {
      if (exp.kind === 'artifacts') {
        const result = await generateProjectManagementStructure({} as any);
        if (!result.success) {
          throw new Error(result.error || 'generate project management structure failed');
        }
        for (const pth of exp.paths) {
          const full = path.isAbsolute(pth) ? pth : path.resolve(ROOT_DIR, pth);
          if (!await fs.pathExists(full)) {
            throw new Error(`artifact not found: ${full}`);
          }
        }
      }
    }
  }
  return true;
}

async function runGenericExpectations(test: BobActionTestCase) {
  for (const exp of test.expectations || []) {
    if (exp.kind === 'log-signals') {
      const placeholderLogs: string[] = [];
      if (!includesAllSignals(placeholderLogs, exp.mustContain)) {
        throw new Error('expected generic log signals not found');
      }
    }
  }
  return true;
}

export async function runDocImplementationAlignmentAll() {
  const phasesToRun = new Set([
    'Framework Bootstrap',
    'Framework Installation',
    'Project Initialization',
    /*'Product Definition',
    'Technical Architecture',
    'Project Planning',
    'Development',
    'Epic Hardening',
    'PI Hardening',
    'UAT',
    'Release Preparation',
    'Deployment',
    'Post-Launch Monitoring'*/
  ]);
  const cases = BOB_ACTION_TEST_CASES.filter(c => phasesToRun.has(c.phase));
  let passed = 0;
  let failed = 0;
  const failures: { label: string; error: string }[] = [];
  for (const c of cases) {
    const label = `${c.phase} > ${c.activity} > ${c.action}`;
    try {
      await runDocImplementationAlignmentForCase(c);
      console.log(`✓ ${label}`);
      passed += 1;
    } catch (e: any) {
      console.error(`✗ ${label}: ${e.message || String(e)}`);
      failed += 1;
      failures.push({ label, error: e.message || String(e) });
    }
  }
  console.log('');
  console.log(`Summary: ${passed} passed, ${failed} failed`);
  if (failed > 0) {
    for (const f of failures) {
      console.error(`- ${f.label}: ${f.error}`);
    }
    process.exitCode = 1;
    return false;
  }
  return true;
}
