import { Command } from 'commander';
import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';
import * as http from 'http';

interface HealthCheckResult {
  status: 'ok' | 'error' | 'degraded';
  message?: string;
  version?: string;
  details?: any;
}

interface FrameworkHealth {
  timestamp: string;
  overall_status: 'healthy' | 'unhealthy' | 'degraded';
  components: {
    [key: string]: HealthCheckResult;
  };
}

export const frameworkTestCommand = new Command('framework-test')
  .description('Run framework health checks and generate a JSON report')
  .action(async () => {
    console.log('🏥 Running Framework health checks...');

    const health: FrameworkHealth = {
      timestamp: new Date().toISOString(),
      overall_status: 'healthy',
      components: {}
    };

    // 1. Check Engine
    try {
      const packageJson = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf8'));
      health.components.engine = {
        status: 'ok',
        version: packageJson.version
      };
    } catch (error: any) {
      health.components.engine = {
        status: 'error',
        message: `Failed to read engine package.json: ${error.message}`
      };
      health.overall_status = 'unhealthy';
    }

    // 2. Check Memory Package
    try {
      const memoryPath = path.join(process.cwd(), '..', 'packages', 'memory', 'package.json');
      if (fs.existsSync(memoryPath)) {
        const memoryPackage = JSON.parse(fs.readFileSync(memoryPath, 'utf8'));
        health.components.memory = {
          status: 'ok',
          version: memoryPackage.version
        };
      } else {
        health.components.memory = {
          status: 'error',
          message: 'Memory package not found'
        };
        health.overall_status = 'unhealthy';
      }
    } catch (error: any) {
      health.components.memory = {
        status: 'error',
        message: `Failed to check memory package: ${error.message}`
      };
      health.overall_status = 'unhealthy';
    }

    // 3. Check Qdrant
    const checkQdrant = (): Promise<HealthCheckResult> => {
      return new Promise((resolve) => {
        const req = http.request(
          {
            hostname: 'localhost',
            port: 6333,
            path: '/healthz',
            method: 'GET',
            timeout: 2000,
          },
          (res) => {
            if (res.statusCode === 200) {
              resolve({ status: 'ok', details: { port: 6333 } });
            } else {
              resolve({ status: 'error', message: `Qdrant returned status ${res.statusCode}` });
            }
          }
        );

        req.on('error', (err) => {
          resolve({ status: 'error', message: `Could not connect to Qdrant: ${err.message}` });
        });

        req.on('timeout', () => {
          req.destroy();
          resolve({ status: 'error', message: 'Connection to Qdrant timed out' });
        });

        req.end();
      });
    };

    health.components.qdrant = await checkQdrant();
    if (health.components.qdrant.status === 'error') {
      health.overall_status = health.overall_status === 'healthy' ? 'degraded' : health.overall_status;
    }

    // 4. Check Ollama
    const checkOllama = (): Promise<HealthCheckResult> => {
      return new Promise((resolve) => {
        const req = http.request(
          {
            hostname: 'localhost',
            port: 11434,
            path: '/api/tags',
            method: 'GET',
            timeout: 2000,
          },
          (res) => {
            if (res.statusCode === 200) {
              resolve({ status: 'ok', details: { port: 11434 } });
            } else {
              resolve({ status: 'error', message: `Ollama returned status ${res.statusCode}` });
            }
          }
        );

        req.on('error', (err) => {
          resolve({ status: 'error', message: `Could not connect to Ollama: ${err.message}` });
        });

        req.on('timeout', () => {
          req.destroy();
          resolve({ status: 'error', message: 'Connection to Ollama timed out' });
        });

        req.end();
      });
    };

    health.components.ollama = await checkOllama();
    if (health.components.ollama.status === 'error') {
      health.overall_status = health.overall_status === 'healthy' ? 'degraded' : health.overall_status;
    }

    // 5. Check SQLite (Session Data)
    try {
      const dbPath = process.env.AI_SESSION_DB || path.join(process.cwd(), 'session_data.db');
      health.components.sqlite = {
        status: fs.existsSync(dbPath) ? 'ok' : 'degraded',
        details: { path: dbPath, exists: fs.existsSync(dbPath) }
      };
      if (!fs.existsSync(dbPath)) {
        health.components.sqlite.message = 'Session database not found (will be created on first use)';
      }
    } catch (error: any) {
      health.components.sqlite = {
        status: 'error',
        message: `Failed to check SQLite: ${error.message}`
      };
    }

    // Write report
    const reportPath = path.join(process.cwd(), '..', 'framework-health.json');
    fs.writeFileSync(reportPath, JSON.stringify(health, null, 2));

    console.log(`\nReport generated at: ${reportPath}`);
    console.log(`Overall Status: ${health.overall_status.toUpperCase()}`);
    
    if (health.overall_status === 'healthy') {
      console.log('✅ Framework is fully operational.');
    } else if (health.overall_status === 'degraded') {
      console.log('⚠️ Framework is functional but some optional components are missing.');
    } else {
      console.log('❌ Framework has critical issues.');
    }
  });
