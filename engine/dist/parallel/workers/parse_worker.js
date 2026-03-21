"use strict";
/**
 * Parse Worker
 *
 * Worker thread for parsing files in parallel.
 * Uses tree-sitter to parse code and extract metadata.
 *
 * Phase 5: Session Persistence & Parallel Processing
 */
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseFile = parseFile;
const worker_threads_1 = require("worker_threads");
const fs = __importStar(require("fs"));
const tree_sitter_1 = __importDefault(require("tree-sitter"));
// Import language parsers dynamically
const languages = new Map();
async function loadLanguage(language) {
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
    }
    catch (error) {
        console.error(`Failed to load language ${language}:`, error);
        return null;
    }
}
/**
 * Parse a file and extract code structure
 */
async function parseFile(request) {
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
    const parser = new tree_sitter_1.default();
    parser.setLanguage(lang);
    const tree = parser.parse(content);
    // Extract code structure
    const imports = [];
    const exports = [];
    const functions = [];
    const classes = [];
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
        if (nodeType === 'function_declaration' ||
            nodeType === 'method_definition' ||
            nodeType === 'function' ||
            nodeType === 'arrow_function') {
            const nameNode = node.childForFieldName?.('name');
            const name = nameNode ? content.slice(nameNode.startIndex, nameNode.endIndex) : 'anonymous';
            // Extract docstring (comment before function)
            let docstring;
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
            const methods = [];
            if (cursor.gotoFirstChild()) {
                do {
                    const childNode = cursor.currentNode;
                    if (childNode.type === 'method_definition' ||
                        childNode.type === 'function_definition') {
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
if (worker_threads_1.parentPort) {
    worker_threads_1.parentPort.on('message', async (message) => {
        const { id, type, data } = message;
        if (type !== 'parse') {
            worker_threads_1.parentPort.postMessage({
                id,
                error: `Unknown task type: ${type}`
            });
            return;
        }
        try {
            const result = await parseFile(data);
            worker_threads_1.parentPort.postMessage({
                id,
                result
            });
        }
        catch (error) {
            worker_threads_1.parentPort.postMessage({
                id,
                error: error.message || 'Unknown error'
            });
        }
    });
}
