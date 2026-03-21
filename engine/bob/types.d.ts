/**
 * Bob Orchestration Engine - Type Definitions
 *
 * Core types for the state machine-driven workflow engine.
 */
export interface Step {
    id: string;
    name: string;
    description: string;
    required_action: string;
    user_input_required: boolean;
    next_step: string | null;
    estimated_duration?: string;
}
export interface Phase {
    id: string;
    name: string;
    description: string;
    entry_condition: string;
    exit_condition: string;
    skippable: boolean;
    steps: Step[];
}
export interface ProjectType {
    name: string;
    description: string;
    skip_phases: string[];
}
export interface PhaseDefinition {
    $schema?: string;
    framework_version: string;
    description?: string;
    phases: Phase[];
    project_types?: Record<string, ProjectType>;
    settings?: FrameworkSettings;
}
export interface FrameworkSettings {
    auto_advance: boolean;
    require_user_approval: boolean;
    dashboard_auto_generate: boolean;
    state_persistence: "file" | "memory";
    watchdog_interval_minutes: number;
}
export type StepStatus = "pending" | "running" | "completed" | "failed" | "skipped";
export type PhaseStatus = "pending" | "running" | "completed" | "failed" | "skipped";
export type FrameworkState = "pending" | "running" | "waiting_user" | "completed" | "failed" | "paused";
export type FrameworkMode = "full" | "lean";
export interface StepState {
    status: StepStatus;
    started_at: string | null;
    completed_at: string | null;
    result: Record<string, unknown> | null;
    error: string | null;
}
export interface PhaseState {
    status: PhaseStatus;
    started_at: string | null;
    completed_at: string | null;
    current_ticket?: string | null;
    steps: Record<string, StepState>;
}
export interface FrameworkMetrics {
    total_phases: number;
    completed_phases: number;
    total_steps: number;
    completed_steps: number;
    started_at: string | null;
    estimated_completion: string | null;
}
export interface FrameworkError {
    phase: string;
    step: string;
    message: string;
    timestamp: string;
}
export interface FrameworkMetadata {
    last_action: string | null;
    last_action_result: string | null;
    user_approvals_required: string[];
    user_approvals_granted: string[];
    skipped_phases: string[];
    custom_data: Record<string, unknown>;
}
export interface FrameworkStatus {
    $schema?: string;
    framework_version: string;
    last_updated: string;
    current_phase: string;
    current_step: string;
    current_layer?: "ticket" | "epic" | "pi" | null;
    status: FrameworkState;
    mode: FrameworkMode;
    project_type: string | null;
    project_name: string | null;
    current_ticket_id?: string | null;
    current_epic_id?: string | null;
    current_pi_id?: string | null;
    current_track?: "A" | "B" | null;
    phases: Record<string, PhaseState>;
    metrics: FrameworkMetrics;
    errors: FrameworkError[];
    metadata: FrameworkMetadata;
}
export interface ActionResult {
    success: boolean;
    data?: Record<string, unknown>;
    error?: string;
    logs?: string[];
}
export type ActionHandler = (context: ActionContext) => Promise<ActionResult>;
export interface ActionContext {
    phase: Phase;
    step: Step;
    state: FrameworkStatus;
    projectContext?: ProjectContext;
}
export interface ProjectContext {
    vision?: string;
    requirements?: string[];
    tech_stack?: TechStack;
    architecture?: string;
    epics?: Epic[];
    tickets?: Ticket[];
}
export interface TechStack {
    frontend?: string;
    backend?: string;
    database?: string;
    deployment?: string;
    testing?: string[];
    additional?: Record<string, string>;
}
export interface Epic {
    id: string;
    title: string;
    description: string;
    status: "draft" | "in_progress" | "completed";
    tickets: string[];
}
export interface Ticket {
    id: string;
    title: string;
    description: string;
    epic_id: string;
    status: "pending" | "in_progress" | "review" | "testing" | "completed";
    dependencies: string[];
    file_scope?: {
        allowed: string[];
        excluded: string[];
    };
}
export interface DashboardData {
    current_phase: string;
    current_step: string;
    phase_description: string;
    step_description: string;
    next_step: string | null;
    next_step_description?: string | null;
    user_action_required: boolean;
    user_action_description?: string;
    progress: {
        phases_completed: number;
        phases_total: number;
        steps_completed: number;
        steps_total: number;
        percentage: number;
    };
    recent_logs: string[];
    errors: string[];
}
export interface BobCommandOptions {
    auto?: boolean;
    phase?: string;
    reset?: boolean;
    mode?: FrameworkMode;
    skipGuards?: boolean;
}
export interface BobCommandResult {
    success: boolean;
    message: string;
    phase?: string;
    step?: string;
    next_step?: string | null;
    user_input_required?: boolean;
    dashboard_path?: string;
}
export interface EngineHealth {
    timestamp: string;
    engines: Record<string, "running" | "stopped" | "error">;
    last_check: string;
    issues: string[];
}
export interface WatchdogConfig {
    interval_minutes: number;
    auto_restart: boolean;
    health_check_timeout_seconds: number;
}
export interface BobEvent {
    type: "phase_start" | "phase_complete" | "step_start" | "step_complete" | "step_fail" | "user_input_required";
    timestamp: string;
    phase: string;
    step?: string;
    data?: Record<string, unknown>;
}
export type EventHandler = (event: BobEvent) => void | Promise<void>;
export interface LLMAdapter {
    name: string;
    sendPrompt(prompt: string): Promise<string>;
    streamResponse?(prompt: string, onChunk: (chunk: string) => void): Promise<void>;
    getTokenUsage?(): number;
}
export interface LLMResponse {
    content: string;
    token_usage?: number;
    finish_reason?: string;
}
//# sourceMappingURL=types.d.ts.map
