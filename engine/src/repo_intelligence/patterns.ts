import { RepoStorage, CodeSymbol, CodeFile } from './storage';

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

export class PatternDetector {
  private storage: RepoStorage;

  constructor(storage: RepoStorage) {
    this.storage = storage;
  }

  detectAllPatterns(): DetectedPattern[] {
    const patterns: DetectedPattern[] = [];

    // Detect Repository Pattern
    const repoPattern = this.detectRepositoryPattern();
    if (repoPattern) patterns.push(repoPattern);

    // Detect Dependency Injection
    const diPattern = this.detectDependencyInjection();
    if (diPattern) patterns.push(diPattern);

    // Detect API Framework
    const apiPattern = this.detectAPIFramework();
    if (apiPattern) patterns.push(apiPattern);

    // Detect ORM/Database Pattern
    const ormPattern = this.detectORMPattern();
    if (ormPattern) patterns.push(ormPattern);

    // Detect Service Layer
    const servicePattern = this.detectServiceLayer();
    if (servicePattern) patterns.push(servicePattern);

    // Detect Test Framework
    const testPattern = this.detectTestFramework();
    if (testPattern) patterns.push(testPattern);

    // Detect Observer Pattern
    const observerPattern = this.detectObserverPattern();
    if (observerPattern) patterns.push(observerPattern);

    // Detect Factory Pattern
    const factoryPattern = this.detectFactoryPattern();
    if (factoryPattern) patterns.push(factoryPattern);

    // Detect Singleton Pattern
    const singletonPattern = this.detectSingletonPattern();
    if (singletonPattern) patterns.push(singletonPattern);

    // Detect Command Pattern
    const commandPattern = this.detectCommandPattern();
    if (commandPattern) patterns.push(commandPattern);

    // Detect Strategy Pattern
    const strategyPattern = this.detectStrategyPattern();
    if (strategyPattern) patterns.push(strategyPattern);

    // Detect Middleware Pattern
    const middlewarePattern = this.detectMiddlewarePattern();
    if (middlewarePattern) patterns.push(middlewarePattern);

    // Detect Error Handling Pattern
    const errorPattern = this.detectErrorHandlingPattern();
    if (errorPattern) patterns.push(errorPattern);

    // Detect Configuration Pattern
    const configPattern = this.detectConfigurationPattern();
    if (configPattern) patterns.push(configPattern);

    // Detect Logging Pattern
    const loggingPattern = this.detectLoggingPattern();
    if (loggingPattern) patterns.push(loggingPattern);

    // Detect Caching Pattern
    const cachingPattern = this.detectCachingPattern();
    if (cachingPattern) patterns.push(cachingPattern);

    // Detect Validation Pattern
    const validationPattern = this.detectValidationPattern();
    if (validationPattern) patterns.push(validationPattern);

    // Sort by confidence
    return patterns.sort((a, b) => b.confidence - a.confidence);
  }

  private detectRepositoryPattern(): DetectedPattern | null {
    const repoClasses = this.storage.getSymbolsByName('')
      .filter(s => s.name.toLowerCase().includes('repository') && s.type === 'class');

    if (repoClasses.length < 2) return null;

    const confidence = Math.min(repoClasses.length / 5, 1);

    return {
      name: 'Repository',
      confidence,
      evidence: repoClasses.map(r => r.fileId),
      examples: repoClasses.slice(0, 3).map(r => ({
        file: this.getFilePath(r.fileId),
        line: r.lineStart,
        snippet: `class ${r.name}`
      })),
      description: 'Data access layer using Repository pattern'
    };
  }

