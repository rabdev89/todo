"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const consolidations_1 = require("../consolidations");
describe('Consolidated medium-priority handlers', () => {
    jest.setTimeout(30000);
    it('consolidatePIHardening returns composed result', async () => {
        const res = await (0, consolidations_1.consolidatePIHardening)({});
        expect(res).toBeDefined();
        expect(typeof res.success).toBe('boolean');
        expect(Array.isArray(res.logs)).toBe(true);
    });
    it('consolidateReleasePreparation returns composed result', async () => {
        const res = await (0, consolidations_1.consolidateReleasePreparation)({});
        expect(res).toBeDefined();
        expect(typeof res.success).toBe('boolean');
        expect(Array.isArray(res.logs)).toBe(true);
    });
    it('consolidateMonitoring returns composed result', async () => {
        const res = await (0, consolidations_1.consolidateMonitoring)({});
        expect(res).toBeDefined();
        expect(typeof res.success).toBe('boolean');
        expect(Array.isArray(res.logs)).toBe(true);
    });
});
