"use strict";
/**
 * Project Action Handlers
 *
 * Implements actions for Project Initialization and Product Definition phases.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.approveDesignBible = exports.generateDesignBible = exports.userReviewRequirements = exports.generateRequirements = exports.validateUserFlow = exports.userReviewUserFlow = exports.generateUserFlow = exports.userReviewVision = exports.generateVisionDocument = exports.generateProjectManagementStructure = exports.setupContinueProjectUat = exports.generateProjectContext = exports.generateTechStack = exports.validateFrameworkProjectAlignment = exports.promptProjectType = exports.selectProjectType = exports.startProjectInit = void 0;
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const readline_1 = __importDefault(require("readline"));
const state_manager_1 = require("../state_manager");
const logger_1 = require("../logger");
const design_agent_1 = require("../../agents/design_agent");
const ROOT_DIR = path_1.default.resolve(__dirname, '../../../..');
const PROJECT_MGMT_DIR = path_1.default.join(ROOT_DIR, 'project-management');
const WEB_APP_DIR = path_1.default.join(ROOT_DIR, 'web-applications/bob');
const WEB_APP_PM_DIR = path_1.default.join(ROOT_DIR, 'web-applications/project-management');
const WEB_APP_DESIGN_DIR = path_1.default.join(WEB_APP_PM_DIR, 'design');
const FRAMEWORK_DIR = path_1.default.join(ROOT_DIR, 'framework');
/**
 * Start project initialization
 */
const startProjectInit = async (context) => {
    console.log('  Starting project initialization...');
    return {
        success: true,
        data: { initialized: true },
        logs: ['Project initialization started']
    };
};
exports.startProjectInit = startProjectInit;
/**
 * Select project type (non-interactive) - AI-AGENT DRIVEN
 *
 * Workflow:
 * 1. User calls /bob
 * 2. If project_type/project_name NOT set: return requires_ai_input flag
 * 3. AI agent receives prompt, gathers info, updates framework_status.json
 * 4. AI agent calls /bob again
 * 5. Handler sees data, validates, returns success
 * 6. Bob advances to next step
 *
 * Bob stays on this action until data provided, even if /bob called multiple times.
 */
const selectProjectType = async (context) => {
    console.log('  Selecting project type...');
    const status = await state_manager_1.BobStateManager.loadStatus();
    const projectType = status.project_type;
    const projectName = status.project_name;
    // ===== SUCCESS PATH: Data is configured =====
    if (projectType && projectName) {
        const validTypes = ['new_project', 'continue_project', 'framework_migration', 'quick_task'];
        if (!validTypes.includes(projectType)) {
            return {
                success: false,
                error: `Invalid project_type: ${projectType}. Must be one of: ${validTypes.join(', ')}`,
                data: {
                    project_type: projectType,
                    project_name: projectName,
                    valid_types: validTypes,
                    requires_ai_input: true
                }
            };
        }
        return {
            success: true,
            data: {
                project_type: projectType,
                project_name: projectName,
                configured: true
            },
            logs: [
                `✓ Project type: ${projectType}`,
                `✓ Project name: ${projectName}`,
                'Configuration loaded from framework status'
            ]
        };
    }
    // ===== AWAIT AI AGENT: Data not configured =====
    // Return flag for engine to delegate to AI agent
    // DO NOT guide user or wait interactively
    // AI agent will:
    // 1. Ask user for project type and name
    // 2. Update framework_status.json
    // 3. Call /bob again
    // 4. This handler will then succeed and advance
    return {
        success: false,
        error: 'Project type and name not configured',
        data: {
            requires_ai_input: true,
            ai_prompt: `Ask the user these 2 questions:

1. Project Type:
   - New Project
   - Continue Existing

2. Project Name: What's the name of the project?

Once you have both answers, update web-applications/bob/framework_status.json:
{
  "project_type": "<new_project or continue_project>",
  "project_name": "<user's project name>"
}

Then call: npm run start -- bob

Note: If project_type is "continue_project", BOB will fast-track to UAT phase and ask AI to generate:
- Tech stack generation (from existing project)
- Project context (from existing project) 
- Project management structure
`
        }
    };
};
exports.selectProjectType = selectProjectType;
/**
 * Prompt user for project type selection - INTERACTIVE
 */
const promptProjectType = async (context) => {
    console.log('\n📋 Project Type Selection\n');
    // Check for mock data in context (for testing)
    const mockProjectType = context.mockProjectType;
    const mockProjectName = context.mockProjectName;
    if (mockProjectType && mockProjectName) {
        // Use mock data for testing
        const projectType = mockProjectType;
        const projectName = mockProjectName;
        // Update framework status
        const status = await state_manager_1.BobStateManager.loadStatus();
        status.project_type = projectType;
        status.project_name = projectName;
        await state_manager_1.BobStateManager.saveStatus(status);
        console.log(`\n✅ Project configured (mock):`);
        console.log(`   Type: ${projectType}`);
        console.log(`   Name: ${projectName}`);
        console.log();
        return {
            success: true,
            data: {
                project_type: projectType,
                project_name: projectName,
                auto_configured: true
            },
            logs: [
                `Project type set to: ${projectType}`,
                `Project name set to: ${projectName}`,
                'Configuration saved automatically (mock)'
            ]
        };
    }
    const options = [
        { id: 'new_project', name: 'New Project', description: 'Start a new project from scratch' },
        { id: 'continue_project', name: 'Continue Existing', description: 'Continue an existing project' }
    ];
    // Display options
    options.forEach((opt, index) => {
        console.log(`${index + 1}. ${opt.name}`);
        console.log(`   ${opt.description}`);
        console.log();
    });
    // Create readline interface
    const rl = readline_1.default.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    // Prompt for selection
    const askQuestion = (query) => {
        return new Promise((resolve) => {
            rl.question(query, (answer) => {
                resolve(answer.trim());
            });
        });
    };
    try {
        // Get project type selection
        let projectType = null;
        while (!projectType) {
            const answer = await askQuestion('Select project type (1-4): ');
            const choice = parseInt(answer, 10);
            if (choice >= 1 && choice <= 4) {
                projectType = options[choice - 1].id;
            }
            else {
                console.log('❌ Invalid selection. Please enter a number between 1 and 4.');
            }
        }
        // Get project name
        let projectName = '';
        while (!projectName) {
            const answer = await askQuestion('Enter project name: ');
            if (answer.trim()) {
                projectName = answer.trim();
            }
            else {
                console.log('❌ Project name cannot be empty.');
            }
        }
        rl.close();
        // Update framework status
        const status = await state_manager_1.BobStateManager.loadStatus();
        status.project_type = projectType;
        status.project_name = projectName;
        await state_manager_1.BobStateManager.saveStatus(status);
        console.log(`\n✅ Project configured:`);
        console.log(`   Type: ${projectType}`);
        console.log(`   Name: ${projectName}`);
        console.log();
        return {
            success: true,
            data: {
                project_type: projectType,
                project_name: projectName,
                auto_configured: true
            },
            logs: [
                `Project type set to: ${projectType}`,
                `Project name set to: ${projectName}`,
                'Configuration saved automatically'
            ]
        };
    }
    catch (error) {
        rl.close();
        return {
            success: false,
            error: `Failed to get user input: ${error.message}`,
            data: { error: error.message }
        };
    }
};
exports.promptProjectType = promptProjectType;
/**
 * Validate framework alignment with project type
 */
