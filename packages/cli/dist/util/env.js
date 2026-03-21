"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ALL_ENVIRONMENT_CODES = exports.ENVIRONMENT_DEFINITIONS = void 0;
exports.getAllEnvironments = getAllEnvironments;
exports.getEnvironment = getEnvironment;
exports.getAllEnvironmentCodes = getAllEnvironmentCodes;
exports.getEnvironmentsByCodes = getEnvironmentsByCodes;
exports.isValidEnvironmentCode = isValidEnvironmentCode;
exports.getEnvironmentDisplayName = getEnvironmentDisplayName;
exports.validateEnvironmentCodes = validateEnvironmentCodes;
exports.getGlobalCapableEnvironments = getGlobalCapableEnvironments;
exports.hasGlobalSupport = hasGlobalSupport;
exports.getSkillPath = getSkillPath;
exports.getSkillCapableEnvironments = getSkillCapableEnvironments;
exports.ENVIRONMENT_DEFINITIONS = {
    cursor: {
        code: 'cursor',
        name: 'Cursor',
        contextFileName: 'AGENTS.md',
        commandPath: '.cursor/commands',
        skillPath: '.cursor/skills',
    },
    claude: {
        code: 'claude',
        name: 'Claude Code',
        contextFileName: 'CLAUDE.md',
        commandPath: '.claude/commands',
        skillPath: '.claude/skills',
    },
    github: {
        code: 'github',
        name: 'GitHub Copilot',
        contextFileName: 'AGENTS.md',
        commandPath: '.github/prompts',
        customCommandExtension: '.prompt.md',
    },
    gemini: {
        code: 'gemini',
        name: 'Google Gemini',
        contextFileName: 'GEMINI.md',
        commandPath: '.gemini/commands',
        isCustomCommandPath: true,
    },
    codex: {
        code: 'codex',
        name: 'OpenAI Codex',
        contextFileName: 'AGENTS.md',
        commandPath: '.codex/commands',
        globalCommandPath: '.codex/prompts',
        skillPath: '.codex/skills',
    },
    windsurf: {
        code: 'windsurf',
        name: 'Windsurf',
        contextFileName: 'AGENTS.md',
        commandPath: '.windsurf/commands',
    },
    kilocode: {
        code: 'kilocode',
        name: 'KiloCode',
        contextFileName: 'AGENTS.md',
        commandPath: '.kilocode/commands',
    },
    amp: {
        code: 'amp',
        name: 'AMP',
        contextFileName: 'AGENTS.md',
        commandPath: '.agents/commands',
    },
    opencode: {
        code: 'opencode',
        name: 'OpenCode',
        contextFileName: 'AGENTS.md',
        commandPath: '.opencode/commands',
        skillPath: '.opencode/skills',
    },
    roo: {
        code: 'roo',
        name: 'Roo Code',
        contextFileName: 'AGENTS.md',
        commandPath: '.roo/commands',
    },
    antigravity: {
        code: 'antigravity',
        name: 'Antigravity',
        contextFileName: 'AGENTS.md',
        commandPath: '.agent/workflows',
        globalCommandPath: '.gemini/antigravity/global_workflows',
        skillPath: '.agent/skills',
    }
};
exports.ALL_ENVIRONMENT_CODES = Object.keys(exports.ENVIRONMENT_DEFINITIONS);
function getAllEnvironments() {
    return Object.values(exports.ENVIRONMENT_DEFINITIONS);
}
function getEnvironment(envCode) {
    return exports.ENVIRONMENT_DEFINITIONS[envCode];
}
function getAllEnvironmentCodes() {
    return [...exports.ALL_ENVIRONMENT_CODES];
}
function getEnvironmentsByCodes(codes) {
    return codes.map(code => getEnvironment(code)).filter((env) => env !== undefined);
}
function isValidEnvironmentCode(value) {
    return exports.ALL_ENVIRONMENT_CODES.includes(value);
}
function getEnvironmentDisplayName(envCode) {
    const env = getEnvironment(envCode);
    return env ? env.name : envCode;
}
function validateEnvironmentCodes(envCodes) {
    const validCodes = [];
    const invalidCodes = [];
    for (const code of envCodes) {
        if (isValidEnvironmentCode(code)) {
            validCodes.push(code);
        }
        else {
            invalidCodes.push(code);
        }
    }
    if (invalidCodes.length > 0) {
        throw new Error(`Invalid environment codes: ${invalidCodes.join(', ')}`);
    }
    return validCodes;
}
function getGlobalCapableEnvironments() {
    return getAllEnvironments().filter(env => env.globalCommandPath !== undefined);
}
function hasGlobalSupport(envCode) {
    const env = getEnvironment(envCode);
    return env !== undefined && env.globalCommandPath !== undefined;
}
function getSkillPath(envCode) {
    const env = getEnvironment(envCode);
    return env?.skillPath;
}
function getSkillCapableEnvironments() {
    return getAllEnvironments().filter(env => env.skillPath !== undefined);
}
//# sourceMappingURL=env.js.map