import { RepoStorage } from './storage';
export interface DetectedPattern {
    name: string;
    confidence: number;
    evidence: string[];
    examples: Array<{
        file: string;
        line: number;
        snippet: string;
    }>;
    description: string;
}
export declare class PatternDetector {
    private storage;
    constructor(storage: RepoStorage);
    detectAllPatterns(): DetectedPattern[];
    private detectRepositoryPattern;
    private detectDependencyInjection;
    private detectAPIFramework;
    private detectORMPattern;
    private detectServiceLayer;
    private detectTestFramework;
    private extractSymbolsFromChunk;
    private hasDependencyInjection;
    private getFilePath;
    getPatternByName(name: string): DetectedPattern | null;
    getPatternsByType(type: 'architecture' | 'testing' | 'framework'): DetectedPattern[];
    private detectObserverPattern;
    private detectFactoryPattern;
    private detectSingletonPattern;
    private detectCommandPattern;
    private detectStrategyPattern;
    private detectMiddlewarePattern;
    private detectErrorHandlingPattern;
    private detectConfigurationPattern;
    private detectLoggingPattern;
    private detectCachingPattern;
    private detectValidationPattern;
}
//# sourceMappingURL=patterns.d.ts.map