const validateFrameworkProjectAlignment = async (context) => {
    console.log('  Validating framework-project alignment...');
    const status = await state_manager_1.BobStateManager.loadStatus();
    const projectType = status.project_type;
    if (!projectType) {
        return {
            success: false,
            error: 'No project_type set. Please select a project type first.',
            data: { project_type: null }
        };
    }
    const validTypes = ['new_project', 'continue_project', 'framework_migration', 'quick_task'];
    if (!validTypes.includes(projectType)) {
        return {
            success: false,
            error: `Invalid project_type: ${projectType}. Must be one of: ${validTypes.join(', ')}`,
            data: { project_type: projectType, valid_types: validTypes }
        };
    }
    return {
        success: true,
        data: { project_type: projectType, aligned: true },
        logs: [`✓ Project type '${projectType}' is valid and supported`]
    };
};
exports.validateFrameworkProjectAlignment = validateFrameworkProjectAlignment;
/**
 * Generate tech stack configuration
 */
const generateTechStack = async (context) => {
    console.log('  Generating tech stack configuration...');
    const status = await state_manager_1.BobStateManager.loadStatus();
    // For continue_project, detect existing tech stack
    if (status.project_type === 'continue_project') {
        console.log('  Detecting existing tech stack...');
        // Check for package.json files to detect frontend/backend
        const webAppDir = path_1.default.join(ROOT_DIR, 'web-applications');
        const detectedTechStack = {
            detected: true,
            detection_method: 'file_system_analysis',
            generated_at: new Date().toISOString(),
            projects: {}
        };
        try {
            const entries = await fs_extra_1.default.readdir(webAppDir);
            for (const entry of entries) {
                if (entry === 'bob')
                    continue; // Skip bob management folder
                if (entry === 'project-management')
                    continue; // Skip bob management folder
                const full = path_1.default.join(webAppDir, entry);
                try {
                    const stat = await fs_extra_1.default.stat(full);
                    if (!stat.isDirectory())
                        continue;
                    const projectInfo = { name: entry };
                    // Detect common files
                    const pkgPath = path_1.default.join(full, 'package.json');
                    const reqPath = path_1.default.join(full, 'requirements.txt');
                    const pyProj = path_1.default.join(full, 'pyproject.toml');
                    const pubspecPath = path_1.default.join(full, 'pubspec.yaml');
                    const pomPath = path_1.default.join(full, 'pom.xml');
                    const gradlePath = path_1.default.join(full, 'build.gradle');
                    const csprojFiles = (await fs_extra_1.default.readdir(full)).filter(f => f.endsWith('.csproj'));
                    const dockerfile = path_1.default.join(full, 'Dockerfile');
                    const compose = path_1.default.join(full, 'docker-compose.yml');
                    // Check package.json (Node.js projects)
                    if (await fs_extra_1.default.pathExists(pkgPath)) {
                        const pkg = await fs_extra_1.default.readJson(pkgPath);
                        const deps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };
                        // Frontend frameworks
                        if (deps.quasar || deps['@quasar/app']) {
                            projectInfo.role = 'frontend';
                            projectInfo.framework = 'Quasar';
                        }
                        else if (deps.next) {
                            projectInfo.role = 'frontend';
                            projectInfo.framework = 'Next.js';
                        }
                        else if (deps.nuxt) {
                            projectInfo.role = 'frontend';
                            projectInfo.framework = 'Nuxt.js';
                        }
                        else if (deps.react || deps['react-dom']) {
                            projectInfo.role = 'frontend';
                            projectInfo.framework = 'React';
                        }
                        else if (deps.vue) {
                            projectInfo.role = 'frontend';
                            projectInfo.framework = 'Vue';
                        }
                        else if (deps.angular) {
                            projectInfo.role = 'frontend';
                            projectInfo.framework = 'Angular';
                        }
                        else if (deps.svelte) {
                            projectInfo.role = 'frontend';
                            projectInfo.framework = 'Svelte';
                        }
                        // Backend frameworks (Node)
                        if (deps['@nestjs/core'] || deps['@nestjs/common'] || deps['@nestjs/platform-express']) {
                            projectInfo.role = 'backend';
                            projectInfo.framework = 'NestJS';
                        }
                        else if (deps.express || deps['express@']) {
                            projectInfo.role = projectInfo.role || 'backend';
                            projectInfo.framework = projectInfo.framework || 'Express';
                        }
                        else if (deps.koa) {
                            projectInfo.role = projectInfo.role || 'backend';
                            projectInfo.framework = projectInfo.framework || 'Koa';
                        }
                        // Language and package manager
                        projectInfo.language = pkg.devDependencies?.typescript || pkg.dependencies?.typescript ? 'TypeScript' : 'JavaScript';
                        projectInfo.package_manager = pkg.packageManager || (pkg.lockfileVersion ? 'npm' : 'npm');
                        // Scripts-based heuristics
                        if (!projectInfo.framework && pkg.scripts) {
                            const scripts = Object.values(pkg.scripts).join(' ');
                            if (/nest/.test(scripts)) {
                                projectInfo.role = 'backend';
                                projectInfo.framework = 'NestJS';
                            }
                            else if (/next/.test(scripts)) {
                                projectInfo.role = 'frontend';
                                projectInfo.framework = 'Next.js';
                            }
                        }
                    }
                    // Flutter (Dart) detection
                    if (await fs_extra_1.default.pathExists(pubspecPath)) {
                        // try to detect flutter dependency
                        try {
                            const pubspec = await fs_extra_1.default.readFile(pubspecPath, 'utf8');
                            if (/flutter:/i.test(pubspec) || /sdk: flutter/i.test(pubspec)) {
                                projectInfo.role = 'frontend';
                                projectInfo.framework = 'Flutter';
                                projectInfo.language = 'Dart';
                                projectInfo.package_manager = 'pub';
                                projectInfo.is_mobile = true;
                            }
                        }
                        catch (e) {
                            // ignore
                        }
                    }
                    // Python backends
                    if (await fs_extra_1.default.pathExists(reqPath) || await fs_extra_1.default.pathExists(pyProj)) {
                        projectInfo.role = 'backend';
                        // try to detect framework from requirements/pyproject
                        try {
                            const reqContent = await fs_extra_1.default.readFile(await fs_extra_1.default.pathExists(pyProj) ? pyProj : reqPath, 'utf8');
                            if (/fastapi/i.test(reqContent))
                                projectInfo.framework = 'FastAPI';
                            else if (/django/i.test(reqContent))
                                projectInfo.framework = 'Django';
                            else if (/flask/i.test(reqContent))
                                projectInfo.framework = 'Flask';
                            else
                                projectInfo.framework = projectInfo.framework || 'Python (unspecified)';
                        }
                        catch (e) {
                            projectInfo.framework = projectInfo.framework || 'Python (unspecified)';
                        }
                        projectInfo.language = 'Python';
                        projectInfo.package_manager = await fs_extra_1.default.pathExists(pyProj) ? 'poetry' : 'pip';
                    }
                    // Java / Spring detection
                    if (await fs_extra_1.default.pathExists(pomPath) || await fs_extra_1.default.pathExists(gradlePath)) {
                        projectInfo.role = 'backend';
                        projectInfo.framework = 'Spring (Java)';
                        projectInfo.language = 'Java';
                        projectInfo.package_manager = await fs_extra_1.default.pathExists(pomPath) ? 'maven' : 'gradle';
                    }
                    // .NET detection
                    if (csprojFiles.length > 0) {
                        projectInfo.role = 'backend';
                        projectInfo.framework = '.NET';
                        projectInfo.language = 'C#';
                        projectInfo.package_manager = 'dotnet';
                    }
                    // Docker / compose
                    if (await fs_extra_1.default.pathExists(dockerfile) || await fs_extra_1.default.pathExists(compose)) {
                        projectInfo.has_docker = true;
                    }
                    // Database detection (migrations/sql)
                    try {
                        const files = await fs_extra_1.default.readdir(full);
                        if (files.some(f => /migration|migrations|\.sql|prisma|alembic/i.test(f))) {
                            projectInfo.has_database = true;
                        }
                    }
                    catch (e) {
                        // ignore
                    }
                    // Final fallback
                    if (!projectInfo.role) {
                        projectInfo.role = 'unknown';
                        projectInfo.framework = projectInfo.framework || 'Unknown';
                        projectInfo.language = projectInfo.language || 'Unknown';
                        projectInfo.package_manager = projectInfo.package_manager || 'unknown';
                    }
                    detectedTechStack.projects[entry] = projectInfo;
                }
                catch (e) {
                    // ignore single entry errors
                }
            }
        }
        catch (err) {
            // fall through
        }
        const techStackPath = path_1.default.join(ROOT_DIR, 'web-applications', 'tech_stack.json');
        await fs_extra_1.default.writeJson(techStackPath, detectedTechStack, { spaces: 2 });
        return {
            success: true,
            data: { tech_stack_path: techStackPath, detected: true },
            logs: [
                'Tech stack detected from existing project (per-directory):',
                `  File: ${techStackPath}`
            ]
        };
    }
    // AI-driven proposal for new projects
    const visionPath = path_1.default.join(WEB_APP_PM_DIR, 'vision.md');
    const prdPath = path_1.default.join(WEB_APP_PM_DIR, 'PRD.md');
    const techStackPath = path_1.default.join(WEB_APP_DIR, 'tech_stack.json');
    // If tech_stack.json already exists, skip AI prompt and proceed
    if (await fs_extra_1.default.pathExists(techStackPath)) {
        const techStack = await fs_extra_1.default.readJson(techStackPath);
        return {
            success: true,
            data: { tech_stack_path: techStackPath, tech_stack: techStack },
            logs: [
                '✓ Using existing tech stack configuration:',
                `  Frontend: ${techStack.frontend?.framework || 'n/a'}`,
                `  Backend: ${techStack.backend?.framework || 'n/a'}`,
                `  Database: ${techStack.backend?.database || 'n/a'}`,
                `  File: ${techStackPath}`
            ]
        };
    }
    return {
        success: true,
        data: {
            requires_ai_input: true,
            ai_prompt: `🚀 Propose Optimal Tech Stack for Bobbie

Based on the Project Vision and PRD, propose the most applicable and logical technology stack.

**Reference Documents:**
- Vision: ${visionPath}
- PRD: ${prdPath}

**Requirements:**
Generate ${techStackPath} with the following structure:
{
  "frontend": {
    "framework": "...",
    "language": "...",
    "styling": "...",
    "state_management": "..."
  },
  "backend": {
    "framework": "...",
    "language": "...",
    "database": "...",
    "orm": "..."
  },
  "testing": {
    "frontend": "...",
    "backend": "...",
    "e2e": "..."
  },
  "deployment": {
    "platform": "...",
    "ci_cd": "...",
    "hosting": "..."
  },
  "tools": {
    "package_manager": "...",
    "linter": "...",
    "formatter": "...",
    "type_checker": "..."
  }
}

Choose technologies that optimize for speed, Philippine market connectivity (low latency), and AI integration needs.`
        }
    };
};
exports.generateTechStack = generateTechStack;
// Helper function to detect frontend framework
function detectFramework(packageJson) {
    const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
    if (deps.react)
        return 'React';
    if (deps.vue)
        return 'Vue';
    if (deps.angular)
        return 'Angular';
    if (deps.svelte)
        return 'Svelte';
    if (deps.next)
        return 'Next.js';
    if (deps.nuxt)
        return 'Nuxt.js';
    if (deps.gatsby)
        return 'Gatsby';
    return 'Unknown';
}
/**
 * Generate project context
 */
