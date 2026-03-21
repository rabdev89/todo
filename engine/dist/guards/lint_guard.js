"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LintGuard = void 0;
const child_process_1 = require("child_process");
const path_1 = __importDefault(require("path"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const config_1 = require("../shared/config");
const config = config_1.BobConfig.getInstance();
class LintGuard {
    name = 'Lint Check';
    description = 'Validates that the code adheres to linting rules (ESLint or Biome)';
    async run(ticketId) {
        const rootDir = config.getRootDir();
        let cmd = 'npx eslint . --max-warnings=9999 --quiet';
        if (await fs_extra_1.default.pathExists(path_1.default.join(rootDir, 'biome.json'))) {
            cmd = 'npx biome check .';
        }
        else if (!await fs_extra_1.default.pathExists(path_1.default.join(rootDir, '.eslintrc.js')) &&
            !await fs_extra_1.default.pathExists(path_1.default.join(rootDir, '.eslintrc.json')) &&
            !await fs_extra_1.default.pathExists(path_1.default.join(rootDir, '.eslintrc.cjs')) &&
            !await fs_extra_1.default.pathExists(path_1.default.join(rootDir, 'eslint.config.js'))) {
            return {
                passed: true,
                score: 0,
                maxScore: 3,
                output: '⚠ No linter config found — skipping lint check'
            };
        }
        return new Promise((resolve) => {
            const child = (0, child_process_1.spawn)(cmd.split(' ')[0], cmd.split(' ').slice(1), {
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
exports.LintGuard = LintGuard;
