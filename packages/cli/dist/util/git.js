"use strict";
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
exports.ensureGitInstalled = ensureGitInstalled;
exports.cloneRepository = cloneRepository;
exports.isGitRepository = isGitRepository;
exports.pullRepository = pullRepository;
exports.fetchGitHead = fetchGitHead;
const child_process_1 = require("child_process");
const util_1 = require("util");
const fs = __importStar(require("fs-extra"));
const path = __importStar(require("path"));
const execAsync = (0, util_1.promisify)(child_process_1.exec);
/**
 * Checks if git is installed and available in PATH
 * @throws Error if git is not installed
 */
async function ensureGitInstalled() {
    try {
        await execAsync('git --version');
    }
    catch {
        throw new Error('Git is not installed or not in PATH. Please install Git: https://git-scm.com/downloads');
    }
}
/**
 * Clones a repository to the specified directory
 * @param targetDir - Target directory for the clone
 * @param repoName - Name of the repository
 * @param gitUrl - Git URL to clone from
 * @returns Path to cloned repository
 * @throws Error if clone fails or times out
 */
async function cloneRepository(targetDir, repoName, gitUrl) {
    const repoPath = path.join(targetDir, repoName);
    if (await fs.pathExists(repoPath)) {
        console.log(`  → ${targetDir}/${repoName} (already exists, skipped)`);
        return repoPath;
    }
    console.log(`  → Cloning ${repoName} (this may take a moment)...`);
    await fs.ensureDir(path.dirname(repoPath));
    try {
        await execAsync(`git clone --depth 1 --single-branch "${gitUrl}" "${repoPath}"`, {
            timeout: 60000,
        });
        console.log('  → Clone complete');
        return repoPath;
    }
    catch (error) {
        throw new Error(`Git clone failed: ${error.message}. Check network and git installation.`);
    }
}
/**
 * Checks if a directory is a git repository
 * @param dirPath - Absolute path to directory
 * @returns true if .git directory exists
 */
async function isGitRepository(dirPath) {
    const gitDir = path.join(dirPath, '.git');
    return await fs.pathExists(gitDir);
}
/**
 * Pulls latest changes for a git repository
 * @param repoPath - Absolute path to git repository
 * @throws Error if git pull fails
 */
async function pullRepository(repoPath) {
    try {
        await execAsync('git pull', {
            cwd: repoPath,
            timeout: 60000,
        });
    }
    catch (error) {
        const message = error.message || 'Unknown error';
        throw new Error(`Git pull failed: ${message}`);
    }
}
/**
 * Fetch the current HEAD SHA for a git repository using git ls-remote
 * @param gitUrl - Git repository URL
 * @returns HEAD SHA hash
 * @throws Error if fetch fails or cannot parse output
 */
async function fetchGitHead(gitUrl) {
    try {
        const { stdout } = await execAsync(`git ls-remote ${gitUrl} HEAD`);
        const match = stdout.trim().match(/^([a-f0-9]+)\s+HEAD$/m);
        if (!match) {
            throw new Error('Could not parse HEAD from ls-remote output');
        }
        return match[1];
    }
    catch (error) {
        throw new Error(`Failed to fetch git HEAD: ${error.message}`);
    }
}
//# sourceMappingURL=git.js.map