const generateProjectContext = async (context) => {
    console.log('  Generating project context...');
    await logger_1.BobLogger.info('generateProjectContext invoked');
    const status = await state_manager_1.BobStateManager.loadStatus();
    // For continue_project, analyze existing project structure
    if (status.project_type === 'continue_project') {
        console.log('  Analyzing existing project context...');
        const webAppDir = path_1.default.join(ROOT_DIR, 'web-applications');
        let existingContext = {
            detected: true,
            detection_method: 'file_system_analysis',
            project_name: status.project_name,
            project_type: status.project_type,
            framework_version: status.framework_version,
            analyzed_at: new Date().toISOString()
        };
        // Analyze existing structure by inspecting each directory for package.json / requirements
        const analysis = {
            has_frontend: false,
            has_backend: false,
            has_database: false,
            has_testing: false,
            has_deployment: false,
            frontend_dirs: [],
            backend_dirs: [],
            config_files: []
        };
        try {
            const entries = await fs_extra_1.default.readdir(webAppDir);
            for (const entry of entries) {
                const fullPath = path_1.default.join(webAppDir, entry);
                try {
                    const stat = await fs_extra_1.default.stat(fullPath);
                    if (!stat.isDirectory()) {
                        const ext = path_1.default.extname(entry);
                        const configExts = ['.json', '.yml', '.yaml'];
                        if (configExts.includes(ext))
                            analysis.config_files.push(entry);
                        continue;
                    }
                    // detect package.json
                    const pkgPath = path_1.default.join(fullPath, 'package.json');
                    if (await fs_extra_1.default.pathExists(pkgPath)) {
                        const pkg = await fs_extra_1.default.readJson(pkgPath);
                        const deps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };
                        // Frontend indicators
                        if (deps.quasar || deps['@quasar/app'] || deps.next || deps.nuxt || deps.react || deps.vue || deps.angular || deps.svelte) {
                            analysis.has_frontend = true;
                            analysis.frontend_dirs.push(entry);
                        }
                        // Backend indicators (Node)
                        if (deps['@nestjs/core'] || deps['@nestjs/common'] || deps['express'] || deps['koa'] || deps.hapi) {
                            analysis.has_backend = true;
                            if (!analysis.backend_dirs.includes(entry))
                                analysis.backend_dirs.push(entry);
                        }
                    }
                    // Flutter (Dart) detection
                    const pubspecPath = path_1.default.join(fullPath, 'pubspec.yaml');
                    if (await fs_extra_1.default.pathExists(pubspecPath)) {
                        try {
                            const pubspec = await fs_extra_1.default.readFile(pubspecPath, 'utf8');
                            if (/flutter:/i.test(pubspec) || /sdk: flutter/i.test(pubspec)) {
                                analysis.has_frontend = true;
                                if (!analysis.frontend_dirs.includes(entry))
                                    analysis.frontend_dirs.push(entry);
                            }
                        }
                        catch (e) {
                            // ignore
                        }
                    }
                    // Python backend
                    const reqPath = path_1.default.join(fullPath, 'requirements.txt');
                    const pyProj = path_1.default.join(fullPath, 'pyproject.toml');
                    if (await fs_extra_1.default.pathExists(reqPath) || await fs_extra_1.default.pathExists(pyProj)) {
                        analysis.has_backend = true;
                        if (!analysis.backend_dirs.includes(entry))
                            analysis.backend_dirs.push(entry);
                    }
                    // Java / Spring
                    const pomPath = path_1.default.join(fullPath, 'pom.xml');
                    const gradlePath = path_1.default.join(fullPath, 'build.gradle');
                    if (await fs_extra_1.default.pathExists(pomPath) || await fs_extra_1.default.pathExists(gradlePath)) {
                        analysis.has_backend = true;
                        if (!analysis.backend_dirs.includes(entry))
                            analysis.backend_dirs.push(entry);
                    }
                    // .NET
                    try {
                        const dirFiles = await fs_extra_1.default.readdir(fullPath);
                        if (dirFiles.some(f => f.endsWith('.csproj'))) {
                            analysis.has_backend = true;
                            if (!analysis.backend_dirs.includes(entry))
                                analysis.backend_dirs.push(entry);
                        }
                        // database / migrations detection
                        if (dirFiles.some(f => /migration|migrations|\.sql|prisma|alembic/i.test(f))) {
                            analysis.has_database = true;
                        }
                        // docker indicators
                        if (dirFiles.includes('Dockerfile') || dirFiles.includes('docker-compose.yml')) {
                            analysis.has_deployment = true;
                        }
                    }
                    catch (e) {
                        // ignore
                    }
                }
                catch (e) {
                    // ignore per-entry errors
                }
            }
        }
        catch (error) {
            await logger_1.BobLogger.warn('Error analyzing project structure', { error: error.message });
        }
        existingContext.analysis = analysis;
        existingContext.summary = {
            total_directories: analysis.frontend_dirs.length + analysis.backend_dirs.length,
            architecture_type: analysis.has_frontend && analysis.has_backend ? 'full_stack' :
                analysis.has_frontend ? 'frontend_only' :
                    analysis.has_backend ? 'backend_only' : 'unknown'
        };
        const contextPath = path_1.default.join(WEB_APP_PM_DIR, 'project_context.json');
        await fs_extra_1.default.ensureDir(WEB_APP_PM_DIR);
        await fs_extra_1.default.writeJson(contextPath, existingContext, { spaces: 2 });
        await logger_1.BobLogger.info('Project context analyzed and written', { contextPath });
        return {
            success: true,
            data: { context_path: contextPath, detected: true },
            logs: [
                'Project context analyzed from existing project:',
                `  Name: ${existingContext.project_name}`,
                `  Type: ${existingContext.project_type}`,
                `  Architecture: ${existingContext.summary.architecture_type}`,
                `  Frontend: ${analysis.has_frontend ? 'Yes' : 'No'}`,
                `  Backend: ${analysis.has_backend ? 'Yes' : 'No'}`,
                `  File: ${contextPath}`
            ]
        };
    }
    // Original logic for new projects
    const projectContext = {
        project_name: status.project_name || 'Untitled Project',
        project_type: status.project_type || 'new_project',
        framework_version: status.framework_version,
        created_at: new Date().toISOString(),
        settings: {
            auto_advance: false,
            require_user_approval: true,
            dashboard_auto_generate: true
        }
    };
    const contextPath = path_1.default.join(WEB_APP_PM_DIR, 'project_context.json');
    await fs_extra_1.default.ensureDir(WEB_APP_PM_DIR);
    await fs_extra_1.default.writeJson(contextPath, projectContext, { spaces: 2 });
    await logger_1.BobLogger.info('Project context written', { contextPath });
    return {
        success: true,
        data: { context_path: contextPath },
        logs: [
            'Project context generated:',
            `  Name: ${projectContext.project_name}`,
            `  Type: ${projectContext.project_type}`,
            `  File: ${contextPath}`
        ]
    };
};
exports.generateProjectContext = generateProjectContext;
/**
 * Setup UAT for continue_project - generates tech stack, project context, and PM structure
 */