  private detectDependencyInjection(): DetectedPattern | null {
    // Look for constructor injection patterns
    const allSymbols = Array.from(this.storage.getAllChunks())
      .flatMap(chunk => this.extractSymbolsFromChunk(chunk))
      .filter(s => s.type === 'method' && s.name.includes('constructor'));

    const diConstructors = allSymbols.filter(symbol => {
      // Look for parameter assignment patterns
      return this.hasDependencyInjection(symbol);
    });

    if (diConstructors.length < 3) return null;

    return {
      name: 'DependencyInjection',
      confidence: Math.min(diConstructors.length / 10, 1),
      evidence: diConstructors.map(c => c.fileId),
      examples: diConstructors.slice(0, 3).map(c => ({
        file: this.getFilePath(c.fileId),
        line: c.lineStart,
        snippet: `def ${c.name}`
      })),
      description: 'Constructor-based dependency injection'
    };
  }

  private detectAPIFramework(): DetectedPattern | null {
    const chunks = this.storage.getAllChunks();
    
    // Check for FastAPI
    const fastapiChunks = chunks.filter(c => 
      c.content.includes('from fastapi import') || 
      c.content.includes('@app.') ||
      c.content.includes('FastAPI')
    );

    if (fastapiChunks.length > 5) {
      return {
        name: 'FastAPI',
        confidence: 0.9,
        evidence: fastapiChunks.slice(0, 5).map(c => c.fileId),
        examples: fastapiChunks.slice(0, 3).map(c => ({
          file: this.getFilePath(c.fileId),
          line: c.startLine,
          snippet: 'FastAPI endpoint'
        })),
        description: 'FastAPI web framework'
      };
    }

    // Check for Express
    const expressChunks = chunks.filter(c => 
      c.content.includes("require('express')") ||
      c.content.includes('app.get(') ||
      c.content.includes('app.post(')
    );

    if (expressChunks.length > 5) {
      return {
        name: 'Express',
        confidence: 0.9,
        evidence: expressChunks.slice(0, 5).map(c => c.fileId),
        examples: expressChunks.slice(0, 3).map(c => ({
          file: this.getFilePath(c.fileId),
          line: c.startLine,
          snippet: 'Express route'
        })),
        description: 'Express.js web framework'
      };
    }

    return null;
  }

  private detectORMPattern(): DetectedPattern | null {
    const chunks = this.storage.getAllChunks();
    
    // Check for SQLAlchemy
    const sqlalchemyChunks = chunks.filter(c => 
      c.content.includes('from sqlalchemy') ||
      c.content.includes('Base = declarative_base()') ||
      c.content.includes('session.query(')
    );

    if (sqlalchemyChunks.length > 3) {
      return {
        name: 'SQLAlchemy',
        confidence: 0.85,
        evidence: sqlalchemyChunks.slice(0, 3).map(c => c.fileId),
        examples: sqlalchemyChunks.slice(0, 3).map(c => ({
          file: this.getFilePath(c.fileId),
          line: c.startLine,
          snippet: 'SQLAlchemy ORM'
        })),
        description: 'SQLAlchemy ORM for database access'
      };
    }

    // Check for Django ORM
    const djangoChunks = chunks.filter(c => 
      c.content.includes('from django.db import models') ||
      c.content.includes('models.Model') ||
      c.content.includes('objects.')
    );

    if (djangoChunks.length > 3) {
      return {
        name: 'DjangoORM',
        confidence: 0.85,
        evidence: djangoChunks.slice(0, 3).map(c => c.fileId),
        examples: djangoChunks.slice(0, 3).map(c => ({
          file: this.getFilePath(c.fileId),
          line: c.startLine,
          snippet: 'Django ORM'
        })),
        description: 'Django ORM for database access'
      };
    }

    return null;
  }

  private detectServiceLayer(): DetectedPattern | null {
    const serviceClasses = this.storage.getSymbolsByName('')
      .filter(s => s.name.toLowerCase().includes('service') && s.type === 'class');

    if (serviceClasses.length < 3) return null;

    return {
      name: 'ServiceLayer',
      confidence: Math.min(serviceClasses.length / 8, 1),
      evidence: serviceClasses.map(s => s.fileId),
      examples: serviceClasses.slice(0, 3).map(s => ({
        file: this.getFilePath(s.fileId),
        line: s.lineStart,
        snippet: `class ${s.name}`
      })),
      description: 'Service layer for business logic'
    };
  }

