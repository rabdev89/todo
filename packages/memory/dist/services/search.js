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
    get buildFtsQuery () {
        return buildFtsQuery;
    },
    get buildSearchQuery () {
        return buildSearchQuery;
    },
    get buildSimpleQuery () {
        return buildSimpleQuery;
    }
});
/**
 * FTS5 Query Builder
 * Converts natural language queries to FTS5 match expressions
 */ /**
 * Escape special FTS5 characters to prevent query syntax errors
 */ function escapeFtsSpecialChars(text) {
    // FTS5 special characters: " * ^ - : OR AND NOT ( )
    return text.replace(/"/g, '""') // Escape quotes by doubling
    .replace(/[*^():-]/g, ' ') // Replace operators with space (including hyphen)
    .replace(/\b(AND|OR|NOT)\b/gi, '') // Remove boolean operators
    .trim().replace(/\s+/g, ' '); // Collapse multiple spaces
}
function buildFtsQuery(query) {
    const escaped = escapeFtsSpecialChars(query);
    const words = escaped.split(/\s+/).filter((w)=>w.length > 0);
    if (words.length === 0) {
        return '';
    }
    // Use prefix matching for each word
    // This allows "api design" to match "API", "designing", etc.
    return words.map((word)=>`${word}*`).join(' ');
}
function buildSearchQuery(ftsQuery, scope, limit = 5) {
    const params = [];
    let sql = `
    SELECT 
      k.id,
      k.title,
      k.content,
      k.tags,
      k.scope,
      k.created_at,
      k.updated_at,
      bm25(knowledge_fts, 10.0, 5.0, 1.0) as bm25_score
    FROM knowledge k
    JOIN knowledge_fts fts ON k.rowid = fts.rowid
    WHERE knowledge_fts MATCH ?
  `;
    params.push(ftsQuery);
    if (scope) {
        sql += ` AND (k.scope = ? OR k.scope = 'global')`;
        params.push(scope);
    }
    sql += ` ORDER BY bm25_score LIMIT ?`;
    params.push(limit);
    return {
        sql,
        params
    };
}
function buildSimpleQuery(scope, limit = 5) {
    const params = [];
    let sql = `
    SELECT 
      id, title, content, tags, scope, created_at, updated_at,
      0 as bm25_score
    FROM knowledge
  `;
    if (scope) {
        sql += ` WHERE scope = ? OR scope = 'global'`;
        params.push(scope);
    }
    sql += ` ORDER BY created_at DESC LIMIT ?`;
    params.push(limit);
    return {
        sql,
        params
    };
}

//# sourceMappingURL=search.js.map