#!/usr/bin/env node

import { Command } from 'commander';
import { PhaseRunner } from './phase_runner';
import { StateManager } from './state_manager';
import { DependencyEngine } from './dependency_engine';
import { FileGuard } from './file_guard';
import { ArchitectureGuard } from './architecture_guard';
import { ContextBuilder } from './context_builder';
import { ValidationRunner } from './validation_runner';
import { LearningLayer } from './learning_layer';
import { indexRepoCommand } from './cli/commands/index-repo';
import { searchCommand, searchSymbolsCommand, findDependentsCommand, embedCommand, statsCommand } from './cli/commands/search';
import { researchCommand, overviewCommand } from './cli/commands/research';
import { PlannerAgent } from './agents/planner_agent';
import { ExecutorAgent } from './agents/executor_agent';
import { VerifierAgent } from './agents/verifier_agent';
import { DesignAgent } from './agents/design_agent';
import { sessionCommand } from './cli/commands/session';
import { frameworkTestCommand } from './cli/commands/framework-test';
import { projectInitCommand } from './cli/commands/project-init';
import { frameworkStartCommand } from './cli/commands/framework-start';
import { architectureCommand } from './cli/commands/architecture';
import { bobCommand, bobStatusCommand } from './cli/commands/bob';
import { orchestrationCommand } from './cli/commands/orchestrate';

const program = new Command();

program
    .name('ai-engine')
    .description('AI Development Runtime - Execution Engine for AI-Assisted Development')
    .version('1.0.0');

// Repository Intelligence
program.addCommand(indexRepoCommand);
program.addCommand(searchCommand);
program.addCommand(searchSymbolsCommand);
program.addCommand(findDependentsCommand);
program.addCommand(embedCommand);
program.addCommand(statsCommand);
program.addCommand(researchCommand);
program.addCommand(overviewCommand);

// Phase 5: Session Persistence
program.addCommand(sessionCommand);

// Phase 2: Framework Health
program.addCommand(frameworkTestCommand);

// Phase 2: Project Initialization
program.addCommand(projectInitCommand);

// Phase 2: Framework Start
program.addCommand(frameworkStartCommand);

// Phase 6: Architecture Registry
program.addCommand(architectureCommand);

// Bob Framework Orchestration
program.addCommand(bobCommand);
program.addCommand(bobStatusCommand);

// Collaborative Orchestration
program.addCommand(orchestrationCommand);

program.command('run')
    .description('Runs the SDLC engine for a specific ticket')
    .argument('<ticketId>', 'The ticket ID to process (e.g., T-123)')
    .action(async (ticketId) => {
        try {
            console.log(`[Engine Boot] Starting AI SDLC Governance Runtime for ${ticketId}...`);
            await PhaseRunner.advanceTicket(ticketId);
        } catch (error: any) {
            console.error(`[Fatal Error] Engine failed to run for ${ticketId}:`, error.message);
            process.exit(1);
        }
    });

program.command('status')
    .description('Show current status of a ticket')
    .argument('<ticketId>', 'The ticket ID to check')
    .action(async (ticketId) => {
        try {
            const metadata = await StateManager.getMetadata(ticketId);
            const deps = await DependencyEngine.getInstance().canExecute(ticketId);
            
            console.log(`\n📋 Ticket: ${ticketId}`);
            console.log(`   Title: ${metadata.title || 'No title'}`);
            console.log(`   Status: ${metadata.status}`);
            console.log(`   Phase: ${metadata.current_phase}`);
            console.log(`   Type: ${metadata.ticket_type || 'feature'}`);
            if (metadata.layer) console.log(`   Layer: ${metadata.layer}`);
            
            if (metadata.depends_on && metadata.depends_on.length > 0) {
                console.log(`\n🔗 Dependencies:`);
                console.log(`   Can execute: ${deps.can_execute ? '✓ Yes' : '✗ No'}`);
                if (!deps.can_execute) {
                    console.log(`   Blocked by: ${deps.blocked_by.join(', ')}`);
                }
            }
            
            if (metadata.failure_count && metadata.failure_count > 0) {
                console.log(`\n⚠️  Failures: ${metadata.failure_count}`);
            }
            
            console.log('');
        } catch (error: any) {
            console.error(`Error: ${error.message}`);
            process.exit(1);
        }
    });