  private detectTestFramework(): DetectedPattern | null {
    const chunks = this.storage.getAllChunks();
    
    // Check for pytest
    const pytestChunks = chunks.filter(c => 
      c.content.includes('import pytest') ||
      c.content.includes('@pytest') ||
      c.content.includes('def test_')
    );

    if (pytestChunks.length > 5) {
      return {
        name: 'Pytest',
        confidence: 0.9,
        evidence: pytestChunks.slice(0, 5).map(c => c.fileId),
        examples: pytestChunks.slice(0, 3).map(c => ({
          file: this.getFilePath(c.fileId),
          line: c.startLine,
          snippet: 'pytest test'
        })),
        description: 'Pytest testing framework'
      };
    }

    // Check for Jest
    const jestChunks = chunks.filter(c => 
      c.content.includes('import') && c.content.includes('from \'@jest/globals\'') ||
      c.content.includes('test(') ||
      c.content.includes('describe(')
    );

    if (jestChunks.length > 5) {
      return {
        name: 'Jest',
        confidence: 0.9,
        evidence: jestChunks.slice(0, 5).map(c => c.fileId),
        examples: jestChunks.slice(0, 3).map(c => ({
          file: this.getFilePath(c.fileId),
          line: c.startLine,
          snippet: 'Jest test'
        })),
        description: 'Jest testing framework'
      };
    }

    return null;
  }

  private extractSymbolsFromChunk(chunk: any): CodeSymbol[] {
    // This is a simplified implementation
    // In practice, you'd re-parse the chunk content
    return [];
  }

  private hasDependencyInjection(symbol: CodeSymbol): boolean {
    // Simplified check - in practice, analyze the actual code
    return !!(symbol.signature && 
           (symbol.signature.includes('def __init__(') || 
            symbol.signature.includes('constructor(')));
  }

  private getFilePath(fileId: string): string {
    const file = this.storage.getFile(fileId);
    return file?.path || 'unknown';
  }

  getPatternByName(name: string): DetectedPattern | null {
    const allPatterns = this.detectAllPatterns();
    return allPatterns.find(p => p.name.toLowerCase() === name.toLowerCase()) || null;
  }

  getPatternsByType(type: 'architecture' | 'testing' | 'framework'): DetectedPattern[] {
    const allPatterns = this.detectAllPatterns();
    
    const typeMap: Record<string, string[]> = {
      'architecture': ['Repository', 'DependencyInjection', 'ServiceLayer', 'Observer', 'Factory', 'Singleton', 'Command', 'Strategy', 'Middleware', 'ErrorHandling', 'Configuration', 'Logging', 'Caching', 'Validation'],
      'testing': ['Pytest', 'Jest'],
      'framework': ['FastAPI', 'Express', 'SQLAlchemy', 'DjangoORM']
    };

    const allowedPatterns = typeMap[type] || [];
    return allPatterns.filter(p => allowedPatterns.includes(p.name));
  }

  private detectObserverPattern(): DetectedPattern | null {
    const observerClasses = this.storage.getSymbolsByName('')
      .filter(s => 
        (s.name.toLowerCase().includes('observer') || 
         s.name.toLowerCase().includes('subscriber') ||
         s.name.toLowerCase().includes('listener')) && 
        s.type === 'class'
      );

    if (observerClasses.length < 2) return null;

    return {
      name: 'Observer',
      confidence: Math.min(observerClasses.length / 5, 1),
      evidence: observerClasses.map(o => o.fileId),
      examples: observerClasses.slice(0, 3).map(o => ({
        file: this.getFilePath(o.fileId),
        line: o.lineStart,
        snippet: `class ${o.name}`
      })),
      description: 'Observer pattern for event-driven architecture'
    };
  }

