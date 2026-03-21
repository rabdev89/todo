import * as path from 'path';
import * as fs from 'fs-extra';
import { Command } from 'commander';
import { ResearcherAgent } from '../../agents/researcher_agent';
import { StateManager } from '../../state_manager';

export const researchCommand = new Command('research')
  .description('Research ticket or query using Repository Intelligence (generates RESEARCH.md for tickets)')
  .argument('<ticketOrQuery>', 'Ticket ID or search query')
  .option('-q, --query', 'Treat input as search query instead of ticket', false)
  .option('-o, --output <file>', 'Output research results to file (raw JSON, optional)')
  .action(async (ticketOrQuery, options) => {
    const researcher = new ResearcherAgent();

    try {
      let results: any;

      if (options.query) {
        // Research query
        console.log(`🔍 Researching query: "${ticketOrQuery}"\n`);
        results = await researcher.researchQuery(ticketOrQuery);
        
        console.log('\n📊 Research Results:\n');
        
        console.log('🔍 Context:');
        if (results.context && results.context.files) {
          console.log(`   Files: ${results.context.files.length} relevant sections`);
          results.context.files.slice(0, 5).forEach((file: any, i: number) => {
            console.log(`     ${i + 1}. ${file.path} (${(file.relevance * 100).toFixed(1)}% relevance)`);
          });
        }
        
        if (results.context && results.context.patterns && results.context.patterns.length > 0) {
          console.log(`\n🏗️  Patterns: ${results.context.patterns.map((p: any) => p.name).join(', ')}`);
        }
        
        console.log('\n💡 Insights:');
        if (results.insights) {
          results.insights.forEach((insight: string, i: number) => {
            console.log(`   ${i + 1}. ${insight}`);
          });
        }

      } else {
        // Research ticket
        const ticketId = ticketOrQuery;
        console.log(`🎫 Researching ticket: ${ticketId}\n`);
        results = await researcher.researchTicket(ticketId);
        
        console.log('\n📊 Research Results:\n');
        
        console.log('🎫 Ticket Context:');
        if (results.context) {
          console.log(`   Files: ${results.context.files.length} relevant files`);
          console.log(`   Symbols: ${results.context.symbols.length} symbols`);
          if (results.context.patterns) {
            console.log(`   Patterns: ${results.context.patterns.map((p: any) => p.name).join(', ')}`);
          }
          console.log(`   Confidence: ${(results.context.confidence * 100).toFixed(1)}%`);
        }
        
        console.log('\n💡 Insights:');
        if (results.insights) {
          results.insights.forEach((insight: string, i: number) => {
            console.log(`   ${i + 1}. ${insight}`);
          });
        }
        
        console.log('\n📋 Recommendations:');
        if (results.recommendations) {
          results.recommendations.forEach((rec: string, i: number) => {
            console.log(`   ${i + 1}. ${rec}`);
          });
        }
        
        console.log('\n🎯 Suggested Skills:');
        if (results.context && results.context.skillSuggestions) {
          results.context.skillSuggestions.forEach((skill: string, i: number) => {
            console.log(`   ${i + 1}. ${skill}`);
          });
        }

        // AUTO-GENERATE RESEARCH.md for tickets
        try {
          const ticketPath = await StateManager.getTicketPath(ticketId);
          if (ticketPath) {
            const ticketDir = path.dirname(ticketPath);
            const outputPath = path.join(ticketDir, 'RESEARCH.md');
            
            let markdown = `# Research Findings for ${ticketId}\n\n`;
            markdown += `## 💡 Insights\n`;
            results.insights.forEach((insight: string) => markdown += `- ${insight}\n`);
            
            markdown += `\n## 📋 Recommendations\n`;
            results.recommendations.forEach((rec: string) => markdown += `- ${rec}\n`);
            
            markdown += `\n## 🏗️ Architectural Patterns\n`;
            results.context.patterns.forEach((p: any) => markdown += `- **${p.name}**: ${p.description} (Confidence: ${(p.confidence * 100).toFixed(1)}%)\n`);
            
            markdown += `\n## 🔗 Relevant Files\n`;
            const uniqueFiles = Array.from(new Set(results.context.files.map((f: any) => f.path)));
            uniqueFiles.slice(0, 10).forEach(f => markdown += `- \`${f}\`\n`);
            if (uniqueFiles.length > 10) markdown += `- ... and ${uniqueFiles.length - 10} more files\n`;

            await fs.writeFile(outputPath, markdown);
            console.log(`\n📝 Research findings saved to: ${outputPath}`);
          }
        } catch (stateErr) {
          console.warn(`⚠️  Could not save RESEARCH.md: ticket ${ticketId} not found in state.`);
        }
      }

      // Save raw JSON results to file if requested
      if (options.output && results) {
        await fs.writeJson(options.output, results, { spaces: 2 });
        console.log(`\n💾 Raw results saved to ${options.output}`);
      }

    } catch (error) {
      console.error('❌ Research failed:', error);
      process.exit(1);
    } finally {
      researcher.close();
    }
  });

export const overviewCommand = new Command('overview')
  .description('Get project overview with Repository Intelligence')
  .action(async () => {
    const researcher = new ResearcherAgent();

    try {
      console.log('📊 Generating project overview...\n');
      
      const overview = await researcher.getProjectOverview();
      
      console.log('🏗️  Architectural Patterns:');
      if (overview.patterns) {
        overview.patterns.forEach((pattern: any, i: number) => {
          console.log(`   ${i + 1}. ${pattern.name} (${(pattern.confidence * 100).toFixed(1)}% confidence)`);
          console.log(`      ${pattern.description}`);
        });
      }
      
      console.log('\n📈 Statistics:');
      if (overview.stats) {
        console.log(`   Files: ${overview.stats.totalFiles}`);
        console.log(`   Symbols: ${overview.stats.totalSymbols}`);
        console.log(`   Chunks: ${overview.stats.totalChunks}`);
        console.log(`   Vectors: ${overview.stats.vectorCount}`);
      }
      
      console.log('\n💡 Insights:');
      if (overview.insights) {
        overview.insights.forEach((insight: string, i: number) => {
          console.log(`   ${i + 1}. ${insight}`);
        });
      }
      
      console.log('\n📋 Recommendations:');
      if (overview.recommendations) {
        overview.recommendations.forEach((rec: string, i: number) => {
          console.log(`   ${i + 1}. ${rec}`);
        });
      }

    } catch (error) {
      console.error('❌ Overview generation failed:', error);
      process.exit(1);
    } finally {
      researcher.close();
    }
  });
