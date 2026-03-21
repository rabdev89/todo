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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigManager = void 0;
const fs = __importStar(require("fs-extra"));
const path = __importStar(require("path"));
const package_json_1 = __importDefault(require("../../package.json"));
const CONFIG_FILE_NAME = '.ai-devkit.json';
class ConfigManager {
    configPath;
    constructor(targetDir = process.cwd()) {
        this.configPath = path.join(targetDir, CONFIG_FILE_NAME);
    }
    async exists() {
        return fs.pathExists(this.configPath);
    }
    async read() {
        if (await this.exists()) {
            return fs.readJson(this.configPath);
        }
        return null;
    }
    async create() {
        const config = {
            version: package_json_1.default.version,
            environments: [],
            initializedPhases: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        await fs.writeJson(this.configPath, config, { spaces: 2 });
        return config;
    }
    async update(updates) {
        const config = await this.read();
        if (!config) {
            throw new Error('Config file not found. Run ai-devkit init first.');
        }
        const updated = {
            ...config,
            ...updates,
            updatedAt: new Date().toISOString()
        };
        await fs.writeJson(this.configPath, updated, { spaces: 2 });
        return updated;
    }
    async addPhase(phase) {
        const config = await this.read();
        if (!config) {
            throw new Error('Config file not found. Run ai-devkit init first.');
        }
        if (!config.initializedPhases.includes(phase)) {
            config.initializedPhases.push(phase);
            return this.update({ initializedPhases: config.initializedPhases });
        }
        return config;
    }
    async hasPhase(phase) {
        const config = await this.read();
        return config ? config.initializedPhases.includes(phase) : false;
    }
    async getEnvironments() {
        const config = await this.read();
        return config?.environments || [];
    }
    async setEnvironments(environments) {
        return this.update({ environments });
    }
    async hasEnvironment(envId) {
        const environments = await this.getEnvironments();
        return environments.includes(envId);
    }
}
exports.ConfigManager = ConfigManager;
//# sourceMappingURL=Config.js.map