  private detectFactoryPattern(): DetectedPattern | null {
    const factoryClasses = this.storage.getSymbolsByName('')
      .filter(s => 
        (s.name.toLowerCase().includes('factory') ||
         s.name.toLowerCase().includes('creator') ||
         s.name.toLowerCase().includes('builder')) && 
        s.type === 'class'
      );

    if (factoryClasses.length < 2) return null;

    return {
      name: 'Factory',
      confidence: Math.min(factoryClasses.length / 5, 1),
      evidence: factoryClasses.map(f => f.fileId),
      examples: factoryClasses.slice(0, 3).map(f => ({
        file: this.getFilePath(f.fileId),
        line: f.lineStart,
        snippet: `class ${f.name}`
      })),
      description: 'Factory pattern for object creation'
    };
  }

  private detectSingletonPattern(): DetectedPattern | null {
    const singletonClasses = this.storage.getSymbolsByName('')
      .filter(s => 
        (s.name.toLowerCase().includes('singleton') ||
         s.name.toLowerCase().includes('instance')) && 
        s.type === 'class'
      );

    if (singletonClasses.length < 1) return null;

    return {
      name: 'Singleton',
      confidence: Math.min(singletonClasses.length / 3, 1),
      evidence: singletonClasses.map(s => s.fileId),
      examples: singletonClasses.slice(0, 3).map(s => ({
        file: this.getFilePath(s.fileId),
        line: s.lineStart,
        snippet: `class ${s.name}`
      })),
      description: 'Singleton pattern for single instance'
    };
  }

  private detectCommandPattern(): DetectedPattern | null {
    const commandClasses = this.storage.getSymbolsByName('')
      .filter(s => 
        (s.name.toLowerCase().includes('command') ||
         s.name.toLowerCase().includes('action') ||
         s.name.toLowerCase().includes('operation')) && 
        s.type === 'class'
      );

    if (commandClasses.length < 2) return null;

    return {
      name: 'Command',
      confidence: Math.min(commandClasses.length / 5, 1),
      evidence: commandClasses.map(c => c.fileId),
      examples: commandClasses.slice(0, 3).map(c => ({
        file: this.getFilePath(c.fileId),
        line: c.lineStart,
        snippet: `class ${c.name}`
      })),
      description: 'Command pattern for encapsulating requests'
    };
  }

  private detectStrategyPattern(): DetectedPattern | null {
    const strategyClasses = this.storage.getSymbolsByName('')
      .filter(s => 
        (s.name.toLowerCase().includes('strategy') ||
         s.name.toLowerCase().includes('policy') ||
         s.name.toLowerCase().includes('algorithm')) && 
        s.type === 'class'
      );

    if (strategyClasses.length < 2) return null;

    return {
      name: 'Strategy',
      confidence: Math.min(strategyClasses.length / 5, 1),
      evidence: strategyClasses.map(s => s.fileId),
      examples: strategyClasses.slice(0, 3).map(s => ({
        file: this.getFilePath(s.fileId),
        line: s.lineStart,
        snippet: `class ${s.name}`
      })),
      description: 'Strategy pattern for interchangeable algorithms'
    };
  }

  private detectMiddlewarePattern(): DetectedPattern | null {
    const chunks = this.storage.getAllChunks();
    const middlewareChunks = chunks.filter(c => 
      c.content.toLowerCase().includes('middleware') ||
      c.content.toLowerCase().includes('interceptor') ||
      c.content.toLowerCase().includes('@app.middleware')
    );

    if (middlewareChunks.length < 3) return null;

    return {
      name: 'Middleware',
      confidence: Math.min(middlewareChunks.length / 10, 1),
      evidence: middlewareChunks.map(m => m.fileId),
      examples: middlewareChunks.slice(0, 3).map(m => ({
        file: this.getFilePath(m.fileId),
        line: m.startLine,
        snippet: 'Middleware function'
      })),
      description: 'Middleware pattern for request processing'
    };
  }

