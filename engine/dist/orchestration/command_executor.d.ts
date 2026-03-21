/**
 * Command Executor
 *
 * Safely executes commands in sandboxed environment with timeout and error handling.
 */
export interface CommandResult {
    success: boolean;
    stdout: string;
    stderr: string;
    exitCode: number;
    duration: number;
    command: string;
}
export interface CommandOptions {
    cwd?: string;
    timeout?: number;
    env?: Record<string, string>;
    shell?: boolean;
}
export declare class CommandExecutor {
    private static readonly DEFAULT_TIMEOUT;
    private static readonly ROOT_DIR;
    /**
     * Execute a single command
     */
    static executeCommand(command: string, options?: CommandOptions): Promise<CommandResult>;
    /**
     * Execute using child_process.exec (for simple commands)
     */
    private static executeWithExec;
    /**
     * Execute using child_process.spawn (for complex commands)
     */
    private static executeWithSpawn;
    /**
     * Execute multiple commands sequentially
     */
    static executeCommands(commands: string[], options?: CommandOptions): Promise<CommandResult[]>;
    /**
     * Check if a command exists
     */
    static commandExists(command: string): Promise<boolean>;
}
//# sourceMappingURL=command_executor.d.ts.map