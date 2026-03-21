import { spawn } from 'child_process';
import { IValidationGuard, GuardResult } from './base_guard';
import path from 'path';
import fs from 'fs-extra';
import { BobConfig } from '../shared/config';

const config = BobConfig.getInstance();

export class LintGuard implements IValidationGuard {
    name = 'Lint Check';
    description = 'Validates that the code adheres to linting rules (ESLint or Biome)';

    async run(ticketId: string): Promise<GuardResult> {
        const rootDir = config.getRootDir();
        let cmd = 'npx eslint . --max-warnings=9999 --quiet';
        
        if (await fs.pathExists(path.join(rootDir, 'biome.json'))) {
            cmd = 'npx biome check .';
        } else if (!await fs.pathExists(path.join(rootDir, '.eslintrc.js')) && 
                   !await fs.pathExists(path.join(rootDir, '.eslintrc.json')) && 
                   !await fs.pathExists(path.join(rootDir, '.eslintrc.cjs')) && 
                   !await fs.pathExists(path.join(rootDir, 'eslint.config.js'))) {
            return {
                passed: true,
                score: 0,
                maxScore: 3,
                output: '⚠ No linter config found — skipping lint check'
            };
        }

        return new Promise((resolve) => {
            const child = spawn(cmd.split(' ')[0], cmd.split(' ').slice(1), {
                cwd: rootDir,
                shell: true
            });

            let output = '';
            child.stdout.on('data', (data) => output += data.toString());
            child.stderr.on('data', (data) => output += data.toString());

            child.on('close', (code) => {
                const passed = code === 0;
                resolve({
                    passed,
                    score: passed ? 3 : 0,
                    maxScore: 3,
                    output: passed ? '✓ Lint check passed' : `✗ Lint violations detected:\n${output}`
                });
            });

            child.on('error', (err) => {
                resolve({
                    passed: false,
                    score: 0,
                    maxScore: 3,
                    output: `✗ Failed to run linter: ${err.message}`
                });
            });
        });
    }
}
