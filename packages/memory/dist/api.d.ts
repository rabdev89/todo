import { storeKnowledge } from './handlers/store';
import { searchKnowledge } from './handlers/search';
import { closeDatabase, getDatabase } from './database';
import { DatabaseConnection } from './database/connection';
import { initializeSchema } from './database/schema';
import type { StoreKnowledgeInput, SearchKnowledgeInput, StoreKnowledgeResult, SearchKnowledgeResult, MemorySeedResult } from './types';
export { storeKnowledge, searchKnowledge, closeDatabase, getDatabase, initializeSchema };
export { DatabaseConnection };
export type { StoreKnowledgeInput, SearchKnowledgeInput, StoreKnowledgeResult, SearchKnowledgeResult, MemorySeedResult };
export interface MemoryStoreOptions {
    title: string;
    content: string;
    tags?: string;
    scope?: string;
}
export interface MemorySearchOptions {
    query: string;
    tags?: string;
    scope?: string;
    limit?: number;
}
export interface MemorySeedOptions {
    filePath: string;
}
export declare function memoryStoreCommand(options: MemoryStoreOptions): StoreKnowledgeResult;
export declare function memorySearchCommand(options: MemorySearchOptions): SearchKnowledgeResult;
export declare function memorySeedCommand(options: MemorySeedOptions): MemorySeedResult;
//# sourceMappingURL=api.d.ts.map