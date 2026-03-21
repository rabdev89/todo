const fs = require('fs');
const path = require('path');

const agentsDir = path.join(__dirname, '..', 'agents');

function checkPrompt(agentPath) {
  const sysPath = path.join(agentPath, 'system-prompt.md');
  if (!fs.existsSync(sysPath)) return { ok: false, reason: 'missing system-prompt.md' };
  const text = fs.readFileSync(sysPath, 'utf8');
  const hasOutput = /Output:/i.test(text) || /Output\s*:/i.test(text);
  const hasActivation = /When You Are Activated/i.test(text) || /When You Are Activated\s*:/i.test(text);
  return { ok: hasOutput && hasActivation, hasOutput, hasActivation };
}

function main() {
  if (!fs.existsSync(agentsDir)) {
    console.error('Agents dir not found:', agentsDir);
    process.exit(2);
  }
  const entries = fs.readdirSync(agentsDir, { withFileTypes: true });
  let allOk = true;
  entries.forEach(e => {
    if (!e.isDirectory()) return;
    const agentPath = path.join(agentsDir, e.name);
    const res = checkPrompt(agentPath);
    if (res.ok) {
      console.log(`OK: ${e.name}`);
    } else {
      allOk = false;
      console.warn(`WARN: ${e.name} - ${res.reason || `hasOutput=${res.hasOutput} hasActivation=${res.hasActivation}`}`);
    }
  });
  process.exit(allOk ? 0 : 1);
}

if (require.main === module) main();
