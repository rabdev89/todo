/**
 * Bob Dashboard Generator
 *
 * Generates markdown dashboard showing current framework status.
 */

import fs from 'fs-extra';
import path from 'path';
import { BobStateManager } from './state_manager';
import { BobPhaseRouter } from './phase_router';
import type { Phase, Step, FrameworkStatus } from './types';
import { getRecommendedCommands } from '../shared/command_mapping';

const FRAMEWORK_DIR = path.resolve(__dirname, '../../../framework');
const PROJECT_DIR = path.resolve(__dirname, '../../../web-applications/bob');
const DASHBOARD_FILE = path.join(PROJECT_DIR, 'dashboard.md');

export interface DashboardData {
  currentPhase: Phase;
  currentStep: Step;
  phaseDescription: string;
  stepDescription: string;
  nextStep: string | null;
  nextStepName: string | null;
  userActionRequired: boolean;
  userActionDescription?: string;
  progress: {
    percentage: number;
    phasesCompleted: number;
    phasesTotal: number;
    stepsCompleted: number;
    stepsTotal: number;
  };
  recentErrors: string[];
  status: FrameworkStatus['status'];
  mode: string;
  projectType: string | null;
  projectName: string | null;
}

export class BobDashboardGenerator {
  /**
   * Generate dashboard data from current state
   */
  static async generateData(): Promise<DashboardData> {
    const status = await BobStateManager.loadStatus();
    const position = await BobPhaseRouter.getCurrentPosition();
    const progress = await BobPhaseRouter.getProgress();

    // Get next step name if available
    let nextStepName: string | null = null;
    if (position.nextStep) {
      const nextStep = position.phase.steps.find(s => s.id === position.nextStep);
      nextStepName = nextStep?.name || null;
    }

    // Collect recent errors (last 5)
    const recentErrors = status.errors
      .slice(-5)
      .map(e => `[${e.phase}/${e.step}] ${e.message}`);

    return {
      currentPhase: position.phase,
      currentStep: position.step,
      phaseDescription: position.phase.description,
      stepDescription: position.step.description,
      nextStep: position.nextStep,
      nextStepName,
      userActionRequired: !!position.step.user_input_required,
      userActionDescription: position.step.user_input_required
        ? `Action: ${position.step.name}`
        : undefined,
      progress,
      recentErrors,
      status: status.status,
      mode: status.mode,
      projectType: status.project_type,
      projectName: status.project_name
    };
  }

  /**
   * Generate markdown dashboard
   */
  static async generate(): Promise<string> {
    const data = await this.generateData();
    const markdown = this.renderMarkdown(data);
    
    await fs.ensureDir(FRAMEWORK_DIR);
    await fs.writeFile(DASHBOARD_FILE, markdown, 'utf8');
    
    return DASHBOARD_FILE;
  }

  /**
   * Render dashboard as markdown
   */
  private static renderMarkdown(data: DashboardData): string {
    const progressBar = this.renderProgressBar(data.progress.percentage);
    const statusIcon = this.getStatusIcon(data.status);
    const action = data.currentStep.required_action || '';
    const recommended = action ? getRecommendedCommands(action) : [];
    const recommendedBlock = recommended.length
      ? `\n## Recommended Workflow Commands\n\n\`\`\`bash\n${recommended.join('\n')}\n\`\`\`\n`
      : '';
    
    return `# 🤖 Bob Framework Dashboard

${statusIcon} **Status:** ${data.status.toUpperCase()}  
**Mode:** ${data.mode.toUpperCase()}  
${data.projectType ? `**Project Type:** ${data.projectType}` : ''}
${data.projectName ? `**Project:** ${data.projectName}` : ''}

---

## Current Phase: ${data.currentPhase.name}

${data.phaseDescription}

## Current Step: ${data.currentStep.name}

${data.stepDescription}

**Action Required:** \`${data.currentStep.required_action}\`

${data.userActionRequired ? `⚠️ **User Input Required** - ${data.userActionDescription}` : ''}

---

## Progress

${progressBar} **${data.progress.percentage}%**

- **Phases:** ${data.progress.phasesCompleted} / ${data.progress.phasesTotal} completed
- **Steps:** ${data.progress.stepsCompleted} / ${data.progress.stepsTotal} completed

---

## Next Up

${data.nextStep 
  ? `**Next Step:** ${data.nextStepName || data.nextStep}`
  : data.progress.percentage === 100 
    ? '✅ **Workflow Complete**'
    : '**Phase Complete** - Moving to next phase'}

---

## How to Continue

\`\`\`bash
# Execute next step
npm run start -- bob

# Run continuously until blocked
npm run start -- bob --auto

# Check status
npm run start -- bob-status

# Reset framework
npm run start -- bob --reset
\`\`\`

${data.recentErrors.length > 0 ? `
---

## Recent Errors

${data.recentErrors.map(e => `- ${e}`).join('\n')}

` : ''}

---

*Last updated: ${new Date().toISOString()}*
`;
  }

