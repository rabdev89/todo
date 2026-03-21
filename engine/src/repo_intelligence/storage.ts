import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

export interface CodeFile {
  id: string;
  path: string;
  language: string;
  lastModified: number;
  linesCount: number;
  contentHash: string;
}

export interface CodeSymbol {
  id: string;
  fileId: string;
  name: string;
  type: 'function' | 'class' | 'method' | 'interface' | 'type' | 'variable' | 'constant' | 'enum';
  lineStart: number;
  lineEnd: number;
  signature?: string;
  docstring?: string;
  isExported: boolean;
}

export interface CodeImport {
  id: string;
  fileId: string;
  importedName: string;
  sourceModule?: string;
  isExternal: boolean;
  lineNumber: number;
}

export interface CodeChunk {
  id: string;
  fileId: string;
  content: string;
  startLine: number;
  endLine: number;
  chunkType: 'code' | 'comment' | 'docstring';
}

export class RepoStorage {
  private qdrant: any;
  private dataPath: string;
  private files: Map<string, CodeFile> = new Map();
  private symbols: Map<string, CodeSymbol> = new Map();
  private imports: Map<string, CodeImport> = new Map();
  private chunks: Map<string, CodeChunk> = new Map();

  constructor(dataPath: string = './repo_data') {
    this.dataPath = dataPath;
    this.qdrant = null;
    
    // Ensure data directory exists
    if (!existsSync(dataPath)) {
      mkdirSync(dataPath, { recursive: true });
    }
    
    this.loadFromDisk();
  }

  private loadFromDisk(): void {
    try {
      const filesData = readFileSync(join(this.dataPath, 'files.json'), 'utf-8');
      this.files = new Map(JSON.parse(filesData));
    } catch (error) {
      // File doesn't exist, start empty
    }

    try {
      const symbolsData = readFileSync(join(this.dataPath, 'symbols.json'), 'utf-8');
      this.symbols = new Map(JSON.parse(symbolsData));
    } catch (error) {
      // File doesn't exist, start empty
    }

    try {
      const importsData = readFileSync(join(this.dataPath, 'imports.json'), 'utf-8');
      this.imports = new Map(JSON.parse(importsData));
    } catch (error) {
      // File doesn't exist, start empty
    }

    try {
      const chunksData = readFileSync(join(this.dataPath, 'chunks.json'), 'utf-8');
      this.chunks = new Map(JSON.parse(chunksData));
    } catch (error) {
      // File doesn't exist, start empty
    }
  }

  private saveToDisk(): void {
    writeFileSync(
      join(this.dataPath, 'files.json'),
      JSON.stringify(Array.from(this.files.entries()), null, 2)
    );
    
    writeFileSync(
      join(this.dataPath, 'symbols.json'),
      JSON.stringify(Array.from(this.symbols.entries()), null, 2)
    );
    
    writeFileSync(
      join(this.dataPath, 'imports.json'),
      JSON.stringify(Array.from(this.imports.entries()), null, 2)
    );
    
    writeFileSync(
      join(this.dataPath, 'chunks.json'),
      JSON.stringify(Array.from(this.chunks.entries()), null, 2)
    );
  }

  // Initialize Qdrant collection
  async initializeVectorStore(): Promise<void> {
    try {
      if (!this.qdrant) {
        const mod: any = await import('@qdrant/js-client-rest');
        const QdrantClient = mod.QdrantClient;
        this.qdrant = new QdrantClient({
          url: 'http://localhost:6333',
          timeout: 5000
        });
      }
      const collections = await this.qdrant.getCollections();
      const hasCodeCollection = collections.collections.some((c: any) => c.name === 'code_chunks');
      
      if (!hasCodeCollection) {
        await this.qdrant.createCollection('code_chunks', {
          vectors: {
            size: 384,  // nomic-embed-text dimension
            distance: 'Cosine'
          }
        });
        console.log('✅ Created Qdrant collection: code_chunks');
      }
    } catch (error) {
      console.warn('⚠️  Qdrant not available, vector features disabled');
      console.log('   To enable: docker run -p 6333:6333 qdrant/qdrant');
    }
  }

