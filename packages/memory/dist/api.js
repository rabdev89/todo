"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: Object.getOwnPropertyDescriptor(all, name).get
    });
}
_export(exports, {
    get DatabaseConnection () {
        return _connection.DatabaseConnection;
    },
    get closeDatabase () {
        return _database.closeDatabase;
    },
    get getDatabase () {
        return _database.getDatabase;
    },
    get initializeSchema () {
        return _schema.initializeSchema;
    },
    get memorySearchCommand () {
        return memorySearchCommand;
    },
    get memorySeedCommand () {
        return memorySeedCommand;
    },
    get memoryStoreCommand () {
        return memoryStoreCommand;
    },
    get searchKnowledge () {
        return _search.searchKnowledge;
    },
    get storeKnowledge () {
        return _store.storeKnowledge;
    }
});
const _store = require("./handlers/store");
const _search = require("./handlers/search");
const _database = require("./database");
const _connection = require("./database/connection");
const _schema = require("./database/schema");
const _fs = require("fs");
function memoryStoreCommand(options) {
    try {
        const input = {
            title: options.title,
            content: options.content,
            tags: options.tags ? options.tags.split(',').map((t)=>t.trim()) : undefined,
            scope: options.scope
        };
        return (0, _store.storeKnowledge)(input);
    } finally{
        (0, _database.closeDatabase)();
    }
}
function memorySearchCommand(options) {
    try {
        const input = {
            query: options.query,
            contextTags: options.tags ? options.tags.split(',').map((t)=>t.trim()) : undefined,
            scope: options.scope,
            limit: options.limit
        };
        return (0, _search.searchKnowledge)(input);
    } finally{
        (0, _database.closeDatabase)();
    }
}
function memorySeedCommand(options) {
    try {
        if (!(0, _fs.existsSync)(options.filePath)) {
            throw new Error(`Seed file not found: ${options.filePath}`);
        }
        const content = (0, _fs.readFileSync)(options.filePath, 'utf-8');
        const seedFile = JSON.parse(content);
        const result = {
            success: true,
            total: seedFile.entries.length,
            imported: 0,
            skipped: 0,
            errors: []
        };
        for (const entry of seedFile.entries){
            try {
                const storeResult = (0, _store.storeKnowledge)({
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
    } finally{
        (0, _database.closeDatabase)();
    }
}

//# sourceMappingURL=api.js.map