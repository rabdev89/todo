import fs from 'fs-extra';
import path from 'path';
import { IValidationGuard, GuardResult } from './base_guard';
import { globSync } from 'glob';

export class CodeQualityGuard implements IValidationGuard {
    name = 'Code Quality';
    description = 'Checks for leftover console.log or debugger statements in source code';

    async run(ticketId: string): Promise<GuardResult> {
        const rootDir = path.resolve(__dirname, '../../../');
        const srcDirs = ['src', 'lib', 'app', 'packages'];
        let files: string[] = [];

        for (const dir of srcDirs) {
            const fullPath = path.join(rootDir, dir);
            if (await fs.pathExists(fullPath)) {
                const matches = globSync('**/*.{ts,tsx,js,jsx}', { cwd: fullPath });
                files.push(...matches.map(m => path.join(dir, m)));
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

        const violations: string[] = [];
        const pattern = /console\.log|debugger/;

        for (const file of files) {
            const filePath = path.join(rootDir, file);
            try {
                const stat = await fs.stat(filePath);
                if (!stat.isFile()) continue;
            } catch { continue; }
            const content = await fs.readFile(filePath, 'utf8');
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
