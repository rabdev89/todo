"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.consolidateMonitoring = exports.consolidateReleasePreparation = exports.consolidatePIHardening = void 0;
const development_1 = require("./development");
function mergeLogs(results) {
    return results.flatMap(r => (r.logs || []).map(String));
}
const consolidatePIHardening = async (ctx) => {
    const results = [];
    results.push(await (0, development_1.runSystemTests)(ctx));
    results.push(await (0, development_1.runPerformanceTests)(ctx));
    results.push(await (0, development_1.runSecurityAudit)(ctx));
    results.push(await (0, development_1.buildReleaseCandidate)(ctx));
    const success = results.every(r => r.success === true);
    return {
        success,
        data: { steps: results.map(r => r.data) },
        logs: mergeLogs(results)
    };
};
exports.consolidatePIHardening = consolidatePIHardening;
const consolidateReleasePreparation = async (ctx) => {
    const results = [];
    results.push(await (0, development_1.generateReleaseNotes)(ctx));
    results.push(await (0, development_1.generateDeploymentScripts)(ctx));
    results.push(await (0, development_1.generateRollbackPlan)(ctx));
    results.push(await (0, development_1.generateDeploymentChecklist)(ctx));
    const success = results.every(r => r.success === true);
    return {
        success,
        data: { steps: results.map(r => r.data) },
        logs: mergeLogs(results)
    };
};
exports.consolidateReleasePreparation = consolidateReleasePreparation;
const consolidateMonitoring = async (ctx) => {
    const results = [];
    results.push(await (0, development_1.setupMonitoring)(ctx));
    results.push(await (0, development_1.setupErrorTracking)(ctx));
    results.push(await (0, development_1.monitorPerformance)(ctx));
    const success = results.every(r => r.success === true);
    return {
        success,
        data: { steps: results.map(r => r.data) },
        logs: mergeLogs(results)
    };
};
exports.consolidateMonitoring = consolidateMonitoring;
exports.default = {};
