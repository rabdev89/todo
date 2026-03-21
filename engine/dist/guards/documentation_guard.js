"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentationGuard = void 0;
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const config_1 = require("../shared/config");
const config = config_1.BobConfig.getInstance();
class DocumentationGuard {
    name = 'Documentation & Handoff';
    description = 'Verifies activity-log.md updates and presence of .env.example';
    async run(ticketId) {
        const rootDir = config.getRootDir();
        const logFile = path_1.default.join(rootDir, 'activity-log.md');
        let score = 0;
        let output = '';
        // F1: activity-log.md has been updated today (2 pts)
        if (await fs_extra_1.default.pathExists(logFile)) {
            const today = new Date().toISOString().split('T')[0];
            const content = await fs_extra_1.default.readFile(logFile, 'utf8');
            if (content.includes(today)) {
                score += 2;
                output += '✓ activity-log.md updated today (+2 pts)\n';
            }
            else {
                output += '✗ activity-log.md not updated today (0 / 2 pts)\n';
            }
        }
        else {
            output += '✗ activity-log.md not found (0 / 2 pts)\n';
        }
        // F2: .env.example present if .env exists (1 pt)
        if (await fs_extra_1.default.pathExists(path_1.default.join(rootDir, '.env'))) {
            if (await fs_extra_1.default.pathExists(path_1.default.join(rootDir, '.env.example'))) {
                score += 1;
                output += '✓ .env.example is present (+1 pt)\n';
            }
            else {
                output += '✗ .env exists but .env.example is missing (0 / 1 pt)\n';
            }
        }
        else {
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
exports.DocumentationGuard = DocumentationGuard;