program.command('deps')
    .description('Show dependency tree for a ticket')
    .argument('<ticketId>', 'The ticket ID to analyze')
    .action(async (ticketId) => {
        try {
            const engine = DependencyEngine.getInstance();
            await engine.buildGraph();
            
            console.log(`\n📊 Dependency Tree for ${ticketId}:\n`);
            console.log(engine.getDependencyTree(ticketId));
        } catch (error: any) {
            console.error(`Error: ${error.message}`);
            process.exit(1);
        }
    });

program.command('next')
    .description('List tickets ready for execution')
    .action(async () => {
        try {
            const engine = DependencyEngine.getInstance();
            await engine.buildGraph();
            const ready = await engine.getReadyTickets();
            
            console.log(`\n🚀 Tickets Ready for Execution (${ready.length}):\n`);
            for (const ticketId of ready) {
                const metadata = await StateManager.getMetadata(ticketId);
                console.log(`   • ${ticketId}: ${metadata.title || 'No title'}`);
            }
            console.log('');
        } catch (error: any) {
            console.error(`Error: ${error.message}`);
            process.exit(1);
        }
    });

program.command('context')
    .description('Generate AI context pack for a ticket')
    .argument('<ticketId>', 'The ticket ID')
    .option('-o, --output <path>', 'Output file path')
    .action(async (ticketId, options) => {
        try {
            const builder = new ContextBuilder();
            const outputPath = options.output || await builder.generateContextFile(ticketId);
            
            console.log(`\n📝 Context pack generated: ${outputPath}`);
            console.log(`   AI should read this file for focused context.\n`);
        } catch (error: any) {
            console.error(`Error: ${error.message}`);
            process.exit(1);
        }
    });

program.command('validate')
    .description('Run all guards without advancing ticket')
    .argument('<ticketId>', 'The ticket ID to validate')
    .action(async (ticketId) => {
        try {
            console.log(`\n🔍 Validating ${ticketId}...\n`);
            const result = await ValidationRunner.runVerification(ticketId);
            console.log(result.output);
        } catch (error: any) {
            console.error(`Error: ${error.message}`);
            process.exit(1);
        }
    });

program.command('insights')
    .description('Show learning insights and metrics')
    .option('--export <path>', 'Export data to JSON file')
    .action((options) => {
        try {
            const learning = new LearningLayer();
            
            if (options.export) {
                const data = learning.exportData();
                const fs = require('fs');
                fs.writeFileSync(options.export, JSON.stringify(data, null, 2));
                console.log(`\n📊 Data exported to ${options.export}\n`);
            } else {
                const insights = learning.generateInsights();
                console.log(insights);
            }
        } catch (error: any) {
            console.error(`Error: ${error.message}`);
            process.exit(1);
        }
    });

// Agent System Commands

program.command('plan')
    .description('Run planner agent to create BLUEPRINT.md')
    .argument('<ticketId>', 'The ticket ID to plan')
    .action(async (ticketId) => {
        try {
            const metadata = await StateManager.getMetadata(ticketId);
            if (metadata.current_phase !== 'design') {
                console.log(`\n⚠️  Ticket is in ${metadata.current_phase} phase.`);
                console.log('   Planner should run in "design" phase.\n');
            }
            
            const planner = new PlannerAgent();
            const result = await planner.planTicket(ticketId);
            
            console.log(`\n📋 Planner agent completed for ${ticketId}.`);
            console.log(`   Output: ${result.blueprintPath}\n`);
        } catch (error: any) {
            console.error(`Error: ${error.message}`);
            process.exit(1);
        }
    });

program.command('design')
    .description('Run designer agent to create DESIGN.md')
    .argument('<ticketId>', 'The ticket ID to design')
    .action(async (ticketId) => {
        try {
            const metadata = await StateManager.getMetadata(ticketId);
            // Design can run in design phase or requirements (early scoping)
            
            const designer = new DesignAgent();
            const designPath = await designer.generateDesignFile(ticketId);
            
            console.log(`\n🎨 Designer agent completed for ${ticketId}.`);
            console.log(`   Output: ${designPath}\n`);
        } catch (error: any) {
            console.error(`Error: ${error.message}`);
            process.exit(1);
        }
    });

program.command('execute')
    .description('Run executor agent to implement BLUEPRINT')
    .argument('<ticketId>', 'The ticket ID to execute')
    .action(async (ticketId) => {
        try {
            const metadata = await StateManager.getMetadata(ticketId);
            if (metadata.current_phase !== 'implement') {
                console.log(`\n⚠️  Ticket is in ${metadata.current_phase} phase.`);
                console.log('   Executor should run in "implement" phase.\n');
            }
            
            const executor = new ExecutorAgent();
            const result = await executor.executeTicket(ticketId);
            
            console.log(`\n🔨 Executor agent completed for ${ticketId}.`);
            console.log(`   Output: ${result.recordPath}\n`);
        } catch (error: any) {
            console.error(`Error: ${error.message}`);
            process.exit(1);
        }
    });

