import type { ActionHandler, ActionResult } from '../types';
import {
  runSystemTests,
  runPerformanceTests,
  runSecurityAudit,
  buildReleaseCandidate,
  generateReleaseNotes,
  generateDeploymentScripts,
  generateRollbackPlan,
  generateDeploymentChecklist,
  setupMonitoring,
  setupErrorTracking,
  monitorPerformance
} from './development';

function mergeLogs(results: ActionResult[]) {
  return results.flatMap(r => (r.logs || []).map(String));
}

export const consolidatePIHardening: ActionHandler = async (ctx) => {
  const results = [] as ActionResult[];
  results.push(await runSystemTests(ctx));
  results.push(await runPerformanceTests(ctx));
  results.push(await runSecurityAudit(ctx));
  results.push(await buildReleaseCandidate(ctx));

  const success = results.every(r => r.success === true);
  return {
    success,
    data: { steps: results.map(r => r.data) },
    logs: mergeLogs(results)
  };
};

export const consolidateReleasePreparation: ActionHandler = async (ctx) => {
  const results = [] as ActionResult[];
  results.push(await generateReleaseNotes(ctx));
  results.push(await generateDeploymentScripts(ctx));
  results.push(await generateRollbackPlan(ctx));
  results.push(await generateDeploymentChecklist(ctx));

  const success = results.every(r => r.success === true);
  return {
    success,
    data: { steps: results.map(r => r.data) },
    logs: mergeLogs(results)
  };
};

export const consolidateMonitoring: ActionHandler = async (ctx) => {
  const results = [] as ActionResult[];
  results.push(await setupMonitoring(ctx));
  results.push(await setupErrorTracking(ctx));
  results.push(await monitorPerformance(ctx));

  const success = results.every(r => r.success === true);
  return {
    success,
    data: { steps: results.map(r => r.data) },
    logs: mergeLogs(results)
  };
};

export default {};
