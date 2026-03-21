"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardManager = void 0;
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const PROJECT_ROOT = path_1.default.resolve(__dirname, '../../');
const DASHBOARD_FILE = path_1.default.join(PROJECT_ROOT, 'web-applications/project-management/DASHBOARD.md');
const EPICS_DIR = path_1.default.join(PROJECT_ROOT, 'web-applications/project-management/epics');
class DashboardManager {
    /**
     * Synchronizes the project dashboard by scanning all epics and tickets.
     */
    static async sync() {
        if (!await fs_extra_1.default.pathExists(EPICS_DIR))
            return;
        const epicStats = {};
        const epics = await fs_extra_1.default.readdir(EPICS_DIR);
        for (const epic of epics) {
            if (!epic.toLowerCase().startsWith('epic-'))
                continue;
            const epicPath = path_1.default.join(EPICS_DIR, epic);
            const stat = await fs_extra_1.default.stat(epicPath);
            if (!stat.isDirectory())
                continue;
            const name = epic.split('-').slice(2).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') || 'General';
            epicStats[epic] = { name, total: 0, done: 0 };
            const ticketsDir = path_1.default.join(epicPath, 'tickets');
            if (await fs_extra_1.default.pathExists(ticketsDir)) {
                const tickets = await fs_extra_1.default.readdir(ticketsDir);
                for (const ticketId of tickets) {
                    const metaPath = path_1.default.join(ticketsDir, ticketId, 'metadata.json');
                    if (await fs_extra_1.default.pathExists(metaPath)) {
                        try {
                            const data = await fs_extra_1.default.readJson(metaPath);
                            const status = (data.status || '').toLowerCase();
                            epicStats[epic].total++;
                            if (status === 'done' || status === 'approved' || status === 'completed') {
                                epicStats[epic].done++;
                            }
                        }
                        catch (e) {
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
        }
        else {
            md += `- **Layer 2 (Epic Gating):** No epics are 100% complete yet.\n`;
        }
        md += `- **Layer 3 (PI Manifest):** Monitoring active PI release cycles.\n`;
        await fs_extra_1.default.writeFile(DASHBOARD_FILE, md, 'utf-8');
        console.log(`[Dashboard] Sync complete: ${DASHBOARD_FILE}`);
    }
}
exports.DashboardManager = DashboardManager;
