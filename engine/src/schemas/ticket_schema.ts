import { z } from 'zod';

/**
 * Core ticket metadata schema
 * Tech-agnostic: Works with any project type (web, mobile, backend, etc.)
 */

export const PhaseTypeSchema = z.enum([
    'requirements',
    'design', 
    'implement',
    'validate',
    'done'
]);

export const TicketStatusSchema = z.enum([
    'draft',
    'in_progress',
    'ready_for_review',
    'completed',
    'blocked'
]);

export const TicketTypeSchema = z.enum([
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
export const FileScopeSchema = z.object({
    allowed: z.array(z.string()).default([]),
    excluded: z.array(z.string()).default([]),
    description: z.string().optional()
});

/**
 * Dependency definition - which tickets must complete before this one
 */
export const DependencySchema = z.object({
    ticket_id: z.string(),
    type: z.enum(['blocks', 'requires', 'relates_to']).default('requires'),
    description: z.string().optional()
});

/**
 * Phase tracking with validation state
 */
export const PhaseStateSchema = z.object({
    phase: PhaseTypeSchema,
    started_at: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/).optional(),
    completed_at: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/).optional(),
    validated: z.boolean().default(false),
    validation_output: z.string().optional()
});

/**
 * Main ticket metadata schema
 * Minimal required fields, extensible via 'metadata' object
 */
export const TicketMetadataSchema = z.object({
    // Required core fields
    ticket_id: z.string().min(1),
    title: z.string().min(1),
    status: TicketStatusSchema.default('draft'),
    ticket_type: TicketTypeSchema.default('feature'),
    
    // Phase tracking
    current_phase: PhaseTypeSchema.default('requirements'),
    phase_history: z.array(PhaseStateSchema).default([]),
    
    // Dependency management
    depends_on: z.array(z.string()).default([]),
    blocks: z.array(z.string()).default([]),
    
    // File scope - what this ticket can modify
    file_scope: FileScopeSchema.default({ allowed: [], excluded: [] }),
    
    // Circuit breaker tracking
    failure_count: z.number().int().min(0).default(0),
    last_failure_at: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/).optional(),
    
    // Layer/architecture classification (tech-agnostic)
    // Examples: 'ui', 'service', 'model', 'api', 'infra', 'docs'
    layer: z.string().optional(),
    
    // Completion flags
    ai_scoped: z.boolean().default(false),
    requirements_done: z.boolean().default(false),
    design_done: z.boolean().default(false),
    implementation_done: z.boolean().default(false),
    tests_done: z.boolean().default(false),

    // Extensible metadata for project-specific needs
    metadata: z.record(z.string(), z.any()).default({}),
    
    // Timestamps
    created_at: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/).optional(),
    updated_at: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/).optional()
});

// Type exports for TypeScript usage
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
export function validateTicketMetadata(data: unknown): TicketMetadata {
    const result = TicketMetadataSchema.safeParse(data);
    
    if (!result.success) {
        const issues = result.error.issues.map(issue => 
            `  - ${issue.path.join('.')}: ${issue.message}`
        ).join('\n');
        
        throw new Error(`Ticket metadata validation failed:\n${issues}`);
    }
    
    return result.data;
}

/**
 * Partial validation for updates
 */
export function validateTicketUpdate(data: unknown): Partial<TicketMetadata> {
    const result = TicketMetadataSchema.partial().safeParse(data);
    
    if (!result.success) {
        const issues = result.error.issues.map(issue => 
            `  - ${issue.path.join('.')}: ${issue.message}`
        ).join('\n');
        
        throw new Error(`Ticket update validation failed:\n${issues}`);
    }
    
    return result.data;
}
