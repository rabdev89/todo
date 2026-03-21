"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "storeKnowledge", {
    enumerable: true,
    get: function() {
        return storeKnowledge;
    }
});
const _uuid = require("uuid");
const _database = require("../database");
const _validator = require("../services/validator");
const _normalizer = require("../services/normalizer");
const _errors = require("../utils/errors");
function storeKnowledge(input) {
    (0, _validator.validateStoreInput)(input);
    const db = (0, _database.getDatabase)();
    const now = new Date().toISOString();
    const normalizedTitle = (0, _normalizer.normalizeTitle)(input.title);
    const scope = (0, _normalizer.normalizeScope)(input.scope);
    const tags = (0, _normalizer.normalizeTags)(input.tags ?? []);
    const contentHash = (0, _normalizer.hashContent)(input.content);
    const id = (0, _uuid.v4)();
    try {
        return db.transaction(()=>{
            const existingByTitle = db.queryOne('SELECT id FROM knowledge WHERE normalized_title = ? AND scope = ?', [
                normalizedTitle,
                scope
            ]);
            if (existingByTitle) {
                throw new _errors.DuplicateError('Knowledge with similar title already exists in this scope', existingByTitle.id, 'title');
            }
            const existingByHash = db.queryOne('SELECT id FROM knowledge WHERE content_hash = ? AND scope = ?', [
                contentHash,
                scope
            ]);
            if (existingByHash) {
                throw new _errors.DuplicateError('Knowledge with identical content already exists in this scope', existingByHash.id, 'content');
            }
            db.execute(`INSERT INTO knowledge (
          id, title, content, tags, scope,
          normalized_title, content_hash, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
                id,
                input.title.trim(),
                input.content.trim(),
                JSON.stringify(tags),
                scope,
                normalizedTitle,
                contentHash,
                now,
                now
            ]);
            return {
                success: true,
                id,
                message: 'Knowledge stored successfully'
            };
        });
    } catch (error) {
        if (error instanceof _errors.DuplicateError) {
            throw error;
        }
        throw new _errors.StorageError('Failed to store knowledge', {
            originalError: error instanceof Error ? error.message : String(error)
        });
    }
}

//# sourceMappingURL=store.js.map