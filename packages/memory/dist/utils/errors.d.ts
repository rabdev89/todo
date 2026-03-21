export declare class KnowledgeMemoryError extends Error {
    readonly code: string;
    readonly details?: Record<string, unknown> | undefined;
    constructor(message: string, code: string, details?: Record<string, unknown> | undefined);
    toJSON(): Record<string, unknown>;
}
export declare class ValidationError extends KnowledgeMemoryError {
    constructor(message: string, details?: Record<string, unknown>);
}
export declare class DuplicateError extends KnowledgeMemoryError {
    readonly existingId: string;
    readonly duplicateType: 'title' | 'content';
    constructor(message: string, existingId: string, duplicateType: 'title' | 'content');
}
export declare class StorageError extends KnowledgeMemoryError {
    constructor(message: string, details?: Record<string, unknown>);
}
export declare class NotFoundError extends KnowledgeMemoryError {
    constructor(message: string, id?: string);
}
//# sourceMappingURL=errors.d.ts.map