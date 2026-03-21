"use strict";
// Repository Intelligence Module
// Provides AI-powered codebase understanding
Object.defineProperty(exports, "__esModule", { value: true });
exports.PatternDetector = exports.ContextBuilder = exports.SearchService = exports.EmbeddingService = exports.RepoStorage = void 0;
var storage_1 = require("./storage");
Object.defineProperty(exports, "RepoStorage", { enumerable: true, get: function () { return storage_1.RepoStorage; } });
var embeddings_1 = require("./embeddings");
Object.defineProperty(exports, "EmbeddingService", { enumerable: true, get: function () { return embeddings_1.EmbeddingService; } });
var search_1 = require("./search");
Object.defineProperty(exports, "SearchService", { enumerable: true, get: function () { return search_1.SearchService; } });
var context_1 = require("./context");
Object.defineProperty(exports, "ContextBuilder", { enumerable: true, get: function () { return context_1.ContextBuilder; } });
var patterns_1 = require("./patterns");
Object.defineProperty(exports, "PatternDetector", { enumerable: true, get: function () { return patterns_1.PatternDetector; } });
// Future exports
// export { CodeIndexer, IndexOptions } from './indexer';
