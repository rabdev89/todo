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
const commander_1 = require("commander");
const fs = __importStar(require("fs-extra"));
const path = __importStar(require("path"));
const agent_registry_1 = require("./agents/agent_registry");
const researcher_agent_1 = require("./agents/researcher_agent");
const state_manager_1 = require("./state_manager");
const program = new commander_1.Command();
program
    .name('ai-agent')
    .description('AI Agent Orchestrator - Manage specialized AI agents for software development')
    .version('1.0.0');
// Agent registry
program.command('research')
    .description('Run researcher agent to discover patterns')
    .argument('<ticketId>', 'Ticket ID to research')
    .action(async (ticketId) => {
    try {
        await runAgent(ticketId, 'researcher');
    }
    catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
});
program.command('pipeline')
    .description('Run complete agent pipeline')
    .argument('<ticketId>', 'Ticket ID')
    .option('-s, --start <stage>', 'Start from stage (research|plan|execute|verify)', 'research')
    .action(async (ticketId, options) => {
    try {
        await runPipeline(ticketId, options.start);
    }
    catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
});
// Helper functions
async function runAgent(ticketId, agentType) {
    const config = (0, agent_registry_1.getAgentConfig)(agentType);
    if (!config) {
        console.error(`Agent type '${agentType}' not found in registry`);
        process.exit(1);
    }
    // Load metadata
    const metadata = await state_manager_1.StateManager.getMetadata(ticketId);
    if (!metadata) {
        console.error(`Ticket ${ticketId} not found`);
        process.exit(1);
    }
    // Generate agent context
    const agent = new researcher_agent_1.ResearcherAgent();
    console.log(`\n🔬 ${config.name} analyzing ticket: ${ticketId}`);
    const context = await agent.researchTicket(ticketId);
    // Save results
    const outputPath = path.resolve(__dirname, '../../web-applications/project-management/epics', `${ticketId}_RESEARCH.md`);
    await fs.writeFile(outputPath, JSON.stringify(context, null, 2));
    console.log(`\n📄 Results saved to ${outputPath}`);
}
async function runPipeline(ticketId, startFrom = 'research') {
    const pipeline = ['research', 'plan', 'execute', 'verify'];
    const startIndex = pipeline.indexOf(startFrom);
    if (startIndex === -1) {
        console.error(`Invalid start stage: ${startFrom}`);
        process.exit(1);
    }
    console.log('\n✅ Pipeline complete!\n');
    for (let i = startIndex; i < pipeline.length; i++) {
        const stage = pipeline[i];
        console.log(`\n🔄 Running stage: ${stage} (${i + 1}/${pipeline.length})`);
        await runAgent(ticketId, stage);
    }
}
// Check which agent outputs exist
const agents = [
    { name: 'Researcher', file: 'RESEARCH.md' },
    { name: 'Planner', file: 'BLUEPRINT.md' },
    { name: 'Executor', file: 'RECORD.md' },
    { name: 'Verifier', file: 'VERIFICATION.md' }
];
program.command('overview')
    .description('Get project overview with Repository Intelligence')
    .action(async () => {
    const researcher = new researcher_agent_1.ResearcherAgent();
    try {
        console.log('📊 Generating project overview...\n');
        const overview = await researcher.getProjectOverview();
        console.log('🏗️  Architectural Patterns:');
        overview.patterns.forEach((pattern, i) => {
            console.log(`   ${i + 1}. ${pattern.name} (${(pattern.confidence * 100).toFixed(1)}% confidence)`);
            console.log(`      ${pattern.description}`);
        });
        console.log('\n💡 Insights:');
        overview.insights.forEach((insight, i) => {
            console.log(`   ${i + 1}. ${insight}`);
        });
        console.log('\n📋 Recommendations:');
        overview.recommendations.forEach((rec, i) => {
            console.log(`   ${i + 1}. ${rec}`);
        });
    }
    catch (error) {
        console.error('❌ Overview generation failed:', error);
        process.exit(1);
    }
});
program.parse(process.argv);
