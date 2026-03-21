"use strict";
/**
 * Bob Dashboard Generator
 *
 * Generates markdown dashboard showing current framework status.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BobDashboardGenerator = void 0;
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const state_manager_1 = require("./state_manager");
const phase_router_1 = require("./phase_router");
const command_mapping_1 = require("../shared/command_mapping");
const FRAMEWORK_DIR = path_1.default.resolve(__dirname, '../../../framework');
const PROJECT_DIR = path_1.default.resolve(__dirname, '../../../web-applications/bob');
const DASHBOARD_FILE = path_1.default.join(PROJECT_DIR, 'dashboard.md');
class BobDashboardGenerator {
    /**
     * Generate dashboard data from current state
     */
    static async generateData() {
        const status = await state_manager_1.BobStateManager.loadStatus();
        const position = await phase_router_1.BobPhaseRouter.getCurrentPosition();
        const progress = await phase_router_1.BobPhaseRouter.getProgress();
        // Get next step name if available
        let nextStepName = null;
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
    static async generate() {
        const data = await this.generateData();
        const markdown = this.renderMarkdown(data);
        await fs_extra_1.default.ensureDir(FRAMEWORK_DIR);
        await fs_extra_1.default.writeFile(DASHBOARD_FILE, markdown, 'utf8');
        return DASHBOARD_FILE;
    }
    /**
     * Render dashboard as markdown
     */
    static renderMarkdown(data) {
        const progressBar = this.renderProgressBar(data.progress.percentage);
        const statusIcon = this.getStatusIcon(data.status);
        const action = data.currentStep.required_action || '';
        const recommended = action ? (0, command_mapping_1.getRecommendedCommands)(action) : [];
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
    static renderProgressBar(percentage) {
        const width = 30;
        const filled = Math.round((percentage / 100) * width);
        const empty = width - filled;
        return `[${'█'.repeat(filled)}${'░'.repeat(empty)}]`;
    }
    /**
     * Get status icon
     */
    static getStatusIcon(status) {
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
    static async generateConsoleOutput() {
        const data = await this.generateData();
        const progressBar = this.renderProgressBar(data.progress.percentage);
        const statusIcon = this.getStatusIcon(data.status);
        const action = data.currentStep.required_action || '';
        const recommended = action ? (0, command_mapping_1.getRecommendedCommands)(action) : [];
        let output = `🤖 Bob Framework Dashboard\n\n`;
        output += `${statusIcon} Status: ${data.status.toUpperCase()}\n`;
        output += `Mode: ${data.mode.toUpperCase()}\n`;
        if (data.projectType)
            output += `Project Type: ${data.projectType}\n`;
        if (data.projectName)
            output += `Project: ${data.projectName}\n`;
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
        }
        else if (data.progress.percentage === 100) {
            output += `✅ Workflow Complete\n`;
        }
        else {
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
exports.BobDashboardGenerator = BobDashboardGenerator;
