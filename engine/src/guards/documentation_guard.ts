import fs from 'fs-extra';
import path from 'path';
import { IValidationGuard, GuardResult } from './base_guard';
import { BobConfig } from '../shared/config';

const config = BobConfig.getInstance();

export class DocumentationGuard implements IValidationGuard {
    name = 'Documentation & Handoff';
    description = 'Verifies activity-log.md updates and presence of .env.example';

    async run(ticketId: string): Promise<GuardResult> {
        const rootDir = config.getRootDir();
        const logFile = path.join(rootDir, 'activity-log.md');
        let score = 0;
        let output = '';

        // F1: activity-log.md has been updated today (2 pts)
        if (await fs.pathExists(logFile)) {
            const today = new Date().toISOString().split('T')[0];
            const content = await fs.readFile(logFile, 'utf8');
            if (content.includes(today)) {
                score += 2;
                output += '✓ activity-log.md updated today (+2 pts)\n';
            } else {
                output += '✗ activity-log.md not updated today (0 / 2 pts)\n';
            }
        } else {
            output += '✗ activity-log.md not found (0 / 2 pts)\n';
        }

        // F2: .env.example present if .env exists (1 pt)
        if (await fs.pathExists(path.join(rootDir, '.env'))) {
            if (await fs.pathExists(path.join(rootDir, '.env.example'))) {
                score += 1;
                output += '✓ .env.example is present (+1 pt)\n';
            } else {
                output += '✗ .env exists but .env.example is missing (0 / 1 pt)\n';
            }
        } else {
            score += 1;
            output += '✓ No .env file — .env.example check skipped (+1 pt)\n';
        }

        return {
            passed: score >= 2,
            score,
            maxScore: 3,
            output: output.trim()
        };
    }
}
