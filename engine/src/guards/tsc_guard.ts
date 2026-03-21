import { spawn } from 'child_process';
import { IValidationGuard, GuardResult } from './base_guard';
import path from 'path';
import { BobConfig } from '../shared/config';

const config = BobConfig.getInstance();

export class TscGuard implements IValidationGuard {
    name = 'TypeScript Check';
    description = 'Validates that TypeScript compiles cleanly (tsc --noEmit)';

    async run(ticketId: string): Promise<GuardResult> {
        return new Promise((resolve) => {
            const child = spawn('npx', ['tsc', '--noEmit'], {
                cwd: config.getRootDir(),
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
                    output: passed ? '✓ TypeScript compiles cleanly' : `✗ TypeScript errors detected:\n${output}`
                });
            });

            child.on('error', (err) => {
                resolve({
                    passed: false,
                    score: 0,
                    maxScore: 3,
                    output: `✗ Failed to run tsc: ${err.message}`
                });
            });
        });
    }
}
