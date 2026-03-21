"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "searchKnowledge", {
    enumerable: true,
    get: function() {
        return searchKnowledge;
    }
});
const _database = require("../database");
const _search = require("../services/search");
const _ranker = require("../services/ranker");
const _errors = require("../utils/errors");
const DEFAULT_LIMIT = 5;
const MAX_LIMIT = 20;
const MIN_QUERY_LENGTH = 3;
const MAX_QUERY_LENGTH = 500;
function searchKnowledge(input) {
    validateSearchInput(input);
    const db = (0, _database.getDatabase)();
    const limit = Math.min(Math.max(input.limit ?? DEFAULT_LIMIT, 1), MAX_LIMIT);
    const ftsQuery = (0, _search.buildFtsQuery)(input.query);
    let rows;
    if (ftsQuery === '') {
        // Empty or invalid query - return recent items
        const { sql, params } = (0, _search.buildSimpleQuery)(input.scope, limit);
        rows = db.query(sql, params);
    } else {
        // Full-text search with BM25
        const { sql, params } = (0, _search.buildSearchQuery)(ftsQuery, input.scope, limit * 2);
        try {
            rows = db.query(sql, params);
        } catch (error) {
            // FTS query syntax error - fallback to simple query
            const { sql: fallbackSql, params: fallbackParams } = (0, _search.buildSimpleQuery)(input.scope, limit);
            rows = db.query(fallbackSql, fallbackParams);
        }
    }
    // Apply ranking with tag and scope boosts
    const ranked = (0, _ranker.rankResults)(rows, {
        contextTags: input.contextTags,
        queryScope: input.scope
    });
    // Limit to requested count
    const results = ranked.slice(0, limit);
    return {
        results,
        totalMatches: ranked.length,
        query: input.query
    };
}
function validateSearchInput(input) {
    const errors = [];
    if (!input.query || typeof input.query !== 'string') {
        errors.push('Query is required');
    } else {
        const trimmed = input.query.trim();
        if (trimmed.length < MIN_QUERY_LENGTH) {
            errors.push(`Query must be at least ${MIN_QUERY_LENGTH} characters`);
        }
        if (trimmed.length > MAX_QUERY_LENGTH) {
            errors.push(`Query must be at most ${MAX_QUERY_LENGTH} characters`);
        }
    }
    if (input.limit !== undefined) {
        if (typeof input.limit !== 'number' || input.limit < 1) {
            errors.push('Limit must be a positive number');
        }
    }
    if (errors.length > 0) {
        throw new _errors.ValidationError(errors.join('; '), {
            errors
        });
    }
}

//# sourceMappingURL=search.js.map