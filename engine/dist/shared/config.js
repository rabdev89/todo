"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BobConfig = void 0;
const path_1 = __importDefault(require("path"));
const fs_extra_1 = __importDefault(require("fs-extra"));
class BobConfig {
    static instance;
    config;
    rootDir;
    constructor() {
        this.rootDir = ''; // Initialize
        // Dynamic root discovery: Walk up from __dirname until we find bob.config.json
        let current = __dirname;
        let found = false;
        while (current !== path_1.default.dirname(current)) {
            if (fs_extra_1.default.existsSync(path_1.default.join(current, 'bob.config.json'))) {
                this.rootDir = current;
                found = true;
                break;
            }
            current = path_1.default.dirname(current);
        }
        // Fallback to old behavior if not found (standard repo structure)
        if (!found) {
            this.rootDir = path_1.default.resolve(__dirname, '../../..');
        }
        const configPath = path_1.default.join(this.rootDir, 'bob.config.json');
        if (fs_extra_1.default.existsSync(configPath)) {
            this.config = fs_extra_1.default.readJsonSync(configPath);
        }
        else {
            // Default fallback for backward compatibility
            this.config = {
                directories: {
                    project_management: 'web-applications/project-management',
                    epics: 'web-applications/project-management/epics',
                    dashboard: 'web-applications/bob',
                    framework: 'framework',
                    web_apps: 'web-applications'
                },
                patterns: {
                    metadata_filename: 'metadata.json',
                    default_branch: 'main',
                    ticket_id_prefix: 'T-'
                }
            };
        }
    }
    static getInstance() {
        if (!BobConfig.instance) {
            BobConfig.instance = new BobConfig();
        }
        return BobConfig.instance;
    }
    /**
     * Resolve a logical directory key to an absolute path
     */
    getDirectory(key) {
        const dir = this.config.directories[key] || '';
        return dir;
    }
    /**
     * Get a pattern value
     */
    getPattern(key) {
        return this.config.patterns[key] || '';
    }
    /**
     * Get the root directory of the workspace
     */
    getRootDir() {
        return this.rootDir;
    }
}
exports.BobConfig = BobConfig;