  // File operations
  addFile(file: CodeFile): void {
    this.files.set(file.id, file);
  }

  getFile(id: string): CodeFile | undefined {
    return this.files.get(id);
  }

  getFileByPath(path: string): CodeFile | undefined {
    for (const file of this.files.values()) {
      if (file.path === path) return file;
    }
    return undefined;
  }

  // Symbol operations
  addSymbol(symbol: CodeSymbol): void {
    this.symbols.set(symbol.id, symbol);
  }

  getSymbolsByFile(fileId: string): CodeSymbol[] {
    const results: CodeSymbol[] = [];
    for (const symbol of this.symbols.values()) {
      if (symbol.fileId === fileId) {
        results.push(symbol);
      }
    }
    return results;
  }

  getSymbolsByName(name: string): CodeSymbol[] {
    const results: CodeSymbol[] = [];
    for (const symbol of this.symbols.values()) {
      if (symbol.name === name) {
        results.push(symbol);
      }
    }
    return results;
  }

  // Import operations
  addImport(imp: CodeImport): void {
    this.imports.set(imp.id, imp);
  }

  getImportsByFile(fileId: string): CodeImport[] {
    const results: CodeImport[] = [];
    for (const imp of this.imports.values()) {
      if (imp.fileId === fileId) {
        results.push(imp);
      }
    }
    return results;
  }

  // Chunk operations
  addChunk(chunk: CodeChunk): void {
    this.chunks.set(chunk.id, chunk);
  }

  getChunksByFile(fileId: string): CodeChunk[] {
    const results: CodeChunk[] = [];
    for (const chunk of this.chunks.values()) {
      if (chunk.fileId === fileId) {
        results.push(chunk);
      }
    }
    return results;
  }

  getAllChunks(): CodeChunk[] {
    return Array.from(this.chunks.values());
  }

  // Vector operations (Qdrant)
  async storeEmbedding(chunkId: string, embedding: number[]): Promise<void> {
    try {
      const chunk = this.chunks.get(chunkId);
      if (!chunk) return;

      if (!this.qdrant) {
        const mod: any = await import('@qdrant/js-client-rest');
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
    } catch (error) {
      console.warn('Failed to store embedding:', error);
    }
  }

  async searchEmbeddings(query: string, limit: number = 10): Promise<Array<{
    id: string;
    score: number;
    payload: any;
  }>> {
    try {
      // Generate embedding for query (this would use Ollama)
      // For now, return empty - will be implemented in Phase 2
      return [];
    } catch (error) {
      console.warn('Vector search not available:', error);
      return [];
    }
  }

  // Search operations
  searchFiles(pattern: string): CodeFile[] {
    const results: CodeFile[] = [];
    const regex = new RegExp(pattern, 'i');
    
    for (const file of this.files.values()) {
      if (regex.test(file.path) || regex.test(file.language)) {
        results.push(file);
      }
    }
    
    return results;
  }

  searchSymbols(pattern: string): CodeSymbol[] {
    const results: CodeSymbol[] = [];
    const regex = new RegExp(pattern, 'i');
    
    for (const symbol of this.symbols.values()) {
      if (regex.test(symbol.name) || regex.test(symbol.type)) {
        results.push(symbol);
      }
    }
    
    return results;
  }

  // Statistics
  getStats(): {
    files: number;
    symbols: number;
    imports: number;
    chunks: number;
  } {
    return {
      files: this.files.size,
      symbols: this.symbols.size,
      imports: this.imports.size,
      chunks: this.chunks.size
    };
  }

  // Persistence
  save(): void {
    this.saveToDisk();
  }

  reset(): void {
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

  close(): void {
    this.save();
  }
}
