/**
 * GStack Specialist Action Handlers
 *
 * Implements handlers for CEO, Eng, QA, and EM audit gates using GStack specialists.
 */
import type { ActionHandler } from '../types';
/**
 * Founder Mode: Product Strategy Audit (/plan-ceo-review)
 */
export declare const ceoProductAudit: ActionHandler;
/**
 * Tech Lead Mode: Technical Architecture Audit (/plan-eng-review)
 */
export declare const engArchAudit: ActionHandler;
/**
 * Tech Lead Mode: Epic Readiness Audit (/plan-eng-review)
 */
export declare const engEpicAudit: ActionHandler;
/**
 * Tech Lead Mode: PI Readiness Audit (/plan-eng-review)
 */
export declare const engPiReadinessAudit: ActionHandler;
/**
 * Release Mode: Ship Epic (/ship)
 */
export declare const shipEpic: ActionHandler;
/**
 * Paranoid Staff Eng: Expert Code Review (/review)
 */
export declare const expertCodeReview: ActionHandler;
/**
 * QA Lead: Visual & Regression QA (/qa)
 */
export declare const visualRegressionQa: ActionHandler;
/**
 * EM Mode: Epic Retrospective (/retro)
 */
export declare const epicRetrospective: ActionHandler;
/**
 * Interactive UI Verification (/browse)
 */
export declare const interactiveUiVerification: ActionHandler;
/**
 * Import Browser Sessions (/setup-browser-cookies)
 */
export declare const importBrowserSessions: ActionHandler;
//# sourceMappingURL=gstack.d.ts.map