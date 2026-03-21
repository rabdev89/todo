"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateSystemState = validateSystemState;
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const config_1 = require("../shared/config");
const state_manager_1 = require("../bob/state_manager");
const state_manager_2 = require("../state_manager");
/**
 * Validates the core framework status and current ticket metadata.
 * This is a pre-flight check to prevent engine crashes.
 */
async function validateSystemState() {
    const result = {
        valid: true,
        errors: [],
        warnings: []
    };
    const config = config_1.BobConfig.getInstance();
    const rootDir = config.getRootDir();
    // 1. Check bob.config.json
    const configPath = path_1.default.join(rootDir, 'bob.config.json');
    if (!await fs_extra_1.default.pathExists(configPath)) {
        result.warnings.push(`bob.config.json not found at workspace root. Using default fallback paths.`);
    }
    try {
        // 2. Check framework_status.json
        const status = await state_manager_1.BobStateManager.loadStatus().catch(() => null);
        if (!status) {
            result.valid = false;
            result.errors.push('framework_status.json is missing or corrupt.');
            return result; // Cannot continue without status
        }
        // 3. Check current ticket metadata if one is selected
        if (status.current_ticket_id) {
            const ticketMetadataPath = await state_manager_2.StateManager.getTicketPath(status.current_ticket_id);
            if (!ticketMetadataPath || !await fs_extra_1.default.pathExists(ticketMetadataPath)) {
                result.valid = false;
                result.errors.push(`Metadata for current ticket ${status.current_ticket_id} is missing.`);
            }
            else {
                try {
                    await state_manager_2.StateManager.getMetadata(status.current_ticket_id);
                }
                catch (e) {
                    result.valid = false;
                    result.errors.push(`Invalid metadata for ticket ${status.current_ticket_id}: ${e.message}`);
                }
            }
        }
        // 4. Check for project-management folder existence
        /*
        const pmDir = path.join(rootDir, config.getDirectory('project_management'));
        if (!await fs.pathExists(pmDir)) {
          result.valid = false;
          result.errors.push(`Project management directory not found at: ${pmDir}`);
        }
        */
    }
    catch (error) {
        result.valid = false;
        result.errors.push(`Critical health check error: ${error.message}`);
    }
    return result;
}
