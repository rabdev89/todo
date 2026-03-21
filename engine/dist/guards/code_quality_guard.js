"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CodeQualityGuard = void 0;
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const glob_1 = require("glob");
class CodeQualityGuard {
    name = 'Code Quality';
    description = 'Checks for leftover console.log or debugger statements in source code';
    async run(ticketId) {
        const rootDir = path_1.default.resolve(__dirname, '../../../');
        const srcDirs = ['src', 'lib', 'app', 'packages'];
        let files = [];
        for (const dir of srcDirs) {
            const fullPath = path_1.default.join(rootDir, dir);
            if (await fs_extra_1.default.pathExists(fullPath)) {
                const matches = (0, glob_1.globSync)('**/*.{ts,tsx,js,jsx}', { cwd: fullPath });
                files.push(...matches.map(m => path_1.default.join(dir, m)));
            }
        }
        if (files.length === 0) {
            return {
                passed: true,
                score: 0,
                maxScore: 2,
                output: '⚠ No source files found for code quality check'
            };
        }
        const violations = [];
        const pattern = /console\.log|debugger/;
        for (const file of files) {
            const filePath = path_1.default.join(rootDir, file);
            try {
                const stat = await fs_extra_1.default.stat(filePath);
                if (!stat.isFile())
                    continue;
            }
            catch {
                continue;
            }
            const content = await fs_extra_1.default.readFile(filePath, 'utf8');
            if (pattern.test(content)) {
                const lines = content.split('\n');
                lines.forEach((line, index) => {
                    if (pattern.test(line)) {
                        violations.push(`${file}:${index + 1}: ${line.trim()}`);
                    }
                });
            }
        }
        const passed = violations.length === 0;
        return {
            passed,
            score: passed ? 2 : 0,
            maxScore: 2,
            output: passed
                ? '✓ No console.log or debugger statements found in source'
                : `✗ Found ${violations.length} console.log/debugger statement(s):\n${violations.join('\n')}`
        };
    }
}
exports.CodeQualityGuard = CodeQualityGuard;
