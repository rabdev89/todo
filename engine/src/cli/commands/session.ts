/**
 * Session CLI Commands
 * 
 * Provides command-line interface for session management:
 * - session start: Create a new session
 * - session list: List recent sessions
 * - session stats: Show session statistics
 * - session current: Show current session
 * - session use: Switch to a session
 * 
 * Phase 5: Session Persistence & Parallel Processing
 */

import { Command } from 'commander';
import { SessionManager } from '../../session/session_manager';

export const sessionCommand = new Command('session')
  .description('Session persistence management for Repository Intelligence')
  .addCommand(
    new Command('start')
      .description('Start a new session for the current project')
      .option('-n, --name <name>', 'Session name (optional)')
      .action(async (options) => {
        try {
          const sessionManager = new SessionManager();
          const projectPath = process.cwd();
          const sessionId = await sessionManager.createSession(projectPath);
          
          console.log(`\n✅ Session started: ${sessionId}`);
          console.log(`   Project: ${projectPath}`);
          if (options.name) {
            console.log(`   Name: ${options.name}`);
          }
          console.log(`\n💡 To use this session, set the environment variable:`);
          console.log(`   export AI_SESSION_ID=${sessionId}`);
          console.log(`\n   Or use --session flag with commands:`);
          console.log(`   ai-engine research T-001 --session ${sessionId}`);
          
          sessionManager.close();
        } catch (error: any) {
          console.error(`❌ Error creating session: ${error.message}`);
          process.exit(1);
        }
      })
  )
  .addCommand(
    new Command('list')
      .description('List recent sessions')
      .option('-n, --limit <number>', 'Number of sessions to show', '10')
      .action(async (options) => {
        try {
          const sessionManager = new SessionManager();
          const sessions = await sessionManager.listSessions(parseInt(options.limit));
          
          if (sessions.length === 0) {
            console.log('\n📭 No sessions found.\n');
            console.log('   Create one with: ai-engine session start');
            sessionManager.close();
            return;
          }
          
          console.log(`\n📋 Recent Sessions (${sessions.length}):\n`);
          console.log('ID                                    | Project                    | Queries | Last Activity');
          console.log('-'.repeat(100));
          
          for (const session of sessions) {
            const projectName = session.projectPath.split(/[/\\]/).pop() || session.projectPath;
            const lastActivity = new Date(session.lastActivity).toLocaleString();
            console.log(
              `${session.id.substring(0, 36).padEnd(36)} | ${projectName.padEnd(26)} | ${session.queryCount.toString().padEnd(7)} | ${lastActivity}`
            );
          }
          
          console.log();
          sessionManager.close();
        } catch (error: any) {
          console.error(`❌ Error listing sessions: ${error.message}`);
          process.exit(1);
        }
      })
  )
  .addCommand(
    new Command('stats')
      .description('Show session statistics and learned patterns')
      .argument('<sessionId>', 'Session ID')
      .action(async (sessionId) => {
        try {
          const sessionManager = new SessionManager();
          const session = await sessionManager.getSession(sessionId);
          
          if (!session) {
            console.error(`❌ Session ${sessionId} not found`);
            sessionManager.close();
            process.exit(1);
          }
          
          const stats = await sessionManager.getSessionStats(sessionId);
          const context = await sessionManager.getSessionContext(sessionId);
          
          console.log(`\n📊 Session Statistics: ${sessionId.substring(0, 8)}...\n`);
          console.log(`   Project: ${session.projectPath}`);
          console.log(`   Started: ${new Date(session.startTime).toLocaleString()}`);
          console.log(`   Last Activity: ${new Date(session.lastActivity).toLocaleString()}`);
          console.log(`   Total Queries: ${stats.queryCount}`);
          
          if (stats.learnedPatterns.length > 0) {
            console.log(`\n   🏗️ Learned Patterns (${stats.learnedPatterns.length}):`);
            stats.learnedPatterns.slice(0, 10).forEach((pattern: string, i: number) => {
              const frequency = context.patterns.get(pattern) || 0;
              console.log(`      ${i + 1}. ${pattern} (seen ${frequency} times)`);
            });
          }
          
          if (stats.topFiles.length > 0) {
            console.log(`\n   📁 Top Relevant Files (${stats.topFiles.length}):`);
            stats.topFiles.slice(0, 5).forEach((file: string, i: number) => {
              const relevance = context.fileRelevance.get(file) || 0;
              const fileName = file.split(/[/\\]/).pop() || file;
              console.log(`      ${i + 1}. ${fileName} (relevance: ${relevance.toFixed(2)})`);
            });
          }
          
          console.log();
          sessionManager.close();
        } catch (error: any) {
          console.error(`❌ Error getting session stats: ${error.message}`);
          process.exit(1);
        }
      })
  )
  .addCommand(
    new Command('current')
      .description('Show current active session')
      .action(async () => {
        const sessionId = process.env.AI_SESSION_ID;
        
        if (!sessionId) {
          console.log('\n📭 No active session.\n');
          console.log('   Set AI_SESSION_ID environment variable or use --session flag.');
          console.log('   Create a session: ai-engine session start');
          return;
        }
        
        try {
          const sessionManager = new SessionManager();
          const session = await sessionManager.getSession(sessionId);
          
          if (!session) {
            console.log(`\n⚠️  Session ${sessionId.substring(0, 8)}... not found.`);
            console.log('   It may have been cleaned up or the ID is invalid.');
            sessionManager.close();
            return;
          }
          
          console.log(`\n📋 Current Session: ${sessionId}\n`);
          console.log(`   Project: ${session.projectPath}`);
          console.log(`   Queries: ${session.queryCount}`);
          console.log(`   Started: ${new Date(session.startTime).toLocaleString()}`);
          console.log(`   Last Activity: ${new Date(session.lastActivity).toLocaleString()}`);
          console.log();
          
          sessionManager.close();
        } catch (error: any) {
          console.error(`❌ Error: ${error.message}`);
          process.exit(1);
        }
      })
  )
  .addCommand(
    new Command('use')
      .description('Switch to a specific session')
      .argument('<sessionId>', 'Session ID to switch to')
      .action(async (sessionId) => {
        try {
          const sessionManager = new SessionManager();
          const session = await sessionManager.getSession(sessionId);
          
          if (!session) {
            console.error(`❌ Session ${sessionId} not found`);
            sessionManager.close();
            process.exit(1);
          }
          
          console.log(`\n✅ Switched to session: ${sessionId}`);
          console.log(`   Project: ${session.projectPath}`);
          console.log(`   Queries: ${session.queryCount}`);
          console.log(`\n💡 Set the environment variable to use this session:`);
          console.log(`   export AI_SESSION_ID=${sessionId}`);
          console.log();
          
          sessionManager.close();
        } catch (error: any) {
          console.error(`❌ Error switching session: ${error.message}`);
          process.exit(1);
        }
      })
  )
  .addCommand(
    new Command('cleanup')
      .description('Clean up old sessions')
      .option('-d, --days <days>', 'Delete sessions older than N days', '30')
      .action(async (options) => {
        try {
          const sessionManager = new SessionManager();
          const maxAgeMs = parseInt(options.days) * 24 * 60 * 60 * 1000;
          
          console.log(`\n🧹 Cleaning up sessions older than ${options.days} days...\n`);
          
          const deleted = await sessionManager.cleanupOldSessions(maxAgeMs);
          
          console.log(`   Deleted ${deleted} old session(s).\n`);
          
          sessionManager.close();
        } catch (error: any) {
          console.error(`❌ Error cleaning up sessions: ${error.message}`);
          process.exit(1);
        }
      })
  );

// Export for use in main CLI
export default sessionCommand;
