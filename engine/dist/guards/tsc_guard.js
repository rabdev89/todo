"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TscGuard = void 0;
const child_process_1 = require("child_process");
const config_1 = require("../shared/config");
const config = config_1.BobConfig.getInstance();
class TscGuard {
    name = 'TypeScript Check';
    description = 'Validates that TypeScript compiles cleanly (tsc --noEmit)';
    async run(ticketId) {
        return new Promise((resolve) => {
            const child = (0, child_process_1.spawn)('npx', ['tsc', '--noEmit'], {
                cwd: config.getRootDir(),
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
                    output: passed ? '✓ TypeScript compiles cleanly' : `✗ TypeScript errors detected:\n${output}`
                });
            });
            child.on('error', (err) => {
                resolve({
                    passed: false,
                    score: 0,
                    maxScore: 3,
                    output: `✗ Failed to run tsc: ${err.message}`
                });
            });
        });
    }
}
exports.TscGuard = TscGuard;
