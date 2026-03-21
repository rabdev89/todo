import { SearchService, SearchResult } from './search';
import { PatternDetector, DetectedPattern } from './patterns';
import { RepoStorage } from './storage';

export interface Ticket {
  id: string;
  title: string;
  description: string;
  status?: string;
  priority?: string;
  tags?: string[];
}

export interface ContextPack {
  ticket: {
    id: string;
    title: string;
    description: string;
  };
  files: Array<{
    path: string;
    relevance: number;
    content: string;
    lineStart: number;
    lineEnd: number;
    chunkType: 'code' | 'comment' | 'docstring';
  }>;
  symbols: Array<{
    name: string;
    type: string;
    file: string;
    lineStart: number;
    lineEnd: number;
    signature?: string;
    docstring?: string;
  }>;
  patterns: DetectedPattern[];
  dependencies: string[];
  skillSuggestions: string[];
  rationale: string;
  confidence: number;
  metadata: {
    totalFiles: number;
    totalSymbols: number;
    patternsCount: number;
    searchType: string;
  };
}

export class ContextBuilder {
  private search: SearchService;
  private patterns: PatternDetector;
  private storage: RepoStorage;

  constructor(searchService: SearchService, patternDetector: PatternDetector, storage: RepoStorage) {
    this.search = searchService;
    this.patterns = patternDetector;
    this.storage = storage;
  }

  async buildContext(ticket: Ticket): Promise<ContextPack> {
    console.log(`🔍 Building context for ticket ${ticket.id}: ${ticket.title}`);
    
    // 1. Search for relevant code
    const searchQuery = `${ticket.title} ${ticket.description}`;
    const searchResults = await this.search.search({
      text: searchQuery,
      type: 'hybrid',
      limit: 20,
      threshold: 0.5
    });

    // 2. Search for symbols related to ticket
    const symbolKeywords = this.extractKeywordsFromTicket(ticket);
    const symbolResults: any[] = [];
    
    for (const keyword of symbolKeywords) {
      const symbols = await this.search.searchSymbols(keyword, 5);
      symbolResults.push(...symbols);
    }

    // 3. Detect patterns in the codebase
    const detectedPatterns = this.patterns.detectAllPatterns();

    // 4. Find dependencies
    const dependencies = new Set<string>();
    
    // From search results
    for (const result of searchResults) {
      // Look for imports in the file
      const fileSymbols = await this.search.searchSymbols('', 50);
      const fileImports = fileSymbols.filter(s => s.file === result.file);
      fileImports.forEach(imp => dependencies.add(imp.name));
    }

    // 5. Suggest relevant skills
    const skillSuggestions = this.suggestSkills(ticket, detectedPatterns, searchResults);

    // 6. Calculate confidence
    const confidence = this.calculateConfidence(searchResults, symbolResults, detectedPatterns);

    // 7. Generate rationale
    const rationale = this.generateRationale(ticket, searchResults, detectedPatterns);

    const contextPack: ContextPack = {
      ticket: {
        id: ticket.id,
        title: ticket.title,
        description: ticket.description
      },
      files: searchResults.map(r => ({
        path: r.file,
        relevance: r.relevance,
        content: r.content,
        lineStart: r.lineStart,
        lineEnd: r.lineEnd,
        chunkType: r.chunkType
      })),
      symbols: symbolResults.slice(0, 10).map(s => ({
        name: s.name,
        type: s.type,
        file: s.file,
        lineStart: s.lineStart,
        lineEnd: s.lineEnd,
        signature: s.signature,
        docstring: s.docstring
      })),
      patterns: detectedPatterns.slice(0, 5),
      dependencies: Array.from(dependencies),
      skillSuggestions,
      rationale,
      confidence,
      metadata: {
        totalFiles: searchResults.length,
        totalSymbols: symbolResults.length,
        patternsCount: detectedPatterns.length,
        searchType: 'hybrid'
      }
    };

    console.log(`✅ Context built with ${contextPack.files.length} files, ${contextPack.symbols.length} symbols`);
    console.log(`   Confidence: ${(contextPack.confidence * 100).toFixed(1)}%`);
    
    return contextPack;
  }

  private extractKeywordsFromTicket(ticket: Ticket): string[] {
    const text = `${ticket.title} ${ticket.description}`.toLowerCase();
    
    // Extract potential function/class names
    const keywords: string[] = [];
    
    // CamelCase words
    const camelCaseMatches = text.match(/[a-z][A-Z][a-z]+/g) || [];
    keywords.push(...camelCaseMatches);
    
    // Snake_case words
    const snakeCaseMatches = text.match(/[a-z]+_[a-z]+/g) || [];
    keywords.push(...snakeCaseMatches);
    
    // Common programming terms
    const programmingTerms = ['auth', 'user', 'service', 'controller', 'model', 'api', 'database', 'test', 'config', 'util', 'helper'];
    programmingTerms.forEach(term => {
      if (text.includes(term)) keywords.push(term);
    });
    
    // Remove duplicates and return
    return [...new Set(keywords)];
  }

