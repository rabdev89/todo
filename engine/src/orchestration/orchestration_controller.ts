/**
 * Orchestration Controller
 *
 * Main controller for the Bob + IDE AI collaborative workflow.
 */

import fs from 'fs-extra';
import path from 'path';
import { OrchestrationLoop } from './orchestration_loop';
import { BobStateManager } from '../bob/state_manager';
import { BobPhaseRouter } from '../bob/phase_router';
// import { vscode_askQuestions } from '../../../tools/vscode_askQuestions'; // Assuming this exists

export interface OrchestrationOptions {
  auto?: boolean;
  maxSteps?: number;
  promptForInput?: boolean;
}

export class OrchestrationController {
  /**
   * Run the orchestration loop
   */
  static async run(options: OrchestrationOptions = {}): Promise<void> {
    const { auto = false, maxSteps = 10, promptForInput = true } = options;

    console.log('🚀 Starting Bob + IDE AI Orchestration Controller');
    console.log(`Auto mode: ${auto}`);
    console.log(`Max steps: ${maxSteps}`);
    console.log('='.repeat(60) + '\n');

    let stepCount = 0;
    let continueRunning = true;

    while (continueRunning && stepCount < maxSteps) {
      stepCount++;

      console.log(`\n🔄 Step ${stepCount}/${maxSteps}`);
      console.log('-'.repeat(40));

      try {
        const result = await OrchestrationLoop.run();

        console.log(`📋 Result: ${result.message}`);

        if (result.blocked) {
          if (result.message.includes('User input required')) {
            // Handle user input
            if (promptForInput) {
              continueRunning = await this.handleUserInput();
            } else {
              console.log('⏸️  User input required but prompting disabled');
              continueRunning = false;
            }
          } else {
            // Other blocking conditions
            console.log('⏸️  Workflow blocked - manual intervention may be required');
            continueRunning = false;
          }
        } else if (!auto) {
          // In manual mode, ask to continue
          continueRunning = await this.promptContinue();
        }

        // Check if workflow completed
        if (result.message.includes('completed successfully')) {
          console.log('🎉 Workflow completed!');
          continueRunning = false;
        }

      } catch (error: any) {
        console.error(`❌ Step ${stepCount} failed: ${error.message}`);
        continueRunning = false;
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log(`🏁 Orchestration completed after ${stepCount} steps`);
    console.log('='.repeat(60));
  }

  /**
   * Handle user input requirements
   */
  private static async handleUserInput(): Promise<boolean> {
    console.log('👤 User input required - updating dashboard with instructions...');

    // For now, in CLI mode, we update the dashboard with user input requirements
    // and return false to indicate manual intervention needed
    await this.updateDashboardWithUserInputRequirements();

    console.log('✅ Dashboard updated with user input requirements');
    console.log('📋 Please check dashboard.md for instructions and provide the required input');
    return false;
  }

  /**
   * Update dashboard with user input requirements
   */
  private static async updateDashboardWithUserInputRequirements(): Promise<void> {
    try {
      const status = await BobStateManager.loadStatus();
      const phases = await BobStateManager.loadPhaseDefinitions();
      const phase = phases.phases.find(p => p.id === status.current_phase);
      
      if (!phase) {
        throw new Error(`Phase ${status.current_phase} not found`);
      }

      const step = phase.steps.find(s => s.id === status.current_step);

      if (!step) {
        throw new Error(`Step ${status.current_step} not found`);
      }

      // Create dashboard content with user input requirements
      const dashboardContent = this.generateUserInputDashboard(status, { phase, step });

      // Write to dashboard file
      const dashboardPath = path.join(
        __dirname,
        '../../../web-applications/bob/dashboard.md'
      );

      await fs.ensureDir(path.dirname(dashboardPath));
      await fs.writeFile(dashboardPath, dashboardContent, 'utf8');

      console.log(`📊 Dashboard updated: ${dashboardPath}`);
    } catch (error: any) {
      console.error(`❌ Failed to update dashboard: ${error.message}`);
    }
  }

  /**
   * Generate dashboard content with user input requirements
   */
  private static generateUserInputDashboard(
    status: any,
    position: { phase: any; step: any }
  ): string {
    const currentTime = new Date().toISOString();

    let inputRequirements = '';
    let nextSteps = '';

    // Customize based on current step
    switch (position.step.id) {
      case 'project_type_selection':
        inputRequirements = `
## 🎯 Required User Input: Project Type Selection

The framework needs to know what type of project you're working on:

### Available Project Types:
- **New Project**: Start a brand new project from scratch
- **Continue Existing**: Continue work on an existing project
- **Migration**: Migrate an existing project to use this framework
- **Quick Task**: One-off task or experiment

### Required Information:
1. **Project Type**: Choose from the options above
2. **Project Name**: A descriptive name for your project

### How to Provide Input:
\`\`\`bash
# Option 1: Use the framework status JSON
# Edit framework/framework_status.json and set:
# "project_type": "new_project",  # or "continue_project", "migration", "quick_task"
# "project_name": "Your Project Name"

# Option 2: Use Bob commands (when available)
npm run start -- bob

# Option 3: Manual update via API (future feature)
\`\`\`
`;
        nextSteps = `
### Next Steps After Input:
1. Framework will validate project type compatibility
2. Generate tech stack configuration
3. Create project context and metadata
4. Set up project management structure
5. Move to product definition phase
`;
        break;

      case 'vision_review':
        inputRequirements = `
## 🎯 Required User Input: Vision Document Review

The framework has generated an initial product vision document that needs your review and approval.

### What You Need to Do:
1. **Review** the generated vision document
2. **Approve** or request modifications
3. **Provide feedback** on vision alignment

### Files to Review:
- \`project-management/vision.md\` - Main vision document
- \`project-management/design/vision_draft.md\` - Draft version (if exists)

### How to Provide Input:
\`\`\`bash
# Update framework status to approved
# Edit framework/framework_status.json:
# Find the vision_review step and set status to "completed"

# Or use future interactive commands
\`\`\`
`;
        nextSteps = `
### Next Steps After Approval:
1. Generate user flow documentation
2. Create interaction guidelines
3. Move to architecture planning
`;
        break;

      default:
        inputRequirements = `
## 🎯 Required User Input: ${position.step.name}

**Description:** ${position.step.description}

**Action Required:** ${position.step.required_action}

### How to Provide Input:
The specific input requirements for this step are not yet defined in the automation system.
Please check the step description and provide the necessary information manually.

### Manual Update Process:
1. Understand what this step requires
2. Provide the required input
3. Update framework/framework_status.json to mark step as completed
4. Run the next orchestration step
`;
        nextSteps = `
### Next Steps:
1. Complete the required input
2. Update framework status
3. Continue orchestration
`;
    }

    return `# 🤖 Bob Framework Dashboard - User Input Required

${'='.repeat(60)}
🚨 **ACTION REQUIRED** - User Input Needed
${'='.repeat(60)}

## Current Status
- **Phase:** ${position.phase.name} (${position.phase.id})
- **Step:** ${position.step.name} (${position.step.id})
- **Status:** Waiting for User Input
- **Mode:** ${status.mode}
- **Last Updated:** ${currentTime}

${inputRequirements}

${nextSteps}

## Framework Status Summary
- **Overall Status:** ${status.status}
- **Project Type:** ${status.project_type || 'Not set'}
- **Project Name:** ${status.project_name || 'Not set'}

## Recent Activity
- Orchestration attempted to execute step but requires user input
- Dashboard updated with input requirements
- Waiting for user to provide required information

## How to Continue
1. **Provide the required input** as described above
2. **Update the framework status** to reflect completion
3. **Run orchestration again**:
   \`\`\`bash
   npm run start -- orchestrate --single
   # or for continuous mode:
   npm run start -- orchestrate --auto
   \`\`\`

## Emergency Commands
\`\`\`bash
# Check current status
npm run start -- bob-status

# Reset framework (CAUTION: loses progress)
npm run start -- bob --reset

# Manual status update (advanced users)
# Edit framework/framework_status.json directly
\`\`\`

---
*Generated by Bob Orchestration System on ${currentTime}*
`;
  }

  /**
   * Prompt user to continue in manual mode
   */
  private static async promptContinue(): Promise<boolean> {
    console.log('\n⏯️  Continue to next step? (y/n): ');
    // In CLI mode, assume continue for automation
    console.log('Assuming continue (y)');
    return true;
  }

  /**
   * Run single step (for testing)
   */
  static async runSingleStep(): Promise<void> {
    console.log('🔄 Running single orchestration step...\n');

    const result = await OrchestrationLoop.run();

    console.log(`📋 Result: ${result.message}`);

    if (result.blocked) {
      console.log('⏸️  Step blocked - check status for details');
    }
  }
}