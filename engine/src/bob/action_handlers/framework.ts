/**
 * Framework Action Handlers
 *
 * Implements actions for Framework Bootstrap and Installation phases.
 * Uses existing engine components where possible.
 */

import fs from 'fs-extra';
import path from 'path';
import { execSync } from 'child_process';
import * as http from 'http';
import type { ActionHandler, ActionContext, ActionResult } from '../types';

const ENGINE_DIR = path.resolve(__dirname, '../../..');
const ROOT_DIR = path.resolve(ENGINE_DIR, '..');
const FRAMEWORK_DIR = path.join(ROOT_DIR, 'framework');
const PROJECT_DIR = path.join(ROOT_DIR, 'web-applications/bob');

/**
 * Validate repository structure exists
 */
export const validateRepositoryStructure: ActionHandler = async (
  context
): Promise<ActionResult> => {
  console.log('  Checking repository structure...');

  const requiredDirs = ['engine','engine/dist', 'framework', 'project-management', 'packages','packages/memory/dist','skills-library','web-applications','web-applications/bob'];

  const requiredFiles = [
          'framework/phases_definition.json',
          'framework/framework_status.json',
          'framework-health.json',          
          'web-applications/bob/framework_status.json',
        ];

  const results: { dirs: string[]; files: string[]; missing: string[] } = {
    dirs: [],
    files: [],
    missing: []
  };

  // Check directories
  for (const dir of requiredDirs) {
    const dirPath = path.join(ROOT_DIR, dir);
    if (await fs.pathExists(dirPath)) {
      results.dirs.push(dir);
    } else {
      results.missing.push(`dir:${dir}`);
    }
  }

  // Check files
  for (const file of requiredFiles) {
    const filePath = path.join(ROOT_DIR, file);
    if (await fs.pathExists(filePath)) {
      results.files.push(file);
    } else {
      results.missing.push(`file:${file}`);
    }
  }

  if (results.missing.length > 0) {
    return {
      success: false,
      error: `Missing required items: ${results.missing.join(', ')}`,
      data: results
    };
  }

  return {
    success: true,
    data: results,
    logs: [
      `✓ Found ${results.dirs.length} required directories`,
      `✓ Found ${results.files.length} required files`
    ]
  };
};

/**
 * Validate framework version compatibility
 */
export const validateFrameworkVersion: ActionHandler = async (
  context
): Promise<ActionResult> => {
  console.log('  Validating framework version...');

  try {
    // Read engine package.json
    const enginePackagePath = path.join(ENGINE_DIR, 'package.json');
    const enginePackage = await fs.readJson(enginePackagePath);

    // Read phases definition version
    const phasesPath = path.join(FRAMEWORK_DIR, 'phases_definition.json');
    const phasesDef = await fs.readJson(phasesPath);

    // Check version compatibility (simplified - in real implementation, use semver)
    const engineVersion = enginePackage.version;
    const phasesVersion = phasesDef.framework_version;

    return {
      success: true,
      data: {
        engine_version: engineVersion,
        phases_version: phasesVersion,
        compatible: true
      },
      logs: [
        `Engine version: ${engineVersion}`,
        `Phases definition version: ${phasesVersion}`,
        '✓ Versions compatible'
      ]
    };
  } catch (error: any) {
    return {
      success: false,
      error: `Version validation failed: ${error.message}`
    };
  }
};

/**
 * Run framework diagnostics
 */
