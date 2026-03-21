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
exports.PlannerAgent = void 0;
const path = __importStar(require("path"));
const fs = __importStar(require("fs-extra"));
const state_manager_1 = require("../state_manager");
const config_1 = require("../shared/config");
const context_1 = require("../repo_intelligence/context");
const search_1 = require("../repo_intelligence/search");
const embeddings_1 = require("../repo_intelligence/embeddings");
const storage_1 = require("../repo_intelligence/storage");
const patterns_1 = require("../repo_intelligence/patterns");
class PlannerAgent {
    contextBuilder;
    storage;
    constructor(dataPath) {
        const config = config_1.BobConfig.getInstance();
        const defaultDataPath = path.join(config.getRootDir(), 'web-applications/repo_data');
        this.storage = new storage_1.RepoStorage(dataPath || defaultDataPath);
        const embeddings = new embeddings_1.EmbeddingService();
        const search = new search_1.SearchService(embeddings, this.storage);
        const patterns = new patterns_1.PatternDetector(this.storage);
        this.contextBuilder = new context_1.ContextBuilder(search, patterns, this.storage);
    }
    async planTicket(ticketId) {
        console.log(`🏗️  Planner analyzing ticket: ${ticketId}`);
        const ticketPath = await state_manager_1.StateManager.getTicketPath(ticketId);
        if (!ticketPath) {
            throw new Error(`Ticket ${ticketId} not found in state.`);
        }
        const ticketDir = path.dirname(ticketPath);
        const researchPath = path.join(ticketDir, 'RESEARCH.md');
        const blueprintPath = path.join(ticketDir, 'BLUEPRINT.md');
        let researchContent = '';
        if (await fs.pathExists(researchPath)) {
            researchContent = await fs.readFile(researchPath, 'utf8');
            console.log(`   Found research data in ${researchPath}`);
        }
        else {
            console.warn(`⚠️  No RESEARCH.md found for ${ticketId}. Planning with limited context.`);
        }
        // In a real implementation, we would call an LLM here with:
        // 1. System Prompt (.agent/agents/planner/system-prompt.md)
        // 2. PRD.md
        // 3. RESEARCH.md
        // 4. Ticket Metadata
        // For now, we generate a high-quality template based on the framework's standards
        const blueprintContent = this.generateBlueprintTemplate(ticketId, researchContent);
        await fs.writeFile(blueprintPath, blueprintContent);
        console.log(`   Blueprint generated at: ${blueprintPath}`);
        return {
            blueprintPath,
            content: blueprintContent
        };
    }
    generateBlueprintTemplate(ticketId, research) {
        const timestamp = new Date().toISOString();
        return `# Blueprint: ${ticketId} Design Specification

## 1. Objective
Detailed technical plan for implementing ${ticketId}.

## 2. Proposed Changes
Based on research findings, the following files and components will be modified:

${this.extractRelevantFiles(research)}

## 3. Implementation Steps (Breaths)

### Breath 1: Data Model & Schema
- Define necessary database changes or model attributes.
- Ensure alignment with Supabase/PostgreSQL standards.

### Breath 2: Service Layer & Business Logic
- Implement core logic in the appropriate service classes.
- Follow the Repository pattern if applicable.

### Breath 3: API & Controller Interface
- Expose functionality via RESTful endpoints.
- Ensure proper request/response validation.

### Breath 4: Frontend Integration (if applicable)
- Update UI components to reflect backend changes.
- Ensure consistent styling with the Design Bible.

## 4. Verification Plan
- [ ] Unit tests for new service logic.
- [ ] Integration tests for API endpoints.
- [ ] Manual UI verification (if applicable).

---
*Generated by BOB PlannerAgent*
*Date: ${timestamp}*
`;
    }
    extractRelevantFiles(research) {
        if (!research)
            return '- TBD: Research data missing';
        // Simple extraction of files from RESEARCH.md format
        const lines = research.split('\n');
        const filesSection = lines.findIndex(l => l.includes('Relevant Files'));
        if (filesSection === -1)
            return '- TBD: No files identified in research';
        const files = lines.slice(filesSection + 1)
            .filter(l => l.startsWith('- `'))
            .map(l => l.trim())
            .slice(0, 5);
        return files.length > 0 ? files.join('\n') : '- TBD: No specific files identified';
    }
    close() {
        this.storage.close();
    }
}
exports.PlannerAgent = PlannerAgent;
