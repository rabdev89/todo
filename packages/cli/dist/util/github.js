"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchGitHubSkillPaths = fetchGitHubSkillPaths;
exports.fetchRawGitHubFile = fetchRawGitHubFile;
/**
 * Fetch repository tree from GitHub API
 * @param owner - Repository owner
 * @param repo - Repository name
 * @param branch - Branch name (default: 'main')
 * @returns Array of skill paths (e.g., ["skills/frontend-design", "skills/typescript-helper"])
 */
async function fetchGitHubSkillPaths(owner, repo, branch = 'main') {
    const url = `https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`;
    const headers = {
        'User-Agent': 'ai-devkit-cli',
        'Accept': 'application/vnd.github.v3+json',
    };
    if (process.env.GITHUB_TOKEN) {
        headers['Authorization'] = `Bearer ${process.env.GITHUB_TOKEN}`;
    }
    const response = await fetch(url, { headers });
    if (!response.ok) {
        throw new Error(`GitHub API returned ${response.status}: ${response.statusText}`);
    }
    const data = (await response.json());
    const skillPaths = data.tree
        .filter(item => item.path.startsWith('skills/') &&
        item.path.endsWith('/SKILL.md') &&
        item.type === 'blob')
        .map(item => item.path.replace('/SKILL.md', ''));
    return skillPaths;
}
/**
 * Fetch raw file content from GitHub
 * @param owner - Repository owner
 * @param repo - Repository name
 * @param path - File path within repository
 * @param branch - Branch name (default: 'main')
 * @returns File content as string
 */
async function fetchRawGitHubFile(owner, repo, path, branch = 'main') {
    const url = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${path}`;
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to fetch file: ${response.status} ${response.statusText}`);
    }
    return await response.text();
}
//# sourceMappingURL=github.js.map