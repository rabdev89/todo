"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StateManager = void 0;
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const ticket_schema_1 = require("./schemas/ticket_schema");
const dashboard_manager_1 = require("./dashboard_manager");
const config_1 = require("./shared/config");
const config = config_1.BobConfig.getInstance();
const ROOT_DIR = config.getRootDir();
const EPICS_DIR = path_1.default.join(ROOT_DIR, config.getDirectory('epics'));
class StateManager {
    /**
     * Finds the absolute path to a ticket's metadata.json
     */
    static async getTicketPath(ticketId) {
        const config = config_1.BobConfig.getInstance();
        const EPICS_DIR = path_1.default.join(config.getRootDir(), config.getDirectory('project_management'), 'epics');
        if (!(await fs_extra_1.default.pathExists(EPICS_DIR))) {
            return null;
        }
        const epics = await fs_extra_1.default.readdir(EPICS_DIR);
        for (const epic of epics) {
            const ticketsDir = path_1.default.join(EPICS_DIR, epic, 'tickets');
            if (await fs_extra_1.default.pathExists(ticketsDir)) {
                const ticketMetadataPath = path_1.default.join(ticketsDir, ticketId, 'metadata.json');
                if (await fs_extra_1.default.pathExists(ticketMetadataPath)) {
                    return ticketMetadataPath;
                }
            }
        }
        return null;
    }
    /**
     * Finds the absolute path to a ticket's directory
     */
    static async getTicketDirPath(ticketId) {
        const metadataPath = await this.getTicketPath(ticketId);
        if (!metadataPath)
            return null;
        return path_1.default.dirname(metadataPath);
    }
    /**
     * Reads and validates the metadata for a given ticket
     */
    static async getMetadata(ticketId) {
        const configPath = await this.getTicketPath(ticketId);
        if (!configPath)
            throw new Error(`Ticket ${ticketId} not found`);
        const data = await fs_extra_1.default.readFile(configPath, 'utf8');
        const parsed = JSON.parse(data);
        // Validate against schema - throws if invalid
        return (0, ticket_schema_1.validateTicketMetadata)(parsed);
    }
    /**
     * Updates the metadata for a given ticket with validation
     */
    static async updateMetadata(ticketId, updates) {
        const configPath = await this.getTicketPath(ticketId);
        if (!configPath)
            throw new Error(`Ticket ${ticketId} not found`);
        const currentMetadata = await this.getMetadata(ticketId);
        // Validate updates before merging
        (0, ticket_schema_1.validateTicketUpdate)(updates);
        const newMetadata = { ...currentMetadata, ...updates };
        await fs_extra_1.default.writeFile(configPath, JSON.stringify(newMetadata, null, 4), 'utf8');
        // Trigger event-driven dashboard sync
        await dashboard_manager_1.DashboardManager.sync();
        return newMetadata;
    }
}
exports.StateManager = StateManager;
