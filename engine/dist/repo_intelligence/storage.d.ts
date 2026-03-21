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
export declare class RepoStorage {
    private qdrant;
    private dataPath;
    private files;
    private symbols;
    private imports;
    private chunks;
    constructor(dataPath?: string);
    private loadFromDisk;
    private saveToDisk;
    initializeVectorStore(): Promise<void>;
    addFile(file: CodeFile): void;
    getFile(id: string): CodeFile | undefined;
    getFileByPath(path: string): CodeFile | undefined;
    addSymbol(symbol: CodeSymbol): void;
    getSymbolsByFile(fileId: string): CodeSymbol[];
    getSymbolsByName(name: string): CodeSymbol[];
    addImport(imp: CodeImport): void;
    getImportsByFile(fileId: string): CodeImport[];
    addChunk(chunk: CodeChunk): void;
    getChunksByFile(fileId: string): CodeChunk[];
    getAllChunks(): CodeChunk[];
    storeEmbedding(chunkId: string, embedding: number[]): Promise<void>;
    searchEmbeddings(query: string, limit?: number): Promise<Array<{
        id: string;
        score: number;
        payload: any;
    }>>;
    searchFiles(pattern: string): CodeFile[];
    searchSymbols(pattern: string): CodeSymbol[];
    getStats(): {
        files: number;
        symbols: number;
        imports: number;
        chunks: number;
    };
    save(): void;
    reset(): void;
    close(): void;
}
//# sourceMappingURL=storage.d.ts.map