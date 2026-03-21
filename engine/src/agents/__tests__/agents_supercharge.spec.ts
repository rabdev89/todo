import { ExecutorAgent } from '../executor_agent';
import { VerifierAgent } from '../verifier_agent';
import { StateManager } from '../../state_manager';
import fs from 'fs-extra';
import path from 'path';

// Mock StateManager
jest.mock('../../state_manager', () => ({
  StateManager: {
    getTicketPath: jest.fn().mockResolvedValue('/tmp/tickets/T-001/metadata.json')
  }
}));

// Mock fs-extra
jest.mock('fs-extra', () => ({
  ensureDir: jest.fn().mockResolvedValue(true),
  pathExists: jest.fn().mockResolvedValue(true),
  readFile: jest.fn().mockResolvedValue('# Mock Blueprint'),
  writeFile: jest.fn().mockResolvedValue(true)
}));

describe('Agents - Supercharge Flags', () => {
  let consoleSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleSpy = jest.spyOn(console, 'log').mockImplementation();
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  it('ExecutorAgent should log parallel mode message when flag is set', async () => {
    const agent = new ExecutorAgent();
    await agent.executeTicket('T-001', { parallel: true });
    
    expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[Parallel Mode] Waiting for Contract')
    );
  });

  it('VerifierAgent should log contract generation message when contractOnly is set', async () => {
    const agent = new VerifierAgent();
    await agent.verifyTicket('T-001', { contractOnly: true });
    
    expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('🧪 Verifier generating CONTRACT')
    );
  });
});
