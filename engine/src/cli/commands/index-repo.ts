import { Command } from 'commander';
import { CodeIndexer } from '../../repo_intelligence/indexer';
import { resolve } from 'path';
import * as os from 'os';

export const indexRepoCommand = new Command('index-repo')
  .description('Index repository for intelligent search')
  .option('-p, --path <path>', 'Repository path to index', './web-applications')
  .option('-w, --watch', 'Watch for changes and auto-reindex', false)
  .option('--reset', 'Reset index before indexing', false)
  .option('--parallel', 'Use parallel processing (faster for large repos)', false)
  .option('--workers <number>', 'Number of parallel workers', os.cpus().length.toString())
  .action(async (options) => {
    const indexer = new CodeIndexer('../web-applications/repo_data');
    
    if (options.reset) {
      indexer.reset();
    }
    
    // Initialize vector storage (Qdrant)
    console.log('🚀 Initializing vector storage...');
    await indexer.initializeVectorStorage();
    
    const repoPath = resolve(options.path);
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
      
    } catch (error) {
      console.error('❌ Indexing failed:', error);
      process.exit(1);
    } finally {
      if (!options.watch) {
        indexer.close();
      }
    }
  });
