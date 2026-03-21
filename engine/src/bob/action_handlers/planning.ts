/**
 * Planning Action Handlers
 *
 * Implements actions for Project Planning phase - epics and tickets.
 */

import fs from 'fs-extra';
import path from 'path';
import { spawnSync } from 'child_process';
import { BobStateManager } from '../state_manager';
import type { ActionHandler, ActionContext, ActionResult } from '../types';

const ROOT_DIR = path.resolve(__dirname, '../../../..');
const PROJECT_MGMT_DIR = path.join(ROOT_DIR, 'project-management');
const WEB_APP_PM_DIR = path.join(ROOT_DIR, 'web-applications', 'project-management');
// EPICS should live under web-applications/project-management/epics
const EPICS_DIR = path.join(WEB_APP_PM_DIR, 'epics');

/**
 * Generate epics from requirements
 */
export const generateEpics: ActionHandler = async (
  context
): Promise<ActionResult> => {
  console.log('  Generating epics from requirements...');

  const epicsSummaryPath = path.join(EPICS_DIR, 'README.md');
  const epicBacklogsPath = path.join(WEB_APP_PM_DIR, 'epic_backlogs.md');

  // If epics README already exists, assume epics are generated
  if (await fs.pathExists(epicsSummaryPath)) {
    return {
      success: true,
      data: { 
        epics_summary_path: epicsSummaryPath,
        epics_dir: EPICS_DIR
      },
      logs: [
        '✓ Using existing epics documentation:',
        `  File: ${epicsSummaryPath}`
      ]
    };
  }

  // IF epic_backlogs.md doesn't exist, we must prompt AI to make it
  if (!await fs.pathExists(epicBacklogsPath)) {
    const visionPath = path.join(WEB_APP_PM_DIR, 'vision.md');
    const prdPath = path.join(WEB_APP_PM_DIR, 'PRD.md');
    const architecturePath = path.join(WEB_APP_PM_DIR, 'architecture.md');

    return {
      success: true,
      data: {
        requires_ai_input: true,
        ai_prompt: `🚀 Generate Development Epics for Bobbie

Based on the Project Vision, PRD, and System Architecture, break down the project into logical development Epics.

**Reference Documents:**
- Vision: ${visionPath}
- PRD: ${prdPath}
- Architecture: ${architecturePath}

**Requirements:**
1. **Create Backlog**: Generate a markdown file at \`${epicBacklogsPath}\`.
2. **Format**: Follow this exact structure:
   \`\`\`markdown
   # Epic Backlogs: [Project Name]

   ## Epic 001: [Epic Name]
   *Goal: [Short goal description]*
   - **T-001**: [Ticket Title]
   - **T-002**: [Ticket Title]
   \`\`\`
   
Ensure each Epic is a cohesive unit of work that can be planned and executed independently.`
      }
    };
  }

  // 1. Parse epic_backlogs.md
  console.log(`  Parsing ${epicBacklogsPath}...`);
  const content = await fs.readFile(epicBacklogsPath, 'utf-8');
  const lines = content.split('\n');
  
  interface TicketInfo { id: string; title: string; }
  interface EpicInfo { id: string; title: string; description: string; tickets: TicketInfo[]; }
  
  const epics: EpicInfo[] = [];
  let currentEpic: EpicInfo | null = null;
  
  for (const line of lines) {
    const epicMatch = line.match(/^##\s+(Epic\s+\d+):\s*(.*)/i);
    if (epicMatch) {
      currentEpic = {
        id: epicMatch[1].replace(/\s+/g, '-').toUpperCase(), // e.g. EPIC-001
        title: epicMatch[2].trim(),
        description: '',
        tickets: []
      };
      epics.push(currentEpic);
      continue;
    }
  
    const descMatch = line.match(/^\*Goal:\s*(.*)\*/i);
    if (descMatch && currentEpic) {
      currentEpic.description = descMatch[1].trim();
      continue;
    }
  
    const ticketMatch = line.match(/^-\s+\*\*(T-\d+)\*\*:\s*(.*)/i);
    if (ticketMatch && currentEpic) {
      currentEpic.tickets.push({
        id: ticketMatch[1].toUpperCase(),
        title: ticketMatch[2].trim()
      });
    }
  }

  // 2. Generate folders and files
  let hasCreatedFolders = false;
  for (const epic of epics) {
    const epicDir = path.join(EPICS_DIR, epic.id);
    if (await fs.pathExists(epicDir)) continue;

    hasCreatedFolders = true;
    console.log(`  Scaffolding Epic: ${epic.id} - ${epic.title}`);
    await fs.ensureDir(epicDir);

    // Epic level files
    await fs.writeFile(path.join(epicDir, 'README.md'), `# ${epic.id}: ${epic.title}\n\n**Goal**: ${epic.description}\n\n## Tickets\n${epic.tickets.map(t => `- ${t.id}: ${t.title}`).join('\n')}\n`);
    await fs.writeFile(path.join(epicDir, 'metadata.json'), JSON.stringify({ id: epic.id, title: epic.title, status: 'planned' }, null, 2));
    await fs.writeFile(path.join(epicDir, 'gap_analysis.md'), `# ${epic.id}: Gap Analysis\n\n*(To be filled during epic validation)*\n`);
    await fs.writeFile(path.join(epicDir, 'threat_model.md'), `# ${epic.id}: Threat Model\n\n*(To be filled during epic hardening)*\n`);
    await fs.writeFile(path.join(epicDir, 'release.md'), `# ${epic.id}: Release Notes\n\n*(To be filled at the end of epic)*\n`);

    // Ticket folders
    const ticketsDir = path.join(epicDir, 'tickets');
    await fs.ensureDir(ticketsDir);

    for (const ticket of epic.tickets) {
      const ticketDir = path.join(ticketsDir, ticket.id);
      await fs.ensureDir(ticketDir);
      await fs.writeFile(path.join(ticketDir, 'README.md'), `# ${ticket.id}: ${ticket.title}\n\n**Epic**: ${epic.id}\n`);
      await fs.writeFile(path.join(ticketDir, 'metadata.json'), JSON.stringify({ 
        ticket_id: ticket.id, 
        title: ticket.title, 
        source: 'epic', 
        status: 'draft', 
        track: null, 
        requirements_done: false, 
        design_done: false, 
        implementation_done: false, 
        tests_done: false,
        approved: false
      }, null, 2));

      // Scaffold standard ticket subdirectories to ensure the development loop can rely on them
      const reqDir = path.join(ticketDir, 'requirements');
      const desDir = path.join(ticketDir, 'design');
      const planDir = path.join(ticketDir, 'planning');
      const testDir = path.join(ticketDir, 'testing');
      
      await fs.ensureDir(reqDir);
      await fs.ensureDir(desDir);
      await fs.ensureDir(planDir);
      await fs.ensureDir(testDir);
      
      if (!await fs.pathExists(path.join(reqDir, 'README.md'))) {
        await fs.writeFile(path.join(reqDir, 'README.md'), `# ${ticket.id} Requirements\n\n*(To be filled by the agent)*\n`);
      }
      if (!await fs.pathExists(path.join(desDir, 'README.md'))) {
        await fs.writeFile(path.join(desDir, 'README.md'), `# ${ticket.id} Design\n\n*(To be filled by the agent)*\n`);
      }
      if (!await fs.pathExists(path.join(planDir, 'README.md'))) {
        await fs.writeFile(path.join(planDir, 'README.md'), `# ${ticket.id} Planning\n\n*(To be filled by the agent)*\n`);
      }
      if (!await fs.pathExists(path.join(testDir, 'README.md'))) {
        await fs.writeFile(path.join(testDir, 'README.md'), `# ${ticket.id} Testing\n\n*(To be filled by the agent)*\n`);
      }
    }
  }

  // Generate the main EPICS_DIR/README.md summary
  if (!await fs.pathExists(epicsSummaryPath)) {
    const summaryMd = `# Epics Summary\n\n${epics.map(e => `## ${e.id}: ${e.title}\n- **Goal**: ${e.description}\n- **Tickets**: ${e.tickets.length}`).join('\n\n')}`;
    await fs.writeFile(epicsSummaryPath, summaryMd);
  }

  return {
    success: true,
    data: { 
      epics_summary_path: epicsSummaryPath,
      epics_dir: EPICS_DIR,
      automated_scaffold: true,
      epics_created: epics.length
    },
    logs: [
      `✓ Automatically scaffolded ${epics.length} epics from epic_backlogs.md`,
      `  File: ${epicsSummaryPath}`
    ]
  };
};
  console.log('  Generating epics from requirements...');

  const epicsSummaryPath = path.join(EPICS_DIR, 'README.md');


/**
 * Review epics (user input required)
 */
export const reviewEpics: ActionHandler = async (
  context
): Promise<ActionResult> => {
  console.log('  Waiting for epic review...');

  const epicsSummaryPath = path.join(EPICS_DIR, 'README.md');
  const approvalPath = path.join(WEB_APP_PM_DIR, 'epic_approval.json');
  
  if (!await fs.pathExists(epicsSummaryPath)) {
    return {
      success: false,
      error: 'Epics documentation not found. Run generate_epics first.',
      data: { exists: false }
    };
  }

  // Check for specialized approval file
  if (await fs.pathExists(approvalPath)) {
    try {
      const approval = await fs.readJson(approvalPath);
      
      if (approval.approved === true) {
        return {
          success: true,
          data: { approved: true, approved_by: approval.approved_by },
          logs: ['✓ Epics approved by user. Proceeding to ticket generation.']
        };
      }
    } catch (e) {
      console.warn('  Warning: Failed to parse epic_approval.json');
    }
  }

  // Try to list epics for the prompt
  const epics = (await fs.readdir(EPICS_DIR)).filter(n => n.startsWith('EPIC-'));

  // Initialize approval file if missing
  if (!await fs.pathExists(approvalPath)) {
    const initialApproval: any = {
      approved: false,
      approved_by: null,
      epics: {}
    };
    for (const epicId of epics) {
      initialApproval.epics[epicId] = false;
    }
    await fs.writeJson(approvalPath, initialApproval, { spaces: 2 });
  }

  return {
    success: true,
    data: {
      requires_ai_input: true,
      ai_prompt: `⏸️ User approval required for Epics.

Please review the generated development epics in ${EPICS_DIR}.

**Action Items:**
1. Review the Project Summary: ${epicsSummaryPath}
2. Review individual README.md files in each EPIC directory.
3. If satisfied, mark "approved": true in ${approvalPath}.

**Current Epics:**
${epics.map(id => `- ${id}`).join('\n')}

Once approved, run 'npm run bob' to start generating tickets.`
    },
    logs: [
      'Waiting for user to approve epics in epic_approval.json...',
      `Location: ${approvalPath}`
    ]
  };
};

/**
 * Run decision gate for a ticket to determine Track A vs Track B
 */
const runDecisionGate = async (ticketTitle: string): Promise<'Track A' | 'Track B'> => {
  console.log(`  Running decision gate for: ${ticketTitle}`);
  
  // Quick decision table from WORKFLOW_DECISION_GATE.md
  const trackBIndicators = [
    'database', 'schema', 'api', 'auth', 'payment', 'pii',
    'external', 'integration', 'migration', 'refactor',
    'architecture', 'new feature', 'implement', 'create'
  ];
  
  const trackAIndicators = [
    'fix', 'bug', 'tweak', 'update', 'adjust', 'minor',
    'simple', 'small', 'single', 'validation', 'field'
  ];
  
  const titleLower = ticketTitle.toLowerCase();
  
  // Check for Track B indicators first
  for (const indicator of trackBIndicators) {
    if (titleLower.includes(indicator)) {
      console.log(`    → Track B (Full) - contains: ${indicator}`);
      return 'Track B';
    }
  }
  
  // Check for Track A indicators
  for (const indicator of trackAIndicators) {
    if (titleLower.includes(indicator)) {
      console.log(`    → Track A (Lean) - contains: ${indicator}`);
      return 'Track A';
    }
  }
  
  // Default to Track B if uncertain
  console.log(`    → Track B (Full) - default for uncertainty`);
  return 'Track B';
};

/**
 * Generate tickets from epics
 */
export const generateTickets: ActionHandler = async (
  context
): Promise<ActionResult> => {
  console.log('  Generating tickets from epics...');
  // If backlog.md exists, prefer generating tickets from backlog sections
  const backlogPath = path.join(WEB_APP_PM_DIR, 'backlog', 'backlog.md');

  const parseBacklog = async (filePath: string): Promise<string[]> => {
    if (!await fs.pathExists(filePath)) return [];
    const text = await fs.readFile(filePath, 'utf8');
    const lines = text.split(/\r?\n/);
    const entries: string[] = [];
    let currentSection: string | null = null;
    const sectionCandidates = ['Raw Ideas', 'Raw Ideas (Unscoped)', 'UAT Bug Fixes'];
    const headingRe = /^#{1,6}\s*(.*)$/;
    const listRe = /^\s*[-*+]\s+(.*)$/;
    for (const l of lines) {
      const h = l.match(headingRe);
      if (h) {
        const name = h[1].trim();
        const matched = sectionCandidates.find(s => name.toLowerCase().startsWith(s.split('(')[0].trim().toLowerCase()));
        currentSection = matched || null;
        continue;
      }
      if (currentSection) {
        const m = l.match(listRe);
        if (m) {
          let item = m[1].trim();
          // strip markdown checkbox
          item = item.replace(/^\[.?\]\s*/, '');
          if (item) entries.push(item);
        }
      }
    }
    return entries;
  };

  let tickets: Array<any> = [];
  let totalBacklogTickets = 0;
  const backlogLogs: string[] = [];

  const backlogEntries = await parseBacklog(backlogPath);
  if (backlogEntries.length > 0) {
    console.log('  Generating backlog tickets:', backlogEntries.length);
    
    // Generate tickets for backlog
    const pythonCmd = 'python';
    const script = path.join(ROOT_DIR, '.agent', 'generate_tickets.py');
    const args = [script, '--epic', 'backlog', '--source', 'backlog'];
    const proc = spawnSync(pythonCmd, args, { cwd: ROOT_DIR, encoding: 'utf8' });
    
    if (proc.error || proc.status !== 0) {
      return {
        success: false,
        error: 'Python ticket generator failed for backlog',
        data: { stdout: proc.stdout, stderr: proc.stderr }
      };
    }

    const backlogTicketsDir = path.join(EPICS_DIR, 'backlog', 'tickets');
    if (await fs.pathExists(backlogTicketsDir)) {
      const ticketDirs = await fs.readdir(backlogTicketsDir);
      for (const ticketDir of ticketDirs) {
        const ticketPath = path.join(backlogTicketsDir, ticketDir);
        if (!(await fs.stat(ticketPath)).isDirectory()) continue;
        
        const metadataPath = path.join(ticketPath, 'metadata.json');
        if (await fs.pathExists(metadataPath)) {
          const metadata = await fs.readJson(metadataPath);
          const track = await runDecisionGate(metadata.title);
          
          const decisionContent = `# Track Decision for ${metadata.ticket_id}\n\n**Decision**: ${track}\n\n**Reasoning**: Automated decision based on ticket title analysis\n\n**Date**: ${new Date().toISOString().split('T')[0]}\n**Decided by**: Bob Framework Decision Gate\n\n---\n*This decision was made automatically using the WORKFLOW_DECISION_GATE.md criteria*\n`;
          await fs.writeFile(path.join(ticketPath, 'TRACK_DECISION.md'), decisionContent, 'utf8');
        }
      }

      const existingTickets = await fs.readdir(backlogTicketsDir);
      totalBacklogTickets = existingTickets.filter(f => fs.statSync(path.join(backlogTicketsDir, f)).isDirectory()).length;
      backlogLogs.push(`Found ${totalBacklogTickets} existing tickets in backlog.`);
    }
  }

  // 1. Scan for epic folders
  const epicDirs = (await fs.readdir(EPICS_DIR).catch(() => [] as string[])).filter(name => {
    const p = path.join(EPICS_DIR, name);
    try {
      return fs.statSync(p).isDirectory() && name !== 'epic_template' && name !== 'backlog';
    } catch {
      return false;
    }
  });

  const epicsWithMissingTickets: string[] = [];
  const epicsWithTickets: string[] = [];
  let epicTicketCount = 0;

  for (const epicName of epicDirs) {
    const ticketsDir = path.join(EPICS_DIR, epicName, 'tickets');
    if (!await fs.pathExists(ticketsDir)) {
      epicsWithMissingTickets.push(epicName);
      continue;
    }

    const files = await fs.readdir(ticketsDir).catch(() => [] as string[]);
    const ticketDirs = files.filter(f => fs.statSync(path.join(ticketsDir, f)).isDirectory());
    
    if (ticketDirs.length === 0) {
      epicsWithMissingTickets.push(epicName);
      continue;
    }

    // We have ticket directories! We should invoke our scaffolder.
    const ticketsToScaffold: string[] = [];
    for (const ticketDir of ticketDirs) {
      const metadataPath = path.join(ticketsDir, ticketDir, 'metadata.json');
      if (await fs.pathExists(metadataPath)) {
        const metadata = await fs.readJson(metadataPath);
        // extract digits from ticket_id (e.g. T-001 -> 1)
        const idMatch = String(metadata.ticket_id || '').match(/\d+/);
        if (idMatch) {
          ticketsToScaffold.push(`${parseInt(idMatch[0], 10)}:"${metadata.title}"`);
        }
      }
    }

    if (ticketsToScaffold.length > 0) {
      console.log(`  Scaffolding tickets for ${epicName}:`, ticketsToScaffold.length);
      const pythonCmd = 'python';
      const script = path.join(ROOT_DIR, '.agent', 'generate_tickets.py');
      const args = [script, '--epic', epicName, '--source', 'epic', '--tickets', ...ticketsToScaffold];
      const proc = spawnSync(pythonCmd, args, { cwd: ROOT_DIR, encoding: 'utf8' });
      
      if (proc.error || proc.status !== 0) {
        console.error(`  Warning: Python ticket generator failed for ${epicName}`, proc.stderr);
      }
    }

    epicsWithTickets.push(epicName);
    epicTicketCount += ticketDirs.length;
  }

  // 2. If any epic is missing tickets entirely, log a warning but proceed
  if (epicsWithMissingTickets.length > 0) {
    console.log('  Found epics missing tickets:', epicsWithMissingTickets.join(', '));
  }

  // 3. Return success
  const total = totalBacklogTickets + epicTicketCount;
  console.log('  All tickets ready:', total, 'total');
  return {
    success: true,
    data: {
      tickets_created: 0,
      already_exists: true,
      total_tickets: total,
      epics_scanned: ['backlog', ...epicsWithTickets]
    },
    logs: [
      ...backlogLogs,
      `Found ${epicTicketCount} tickets across ${epicsWithTickets.length} epic folders.`,
      `Total tickets ready for validation: ${total}`
    ]
  };
};

/**
 * Validate tickets
 */
export const validateTickets: ActionHandler = async (
  context
): Promise<ActionResult> => {
  console.log('  Validating tickets...');

  const results: { ticket: string; valid: boolean; issues?: string[] }[] = [];

  try {
    const epics = await fs.readdir(EPICS_DIR);
    
    for (const epic of epics) {
      const epicPath = path.join(EPICS_DIR, epic);
      const stat = await fs.stat(epicPath);
      if (!stat.isDirectory() || epic === 'epic_template') continue;

      const ticketsDir = path.join(epicPath, 'tickets');
      if (!await fs.pathExists(ticketsDir)) continue;

      const tickets = await fs.readdir(ticketsDir);
      const ticketFiles = tickets.filter(f => f.endsWith('.json'));

      for (const ticketFile of ticketFiles) {
        try {
          const ticketPath = path.join(ticketsDir, ticketFile);
          const metadata = await fs.readJson(ticketPath);
          
          const issues: string[] = [];
          if (!metadata.title) issues.push('Missing title');
          if (!metadata.epic) issues.push('Missing epic');
          if (!metadata.type) issues.push('Missing type');
          if (!metadata.priority) issues.push('Missing priority');

          results.push({
            ticket: metadata.id || ticketFile,
            valid: issues.length === 0,
            issues: issues.length > 0 ? issues : undefined
          });
        } catch (error: any) {
          results.push({
            ticket: ticketFile,
            valid: false,
            issues: ['Invalid JSON: ' + error.message]
          });
        }
      }
    }

    const invalidCount = results.filter(r => !r.valid).length;

    if (invalidCount > 0) {
      return {
        success: false,
        error: `${invalidCount} tickets have validation issues`,
        data: { results }
      };
    }

    return {
      success: true,
      data: {
        total_validated: results.length,
        all_valid: true
      },
      logs: [
        `Validated ${results.length} tickets`,
        'All tickets are valid ✓'
      ]
    };
  } catch (error: any) {
    return {
      success: false,
      error: `Validation failed: ${error.message}`
    };
  }
};

/**
 * Generate project timeline
 */
export const generateProjectTimeline: ActionHandler = async (
  context
): Promise<ActionResult> => {
  console.log('  Generating project timeline...');

  const timelinePath = path.join(WEB_APP_PM_DIR, 'timeline.md');
  const epicsSummaryPath = path.join(EPICS_DIR, 'README.md');
  const prdPath = path.join(WEB_APP_PM_DIR, 'PRD.md');

  // If timeline.md already exists, skip AI prompt and proceed
  if (await fs.pathExists(timelinePath)) {
    return {
      success: true,
      data: { timeline_path: timelinePath },
      logs: [
        '✓ Using existing project timeline:',
        `  File: ${timelinePath}`
      ]
    };
  }

  return {
    success: true,
    data: {
      requires_ai_input: true,
      ai_prompt: `🚀 Generate Project Timeline for Bobbie

Based on the approved Epics and Project Requirements, generate a realistic development timeline.

**Reference Documents:**
- Epics Summary: ${epicsSummaryPath}
- PRD: ${prdPath}

**Requirements:**
Generate ${timelinePath} including:
1. **Overview**: Total estimated duration and sprint structure.
2. **Sprints**: Detailed breakdown of sprints (e.g., Sprint 1, Sprint 2) with focus areas and assigned epics.
3. **Milestones**: Critical delivery milestones (MVP, Beta, Production Ready).
4. **Timeline Diagram**: A Gantt chart using Mermaid syntax to visualize the project roadmap.

Ensure the timeline is realistic, accounts for dependencies between epics, and aligns with the project's priority needs.`
    }
  };
};
