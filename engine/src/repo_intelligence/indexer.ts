import Parser from 'tree-sitter';
import Python from 'tree-sitter-python';
import TypeScript from 'tree-sitter-typescript';
import JavaScript from 'tree-sitter-javascript';
import { glob } from 'glob';
import { statSync, readFileSync } from 'fs';
import { watch } from 'chokidar';
import { createHash } from 'crypto';
import { join, extname } from 'path';
import { RepoStorage, CodeFile, CodeSymbol, CodeImport, CodeChunk } from './storage';
import { ParallelIndexer } from '../parallel/parallel_indexer';

export interface IndexOptions {
  repoPath: string;
  include?: string[];
  exclude?: string[];
  watch?: boolean;
  // Phase 5: Parallel processing options
  parallel?: boolean;
  workers?: number;
}

export class CodeIndexer {
  private storage: RepoStorage;
  private parsers: Map<string, any> = new Map();
  private watcher?: any; // chokidar.FSWatcher
  private isWatching: boolean = false;
  private currentRepoPath: string = '';
  private currentInclude: string[] = [];
  private currentExclude: string[] = [];

  constructor(dataPath?: string) {
    this.storage = new RepoStorage(dataPath);
    
    // Initialize parsers for different languages
    this.parsers.set('python', new Parser().setLanguage(Python));
    this.parsers.set('typescript', new Parser().setLanguage(TypeScript.typescript));
    this.parsers.set('tsx', new Parser().setLanguage(TypeScript.tsx));
    this.parsers.set('javascript', new Parser().setLanguage(JavaScript));
  }

  async index(options: IndexOptions): Promise<{
    files: number;
    symbols: number;
    imports: number;
    duration: number;
    changed: number;
  }> {
    const startTime = Date.now();

    // Store current options for watcher
    this.currentRepoPath = options.repoPath;
    this.currentInclude = options.include || ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx', '**/*.py', '**/*.dart'];
    this.currentExclude = options.exclude || ['**/node_modules/**', '**/.git/**', '**/dist/**', '**/build/**', '**/.next/**', '**/coverage/**', '**/*.d.ts'];

    // Find all source files
    const files: string[] = [];
    for (const pattern of this.currentInclude) {
      const matches = await glob(pattern, {
        cwd: options.repoPath,
        ignore: this.currentExclude,
        absolute: true
      });
      files.push(...matches);
    }

    // Remove duplicates
    const uniqueFiles = [...new Set(files)];

    console.log(`🔍 Found ${uniqueFiles.length} files to index`);

    // Phase 5: Use parallel processing if enabled
    if (options.parallel) {
      return this.indexParallel(uniqueFiles, options, startTime);
    }

    let totalSymbols = 0;
    let totalImports = 0;
    let changed = 0;

    // Process each file
    for (let i = 0; i < uniqueFiles.length; i++) {
      const filePath = uniqueFiles[i];
      
      if (i % 50 === 0) {
        console.log(`   Progress: ${i}/${uniqueFiles.length} files`);
      }

      try {
        const stats = statSync(filePath);
        const content = readFileSync(filePath, 'utf-8');
        const contentHash = createHash('md5').update(content).digest('hex');
        const language = this.detectLanguage(filePath);
        const linesCount = content.split('\n').length;

        // Check if file already exists and is unchanged
        const existingFile = this.storage.getFileByPath(filePath);
        if (existingFile && existingFile.contentHash === contentHash) {
          continue; // Skip unchanged files
        }

        // Count as changed
        changed++;

        // Create file record
        const file: CodeFile = {
          id: this.generateId(filePath),
          path: filePath,
          language,
          lastModified: stats.mtimeMs,
          linesCount,
          contentHash
        };
        this.storage.addFile(file);

        // Parse with tree-sitter
        const parser = this.parsers.get(language);
        if (parser) {
          const tree = parser.parse(content);
          const { symbols, imports } = this.extractFromTree(tree, file.id);
          totalSymbols += symbols;
          totalImports += imports;
        } else {
          console.warn(`   Warning: No parser for language: ${language}`);
        }

        // Store code chunks for semantic search
        this.storeCodeChunks(file.id, content);

      } catch (error) {
        console.warn(`   Warning: Failed to index ${filePath}: ${error}`);
      }
    }

    // Save to disk
    this.storage.save();

    const duration = Date.now() - startTime;

    // Start watching if requested
    if (options.watch && !this.isWatching) {
      this.startWatching(options);
    }

    return {
      files: uniqueFiles.length,
      symbols: totalSymbols,
      imports: totalImports,
      duration,
      changed
    };
  }

