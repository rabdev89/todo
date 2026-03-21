"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecurityGuard = void 0;
const child_process_1 = require("child_process");
const path_1 = __importDefault(require("path"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const config_1 = require("../shared/config");
const config = config_1.BobConfig.getInstance();
class SecurityGuard {
    name = 'Security & Safety';
    description = 'Checks for committed secrets and dependency hygiene';
    async run(ticketId) {
        const rootDir = config.getRootDir();
        let score = 0;
        let output = '';
        // D1: No secrets committed (4 pts)
        const gitDiff = await this.execGit(['diff', '--cached', '--diff-filter=A', '-U0'], rootDir);
        const secretPatterns = /(API_KEY|SECRET|PASSWORD|TOKEN|PRIVATE_KEY)\s*=\s*['"][^'"]{8,}/i;
        if (!secretPatterns.test(gitDiff)) {
            score += 4;
            output += '✓ No secrets detected in staged changes (+4 pts)\n';
        }
        else {
            output += '✗ Potential secret detected in staged changes — review immediately (0 / 4 pts)\n';
        }
        // D2: package-lock.json / yarn.lock present (2 pts)
        const hasLockFile = await fs_extra_1.default.pathExists(path_1.default.join(rootDir, 'package-lock.json')) ||
            await fs_extra_1.default.pathExists(path_1.default.join(rootDir, 'yarn.lock')) ||
            await fs_extra_1.default.pathExists(path_1.default.join(rootDir, 'pnpm-lock.yaml'));
        if (hasLockFile) {
            score += 2;
            output += '✓ Lock file present — dependency versions pinned (+2 pts)\n';
        }
        else {
            output += '✗ No lock file found — dependencies are not pinned (0 / 2 pts)\n';
        }
        // D3: package.json sync with lockfile (1 pt)
        const stagedFiles = await this.execGit(['diff', '--name-only'], rootDir);
        if (stagedFiles.includes('package.json')) {
            if (stagedFiles.match(/package-lock\.json|yarn\.lock|pnpm-lock\.yaml/)) {
                score += 1;
                output += '✓ package.json change accompanied by lock file update (+1 pt)\n';
            }
            else {
                output += '✗ package.json changed but no lock file updated (0 / 1 pt)\n';
            }
        }
        else {
            score += 1;
            output += '✓ No package.json changes — dependency check skipped (+1 pt)\n';
        }
        return {
            passed: score >= 4, // Flexible pass condition for security metadata
            score,
            maxScore: 7,
            output: output.trim()
        };
    }
    async execGit(args, cwd) {
        return new Promise((resolve) => {
            const child = (0, child_process_1.spawn)('git', args, { cwd, shell: true });
            let output = '';
            child.stdout.on('data', (data) => output += data.toString());
            child.stderr.on('data', (data) => output += data.toString());
            child.on('close', () => resolve(output));
            child.on('error', () => resolve(''));
        });
    }
}
exports.SecurityGuard = SecurityGuard;
