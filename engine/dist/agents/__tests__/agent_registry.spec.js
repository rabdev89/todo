"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const agent_registry_1 = require("../agent_registry");
describe('Agent Registry - Supercharge Personas', () => {
    it('should have debugger and copywriter registered', () => {
        expect(agent_registry_1.AGENT_REGISTRY.debugger).toBeDefined();
        expect(agent_registry_1.AGENT_REGISTRY.copywriter).toBeDefined();
    });
    it('should return correct config for debugger', () => {
        const config = (0, agent_registry_1.getAgentConfig)('debugger');
        expect(config?.name).toBe('ai-debugger');
        expect(config?.description).toContain('log triage');
        expect(config?.promptFile).toBe('.agent/agents/debugger/system-prompt.md');
    });
    it('should return correct config for copywriter', () => {
        const config = (0, agent_registry_1.getAgentConfig)('copywriter');
        expect(config?.name).toBe('ai-copywriter');
        expect(config?.description).toContain('UI text');
        expect(config?.promptFile).toBe('.agent/agents/copywriter/system-prompt.md');
    });
});
