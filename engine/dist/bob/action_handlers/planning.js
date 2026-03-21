"use strict";
/**
 * Planning Action Handlers
 *
 * Implements actions for Project Planning phase - epics and tickets.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateProjectTimeline = exports.validateTickets = exports.generateTickets = exports.reviewEpics = exports.generateEpics = void 0;
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const child_process_1 = require("child_process");
const ROOT_DIR = path_1.default.resolve(__dirname, '../../../..');
const PROJECT_MGMT_DIR = path_1.default.join(ROOT_DIR, 'project-management');
const WEB_APP_PM_DIR = path_1.default.join(ROOT_DIR, 'web-applications', 'project-management');
// EPICS should live under web-applications/project-management/epics
const EPICS_DIR = path_1.default.join(WEB_APP_PM_DIR, 'epics');
/**
 * Generate epics from requirements
 */
const generateEpics = async (context) => {
    console.log('  Generating epics from requirements...');
    const epicsSummaryPath = path_1.default.join(EPICS_DIR, 'README.md');
    const epicBacklogsPath = path_1.default.join(WEB_APP_PM_DIR, 'epic_backlogs.md');
    // If epics README already exists, assume epics are generated
    if (await fs_extra_1.default.pathExists(epicsSummaryPath)) {
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
    if (!await fs_extra_1.default.pathExists(epicBacklogsPath)) {
        const visionPath = path_1.default.join(WEB_APP_PM_DIR, 'vision.md');
        const prdPath = path_1.default.join(WEB_APP_PM_DIR, 'PRD.md');
        const architecturePath = path_1.default.join(WEB_APP_PM_DIR, 'architecture.md');
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
    const content = await fs_extra_1.default.readFile(epicBacklogsPath, 'utf-8');
    const lines = content.split('\n');
    const epics = [];
    let currentEpic = null;
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
        const epicDir = path_1.default.join(EPICS_DIR, epic.id);
        if (await fs_extra_1.default.pathExists(epicDir))
            continue;
        hasCreatedFolders = true;
        console.log(`  Scaffolding Epic: ${epic.id} - ${epic.title}`);
        await fs_extra_1.default.ensureDir(epicDir);
        // Epic level files
        await fs_extra_1.default.writeFile(path_1.default.join(epicDir, 'README.md'), `# ${epic.id}: ${epic.title}\n\n**Goal**: ${epic.description}\n\n## Tickets\n${epic.tickets.map(t => `- ${t.id}: ${t.title}`).join('\n')}\n`);
        await fs_extra_1.default.writeFile(path_1.default.join(epicDir, 'metadata.json'), JSON.stringify({ id: epic.id, title: epic.title, status: 'planned' }, null, 2));
        await fs_extra_1.default.writeFile(path_1.default.join(epicDir, 'gap_analysis.md'), `# ${epic.id}: Gap Analysis\n\n*(To be filled during epic validation)*\n`);
        await fs_extra_1.default.writeFile(path_1.default.join(epicDir, 'threat_model.md'), `# ${epic.id}: Threat Model\n\n*(To be filled during epic hardening)*\n`);
        await fs_extra_1.default.writeFile(path_1.default.join(epicDir, 'release.md'), `# ${epic.id}: Release Notes\n\n*(To be filled at the end of epic)*\n`);
        // Ticket folders
        const ticketsDir = path_1.default.join(epicDir, 'tickets');
        await fs_extra_1.default.ensureDir(ticketsDir);
        for (const ticket of epic.tickets) {
            const ticketDir = path_1.default.join(ticketsDir, ticket.id);
            await fs_extra_1.default.ensureDir(ticketDir);
            await fs_extra_1.default.writeFile(path_1.default.join(ticketDir, 'README.md'), `# ${ticket.id}: ${ticket.title}\n\n**Epic**: ${epic.id}\n`);
            await fs_extra_1.default.writeFile(path_1.default.join(ticketDir, 'metadata.json'), JSON.stringify({
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
            const reqDir = path_1.default.join(ticketDir, 'requirements');
            const desDir = path_1.default.join(ticketDir, 'design');
            const planDir = path_1.default.join(ticketDir, 'planning');
            const testDir = path_1.default.join(ticketDir, 'testing');
            await fs_extra_1.default.ensureDir(reqDir);
            await fs_extra_1.default.ensureDir(desDir);
            await fs_extra_1.default.ensureDir(planDir);
            await fs_extra_1.default.ensureDir(testDir);
            if (!await fs_extra_1.default.pathExists(path_1.default.join(reqDir, 'README.md'))) {
                await fs_extra_1.default.writeFile(path_1.default.join(reqDir, 'README.md'), `# ${ticket.id} Requirements\n\n*(To be filled by the agent)*\n`);
            }
            if (!await fs_extra_1.default.pathExists(path_1.default.join(desDir, 'README.md'))) {
                await fs_extra_1.default.writeFile(path_1.default.join(desDir, 'README.md'), `# ${ticket.id} Design\n\n*(To be filled by the agent)*\n`);
            }
            if (!await fs_extra_1.default.pathExists(path_1.default.join(planDir, 'README.md'))) {
                await fs_extra_1.default.writeFile(path_1.default.join(planDir, 'README.md'), `# ${ticket.id} Planning\n\n*(To be filled by the agent)*\n`);
            }
            if (!await fs_extra_1.default.pathExists(path_1.default.join(testDir, 'README.md'))) {
                await fs_extra_1.default.writeFile(path_1.default.join(testDir, 'README.md'), `# ${ticket.id} Testing\n\n*(To be filled by the agent)*\n`);
            }
        }
    }
    // Generate the main EPICS_DIR/README.md summary
    if (!await fs_extra_1.default.pathExists(epicsSummaryPath)) {
        const summaryMd = `# Epics Summary\n\n${epics.map(e => `## ${e.id}: ${e.title}\n- **Goal**: ${e.description}\n- **Tickets**: ${e.tickets.length}`).join('\n\n')}`;
        await fs_extra_1.default.writeFile(epicsSummaryPath, summaryMd);
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
exports.generateEpics = generateEpics;
console.log('  Generating epics from requirements...');
const epicsSummaryPath = path_1.default.join(EPICS_DIR, 'README.md');
/**
 * Review epics (user input required)
 */
const reviewEpics = async (context) => {
    console.log('  Waiting for epic review...');
    const epicsSummaryPath = path_1.default.join(EPICS_DIR, 'README.md');
    const approvalPath = path_1.default.join(WEB_APP_PM_DIR, 'epic_approval.json');
    if (!await fs_extra_1.default.pathExists(epicsSummaryPath)) {
        return {
            success: false,
            error: 'Epics documentation not found. Run generate_epics first.',
            data: { exists: false }
        };
    }
    // Check for specialized approval file
    if (await fs_extra_1.default.pathExists(approvalPath)) {
        try {
            const approval = await fs_extra_1.default.readJson(approvalPath);
            if (approval.approved === true) {
                return {
                    success: true,
                    data: { approved: true, approved_by: approval.approved_by },
                    logs: ['✓ Epics approved by user. Proceeding to ticket generation.']
                };
            }
        }
        catch (e) {
            console.warn('  Warning: Failed to parse epic_approval.json');
        }
    }
    // Try to list epics for the prompt
    const epics = (await fs_extra_1.default.readdir(EPICS_DIR)).filter(n => n.startsWith('EPIC-'));
    // Initialize approval file if missing
    if (!await fs_extra_1.default.pathExists(approvalPath)) {
        const initialApproval = {
            approved: false,
            approved_by: null,
            epics: {}
        };
        for (const epicId of epics) {
            initialApproval.epics[epicId] = false;
        }
        await fs_extra_1.default.writeJson(approvalPath, initialApproval, { spaces: 2 });
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
exports.reviewEpics = reviewEpics;
/**
 * Run decision gate for a ticket to determine Track A vs Track B
 */
const runDecisionGate = async (ticketTitle) => {
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
const generateTickets = async (context) => {
    console.log('  Generating tickets from epics...');
    // If backlog.md exists, prefer generating tickets from backlog sections
    const backlogPath = path_1.default.join(WEB_APP_PM_DIR, 'backlog', 'backlog.md');
    const parseBacklog = async (filePath) => {
        if (!await fs_extra_1.default.pathExists(filePath))
            return [];
        const text = await fs_extra_1.default.readFile(filePath, 'utf8');
        const lines = text.split(/\r?\n/);
        const entries = [];
        let currentSection = null;
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
                    if (item)
                        entries.push(item);
                }
            }
        }
        return entries;
    };
    let tickets = [];
    let totalBacklogTickets = 0;
    const backlogLogs = [];
    const backlogEntries = await parseBacklog(backlogPath);
    if (backlogEntries.length > 0) {
        console.log('  Generating backlog tickets:', backlogEntries.length);
        // Generate tickets for backlog
        const pythonCmd = 'python';
        const script = path_1.default.join(ROOT_DIR, '.agent', 'generate_tickets.py');
        const args = [script, '--epic', 'backlog', '--source', 'backlog'];
        const proc = (0, child_process_1.spawnSync)(pythonCmd, args, { cwd: ROOT_DIR, encoding: 'utf8' });
        if (proc.error || proc.status !== 0) {
            return {
                success: false,
                error: 'Python ticket generator failed for backlog',
                data: { stdout: proc.stdout, stderr: proc.stderr }
            };
        }
        const backlogTicketsDir = path_1.default.join(EPICS_DIR, 'backlog', 'tickets');
        if (await fs_extra_1.default.pathExists(backlogTicketsDir)) {
            const ticketDirs = await fs_extra_1.default.readdir(backlogTicketsDir);
            for (const ticketDir of ticketDirs) {
                const ticketPath = path_1.default.join(backlogTicketsDir, ticketDir);
                if (!(await fs_extra_1.default.stat(ticketPath)).isDirectory())
                    continue;
                const metadataPath = path_1.default.join(ticketPath, 'metadata.json');
                if (await fs_extra_1.default.pathExists(metadataPath)) {
                    const metadata = await fs_extra_1.default.readJson(metadataPath);
                    const track = await runDecisionGate(metadata.title);
                    const decisionContent = `# Track Decision for ${metadata.ticket_id}\n\n**Decision**: ${track}\n\n**Reasoning**: Automated decision based on ticket title analysis\n\n**Date**: ${new Date().toISOString().split('T')[0]}\n**Decided by**: Bob Framework Decision Gate\n\n---\n*This decision was made automatically using the WORKFLOW_DECISION_GATE.md criteria*\n`;
                    await fs_extra_1.default.writeFile(path_1.default.join(ticketPath, 'TRACK_DECISION.md'), decisionContent, 'utf8');
                }
            }
            const existingTickets = await fs_extra_1.default.readdir(backlogTicketsDir);
            totalBacklogTickets = existingTickets.filter(f => fs_extra_1.default.statSync(path_1.default.join(backlogTicketsDir, f)).isDirectory()).length;
            backlogLogs.push(`Found ${totalBacklogTickets} existing tickets in backlog.`);
        }
    }
    // 1. Scan for epic folders
    const epicDirs = (await fs_extra_1.default.readdir(EPICS_DIR).catch(() => [])).filter(name => {
        const p = path_1.default.join(EPICS_DIR, name);
        try {
            return fs_extra_1.default.statSync(p).isDirectory() && name !== 'epic_template' && name !== 'backlog';
        }
        catch {
            return false;
        }
    });
    const epicsWithMissingTickets = [];
    const epicsWithTickets = [];
    let epicTicketCount = 0;
    for (const epicName of epicDirs) {
        const ticketsDir = path_1.default.join(EPICS_DIR, epicName, 'tickets');
        if (!await fs_extra_1.default.pathExists(ticketsDir)) {
            epicsWithMissingTickets.push(epicName);
            continue;
        }
        const files = await fs_extra_1.default.readdir(ticketsDir).catch(() => []);
        const ticketDirs = files.filter(f => fs_extra_1.default.statSync(path_1.default.join(ticketsDir, f)).isDirectory());
        if (ticketDirs.length === 0) {
            epicsWithMissingTickets.push(epicName);
            continue;
        }
        // We have ticket directories! We should invoke our scaffolder.
        const ticketsToScaffold = [];
        for (const ticketDir of ticketDirs) {
            const metadataPath = path_1.default.join(ticketsDir, ticketDir, 'metadata.json');
            if (await fs_extra_1.default.pathExists(metadataPath)) {
                const metadata = await fs_extra_1.default.readJson(metadataPath);
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
            const script = path_1.default.join(ROOT_DIR, '.agent', 'generate_tickets.py');
            const args = [script, '--epic', epicName, '--source', 'epic', '--tickets', ...ticketsToScaffold];
            const proc = (0, child_process_1.spawnSync)(pythonCmd, args, { cwd: ROOT_DIR, encoding: 'utf8' });
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
exports.generateTickets = generateTickets;
/**
 * Validate tickets
 */
const validateTickets = async (context) => {
    console.log('  Validating tickets...');
    const results = [];
    try {
        const epics = await fs_extra_1.default.readdir(EPICS_DIR);
        for (const epic of epics) {
            const epicPath = path_1.default.join(EPICS_DIR, epic);
            const stat = await fs_extra_1.default.stat(epicPath);
            if (!stat.isDirectory() || epic === 'epic_template')
                continue;
            const ticketsDir = path_1.default.join(epicPath, 'tickets');
            if (!await fs_extra_1.default.pathExists(ticketsDir))
                continue;
            const tickets = await fs_extra_1.default.readdir(ticketsDir);
            const ticketFiles = tickets.filter(f => f.endsWith('.json'));
            for (const ticketFile of ticketFiles) {
                try {
                    const ticketPath = path_1.default.join(ticketsDir, ticketFile);
                    const metadata = await fs_extra_1.default.readJson(ticketPath);
                    const issues = [];
                    if (!metadata.title)
                        issues.push('Missing title');
                    if (!metadata.epic)
                        issues.push('Missing epic');
                    if (!metadata.type)
                        issues.push('Missing type');
                    if (!metadata.priority)
                        issues.push('Missing priority');
                    results.push({
                        ticket: metadata.id || ticketFile,
                        valid: issues.length === 0,
                        issues: issues.length > 0 ? issues : undefined
                    });
                }
                catch (error) {
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
    }
    catch (error) {
        return {
            success: false,
            error: `Validation failed: ${error.message}`
        };
    }
};
exports.validateTickets = validateTickets;
/**
 * Generate project timeline
 */
const generateProjectTimeline = async (context) => {
    console.log('  Generating project timeline...');
    const timelinePath = path_1.default.join(WEB_APP_PM_DIR, 'timeline.md');
    const epicsSummaryPath = path_1.default.join(EPICS_DIR, 'README.md');
    const prdPath = path_1.default.join(WEB_APP_PM_DIR, 'PRD.md');
    // If timeline.md already exists, skip AI prompt and proceed
    if (await fs_extra_1.default.pathExists(timelinePath)) {
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
exports.generateProjectTimeline = generateProjectTimeline;