const setupContinueProjectUat = async (context) => {
    console.log('  Setting up UAT for continue project...');
    await logger_1.BobLogger.info('setupContinueProjectUat invoked');
    const status = await state_manager_1.BobStateManager.loadStatus();
    if (status.project_type !== 'continue_project') {
        return {
            success: false,
            error: 'This handler is only for continue_project type',
            logs: ['Invalid project type for continue project UAT setup']
        };
    }
    console.log('  🚀 Fast-track UAT setup for existing project...');
    console.log('  📋 Will generate: Tech stack, Project context, PM structure');
    return {
        success: true,
        data: {
            requires_ai_input: true,
            ai_prompt: `For this continue_project (SLSHUB), please execute these actions in order:

1. First, ask the user to install the project on web-applications/ directory if not already there

2. Then execute these three actions:
   - tech_stack_generation (detect existing tech stack from web-applications/)
   - generate_project_context (analyze existing project structure)  
   - generate_project_management_structure (create PM directories and templates)

3. After completing all three, call: npm run start -- bob

Each action will generate the necessary files and documentation for the existing project.
`
        },
        logs: [
            'Continue project UAT setup initiated',
            'Will detect existing tech stack and generate project documentation',
            'AI agent will execute: tech_stack_generation, generate_project_context, generate_project_management_structure'
        ]
    };
};
exports.setupContinueProjectUat = setupContinueProjectUat;
/**
 * Generate project management structure
 */
const generateProjectManagementStructure = async (context) => {
    console.log('  Generating project management structure...');
    await logger_1.BobLogger.info('generateProjectManagementStructure invoked');
    const dirs = [
        'web-applications/project-management/epics',
        'project-management/backlog',
        'project-management/releases',
        'project-management/docs'
    ];
    const createdDirs = [];
    for (const dir of dirs) {
        const dirPath = path_1.default.join(ROOT_DIR, dir);
        if (!await fs_extra_1.default.pathExists(dirPath)) {
            await fs_extra_1.default.ensureDir(dirPath);
            createdDirs.push(dir);
        }
    }
    if (createdDirs.length > 0) {
        await logger_1.BobLogger.info('Created project management directories', { createdDirs });
    }
    // Create template files
    const templates = [
        {
            path: 'web-applications/project-management/epics/README.md',
            content: '# Epics\n\nStore epic definitions here.\n\n## Structure\n\n- Each epic gets its own directory\n- Epics contain tickets in a `tickets/` subdirectory\n- Use `epic_template` as a starting point\n'
        },
        {
            path: 'web-applications/project-management/backlog/backlog.md',
            content: `# Project Backlog & Ideas

This document tracks high-level ideas, feature requests, and unscoped concepts. Once an idea is ready for development, it will be moved to a ticket folder in \`web-applications/project-management/epics/backlog/tickets/\`.

## How to Process Backlog Items

### To Generate Tickets from Backlog:
**Ask the AI agent**: "Please run \`npm run scan:tickets\` to scan and generate tickets from the backlog"

The AI agent will:
1. Run the scanner to generate ticket folders
2. Assign initial track decisions (scaffolding only)
3. Provide action items for scoping
4. Show you what tickets were created


### Ticket Scaffolding
Scaffold each ticket before letting the AI agent to scope the ticket.

1. npm run start -- research T-001
2. npm run start -- plan T-001
3. npm run start -- design T-001
4. npm run start -- execute T-001
5. npm run start -- verify T-001

### To Scope Generated Tickets:
**Ask the AI agent**: "Please scope the generated tickets following the TICKET_SCOPING.md rules"

The AI agent will:
1. Run manual decision gate for each ticket
2. Create all required documentation (requirements, design, planning, testing)
3. Update metadata files
4. Remove processed items from this backlog

## 💡 Raw Ideas (Unscoped)
Insert your ticket name and description here.

<!-- Example: - [ ] Add dark mode toggle -->

## UAT Bug Fixes

List bugs discovered during manual testing here.

<!-- Example: - [ ] Bug 1: (Description) -->

## 🗺️ Roadmap

### 🚀 Project Initiatives (Production Releases)

### 🔍 Ready for Review (Scoped)

### ✅ Verified
`
        }
    ];
    const createdFiles = [];
    for (const template of templates) {
        const filePath = path_1.default.join(ROOT_DIR, template.path);
        if (!await fs_extra_1.default.pathExists(filePath)) {
            await fs_extra_1.default.outputFile(filePath, template.content, 'utf8');
            createdFiles.push(template.path);
        }
    }
    if (createdFiles.length > 0) {
        await logger_1.BobLogger.info('Created project management template files', { createdFiles });
    }
    return {
        success: true,
        data: { created_dirs: createdDirs, created_files: createdFiles },
        logs: [
            `Created ${createdDirs.length} directories:`,
            ...createdDirs.map(d => `  - ${d}`),
            `Created ${createdFiles.length} files:`,
            ...createdFiles.map(f => `  - ${f}`)
        ]
    };
};
exports.generateProjectManagementStructure = generateProjectManagementStructure;
// ============================================================================
// Product Definition Handlers
// ============================================================================
/**
 * Generate vision document - AI-AGENT DRIVEN
 *
 * Workflow:
 * 1. User/Bob calls generateVisionDocument
 * 2. If vision_details NOT set: return requires_ai_input flag
 * 3. AI agent interviews user, gathers problem/solution/users/features/metrics/timeline
 * 4. AI agent updates framework_status.json with vision_details
 * 5. AI agent calls /bob again
 * 6. Handler sees data, validates, generates vision.md with actual content
 * 7. Bob advances to next step
 *
 * Bob stays on this action until data provided, even if /bob called multiple times.
 */