  private detectErrorHandlingPattern(): DetectedPattern | null {
    const chunks = this.storage.getAllChunks();
    const errorChunks = chunks.filter(c => 
      c.content.toLowerCase().includes('try:') ||
      c.content.toLowerCase().includes('except') ||
      c.content.toLowerCase().includes('catch') ||
      c.content.toLowerCase().includes('error')
    );

    if (errorChunks.length < 10) return null;

    return {
      name: 'ErrorHandling',
      confidence: Math.min(errorChunks.length / 50, 1),
      evidence: errorChunks.map(e => e.fileId),
      examples: errorChunks.slice(0, 3).map(e => ({
        file: this.getFilePath(e.fileId),
        line: e.startLine,
        snippet: 'Error handling'
      })),
      description: 'Error handling pattern for robust code'
    };
  }

  private detectConfigurationPattern(): DetectedPattern | null {
    const configClasses = this.storage.getSymbolsByName('')
      .filter(s => 
        (s.name.toLowerCase().includes('config') ||
         s.name.toLowerCase().includes('settings') ||
         s.name.toLowerCase().includes('env')) && 
        s.type === 'class'
      );

    if (configClasses.length < 2) return null;

    return {
      name: 'Configuration',
      confidence: Math.min(configClasses.length / 5, 1),
      evidence: configClasses.map(c => c.fileId),
      examples: configClasses.slice(0, 3).map(c => ({
        file: this.getFilePath(c.fileId),
        line: c.lineStart,
        snippet: `class ${c.name}`
      })),
      description: 'Configuration pattern for app settings'
    };
  }

  private detectLoggingPattern(): DetectedPattern | null {
    const chunks = this.storage.getAllChunks();
    const logChunks = chunks.filter(c => 
      c.content.toLowerCase().includes('log') ||
      c.content.toLowerCase().includes('logger') ||
      c.content.toLowerCase().includes('logging')
    );

    if (logChunks.length < 5) return null;

    return {
      name: 'Logging',
      confidence: Math.min(logChunks.length / 20, 1),
      evidence: logChunks.map(l => l.fileId),
      examples: logChunks.slice(0, 3).map(l => ({
        file: this.getFilePath(l.fileId),
        line: l.startLine,
        snippet: 'Logging'
      })),
      description: 'Logging pattern for debugging and monitoring'
    };
  }

  private detectCachingPattern(): DetectedPattern | null {
    const chunks = this.storage.getAllChunks();
    const cacheChunks = chunks.filter(c => 
      c.content.toLowerCase().includes('cache') ||
      c.content.toLowerCase().includes('redis') ||
      c.content.toLowerCase().includes('memoize')
    );

    if (cacheChunks.length < 3) return null;

    return {
      name: 'Caching',
      confidence: Math.min(cacheChunks.length / 10, 1),
      evidence: cacheChunks.map(c => c.fileId),
      examples: cacheChunks.slice(0, 3).map(c => ({
        file: this.getFilePath(c.fileId),
        line: c.startLine,
        snippet: 'Caching'
      })),
      description: 'Caching pattern for performance optimization'
    };
  }

  private detectValidationPattern(): DetectedPattern | null {
    const validationClasses = this.storage.getSymbolsByName('')
      .filter(s => 
        (s.name.toLowerCase().includes('validator') ||
         s.name.toLowerCase().includes('validation') ||
         s.name.toLowerCase().includes('schema')) && 
        s.type === 'class'
      );

    if (validationClasses.length < 2) return null;

    return {
      name: 'Validation',
      confidence: Math.min(validationClasses.length / 5, 1),
      evidence: validationClasses.map(v => v.fileId),
      examples: validationClasses.slice(0, 3).map(v => ({
        file: this.getFilePath(v.fileId),
        line: v.lineStart,
        snippet: `class ${v.name}`
      })),
      description: 'Validation pattern for data integrity'
    };
  }
}
