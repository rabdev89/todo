/**
 * File Utilities
 *
 * Helper functions for reading files efficiently
 */
/**
 * Read last N lines from a file efficiently
 *
 * @param filePath Path to the file
 * @param lineCount Number of lines to read from the end (default: 100)
 * @returns Array of lines
 *
 * @example
 * ```typescript
 * const lastLines = readLastLines('/path/to/log.txt', 50);
 * ```
 */
export declare function readLastLines(filePath: string, lineCount?: number): string[];
/**
 * Read a JSONL (JSON Lines) file and parse each line
 *
 * @param filePath Path to the JSONL file
 * @param maxLines Maximum number of lines to read from end (default: 1000)
 * @returns Array of parsed objects
 *
 * @example
 * ```typescript
 * const entries = readJsonLines<MyType>('/path/to/data.jsonl');
 * const recent = readJsonLines<MyType>('/path/to/data.jsonl', 100);
 * ```
 */
export declare function readJsonLines<T = any>(filePath: string, maxLines?: number): T[];
/**
 * Check if a file exists
 *
 * @param filePath Path to check
 * @returns True if file exists
 */
export declare function fileExists(filePath: string): boolean;
/**
 * Read a JSON file safely
 *
 * @param filePath Path to JSON file
 * @returns Parsed JSON object or null if error
 *
 * @example
 * ```typescript
 * const config = readJson<ConfigType>('/path/to/config.json');
 * ```
 */
export declare function readJson<T = any>(filePath: string): T | null;
