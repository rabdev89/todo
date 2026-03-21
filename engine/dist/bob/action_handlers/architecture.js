"use strict";
/**
 * Architecture Action Handlers
 *
 * Implements actions for Technical Architecture phase.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateApiContracts = exports.generateDatabaseSchema = exports.validateTechStack = exports.generateArchitectureDesign = void 0;
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const ROOT_DIR = path_1.default.resolve(__dirname, '../../../../');
const FRAMEWORK_DIR = path_1.default.join(ROOT_DIR, 'framework');
const PROJECT_DIR = path_1.default.join(ROOT_DIR, 'web-applications/bob');
const WEB_APP_PM_DIR = path_1.default.join(ROOT_DIR, 'web-applications/project-management');
/**
 * Generate architecture design document
 */
const generateArchitectureDesign = async (context) => {
    console.log('  Generating architecture design document...');
    const architecturePath = path_1.default.join(PROJECT_DIR, 'architecture.md');
    const visionPath = path_1.default.join(WEB_APP_PM_DIR, 'vision.md');
    const prdPath = path_1.default.join(WEB_APP_PM_DIR, 'PRD.md');
    // If architecture.md already exists, skip AI prompt and proceed
    if (await fs_extra_1.default.pathExists(architecturePath)) {
        return {
            success: true,
            data: { architecture_path: architecturePath },
            logs: [
                '✓ Using existing architecture design document:',
                `  File: ${architecturePath}`
            ]
        };
    }
    return {
        success: true,
        data: {
            requires_ai_input: true,
            ai_prompt: `🚀 Generate High-Fidelity Architecture Design for Bobbie

Based on the Project Vision and PRD, generate a comprehensive system architecture design.

**Reference Documents:**
- Vision: ${visionPath}
- PRD: ${prdPath}

**Requirements:**
Generate ${architecturePath} including:
1. **Overview**: High-level description of the system architecture.
2. **Architecture Diagram**: Mermaid diagram showing Client, API, Service, and Data layers.
3. **Components**: Detailed list for Frontend, Backend, Database, and Infrastructure.
4. **Design Principles**: Core principles guiding the implementation.
5. **Data Flow**: Description of critical data journeys.
6. **Security Considerations**: Auth, RBAC, Encryption, and Validation.
7. **Performance Targets**: Response times, availability, and scale.

Ensure the architecture is optimized for speed, Philippine market connectivity (low latency), and AI integration needs.`
        }
    };
};
exports.generateArchitectureDesign = generateArchitectureDesign;
/**
 * Validate tech stack compatibility
 */
const validateTechStack = async (context) => {
    console.log('  Validating tech stack...');
    const techStackPath = path_1.default.join(PROJECT_DIR, 'tech_stack.json');
    if (!await fs_extra_1.default.pathExists(techStackPath)) {
        return {
            success: false,
            error: 'Tech stack configuration not found. Run generate_tech_stack first.',
            data: { exists: false }
        };
    }
    const techStack = await fs_extra_1.default.readJson(techStackPath);
    // Validate required fields
    const validations = [];
    // Check frontend
    if (techStack.frontend?.framework && techStack.frontend?.language) {
        validations.push({
            component: 'Frontend',
            valid: true,
            message: `${techStack.frontend.framework} + ${techStack.frontend.language}`
        });
    }
    else {
        validations.push({ component: 'Frontend', valid: false, message: 'Missing framework or language' });
    }
    // Check backend
    if (techStack.backend?.framework && techStack.backend?.language) {
        validations.push({
            component: 'Backend',
            valid: true,
            message: `${techStack.backend.framework} + ${techStack.backend.language}`
        });
    }
    else {
        validations.push({ component: 'Backend', valid: false, message: 'Missing framework or language' });
    }
    // Check database
    if (techStack.backend?.database) {
        validations.push({ component: 'Database', valid: true, message: techStack.backend.database });
    }
    else {
        validations.push({ component: 'Database', valid: false, message: 'Database not specified' });
    }
    // Check testing
    if (techStack.testing?.frontend && techStack.testing?.backend) {
        validations.push({
            component: 'Testing',
            valid: true,
            message: `FE: ${techStack.testing.frontend}, BE: ${techStack.testing.backend}`
        });
    }
    else {
        validations.push({ component: 'Testing', valid: false, message: 'Testing frameworks not specified' });
    }
    const invalidCount = validations.filter(v => !v.valid).length;
    if (invalidCount > 0) {
        return {
            success: false,
            error: `${invalidCount} tech stack components invalid`,
            data: { validations, tech_stack: techStack }
        };
    }
    return {
        success: true,
        data: { validations, tech_stack: techStack },
        logs: [
            'Tech stack validation passed:',
            ...validations.map(v => `  ${v.valid ? '✓' : '✗'} ${v.component}: ${v.message}`)
        ]
    };
};
exports.validateTechStack = validateTechStack;
/**
 * Generate database schema design
 */
