#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const init_1 = require("./commands/init");
const phase_1 = require("./commands/phase");
const setup_1 = require("./commands/setup");
const memory_1 = require("./commands/memory");
const skill_1 = require("./commands/skill");
const agent_1 = require("./commands/agent");
const program = new commander_1.Command();
program
    .name('ai-devkit')
    .description('AI-assisted software development toolkit')
    .version('0.1.0');
program
    .command('init')
    .description('Initialize AI DevKit in the current directory')
    .option('-e, --environment <env>', 'Development environment (cursor|claude|both)')
    .option('-a, --all', 'Initialize all phases')
    .option('-p, --phases <phases>', 'Comma-separated list of phases to initialize')
    .action(init_1.initCommand);
program
    .command('phase [name]')
    .description('Add a specific phase template (requirements|design|planning|implementation|testing|deployment|monitoring)')
    .action(phase_1.phaseCommand);
program
    .command('setup')
    .description('Set up AI DevKit commands globally')
    .option('-g, --global', 'Install commands to global environment folders')
    .action(setup_1.setupCommand);
(0, memory_1.registerMemoryCommand)(program);
(0, skill_1.registerSkillCommand)(program);
(0, agent_1.registerAgentCommand)(program);
program.parse();
//# sourceMappingURL=cli.js.map