  private startWatching(options: IndexOptions): void {
    console.log('👀 Starting file watcher...');
    
    // Create patterns to watch
    const watchPatterns = this.currentInclude.map(pattern => 
      join(options.repoPath, pattern)
    );
    
    this.watcher = watch(watchPatterns, {
      ignored: options.exclude,
      persistent: true,
      ignoreInitial: true
    });
    
    this.watcher.on('change', (path: string) => {
      console.log(`📝 File changed: ${path}`);
      this.incrementalIndex();
    });
    
    this.watcher.on('add', (path: string) => {
      console.log(`➕ File added: ${path}`);
      this.incrementalIndex();
    });
    
    this.isWatching = true;
  }

  private async incrementalIndex(): Promise<void> {
    // Re-index everything for now (simplified approach)
    console.log('🔄 Incremental re-indexing...');
    await this.index({
      repoPath: this.currentRepoPath,
      include: this.currentInclude,
      exclude: this.currentExclude,
      watch: false // Don't start a new watcher
    });
  }

  /**
   * Phase 5: Parallel indexing using worker threads
   */
  private async indexParallel(
    files: string[],
    options: IndexOptions,
    startTime: number
  ): Promise<{
    files: number;
    symbols: number;
    imports: number;
    duration: number;
    changed: number;
  }> {
    console.log(`🚀 Using parallel indexing with ${options.workers || 'auto'} workers...`);
    
    const parallelIndexer = new ParallelIndexer();
    
    try {
      const index = await parallelIndexer.index({
        repoPath: options.repoPath,
        include: options.include,
        exclude: options.exclude,
        batchSize: 50,
        onProgress: (completed, total) => {
          if (completed % 50 === 0) {
            const percent = Math.round((completed / total) * 100);
            console.log(`   Progress: ${completed}/${total} (${percent}%)`);
          }
        }
      });

      // Convert indexed files to storage format
      let totalSymbols = 0;
      let totalImports = 0;
      let changed = 0;

      for (const [path, file] of Object.entries(index.files)) {
        // Check if file is new or changed
        const existing = this.storage.getFileByPath(path);
        if (!existing) {
          changed++;
        }

        // Add to storage
        this.storage.addFile({
          id: this.generateId(path),
          path,
          language: file.language,
          lastModified: Date.now(),
          linesCount: file.lines,
          contentHash: '' // Would need to compute this
        });

        totalSymbols += file.functions.length + file.classes.length;
        totalImports += file.imports.length;
      }

      // Save to disk
      this.storage.save();

      const duration = Date.now() - startTime;

      // Start watching if requested
      if (options.watch && !this.isWatching) {
        this.startWatching(options);
      }

      return {
        files: files.length,
        symbols: totalSymbols,
        imports: totalImports,
        duration,
        changed
      };
    } finally {
      await parallelIndexer.shutdown();
    }
  }

  private detectLanguage(filePath: string): string {
    const ext = extname(filePath).toLowerCase();
    const langMap: Record<string, string> = {
      '.ts': 'typescript',
      '.tsx': 'tsx',
      '.js': 'javascript',
      '.jsx': 'javascript',
      '.py': 'python',
      '.dart': 'dart',
      '.go': 'go',
      '.rs': 'rust',
      '.java': 'java',
      '.kt': 'kotlin',
      '.swift': 'swift'
    };
    return langMap[ext] || 'unknown';
  }

  private extractFromTree(tree: any, fileId: string): { symbols: number; imports: number } {
    const root = tree.rootNode;
    let symbolCount = 0;
    let importCount = 0;

    // Walk the tree and extract symbols
    const walk = (node: any, depth: number = 0) => {
      if (depth > 100) return; // Prevent infinite recursion

      // Extract function definitions
      if (node.type === 'function_definition' || node.type === 'function_declaration') {
        const symbol = this.extractFunctionSymbol(node, fileId);
        if (symbol) {
          this.storage.addSymbol(symbol);
          symbolCount++;
        }
      }

      // Extract class definitions
      if (node.type === 'class_definition' || node.type === 'class_declaration') {
        const symbol = this.extractClassSymbol(node, fileId);
        if (symbol) {
          this.storage.addSymbol(symbol);
          symbolCount++;
          
          // Extract methods
          for (let i = 0; i < node.childCount; i++) {
            const child = node.child(i);
            if (child && (child.type === 'method_definition' || child.type === 'method_declaration')) {
              const methodSymbol = this.extractMethodSymbol(child, fileId, symbol.name);
              if (methodSymbol) {
                this.storage.addSymbol(methodSymbol);
                symbolCount++;
              }
            }
          }
        }
      }

      // Extract imports
      if (node.type === 'import_statement' || node.type === 'import_declaration') {
        const imp = this.extractImport(node, fileId);
        if (imp) {
          this.storage.addImport(imp);
          importCount++;
        }
      }

      // Recurse into children
      for (let i = 0; i < node.childCount; i++) {
        const child = node.child(i);
        if (child) {
          walk(child, depth + 1);
        }
      }
    };

    walk(root);
    return { symbols: symbolCount, imports: importCount };
  }

