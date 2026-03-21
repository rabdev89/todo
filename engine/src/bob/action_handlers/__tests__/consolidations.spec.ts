import {
  consolidatePIHardening,
  consolidateReleasePreparation,
  consolidateMonitoring
} from '../consolidations';

describe('Consolidated medium-priority handlers', () => {
  jest.setTimeout(30000);

  it('consolidatePIHardening returns composed result', async () => {
    const res = await consolidatePIHardening({} as any);
    expect(res).toBeDefined();
    expect(typeof res.success).toBe('boolean');
    expect(Array.isArray(res.logs)).toBe(true);
  });

  it('consolidateReleasePreparation returns composed result', async () => {
    const res = await consolidateReleasePreparation({} as any);
    expect(res).toBeDefined();
    expect(typeof res.success).toBe('boolean');
    expect(Array.isArray(res.logs)).toBe(true);
  });

  it('consolidateMonitoring returns composed result', async () => {
    const res = await consolidateMonitoring({} as any);
    expect(res).toBeDefined();
    expect(typeof res.success).toBe('boolean');
    expect(Array.isArray(res.logs)).toBe(true);
  });
});