const generateVisionDocument = async (context) => {
    console.log('  Generating vision document...');
    const status = await state_manager_1.BobStateManager.loadStatus();
    const projectName = status.project_name || 'Untitled Project';
    //this process might take time, so lets generate the vision questionnaire file first
    const visionQuestionnairePath = path_1.default.join(WEB_APP_PM_DIR, 'vision_questionnaire.md');
    const visionQuestionnaireContent = `# Vision Questionnaire

    ## Problem Statement

    What problem does this project solve?

    ## Solution

    How does this project solve that problem?

    ## Target Users

    Who will use this product?

    ## Key Features

    What are the main features? (list 3-5)

    ## Success Metrics

    How will success be measured? (list 2-3 metrics)

    ## Timeline

    What's the high-level development timeline?

    ---
    After filling all the fields, prompt '/bob' to AI to continue the process.
    *Generated by Bob Framework*  
    *Date: ${new Date().toISOString()}*`;
    await fs_extra_1.default.writeFile(visionQuestionnairePath, visionQuestionnaireContent, 'utf8');
    // Check if vision_details.json exists
    const visionDetailsPath = path_1.default.join(WEB_APP_PM_DIR, 'vision_details.json');
    const visionDetailsExists = await fs_extra_1.default.pathExists(visionDetailsPath);
    // ===== SUCCESS PATH: Vision details file exists =====
    if (visionDetailsExists) {
        const visionDetails = await fs_extra_1.default.readJson(visionDetailsPath);
        const visionContent = `# Vision: ${projectName}

      ## Problem Statement

      ${visionDetails.problem_statement}

      ## Solution

      ${visionDetails.solution}

      ## Target Users

      ${visionDetails.target_users}

      ## Key Features

      ${Array.isArray(visionDetails.key_features)
            ? visionDetails.key_features.map((f) => `- ${f}`).join('\n')
            : visionDetails.key_features}

      ## Success Metrics

      ${Array.isArray(visionDetails.success_metrics)
            ? visionDetails.success_metrics.map((m) => `- ${m}`).join('\n')
            : visionDetails.success_metrics}

      ## Timeline

      ${visionDetails.timeline}

      ---

      *Generated by Bob Framework*  
      *Date: ${new Date().toISOString()}*
      `;
        const visionPath = path_1.default.join(WEB_APP_PM_DIR, 'vision.md');
        await fs_extra_1.default.writeFile(visionPath, visionContent, 'utf8');
        return {
            success: true,
            data: {
                vision_path: visionPath,
                vision_details_path: visionDetailsPath,
                project_name: projectName,
                vision_configured: true
            },
            logs: [
                '✓ Vision document generated',
                `  Project: ${projectName}`,
                `  File: ${visionPath}`
            ]
        };
    }
    // ===== AWAIT AI AGENT: Vision details not configured =====
    return {
        success: false,
        error: 'Vision details not configured',
        data: {
            requires_ai_input: true,
            project_name: projectName,
            ai_prompt: `Interview the user to gather their project vision. Ask for:
        1. Problem Statement: What problem does this project solve?
        2. Solution: How does this project solve that problem?
        3. Target Users: Who will use this product?
        4. Key Features: What are the main features? (list 3-5)
        5. Success Metrics: How will success be measured? (list 2-3 metrics)
        6. Timeline: What's the high-level development timeline?

        Once you have all answers, create web-applications/project-management/vision_details.json:
        {
          "problem_statement": "<user's answer>",
          "solution": "<user's answer>",
          "target_users": "<user's answer>",
          "key_features": [<array of features>],
          "success_metrics": [<array of metrics>],
          "timeline": "<user's answer>",
          "target_age": "<if applicable>",
          "tech_stack": "<if known>",
          "project_duration": "<if known>",
          "priority_features": [<if applicable>]
        }

        Then call: npm run start -- bob`
        }
    };
};
exports.generateVisionDocument = generateVisionDocument;
/**
 * User review of vision - AI-assisted approval
 *
 * User reviews the AI-generated vision.md file.
 * If they approve, Bob continues.
 * If they need changes, they edit vision.md and call /bob again.
 */
