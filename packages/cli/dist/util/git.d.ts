/**
 * Checks if git is installed and available in PATH
 * @throws Error if git is not installed
 */
export declare function ensureGitInstalled(): Promise<void>;
/**
 * Clones a repository to the specified directory
 * @param targetDir - Target directory for the clone
 * @param repoName - Name of the repository
 * @param gitUrl - Git URL to clone from
 * @returns Path to cloned repository
 * @throws Error if clone fails or times out
 */
export declare function cloneRepository(targetDir: string, repoName: string, gitUrl: string): Promise<string>;
/**
 * Checks if a directory is a git repository
 * @param dirPath - Absolute path to directory
 * @returns true if .git directory exists
 */
export declare function isGitRepository(dirPath: string): Promise<boolean>;
/**
 * Pulls latest changes for a git repository
 * @param repoPath - Absolute path to git repository
 * @throws Error if git pull fails
 */
export declare function pullRepository(repoPath: string): Promise<void>;
/**
 * Fetch the current HEAD SHA for a git repository using git ls-remote
 * @param gitUrl - Git repository URL
 * @returns HEAD SHA hash
 * @throws Error if fetch fails or cannot parse output
 */
export declare function fetchGitHead(gitUrl: string): Promise<string>;
