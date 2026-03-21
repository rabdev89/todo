"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerMemoryCommand = registerMemoryCommand;
const memory_1 = require("@ai-devkit/memory");
const terminal_ui_1 = require("../util/terminal-ui");
function registerMemoryCommand(program) {
    const memoryCommand = program
        .command('memory')
        .description('Interact with the knowledge memory service');
    memoryCommand
        .command('store')
        .description('Store a new knowledge item')
        .requiredOption('-t, --title <title>', 'Title of the knowledge item (10-100 chars)')
        .requiredOption('-c, --content <content>', 'Content of the knowledge item (50-5000 chars)')
        .option('--tags <tags>', 'Comma-separated tags (e.g., "api,backend")')
        .option('-s, --scope <scope>', 'Scope: global, project:<name>, or repo:<name>', 'global')
        .action((options) => {
        try {
            const result = (0, memory_1.memoryStoreCommand)(options);
            console.log(JSON.stringify(result, null, 2));
        }
        catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            terminal_ui_1.ui.error(message);
            process.exit(1);
        }
    });
    memoryCommand
        .command('search')
        .description('Search for knowledge items')
        .requiredOption('-q, --query <query>', 'Search query (3-500 chars)')
        .option('--tags <tags>', 'Comma-separated context tags to boost results')
        .option('-s, --scope <scope>', 'Scope filter')
        .option('-l, --limit <limit>', 'Maximum results (1-20)', '5')
        .action((options) => {
        try {
            const result = (0, memory_1.memorySearchCommand)({
                ...options,
                limit: options.limit ? parseInt(options.limit, 10) : 5
            });
            console.log(JSON.stringify(result, null, 2));
        }
        catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            terminal_ui_1.ui.error(message);
            process.exit(1);
        }
    });
    memoryCommand
        .command('seed')
        .description('Bulk import knowledge entries from a JSON file')
        .argument('<file>', 'Path to the seed JSON file')
        .action((file) => {
        try {
            const result = (0, memory_1.memorySeedCommand)({ filePath: file });
            if (result.success) {
                terminal_ui_1.ui.success(`Successfully imported ${result.imported}/${result.total} entries.`);
            }
            else {
                terminal_ui_1.ui.error(`Seeding failed. ${result.imported}/${result.total} entries imported.`);
            }
            if (result.errors.length > 0) {
                console.log('\nErrors:');
                result.errors.forEach((err) => console.log(`- ${err}`));
            }
        }
        catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            terminal_ui_1.ui.error(message);
            process.exit(1);
        }
    });
}
//# sourceMappingURL=memory.js.map