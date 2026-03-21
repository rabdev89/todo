/**
 * Parse Worker
 * 
 * Worker thread for parsing files in parallel.
 * Uses tree-sitter to parse code and extract metadata.
 * 
 * Phase 5: Session Persistence & Parallel Processing
 */

import { parentPort } from 'worker_threads';
import * as fs from 'fs';
import Parser from 'tree-sitter';

// Import language parsers dynamically
const languages: Map<string, any> = new Map();

async function loadLanguage(language: string): Promise<any> {
  if (languages.has(language)) {
    return languages.get(language);
  }

  try {
    let langModule;
    switch (language) {
      case 'typescript':
      case 'tsx':
        langModule = await import('tree-sitter-typescript');
        languages.set(language, langModule.typescript || langModule.default);
        break;
      case 'javascript':
      case 'jsx':
        langModule = await import('tree-sitter-javascript');
        languages.set(language, langModule.default || langModule);
        break;
      case 'python':
        langModule = await import('tree-sitter-python');
        languages.set(language, langModule.default || langModule);
        break;
      default:
        return null;
    }
    return languages.get(language);
  } catch (error) {
    console.error(`Failed to load language ${language}:`, error);
    return null;
  }
}

interface ParseRequest {
  id: string;
  type: 'parse';
  data: {
    filePath: string;
    content?: string;
    language: string;
  };
}

interface ParseResult {
  id: string;
  result?: {
    filePath: string;
    language: string;
    imports: string[];
    exports: string[];
    functions: Array<{
      name: string;
      lineStart: number;
      lineEnd: number;
      signature?: string;
      docstring?: string;
    }>;
    classes: Array<{
      name: string;
      lineStart: number;
      lineEnd: number;
      methods: string[];
    }>;
    complexity: number;
    lines: number;
  };
  error?: string;
}

/**
 * Parse a file and extract code structure
 */
async function parseFile(request: ParseRequest['data']): Promise<ParseResult['result']> {
  const { filePath, language } = request;

  // Read file content if not provided
  const content = request.content || fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n').length;

  // Load language parser
  const lang = await loadLanguage(language);
  if (!lang) {
    throw new Error(`Unsupported language: ${language}`);
  }

  // Parse file
  const parser = new Parser();
  parser.setLanguage(lang);
  const tree = parser.parse(content);

  // Extract code structure
  const imports: string[] = [];
  const exports: string[] = [];
  const functions: Array<{
    name: string;
    lineStart: number;
    lineEnd: number;
    signature?: string;
    docstring?: string;
  }> = [];
  const classes: Array<{
    name: string;
    lineStart: number;
    lineEnd: number;
    methods: string[];
  }> = [];

  // Walk the AST
  const cursor = tree.walk();
  
  function walkNode() {
    const node = cursor.currentNode;
    const nodeType = node.type;

    // Extract imports
    if (nodeType.includes('import') || nodeType === 'import_statement') {
      const importText = content.slice(node.startIndex, node.endIndex);
      imports.push(importText);
    }

    // Extract exports
    if (nodeType.includes('export') || nodeType === 'export_statement') {
      const exportText = content.slice(node.startIndex, node.endIndex);
      exports.push(exportText);
    }

    // Extract functions
    if (
      nodeType === 'function_declaration' ||
      nodeType === 'method_definition' ||
      nodeType === 'function' ||
      nodeType === 'arrow_function'
    ) {
      const nameNode = node.childForFieldName?.('name');
      const name = nameNode ? content.slice(nameNode.startIndex, nameNode.endIndex) : 'anonymous';
      
      // Extract docstring (comment before function)
      let docstring: string | undefined;
      const prevNode = node.previousSibling;
      if (prevNode && (prevNode.type.includes('comment') || prevNode.type === 'comment')) {
        docstring = content.slice(prevNode.startIndex, prevNode.endIndex);
      }

      functions.push({
        name,
        lineStart: node.startPosition.row,
        lineEnd: node.endPosition.row,
        signature: content.slice(node.startIndex, node.endIndex).split('\n')[0],
        docstring
      });
    }

    // Extract classes
    if (nodeType === 'class_declaration' || nodeType === 'class_definition' || nodeType === 'class') {
      const nameNode = node.childForFieldName?.('name');
      const name = nameNode ? content.slice(nameNode.startIndex, nameNode.endIndex) : 'anonymous';

      // Find methods within class
      const methods: string[] = [];
      if (cursor.gotoFirstChild()) {
        do {
          const childNode = cursor.currentNode;
          if (
            childNode.type === 'method_definition' ||
            childNode.type === 'function_definition'
          ) {
            const methodNameNode = childNode.childForFieldName?.('name');
            if (methodNameNode) {
              methods.push(content.slice(methodNameNode.startIndex, methodNameNode.endIndex));
            }
          }
        } while (cursor.gotoNextSibling());
        cursor.gotoParent();
      }

      classes.push({
        name,
        lineStart: node.startPosition.row,
        lineEnd: node.endPosition.row,
        methods
      });
    }

    // Recurse into children
    if (cursor.gotoFirstChild()) {
      do {
        walkNode();
      } while (cursor.gotoNextSibling());
      cursor.gotoParent();
    }
  }

  if (cursor.gotoFirstChild()) {
    do {
      walkNode();
    } while (cursor.gotoNextSibling());
  }

  // Calculate complexity (simple metric based on control structures)
  let complexity = 1;
  const complexityKeywords = ['if', 'else', 'for', 'while', 'switch', 'case', 'catch', '?'];
  for (const keyword of complexityKeywords) {
    complexity += (content.match(new RegExp(`\\b${keyword}\\b`, 'g')) || []).length;
  }

  return {
    filePath,
    language,
    imports,
    exports,
    functions,
    classes,
    complexity,
    lines
  };
}

/**
 * Handle messages from parent thread
 */
if (parentPort) {
  parentPort.on('message', async (message: ParseRequest) => {
    const { id, type, data } = message;

    if (type !== 'parse') {
      parentPort!.postMessage({
        id,
        error: `Unknown task type: ${type}`
      });
      return;
    }

    try {
      const result = await parseFile(data);
      parentPort!.postMessage({
        id,
        result
      });
    } catch (error: any) {
      parentPort!.postMessage({
        id,
        error: error.message || 'Unknown error'
      });
    }
  });
}

export { parseFile };
