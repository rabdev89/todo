import type { StoreKnowledgeInput } from '../types';
export interface ValidationResult {
    valid: boolean;
    errors: string[];
}
export declare function validateTitle(title: string): ValidationResult;
export declare function validateContent(content: string): ValidationResult;
export declare function validateTags(tags?: string[]): ValidationResult;
export declare function validateScope(scope?: string): ValidationResult;
export declare function validateStoreInput(input: StoreKnowledgeInput): void;
//# sourceMappingURL=validator.d.ts.map