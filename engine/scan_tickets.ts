(async () => {
  try {
    const mod = await import('./src/bob/action_handlers/planning');
    if (!mod.generateTickets) {
      console.error('generateTickets not found on module', Object.keys(mod));
      process.exit(2);
    }
    const res = await mod.generateTickets({});
    console.log('GENERATE_TICKETS_RESULT:\n', JSON.stringify(res, null, 2));
    
    // Important reminder for agents
    console.log('\n' + '='.repeat(80));
    console.log('🚨 IMPORTANT REMINDER FOR AGENTS:');
    console.log('='.repeat(80));
    console.log('The automated scanner provides INITIAL SCAFFOLDING ONLY.');
    console.log('Track decisions may be inaccurate - this is expected behavior.');
    console.log('');
    console.log('⚡ BEFORE STARTING WORK ON ANY TICKET:');
    console.log('1. Run the manual decision gate using WORKFLOW_DECISION_GATE.md');
    console.log('2. Update TRACK_DECISION.md if the scanner was wrong');
    console.log('3. Update metadata.json track field if needed');
    console.log('4. Follow the correct workflow (Track A vs Track B)');
    console.log('');
    console.log('📖 Reference: .agent/rules/TICKET_SCOPING.md');
    console.log('📖 Reference: project-management/WORKFLOW_DECISION_GATE.md');
    console.log('='.repeat(80));
    
    // Action items for agents
    if (res.success && res.data && typeof res.data === 'object' && 'tickets_created' in res.data && typeof res.data.tickets_created === 'number' && res.data.tickets_created > 0) {
      console.log('\n' + '🎯 ACTION ITEMS FOR AGENTS:');
      console.log('='.repeat(80));
      console.log(`📋 ${res.data.tickets_created} new tickets generated. Please complete these tasks:`);
      console.log('');
      
      // Check if tickets are from backlog or epic
      const summary = res.data.summary as any;
      const backlogTickets = summary?.by_epic?.backlog || 0;
      const epicTickets = Object.entries(summary?.by_epic || {})
        .filter(([epic]) => epic !== 'backlog')
        .reduce((sum, [, count]) => sum + (count as number || 0), 0);
      
      if (backlogTickets > 0) {
        console.log(`🔄 BACKLOG TICKETS (${backlogTickets}):`);
        console.log('   1. Scope each backlog ticket (requirements, design, planning, testing)');
        console.log('   2. Remove from backlog.md after scoping is complete');
        console.log('   3. Update metadata.json status to "scoped"');
        console.log('   4. Move to appropriate epic if needed');
        console.log('');
      }
      
      if (epicTickets > 0) {
        console.log(`📚 EPIC TICKETS (${epicTickets}):`);
        console.log('   1. Scope each ticket within its epic');
        console.log('   2. Update epic README.md with ticket status');
        console.log('   3. Mark epic as "in_progress" if development begins');
        console.log('');
      }
      
      console.log('🔍 SCOPING CHECKLIST FOR EACH TICKET:');
      console.log('   □ Run manual decision gate (WORKFLOW_DECISION_GATE.md)');
      console.log('   □ Update TRACK_DECISION.md if needed');
      console.log('   □ Create requirements/README.md');
      console.log('   □ Create design/README.md');
      console.log('   □ Create planning/README.md');
      console.log('   □ Create testing/README.md');
      console.log('   □ Update metadata.json with scoping information');
      console.log('   □ Update backlog.md (remove if from backlog)');
      console.log('   □ Update epic README.md (if from epic)');
      console.log('');
      console.log('⚡ Run this command to start scoping:');
      console.log('   "Please scope the generated tickets following the TICKET_SCOPING.md rules"');
      console.log('='.repeat(80));
    }
    
  } catch (e) {
    console.error('Error running generateTickets:', e);
    process.exit(1);
  }
})();
