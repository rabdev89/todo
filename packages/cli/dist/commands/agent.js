"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerAgentCommand = registerAgentCommand;
const chalk_1 = __importDefault(require("chalk"));
const inquirer_1 = __importDefault(require("inquirer"));
const AgentManager_1 = require("../lib/AgentManager");
const ClaudeCodeAdapter_1 = require("../lib/adapters/ClaudeCodeAdapter");
const AgentAdapter_1 = require("../lib/adapters/AgentAdapter");
const TerminalFocusManager_1 = require("../lib/TerminalFocusManager");
const terminal_ui_1 = require("../util/terminal-ui");
function registerAgentCommand(program) {
    const agentCommand = program
        .command('agent')
        .description('Manage AI Agents');
    agentCommand
        .command('list')
        .description('List all running AI agents')
        .option('-j, --json', 'Output as JSON')
        .action(async (options) => {
        try {
            const manager = new AgentManager_1.AgentManager();
            // Register adapters
            // In the future, we might load these dynamically or based on config
            manager.registerAdapter(new ClaudeCodeAdapter_1.ClaudeCodeAdapter());
            const agents = await manager.listAgents();
            if (options.json) {
                console.log(JSON.stringify(agents, null, 2));
                return;
            }
            if (agents.length === 0) {
                terminal_ui_1.ui.info('No running agents detected.');
                return;
            }
            terminal_ui_1.ui.text('Running Agents:', { breakline: true });
            const rows = agents.map(agent => [
                agent.name,
                agent.statusDisplay,
                agent.summary || 'No active task',
                agent.lastActiveDisplay
            ]);
            terminal_ui_1.ui.table({
                headers: ['Agent', 'Status', 'Working On', 'Active'],
                rows: rows,
                // Custom column styling
                // 0: Name (cyan)
                // 1: Status (dynamic based on content)
                // 2: Working On (standard)
                // 3: Active (dim)
                columnStyles: [
                    (text) => chalk_1.default.cyan(text),
                    (text) => {
                        // Extract status keyword to determine color
                        if (text.includes(AgentAdapter_1.STATUS_CONFIG[AgentAdapter_1.AgentStatus.RUNNING].label))
                            return chalk_1.default.green(text);
                        if (text.includes(AgentAdapter_1.STATUS_CONFIG[AgentAdapter_1.AgentStatus.WAITING].label))
                            return chalk_1.default.yellow(text);
                        if (text.includes(AgentAdapter_1.STATUS_CONFIG[AgentAdapter_1.AgentStatus.IDLE].label))
                            return chalk_1.default.dim(text);
                        return chalk_1.default.gray(text);
                    },
                    (text) => text,
                    (text) => chalk_1.default.dim(text)
                ]
            });
            // Add summary footer if there are waiting agents
            const waitingCount = agents.filter(a => a.status === AgentAdapter_1.AgentStatus.WAITING).length;
            if (waitingCount > 0) {
                terminal_ui_1.ui.breakline();
                terminal_ui_1.ui.warning(`${waitingCount} agent(s) waiting for input.`);
            }
        }
        catch (error) {
            terminal_ui_1.ui.error(`Failed to list agents: ${error.message}`);
            process.exit(1);
        }
    });
    agentCommand
        .command('open <name>')
        .description('Focus a running agent terminal')
        .action(async (name) => {
        try {
            const manager = new AgentManager_1.AgentManager();
            const focusManager = new TerminalFocusManager_1.TerminalFocusManager();
            manager.registerAdapter(new ClaudeCodeAdapter_1.ClaudeCodeAdapter());
            const agents = await manager.listAgents();
            if (agents.length === 0) {
                terminal_ui_1.ui.error('No running agents found.');
                return;
            }
            const resolved = manager.resolveAgent(name, agents);
            if (!resolved) {
                terminal_ui_1.ui.error(`No agent found matching "${name}".`);
                terminal_ui_1.ui.info('Available agents:');
                agents.forEach(a => console.log(`  - ${a.name}`));
                return;
            }
            let targetAgent = resolved;
            if (Array.isArray(resolved)) {
                terminal_ui_1.ui.warning(`Multiple agents match "${name}":`);
                const { selectedAgent } = await inquirer_1.default.prompt([
                    {
                        type: 'list',
                        name: 'selectedAgent',
                        message: 'Select an agent to open:',
                        choices: resolved.map(a => ({
                            name: `${a.name} (${a.statusDisplay}) - ${a.summary}`,
                            value: a
                        }))
                    }
                ]);
                targetAgent = selectedAgent;
            }
            // Focus terminal
            const agent = targetAgent;
            if (!agent.pid) {
                terminal_ui_1.ui.error(`Cannot focus agent "${agent.name}" (No PID found).`);
                return;
            }
            const spinner = terminal_ui_1.ui.spinner(`Switching focus to ${agent.name}...`);
            spinner.start();
            const location = await focusManager.findTerminal(agent.pid);
            if (!location) {
                spinner.fail(`Could not find terminal window for agent "${agent.name}" (PID: ${agent.pid}).`);
                return;
            }
            const success = await focusManager.focusTerminal(location);
            if (success) {
                spinner.succeed(`Focused ${agent.name}!`);
            }
            else {
                spinner.fail(`Failed to switch focus to ${agent.name}.`);
            }
        }
        catch (error) {
            terminal_ui_1.ui.error(`Failed to open agent: ${error.message}`);
            process.exit(1);
        }
    });
}
//# sourceMappingURL=agent.js.map