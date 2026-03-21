// Minimal orchestrator stub for agents
import * as fs from 'fs';
import * as path from 'path';

const registryPath = path.join(__dirname, '..', 'agents', 'registry.json');

function loadRegistry() {
  if (!fs.existsSync(registryPath)) {
    console.error('Registry not found:', registryPath);
    process.exit(1);
  }
  const raw = fs.readFileSync(registryPath, 'utf8');
  return JSON.parse(raw);
}

function listAgents() {
  const reg = loadRegistry();
  console.log('Agents registry:');
  reg.agents.forEach((a: any) => {
    console.log(`- ${a.name}: trigger=${a.trigger.join(', ')} output=${a.output}`);
  });
}

if (require.main === module) {
  listAgents();
}

export { loadRegistry, listAgents };
