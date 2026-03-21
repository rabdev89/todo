/**
 * Bob Framework Type Definitions
 *
 * Comprehensive type system for the BOB AI Software Development Workflow Framework
 */
/**
 * Step status types
 */
export type StepStatus = 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
/**
 * Phase status types
 */
export type PhaseStatus = 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
/**
 * Framework status types
 */
export type FrameworkStatusType = 'pending' | 'running' | 'completed' | 'waiting_user' | 'paused' | 'failed';
/**
 * Workflow mode types
 */
export type WorkflowMode = 'lean' | 'full';
/**
 * Step state information
 */
export interface StepState {
    status: StepStatus;
    started_at: string | null;
    completed_at: string | null;
    result: Record<string, unknown> | null;
    error: string | null;
}
/**
 * Phase state information
 */
export interface PhaseState {
    status: PhaseStatus;
    started_at: string | null;
    completed_at: string | null;
    steps: Record<string, StepState>;
    current_ticket?: string | null;
}
/**
 * Framework error tracking
 */
export interface FrameworkError {
    phase: string;
    step: string;
    message: string;
    timestamp: string;
}
/**
 * Metrics tracking
 */
export interface FrameworkMetrics {
    total_phases: number;
    completed_phases: number;
    total_steps: number;
    completed_steps: number;
    started_at: string | null;
    estimated_completion: string | null;
}
/**
 * Metadata storage
 */
export interface FrameworkMetadata {
    last_action: string | null;
    last_action_result: Record<string, unknown> | null;
    user_approvals_required: string[];
    user_approvals_granted: string[];
    skipped_phases: string[];
    custom_data: Record<string, unknown>;
}
/**
 * Main framework status document
 */
export interface FrameworkStatus {
    $schema?: string;
    framework_version: string;
    last_updated: string;
    current_phase: string;
    current_step: string;
    current_layer: 'ticket' | 'epic' | 'pi' | null;
    status: FrameworkStatusType;
    mode: WorkflowMode;
    installation_type: 'normal' | 'complete';
    project_type: string | null;
    project_name: string | null;
    current_ticket_id?: string | null;
    current_epic_id?: string | null;
    current_pi_id?: string | null;
    current_track?: 'A' | 'B' | null;
    phases: Record<string, PhaseState>;
    metrics: FrameworkMetrics;
    errors: FrameworkError[];
    metadata: FrameworkMetadata;
}
/**
 * Step definition from phases
 */
export interface Step {
    id: string;
    name: string;
    description: string;
    next_step?: string;
    requires_approval?: boolean;
    action_handler?: string;
    required_action?: string;
    skippable?: boolean;
    user_input_required?: boolean;
}
/**
 * Phase definition
 */
export interface Phase {
    id: string;
    name: string;
    description: string;
    order: number;
    steps: Step[];
    parallel_allowed?: boolean;
    requires_completion?: boolean;
    skippable?: boolean;
}
/**
 * Project type configuration
 */
export interface ProjectTypeConfig {
    id: string;
    name: string;
    description: string;
    skip_phases: string[];
    default_mode: WorkflowMode;
}
/**
 * Phase definitions document
 */
export interface PhaseDefinition {
    framework_version: string;
    phases: Phase[];
    project_types?: Record<string, ProjectTypeConfig>;
}
/**
 * Command execution result
 */
export interface CommandResult {
    success: boolean;
    phase: string;
    step: string;
    message?: string;
    data?: Record<string, unknown>;
    error?: string;
    timestamp: string;
}
/**
 * Action handler context
 */
export interface ActionContext {
    phase: Phase;
    step: Step;
    status: FrameworkStatus;
    phases?: PhaseDefinition;
    mode?: WorkflowMode;
    projectType?: string;
}
/**
 * Dashboard data
 */
export interface DashboardData {
    current_phase: Phase;
    current_step: Step;
    status: FrameworkStatus;
    recommended_next_actions: string[];
    blockers: string[];
}
/**
 * Result from an action handler execution
 */
export interface ActionResult {
    success: boolean;
    message?: string;
    data?: Record<string, unknown>;
    logs?: string[];
    error?: string;
    requires_input?: boolean;
    input_prompt?: string;
}
/**
 * Action handler function signature
 */
export type ActionHandler = (context: ActionContext) => Promise<ActionResult>;
/**
 * BOB Command Options
 */
export interface BobCommandOptions {
    auto?: boolean;
    reset?: boolean;
    phase?: string;
    step?: string;
    skipApprovals?: boolean;
    mode?: WorkflowMode;
}
/**
 * BOB Command Result
 */
export interface BobCommandResult {
    success: boolean;
    message?: string;
    phase: string;
    step: string;
    data?: Record<string, unknown>;
    error?: string;
    requiresUserInput?: boolean;
    requires_ai_input?: boolean;
    ai_context?: Record<string, unknown>;
    next_step?: string;
}
//# sourceMappingURL=types.d.ts.map