program.command('verify')
    .description('Run verifier agent to validate changes')
    .argument('<ticketId>', 'The ticket ID to verify')
    .action(async (ticketId) => {
        try {
            const metadata = await StateManager.getMetadata(ticketId);
            if (metadata.current_phase !== 'validate') {
                console.log(`\n⚠️  Ticket is in ${metadata.current_phase} phase.`);
                console.log('   Verifier should run in "validate" phase.\n');
            }
            
            const verifier = new VerifierAgent();
            const result = await verifier.verifyTicket(ticketId);
            
            console.log(`\n✅ Verifier agent completed for ${ticketId}.`);
            console.log(`   Output: ${result.verificationPath}\n`);
        } catch (error: any) {
            console.error(`Error: ${error.message}`);
            process.exit(1);
        }
    });

program.command('agent-status')
    .description('Check agent execution status for a ticket')
    .argument('<ticketId>', 'The ticket ID')
    .action(async (ticketId) => {
        try {
            const ticketPath = await StateManager.getTicketPath(ticketId);
            if (!ticketPath) {
                throw new Error(`Ticket ${ticketId} not found`);
            }

            const fs = require('fs-extra');
            const path = require('path');
            const ticketDir = path.dirname(ticketPath);
            
            console.log(`\n🤖 Agent Execution Status for ${ticketId}:\n`);
            
            const agents = [
                { name: 'Researcher', file: 'RESEARCH.md', agent: 'ai-researcher' },
                { name: 'Planner', file: 'BLUEPRINT.md', agent: 'ai-planner' },
                { name: 'Executor', file: 'RECORD.md', agent: 'ai-executor' },
                { name: 'Verifier', file: 'VERIFICATION.md', agent: 'ai-verifier' }
            ];

            let completeCount = 0;
            for (const agent of agents) {
                const filePath = path.join(ticketDir, agent.file);
                const exists = await fs.pathExists(filePath);
                const status = exists ? '✓ Complete' : '○ Pending';
                if (exists) completeCount++;
                console.log(`   ${agent.name.padEnd(12)} ${status}`);
                console.log(`              └─ ${agent.file}`);
            }
            
            console.log(`\n   Progress: ${completeCount}/${agents.length} agents complete\n`);
            
            if (completeCount === 0) {
                console.log('   Next: Run `ai-engine research ' + ticketId + '` to start\n');
            } else if (completeCount < agents.length) {
                console.log('   Next: Continue with next agent in pipeline\n');
            } else {
                console.log('   ✅ All agents complete! Ticket ready for DONE phase.\n');
            }
        } catch (error: any) {
            console.error(`Error: ${error.message}`);
            process.exit(1);
        }
    });

program.command('agents')
    .description('List available agents and their purposes')
    .action(() => {
        console.log('\n🤖 AI Agent System\n');
        console.log('Specialized AI agents for different phases of development:\n');
        
        const agents = [
            {
                name: 'ai-researcher',
                cmd: 'research',
                desc: 'Discovers patterns, maps codebase, finds relevant skills',
                input: 'Ticket metadata, PRD',
                output: 'RESEARCH.md'
            },
            {
                name: 'ai-planner',
                cmd: 'plan',
                desc: 'Creates detailed implementation BLUEPRINT',
                input: 'RESEARCH.md, PRD',
                output: 'BLUEPRINT.md'
            },
            {
                name: 'ai-executor',
                cmd: 'execute',
                desc: 'Implements code according to BLUEPRINT',
                input: 'BLUEPRINT.md',
                output: 'RECORD.md'
            },
            {
                name: 'ai-verifier',
                cmd: 'verify',
                desc: 'Validates implementation independently',
                input: 'BLUEPRINT.md, RECORD.md',
                output: 'VERIFICATION.md'
            }
        ];

        for (const agent of agents) {
            console.log(`   ${agent.name}`);
            console.log(`   Command: ai-engine ${agent.cmd} <ticket>`);
            console.log(`   Purpose: ${agent.desc}`);
            console.log(`   Input:   ${agent.input}`);
            console.log(`   Output:  ${agent.output}`);
            console.log('');
        }
        
        console.log('Usage Flow:\n');
        console.log('   research → plan → execute → verify');
        console.log('');
    });

program.parse(process.argv);
