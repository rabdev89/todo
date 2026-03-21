"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.indexRepoCommand = void 0;
const commander_1 = require("commander");
const indexer_1 = require("../../repo_intelligence/indexer");
const path_1 = require("path");
const os = __importStar(require("os"));
exports.indexRepoCommand = new commander_1.Command('index-repo')
    .description('Index repository for intelligent search')
    .option('-p, --path <path>', 'Repository path to index', './web-applications')
    .option('-w, --watch', 'Watch for changes and auto-reindex', false)
    .option('--reset', 'Reset index before indexing', false)
    .option('--parallel', 'Use parallel processing (faster for large repos)', false)
    .option('--workers <number>', 'Number of parallel workers', os.cpus().length.toString())
    .action(async (options) => {
    const indexer = new indexer_1.CodeIndexer('../web-applications/repo_data');
    if (options.reset) {
        indexer.reset();
    }
    // Initialize vector storage (Qdrant)
    console.log('🚀 Initializing vector storage...');
    await indexer.initializeVectorStorage();
    const repoPath = (0, path_1.resolve)(options.path);
    console.log(`🔍 Indexing repository: ${repoPath}`);
    if (options.parallel) {
        console.log(`🚀 Using parallel mode with ${options.workers} workers`);
    }
    try {
        const result = await indexer.index({
            repoPath,
            include: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx', '**/*.py', '**/*.dart'],
            exclude: [
                '**/node_modules/**',
                '**/.git/**',
                '**/dist/**',
                '**/build/**',
                '**/.next/**',
                '**/coverage/**',
                '**/*.d.ts'
            ],
            watch: options.watch,
            parallel: options.parallel,
            workers: parseInt(options.workers)
        });
        console.log('\n✅ Indexing complete!');
        console.log(`   Files indexed: ${result.files}`);
        console.log(`   Symbols found: ${result.symbols}`);
        console.log(`   Imports found: ${result.imports}`);
        console.log(`   Duration: ${(result.duration / 1000).toFixed(1)}s`);
        if (options.parallel) {
            console.log(`   Mode: Parallel (${options.workers} workers)`);
        }
        if (options.watch) {
            console.log('\n👀 Watching for changes... (Press Ctrl+C to stop)');
        }
    }
    catch (error) {
        console.error('❌ Indexing failed:', error);
        process.exit(1);
    }
    finally {
        if (!options.watch) {
            indexer.close();
        }
    }
});