  /**
   * Render ASCII progress bar
   */
  private static renderProgressBar(percentage: number): string {
    const width = 30;
    const filled = Math.round((percentage / 100) * width);
    const empty = width - filled;
    
    return `[${'█'.repeat(filled)}${'░'.repeat(empty)}]`;
  }

  /**
   * Get status icon
   */
  private static getStatusIcon(status: FrameworkStatus['status']): string {
    switch (status) {
      case 'running':
        return '🔄';
      case 'waiting_user':
        return '⏸️';
      case 'completed':
        return '✅';
      case 'failed':
        return '❌';
      case 'paused':
        return '⏹️';
      default:
        return '⏳';
    }
  }

  /**
   * Generate console output (for CLI display)
   */
  static async generateConsoleOutput(): Promise<string> {
    const data = await this.generateData();
    const progressBar = this.renderProgressBar(data.progress.percentage);
    const statusIcon = this.getStatusIcon(data.status);
    const action = data.currentStep.required_action || '';
    const recommended = action ? getRecommendedCommands(action) : [];

    let output = `🤖 Bob Framework Dashboard\n\n`;
    output += `${statusIcon} Status: ${data.status.toUpperCase()}\n`;
    output += `Mode: ${data.mode.toUpperCase()}\n`;
    if (data.projectType) output += `Project Type: ${data.projectType}\n`;
    if (data.projectName) output += `Project: ${data.projectName}\n`;
    output += `\n---\n\n`;
    output += `Current Phase: ${data.currentPhase.name}\n`;
    output += `${data.phaseDescription}\n\n`;
    output += `Current Step: ${data.currentStep.name}\n`;
    output += `${data.stepDescription}\n\n`;
    output += `Action Required: ${data.currentStep.required_action}\n`;

    if (data.userActionRequired) {
      output += `⚠️ User Input Required - ${data.userActionDescription}\n`;
    }

    output += `\n---\n\nProgress\n\n`;
    output += `${progressBar} ${data.progress.percentage}%\n\n`;
    output += `Phases: ${data.progress.phasesCompleted} / ${data.progress.phasesTotal} completed\n`;
    output += `Steps: ${data.progress.stepsCompleted} / ${data.progress.stepsTotal} completed\n`;

    output += `\n---\n\nNext Up\n\n`;
    if (data.nextStep) {
      output += `Next Step: ${data.nextStepName || data.nextStep}\n`;
    } else if (data.progress.percentage === 100) {
      output += `✅ Workflow Complete\n`;
    } else {
      output += `Phase Complete - Moving to next phase\n`;
    }

    output += `\n---\n\nHow to Continue\n\n`;
    output += `# Execute next step\n`;
    output += `npm run start -- bob\n\n`;
    output += `# Run continuously until blocked\n`;
    output += `npm run start -- bob --auto\n\n`;
    output += `# Check status\n`;
    output += `npm run start -- bob-status\n\n`;
    output += `# Reset framework\n`;
    output += `npm run start -- bob --reset\n`;

    if (data.recentErrors.length > 0) {
      output += `\n---\n\nRecent Errors\n\n`;
      output += data.recentErrors.map(e => `- ${e}`).join('\n');
      output += '\n';
    }

    output += `\n---\n\nLast updated: ${new Date().toISOString()}\n`;

    return output;
  }
}
