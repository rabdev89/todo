"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerSkillCommand = registerSkillCommand;
const chalk_1 = __importDefault(require("chalk"));
const Config_1 = require("../lib/Config");
const SkillManager_1 = require("../lib/SkillManager");
const terminal_ui_1 = require("../util/terminal-ui");
function registerSkillCommand(program) {
    const skillCommand = program
        .command('skill')
        .description('Manage Agent Skills');
    skillCommand
        .command('add <registry-repo> <skill-name>')
        .description('Install a skill from a registry (e.g., ai-devkit skill add anthropics/skills frontend-design)')
        .action(async (registryRepo, skillName) => {
        try {
            const configManager = new Config_1.ConfigManager();
            const skillManager = new SkillManager_1.SkillManager(configManager);
            await skillManager.addSkill(registryRepo, skillName);
        }
        catch (error) {
            terminal_ui_1.ui.error(`Failed to add skill: ${error.message}`);
            process.exit(1);
        }
    });
    skillCommand
        .command('list')
        .description('List all installed skills in the current project')
        .action(async () => {
        try {
            const configManager = new Config_1.ConfigManager();
            const skillManager = new SkillManager_1.SkillManager(configManager);
            const skills = await skillManager.listSkills();
            if (skills.length === 0) {
                terminal_ui_1.ui.warning('No skills installed in this project.');
                terminal_ui_1.ui.info('Install a skill with: ai-devkit skill add <registry>/<repo> <skill-name>');
                return;
            }
            terminal_ui_1.ui.text('Installed Skills:', { breakline: true });
            terminal_ui_1.ui.table({
                headers: ['Skill Name', 'Registry', 'Environments'],
                rows: skills.map(skill => [
                    skill.name,
                    skill.registry,
                    skill.environments.join(', ')
                ]),
                columnStyles: [chalk_1.default.cyan, chalk_1.default.dim, chalk_1.default.green]
            });
            terminal_ui_1.ui.text(`Total: ${skills.length} skill(s)`, { breakline: true });
        }
        catch (error) {
            terminal_ui_1.ui.error(`Failed to list skills: ${error.message}`);
            process.exit(1);
        }
    });
    skillCommand
        .command('remove <skill-name>')
        .description('Remove a skill from the current project')
        .action(async (skillName) => {
        try {
            const configManager = new Config_1.ConfigManager();
            const skillManager = new SkillManager_1.SkillManager(configManager);
            await skillManager.removeSkill(skillName);
        }
        catch (error) {
            terminal_ui_1.ui.error(`Failed to remove skill: ${error.message}`);
            process.exit(1);
        }
    });
    skillCommand
        .command('update [registry-id]')
        .description('Update skills from registries (e.g., ai-devkit skill update or ai-devkit skill update anthropic/skills)')
        .action(async (registryId) => {
        try {
            const configManager = new Config_1.ConfigManager();
            const skillManager = new SkillManager_1.SkillManager(configManager);
            await skillManager.updateSkills(registryId);
        }
        catch (error) {
            terminal_ui_1.ui.error(`Failed to update skills: ${error.message}`);
            process.exit(1);
        }
    });
    skillCommand
        .command('find <keyword>')
        .description('Search for skills across all registries')
        .option('--refresh', 'Force rebuild the skill index')
        .action(async (keyword, options) => {
        try {
            const configManager = new Config_1.ConfigManager();
            const skillManager = new SkillManager_1.SkillManager(configManager);
            const results = await skillManager.findSkills(keyword, { refresh: options.refresh });
            if (results.length === 0) {
                terminal_ui_1.ui.warning(`No skills found matching "${keyword}"`);
                terminal_ui_1.ui.info('Try a different keyword or use --refresh to update the skill index');
                return;
            }
            terminal_ui_1.ui.text(`Found ${results.length} skill(s) matching "${keyword}":`, { breakline: true });
            terminal_ui_1.ui.table({
                headers: ['Skill Name', 'Registry', 'Description'],
                rows: results.map(skill => [
                    skill.name,
                    skill.registry,
                    skill.description.length > 60 ? skill.description.substring(0, 57) + '...' : skill.description
                ]),
                columnStyles: [chalk_1.default.cyan, chalk_1.default.dim, chalk_1.default.white]
            });
            terminal_ui_1.ui.text(`\nInstall with: ai-devkit skill add <registry> <skill-name>`, { breakline: true });
        }
        catch (error) {
            terminal_ui_1.ui.error(`Failed to search skills: ${error.message}`);
            process.exit(1);
        }
    });
    skillCommand
        .command('rebuild-index')
        .description('Rebuild the skill index from all registries (for CI use)')
        .option('--output <path>', 'Output path for the index file')
        .action(async (options) => {
        try {
            const configManager = new Config_1.ConfigManager();
            const skillManager = new SkillManager_1.SkillManager(configManager);
            await skillManager.rebuildIndex(options.output);
        }
        catch (error) {
            terminal_ui_1.ui.error(`Failed to rebuild index: ${error.message}`);
            process.exit(1);
        }
    });
}
//# sourceMappingURL=skill.js.map