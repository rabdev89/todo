"use strict";
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
exports.projectInitCommand = void 0;
const commander_1 = require("commander");
const fs = __importStar(require("fs-extra"));
const path = __importStar(require("path"));
const readline = __importStar(require("readline"));
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
const question = (query) => new Promise((resolve) => rl.question(query, resolve));
exports.projectInitCommand = new commander_1.Command('project-init')
    .description('Initialize or migrate a project to the BOB framework')
    .option('--type <type>', 'Project type (new, continue, migrate)', 'new')
    .action(async (options) => {
    console.log('\n🚀 BOB Project Initialization\n');
    let type = options.type;
    if (!['new', 'continue', 'migrate'].includes(type)) {
        console.log('Invalid type. Defaulting to "new".');
        type = 'new';
    }
    const projectName = await question('Project Name: ');
    const projectPath = await question('Project Path (default: ./web-applications): ') || './web-applications';
    const absolutePath = path.resolve(process.cwd(), '..', projectPath);
    console.log(`\nInitializing ${type} project: ${projectName}`);
    console.log(`Path: ${absolutePath}\n`);
    try {
        await fs.ensureDir(absolutePath);
        if (type === 'new') {
            await initNewProject(projectName, absolutePath);
        }
        else if (type === 'continue') {
            await continueExistingProject(projectName, absolutePath);
        }
        else if (type === 'migrate') {
            await migrateProject(projectName, absolutePath);
        }
        console.log('\n✅ Project initialization complete!');
        console.log(`Next steps:`);
        console.log(`1. cd ${projectPath}`);
        console.log(`2. ai-engine index-repo --parallel`);
        console.log(`3. ai-engine session start`);
    }
    catch (error) {
        console.error(`\n❌ Error during initialization: ${error.message}`);
    }
    finally {
        rl.close();
    }
});
async function initNewProject(name, targetPath) {
    console.log('Creating clean slate project structure...');
    const folders = [
        'web-applications/project-management/epics',
        'project-management/tickets',
        'project-management/design',
        'src',
        'tests',
        'docs'
    ];
    for (const folder of folders) {
        await fs.ensureDir(path.join(targetPath, folder));
    }
    // Generate tech_stack.json
    const techStack = {
        name,
        version: '0.1.0',
        framework: 'bob-optimized',
        base_stack: 'unknown',
        components: []
    };
    await fs.writeJson(path.join(targetPath, 'tech_stack.json'), techStack, { spaces: 2 });
    // Generate initial docs
    const vision = `# Project Vision: ${name}\n\n## Goals\n- [ ] Initial Goal\n\n## High Level Flow\n- Describe the flow here`;
    await fs.writeFile(path.join(targetPath, 'vision.md'), vision);
    const userFlow = `# User Flow: ${name}\n\n## Journey 1: Initial Entry\n1. User enters app\n2. User sees dashboard`;
    await fs.writeFile(path.join(targetPath, 'user_flow.md'), userFlow);
    console.log('✓ Folders created');
    console.log('✓ tech_stack.json generated');
    console.log('✓ vision.md & user_flow.md templates created');
}
async function continueExistingProject(name, targetPath) {
    console.log('Adapting existing project to BOB framework...');
    // Ensure management folders exist
    await fs.ensureDir(path.join(targetPath, 'web-applications/project-management/epics'));
    await fs.ensureDir(path.join(targetPath, 'project-management/tickets'));
    // Try to detect tech stack
    const techStack = {
        name,
        framework: 'bob-adapted',
        components: []
    };
    if (await fs.pathExists(path.join(targetPath, 'package.json'))) {
        techStack.base_stack = 'node/npm';
        const pkg = await fs.readJson(path.join(targetPath, 'package.json'));
        techStack.version = pkg.version;
    }
    else if (await fs.pathExists(path.join(targetPath, 'requirements.txt'))) {
        techStack.base_stack = 'python';
    }
    await fs.writeJson(path.join(targetPath, 'tech_stack.json'), techStack, { spaces: 2 });
    console.log('✓ Project management folders integrated');
    console.log('✓ tech_stack.json generated from detection');
}
async function migrateProject(name, targetPath) {
    console.log('Migrating from legacy framework version...');
    // 1. Backup old metadata if exists
    if (await fs.pathExists(path.join(targetPath, 'project_metadata.json'))) {
        await fs.copy(path.join(targetPath, 'project_metadata.json'), path.join(targetPath, 'project_metadata.json.bak'));
    }
    // 2. Run continue logic to ensure structure
    await continueExistingProject(name, targetPath);
    // 3. Add migration log
    const migrationLog = `Migration to BOB Optimized performed at ${new Date().toISOString()}`;
    await fs.appendFile(path.join(targetPath, 'migration_log.txt'), migrationLog + '\n');
    console.log('✓ Legacy metadata backed up');
    console.log('✓ New structure applied');
    console.log('✓ Migration logged');
}