const userReviewVision = async (context) => {
    console.log('  Reviewing vision document...');
    const visionPath = path_1.default.join(WEB_APP_PM_DIR, 'vision.md');
    const approvalPath = path_1.default.join(WEB_APP_PM_DIR, 'vision_approval.json');
    // Check if vision document exists
    if (!await fs_extra_1.default.pathExists(visionPath)) {
        return {
            success: false,
            error: 'Vision document not found. Generate vision first.',
            data: {}
        };
    }
    // Chec if vision_approval.json exist, if not, generate it
    if (!await fs_extra_1.default.pathExists(approvalPath)) {
        const approval = await fs_extra_1.default.writeJson(approvalPath, {
            approved: false,
            approved_by: null
        });
        console.log('Vision approval file generated');
    }
    // ===== SUCCESS PATH: Approval file exists =====
    if (await fs_extra_1.default.pathExists(approvalPath)) {
        const approval = await fs_extra_1.default.readJson(approvalPath);
        if (approval.approved === true) {
            return {
                success: true,
                data: {
                    vision_approved: true,
                    approved_by: approval.approved_by,
                    approved_at: approval.approved_at
                },
                logs: [
                    '✓ Vision document approved',
                    `  Approved by: ${approval.approved_by}`,
                    `  Time: ${approval.approved_at}`
                ]
            };
        }
    }
    // ===== AWAIT APPROVAL: No approval file or not approved =====
    return {
        success: false,
        error: 'Vision requires user approval',
        data: {
            requires_ai_input: true,
            vision_path: visionPath,
            approval_path: approvalPath,
            ai_prompt: `
Regenerate and expand the initial vision.md into a comprehensive project vision and high-level requirements document.

The document should include:

1. Project Overview
2. Problem Statement
3. Vision and Objectives
4. Target Users / Stakeholders
5. Key Use Cases
6. Core Features and Capabilities
7. System Scope (In Scope / Out of Scope)
8. Functional Requirements (high level)
9. Non-Functional Requirements (performance, security, scalability, reliability)
10. Assumptions and Constraints
11. Dependencies and External Integrations
12. Success Metrics / Definition of Success

Preserve the original intent of the project but significantly expand the level of detail so the document can act as the foundational reference for architecture, development planning, and future requirement specifications.

Show user the vision document at:
${visionPath}

Ask: "Does this vision match your project goals?"

If YES:
  Create ${approvalPath}:
  {
    "approved": true,
    "approved_by": "user",
    "approved_at": "${new Date().toISOString()}"
  }
  Then call: npm run start -- bob

If NO:
  Update vision_details.json with corrections
  Then call: npm run start -- bob
`
        }
    };
};
exports.userReviewVision = userReviewVision;
/**
 * Generate user flow document - AI-AGENT DRIVEN
 *
 * Workflow:
 * 1. User/Bob calls generateUserFlow
 * 2. If user_flow_details NOT set: return requires_ai_input flag
 * 3. AI agent interviews user about user journeys and personas
 * 4. AI agent updates framework_status.json with user_flow_details
 * 5. AI agent calls /bob again
 * 6. Handler sees data, generates user_flow.md with actual content
 * 7. Bob advances to next step
 */
