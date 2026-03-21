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
exports.SkillManager = void 0;
const fs = __importStar(require("fs-extra"));
const path = __importStar(require("path"));
const os = __importStar(require("os"));
const GlobalConfig_1 = require("./GlobalConfig");
const EnvironmentSelector_1 = require("./EnvironmentSelector");
const env_1 = require("../util/env");
const git_1 = require("../util/git");
const skill_1 = require("../util/skill");
const github_1 = require("../util/github");
const terminal_ui_1 = require("../util/terminal-ui");
const REGISTRY_URL = 'https://raw.githubusercontent.com/codeaholicguy/ai-devkit/main/skills/registry.json';
const SEED_INDEX_URL = 'https://raw.githubusercontent.com/codeaholicguy/ai-devkit/main/skills/index.json';
const SKILL_CACHE_DIR = path.join(os.homedir(), '.ai-devkit', 'skills');
const SKILL_INDEX_PATH = path.join(os.homedir(), '.ai-devkit', 'skills.json');
const INDEX_TTL_MS = 24 * 60 * 60 * 1000;
class SkillManager {
    configManager;
    environmentSelector;
    globalConfigManager;
    constructor(configManager, environmentSelector = new EnvironmentSelector_1.EnvironmentSelector(), globalConfigManager = new GlobalConfig_1.GlobalConfigManager()) {
        this.configManager = configManager;
        this.environmentSelector = environmentSelector;
        this.globalConfigManager = globalConfigManager;
    }
    /**
     * Add a skill to the project
     * @param registryId - e.g., "anthropics/skills"
     * @param skillName - e.g., "frontend-design"
     */
    async addSkill(registryId, skillName) {
        terminal_ui_1.ui.info(`Validating skill: ${skillName} from ${registryId}`);
        (0, skill_1.validateRegistryId)(registryId);
        (0, skill_1.validateSkillName)(skillName);
        await (0, git_1.ensureGitInstalled)();
        const spinner = terminal_ui_1.ui.spinner('Fetching registries...');
        spinner.start();
        const registry = await this.fetchMergedRegistry();
        spinner.succeed('Registries fetched');
        const gitUrl = registry.registries[registryId];
        const cachedPath = path.join(SKILL_CACHE_DIR, registryId);
        if (!gitUrl && !await fs.pathExists(cachedPath)) {
            throw new Error(`Registry "${registryId}" not found.`);
        }
        terminal_ui_1.ui.info('Checking local cache...');
        const repoPath = await this.cloneRepositoryToCache(registryId, gitUrl);
        const skillPath = path.join(repoPath, 'skills', skillName);
        if (!await fs.pathExists(skillPath)) {
            throw new Error(`Skill "${skillName}" not found in ${registryId}. Check the repository for available skills.`);
        }
        const skillMdPath = path.join(skillPath, 'SKILL.md');
        if (!await fs.pathExists(skillMdPath)) {
            throw new Error(`Invalid skill: SKILL.md not found in ${skillName}. This may not be a valid Agent Skill.`);
        }
        terminal_ui_1.ui.info('Loading project configuration...');
        let config = await this.configManager.read();
        if (!config) {
            terminal_ui_1.ui.info('No .ai-devkit.json found. Creating configuration...');
            config = await this.configManager.create();
            if (config.environments.length === 0) {
                const selectedEnvs = await this.environmentSelector.selectSkillEnvironments();
                config.environments = selectedEnvs;
                await this.configManager.update({ environments: selectedEnvs });
                terminal_ui_1.ui.success('Configuration saved.');
            }
        }
        const skillCapableEnvs = this.filterSkillCapableEnvironments(config.environments);
        if (skillCapableEnvs.length === 0) {
            throw new Error('No skill-capable environments configured.');
        }
        terminal_ui_1.ui.info('Installing skill to project...');
        const targets = this.getInstallationTargets(skillCapableEnvs);
        for (const targetDir of targets) {
            const targetPath = path.join(process.cwd(), targetDir, skillName);
            if (await fs.pathExists(targetPath)) {
                terminal_ui_1.ui.text(`  → ${targetDir}/${skillName} (already exists, skipped)`);
                continue;
            }
            await fs.ensureDir(path.dirname(targetPath));
            try {
                await fs.symlink(skillPath, targetPath, 'dir');
                terminal_ui_1.ui.text(`  → ${targetDir}/${skillName} (symlinked)`);
            }
            catch (error) {
                await fs.copy(skillPath, targetPath);
                terminal_ui_1.ui.text(`  → ${targetDir}/${skillName} (copied)`);
            }
        }
        terminal_ui_1.ui.text(`Successfully installed: ${skillName}`);
        terminal_ui_1.ui.info(`  Source: ${registryId}`);
        terminal_ui_1.ui.info(`  Installed to: ${skillCapableEnvs.join(', ')}`);
    }
    /**
     * List installed skills in the project
     */
    async listSkills() {
        const skills = [];
        const seenSkills = new Set();
        const config = await this.configManager.read();
        if (!config || config.environments.length === 0) {
            terminal_ui_1.ui.warning('No .ai-devkit.json found or no environments configured.');
            return [];
        }
        const skillCapableEnvs = this.filterSkillCapableEnvironments(config.environments);
        if (skillCapableEnvs.length === 0) {
            terminal_ui_1.ui.warning('No skill-capable environments configured.');
            return [];
        }
        const targets = this.getInstallationTargets(skillCapableEnvs);
        for (const targetDir of targets) {
            const fullPath = path.join(process.cwd(), targetDir);
            if (!await fs.pathExists(fullPath)) {
                continue;
            }
            const entries = await fs.readdir(fullPath, { withFileTypes: true });
            for (const entry of entries) {
                if (entry.isDirectory() || entry.isSymbolicLink()) {
                    const skillName = entry.name;
                    if (!seenSkills.has(skillName)) {
                        seenSkills.add(skillName);
                        const skillPath = path.join(fullPath, skillName);
                        let registry = 'unknown';
                        try {
                            const realPath = await fs.realpath(skillPath);
                            const cacheRelative = path.relative(SKILL_CACHE_DIR, realPath);
                            const parts = cacheRelative.split(path.sep);
                            if (parts.length >= 2) {
                                registry = `${parts[0]}/${parts[1]}`;
                            }
                        }
                        catch {
                            // Ignore errors
                        }
                        skills.push({
                            name: skillName,
                            registry,
                            environments: skillCapableEnvs,
                        });
                    }
                }
            }
        }
        return skills;
    }
    /**
     * Remove a skill from the project
     * @param skillName - Name of the skill to remove
     */
    async removeSkill(skillName) {
        terminal_ui_1.ui.info(`Removing skill: ${skillName}`);
        (0, skill_1.validateSkillName)(skillName);
        const config = await this.configManager.read();
        if (!config || config.environments.length === 0) {
            throw new Error('No .ai-devkit.json found. Run: ai-devkit init');
        }
        const skillCapableEnvs = this.filterSkillCapableEnvironments(config.environments);
        if (skillCapableEnvs.length === 0) {
            throw new Error('No skill-capable environments configured. Supported: cursor, claude');
        }
        const targets = this.getInstallationTargets(skillCapableEnvs);
        let removedCount = 0;
        for (const targetDir of targets) {
            const skillPath = path.join(process.cwd(), targetDir, skillName);
            if (await fs.pathExists(skillPath)) {
                await fs.remove(skillPath);
                terminal_ui_1.ui.text(`  → Removed from ${targetDir}`);
                removedCount++;
            }
        }
        if (removedCount === 0) {
            terminal_ui_1.ui.warning(`Skill "${skillName}" not found. Nothing to remove.`);
            terminal_ui_1.ui.info('Tip: Run "ai-devkit skill list" to see installed skills.');
        }
        else {
            terminal_ui_1.ui.success(`Successfully removed from ${removedCount} location(s).`);
            terminal_ui_1.ui.info(`Note: Cached copy in ~/.ai-devkit/skills/ preserved for other projects.`);
        }
    }
    /**
     * Update skills from registries
     * @param registryId - Optional specific registry to update (e.g., "anthropic/skills")
     * @returns UpdateSummary with detailed results
     */
    async updateSkills(registryId) {
        terminal_ui_1.ui.info(registryId
            ? `Updating registry: ${registryId}...`
            : 'Updating all skills...');
        await (0, git_1.ensureGitInstalled)();
        const cacheDir = SKILL_CACHE_DIR;
        if (!await fs.pathExists(cacheDir)) {
            terminal_ui_1.ui.warning('No skills cache found. Nothing to update.');
            return { total: 0, successful: 0, skipped: 0, failed: 0, results: [] };
        }
        const entries = await fs.readdir(cacheDir, { withFileTypes: true });
        const registries = [];
        for (const entry of entries) {
            if (entry.isDirectory()) {
                const ownerPath = path.join(cacheDir, entry.name);
                const repos = await fs.readdir(ownerPath, { withFileTypes: true });
                for (const repo of repos) {
                    if (repo.isDirectory()) {
                        const fullRegistryId = `${entry.name}/${repo.name}`;
                        if (!registryId || fullRegistryId === registryId) {
                            registries.push({
                                path: path.join(ownerPath, repo.name),
                                id: fullRegistryId,
                            });
                        }
                    }
                }
            }
        }
        if (registryId && registries.length === 0) {
            throw new Error(`Registry "${registryId}" not found in cache.`);
        }
        const results = [];
        for (const registry of registries) {
            const spinner = terminal_ui_1.ui.spinner(`Updating ${registry.id}...`);
            spinner.start();
            const result = await this.updateRegistry(registry.path, registry.id);
            results.push(result);
            if (result.status === 'success') {
                spinner.succeed(`${registry.id} updated`);
            }
            else if (result.status === 'skipped') {
                spinner.warn(`${registry.id} skipped (${result.message})`);
            }
            else {
                spinner.fail(`${registry.id} failed`);
            }
        }
        const summary = {
            total: results.length,
            successful: results.filter(r => r.status === 'success').length,
            skipped: results.filter(r => r.status === 'skipped').length,
            failed: results.filter(r => r.status === 'error').length,
            results,
        };
        this.displayUpdateSummary(summary);
        return summary;
    }
    /**
     * Find skills by keyword across all registries
     * @param keyword - Search keyword to match against skill names and descriptions
     * @param options - Search options including refresh flag
     * @returns Array of matching skill entries
     */
    async findSkills(keyword, options) {
        if (!keyword || keyword.trim().length === 0) {
            throw new Error('Keyword is required');
        }
        const normalizedKeyword = keyword.trim().toLowerCase();
        const index = await this.ensureSkillIndex(options?.refresh);
        return this.searchSkillIndex(index, normalizedKeyword);
    }
    async fetchDefaultRegistry() {
        const response = await fetch(REGISTRY_URL);
        if (!response.ok) {
            throw new Error(`Failed to fetch registry: HTTP ${response.status}`);
        }
        return response.json();
    }
    async fetchMergedRegistry() {
        let defaultRegistries = {};
        try {
            const defaultRegistry = await this.fetchDefaultRegistry();
            defaultRegistries = defaultRegistry.registries || {};
        }
        catch (error) {
            terminal_ui_1.ui.warning(`Failed to fetch default registry: ${error.message}`);
            defaultRegistries = {};
        }
        const customRegistries = await this.globalConfigManager.getSkillRegistries();
        return {
            registries: {
                ...defaultRegistries,
                ...customRegistries
            }
        };
    }
    getInstallationTargets(environments) {
        const targets = [];
        for (const env of environments) {
            const skillPath = (0, env_1.getSkillPath)(env);
            if (skillPath) {
                targets.push(skillPath);
            }
        }
        if (targets.length === 0) {
            throw new Error('No skill-capable environments configured. Supported: cursor, claude');
        }
        return targets;
    }
    async cloneRepositoryToCache(registryId, gitUrl) {
        const repoPath = path.join(SKILL_CACHE_DIR, registryId);
        if (await fs.pathExists(repoPath)) {
            terminal_ui_1.ui.text('  → Using cached repository');
            return repoPath;
        }
        if (!gitUrl) {
            throw new Error(`Registry "${registryId}" is not cached and has no configured URL.`);
        }
        const spinner = terminal_ui_1.ui.spinner(`Cloning ${registryId} (this may take a moment)...`);
        spinner.start();
        await fs.ensureDir(path.dirname(repoPath));
        const result = await (0, git_1.cloneRepository)(SKILL_CACHE_DIR, registryId, gitUrl);
        spinner.succeed(`${registryId} cloned successfully`);
        return result;
    }
    filterSkillCapableEnvironments(environments) {
        return environments.filter(env => {
            const skillPath = (0, env_1.getSkillPath)(env);
            return skillPath !== undefined;
        });
    }
    /**
     * Display update summary with colored output
     * @param summary - UpdateSummary to display
     */
    displayUpdateSummary(summary) {
        const errors = summary.results.filter(r => r.status === 'error');
        terminal_ui_1.ui.summary({
            title: 'Summary',
            items: [
                { type: 'success', count: summary.successful, label: 'updated' },
                { type: 'warning', count: summary.skipped, label: 'skipped' },
                { type: 'error', count: summary.failed, label: 'failed' },
            ],
            details: errors.length > 0 ? {
                title: 'Errors',
                items: errors.map(error => {
                    let tip;
                    if (error.message.includes('uncommitted') || error.message.includes('unstaged')) {
                        tip = `Run 'git status' in ~/.ai-devkit/skills/${error.registryId} to see details.`;
                    }
                    else if (error.message.includes('network') || error.message.includes('timeout')) {
                        tip = 'Check your internet connection and try again.';
                    }
                    return {
                        message: `${error.registryId}: ${error.message}`,
                        tip,
                    };
                }),
            } : undefined,
        });
    }
    /**
     * Update a single registry
     * @param registryPath - Absolute path to registry directory
     * @param registryId - Registry identifier (e.g., "anthropic/skills")
     * @returns UpdateResult with status and message
     */
    async updateRegistry(registryPath, registryId) {
        const isGit = await (0, git_1.isGitRepository)(registryPath);
        if (!isGit) {
            return {
                registryId,
                status: 'skipped',
                message: 'Not a git repository',
            };
        }
        try {
            await (0, git_1.pullRepository)(registryPath);
            return {
                registryId,
                status: 'success',
                message: 'Updated successfully',
            };
        }
        catch (error) {
            return {
                registryId,
                status: 'error',
                message: error.message,
                error,
            };
        }
    }
    /**
     * Ensure skill index is available and fresh
     * @param forceRefresh - Force rebuild regardless of TTL
     * @returns Skill index
     */
    async ensureSkillIndex(forceRefresh = false) {
        const indexExists = await fs.pathExists(SKILL_INDEX_PATH);
        if (indexExists && !forceRefresh) {
            try {
                const index = await fs.readJson(SKILL_INDEX_PATH);
                const age = Date.now() - (index.meta.updatedAt || 0);
                if (age < INDEX_TTL_MS) {
                    return index;
                }
                terminal_ui_1.ui.info(`Index is older than 24h, checking for updates...`);
            }
            catch (error) {
                terminal_ui_1.ui.warning('Failed to read skill index, will rebuild');
            }
        }
        if (!indexExists && !forceRefresh) {
            const spinner = terminal_ui_1.ui.spinner('Fetching seed index...');
            spinner.start();
            try {
                const response = await fetch(SEED_INDEX_URL);
                if (response.ok) {
                    const seedIndex = (await response.json());
                    await fs.ensureDir(path.dirname(SKILL_INDEX_PATH));
                    await fs.writeJson(SKILL_INDEX_PATH, seedIndex, { spaces: 2 });
                    spinner.succeed('Seed index fetched successfully');
                    return seedIndex;
                }
            }
            catch (error) {
                spinner.fail('Failed to fetch seed index, falling back to build');
            }
        }
        const spinner = terminal_ui_1.ui.spinner('Building skill index from registries...');
        spinner.start();
        try {
            const newIndex = await this.buildSkillIndex();
            await fs.ensureDir(path.dirname(SKILL_INDEX_PATH));
            await fs.writeJson(SKILL_INDEX_PATH, newIndex, { spaces: 2 });
            spinner.succeed('Skill index updated');
            return newIndex;
        }
        catch (error) {
            spinner.fail('Failed to build index');
            if (!forceRefresh && await fs.pathExists(SKILL_INDEX_PATH)) {
                terminal_ui_1.ui.warning('Using stale index due to error');
                return await fs.readJson(SKILL_INDEX_PATH);
            }
            throw new Error(`Failed to build skill index: ${error.message}`);
        }
    }
    /**
     * Rebuild skill index and write to specified output path
     * @param outputPath - Optional custom output path (defaults to SKILL_INDEX_PATH)
     */
    async rebuildIndex(outputPath) {
        const targetPath = outputPath || SKILL_INDEX_PATH;
        const spinner = terminal_ui_1.ui.spinner('Rebuilding skill index from all registries...');
        spinner.start();
        try {
            const newIndex = await this.buildSkillIndex();
            await fs.ensureDir(path.dirname(targetPath));
            await fs.writeJson(targetPath, newIndex, { spaces: 2 });
            spinner.succeed(`Skill index rebuilt: ${newIndex.skills.length} skills`);
            terminal_ui_1.ui.info(`Written to: ${targetPath}`);
        }
        catch (error) {
            spinner.fail('Failed to rebuild index');
            throw new Error(`Failed to rebuild skill index: ${error.message}`);
        }
    }
    /**
     * Build skill index from all registries
     * @returns Complete skill index
     */
    async buildSkillIndex() {
        const registry = await this.fetchMergedRegistry();
        const registryIds = Object.keys(registry.registries);
        let existingIndex = null;
        try {
            if (await fs.pathExists(SKILL_INDEX_PATH)) {
                existingIndex = await fs.readJson(SKILL_INDEX_PATH);
            }
        }
        catch { /* ignore */ }
        terminal_ui_1.ui.info(`Building skill index from ${registryIds.length} registries...`);
        const HEAD_CONCURRENCY = 10;
        const headResults = [];
        for (let i = 0; i < registryIds.length; i += HEAD_CONCURRENCY) {
            const batch = registryIds.slice(i, i + HEAD_CONCURRENCY);
            const batchResults = await Promise.allSettled(batch.map(async (registryId) => {
                const gitUrl = registry.registries[registryId];
                const match = gitUrl.match(/github\.com\/([^/]+)\/([^/.]+)/);
                if (!match)
                    return { registryId, error: 'not a GitHub URL' };
                const headSha = await (0, git_1.fetchGitHead)(gitUrl);
                return { registryId, headSha, owner: match[1], repo: match[2] };
            }));
            for (const result of batchResults) {
                if (result.status === 'fulfilled') {
                    headResults.push(result.value);
                }
            }
        }
        const registryHeads = {};
        const registriesToFetch = [];
        const unchangedSkills = [];
        for (const result of headResults) {
            const { registryId, headSha, owner, repo, error } = result;
            if (error || !headSha || !owner || !repo) {
                if (error)
                    terminal_ui_1.ui.warning(`Skipping ${registryId}: ${error}`);
                continue;
            }
            registryHeads[registryId] = headSha;
            const existingHead = existingIndex?.meta?.registryHeads?.[registryId];
            if (existingHead === headSha) {
                const existingSkills = existingIndex?.skills?.filter(s => s.registry === registryId) || [];
                unchangedSkills.push(...existingSkills);
            }
            else {
                registriesToFetch.push({ registryId, owner, repo });
            }
        }
        terminal_ui_1.ui.info(`${registriesToFetch.length} registries need updating, ${unchangedSkills.length} skills cached`);
        const CONCURRENCY = 5;
        const newSkills = [];
        for (let i = 0; i < registriesToFetch.length; i += CONCURRENCY) {
            const batch = registriesToFetch.slice(i, i + CONCURRENCY);
            const batchResults = await Promise.allSettled(batch.map(async ({ registryId, owner, repo }) => {
                const skillPaths = await (0, github_1.fetchGitHubSkillPaths)(owner, repo);
                const skillResults = await Promise.allSettled(skillPaths.map(async (skillPath) => {
                    const content = await (0, github_1.fetchRawGitHubFile)(owner, repo, `${skillPath}/SKILL.md`);
                    const description = (0, skill_1.extractSkillDescription)(content);
                    return {
                        name: path.basename(skillPath),
                        registry: registryId,
                        path: skillPath,
                        description,
                        lastIndexed: Date.now(),
                    };
                }));
                return skillResults
                    .filter((r) => r.status === 'fulfilled')
                    .map(r => r.value);
            }));
            for (const result of batchResults) {
                if (result.status === 'fulfilled') {
                    newSkills.push(...result.value);
                }
            }
        }
        const skills = [...unchangedSkills, ...newSkills];
        const meta = {
            version: 1,
            createdAt: existingIndex?.meta?.createdAt || Date.now(),
            updatedAt: Date.now(),
            registryHeads,
        };
        return { meta, skills };
    }
    /**
     * Search index by keyword
     * @param index - Skill index to search
     * @param keyword - Normalized lowercase keyword
     * @returns Matching skill entries
     */
    searchSkillIndex(index, keyword) {
        return index.skills.filter(skill => {
            const nameMatch = skill.name.toLowerCase().includes(keyword);
            const descMatch = skill.description.toLowerCase().includes(keyword);
            return nameMatch || descMatch;
        });
    }
}
exports.SkillManager = SkillManager;
//# sourceMappingURL=SkillManager.js.map