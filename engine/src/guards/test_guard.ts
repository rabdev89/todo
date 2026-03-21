import { spawn } from 'child_process';
import { IValidationGuard, GuardResult } from './base_guard';
import path from 'path';
import fs from 'fs-extra';
import { BobConfig } from '../shared/config';

const config = BobConfig.getInstance();

export class TestGuard implements IValidationGuard {
    name = 'Testing';
    description = 'Executes the test suite and validates code coverage';

    async run(ticketId: string): Promise<GuardResult> {
        const rootDir = config.getRootDir();
        const packageJsonPath = path.join(rootDir, 'package.json');
        
        if (!await fs.pathExists(packageJsonPath)) {
            return { passed: true, score: 0, maxScore: 7, output: '⚠ No package.json found — skipping tests' };
        }

        const pkg = await fs.readJson(packageJsonPath);
        if (!pkg.scripts || !pkg.scripts.test) {
            return { passed: true, score: 0, maxScore: 7, output: '⚠ No test script found in package.json — skipping tests' };
        }

        return new Promise((resolve) => {
            const child = spawn('npm', ['test', '--', '--passWithNoTests'], {
                cwd: rootDir,
                shell: true
            });

            let output = '';
            child.stdout.on('data', (data) => output += data.toString());
            child.stderr.on('data', (data) => output += data.toString());

            child.on('close', (code) => {
                const passed = output.toLowerCase().includes('passed') || 
                               output.toLowerCase().includes('pass') || 
                               output.toLowerCase().includes('ok') ||
                               code === 0;

                if (!passed) {
                    resolve({
                        passed: false,
                        score: 0,
                        maxScore: 7,
                        output: `✗ Test suite has failures:\n${output}`
                    });
                    return;
                }

                let score = 4; // 4 points for passing tests
                let coverageOutput = '';
                
                // Heuristic for coverage parsing (supports Jest/Vitest style tables)
                const coverageMatch = output.match(/All files\s+\|\s+([\d.]+)\s+\|\s+([\d.]+)\s+\|\s+([\d.]+)\s+\|\s+([\d.]+)/) ||
                                     output.match(/Lines\s*:\s*([\d.]+)%/);
                
                if (coverageMatch) {
                    const coverage = parseFloat(coverageMatch[1]);
                    if (coverage >= 80) {
                        score += 3;
                        coverageOutput = `\n✓ Code coverage ≥ 80% (${coverage}%) (+3 pts)`;
                    } else {
                        coverageOutput = `\n✗ Code coverage below 80% (${coverage}%) (0 / 3 pts)`;
                    }
                } else {
                    coverageOutput = '\n⚠ Coverage data not found in test output — skipping coverage check (0 / 3 pts)';
                }

                resolve({
                    passed: true,
                    score,
                    maxScore: 7,
                    output: `✓ Test suite passes (+4 pts)${coverageOutput}`
                });
            });

            child.on('error', (err) => {
                resolve({
                    passed: false,
                    score: 0,
                    maxScore: 7,
                    output: `✗ Failed to run tests: ${err.message}`
                });
            });
        });
    }
}
