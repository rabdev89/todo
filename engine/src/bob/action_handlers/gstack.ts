/**
 * GStack Specialist Action Handlers
 * 
 * Implements handlers for CEO, Eng, QA, and EM audit gates using GStack specialists.
 */

import { BobStateManager } from '../state_manager';
import type { ActionHandler, ActionResult } from '../types';

/**
 * Founder Mode: Product Strategy Audit (/plan-ceo-review)
 */
export const ceoProductAudit: ActionHandler = async (context): Promise<ActionResult> => {
  const status = await BobStateManager.loadStatus();
  const projectName = status.project_name || 'this project';

  return {
    success: true,
    data: {
      requires_ai_input: true,
      role: 'CEO / Founder',
      ai_prompt: `👑 **Founder Mode: Product Strategy Audit**
Project: ${projectName}

You are now in **CEO Mode**. Your goal is to audit the requirements and vision for high product ambition and market alignment.
1. Run \`/plan-ceo-review\` to analyze the current requirements, vision, and user flows.
2. Flag any "commodity" thinking or weak user value.
3. Once the audit is complete and you have refined the vision, run 'npm run start -- bob' to move to architecture.`
    },
    logs: [`Triggered Founder Mode audit for ${projectName}`]
  };
};

/**
 * Tech Lead Mode: Technical Architecture Audit (/plan-eng-review)
 */
export const engArchAudit: ActionHandler = async (context): Promise<ActionResult> => {
  return {
    success: true,
    data: {
      requires_ai_input: true,
      role: 'Tech Lead / Staff Eng',
      ai_prompt: `🛠️ **Tech Lead Mode: Architecture Audit**

Audit the proposed technical architecture, database schema, and API contracts.
1. Run \`/plan-eng-review\` to perform a triple-gate checks on the tech stack and architectural integrity.
2. Ensure patterns are scalable and standard-compliant.
3. Once approved, run 'npm run start -- bob' to move to planning.`
    },
    logs: ['Triggered Tech Lead Architecture audit']
  };
};

/**
 * Tech Lead Mode: Epic Readiness Audit (/plan-eng-review)
 */
export const engEpicAudit: ActionHandler = async (context): Promise<ActionResult> => {
  return {
    success: true,
    data: {
      requires_ai_input: true,
      role: 'Tech Lead',
      ai_prompt: `🛡️ **Tech Lead Mode: Epic Readiness Review**

Perform a final architectural check on the completed epic implementation.
1. Run \`/plan-eng-review\` to ensure all tickets in the epic align with the master architecture.
2. Verify that no technical debt was introduced during the sprint.
3. Once validated, run 'npm run start -- bob' to prepare for shipping.`
    },
    logs: ['Triggered Tech Lead Epic audit']
  };
};

/**
 * Tech Lead Mode: PI Readiness Audit (/plan-eng-review)
 */
export const engPiReadinessAudit: ActionHandler = async (context): Promise<ActionResult> => {
  return {
    success: true,
    data: {
      requires_ai_input: true,
      role: 'Tech Lead / Release Master',
      ai_prompt: `🏛️ **Tech Lead Mode: PI Readiness Audit**

Audit the entire Project Initiative for production readiness.
1. Run \`/plan-eng-review\` to verify cross-epic synergy and enterprise quality.
2. Check for zero-mock policies and 100% BE coverage.
3. Once verified, run 'npm run start -- bob' to initiate release preparation.`
    },
    logs: ['Triggered PI Readiness audit']
  };
};

/**
 * Release Mode: Ship Epic (/ship)
 */
export const shipEpic: ActionHandler = async (context): Promise<ActionResult> => {
  return {
    success: true,
    data: {
      requires_ai_input: true,
      role: 'Release Engineer',
      ai_prompt: `🚢 **Release Mode: Ship Epic**

Finalize the epic and sync branches.
1. Run \`/ship\` to consolidate all feature branches and prepare the merge to the main production track.
2. Ensure all verification gates are green.
3. Once shipped, run 'npm run start -- bob' to perform the retro.`
    },
    logs: ['Triggered Epic Shipping protocol']
  };
};

/**
 * Paranoid Staff Eng: Expert Code Review (/review)
 */
export const expertCodeReview: ActionHandler = async (context): Promise<ActionResult> => {
  return {
    success: true,
    data: {
      requires_ai_input: true,
      role: 'Paranoid Staff Engineer',
      ai_prompt: `🔍 **Expert Code Review (Paranoid Mode)**

Perform a deep architectural and security-focused review of the implementation.
1. Run \`/review\` to analyze the code for subtle bugs, performance bottlenecks, and security risks.
2. Don't settle for "LGTM" - find the edge cases.
3. Once the review is addressed, run 'npm run start -- bob' to generate tests.`
    },
    logs: ['Triggered Expert Code Review']
  };
};

/**
 * QA Lead: Visual & Regression QA (/qa)
 */
export const visualRegressionQa: ActionHandler = async (context): Promise<ActionResult> => {
  return {
    success: true,
    data: {
      requires_ai_input: true,
      role: 'QA Lead',
      ai_prompt: `🧪 **Visual & Regression QA**

Verify the implementation using GStack's diff-aware QA.
1. Run \`/qa\` to identify and verify only the affected parts of the application.
2. Ensure visual fidelity matches the Design Bible.
3. Once verified, run 'npm run start -- bob' to complete the ticket.`
    },
    logs: ['Triggered Visual QA gate']
  };
};

/**
 * EM Mode: Epic Retrospective (/retro)
 */
export const epicRetrospective: ActionHandler = async (context): Promise<ActionResult> => {
  return {
    success: true,
    data: {
      requires_ai_input: true,
      role: 'Engineering Manager',
      ai_prompt: `📊 **Epic Retrospective**

Analyze the delivery cycle and capture organizational lessons.
1. Run \`/retro\` to synthesize metrics, velocity, and implementation hurdles.
2. Update the system's "lesson memory" for future agents.
3. Once documented, run 'npm run start -- bob' to move to PI hardening.`
    },
    logs: ['Triggered Epic Retrospective']
  };
};

/**
 * Interactive UI Verification (/browse)
 */
export const interactiveUiVerification: ActionHandler = async (context): Promise<ActionResult> => {
  return {
    success: true,
    data: {
      requires_ai_input: true,
      role: 'UI/UX Specialist',
      ai_prompt: `🌐 **Interactive UI Verification**

Use the persistent browser to verify visual behavior.
1. Run \`/browse\` to open the application and interactively verify responsiveness and flow.
2. Ensure micro-animations and hover states feel "premium".
3. Once visually verified, run 'npm run start -- bob' for the final code review.`
    },
    logs: ['Triggered Interactive Browsing session']
  };
};

/**
 * Import Browser Sessions (/setup-browser-cookies)
 */
export const importBrowserSessions: ActionHandler = async (context): Promise<ActionResult> => {
  return {
    success: true,
    data: {
      requires_user_input: true,
      role: 'UAT Setup Specialist',
      ai_prompt: `🍪 **Import Browser Sessions**

Setup authenticated sessions for UAT testing.
1. Use \`/setup-browser-cookies\` to import session data into the test environment.
2. This ensures UAT flows can access authenticated pages.
3. Once cookies are imported, run 'npm run start -- bob' to start UAT execution.`
    },
    logs: ['Triggered Browser Session import']
  };
};
