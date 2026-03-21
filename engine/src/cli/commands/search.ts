import { Command } from 'commander';
import { SearchService } from '../../repo_intelligence/search';
import { EmbeddingService } from '../../repo_intelligence/embeddings';
import { RepoStorage } from '../../repo_intelligence/storage';

export const searchCommand = new Command('search')
  .description('Search repository by meaning or keyword')
  .argument('<query>', 'Search query')
  .option('-t, --type <type>', 'Search type: semantic, keyword, hybrid', 'hybrid')
  .option('-l, --limit <limit>', 'Number of results', '10')
  .option('-s, --threshold <threshold>', 'Similarity threshold for semantic search', '0.5')
  .action(async (query, options) => {
    const storage = new RepoStorage('../web-applications/repo_data');
    const embeddings = new EmbeddingService();
    const search = new SearchService(embeddings, storage);

    console.log(`🔍 Searching for: "${query}"`);
    console.log(`   Type: ${options.type}`);
    console.log(`   Limit: ${options.limit}`);
    console.log();

    try {
      const results = await search.search({
        text: query,
        type: options.type,
        limit: parseInt(options.limit),
        threshold: parseFloat(options.threshold)
      });

      if (results.length === 0) {
        console.log('No results found.');
        return;
      }

      console.log(`Found ${results.length} results:\n`);

      results.forEach((result, i) => {
        console.log(`${i + 1}. ${result.file}:${result.lineStart}`);
        console.log(`   Relevance: ${(result.relevance * 100).toFixed(1)}%`);
        console.log(`   Type: ${result.chunkType}`);
        
        // Show first few lines of content
        const preview = result.content.split('\n').slice(0, 3).join('\n');
        console.log(`   Preview:\n${'   ' + preview.replace(/\n/g, '\n   ')}\n`);
      });

    } catch (error) {
      console.error('❌ Search failed:', error);
      process.exit(1);
    } finally {
      storage.close();
    }
  });

export const searchSymbolsCommand = new Command('symbols')
  .description('Search for symbols (functions, classes, methods)')
  .argument('<name>', 'Symbol name to search for')
  .option('-l, --limit <limit>', 'Number of results', '10')
  .action(async (name, options) => {
    const storage = new RepoStorage('./repo_data');
    const search = new SearchService(new EmbeddingService(), storage);

    console.log(`🔍 Searching for symbols: "${name}"\n`);

    try {
      const results = await search.searchSymbols(name, parseInt(options.limit));

      if (results.length === 0) {
        console.log('No symbols found.');
        return;
      }

      console.log(`Found ${results.length} symbols:\n`);

      results.forEach((result, i) => {
        console.log(`${i + 1}. ${result.name}`);
        console.log(`   Type: ${result.type}`);
        console.log(`   Location: ${result.file}:${result.lineStart}`);
        
        if (result.signature) {
          console.log(`   Signature: ${result.signature.substring(0, 100)}...`);
        }
        
        if (result.docstring) {
          console.log(`   Doc: ${result.docstring.substring(0, 100)}...`);
        }
        console.log();
      });

    } catch (error) {
      console.error('❌ Symbol search failed:', error);
      process.exit(1);
    } finally {
      storage.close();
    }
  });

export const findDependentsCommand = new Command('dependents')
  .description('Find files that depend on a symbol')
  .argument('<symbol>', 'Symbol name to find dependents for')
  .action(async (symbol) => {
    const storage = new RepoStorage('./repo_data');
    const search = new SearchService(new EmbeddingService(), storage);

    console.log(`🔍 Finding dependents of: "${symbol}"\n`);

    try {
      const dependents = await search.findDependents(symbol);

      if (dependents.length === 0) {
        console.log('No dependents found.');
        return;
      }

      console.log(`Found ${dependents.length} dependent files:\n`);

      dependents.forEach((file, i) => {
        console.log(`${i + 1}. ${file}`);
      });

    } catch (error) {
      console.error('❌ Failed to find dependents:', error);
      process.exit(1);
    } finally {
      storage.close();
    }
  });

export const embedCommand = new Command('embed')
  .description('Generate embeddings for all code chunks')
  .option('-f, --force', 'Force re-generation of all embeddings', false)
  .option('-b, --batch <size>', 'Batch size for processing', '10')
  .action(async (options) => {
    const storage = new RepoStorage('./repo_data');
    const embeddings = new EmbeddingService();

    console.log('🔄 Generating embeddings for code chunks...');

    // Check Ollama connection
    const connected = await embeddings.testConnection();
    if (!connected) {
      process.exit(1);
    }

    // Check model availability
    const modelReady = await embeddings.checkModel();
    if (!modelReady) {
      process.exit(1);
    }

    try {
      // Get all chunks
      const chunks = storage.getAllChunks();
      console.log(`   Found ${chunks.length} chunks to embed`);

      // Filter already embedded chunks if not forcing
      let chunksToEmbed = chunks;
      if (!options.force) {
        // TODO: Check which chunks are already embedded in Qdrant
        // For now, embed all chunks
      }

      // Generate embeddings
      const texts = chunksToEmbed.map(chunk => chunk.content);
      const batchSize = parseInt(options.batch);
      
      const embeddingVectors = await embeddings.generateBatchEmbeddings(texts, batchSize);

      // Store embeddings in Qdrant
      console.log('💾 Storing embeddings in Qdrant...');
      
      for (let i = 0; i < chunksToEmbed.length; i++) {
        const chunk = chunksToEmbed[i];
        const embedding = embeddingVectors[i];
        
        await storage.storeEmbedding(chunk.id, embedding);
      }

      console.log('✅ Embeddings generation complete!');
      
      const stats = await embeddings.getCacheStats();
      console.log(`   Cache size: ${stats.size} embeddings`);

    } catch (error) {
      console.error('❌ Embedding generation failed:', error);
      process.exit(1);
    } finally {
      storage.close();
    }
  });

export const statsCommand = new Command('stats')
  .description('Show repository intelligence statistics')
  .action(async () => {
    const storage = new RepoStorage('./repo_data');
    const embeddings = new EmbeddingService();
    const search = new SearchService(embeddings, storage);

    try {
      const stats = await search.getStats();
      
      console.log('📊 Repository Intelligence Statistics\n');
      console.log('   Storage:');
      console.log(`     Files: ${stats.totalFiles}`);
      console.log(`     Symbols: ${stats.totalSymbols}`);
      console.log(`     Imports: ${stats.totalImports}`);
      console.log(`     Chunks: ${stats.totalChunks}`);
      console.log();
      console.log('   Vectors:');
      console.log(`     Embedded: ${stats.vectorCount}`);
      console.log(`     Cached: ${stats.cacheSize}`);
      console.log();
      
      const cacheStats = embeddings.getCacheStats();
      console.log('   Cache:');
      console.log(`     Model: ${cacheStats.model}`);
      console.log(`     Path: ${cacheStats.cachePath}`);

    } catch (error) {
      console.error('❌ Failed to get stats:', error);
      process.exit(1);
    } finally {
      storage.close();
    }
  });
