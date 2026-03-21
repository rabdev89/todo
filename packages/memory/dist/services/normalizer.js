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
    get hashContent () {
        return hashContent;
    },
    get normalizeContent () {
        return normalizeContent;
    },
    get normalizeScope () {
        return normalizeScope;
    },
    get normalizeTags () {
        return normalizeTags;
    },
    get normalizeTitle () {
        return normalizeTitle;
    }
});
const _crypto = require("crypto");
function normalizeTitle(title) {
    return title.toLowerCase().trim().replace(/\s+/g, ' ');
}
function normalizeContent(content) {
    return content.trim().replace(/\r\n/g, '\n').replace(/\r/g, '\n').replace(/\n{3,}/g, '\n\n');
}
function hashContent(content) {
    const normalized = normalizeContent(content);
    return (0, _crypto.createHash)('sha256').update(normalized, 'utf8').digest('hex');
}
function normalizeTags(tags) {
    const normalized = tags.map((tag)=>tag.toLowerCase().trim()).filter((tag)=>tag.length > 0);
    return [
        ...new Set(normalized)
    ];
}
function normalizeScope(scope) {
    if (!scope || scope.trim() === '') {
        return 'global';
    }
    return scope.trim().toLowerCase();
}

//# sourceMappingURL=normalizer.js.map