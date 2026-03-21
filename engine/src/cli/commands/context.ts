import { Command } from 'commander';
import { SearchService } from '../../repo_intelligence/search';
import { PatternDetector } from '../../repo_intelligence/patterns';
import { ContextBuilder } from '../../repo_intelligence/context';
import { RepoStorage } from '../../repo_intelligence/storage';
import { EmbeddingService } from '../../repo_intelligence/embeddings';

export const buildContextCommand = new Command('build-context')
  .description('Build intelligent context for a ticket or query')
  .argument('[query]', 'Query to search for (optional)')
  .option('-t, --ticket <id>', 'Ticket ID to build context for')
  .option('-o, --output <file>', 'Output context to file (optional)')
  .action(async (query, options) => {
    const storage = new RepoStorage('../web-applications/repo_data');
    const embeddings = new EmbeddingService();
    const search = new SearchService(embeddings, storage);
    const patterns = new PatternDetector(storage);
    const contextBuilder = new ContextBuilder(search, patterns, storage);

    try {
      if (options.ticket) {
        // Build context for a ticket
        const ticket = {
          id: options.ticket,
          title: `Sample Ticket ${options.ticket}`,
          description: query || 'Sample description for context building'
        };
        
        console.log(`🔍 Building context for ticket ${options.ticket}\n`);
        
        const context = await contextBuilder.buildContext(ticket);
        
        console.log('\n📋 Context Pack:\n');
        console.log(`Ticket: ${context.ticket.id} - ${context.ticket.title}`);
        console.log(`Files: ${context.files.length} relevant files`);
        console.log(`Symbols: ${context.symbols.length} symbols`);
        console.log(`Patterns: ${context.patterns.map(p => p.name).join(', ')}`);
        console.log(`Confidence: ${(context.confidence * 100).toFixed(1)}%\n`);
        
        console.log('📄 Files:');
        context.files.slice(0, 5).forEach((file, i) => {
          console.log(`  ${i + 1}. ${file.path} (${(file.relevance * 100).toFixed(1)}%)`);
        });
        
        console.log('\n🔧 Patterns:');
        context.patterns.forEach((pattern, i) => {
          console.log(`  ${i + 1}. ${pattern.name} (${(pattern.confidence * 100).toFixed(1)}% confidence)`);
          console.log(`     ${pattern.description}`);
        });
        
        console.log('\n💡 Skills:');
        context.skillSuggestions.forEach((skill, i) => {
          console.log(`  ${i + 1}. ${skill}`);
        });
        
        console.log(`\n📝 Rationale: ${context.rationale}`);
        
        if (options.output) {
          const fs = require('fs');
          fs.writeFileSync(options.output, JSON.stringify(context, null, 2));
          console.log(`\n💾 Context saved to ${options.output}`);
        }
        
      } else if (query) {
        // Build context for a query
        console.log(`🔍 Building context for query: "${query}"\n`);
        
        const context = await contextBuilder.buildContextForQuery(query);
        
        console.log('\n📋 Query Context:\n');
        console.log(`Files: ${context.files?.length || 0} relevant files`);
        
        if (context.files && context.files.length > 0) {
          console.log('\n📄 Files:');
          context.files.slice(0, 5).forEach((file, i) => {
            console.log(`  ${i + 1}. ${file.path} (${(file.relevance * 100).toFixed(1)}%)`);
          });
        }
        
        if (context.patterns && context.patterns.length > 0) {
          console.log('\n🔧 Patterns:');
          context.patterns.forEach((pattern, i) => {
            console.log(`  ${i + 1}. ${pattern.name} (${(pattern.confidence * 100).toFixed(1)}%)`);
          });
        }
        
        console.log(`\n📝 Rationale: ${context.rationale}`);
        
      } else {
        // Show project overview
        console.log('🔍 Building project overview...\n');
        
        const overview = await contextBuilder.getProjectOverview();
        
        console.log('📊 Project Overview:\n');
        
        console.log('🔧 Detected Patterns:');
        overview.patterns.forEach((pattern, i) => {
          console.log(`  ${i + 1}. ${pattern.name} (${(pattern.confidence * 100).toFixed(1)}% confidence)`);
          console.log(`     ${pattern.description}`);
        });
        
        console.log('\n📈 Statistics:');
        console.log(`  Files: ${overview.stats.totalFiles}`);
        console.log(`  Symbols: ${overview.stats.totalSymbols}`);
        console.log(`  Chunks: ${overview.stats.totalChunks}`);
        console.log(`  Vectors: ${overview.stats.vectorCount}`);
        
        console.log('\n💡 Recommendations:');
        overview.recommendations.forEach((rec, i) => {
          console.log(`  ${i + 1}. ${rec}`);
        });
      }

    } catch (error) {
      console.error('❌ Context building failed:', error);
      process.exit(1);
    } finally {
      storage.close();
    }
  });

export const patternsCommand = new Command('patterns')
  .description('Detect architectural patterns in the codebase')
  .option('-t, --type <type>', 'Filter by type: architecture, testing, framework')
  .option('-l, --limit <limit>', 'Number of patterns to show', '10')
  .action(async (options) => {
    const storage = new RepoStorage('./repo_data');
    const patterns = new PatternDetector(storage);

    try {
      console.log('🔍 Detecting patterns in codebase...\n');
      
      let detectedPatterns = patterns.detectAllPatterns();
      
      if (options.type) {
        detectedPatterns = patterns.getPatternsByType(options.type as any);
      }
      
      if (detectedPatterns.length === 0) {
        console.log('No patterns detected.');
        return;
      }
      
      const limit = parseInt(options.limit) || 10;
      detectedPatterns = detectedPatterns.slice(0, limit);
      
      console.log(`Found ${detectedPatterns.length} patterns:\n`);
      
      detectedPatterns.forEach((pattern, i) => {
        console.log(`${i + 1}. ${pattern.name}`);
        console.log(`   Confidence: ${(pattern.confidence * 100).toFixed(1)}%`);
        console.log(`   Description: ${pattern.description}`);
        console.log(`   Evidence: ${pattern.evidence.length} files`);
        
        if (pattern.examples.length > 0) {
          console.log(`   Examples:`);
          pattern.examples.forEach((ex, j) => {
            console.log(`     ${j + 1}. ${ex.file}:${ex.line} - ${ex.snippet}`);
          });
        }
        console.log();
      });

    } catch (error) {
      console.error('❌ Pattern detection failed:', error);
      process.exit(1);
    } finally {
      storage.close();
    }
  });
