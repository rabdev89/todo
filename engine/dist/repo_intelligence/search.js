"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchService = void 0;
class SearchService {
    qdrant;
    embeddings;
    storage;
    constructor(embService, storage) {
        this.qdrant = null;
        this.embeddings = embService;
        this.storage = storage;
    }
    async search(query) {
        if (query.type === 'semantic' || query.type === 'hybrid') {
            return this.semanticSearch(query);
        }
        else {
            return this.keywordSearch(query);
        }
    }
    async semanticSearch(query) {
        if (!query.text) {
            throw new Error('Query text is required for semantic search');
        }
        try {
            // Generate embedding for query
            const queryEmbedding = await this.embeddings.embedQuery(query.text);
            // Search Qdrant
            if (!this.qdrant) {
                const mod = await import('@qdrant/js-client-rest');
                const QdrantClient = mod.QdrantClient;
                this.qdrant = new QdrantClient({
                    url: 'http://localhost:6333',
                    timeout: 5000
                });
            }
            const searchResults = await this.qdrant.search('code_chunks', {
                vector: queryEmbedding,
                limit: query.limit || 10,
                score_threshold: query.threshold || 0.5,
                with_payload: true,
                with_vector: false
            });
            // Convert to SearchResult format
            const results = [];
            for (const result of searchResults) {
                const payload = result.payload;
                // Get the full chunk from storage
                const chunk = this.storage.getChunksByFile(payload.fileId)
                    .find(c => c.id === result.id);
                if (chunk) {
                    results.push({
                        id: result.id,
                        file: this.getFilePath(payload.fileId),
                        lineStart: chunk.startLine,
                        lineEnd: chunk.endLine,
                        content: chunk.content,
                        relevance: result.score || 0,
                        chunkType: chunk.chunkType
                    });
                }
            }
            return results;
        }
        catch (error) {
            if (error.cause?.code === 'ECONNREFUSED' || error.message?.includes('fetch failed')) {
                console.warn('⚠️  Qdrant service unreachable. Falling back to keyword search.');
            }
            else {
                console.warn('Semantic search failed, falling back to keyword search:', error);
            }
            return this.keywordSearch(query);
        }
    }
    keywordSearch(query) {
        return new Promise((resolve) => {
            const results = [];
            const searchText = query.text?.toLowerCase() || '';
            if (!searchText) {
                resolve(results);
                return;
            }
            // Search through all chunks
            const chunks = this.storage.getAllChunks();
            for (const chunk of chunks) {
                if (chunk.content.toLowerCase().includes(searchText)) {
                    results.push({
                        id: chunk.id,
                        file: this.getFilePath(chunk.fileId),
                        lineStart: chunk.startLine,
                        lineEnd: chunk.endLine,
                        content: chunk.content,
                        relevance: 1.0, // Perfect match for keyword search
                        chunkType: chunk.chunkType
                    });
                }
            }
            // Sort by relevance and limit
            const sorted = results.sort((a, b) => b.relevance - a.relevance);
            resolve(sorted.slice(0, query.limit || 10));
        });
    }
    getFilePath(fileId) {
        const file = this.storage.getFile(fileId);
        return file?.path || 'unknown';
    }
    async searchSymbols(name, limit = 10) {
        const symbols = this.storage.getSymbolsByName(name);
        return symbols.slice(0, limit).map(symbol => {
            const file = this.storage.getFile(symbol.fileId);
            return {
                name: symbol.name,
                type: symbol.type,
                file: file?.path || 'unknown',
                lineStart: symbol.lineStart,
                lineEnd: symbol.lineEnd,
                signature: symbol.signature,
                docstring: symbol.docstring
            };
        });
    }
    async findDependents(symbolName) {
        const dependents = [];
        // Search for imports that match the symbol
        const symbols = this.storage.getSymbolsByName(symbolName);
        for (const symbol of symbols) {
            const imports = this.storage.getImportsByFile(symbol.fileId);
            for (const imp of imports) {
                if (imp.importedName === symbolName || imp.importedName.includes(symbolName)) {
                    const file = this.storage.getFile(imp.fileId);
                    if (file) {
                        dependents.push(file.path);
                    }
                }
            }
        }
        return [...new Set(dependents)]; // Deduplicate
    }
    async searchFiles(pattern) {
        const files = this.storage.searchFiles(pattern);
        return files.map(file => ({
            path: file.path,
            language: file.language,
            linesCount: file.linesCount,
            lastModified: file.lastModified
        }));
    }
    async getContextAroundChunk(chunkId, contextLines = 5) {
        // Get the target chunk
        const allChunks = Array.from(this.storage.getChunksByFile('')); // This needs to be implemented
        const targetIndex = allChunks.findIndex(c => c.id === chunkId);
        if (targetIndex === -1) {
            throw new Error('Chunk not found');
        }
        const target = allChunks[targetIndex];
        const before = allChunks.slice(Math.max(0, targetIndex - contextLines), targetIndex);
        const after = allChunks.slice(targetIndex + 1, targetIndex + contextLines + 1);
        return { before, target, after };
    }
    async getStats() {
        const storageStats = this.storage.getStats();
        const cacheStats = this.embeddings.getCacheStats();
        let vectorCount = 0;
        try {
            if (!this.qdrant) {
                const mod = await import('@qdrant/js-client-rest');
                const QdrantClient = mod.QdrantClient;
                this.qdrant = new QdrantClient({
                    url: 'http://localhost:6333',
                    timeout: 5000
                });
            }
            const info = await this.qdrant.getCollection('code_chunks');
            vectorCount = info.points_count || 0;
        }
        catch (error) {
        }
        return {
            totalFiles: storageStats.files,
            totalSymbols: storageStats.symbols,
            totalImports: storageStats.imports,
            totalChunks: storageStats.chunks,
            vectorCount,
            cacheSize: cacheStats.size
        };
    }
}
exports.SearchService = SearchService;