  private extractFunctionSymbol(node: any, fileId: string): CodeSymbol | null {
    const nameNode = node.childForFieldName('name');
    if (!nameNode) return null;

    const name = nameNode.text;
    const docstring = this.extractDocstring(node);

    return {
      id: this.generateId(`${fileId}-${name}`),
      fileId,
      name,
      type: 'function',
      lineStart: node.startPosition.row + 1,
      lineEnd: node.endPosition.row + 1,
      signature: node.text,
      docstring,
      isExported: this.isExported(node)
    };
  }

  private extractClassSymbol(node: any, fileId: string): CodeSymbol | null {
    const nameNode = node.childForFieldName('name');
    if (!nameNode) return null;

    const name = nameNode.text;
    const docstring = this.extractDocstring(node);

    return {
      id: this.generateId(`${fileId}-${name}`),
      fileId,
      name,
      type: 'class',
      lineStart: node.startPosition.row + 1,
      lineEnd: node.endPosition.row + 1,
      docstring,
      isExported: this.isExported(node)
    };
  }

  private extractMethodSymbol(node: any, fileId: string, className: string): CodeSymbol | null {
    const nameNode = node.childForFieldName('name');
    if (!nameNode) return null;

    const name = `${className}.${nameNode.text}`;
    const docstring = this.extractDocstring(node);

    return {
      id: this.generateId(`${fileId}-${name}`),
      fileId,
      name,
      type: 'method',
      lineStart: node.startPosition.row + 1,
      lineEnd: node.endPosition.row + 1,
      signature: node.text,
      docstring,
      isExported: this.isExported(node)
    };
  }

  private extractImport(node: any, fileId: string): CodeImport | null {
    // This varies by language, simplified implementation
    const text = node.text;
    
    // Try to extract module and imported names
    const importRegex = /import\s+(.+?)\s+from\s+['"](.+?)['"]/;
    const match = text.match(importRegex);
    
    if (match) {
      const importedNames = match[1].split(',').map((s: string) => s.trim());
      const sourceModule = match[2];
      
      // Create import entry for each name
      for (const importedName of importedNames) {
        return {
          id: this.generateId(`${fileId}-${importedName}`),
          fileId,
          importedName,
          sourceModule,
          isExternal: !sourceModule.startsWith('.'),
          lineNumber: node.startPosition.row + 1
        };
      }
    }

    return null;
  }

  private extractDocstring(node: any): string | undefined {
    // Look for docstring in first child (language-specific)
    for (let i = 0; i < node.childCount; i++) {
      const child = node.child(i);
      if (child && (child.type === 'string' || child.type === 'comment' || child.type === 'block_comment')) {
        const text = child.text;
        if (text && (text.startsWith('"""') || text.startsWith("'''") || text.startsWith('/*'))) {
          return text.replace(/^[\"'`]|['\"`]$/g, '').trim();
        }
      }
    }
    return undefined;
  }

  private isExported(node: any): boolean {
    // Check if node has export modifier
    for (let i = 0; i < node.childCount; i++) {
      const child = node.child(i);
      if (child && (child.type === 'export' || (child.text && child.text === 'export'))) {
        return true;
      }
    }
    return false;
  }

  private storeCodeChunks(fileId: string, content: string): void {
    const lines = content.split('\n');
    const chunkSize = 50; // Lines per chunk

    for (let i = 0; i < lines.length; i += chunkSize) {
      const chunkLines = lines.slice(i, i + chunkSize);
      const chunkContent = chunkLines.join('\n');
      
      const chunk: CodeChunk = {
        id: this.generateId(`${fileId}-chunk-${i}`),
        fileId,
        content: chunkContent,
        startLine: i + 1,
        endLine: Math.min(i + chunkSize, lines.length),
        chunkType: 'code'
      };
      
      this.storage.addChunk(chunk);
    }
  }

  private generateId(input: string): string {
    return createHash('sha256').update(input).digest('hex').substring(0, 16);
  }

  reset(): void {
    this.storage.reset();
    console.log('🗑️  Index database reset');
  }

  close(): void {
    if (this.watcher && this.watcher.close) {
      this.watcher.close();
      this.isWatching = false;
    }
    this.storage.close();
  }

  // Initialize vector storage (Qdrant)
  async initializeVectorStorage(): Promise<void> {
    await this.storage.initializeVectorStore();
  }
}