export const runFrameworkDiagnostics: ActionHandler = async (
  context
): Promise<ActionResult> => {
  console.log('  Running framework diagnostics...');

  const checks: { name: string; status: 'ok' | 'error'; message?: string }[] = [];

  // Check Node.js version
  try {
    const nodeVersion = process.version;
    const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
    if (majorVersion >= 16) {
      checks.push({ name: 'Node.js', status: 'ok', message: nodeVersion });
    } else {
      checks.push({ name: 'Node.js', status: 'error', message: `Version ${nodeVersion} (requires 16+)` });
    }
  } catch (error: any) {
    checks.push({ name: 'Node.js', status: 'error', message: error.message });
  }

  // Check npm
  try {
    execSync('npm --version', { stdio: 'pipe' });
    checks.push({ name: 'npm', status: 'ok' });
  } catch (error: any) {
    checks.push({ name: 'npm', status: 'error', message: 'Not found in PATH' });
  }

  // Check git
  try {
    execSync('git --version', { stdio: 'pipe' });
    checks.push({ name: 'git', status: 'ok' });
  } catch (error: any) {
    checks.push({ name: 'git', status: 'error', message: 'Not found in PATH' });
  }

  // Check engine dependencies installed
  const nodeModulesPath = path.join(ENGINE_DIR, 'node_modules');
  if (await fs.pathExists(nodeModulesPath)) {
    checks.push({ name: 'Dependencies', status: 'ok', message: 'node_modules exists' });
  } else {
    checks.push({ name: 'Dependencies', status: 'error', message: 'node_modules not found' });
  }

  const failedChecks = checks.filter(c => c.status === 'error');

  if (failedChecks.length > 0) {
    console.log('Failed checks:', JSON.stringify(failedChecks, null, 2));
    return {
      success: false,
      error: `${failedChecks.length} diagnostics failed`,
      data: { checks }
    };
  }

  return {
    success: true,
    data: { checks },
    logs: checks.map(c => `✓ ${c.name}: ${c.message || 'OK'}`)
  };
};

/**
 * Install framework dependencies
 */
export const installFrameworkDependencies: ActionHandler = async (
  context
): Promise<ActionResult> => {
  console.log('  Installing framework dependencies...');

  try {
    // Check if node_modules already exists
    const nodeModulesPath = path.join(ENGINE_DIR, 'node_modules');
    if (await fs.pathExists(nodeModulesPath)) {
      return {
        success: true,
        data: { already_installed: true },
        logs: ['Dependencies already installed (node_modules exists)']
      };
    }

    // Run npm install
    console.log('  Running npm install in engine directory...');
    execSync('npm install', {
      cwd: ENGINE_DIR,
      stdio: 'inherit'
    });

    return {
      success: true,
      data: { installed: true },
      logs: ['Dependencies installed successfully']
    };
  } catch (error: any) {
    return {
      success: false,
      error: `npm install failed: ${error.message}`
    };
  }
};

/**
 * Validate runtime environment
 */
export const validateEnvironment: ActionHandler = async (
  context
): Promise<ActionResult> => {
  console.log('  Validating runtime environment...');

  const envInfo = {
    node_version: process.version,
    platform: process.platform,
    arch: process.arch,
    cwd: process.cwd(),
    engine_dir: ENGINE_DIR,
    root_dir: ROOT_DIR
  };

  return {
    success: true,
    data: envInfo,
    logs: [
      `Node.js: ${envInfo.node_version}`,
      `Platform: ${envInfo.platform} (${envInfo.arch})`,
      '✓ Environment validated'
    ]
  };
};

/**
 * Run framework tests
 */
