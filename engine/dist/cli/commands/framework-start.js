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
exports.frameworkStartCommand = void 0;
const commander_1 = require("commander");
const child_process_1 = require("child_process");
const fs = __importStar(require("fs-extra"));
const path = __importStar(require("path"));
exports.frameworkStartCommand = new commander_1.Command('framework-start')
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
                (0, child_process_1.execSync)(service.check, { stdio: 'ignore' });
                console.log(`✅ ${service.name} is already running.`);
            }
            else {
                (0, child_process_1.execSync)(service.check, { stdio: 'ignore' });
                console.log(`✅ ${service.name} is already running.`);
            }
        }
        catch (error) {
            console.log(`⚠️  ${service.name} is not running. Attempting to start...`);
            try {
                if (service.start.startsWith('echo')) {
                    console.log(service.start.replace('echo "', '').replace('"', ''));
                }
                else {
                    (0, child_process_1.execSync)(service.start, { stdio: 'inherit' });
                    console.log(`✅ ${service.name} started successfully.`);
                }
            }
            catch (startError) {
                if (service.required) {
                    console.error(`❌ Failed to start required service ${service.name}: ${startError.message}`);
                }
                else {
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
