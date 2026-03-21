/**
 * Project Action Handlers
 *
 * Implements actions for Project Initialization and Product Definition phases.
 */
import type { ActionHandler } from '../types';
/**
 * Start project initialization
 */
export declare const startProjectInit: ActionHandler;
/**
 * Select project type (non-interactive) - AI-AGENT DRIVEN
 *
 * Workflow:
 * 1. User calls /bob
 * 2. If project_type/project_name NOT set: return requires_ai_input flag
 * 3. AI agent receives prompt, gathers info, updates framework_status.json
 * 4. AI agent calls /bob again
 * 5. Handler sees data, validates, returns success
 * 6. Bob advances to next step
 *
 * Bob stays on this action until data provided, even if /bob called multiple times.
 */
export declare const selectProjectType: ActionHandler;
/**
 * Prompt user for project type selection - INTERACTIVE
 */
export declare const promptProjectType: ActionHandler;
/**
 * Validate framework alignment with project type
 */
export declare const validateFrameworkProjectAlignment: ActionHandler;
/**
 * Generate tech stack configuration
 */
export declare const generateTechStack: ActionHandler;
/**
 * Generate project context
 */
export declare const generateProjectContext: ActionHandler;
/**
 * Setup UAT for continue_project - generates tech stack, project context, and PM structure
 */
export declare const setupContinueProjectUat: ActionHandler;
/**
 * Generate project management structure
 */
export declare const generateProjectManagementStructure: ActionHandler;
/**
 * Generate vision document - AI-AGENT DRIVEN
 *
 * Workflow:
 * 1. User/Bob calls generateVisionDocument
 * 2. If vision_details NOT set: return requires_ai_input flag
 * 3. AI agent interviews user, gathers problem/solution/users/features/metrics/timeline
 * 4. AI agent updates framework_status.json with vision_details
 * 5. AI agent calls /bob again
 * 6. Handler sees data, validates, generates vision.md with actual content
 * 7. Bob advances to next step
 *
 * Bob stays on this action until data provided, even if /bob called multiple times.
 */
export declare const generateVisionDocument: ActionHandler;
/**
 * User review of vision - AI-assisted approval
 *
 * User reviews the AI-generated vision.md file.
 * If they approve, Bob continues.
 * If they need changes, they edit vision.md and call /bob again.
 */
export declare const userReviewVision: ActionHandler;
/**
 * Generate user flow document - AI-AGENT DRIVEN
 *
 * Workflow:
 * 1. User/Bob calls generateUserFlow
 * 2. If user_flow_details NOT set: return requires_ai_input flag
 * 3. AI agent interviews user about user journeys and personas
 * 4. AI agent updates framework_status.json with user_flow_details
 * 5. AI agent calls /bob again
 * 6. Handler sees data, generates user_flow.md with actual content
 * 7. Bob advances to next step
 */
export declare const generateUserFlow: ActionHandler;
/**
 * User review of user flow - AI-assisted approval
 */
export declare const userReviewUserFlow: ActionHandler;
/**
 * Validate user flow
 */
export declare const validateUserFlow: ActionHandler;
/**
 * Generate comprehensive project requirements
 */
export declare const generateRequirements: ActionHandler;
/**
 * User review of requirements - AI-assisted approval
 */
export declare const userReviewRequirements: ActionHandler;
/**
 * Generate Design Bible - suggested 3 ambiance directions
 */
export declare const generateDesignBible: ActionHandler;
/**
 * Approve Design Bible - user selects preferred ambiance
 */
export declare const approveDesignBible: ActionHandler;
//# sourceMappingURL=project.d.ts.map