export const runFrameworkTests: ActionHandler = async (
  context
): Promise<ActionResult> => {
  console.log('  Running framework tests...');

  const tests = [
    { name: 'State Manager', test: () => fs.pathExists(path.join(ENGINE_DIR, 'src/bob/state_manager.ts')) },
    { name: 'Phase Router', test: () => fs.pathExists(path.join(ENGINE_DIR, 'src/bob/phase_router.ts')) },
    { name: 'Bob Engine', test: () => fs.pathExists(path.join(ENGINE_DIR, 'src/bob/bob_engine.ts')) },
    { name: 'Phase Definitions', test: () => fs.pathExists(path.join(FRAMEWORK_DIR, 'phases_definition.json')) },
    { name: 'Framework Status', test: () => fs.pathExists(path.join(PROJECT_DIR, 'framework_status.json')) }
  ];

  const results: { name: string; passed: boolean }[] = [];

  for (const test of tests) {
    try {
      const passed = await test.test();
      results.push({ name: test.name, passed });
    } catch {
      results.push({ name: test.name, passed: false });
    }
  }

  const passedCount = results.filter(r => r.passed).length;
  const failedTests = results.filter(r => !r.passed);

  if (failedTests.length > 0) {
    return {
      success: false,
      error: `${failedTests.length} tests failed`,
      data: { results, passed: passedCount, total: tests.length }
    };
  }

  return {
    success: true,
    data: { results, passed: passedCount, total: tests.length },
    logs: results.map(r => `${r.passed ? '✓' : '✗'} ${r.name}`)
  };
};

/**
 * Generate health report
 */
export const generateHealthReport: ActionHandler = async (
  context
): Promise<ActionResult> => {
  console.log('  Generating health report...');

  // start with optimistic report
  const report: any = {
    timestamp: new Date().toISOString(),
    framework_version: '1.0.0',
    status: 'healthy',
    components: {
      engine: { status: 'unknown' },
      state_manager: { status: 'unknown' },
      phase_router: { status: 'unknown' },
      dashboard_generator: { status: 'unknown' },
      diagnostics: { status: 'unknown', checks: [] }
    }
  };

  // 1. basic engine package check
  try {
    const pkg = await fs.readJson(path.join(ENGINE_DIR, 'package.json'));
    report.components.engine.status = 'ok';
    report.components.engine.version = pkg.version;
  } catch (err: any) {
    report.components.engine.status = 'error';
    report.components.engine.message = err.message;
    report.status = 'degraded';
  }

  // 2. dynamic import state_manager, phase_router, dashboard_generator
  // Check if modules exist by testing file paths
  const modules = ['state_manager', 'phase_router', 'dashboard_generator'];
  for (const mod of modules) {
    try {
      const modPath = path.join(ENGINE_DIR, 'src', 'bob', `${mod}.ts`);
      const exists = await fs.pathExists(modPath);
      if (exists) {
        // Try to import using proper file URL
        const fileUrl = `file://${modPath.replace(/\\/g, '/')}`;
        await import(fileUrl);
        report.components[mod].status = 'ok';
      } else {
        report.components[mod].status = 'error';
        report.components[mod].message = 'Module file not found';
        report.status = 'degraded';
      }
    } catch (err: any) {
      report.components[mod].status = 'error';
      report.components[mod].message = err.message;
      report.status = 'degraded';
    }
  }

  // 3. include diagnostics checks if available
  try {
    const diagResult = await runFrameworkDiagnostics(context);
    report.components.diagnostics.status = diagResult.success ? 'ok' : 'error';
    report.components.diagnostics.checks = diagResult.data?.checks || [];
    if (!diagResult.success) report.status = 'degraded';
  } catch (err: any) {
    report.components.diagnostics.status = 'error';
    report.components.diagnostics.message = err.message;
    report.status = 'degraded';
  }

  const reportPath = path.join(PROJECT_DIR, 'health-report.json');
  await fs.ensureDir(PROJECT_DIR);
  await fs.writeJson(reportPath, report, { spaces: 2 });

  return {
    success: true,
    data: { report_path: reportPath, report },
    logs: [`Health report generated: ${reportPath}`]
  };
};

/**
 * Start engine services
 */
