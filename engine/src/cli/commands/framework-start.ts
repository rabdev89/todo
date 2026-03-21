import { Command } from 'commander';
import { execSync } from 'child_process';
import * as fs from 'fs-extra';
import * as path from 'path';

export const frameworkStartCommand = new Command('framework-start')
  .description('Start all required framework services and initialize health monitoring')
  .action(async () => {
    console.log('\n🚀 Starting BOB Framework Services...\n');

    const services = [
      {
        name: 'Qdrant',
        check: 'docker ps | grep qdrant',
        start: 'docker run -d --name qdrant -p 6333:6333 -v qdrant_storage:/qdrant/storage qdrant/qdrant',
        required: true
      },
      {
        name: 'Ollama',
        check: 'curl -s http://localhost:11434/api/tags',
        start: 'echo "Please start Ollama manually with: ollama serve"',
        required: false
      }
    ];

    for (const service of services) {
      console.log(`Checking ${service.name}...`);
      try {
        if (service.name === 'Ollama') {
            // Special check for Ollama via curl
            execSync(service.check, { stdio: 'ignore' });
            console.log(`✅ ${service.name} is already running.`);
        } else {
            execSync(service.check, { stdio: 'ignore' });
            console.log(`✅ ${service.name} is already running.`);
        }
      } catch (error) {
        console.log(`⚠️  ${service.name} is not running. Attempting to start...`);
        try {
          if (service.start.startsWith('echo')) {
            console.log(service.start.replace('echo "', '').replace('"', ''));
          } else {
            execSync(service.start, { stdio: 'inherit' });
            console.log(`✅ ${service.name} started successfully.`);
          }
        } catch (startError: any) {
          if (service.required) {
            console.error(`❌ Failed to start required service ${service.name}: ${startError.message}`);
          } else {
            console.warn(`⚠️  Could not start optional service ${service.name}.`);
          }
        }
      }
    }

    // Initialize the hourly check flag
    const flagDir = path.resolve(process.cwd(), '..', '.agent', 'flags');
    await fs.ensureDir(flagDir);
    const flagFile = path.join(flagDir, 'last-status-check.txt');
    await fs.writeFile(flagFile, new Date().toISOString());
    
    console.log(`\n📅 Health monitoring initialized. Flag: ${flagFile}`);
    console.log('\n✅ Framework start sequence complete.\n');
  });
