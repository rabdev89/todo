import { validateFrameworkSetup, initializeServices } from '../framework';
import * as fs from 'fs';
import * as path from 'path';

describe('Framework consolidated handlers', () => {
  jest.setTimeout(30000);

  it('validateFrameworkSetup runs and returns an ActionResult', async () => {
    const res = await validateFrameworkSetup({} as any);
    expect(res).toBeDefined();
    expect(typeof res.success).toBe('boolean');
  });

  it('initializeServices runs and returns an ActionResult', async () => {
    const res = await initializeServices({} as any);
    expect(res).toBeDefined();
    expect(typeof res.success).toBe('boolean');
  });

  it('phases_definition.json contains consolidated framework_install step', () => {
    const filePath = path.resolve(__dirname, '..', '..', '..', '..', '..', 'framework', 'phases_definition.json');
    const raw = fs.readFileSync(filePath, 'utf8');
    const def = JSON.parse(raw);
    const phase = def.phases.find((p: any) => p.id === 'framework_installation');
    expect(phase).toBeDefined();
    expect(Array.isArray(phase.steps)).toBe(true);
    expect(phase.steps.length).toBe(1);
    const step = phase.steps[0];
    expect(step.id).toBe('framework_install');
    expect(step.required_action).toBe('initialize_services');
  });
});
