"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TicketMetadataSchema = exports.PhaseStateSchema = exports.DependencySchema = exports.FileScopeSchema = exports.TicketTypeSchema = exports.TicketStatusSchema = exports.PhaseTypeSchema = void 0;
exports.validateTicketMetadata = validateTicketMetadata;
exports.validateTicketUpdate = validateTicketUpdate;
const zod_1 = require("zod");
/**
 * Core ticket metadata schema
 * Tech-agnostic: Works with any project type (web, mobile, backend, etc.)
 */
exports.PhaseTypeSchema = zod_1.z.enum([
    'requirements',
    'design',
    'implement',
    'validate',
    'done'
]);
exports.TicketStatusSchema = zod_1.z.enum([
    'draft',
    'in_progress',
    'ready_for_review',
    'completed',
    'blocked'
]);
exports.TicketTypeSchema = zod_1.z.enum([
    'feature',
    'bugfix',
    'refactor',
    'spike',
    'lean'
]);
/**
 * File scope definition - what files this ticket is allowed to touch
 * Uses glob patterns for flexibility across any project structure
 */
exports.FileScopeSchema = zod_1.z.object({
    allowed: zod_1.z.array(zod_1.z.string()).default([]),
    excluded: zod_1.z.array(zod_1.z.string()).default([]),
    description: zod_1.z.string().optional()
});
/**
 * Dependency definition - which tickets must complete before this one
 */
exports.DependencySchema = zod_1.z.object({
    ticket_id: zod_1.z.string(),
    type: zod_1.z.enum(['blocks', 'requires', 'relates_to']).default('requires'),
    description: zod_1.z.string().optional()
});
/**
 * Phase tracking with validation state
 */
exports.PhaseStateSchema = zod_1.z.object({
    phase: exports.PhaseTypeSchema,
    started_at: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/).optional(),
    completed_at: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/).optional(),
    validated: zod_1.z.boolean().default(false),
    validation_output: zod_1.z.string().optional()
});
/**
 * Main ticket metadata schema
 * Minimal required fields, extensible via 'metadata' object
 */
exports.TicketMetadataSchema = zod_1.z.object({
    // Required core fields
    ticket_id: zod_1.z.string().min(1),
    title: zod_1.z.string().min(1),
    status: exports.TicketStatusSchema.default('draft'),
    ticket_type: exports.TicketTypeSchema.default('feature'),
    // Phase tracking
    current_phase: exports.PhaseTypeSchema.default('requirements'),
    phase_history: zod_1.z.array(exports.PhaseStateSchema).default([]),
    // Dependency management
    depends_on: zod_1.z.array(zod_1.z.string()).default([]),
    blocks: zod_1.z.array(zod_1.z.string()).default([]),
    // File scope - what this ticket can modify
    file_scope: exports.FileScopeSchema.default({ allowed: [], excluded: [] }),
    // Circuit breaker tracking
    failure_count: zod_1.z.number().int().min(0).default(0),
    last_failure_at: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/).optional(),
    // Layer/architecture classification (tech-agnostic)
    // Examples: 'ui', 'service', 'model', 'api', 'infra', 'docs'
    layer: zod_1.z.string().optional(),
    // Completion flags
    ai_scoped: zod_1.z.boolean().default(false),
    requirements_done: zod_1.z.boolean().default(false),
    design_done: zod_1.z.boolean().default(false),
    implementation_done: zod_1.z.boolean().default(false),
    tests_done: zod_1.z.boolean().default(false),
    // Extensible metadata for project-specific needs
    metadata: zod_1.z.record(zod_1.z.string(), zod_1.z.any()).default({}),
    // Timestamps
    created_at: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/).optional(),
    updated_at: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/).optional()
});
/**
 * Validates ticket metadata against schema
 * Throws detailed error if invalid
 */
function validateTicketMetadata(data) {
    const result = exports.TicketMetadataSchema.safeParse(data);
    if (!result.success) {
        const issues = result.error.issues.map(issue => `  - ${issue.path.join('.')}: ${issue.message}`).join('\n');
        throw new Error(`Ticket metadata validation failed:\n${issues}`);
    }
    return result.data;
}
/**
 * Partial validation for updates
 */
function validateTicketUpdate(data) {
    const result = exports.TicketMetadataSchema.partial().safeParse(data);
    if (!result.success) {
        const issues = result.error.issues.map(issue => `  - ${issue.path.join('.')}: ${issue.message}`).join('\n');
        throw new Error(`Ticket update validation failed:\n${issues}`);
    }
    return result.data;
}