const generateUserFlow = async (context) => {
    console.log('  Generating user flow document...');
    const status = await state_manager_1.BobStateManager.loadStatus();
    const projectName = status.project_name || 'Untitled Project';
    const userFlowDraftPath = path_1.default.join(WEB_APP_PM_DIR, 'user_flow_draft.md');
    const userFlowDetailsPath = path_1.default.join(WEB_APP_PM_DIR, 'user_flow_details.json');
    const userFlowPath = path_1.default.join(WEB_APP_PM_DIR, 'user_flow.md');
    const userFlowDraftContent = `# User Flow Draft (Questionnaire)
    
## Phase 1: User Flow (Onboarding)
1. **ACTION**: describe the user flow
2. **DESCRIPTION**: describe the user flow
3. **EXPECTED RESULT**: describe the user flow

## Phase 2: User Flow (Screen 1)
1. **ACTION**: describe the user flow
2. **DESCRIPTION**: describe the user flow
3. **EXPECTED RESULT**: describe the user flow

## Phase 3: User Flow (Screen 2)
1. **ACTION**: describe the user flow
2. **DESCRIPTION**: describe the user flow
3. **EXPECTED RESULT**: describe the user flow

## Phase 4: User Flow (Screen 3)
1. **ACTION**: describe the user flow
2. **DESCRIPTION**: describe the user flow
3. **EXPECTED RESULT**: describe the user flow

## Phase 5: User Flow (Screen 4)
1. **ACTION**: describe the user flow
2. **DESCRIPTION**: describe the user flow
3. **EXPECTED RESULT**: describe the user flow

## Phase 6: User Flow (Screen 5)
1. **ACTION**: describe the user flow
2. **DESCRIPTION**: describe the user flow
3. **EXPECTED RESULT**: describe the user flow

---
After filling all the fields, prompt '/bob' to AI to continue the process.
*Generated by Bob Framework*  
*Date: ${new Date().toISOString()}*`;
    await fs_extra_1.default.writeFile(userFlowDraftPath, userFlowDraftContent, 'utf8');
    // Check if user_flow_details.json exists
    const userFlowDetailsExists = await fs_extra_1.default.pathExists(userFlowDetailsPath);
    // ===== SUCCESS PATH: User flow details file exists =====
    if (userFlowDetailsExists) {
        const userFlowDetails = await fs_extra_1.default.readJson(userFlowDetailsPath);
        const userFlowContent = `# User Flow: ${projectName}

## Overview

${userFlowDetails.overview || 'No overview provided.'}

## User Flow Diagram

\`\`\`mermaid
${userFlowDetails.flow_diagram || 'graph LR\n    A[User Entry] --> B[Dashboard]\n    B --> C[Action]'}
\`\`\`

## User Stories

${Array.isArray(userFlowDetails.user_stories)
            ? userFlowDetails.user_stories.map((story) => `### ${story.title}\n\n**As a** ${story.as_a}  \n**I want** ${story.i_want}  \n**So that** ${story.so_that}\n\n**Acceptance Criteria:**\n${Array.isArray(story.acceptance_criteria) ? story.acceptance_criteria.map((c) => `- ${c}`).join('\n') : story.acceptance_criteria}`).join('\n\n')
            : (userFlowDetails.user_stories || 'No user stories defined.')}

## Screen Flow

${Array.isArray(userFlowDetails.screen_flow)
            ? userFlowDetails.screen_flow.map((screen, index) => `${index + 1}. **${screen.name}**: ${screen.description}`).join('\n')
            : (userFlowDetails.screen_flow || 'No screen flow defined.')}

---

*Generated by Bob Framework*  
*Date: ${new Date().toISOString()}*
`;
        await fs_extra_1.default.writeFile(userFlowPath, userFlowContent, 'utf8');
        return {
            success: true,
            data: {
                user_flow_path: userFlowPath,
                user_flow_details_path: userFlowDetailsPath,
                user_flow_configured: true
            },
            logs: [
                '✓ User flow document generated',
                `  Project: ${projectName}`,
                `  File: ${userFlowPath}`
            ]
        };
    }
    // ===== AWAIT AI AGENT: User flow details not configured =====
    return {
        success: false,
        error: 'User flow details not configured',
        data: {
            requires_ai_input: true,
            project_name: projectName,
            ai_prompt: `⏸️ User Flow details required.

1. Wait for the user to fill the user_flow_draft.md file.
2. Gather:
   - **Overall Journey**: High-level description of the user journey.
   - **User Stories**: 3-5 user stories (title, as_a, i_want, so_that, acceptance_criteria[]).
   - **Screen Flow**: Sequential list of screens (name, description).
   - **Flow Diagram**: Mermaid graph showing the flow.
3. Create ${userFlowDetailsPath}:
{
  "overview": "<description>",
  "user_stories": [
    {
      "title": "<title>",
      "as_a": "<role>",
      "i_want": "<goal>",
      "so_that": "<benefit>",
      "acceptance_criteria": ["<criterion 1>", "<criterion 2>"]
    }
  ],
  "screen_flow": [
    { "name": "<name>", "description": "<description>" }
  ],
  "flow_diagram": "graph LR..." 
}
4. Run 'npm run bob' to generate the user_flow.md document.`
        }
    };
};
exports.generateUserFlow = generateUserFlow;
/**
 * User review of user flow - AI-assisted approval
 */
const userReviewUserFlow = async (context) => {
    console.log('  Reviewing user flow document...');
    const userFlowPath = path_1.default.join(WEB_APP_PM_DIR, 'user_flow.md');
    const approvalPath = path_1.default.join(WEB_APP_PM_DIR, 'user_flow_approval.json');
    // Check if user flow document exists
    if (!await fs_extra_1.default.pathExists(userFlowPath)) {
        return {
            success: false,
            error: 'User flow document not found. Generate user flow first.',
            data: {}
        };
    }
    // Check if user_flow_approval.json exists, if not, generate it
    if (!await fs_extra_1.default.pathExists(approvalPath)) {
        await fs_extra_1.default.writeJson(approvalPath, {
            approved: false,
            approved_by: null
        });
        console.log('User flow approval file generated');
    }
    // ===== SUCCESS PATH: Approval file exists and is approved =====
    const approval = await fs_extra_1.default.readJson(approvalPath);
    if (approval.approved === true) {
        return {
            success: true,
            data: {
                user_flow_approved: true,
                approved_by: approval.approved_by,
                approved_at: approval.approved_at
            },
            logs: [
                '✓ User flow document approved',
                `  Approved by: ${approval.approved_by}`,
                `  Time: ${approval.approved_at}`
            ]
        };
    }
    // ===== AWAIT APPROVAL: No approval file or not approved =====
    return {
        success: false,
        error: 'User flow requires user approval',
        data: {
            requires_ai_input: true,
            user_flow_path: userFlowPath,
            approval_path: approvalPath,
            ai_prompt: `⏸️ User Flow approval required.

The user flow has been generated at: ${userFlowPath}

Please review it with the user. If they approve, create ${approvalPath}:
{
  "approved": true,
  "approved_by": "user",
  "approved_at": "${new Date().toISOString()}"
}

Once approved, run 'npm run bob' to continue.`
        }
    };
};
exports.userReviewUserFlow = userReviewUserFlow;
/**
 * Validate user flow
 */
const validateUserFlow = async (context) => {
    console.log('  Validating user flow logic and assets...');
    const filesToCheck = [
        { name: 'vision_details.json', path: path_1.default.join(WEB_APP_PM_DIR, 'vision_details.json') },
        { name: 'vision_approval.json', path: path_1.default.join(WEB_APP_PM_DIR, 'vision_approval.json') },
        { name: 'user_flow.md', path: path_1.default.join(WEB_APP_PM_DIR, 'user_flow.md') },
        { name: 'user_flow_details.json', path: path_1.default.join(WEB_APP_PM_DIR, 'user_flow_details.json') },
        { name: 'user_flow_approval.json', path: path_1.default.join(WEB_APP_PM_DIR, 'user_flow_approval.json') }
    ];
    const results = [];
    for (const f of filesToCheck) {
        const exists = await fs_extra_1.default.pathExists(f.path);
        results.push({ file: f.name, exists });
        if (!exists) {
            return {
                success: false,
                error: `Required file missing: ${f.name}`,
                data: { results }
            };
        }
    }
    // Check approvals
    const visionApproval = await fs_extra_1.default.readJson(filesToCheck[1].path);
    const flowApproval = await fs_extra_1.default.readJson(filesToCheck[4].path);
    if (visionApproval.approved !== true || flowApproval.approved !== true) {
        return {
            success: false,
            error: 'Missing required approvals for vision or user flow',
            data: { vision_approved: visionApproval.approved, flow_approved: flowApproval.approved }
        };
    }
    return {
        success: true,
        data: { validation_results: results },
        logs: [
            '✓ All required product definition assets found',
            '✓ Vision audit passed',
            '✓ User flow audit passed'
        ]
    };
};
exports.validateUserFlow = validateUserFlow;
/**
 * Generate comprehensive project requirements
 */
const generateRequirements = async (context) => {
    console.log('  Generating comprehensive project requirements...');
    const visionPath = path_1.default.join(WEB_APP_PM_DIR, 'vision.md');
    const userFlowPath = path_1.default.join(WEB_APP_PM_DIR, 'user_flow.md');
    const prdPath = path_1.default.join(WEB_APP_PM_DIR, 'PRD.md');
    if (await fs_extra_1.default.pathExists(prdPath)) {
        return {
            success: true,
            data: { requirements_generated: true },
            logs: ['✓ Requirements documents successfully generated']
        };
    }
    return {
        success: false,
        data: {
            requires_ai_input: true,
            ai_prompt: `🚀 Generate Comprehensive Project Requirements
Based on the established Vision and User Flow, generate the following foundational documents in ${WEB_APP_PM_DIR}.

### Requirements Purposes:
1. **PRD.md** (Product Requirements Document):
   - Detailed feature list, target audience, success metrics.
   - User personas and their specific needs.
2. **FRD.md** (Functional Requirements Document):
   - Technical specifications for every feature mentioned in the User Flow.
   - Input/Output requirements for each major flow.
3. **system_architecture.md**:
   - High-level system design, data flow diagrams (Mermaid).
   - Component breakdown (Frontend, Backend, Database).
4. **epic_backlogs.md**:
   - Initial list of Epics needed to implement the vision.
   - High-level task list for the first 3 Epics.

**Reference Documents:**
- Vision: ${visionPath}
- User Flow: ${userFlowPath}

Ensure every document is high-fidelity, actionable, and consistent with the project goals.

Once generated, run 'npm run bob' to move to the Design Bible phase.`
        }
    };
};
exports.generateRequirements = generateRequirements;
/**
 * User review of requirements - AI-assisted approval
 */
const userReviewRequirements = async (context) => {
    console.log('  Reviewing requirements package...');
    const approvalPath = path_1.default.join(WEB_APP_PM_DIR, 'requirements_approval.json');
    // Check if approval file exists, if not, generate it
    if (!await fs_extra_1.default.pathExists(approvalPath)) {
        await fs_extra_1.default.writeJson(approvalPath, {
            prd: false,
            frd: false,
            system_architecture: false,
            epic_backlogs: false,
            screen_list: false,
            style_guide: false,
            sitemap: false,
            design_assets: false,
            approved: false,
            approved_by: null
        });
        console.log('Requirements approval file generated');
    }
    const approval = await fs_extra_1.default.readJson(approvalPath);
    const requiredFields = [
        'prd',
        'frd',
        'system_architecture',
        'epic_backlogs',
        'screen_list',
        'style_guide',
        'sitemap'
    ];
    const allApproved = requiredFields.every(field => approval[field] === true);
    if (approval.approved === true && allApproved) {
        return {
            success: true,
            data: {
                approved: true,
                approved_by: approval.approved_by,
                approved_at: approval.approved_at
            },
            logs: [
                '✓ Requirements package approved',
                `  Approved by: ${approval.approved_by}`,
                `  Time: ${approval.approved_at}`
            ]
        };
    }
    return {
        success: false,
        error: 'User requirements approval required',
        data: {
            requires_ai_input: true,
            approval_path: approvalPath,
            ai_prompt: `⏸️ User requirements approval required.

Please review the generated PRD, FRD, System Architecture, and Design assets with the user.
User needs to review and approve the following:
### Requirements Purposes:
1. **PRD.md** (Product Requirements Document)
2. **FRD.md** (Functional Requirements Document)
3. **system_architecture.md**
4. **epic_backlogs.md**

### Design Purposes:
5. **screen_list.md**
6. **style_guide.md**
7. **sitemap.md**

Note: Quality of the generated documents is critical. Ensure they are high-fidelity, actionable, and consistent with the desired project where applicable.
If you are not satisfied, you can use a different AI to regenerate the documents.

If they approve the entire package, create ${approvalPath}:
{
}

Once approved, run 'npm run bob' to enter the Technical Architecture phase.`
        }
    };
};
exports.userReviewRequirements = userReviewRequirements;
/**
 * Generate Design Bible - suggested 3 ambiance directions
 */
const generateDesignBible = async (context) => {
    console.log('  Generating Design Bible options...');
    const optionsPath = path_1.default.join(WEB_APP_DESIGN_DIR, 'design_bible_options.json');
    const draftPath = path_1.default.join(WEB_APP_DESIGN_DIR, 'design_bible_draft.json');
    const previewDir = path_1.default.join(WEB_APP_DESIGN_DIR, 'previews');
    const prdPath = path_1.default.join(WEB_APP_PM_DIR, 'PRD.md');
    if (await fs_extra_1.default.pathExists(optionsPath)) {
        return {
            success: true,
            data: { options_path: optionsPath },
            logs: ['✓ Design Bible options generated']
        };
    }
    // Ensure design directory exists
    await fs_extra_1.default.ensureDir(WEB_APP_DESIGN_DIR);
    // Step 1: AI suggests directions and modifiers
    if (!await fs_extra_1.default.pathExists(draftPath)) {
        return {
            success: false,
            data: {
                requires_ai_input: true,
                ai_prompt: `🎨 Architect 3 Design Directions (UI-UX Pro Max)

Based on the PRD, propose 3 distinct, high-fidelity visual directions. Do NOT just pick from examples; analyze the **Target Audience**, **Industry Standards**, and **Product Persona** to derive these.

### 📐 Orchestration Requirements:
For each direction, you MUST provide:
1. **Strategic Name**: A evocative name (e.g., "The Kinetic Workspace", "Ethereal Commerce").
2. **Design Logic**: A 2-sentence rationale on why this fits the product's goal.
3. **Style Modifier Flags**: A string of 4-6 flags for the 'ui-ux-pro-max' engine.

### 🎨 Modifier Library (Mix & Match):
- **Layout/Structure**: --asymmetric, --grid-heavy, --maximalist, --minimalist, --split-screen, --floating-cards.
- **Aesthetic/Vibe**: --neo-brutalism, --glassmorphism, --claymorphism, --skeuomorphism, --flat-design, --cyberpunk, --vintage, --luxury, --organic, --industrial.
- **Color Theory**: --duotone, --monochromatic, --high-contrast, --pastel, --vibrant, --muted, --dark-mode-classic, --neon-accents.
- **Motion/Depth**: --depth-layers, --micro-interactions, --scroll-animations, --grainy-texture, --gradient-mesh.

### 🚀 Goal:
We want variety. 
- Direction 1: Safe, industry-standard, high usability.
- Direction 2: Modern, trend-forward, high visual "wow".
- Direction 3: Radical, "disruptive", unique brand voice.

Save to ${draftPath}:
{
  "directions": [
    { 
      "name": "...", 
      "rationale": "...",
      "modifiers": "--flag1 --flag2 --flag3 --flag4" 
    },
    ...
  ]
}

Once saved, run 'npm run start -- bob' and I will execute the reasoning engine for each.`
            }
        };
    }
    // Step 2: Use draft to call DesignAgent
    try {
        const draft = await fs_extra_1.default.readJson(draftPath);
        const flavors = draft.directions.map((d) => ({
            name: d.name,
            prompt: d.modifiers
        }));
        const designAgent = new design_agent_1.DesignAgent();
        let query = 'Mobile App'; // Default
        let domain = 'web'; // Default
        if (await fs_extra_1.default.pathExists(prdPath)) {
            const prdContent = await fs_extra_1.default.readFile(prdPath, 'utf8');
            const match = prdContent.match(/# (.*)/);
            if (match)
                query = match[1];
            // Domain detection
            const prdLower = prdContent.toLowerCase();
            if (prdLower.includes('mobile app') || prdLower.includes('ios') || prdLower.includes('android')) {
                domain = 'mobile';
            }
            else if (prdLower.includes('desktop') || prdLower.includes('electron')) {
                domain = 'desktop';
            }
        }
        console.log(`    Invoking UI-UX Pro Max for ${flavors.length} dynamic directions...`);
        const directions = await designAgent.generateProjectBibleDirections(query, domain, flavors);
        // Save the finalized directions to file
        await fs_extra_1.default.ensureDir(previewDir);
        await fs_extra_1.default.writeJson(optionsPath, { directions }, { spaces: 2 });
        return {
            success: false,
            data: {
                requires_ai_input: true,
                options_path: optionsPath,
                ai_prompt: `🎨 Design Bible directions generated via UI-UX Pro Max!

### 🚀 Next Steps:
1. **Generate HTML Previews**: For EACH direction in ${optionsPath}, generate a high-fidelity HTML preview in '${previewDir}/direction_[1-3].html'. 
   - Use the visual tokens and design specs extracted by the engine.
   - Ensure premium CSS (gradients, animations, glassmorphism).
2. **Review**: Once HTML files are created, run 'npm run start -- bob' to present them to the user for approval.`
            },
            logs: [`✓ UI-UX Pro Max generated 3 dynamic directions based on AI-suggested modifiers`]
        };
    }
    catch (error) {
        console.warn(`    Design Bible generation failed: ${error.message}`);
        return { success: false, data: { error: error.message } };
    }
};
exports.generateDesignBible = generateDesignBible;
/**
 * Approve Design Bible - user selects preferred ambiance
 */
const approveDesignBible = async (context) => {
    console.log('  Approving Design Bible selection...');
    const optionsPath = path_1.default.join(WEB_APP_DESIGN_DIR, 'design_bible_options.json');
    const choicePath = path_1.default.join(WEB_APP_DESIGN_DIR, 'design_bible_choice.json');
    const styleGuideMd = path_1.default.join(WEB_APP_DESIGN_DIR, 'style_guide.md');
    const styleGuideJson = path_1.default.join(WEB_APP_DESIGN_DIR, 'style_guide.json');
    if (await fs_extra_1.default.pathExists(choicePath)) {
        const choice = await fs_extra_1.default.readJson(choicePath);
        if (choice.selected_id) {
            // Ensure style guide files are generated if choice exists but files don't
            if (!await fs_extra_1.default.pathExists(styleGuideMd) || !await fs_extra_1.default.pathExists(styleGuideJson)) {
                console.log(`    Finalizing style guide based on selection: ${choice.selected_id}`);
            }
            return {
                success: true,
                data: {
                    selected_id: choice.selected_id,
                    style_guide_md: styleGuideMd,
                    style_guide_json: styleGuideJson
                },
                logs: [`✓ Design direction ${choice.selected_id} approved and style guide finalized`]
            };
        }
    }
    return {
        success: false,
        data: {
            requires_ai_input: true,
            ai_prompt: `✅ Approve Design Bible Selection

The 3 design directions are available in ${optionsPath}. 
Present these to the user along with the HTML previews in the '${path_1.default.join(WEB_APP_DESIGN_DIR, 'previews')}' folder.

Ask the user: "Which ambiance resonates most with your vision?"

Once selected:
1. Update ${choicePath} with the selection: { "selected_id": N, "reason": "..." }.
2. Generate the official **style_guide.md** in ${WEB_APP_DESIGN_DIR}.
3. Generate the machine-readable **style_guide.json** in ${WEB_APP_DESIGN_DIR}.
4. Generate the **sitemap.md** and **screen_list.md** reflecting this aesthetic in ${WEB_APP_DESIGN_DIR}.

Then run 'npm run start -- bob' to continue.`
        }
    };
};
exports.approveDesignBible = approveDesignBible;
