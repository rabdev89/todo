"use strict";
/**
 * Claude Code Adapter
 *
 * Detects running Claude Code agents by reading session files
 * from ~/.claude/ directory and correlating with running processes.
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClaudeCodeAdapter = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const AgentAdapter_1 = require("./AgentAdapter");
const process_1 = require("../../util/process");
const file_1 = require("../../util/file");
/**
 * Claude Code Adapter
 *
 * Detects Claude Code agents by:
 * 1. Finding running claude processes
 * 2. Reading session files from ~/.claude/projects/
 * 3. Matching sessions to processes via CWD
 * 4. Extracting status from session JSONL
 * 5. Extracting summary from history.jsonl
 */
class ClaudeCodeAdapter {
    type = 'Claude Code';
    /** Threshold in minutes before considering a session idle */
    static IDLE_THRESHOLD_MINUTES = 5;
    claudeDir;
    projectsDir;
    historyPath;
    constructor() {
        const homeDir = process.env.HOME || process.env.USERPROFILE || '';
        this.claudeDir = path.join(homeDir, '.claude');
        this.projectsDir = path.join(this.claudeDir, 'projects');
        this.historyPath = path.join(this.claudeDir, 'history.jsonl');
    }
    /**
     * Check if this adapter can handle a given process
     */
    canHandle(processInfo) {
        return processInfo.command.toLowerCase().includes('claude');
    }
    /**
     * Detect running Claude Code agents
     */
    async detectAgents() {
        // 1. Find running claude processes
        const claudeProcesses = (0, process_1.listProcesses)({ namePattern: 'claude' });
        if (claudeProcesses.length === 0) {
            return [];
        }
        // 2. Read all sessions
        const sessions = this.readSessions();
        // 3. Read history for summaries
        const history = this.readHistory();
        // 4. Group processes by CWD
        const processesByCwd = new Map();
        for (const p of claudeProcesses) {
            const list = processesByCwd.get(p.cwd) || [];
            list.push(p);
            processesByCwd.set(p.cwd, list);
        }
        // 5. Match sessions to processes
        const agents = [];
        for (const [cwd, processes] of processesByCwd) {
            // Find sessions for this project path
            const projectSessions = sessions.filter(s => s.projectPath === cwd);
            if (projectSessions.length === 0) {
                continue;
            }
            // Sort sessions by last active time (newest first)
            projectSessions.sort((a, b) => {
                const timeA = a.lastActive?.getTime() || 0;
                const timeB = b.lastActive?.getTime() || 0;
                return timeB - timeA;
            });
            // Map processes to the most recent sessions
            // If there are 2 processes, we take the 2 most recent sessions
            const activeSessions = projectSessions.slice(0, processes.length);
            for (let i = 0; i < activeSessions.length; i++) {
                const session = activeSessions[i];
                const process = processes[i]; // Assign process to session (arbitrary 1-to-1 mapping)
                const historyEntry = [...history].reverse().find(h => h.sessionId === session.sessionId);
                const summary = historyEntry?.display || 'Session started';
                const status = this.determineStatus(session);
                const agentName = this.generateAgentName(session, agents); // Pass currently built agents for collision checks
                // Get status display config
                const statusConfig = AgentAdapter_1.STATUS_CONFIG[status] || AgentAdapter_1.STATUS_CONFIG[AgentAdapter_1.AgentStatus.UNKNOWN];
                const statusDisplay = `${statusConfig.emoji} ${statusConfig.label}`;
                const lastActiveDisplay = this.getRelativeTime(session.lastActive || new Date());
                agents.push({
                    name: agentName,
                    type: this.type,
                    status,
                    statusDisplay,
                    summary: this.truncateSummary(summary),
                    pid: process.pid,
                    projectPath: session.projectPath,
                    sessionId: session.sessionId,
                    slug: session.slug,
                    lastActive: session.lastActive || new Date(),
                    lastActiveDisplay,
                });
            }
        }
        return agents;
    }
    /**
     * Read all Claude Code sessions
     */
    readSessions() {
        if (!fs.existsSync(this.projectsDir)) {
            return [];
        }
        const sessions = [];
        const projectDirs = fs.readdirSync(this.projectsDir);
        for (const dirName of projectDirs) {
            if (dirName.startsWith('.')) {
                continue;
            }
            const projectDir = path.join(this.projectsDir, dirName);
            if (!fs.statSync(projectDir).isDirectory()) {
                continue;
            }
            // Read sessions-index.json to get original project path
            const indexPath = path.join(projectDir, 'sessions-index.json');
            if (!fs.existsSync(indexPath)) {
                continue;
            }
            const sessionsIndex = (0, file_1.readJson)(indexPath);
            if (!sessionsIndex) {
                console.error(`Failed to parse ${indexPath}`);
                continue;
            }
            const sessionFiles = fs.readdirSync(projectDir).filter(f => f.endsWith('.jsonl'));
            for (const sessionFile of sessionFiles) {
                const sessionId = sessionFile.replace('.jsonl', '');
                const sessionLogPath = path.join(projectDir, sessionFile);
                try {
                    const sessionData = this.readSessionLog(sessionLogPath);
                    sessions.push({
                        sessionId,
                        projectPath: sessionsIndex.originalPath,
                        slug: sessionData.slug,
                        sessionLogPath,
                        lastEntry: sessionData.lastEntry,
                        lastActive: sessionData.lastActive,
                    });
                }
                catch (error) {
                    console.error(`Failed to read session ${sessionId}:`, error);
                    continue;
                }
            }
        }
        return sessions;
    }
    /**
     * Read a session JSONL file
     * Only reads last 100 lines for performance with large files
     */
    readSessionLog(logPath) {
        const lines = (0, file_1.readLastLines)(logPath, 100);
        let slug;
        let lastEntry;
        let lastActive;
        for (const line of lines) {
            try {
                const entry = JSON.parse(line);
                if (entry.slug && !slug) {
                    slug = entry.slug;
                }
                lastEntry = entry;
                if (entry.timestamp) {
                    lastActive = new Date(entry.timestamp);
                }
            }
            catch (error) {
                continue;
            }
        }
        return { slug, lastEntry, lastActive };
    }
    /**
     * Read history.jsonl for user prompts
     * Only reads last 100 lines for performance
     */
    readHistory() {
        return (0, file_1.readJsonLines)(this.historyPath, 100);
    }
    /**
     * Determine agent status from session entry
     */
    determineStatus(session) {
        if (!session.lastEntry) {
            return AgentAdapter_1.AgentStatus.UNKNOWN;
        }
        const entryType = session.lastEntry.type;
        const lastActive = session.lastActive || new Date(0);
        const ageMinutes = (Date.now() - lastActive.getTime()) / 1000 / 60;
        if (ageMinutes > ClaudeCodeAdapter.IDLE_THRESHOLD_MINUTES) {
            return AgentAdapter_1.AgentStatus.IDLE;
        }
        if (entryType === 'user') {
            // Check if user interrupted manually - this puts agent back in waiting state
            const content = session.lastEntry?.message?.content;
            if (Array.isArray(content)) {
                const isInterrupted = content.some((c) => (c.type === 'text' && c.text?.includes('[Request interrupted')) ||
                    (c.type === 'tool_result' && c.content?.includes('[Request interrupted')));
                if (isInterrupted)
                    return AgentAdapter_1.AgentStatus.WAITING;
            }
            return AgentAdapter_1.AgentStatus.RUNNING;
        }
        if (entryType === 'progress' || entryType === 'thinking') {
            return AgentAdapter_1.AgentStatus.RUNNING;
        }
        else if (entryType === 'assistant') {
            return AgentAdapter_1.AgentStatus.WAITING;
        }
        else if (entryType === 'system') {
            return AgentAdapter_1.AgentStatus.IDLE;
        }
        return AgentAdapter_1.AgentStatus.UNKNOWN;
    }
    /**
     * Generate unique agent name
     * Uses project basename, appends slug if multiple sessions for same project
     */
    generateAgentName(session, existingAgents) {
        const projectName = path.basename(session.projectPath);
        const sameProjectAgents = existingAgents.filter(a => a.projectPath === session.projectPath);
        if (sameProjectAgents.length === 0) {
            return projectName;
        }
        // Multiple sessions for same project, append slug
        if (session.slug) {
            // Use first word of slug for brevity (with safety check for format)
            const slugPart = session.slug.includes('-')
                ? session.slug.split('-')[0]
                : session.slug.slice(0, 8);
            return `${projectName} (${slugPart})`;
        }
        // No slug available, use session ID prefix
        return `${projectName} (${session.sessionId.slice(0, 8)})`;
    }
    /**
     * Truncate summary to ~40 characters
     */
    truncateSummary(summary, maxLength = 40) {
        if (summary.length <= maxLength) {
            return summary;
        }
        return summary.slice(0, maxLength - 3) + '...';
    }
    /**
     * Get relative time display (e.g., "2m ago", "just now")
     */
    getRelativeTime(date) {
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        if (diffMins < 1)
            return 'just now';
        if (diffMins < 60)
            return `${diffMins}m ago`;
        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24)
            return `${diffHours}h ago`;
        const diffDays = Math.floor(diffHours / 24);
        return `${diffDays}d ago`;
    }
}
exports.ClaudeCodeAdapter = ClaudeCodeAdapter;
//# sourceMappingURL=ClaudeCodeAdapter.js.map