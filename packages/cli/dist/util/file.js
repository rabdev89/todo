"use strict";
/**
 * File Utilities
 *
 * Helper functions for reading files efficiently
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.readLastLines = readLastLines;
exports.readJsonLines = readJsonLines;
exports.fileExists = fileExists;
exports.readJson = readJson;
const fs = __importStar(require("fs"));
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
function readLastLines(filePath, lineCount = 100) {
    if (!fs.existsSync(filePath)) {
        return [];
    }
    try {
        const content = fs.readFileSync(filePath, 'utf-8');
        const allLines = content.trim().split('\n');
        // Return last N lines (or all if file has fewer lines)
        return allLines.slice(-lineCount);
    }
    catch (error) {
        console.error(`Failed to read ${filePath}:`, error);
        return [];
    }
}
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
function readJsonLines(filePath, maxLines = 1000) {
    const lines = readLastLines(filePath, maxLines);
    return lines.map(line => {
        try {
            return JSON.parse(line);
        }
        catch {
            return null;
        }
    }).filter((entry) => entry !== null);
}
/**
 * Check if a file exists
 *
 * @param filePath Path to check
 * @returns True if file exists
 */
function fileExists(filePath) {
    try {
        return fs.existsSync(filePath);
    }
    catch {
        return false;
    }
}
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
function readJson(filePath) {
    if (!fs.existsSync(filePath)) {
        return null;
    }
    try {
        const content = fs.readFileSync(filePath, 'utf-8');
        return JSON.parse(content);
    }
    catch (error) {
        console.error(`Failed to parse JSON from ${filePath}:`, error);
        return null;
    }
}
//# sourceMappingURL=file.js.map