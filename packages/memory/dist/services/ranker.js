"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "rankResults", {
    enumerable: true,
    get: function() {
        return rankResults;
    }
});
/**
 * Calculate tag boost based on matching contextTags
 * +10% per matching tag
 */ function calculateTagBoost(itemTags, contextTags) {
    if (!contextTags || contextTags.length === 0) {
        return 1.0;
    }
    const itemTagsLower = itemTags.map((t)=>t.toLowerCase());
    const contextTagsLower = contextTags.map((t)=>t.toLowerCase());
    let matchCount = 0;
    for (const tag of contextTagsLower){
        if (itemTagsLower.includes(tag)) {
            matchCount++;
        }
    }
    return 1 + matchCount * 0.1;
}
/**
 * Calculate scope boost
 * +0.5 if scope matches query scope
 * +0.2 if global
 * 0 otherwise
 */ function calculateScopeBoost(itemScope, queryScope) {
    if (queryScope && itemScope === queryScope) {
        return 0.5;
    }
    if (itemScope === 'global') {
        return 0.2;
    }
    return 0;
}
function rankResults(results, context) {
    const ranked = results.map((result)=>{
        let tags;
        try {
            tags = JSON.parse(result.tags);
        } catch  {
            tags = [];
        }
        const tagBoost = calculateTagBoost(tags, context.contextTags ?? []);
        const scopeBoost = calculateScopeBoost(result.scope, context.queryScope);
        // BM25 returns negative values (closer to 0 = better match)
        // We negate it to make higher values better
        const normalizedBm25 = -result.bm25_score;
        const finalScore = normalizedBm25 * tagBoost + scopeBoost;
        return {
            id: result.id,
            title: result.title,
            content: result.content,
            tags,
            scope: result.scope,
            score: Math.round(finalScore * 1000) / 1000
        };
    });
    // Sort by score descending
    ranked.sort((a, b)=>b.score - a.score);
    return ranked;
}

//# sourceMappingURL=ranker.js.map