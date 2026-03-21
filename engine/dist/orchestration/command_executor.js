"use strict";
/**
 * Command Executor
 *
 * Safely executes commands in sandboxed environment with timeout and error handling.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommandExecutor = void 0;
const child_process_1 = require("child_process");
const path_1 = __importDefault(require("path"));
const util_1 = require("util");
const execAsync = (0, util_1.promisify)(child_process_1.exec);
class CommandExecutor {
    static DEFAULT_TIMEOUT = 30000; // 30 seconds
    static ROOT_DIR = path_1.default.resolve(__dirname, '../../../..');
    /**
     * Execute a single command
     */
    static async executeCommand(command, options = {}) {
        const startTime = Date.now();
        const cwd = options.cwd || this.ROOT_DIR;
        const timeout = options.timeout || this.DEFAULT_TIMEOUT;
        console.log(`🔧 Executing: ${command}`);
        console.log(`📁 CWD: ${cwd}`);
        try {
            // Use exec for simple commands, spawn for complex ones
            if (command.includes('&&') || command.includes('||') || command.includes('|')) {
                return await this.executeWithSpawn(command, { ...options, cwd, timeout });
            }
            else {
                return await this.executeWithExec(command, { ...options, cwd, timeout });
            }
        }
        catch (error) {
            const duration = Date.now() - startTime;
            console.error(`❌ Command failed: ${error.message}`);
            return {
                success: false,
                stdout: '',
                stderr: error.message || 'Unknown error',
                exitCode: error.code || 1,
                duration,
                command
            };
        }
    }
    /**
     * Execute using child_process.exec (for simple commands)
     */
    static async executeWithExec(command, options) {
        const startTime = Date.now();
        try {
            const result = await execAsync(command, {
                cwd: options.cwd,
                timeout: options.timeout,
                env: { ...process.env, ...options.env },
                maxBuffer: 1024 * 1024 * 10
            });
            const duration = Date.now() - startTime;
            return {
                success: true,
                stdout: result.stdout,
                stderr: result.stderr,
                exitCode: 0,
                duration,
                command
            };
        }
        catch (error) {
            const duration = Date.now() - startTime;
            throw {
                code: error.code,
                message: error.message,
                stdout: error.stdout || '',
                stderr: error.stderr || ''
            };
        }
    }
    /**
     * Execute using child_process.spawn (for complex commands)
     */
    static async executeWithSpawn(command, options) {
        return new Promise((resolve) => {
            const startTime = Date.now();
            const child = (0, child_process_1.spawn)(command, [], {
                cwd: options.cwd,
                env: { ...process.env, ...options.env },
                shell: true,
                stdio: ['pipe', 'pipe', 'pipe']
            });
            let stdout = '';
            let stderr = '';
            // Set timeout
            const timer = setTimeout(() => {
                child.kill('SIGTERM');
                const duration = Date.now() - startTime;
                resolve({
                    success: false,
                    stdout,
                    stderr: stderr + '\nCommand timed out',
                    exitCode: -1,
                    duration,
                    command
                });
            }, options.timeout);
            child.stdout?.on('data', (data) => {
                stdout += data.toString();
            });
            child.stderr?.on('data', (data) => {
                stderr += data.toString();
            });
            child.on('close', (code) => {
                clearTimeout(timer);
                const duration = Date.now() - startTime;
                resolve({
                    success: code === 0,
                    stdout,
                    stderr,
                    exitCode: code || 0,
                    duration,
                    command
                });
            });
            child.on('error', (error) => {
                clearTimeout(timer);
                const duration = Date.now() - startTime;
                resolve({
                    success: false,
                    stdout,
                    stderr: error.message,
                    exitCode: 1,
                    duration,
                    command
                });
            });
        });
    }
    /**
     * Execute multiple commands sequentially
     */
    static async executeCommands(commands, options = {}) {
        const results = [];
        for (const command of commands) {
            const result = await this.executeCommand(command, options);
            results.push(result);
            // Stop on first failure unless specified otherwise
            if (!result.success) {
                break;
            }
        }
        return results;
    }
    /**
     * Check if a command exists
     */
    static async commandExists(command) {
        try {
            const result = await this.executeCommand(`which ${command}`, { timeout: 5000 });
            return result.success;
        }
        catch {
            return false;
        }
    }
}
exports.CommandExecutor = CommandExecutor;