  private suggestSkills(
    ticket: Ticket, 
    patterns: DetectedPattern[], 
    searchResults: SearchResult[]
  ): string[] {
    const skills: string[] = [];
    const text = `${ticket.title} ${ticket.description}`.toLowerCase();

    // Pattern-based suggestions
    if (patterns.find(p => p.name === 'Repository')) {
      skills.push('repository-pattern-v1');
    }

    if (patterns.find(p => p.name === 'FastAPI')) {
      skills.push('fastapi-structure-v1');
    }

    if (patterns.find(p => p.name === 'SQLAlchemy')) {
      skills.push('database-migrations-v1');
    }

    // Content-based suggestions
    if (text.includes('auth') || text.includes('login') || text.includes('jwt')) {
      skills.push('jwt-auth-v1');
    }

    if (text.includes('error') || text.includes('exception')) {
      skills.push('error-handling-v1');
    }

    if (text.includes('cache') || text.includes('redis')) {
      skills.push('caching-strategy-v1');
    }

    if (text.includes('rate') || text.includes('limit')) {
      skills.push('rate-limiting-v1');
    }

    if (text.includes('test') || text.includes('spec')) {
      skills.push('testing-patterns-v1');
    }

    if (text.includes('api') || text.includes('endpoint')) {
      skills.push('api-design-v1');
    }

    // Remove duplicates
    return [...new Set(skills)];
  }

  private calculateConfidence(
    searchResults: SearchResult[],
    symbolResults: any[],
    patterns: DetectedPattern[]
  ): number {
    let confidence = 0;

    // Search results (40% weight)
    if (searchResults.length > 0) {
      const avgRelevance = searchResults.reduce((sum, r) => sum + r.relevance, 0) / searchResults.length;
      confidence += avgRelevance * 0.4;
    }

    // Symbol results (30% weight)
    if (symbolResults.length > 0) {
      confidence += Math.min(symbolResults.length / 10, 1) * 0.3;
    }

    // Pattern detection (30% weight)
    if (patterns.length > 0) {
      const avgPatternConfidence = patterns.reduce((sum, p) => sum + p.confidence, 0) / patterns.length;
      confidence += avgPatternConfidence * 0.3;
    }

    return Math.min(confidence, 1);
  }

  private generateRationale(
    ticket: Ticket,
    searchResults: SearchResult[],
    patterns: DetectedPattern[]
  ): string {
    const parts: string[] = [];

    parts.push(`Analyzed ticket "${ticket.title}"`);
    
    if (searchResults.length > 0) {
      parts.push(`Found ${searchResults.length} relevant code sections`);
    }

    if (patterns.length > 0) {
      const patternNames = patterns.map(p => p.name).join(', ');
      parts.push(`Detected patterns: ${patternNames}`);
    }

    return parts.join('. ');
  }

  async buildContextForQuery(query: string): Promise<Partial<ContextPack>> {
    console.log(`🔍 Building context for query: "${query}"`);
    
    const searchResults = await this.search.search({
      text: query,
      type: 'hybrid',
      limit: 10,
      threshold: 0.5
    });

    const detectedPatterns = this.patterns.detectAllPatterns();

    return {
      files: searchResults.map(r => ({
        path: r.file,
        relevance: r.relevance,
        content: r.content,
        lineStart: r.lineStart,
        lineEnd: r.lineEnd,
        chunkType: r.chunkType
      })),
      patterns: detectedPatterns.slice(0, 5),
      rationale: `Searched for "${query}" and found ${searchResults.length} results`
    };
  }

  async getProjectOverview(): Promise<{
    patterns: DetectedPattern[];
    stats: any;
    recommendations: string[];
  }> {
    const patterns = this.patterns.detectAllPatterns();
    const stats = await this.search.getStats();
    
    const recommendations: string[] = [];
    
    // Architecture recommendations
    if (!patterns.find(p => p.name === 'Repository')) {
      recommendations.push('Consider implementing Repository pattern for data access');
    }
    
    if (!patterns.find(p => p.name === 'ServiceLayer')) {
      recommendations.push('Consider organizing business logic into service classes');
    }
    
    // Testing recommendations
    const hasPytest = patterns.find(p => p.name === 'Pytest');
    const hasJest = patterns.find(p => p.name === 'Jest');
    if (!hasPytest && !hasJest) {
      recommendations.push('Add a testing framework for better code quality');
    }
    
    // Documentation recommendations
    if (stats.totalSymbols > 100 && stats.totalSymbols < 200) {
      recommendations.push('Good progress on code structure, consider adding more documentation');
    }

    return {
      patterns,
      stats,
      recommendations
    };
  }
}
