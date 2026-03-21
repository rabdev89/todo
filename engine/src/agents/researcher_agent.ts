import { ContextBuilder, Ticket, ContextPack } from '../repo_intelligence/context';
import { SearchService } from '../repo_intelligence/search';
import { PatternDetector } from '../repo_intelligence/patterns';
import { RepoStorage } from '../repo_intelligence/storage';
import { EmbeddingService } from '../repo_intelligence/embeddings';

import { BobConfig } from '../shared/config';
import fs from 'fs-extra';
import path from 'path';
import { StateManager } from '../state_manager';

export class ResearcherAgent {
  private contextBuilder: ContextBuilder;
  private storage: RepoStorage;

  constructor(dataPath?: string) {
    const config = BobConfig.getInstance();
    const defaultDataPath = path.join(config.getRootDir(), 'web-applications/repo_data');
    this.storage = new RepoStorage(dataPath || defaultDataPath);
    const embeddings = new EmbeddingService();
    const search = new SearchService(embeddings, this.storage);
    const patterns = new PatternDetector(this.storage);
    this.contextBuilder = new ContextBuilder(search, patterns, this.storage);
  }

  async researchTicket(ticketId: string): Promise<{
    context: ContextPack;
    insights: string[];
    recommendations: string[];
  }> {
    console.log(`🔬 Researcher analyzing ticket: ${ticketId}`);

    // Load real ticket metadata
    const ticketPath = await StateManager.getTicketPath(ticketId);
    if (!ticketPath) {
      throw new Error(`Ticket ${ticketId} not found in state.`);
    }

    const metadataPath = path.join(path.dirname(ticketPath), 'metadata.json');
    let ticket: Ticket;

    if (await fs.pathExists(metadataPath)) {
      const metadata = await fs.readJson(metadataPath);
      ticket = {
        id: ticketId,
        title: metadata.title || `Ticket ${ticketId}`,
        description: metadata.description || 'No description provided.',
        status: metadata.status || 'open',
        priority: metadata.priority || 'medium',
        tags: metadata.tags || []
      };
    } else {
      ticket = {
        id: ticketId,
        title: `Ticket ${ticketId}`,
        description: 'Sample ticket for research',
        status: 'open',
        priority: 'medium',
        tags: ['feature', 'backend']
      };
    }

    // Build intelligent context
    const context = await this.contextBuilder.buildContext(ticket);

    // Generate insights from context
    const insights = this.generateInsights(context);

    // Generate recommendations
    const recommendations = this.generateRecommendations(context, insights);

    return {
      context,
      insights,
      recommendations
    };
  }

  async generateResearchFile(ticketId: string): Promise<string> {
    const results = await this.researchTicket(ticketId);
    const ticketPath = await StateManager.getTicketPath(ticketId);
    if (!ticketPath) {
      throw new Error(`Ticket ${ticketId} not found in state.`);
    }

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
    return outputPath;
  }

  async researchQuery(query: string): Promise<{
    context: any;
    insights: string[];
  }> {
    console.log(`🔍 Researcher analyzing query: "${query}"`);

    // Build context for query
    const context = await this.contextBuilder.buildContextForQuery(query);

    // Generate insights
    const insights = this.generateQueryInsights(context);

    return {
      context,
      insights
    };
  }

  private generateInsights(context: ContextPack): string[] {
    const insights: string[] = [];

    // Pattern-based insights
    if (context.patterns.length > 0) {
      insights.push(`Detected ${context.patterns.length} architectural patterns: ${context.patterns.map(p => p.name).join(', ')}`);
    }

    // File-based insights
    if (context.files.length > 0) {
      const uniquePaths = new Set(context.files.map(f => f.path));
      const fileTypes = new Set(context.files.map(f => f.path.split('.').pop()));
      insights.push(`Found ${uniquePaths.size} relevant files across ${fileTypes.size} file types`);
    }

    // Symbol-based insights
    if (context.symbols.length > 0) {
      const symbolTypes = new Set(context.symbols.map(s => s.type));
      insights.push(`Identified ${context.symbols.length} symbols: ${Array.from(symbolTypes).join(', ')}`);
    }

    // Dependency insights
    if (context.dependencies.length > 0) {
      insights.push(`Found ${context.dependencies.length} potential dependencies to consider`);
    }

    // Skill-based insights
    if (context.skillSuggestions.length > 0) {
      insights.push(`Suggested ${context.skillSuggestions.length} relevant skills for implementation`);
    }

    // Confidence-based insights
    if (context.confidence > 0.8) {
      insights.push('High confidence in context - strong pattern matches found');
    } else if (context.confidence > 0.5) {
      insights.push('Medium confidence in context - some relevant code found');
    } else {
      insights.push('Low confidence in context - limited relevant code found');
    }

    return insights;
  }

  private generateQueryInsights(context: any): string[] {
    const insights: string[] = [];

    if (context.files && context.files.length > 0) {
      insights.push(`Found ${context.files.length} relevant code sections`);
    }

    if (context.patterns && context.patterns.length > 0) {
      insights.push(`Repository uses patterns: ${context.patterns.map((p: any) => p.name).join(', ')}`);
    }

    return insights;
  }

  private generateRecommendations(context: ContextPack, insights: string[]): string[] {
    const recommendations: string[] = [];

    // Pattern-based recommendations
    const hasServiceLayer = context.patterns.find(p => p.name === 'ServiceLayer');
    if (!hasServiceLayer && context.symbols.length > 10) {
      recommendations.push('Consider organizing business logic into service classes');
    }

    const hasRepository = context.patterns.find(p => p.name === 'Repository');
    if (!hasRepository && context.files.some(f => f.content.includes('database'))) {
      recommendations.push('Consider implementing Repository pattern for data access');
    }

    const hasErrorHandling = context.patterns.find(p => p.name === 'ErrorHandling');
    if (!hasErrorHandling && context.symbols.some(s => s.type === 'function')) {
      recommendations.push('Add consistent error handling patterns');
    }

    const hasTesting = context.patterns.find(p => p.name === 'Pytest' || p.name === 'Jest');
    if (!hasTesting) {
      recommendations.push('Add comprehensive testing with a testing framework');
    }

    // File-based recommendations
    if (context.files.length > 20) {
      recommendations.push('Large scope detected - consider breaking into smaller tickets');
    }

    // Confidence-based recommendations
    if (context.confidence < 0.3) {
      recommendations.push('Low confidence - consider manual code review or broader search terms');
    }

    // Skill-based recommendations
    if (context.skillSuggestions.length > 0) {
      recommendations.push(`Use suggested skills: ${context.skillSuggestions.join(', ')}`);
    }

    return recommendations;
  }

  async getProjectOverview(): Promise<{
    patterns: any[];
    stats: any;
    recommendations: string[];
    insights: string[];
  }> {
    const overview = await this.contextBuilder.getProjectOverview();
    
    // Add researcher-specific insights
    const insights: string[] = [
      `Repository contains ${overview.patterns.length} architectural patterns`,
      `Codebase has ${overview.stats.totalFiles} files with ${overview.stats.totalSymbols} symbols`,
      `Testing coverage: ${overview.patterns.find(p => p.name === 'Pytest' || p.name === 'Jest') ? 'Present' : 'Missing'}`
    ];

    return {
      ...overview,
      insights
    };
  }

  close(): void {
    this.storage.close();
  }
}
