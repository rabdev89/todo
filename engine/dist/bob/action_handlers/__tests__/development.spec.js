"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../index");
const dependency_engine_1 = require("../../../dependency_engine");
// Mock DependencyEngine
jest.mock('../../../dependency_engine', () => ({
    DependencyEngine: {
        getInstance: jest.fn().mockReturnValue({
            buildGraph: jest.fn().mockResolvedValue(undefined),
            getReadyTickets: jest.fn().mockResolvedValue(['T-101', 'T-102'])
        })
    }
}));
describe('Development Action Handlers - Supercharge Logic', () => {
    it('should execute trigger_swarm and return swarm data', async () => {
        const context = {};
        const result = await index_1.ActionHandlers.trigger_swarm(context);
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data).toBeDefined();
            expect(result.data?.active_swarms).toBe(2);
            expect(result.data?.tickets).toContain('T-101');
            expect(result.logs).toContain('🚀 Spawning session for T-101...');
            expect(result.logs).toContain('🚀 Spawning session for T-102...');
        }
    });
    it('should handle no ready tickets in trigger_swarm', async () => {
        const engine = dependency_engine_1.DependencyEngine.getInstance();
        engine.getReadyTickets.mockResolvedValueOnce([]);
        const context = {};
        const result = await index_1.ActionHandlers.trigger_swarm(context);
        expect(result.success).toBe(true);
        expect(result.data?.active_swarms).toBe(0);
        expect(result.logs).toContain('No tickets are ready for swarming.');
    });
});
