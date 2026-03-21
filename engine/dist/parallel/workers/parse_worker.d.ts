/**
 * Parse Worker
 *
 * Worker thread for parsing files in parallel.
 * Uses tree-sitter to parse code and extract metadata.
 *
 * Phase 5: Session Persistence & Parallel Processing
 */
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
declare function parseFile(request: ParseRequest['data']): Promise<ParseResult['result']>;
export { parseFile };
//# sourceMappingURL=parse_worker.d.ts.map