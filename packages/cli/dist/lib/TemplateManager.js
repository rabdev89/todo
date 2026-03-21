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
exports.TemplateManager = void 0;
const fs = __importStar(require("fs-extra"));
const path = __importStar(require("path"));
const os = __importStar(require("os"));
const gray_matter_1 = __importDefault(require("gray-matter"));
const env_1 = require("../util/env");
class TemplateManager {
    templatesDir;
    targetDir;
    constructor(targetDir = process.cwd()) {
        this.templatesDir = path.join(__dirname, "../../templates");
        this.targetDir = targetDir;
    }
    async copyPhaseTemplate(phase) {
        const sourceFile = path.join(this.templatesDir, "phases", `${phase}.md`);
        const targetDir = path.join(this.targetDir, "docs", "ai", phase);
        const targetFile = path.join(targetDir, "README.md");
        await fs.ensureDir(targetDir);
        await fs.copy(sourceFile, targetFile);
        return targetFile;
    }
    async fileExists(phase) {
        const targetFile = path.join(this.targetDir, "docs", "ai", phase, "README.md");
        return fs.pathExists(targetFile);
    }
    async setupMultipleEnvironments(environmentIds) {
        const copiedFiles = [];
        for (const envId of environmentIds) {
            const env = (0, env_1.getEnvironment)(envId);
            if (!env) {
                console.warn(`Warning: Environment '${envId}' not found, skipping`);
                continue;
            }
            try {
                const envFiles = await this.setupSingleEnvironment(env);
                copiedFiles.push(...envFiles);
            }
            catch (error) {
                console.error(`Error setting up environment '${env.name}':`, error);
                throw error; // Re-throw to stop the entire process on failure
            }
        }
        return copiedFiles;
    }
    async checkEnvironmentExists(envId) {
        const env = (0, env_1.getEnvironment)(envId);
        if (!env) {
            return false;
        }
        const contextFilePath = path.join(this.targetDir, env.contextFileName);
        const contextFileExists = await fs.pathExists(contextFilePath);
        const commandDirPath = path.join(this.targetDir, env.commandPath);
        const commandDirExists = await fs.pathExists(commandDirPath);
        return contextFileExists || commandDirExists;
    }
    async setupSingleEnvironment(env) {
        const copiedFiles = [];
        try {
            const contextSource = path.join(this.templatesDir, "env", "base.md");
            const contextTarget = path.join(this.targetDir, env.contextFileName);
            if (await fs.pathExists(contextSource)) {
                await fs.copy(contextSource, contextTarget);
                copiedFiles.push(contextTarget);
            }
            else {
                console.warn(`Warning: Context file not found: ${contextSource}`);
            }
            if (!env.isCustomCommandPath) {
                await this.copyCommands(env, copiedFiles);
            }
            switch (env.code) {
                case "cursor":
                    await this.copyCursorSpecificFiles(copiedFiles);
                    break;
                case "gemini":
                    await this.copyGeminiSpecificFiles(copiedFiles);
                    break;
                default:
                    break;
            }
        }
        catch (error) {
            console.error(`Error setting up environment ${env.name}:`, error);
            throw error;
        }
        return copiedFiles;
    }
    async copyCommands(env, copiedFiles) {
        const commandsSourceDir = path.join(this.templatesDir, "commands");
        const commandExtension = env.customCommandExtension || ".md";
        const commandsTargetDir = path.join(this.targetDir, env.commandPath);
        if (await fs.pathExists(commandsSourceDir)) {
            await fs.ensureDir(commandsTargetDir);
            const commandFiles = await fs.readdir(commandsSourceDir);
            await Promise.all(commandFiles
                .filter((file) => file.endsWith(".md"))
                .map(async (file) => {
                const targetFile = file.replace('.md', commandExtension);
                await fs.copy(path.join(commandsSourceDir, file), path.join(commandsTargetDir, targetFile));
                copiedFiles.push(path.join(commandsTargetDir, targetFile));
            }));
        }
        else {
            console.warn(`Warning: Commands directory not found: ${commandsSourceDir}`);
        }
    }
    async copyCursorSpecificFiles(copiedFiles) {
        const rulesSourceDir = path.join(this.templatesDir, "env", "cursor", "rules");
        const rulesTargetDir = path.join(this.targetDir, ".cursor", "rules");
        if (await fs.pathExists(rulesSourceDir)) {
            await fs.ensureDir(rulesTargetDir);
            await fs.copy(rulesSourceDir, rulesTargetDir);
            const ruleFiles = await fs.readdir(rulesSourceDir);
            ruleFiles.forEach((file) => {
                copiedFiles.push(path.join(rulesTargetDir, file));
            });
        }
    }
    async copyGeminiSpecificFiles(copiedFiles) {
        const commandFiles = await fs.readdir(path.join(this.templatesDir, "commands"));
        const commandTargetDir = path.join(this.targetDir, ".gemini", "commands");
        await fs.ensureDir(commandTargetDir);
        await Promise.all(commandFiles
            .filter((file) => file.endsWith(".md"))
            .map(async (file) => {
            const mdContent = await fs.readFile(path.join(this.templatesDir, "commands", file), "utf-8");
            const { data, content } = (0, gray_matter_1.default)(mdContent);
            const description = data.description || "";
            const tomlContent = this.generateTomlContent(description, content.trim());
            const tomlFile = file.replace(".md", ".toml");
            await fs.writeFile(path.join(commandTargetDir, tomlFile), tomlContent);
            copiedFiles.push(path.join(commandTargetDir, tomlFile));
        }));
    }
    /**
     * Generate TOML content for Gemini commands.
     * Uses triple quotes for multi-line strings.
     */
    generateTomlContent(description, prompt) {
        // Escape any triple quotes in the content
        const escapedDescription = description.replace(/'''/g, "'''");
        const escapedPrompt = prompt.replace(/'''/g, "'''");
        return `description='''${escapedDescription}'''
prompt='''${escapedPrompt}'''
`;
    }
    /**
     * Copy command templates to the global folder for a specific environment.
     * Global folders are located in the user's home directory.
     */
    async copyCommandsToGlobal(envCode) {
        const env = (0, env_1.getEnvironment)(envCode);
        if (!env || !env.globalCommandPath) {
            throw new Error(`Environment '${envCode}' does not support global setup`);
        }
        const copiedFiles = [];
        const homeDir = os.homedir();
        const globalTargetDir = path.join(homeDir, env.globalCommandPath);
        const commandsSourceDir = path.join(this.templatesDir, "commands");
        try {
            await fs.ensureDir(globalTargetDir);
            const commandFiles = await fs.readdir(commandsSourceDir);
            for (const file of commandFiles) {
                if (!file.endsWith(".md"))
                    continue;
                const sourceFile = path.join(commandsSourceDir, file);
                const targetFile = path.join(globalTargetDir, file);
                await fs.copy(sourceFile, targetFile);
                copiedFiles.push(targetFile);
            }
        }
        catch (error) {
            if (error instanceof Error) {
                throw new Error(`Failed to copy commands to global folder: ${error.message}`);
            }
            throw error;
        }
        return copiedFiles;
    }
    /**
     * Check if any global commands already exist for a specific environment.
     */
    async checkGlobalCommandsExist(envCode) {
        const env = (0, env_1.getEnvironment)(envCode);
        if (!env || !env.globalCommandPath) {
            return false;
        }
        const homeDir = os.homedir();
        const globalTargetDir = path.join(homeDir, env.globalCommandPath);
        if (!(await fs.pathExists(globalTargetDir))) {
            return false;
        }
        const files = await fs.readdir(globalTargetDir);
        return files.some((file) => file.endsWith(".md"));
    }
}
exports.TemplateManager = TemplateManager;
//# sourceMappingURL=TemplateManager.js.map