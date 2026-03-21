"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmbeddingService = void 0;
const ollama_1 = require("ollama");
const fs_1 = require("fs");
class EmbeddingService {
    ollama;
    model;
    cache = new Map();
    cachePath;
    constructor(options = {}) {
        this.ollama = new ollama_1.Ollama({
            host: 'http://localhost:11434'
        });
        this.model = options.model || 'nomic-embed-text';
        this.cachePath = options.cachePath || '../web-applications/repo_data/embeddings_cache.json';
        this.loadCache();
    }
    loadCache() {
        if ((0, fs_1.existsSync)(this.cachePath)) {
            try {
                const data = (0, fs_1.readFileSync)(this.cachePath, 'utf-8');
                const entries = JSON.parse(data);
                this.cache = new Map(entries);
                console.log(`📚 Loaded ${this.cache.size} cached embeddings`);
            }
            catch (error) {
                console.warn('⚠️  Failed to load embeddings cache:', error);
            }
        }
    }
    saveCache() {
        try {
            const data = JSON.stringify(Array.from(this.cache.entries()));
            (0, fs_1.writeFileSync)(this.cachePath, data);
        }
        catch (error) {
            console.warn('⚠️  Failed to save embeddings cache:', error);
        }
    }
    async generateEmbedding(text) {
        // Check cache first
        const cacheKey = this.generateCacheKey(text);
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }
        try {
            const response = await this.ollama.embeddings({
                model: this.model,
                prompt: text
            });
            const embedding = response.embedding;
            // Cache the result
            this.cache.set(cacheKey, embedding);
            return embedding;
        }
        catch (error) {
            if (error.cause?.code === 'ECONNREFUSED' || error.message?.includes('fetch failed')) {
                console.warn('⚠️  Ollama service unreachable. Skipping semantic embedding.');
                return new Array(384).fill(0); // Return zero vector to allow fallback
            }
            console.error('❌ Failed to generate embedding:', error);
            throw error;
        }
    }
    async generateBatchEmbeddings(texts, batchSize = 10) {
        const embeddings = [];
        console.log(`🔄 Generating embeddings for ${texts.length} texts...`);
        for (let i = 0; i < texts.length; i += batchSize) {
            const batch = texts.slice(i, i + batchSize);
            const batchPromises = batch.map(text => this.generateEmbedding(text));
            try {
                const batchEmbeddings = await Promise.all(batchPromises);
                embeddings.push(...batchEmbeddings);
                console.log(`   Progress: ${Math.min(i + batchSize, texts.length)}/${texts.length}`);
            }
            catch (error) {
                console.error(`   Batch ${i}-${i + batchSize} failed:`, error);
                // Add empty embeddings for failed batch
                const emptyEmbeddings = batch.map(() => new Array(384).fill(0));
                embeddings.push(...emptyEmbeddings);
            }
        }
        // Save cache after batch processing
        this.saveCache();
        console.log('✅ Embeddings generation complete');
        return embeddings;
    }
    async embedQuery(query) {
        return this.generateEmbedding(query);
    }
    async cosineSimilarity(a, b) {
        if (a.length !== b.length) {
            throw new Error('Vectors must be the same length');
        }
        let dotProduct = 0;
        let normA = 0;
        let normB = 0;
        for (let i = 0; i < a.length; i++) {
            dotProduct += a[i] * b[i];
            normA += a[i] * a[i];
            normB += b[i] * b[i];
        }
        if (normA === 0 || normB === 0) {
            return 0;
        }
        return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
    }
    async findSimilar(queryEmbedding, candidateEmbeddings, threshold = 0.7) {
        const similarities = [];
        for (let i = 0; i < candidateEmbeddings.length; i++) {
            const similarity = await this.cosineSimilarity(queryEmbedding, candidateEmbeddings[i]);
            if (similarity >= threshold) {
                similarities.push({ index: i, similarity });
            }
        }
        // Sort by similarity descending
        similarities.sort((a, b) => b.similarity - a.similarity);
        return similarities;
    }
    generateCacheKey(text) {
        // Use first 100 chars + length to create a reasonable cache key
        const preview = text.substring(0, 100);
        return `${preview}_${text.length}`;
    }
    getCacheStats() {
        return {
            size: this.cache.size,
            model: this.model,
            cachePath: this.cachePath
        };
    }
    clearCache() {
        this.cache.clear();
        if ((0, fs_1.existsSync)(this.cachePath)) {
            try {
                const fs = require('fs');
                fs.unlinkSync(this.cachePath);
            }
            catch (error) {
                console.warn('Failed to delete cache file:', error);
            }
        }
        console.log('🗑️  Embeddings cache cleared');
    }
    async testConnection() {
        try {
            await this.ollama.list();
            console.log('✅ Ollama connection successful');
            return true;
        }
        catch (error) {
            console.error('❌ Ollama connection failed:', error);
            console.log('   Make sure Ollama is running: https://ollama.ai');
            return false;
        }
    }
    async checkModel() {
        try {
            const models = await this.ollama.list();
            const hasModel = models.models.some((model) => model.name === this.model);
            if (!hasModel) {
                console.log(`⬇️  Pulling model: ${this.model}`);
                await this.ollama.pull({ model: this.model });
                console.log(`✅ Model ${this.model} ready`);
            }
            else {
                console.log(`✅ Model ${this.model} already available`);
            }
            return true;
        }
        catch (error) {
            console.error(`❌ Failed to check/pull model ${this.model}:`, error);
            return false;
        }
    }
}
exports.EmbeddingService = EmbeddingService;
