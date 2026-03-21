import { z } from 'zod';
/**
 * Core ticket metadata schema
 * Tech-agnostic: Works with any project type (web, mobile, backend, etc.)
 */
export declare const PhaseTypeSchema: z.ZodEnum<{
    requirements: "requirements";
    design: "design";
    implement: "implement";
    validate: "validate";
    done: "done";
}>;
export declare const TicketStatusSchema: z.ZodEnum<{
    draft: "draft";
    in_progress: "in_progress";
    ready_for_review: "ready_for_review";
    completed: "completed";
    blocked: "blocked";
}>;
export declare const TicketTypeSchema: z.ZodEnum<{
    feature: "feature";
    bugfix: "bugfix";
    refactor: "refactor";
    spike: "spike";
    lean: "lean";
}>;
/**
 * File scope definition - what files this ticket is allowed to touch
 * Uses glob patterns for flexibility across any project structure
 */
export declare const FileScopeSchema: z.ZodObject<{
    allowed: z.ZodDefault<z.ZodArray<z.ZodString>>;
    excluded: z.ZodDefault<z.ZodArray<z.ZodString>>;
    description: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
/**
 * Dependency definition - which tickets must complete before this one
 */
export declare const DependencySchema: z.ZodObject<{
    ticket_id: z.ZodString;
    type: z.ZodDefault<z.ZodEnum<{
        blocks: "blocks";
        requires: "requires";
        relates_to: "relates_to";
    }>>;
    description: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
/**
 * Phase tracking with validation state
 */
export declare const PhaseStateSchema: z.ZodObject<{
    phase: z.ZodEnum<{
        requirements: "requirements";
        design: "design";
        implement: "implement";
        validate: "validate";
        done: "done";
    }>;
    started_at: z.ZodOptional<z.ZodString>;
    completed_at: z.ZodOptional<z.ZodString>;
    validated: z.ZodDefault<z.ZodBoolean>;
    validation_output: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
/**
 * Main ticket metadata schema
 * Minimal required fields, extensible via 'metadata' object
 */
export declare const TicketMetadataSchema: z.ZodObject<{
    ticket_id: z.ZodString;
    title: z.ZodString;
    status: z.ZodDefault<z.ZodEnum<{
        draft: "draft";
        in_progress: "in_progress";
        ready_for_review: "ready_for_review";
        completed: "completed";
        blocked: "blocked";
    }>>;
    ticket_type: z.ZodDefault<z.ZodEnum<{
        feature: "feature";
        bugfix: "bugfix";
        refactor: "refactor";
        spike: "spike";
        lean: "lean";
    }>>;
    current_phase: z.ZodDefault<z.ZodEnum<{
        requirements: "requirements";
        design: "design";
        implement: "implement";
        validate: "validate";
        done: "done";
    }>>;
    phase_history: z.ZodDefault<z.ZodArray<z.ZodObject<{
        phase: z.ZodEnum<{
            requirements: "requirements";
            design: "design";
            implement: "implement";
            validate: "validate";
            done: "done";
        }>;
        started_at: z.ZodOptional<z.ZodString>;
        completed_at: z.ZodOptional<z.ZodString>;
        validated: z.ZodDefault<z.ZodBoolean>;
        validation_output: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>>;
    depends_on: z.ZodDefault<z.ZodArray<z.ZodString>>;
    blocks: z.ZodDefault<z.ZodArray<z.ZodString>>;
    file_scope: z.ZodDefault<z.ZodObject<{
        allowed: z.ZodDefault<z.ZodArray<z.ZodString>>;
        excluded: z.ZodDefault<z.ZodArray<z.ZodString>>;
        description: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>;
    failure_count: z.ZodDefault<z.ZodNumber>;
    last_failure_at: z.ZodOptional<z.ZodString>;
    layer: z.ZodOptional<z.ZodString>;
    ai_scoped: z.ZodDefault<z.ZodBoolean>;
    requirements_done: z.ZodDefault<z.ZodBoolean>;
    design_done: z.ZodDefault<z.ZodBoolean>;
    implementation_done: z.ZodDefault<z.ZodBoolean>;
    tests_done: z.ZodDefault<z.ZodBoolean>;
    metadata: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodAny>>;
    created_at: z.ZodOptional<z.ZodString>;
    updated_at: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type PhaseType = z.infer<typeof PhaseTypeSchema>;
export type TicketStatus = z.infer<typeof TicketStatusSchema>;
export type TicketType = z.infer<typeof TicketTypeSchema>;
export type FileScope = z.infer<typeof FileScopeSchema>;
export type Dependency = z.infer<typeof DependencySchema>;
export type PhaseState = z.infer<typeof PhaseStateSchema>;
export type TicketMetadata = z.infer<typeof TicketMetadataSchema>;
/**
 * Validates ticket metadata against schema
 * Throws detailed error if invalid
 */
export declare function validateTicketMetadata(data: unknown): TicketMetadata;
/**
 * Partial validation for updates
 */
export declare function validateTicketUpdate(data: unknown): Partial<TicketMetadata>;
//# sourceMappingURL=ticket_schema.d.ts.map