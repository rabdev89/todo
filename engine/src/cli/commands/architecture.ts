import { Command } from 'commander';
import * as path from 'path';
import { ArchitectureRegistry } from '../../architecture_registry';
import { ArchitectureGuard } from '../../architecture_guard';

async function loadChalk() {
  const mod = await import('chalk');
  return (mod as any).default || mod;
}

export const architectureCommand = new Command('architecture')
  .alias('arch')
  .description('Architecture registry and validation commands')
  .addCommand(
    new Command('register')
      .description('Register a module in the architecture registry')
      .argument('<name>', 'Module name (e.g., AuthService)')
      .argument('<type>', 'Module type (service|manager|repository|controller|component|model|utility|middleware|handler|config)')
      .argument('<file>', 'Primary file path for the module')
      .option('-d, --description <desc>', 'Module description')
      .option('-r, --responsibilities <list>', 'Comma-separated responsibilities')
      .option('-t, --ticket <ticketId>', 'Associated ticket ID')
      .action(async (name, type, file, options) => {
        try {
          const chalk = await loadChalk();
          const registry = ArchitectureRegistry.getInstance();
          
          const responsibilities = options.responsibilities 
            ? options.responsibilities.split(',').map((r: string) => r.trim())
            : [];

          const module = registry.registerModule(name, type, file, {
            description: options.description,
            responsibilities,
            ticketId: options.ticket
          });

          console.log(chalk.green(`✓ Registered module: ${module.name}`));
          console.log(chalk.gray(`  Type: ${module.type}`));
          console.log(chalk.gray(`  File: ${module.primaryFile}`));
          if (module.responsibilities.length > 0) {
            console.log(chalk.gray(`  Responsibilities: ${module.responsibilities.join(', ')}`));
          }
        } catch (error) {
          const chalk = await loadChalk();
          console.error(chalk.red(`Error registering module: ${error}`));
          process.exit(1);
        }
      })
  )
  .addCommand(
    new Command('query')
      .description('Query the architecture registry')
      .option('-t, --type <type>', 'Filter by module type')
      .option('-n, --name <name>', 'Search by module name')
      .option('-m, --module <module>', 'Query specific module')
      .action(async (options) => {
        try {
          const chalk = await loadChalk();
          const registry = ArchitectureRegistry.getInstance();
          
          if (options.module) {
            // Query specific module
            const module = registry.getModule(options.module);
            if (!module) {
              console.log(chalk.yellow(`Module '${options.module}' not found`));
              return;
            }
            
            console.log(chalk.bold(`\n${module.name}`));
            console.log(chalk.gray(`Type: ${module.type}`));
            console.log(chalk.gray(`File: ${module.primaryFile}`));
            if (module.description) {
              console.log(`\n${module.description}`);
            }
            if (module.responsibilities.length > 0) {
              console.log(chalk.bold('\nResponsibilities:'));
              for (const resp of module.responsibilities) {
                console.log(`  • ${resp}`);
              }
            }
            if (module.dependencies.length > 0) {
              console.log(chalk.bold('\nDependencies:'));
              for (const dep of module.dependencies) {
                console.log(`  → ${dep}`);
              }
            }
            if (module.exposedInterfaces.length > 0) {
              console.log(chalk.bold('\nPublic API:'));
              for (const iface of module.exposedInterfaces.slice(0, 10)) {
                console.log(`  • ${iface}`);
              }
            }
          } else {
            // Query multiple modules
            const modules = registry.query({
              type: options.type,
              name: options.name
            });

            if (modules.length === 0) {
              console.log(chalk.yellow('No modules found matching criteria'));
              return;
            }

            console.log(chalk.bold(`\nFound ${modules.length} module(s):\n`));
            
            // Group by type
            const byType = new Map<string, typeof modules>();
            for (const m of modules) {
              if (!byType.has(m.type)) byType.set(m.type, []);
              byType.get(m.type)!.push(m);
            }

            for (const [type, typeModules] of byType) {
              console.log(chalk.cyan(`${type}s:`));
              for (const m of typeModules) {
                console.log(`  ${m.name} - ${path.basename(m.primaryFile)}`);
              }
              console.log('');
            }
          }
        } catch (error) {
          const chalk = await loadChalk();
          console.error(chalk.red(`Error querying registry: ${error}`));
          process.exit(1);
        }
      })
  )
  .addCommand(
    new Command('validate')
      .description('Validate architecture layer rules and import violations')
      .option('-f, --files <patterns...>', 'Specific file patterns to validate')
      .action(async (options) => {
        try {
          const chalk = await loadChalk();
          const guard = new ArchitectureGuard();
          
          console.log(chalk.bold('\nRunning architecture validation...\n'));
          
          const result = await guard.checkImports(options.files);

          // Show layer distribution
          console.log(chalk.bold('Layer Distribution:'));
          for (const [layer, files] of result.layersDetected) {
            console.log(`  ${layer}: ${files.length} files`);
          }
          console.log('');

          // Show violations
          if (result.valid) {
            console.log(chalk.green('✓ No architecture violations detected'));
          } else {
            console.log(chalk.red(`✗ ${result.violations.length} architecture violation(s):\n`));
            
            const byLayer = new Map<string, typeof result.violations>();
            for (const v of result.violations) {
              if (!byLayer.has(v.layer)) byLayer.set(v.layer, []);
              byLayer.get(v.layer)!.push(v);
            }

            for (const [layer, violations] of byLayer) {
              console.log(chalk.yellow(`${layer} layer:`));
              for (const v of violations) {
                console.log(chalk.red(`  ✗ ${path.basename(v.file)}`));
                console.log(chalk.gray(`    imports from ${v.importedLayer}: ${path.basename(v.importedFile)}`));
                console.log(chalk.gray(`    ${v.reason}\n`));
              }
            }
            
            process.exit(1);
          }
        } catch (error) {
          const chalk = await loadChalk();
          console.error(chalk.red(`Error validating architecture: ${error}`));
          process.exit(1);
        }
      })
  )
  .addCommand(
    new Command('rules')
      .description('Display current architecture layer rules')
      .action(async () => {
        try {
          const chalk = await loadChalk();
          const guard = new ArchitectureGuard();
          const doc = guard.generateRulesDoc();
          console.log(doc);
        } catch (error) {
          const chalk = await loadChalk();
          console.error(chalk.red(`Error displaying rules: ${error}`));
          process.exit(1);
        }
      })
  )
  .addCommand(
    new Command('update')
      .description('Update architecture registry from current codebase')
      .option('-s, --scan', 'Scan codebase to auto-detect modules', true)
      .option('-t, --ticket <ticketId>', 'Associate with ticket ID')
      .action(async (options) => {
        try {
          const chalk = await loadChalk();
          const registry = ArchitectureRegistry.getInstance();
          
          console.log(chalk.bold('\nUpdating architecture registry...\n'));
          
          if (options.scan) {
            const result = registry.autoDetectModules('./src', options.ticket);
            
            if (result.added.length > 0) {
              console.log(chalk.green(`Added ${result.added.length} new module(s):`));
              for (const m of result.added) {
                console.log(`  + ${m.name} (${m.type})`);
              }
            }
            
            if (result.existing.length > 0) {
              console.log(chalk.gray(`\nSkipped ${result.existing.length} existing module(s)`));
            }
            
            if (result.added.length === 0 && result.existing.length === 0) {
              console.log(chalk.yellow('No modules detected in codebase'));
            }
          }
          
          console.log(chalk.green('\n✓ Registry updated successfully'));
        } catch (error) {
          const chalk = await loadChalk();
          console.error(chalk.red(`Error updating registry: ${error}`));
          process.exit(1);
        }
      })
  )
  .addCommand(
    new Command('suggest')
      .description('Suggest existing modules for a responsibility')
      .argument('<responsibility>', 'What functionality is needed (e.g., "user authentication")')
      .option('-t, --type <type>', 'Preferred module type')
      .action(async (responsibility, options) => {
        try {
          const chalk = await loadChalk();
          const registry = ArchitectureRegistry.getInstance();
          
          console.log(chalk.bold(`\nChecking for existing modules that handle: "${responsibility}"\n`));
          
          if (options.type) {
            const suggestion = registry.suggestExistingModule(responsibility, options.type);
            if (suggestion) {
              console.log(chalk.yellow('Found existing module with similar responsibility:'));
              console.log(chalk.bold(`\n  ${suggestion.existingModule.name}`));
              console.log(chalk.gray(`  ${suggestion.existingModule.primaryFile}`));
              console.log(chalk.gray(`  Confidence: ${suggestion.confidence}`));
              console.log(`\n${suggestion.reason}`);
              console.log(chalk.cyan(`\nConsider using ${suggestion.existingModule.name} instead of creating a new module.`));
            } else {
              console.log(chalk.green('No existing module found. Safe to create a new one.'));
            }
          } else {
            const suggestion = registry.suggestModuleForResponsibility(responsibility);
            if (suggestion) {
              console.log(chalk.cyan(`Suggested module: ${suggestion.name}`));
              console.log(chalk.gray(`  Type: ${suggestion.type}`));
              console.log(chalk.gray(`  File: ${suggestion.primaryFile}`));
              if (suggestion.responsibilities.length > 0) {
                console.log(chalk.gray(`  Handles: ${suggestion.responsibilities.join(', ')}`));
              }
            } else {
              console.log(chalk.yellow('No suitable module found'));
            }
          }
        } catch (error) {
          const chalk = await loadChalk();
          console.error(chalk.red(`Error suggesting module: ${error}`));
          process.exit(1);
        }
      })
  )
  .addCommand(
    new Command('export')
      .description('Export architecture registry as markdown documentation')
      .option('-o, --output <path>', 'Output file path')
      .action(async (options) => {
        try {
          const chalk = await loadChalk();
          const registry = ArchitectureRegistry.getInstance();
          const doc = registry.exportDocumentation();
          
          if (options.output) {
            const fs = await import('fs');
            fs.writeFileSync(options.output, doc, 'utf8');
            console.log(chalk.green(`Documentation exported to: ${options.output}`));
          } else {
            console.log(doc);
          }
        } catch (error) {
          const chalk = await loadChalk();
          console.error(chalk.red(`Error exporting documentation: ${error}`));
          process.exit(1);
        }
      })
  );

export default architectureCommand;
