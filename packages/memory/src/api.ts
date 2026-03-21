import { storeKnowledge } from './handlers/store';
import { searchKnowledge } from './handlers/search';
import { closeDatabase, getDatabase } from './database';
import { DatabaseConnection } from './database/connection';
import { initializeSchema } from './database/schema';
import type { 
    StoreKnowledgeInput, 
    SearchKnowledgeInput, 
    StoreKnowledgeResult, 
    SearchKnowledgeResult,
    MemorySeedFile,
    MemorySeedResult
} from './types';
import { readFileSync, existsSync } from 'fs';


export { storeKnowledge, searchKnowledge, closeDatabase, getDatabase, initializeSchema };
export { DatabaseConnection };
export type { StoreKnowledgeInput, SearchKnowledgeInput, StoreKnowledgeResult, SearchKnowledgeResult, MemorySeedResult };

// CLI command handlers for integration with main ai-devkit CLI
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

export function memoryStoreCommand(options: MemoryStoreOptions): StoreKnowledgeResult {
    try {
        const input: StoreKnowledgeInput = {
            title: options.title,
            content: options.content,
            tags: options.tags ? options.tags.split(',').map(t => t.trim()) : undefined,
            scope: options.scope,
        };

        return storeKnowledge(input);
    } finally {
        closeDatabase();
    }
}

export function memorySearchCommand(options: MemorySearchOptions): SearchKnowledgeResult {
    try {
        const input: SearchKnowledgeInput = {
            query: options.query,
            contextTags: options.tags ? options.tags.split(',').map(t => t.trim()) : undefined,
            scope: options.scope,
            limit: options.limit,
        };

        return searchKnowledge(input);
    } finally {
        closeDatabase();
    }
}

export function memorySeedCommand(options: MemorySeedOptions): MemorySeedResult {
    try {
        if (!existsSync(options.filePath)) {
            throw new Error(`Seed file not found: ${options.filePath}`);
        }

        const content = readFileSync(options.filePath, 'utf-8');
        const seedFile: MemorySeedFile = JSON.parse(content);

        const result: MemorySeedResult = {
            success: true,
            total: seedFile.entries.length,
            imported: 0,
            skipped: 0,
            errors: []
        };

        for (const entry of seedFile.entries) {
            try {
                const storeResult = storeKnowledge({
                    title: entry.title,
                    content: entry.content,
                    tags: entry.tags,
                    scope: entry.scope
                });

                if (storeResult.success) {
                    result.imported++;
                } else {
                    result.skipped++;
                    result.errors.push(`Failed to import "${entry.title}": ${storeResult.message}`);
                }
            } catch (error) {
                result.skipped++;
                result.errors.push(`Error importing "${entry.title}": ${error instanceof Error ? error.message : String(error)}`);
            }
        }

        if (result.errors.length > 0 && result.imported === 0) {
            result.success = false;
        }

        return result;
    } finally {
        closeDatabase();
    }
}