const generateDatabaseSchema = async (context) => {
    console.log('  Generating database schema...');
    const schemaPath = path_1.default.join(WEB_APP_PM_DIR, 'database_schema.md');
    const visionPath = path_1.default.join(WEB_APP_PM_DIR, 'vision.md');
    const prdPath = path_1.default.join(WEB_APP_PM_DIR, 'PRD.md');
    // If database_schema.md already exists, skip AI prompt and proceed
    if (await fs_extra_1.default.pathExists(schemaPath)) {
        return {
            success: true,
            data: { schema_path: schemaPath },
            logs: [
                '✓ Using existing database schema design:',
                `  File: ${schemaPath}`
            ]
        };
    }
    return {
        success: true,
        data: {
            requires_ai_input: true,
            ai_prompt: `🚀 Generate High-Fidelity Database Schema for Bobbie

Based on the Project Vision and PRD, generate a comprehensive database schema design.

**Reference Documents:**
- Vision: ${visionPath}
- PRD: ${prdPath}

**Requirements:**
Generate ${schemaPath} including:
1. **Overview**: Description of the database design approach.
2. **Entity Relationship Diagram (ERD)**: Mermaid diagram showing all major entities and relationships.
3. **Tables**: Detailed table definitions with Column, Type, Constraints, and Description.
4. **Indexes**: Strategic indexes for performance (e.g., email lookups).
5. **Relationships**: Clear definition of relations (One-to-Many, Many-to-Many).
6. **Sample Migrations**: Example SQL for creating initial tables.

Ensure the schema is optimized for data integrity, scalability, and the specific needs of the Bobbie application.`
        }
    };
};
exports.generateDatabaseSchema = generateDatabaseSchema;
/**
 * Generate API contracts
 */
const generateApiContracts = async (context) => {
    console.log('  Generating API contracts...');
    const apiPath = path_1.default.join(WEB_APP_PM_DIR, 'api_contracts.md');
    const visionPath = path_1.default.join(WEB_APP_PM_DIR, 'vision.md');
    const prdPath = path_1.default.join(WEB_APP_PM_DIR, 'PRD.md');
    // If api_contracts.md already exists, skip AI prompt and proceed
    if (await fs_extra_1.default.pathExists(apiPath)) {
        return {
            success: true,
            data: { api_contracts_path: apiPath },
            logs: [
                '✓ Using existing API contracts document:',
                `  File: ${apiPath}`
            ]
        };
    }
    return {
        success: true,
        data: {
            requires_ai_input: true,
            ai_prompt: `🚀 Generate High-Fidelity API Contracts for Bobbie

Based on the Project Vision and PRD, generate a comprehensive set of API contracts.

**Reference Documents:**
- Vision: ${visionPath}
- PRD: ${prdPath}

**Requirements:**
Generate ${apiPath} including:
1. **Overview**: Description of the API design philosophy (RESTful, versioning, etc.).
2. **Base URL**: Environment-specific base URLs.
3. **Authentication**: Detailed requirements for JWT/OAuth2.
4. **Common Responses**: Standard JSON structures for Success (200) and Errors (4xx/5xx).
5. **Endpoints**: Grouped endpoints (Auth, Users, Main Features) with:
   - Method and Path (e.g., POST /auth/login)
   - Description
   - Request body example
   - Successful response example (200/201)
6. **Error Codes**: Table of standard error codes and their meanings.
7. **Rate Limiting & Pagination**: Standard patterns for across the API.

Ensure the contracts are high-fidelity, actionable, and provide clear guidance for both frontend and backend development.`
        }
    };
};
exports.generateApiContracts = generateApiContracts;
