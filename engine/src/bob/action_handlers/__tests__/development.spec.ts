import { ActionHandlers } from '../index';
import { DependencyEngine } from '../../../dependency_engine';

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
    const context: any = {};
    const result = await ActionHandlers.trigger_swarm(context);
    
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
    const engine = DependencyEngine.getInstance();
    (engine.getReadyTickets as jest.Mock).mockResolvedValueOnce([]);

    const context: any = {};
    const result = await ActionHandlers.trigger_swarm(context);
    
    expect(result.success).toBe(true);
    expect(result.data?.active_swarms).toBe(0);
    expect(result.logs).toContain('No tickets are ready for swarming.');
  });
});
