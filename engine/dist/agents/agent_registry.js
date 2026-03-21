"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AGENT_REGISTRY = void 0;
exports.getAgentConfig = getAgentConfig;
exports.getAllAgents = getAllAgents;
exports.AGENT_REGISTRY = {
    researcher: {
        name: 'ai-researcher',
        description: 'Discovers patterns and maps codebase',
        promptFile: '.agent/agents/researcher/system-prompt.md',
        inputFiles: ['metadata.json', 'PRD.md'],
        outputFile: 'RESEARCH.md'
    },
    planner: {
        name: 'ai-planner',
        description: 'Creates implementation BLUEPRINT',
        promptFile: '.agent/agents/planner/system-prompt.md',
        inputFiles: ['metadata.json', 'PRD.md', 'RESEARCH.md'],
        outputFile: 'BLUEPRINT.md'
    },
    executor: {
        name: 'ai-executor',
        description: 'Implements code following plan',
        promptFile: '.agent/agents/executor/system-prompt.md',
        inputFiles: ['metadata.json', 'PRD.md', 'BLUEPRINT.md'],
        outputFile: 'RECORD.md'
    },
    verifier: {
        name: 'ai-verifier',
        description: 'Validates independently',
        promptFile: '.agent/agents/verifier/system-prompt.md',
        inputFiles: ['metadata.json', 'PRD.md', 'BLUEPRINT.md', 'RECORD.md'],
        outputFile: 'VERIFICATION.md'
    },
    designer: {
        name: 'ai-designer',
        description: 'Generates UI/UX design specifications',
        promptFile: '.agent/agents/designer/system-prompt.md',
        inputFiles: ['metadata.json', 'PRD.md', 'RESEARCH.md'],
        outputFile: 'design/DESIGN.md'
    },
    debugger: {
        name: 'ai-debugger',
        description: 'Expert log triage and root-cause analysis',
        promptFile: '.agent/agents/debugger/system-prompt.md',
        inputFiles: ['metadata.json', 'ERROR.log'],
        outputFile: 'DEBUG_REPORT.md'
    },
    copywriter: {
        name: 'ai-copywriter',
        description: 'High-converting UI text and marketing copy',
        promptFile: '.agent/agents/copywriter/system-prompt.md',
        inputFiles: ['metadata.json', 'PRD.md', 'BLUEPRINT.md'],
        outputFile: 'CONTENT_SPEC.md'
    }
};
function getAgentConfig(name) {
    return exports.AGENT_REGISTRY[name];
}
function getAllAgents() {
    return Object.values(exports.AGENT_REGISTRY);
}
