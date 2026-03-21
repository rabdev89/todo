export interface GitHubTreeItem {
    path: string;
    type: 'blob' | 'tree';
    sha: string;
}
export interface GitHubTreeResponse {
    tree: GitHubTreeItem[];
    truncated: boolean;
}
/**
 * Fetch repository tree from GitHub API
 * @param owner - Repository owner
 * @param repo - Repository name
 * @param branch - Branch name (default: 'main')
 * @returns Array of skill paths (e.g., ["skills/frontend-design", "skills/typescript-helper"])
 */
export declare function fetchGitHubSkillPaths(owner: string, repo: string, branch?: string): Promise<string[]>;
/**
 * Fetch raw file content from GitHub
 * @param owner - Repository owner
 * @param repo - Repository name
 * @param path - File path within repository
 * @param branch - Branch name (default: 'main')
 * @returns File content as string
 */
export declare function fetchRawGitHubFile(owner: string, repo: string, path: string, branch?: string): Promise<string>;
