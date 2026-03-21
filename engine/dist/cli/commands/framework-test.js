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
exports.frameworkTestCommand = void 0;
const commander_1 = require("commander");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const http = __importStar(require("http"));
exports.frameworkTestCommand = new commander_1.Command('framework-test')
    .description('Run framework health checks and generate a JSON report')
    .action(async () => {
    console.log('🏥 Running Framework health checks...');
    const health = {
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
    }
    catch (error) {
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
        }
        else {
            health.components.memory = {
                status: 'error',
                message: 'Memory package not found'
            };
            health.overall_status = 'unhealthy';
        }
    }
    catch (error) {
        health.components.memory = {
            status: 'error',
            message: `Failed to check memory package: ${error.message}`
        };
        health.overall_status = 'unhealthy';
    }
    // 3. Check Qdrant
    const checkQdrant = () => {
        return new Promise((resolve) => {
            const req = http.request({
                hostname: 'localhost',
                port: 6333,
                path: '/healthz',
                method: 'GET',
                timeout: 2000,
            }, (res) => {
                if (res.statusCode === 200) {
                    resolve({ status: 'ok', details: { port: 6333 } });
                }
                else {
                    resolve({ status: 'error', message: `Qdrant returned status ${res.statusCode}` });
                }
            });
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
    const checkOllama = () => {
        return new Promise((resolve) => {
            const req = http.request({
                hostname: 'localhost',
                port: 11434,
                path: '/api/tags',
                method: 'GET',
                timeout: 2000,
            }, (res) => {
                if (res.statusCode === 200) {
                    resolve({ status: 'ok', details: { port: 11434 } });
                }
                else {
                    resolve({ status: 'error', message: `Ollama returned status ${res.statusCode}` });
                }
            });
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
    }
    catch (error) {
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
    }
    else if (health.overall_status === 'degraded') {
        console.log('⚠️ Framework is functional but some optional components are missing.');
    }
    else {
        console.log('❌ Framework has critical issues.');
    }
});
