import fs from 'fs-extra';
import path from 'path';
import { StateManager } from './state_manager';

const PROJECT_ROOT = path.resolve(__dirname, '../../');
const DASHBOARD_FILE = path.join(PROJECT_ROOT, 'web-applications/project-management/DASHBOARD.md');
const EPICS_DIR = path.join(PROJECT_ROOT, 'web-applications/project-management/epics');

export class DashboardManager {
    /**
     * Synchronizes the project dashboard by scanning all epics and tickets.
     */
    static async sync(): Promise<void> {
        if (!await fs.pathExists(EPICS_DIR)) return;

        const epicStats: Record<string, { name: string, total: number, done: number }> = {};
        const epics = await fs.readdir(EPICS_DIR);

        for (const epic of epics) {
            if (!epic.toLowerCase().startsWith('epic-')) continue;
            
            const epicPath = path.join(EPICS_DIR, epic);
            const stat = await fs.stat(epicPath);
            if (!stat.isDirectory()) continue;

            const name = epic.split('-').slice(2).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') || 'General';
            epicStats[epic] = { name, total: 0, done: 0 };

            const ticketsDir = path.join(epicPath, 'tickets');
            if (await fs.pathExists(ticketsDir)) {
                const tickets = await fs.readdir(ticketsDir);
                for (const ticketId of tickets) {
                    const metaPath = path.join(ticketsDir, ticketId, 'metadata.json');
                    if (await fs.pathExists(metaPath)) {
                        try {
                            const data = await fs.readJson(metaPath);
                            const status = (data.status || '').toLowerCase();
                            epicStats[epic].total++;
                            if (status === 'done' || status === 'approved' || status === 'completed') {
                                epicStats[epic].done++;
                            }
                        } catch (e) {
                            // Skip malformed JSON
                        }
                    }
                }
            }
        }

        const today = new Date().toISOString().split('T')[0];
        let md = `# 📊 Project Dashboard\n\n`;
        md += `> **Last Updated:** ${today}\n`;
        md += `> **Status:** Event-Driven Sync Active ⚡\n\n`;
        md += `---\n\n## 🛠️ Epic Status Overview\n\n`;
        md += `| Epic | Objective Area | Total Tickets | Verified | Progress Bar |\n`;
        md += `| :--- | :--- | :--- | :--- | :--- |\n`;

        for (const [epicId, stats] of Object.entries(epicStats).sort()) {
            const pct = stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0;
            const filled = Math.floor(pct / 10);
            const bar = `\`[${'#'.repeat(filled)}${'-'.repeat(10 - filled)}] ${pct}%\``;
            md += `| **${epicId.split('-')[1]}** | ${stats.name} | ${stats.total} | ${stats.done} | ${bar} |\n`;
        }

        md += `\n---\n\n## 🛡️ Verification Gate Health\n\n`;
        md += `- **Layer 1 (Ticket Gates):** Operational. The AI must score ≥ 80% on \`verification-gate.md\` to pass.\n`;
        
        const completed = Object.entries(epicStats)
            .filter(([_, stats]) => stats.total > 0 && stats.total === stats.done)
            .map(([id, _]) => id.split('-')[1]);

        if (completed.length > 0) {
            md += `- **Layer 2 (Epic Gating):** **Epics ${completed.join(', ')}** are 100% complete and ready for hardening.\n`;
        } else {
            md += `- **Layer 2 (Epic Gating):** No epics are 100% complete yet.\n`;
        }
        
        md += `- **Layer 3 (PI Manifest):** Monitoring active PI release cycles.\n`;

        await fs.writeFile(DASHBOARD_FILE, md, 'utf-8');
        console.log(`[Dashboard] Sync complete: ${DASHBOARD_FILE}`);
    }
}
