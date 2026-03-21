"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RepoStorage = void 0;
const fs_1 = require("fs");
const path_1 = require("path");
class RepoStorage {
    qdrant;
    dataPath;
    files = new Map();
    symbols = new Map();
    imports = new Map();
    chunks = new Map();
    constructor(dataPath = './repo_data') {
        this.dataPath = dataPath;
        this.qdrant = null;
        // Ensure data directory exists
        if (!(0, fs_1.existsSync)(dataPath)) {
            (0, fs_1.mkdirSync)(dataPath, { recursive: true });
        }
        this.loadFromDisk();
    }
    loadFromDisk() {
        try {
            const filesData = (0, fs_1.readFileSync)((0, path_1.join)(this.dataPath, 'files.json'), 'utf-8');
            this.files = new Map(JSON.parse(filesData));
        }
        catch (error) {
            // File doesn't exist, start empty
        }
        try {
            const symbolsData = (0, fs_1.readFileSync)((0, path_1.join)(this.dataPath, 'symbols.json'), 'utf-8');
            this.symbols = new Map(JSON.parse(symbolsData));
        }
        catch (error) {
            // File doesn't exist, start empty
        }
        try {
            const importsData = (0, fs_1.readFileSync)((0, path_1.join)(this.dataPath, 'imports.json'), 'utf-8');
            this.imports = new Map(JSON.parse(importsData));
        }
        catch (error) {
            // File doesn't exist, start empty
        }
        try {
            const chunksData = (0, fs_1.readFileSync)((0, path_1.join)(this.dataPath, 'chunks.json'), 'utf-8');
            this.chunks = new Map(JSON.parse(chunksData));
        }
        catch (error) {
            // File doesn't exist, start empty
        }
    }
    saveToDisk() {
        (0, fs_1.writeFileSync)((0, path_1.join)(this.dataPath, 'files.json'), JSON.stringify(Array.from(this.files.entries()), null, 2));
        (0, fs_1.writeFileSync)((0, path_1.join)(this.dataPath, 'symbols.json'), JSON.stringify(Array.from(this.symbols.entries()), null, 2));
        (0, fs_1.writeFileSync)((0, path_1.join)(this.dataPath, 'imports.json'), JSON.stringify(Array.from(this.imports.entries()), null, 2));
        (0, fs_1.writeFileSync)((0, path_1.join)(this.dataPath, 'chunks.json'), JSON.stringify(Array.from(this.chunks.entries()), null, 2));
    }
    // Initialize Qdrant collection
    async initializeVectorStore() {
        try {
            if (!this.qdrant) {
                const mod = await import('@qdrant/js-client-rest');
                const QdrantClient = mod.QdrantClient;
                this.qdrant = new QdrantClient({
                    url: 'http://localhost:6333',
                    timeout: 5000
                });
            }
            const collections = await this.qdrant.getCollections();
            const hasCodeCollection = collections.collections.some((c) => c.name === 'code_chunks');
            if (!hasCodeCollection) {
                await this.qdrant.createCollection('code_chunks', {
                    vectors: {
                        size: 384, // nomic-embed-text dimension
                        distance: 'Cosine'
                    }
                });
                console.log('✅ Created Qdrant collection: code_chunks');
            }
        }
        catch (error) {
            console.warn('⚠️  Qdrant not available, vector features disabled');
            console.log('   To enable: docker run -p 6333:6333 qdrant/qdrant');
        }
    }
    // File operations
    addFile(file) {
        this.files.set(file.id, file);
    }
    getFile(id) {
        return this.files.get(id);
    }
    getFileByPath(path) {
        for (const file of this.files.values()) {
            if (file.path === path)
                return file;
        }
        return undefined;
    }
    // Symbol operations
    addSymbol(symbol) {
        this.symbols.set(symbol.id, symbol);
    }
    getSymbolsByFile(fileId) {
        const results = [];
        for (const symbol of this.symbols.values()) {
            if (symbol.fileId === fileId) {
                results.push(symbol);
            }
        }
        return results;
    }
    getSymbolsByName(name) {
        const results = [];
        for (const symbol of this.symbols.values()) {
            if (symbol.name === name) {
                results.push(symbol);
            }
        }
        return results;
    }
    // Import operations
    addImport(imp) {
        this.imports.set(imp.id, imp);
    }
    getImportsByFile(fileId) {
        const results = [];
        for (const imp of this.imports.values()) {
            if (imp.fileId === fileId) {
                results.push(imp);
            }
        }
        return results;
    }
    // Chunk operations
    addChunk(chunk) {
        this.chunks.set(chunk.id, chunk);
    }
    getChunksByFile(fileId) {
        const results = [];
        for (const chunk of this.chunks.values()) {
            if (chunk.fileId === fileId) {
                results.push(chunk);
            }
        }
        return results;
    }
    getAllChunks() {
        return Array.from(this.chunks.values());
    }
    // Vector operations (Qdrant)
    async storeEmbedding(chunkId, embedding) {
        try {
            const chunk = this.chunks.get(chunkId);
            if (!chunk)
                return;
            if (!this.qdrant) {
                const mod = await import('@qdrant/js-client-rest');
                const QdrantClient = mod.QdrantClient;
                this.qdrant = new QdrantClient({
                    url: 'http://localhost:6333',
                    timeout: 5000
                });
            }
            await this.qdrant.upsert('code_chunks', {
                points: [{
                        id: chunkId,
                        vector: embedding,
                        payload: {
                            fileId: chunk.fileId,
                            content: chunk.content.substring(0, 1000), // First 1000 chars for preview
                            startLine: chunk.startLine,
                            endLine: chunk.endLine
                        }
                    }]
            });
        }
        catch (error) {
            console.warn('Failed to store embedding:', error);
        }
    }
    async searchEmbeddings(query, limit = 10) {
        try {
            // Generate embedding for query (this would use Ollama)
            // For now, return empty - will be implemented in Phase 2
            return [];
        }
        catch (error) {
            console.warn('Vector search not available:', error);
            return [];
        }
    }
    // Search operations
    searchFiles(pattern) {
        const results = [];
        const regex = new RegExp(pattern, 'i');
        for (const file of this.files.values()) {
            if (regex.test(file.path) || regex.test(file.language)) {
                results.push(file);
            }
        }
        return results;
    }
    searchSymbols(pattern) {
        const results = [];
        const regex = new RegExp(pattern, 'i');
        for (const symbol of this.symbols.values()) {
            if (regex.test(symbol.name) || regex.test(symbol.type)) {
                results.push(symbol);
            }
        }
        return results;
    }
    // Statistics
    getStats() {
        return {
            files: this.files.size,
            symbols: this.symbols.size,
            imports: this.imports.size,
            chunks: this.chunks.size
        };
    }
    // Persistence
    save() {
        this.saveToDisk();
    }
    reset() {
        this.files.clear();
        this.symbols.clear();
        this.imports.clear();
        this.chunks.clear();
        this.saveToDisk();
        // Reset Qdrant collection
        this.qdrant.deleteCollection('code_chunks').catch(() => {
            // Collection might not exist, ignore
        });
    }
    close() {
        this.save();
    }
}
exports.RepoStorage = RepoStorage;