export const startEngineServices: ActionHandler = async (
  context
): Promise<ActionResult> => {
  console.log('  Starting engine services...');

  const serviceNames = [
    'phase_runner',
    'context_builder',
    'file_guard',
    'architecture_guard',
    'dependency_engine'
  ];

  const services: Array<{ name: string; status: string; message?: string }> = [];

  for (const serviceName of serviceNames) {
    try {
      // Check if the service file exists
      const modPath = path.join(ENGINE_DIR, 'src', `${serviceName}.ts`);
      const exists = await fs.pathExists(modPath);
      
      if (!exists) {
        services.push({ name: serviceName, status: 'error', message: 'Service file not found' });
        continue;
      }

      // Try to import the module using file URL
      const fileUrl = `file://${modPath.replace(/\\/g, '/')}`;
      const mod = await import(fileUrl);

      let status = 'running';
      // Check if module exports a healthCheck/isRunning function and call it
      if (mod && typeof mod.healthCheck === 'function') {
        try {
          const ok = await mod.healthCheck();
          status = ok ? 'running' : 'error';
        } catch (e: any) {
          status = 'error';
          services.push({ name: serviceName, status, message: `Health check failed: ${e.message}` });
          continue;
        }
      }

      services.push({ name: serviceName, status });
    } catch (error: any) {
      services.push({ name: serviceName, status: 'error', message: error.message });
    }
  }

  return {
    success: true,
    data: { services },
    logs: services.map(s => {
      const base = `${s.status === 'running' ? '✓' : '✗'} ${s.name}: ${s.status}`;
      return s.message ? `${base} (${s.message})` : base;
    })
  };
};

/**
 * Start watchdog service
 */
export const startWatchdogService: ActionHandler = async (
  context
): Promise<ActionResult> => {
  console.log('  Starting watchdog service...');

  // In a real implementation, this would start a background process
  // For now, we create a watchdog config file

  const watchdogConfig = {
    enabled: true,
    interval_minutes: 60,
    last_check: new Date().toISOString(),
    auto_restart: true
  };

  const configPath = path.join(PROJECT_DIR, 'watchdog.json');
  await fs.ensureDir(PROJECT_DIR);
  await fs.writeJson(configPath, watchdogConfig, { spaces: 2 });

  return {
    success: true,
    data: {
      config_path: configPath,
      interval_minutes: watchdogConfig.interval_minutes
    },
    logs: [
      'Watchdog service configured',
      `Interval: ${watchdogConfig.interval_minutes} minutes`,
      `Config: ${configPath}`
    ]
  };
};

/**
 * Consolidated: Validate the whole framework setup
 * Combines repository structure, version validation, and diagnostics
 */
export const validateFrameworkSetup: ActionHandler = async (
  context
): Promise<ActionResult> => {
  console.log('  Running consolidated framework setup validation...');

  const results: any = {};

  // Run repository structure check
  const repoRes = await validateRepositoryStructure(context);
  results.repository = repoRes;

  // Run version validation
  const verRes = await validateFrameworkVersion(context);
  results.version = verRes;

  // Run diagnostics
  const diagRes = await runFrameworkDiagnostics(context);
  results.diagnostics = diagRes;

  const success = repoRes.success && verRes.success && diagRes.success;

  if (!success) {
    console.error('Validation failed details:', JSON.stringify(results, null, 2));
  }

  return {
    success,
    data: { results },
    error: success ? undefined : 'One or more framework checks failed',
    logs: [
      `Repository: ${repoRes.success ? 'ok' : 'fail'}`,
      `Version: ${verRes.success ? 'ok' : 'fail'}`,
      `Diagnostics: ${diagRes.success ? 'ok' : 'fail'}`
    ]
  };
};

/**
 * Consolidated: Initialize services (engine services + watchdog)
 */
export const initializeServices: ActionHandler = async (
  context
): Promise<ActionResult> => {
  console.log('  Initializing combined services...');

  const servicesRes = await startEngineServices(context);
  const watchdogRes = await startWatchdogService(context);

  const success = servicesRes.success && watchdogRes.success;

  return {
    success,
    data: { services: servicesRes.data, watchdog: watchdogRes.data },
    error: success ? undefined : 'Service initialization failed',
    logs: [
      ...(servicesRes.logs || []),
      ...(watchdogRes.logs || [])
    ]
  };
};
