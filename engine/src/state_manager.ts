import fs from 'fs-extra';
import path from 'path';
import { validateTicketMetadata, validateTicketUpdate, TicketMetadata } from './schemas/ticket_schema';
import { DashboardManager } from './dashboard_manager';

import { BobConfig } from './shared/config';

const config = BobConfig.getInstance();
const ROOT_DIR = config.getRootDir();
const EPICS_DIR = path.join(ROOT_DIR, config.getDirectory('epics'));

export { TicketMetadata };

export class StateManager {
    /**
     * Finds the absolute path to a ticket's metadata.json
     */
    static async getTicketPath(ticketId: string): Promise<string | null> {
        const config = BobConfig.getInstance();
        const EPICS_DIR = path.join(config.getRootDir(), config.getDirectory('project_management'), 'epics');

        if (!(await fs.pathExists(EPICS_DIR))) {
            return null;
        }

        const epics = await fs.readdir(EPICS_DIR);
        for (const epic of epics) {
            const ticketsDir = path.join(EPICS_DIR, epic, 'tickets');
            if (await fs.pathExists(ticketsDir)) {
                const ticketMetadataPath = path.join(ticketsDir, ticketId, 'metadata.json');
                if (await fs.pathExists(ticketMetadataPath)) {
                    return ticketMetadataPath;
                }
            }
        }

        return null;
    }

    /**
     * Finds the absolute path to a ticket's directory
     */
    static async getTicketDirPath(ticketId: string): Promise<string | null> {
        const metadataPath = await this.getTicketPath(ticketId);
        if (!metadataPath) return null;
        return path.dirname(metadataPath);
    }

    /**
     * Reads and validates the metadata for a given ticket
     */
    static async getMetadata(ticketId: string): Promise<TicketMetadata> {
        const configPath = await this.getTicketPath(ticketId);
        if (!configPath) throw new Error(`Ticket ${ticketId} not found`);

        const data = await fs.readFile(configPath, 'utf8');
        const parsed = JSON.parse(data);
        
        // Validate against schema - throws if invalid
        return validateTicketMetadata(parsed);
    }

    /**
     * Updates the metadata for a given ticket with validation
     */
    static async updateMetadata(ticketId: string, updates: Partial<TicketMetadata>): Promise<TicketMetadata> {
        const configPath = await this.getTicketPath(ticketId);
        if (!configPath) throw new Error(`Ticket ${ticketId} not found`);

        const currentMetadata = await this.getMetadata(ticketId);
        
        // Validate updates before merging
        validateTicketUpdate(updates);
        
        const newMetadata = { ...currentMetadata, ...updates };

        await fs.writeFile(configPath, JSON.stringify(newMetadata, null, 4), 'utf8');
        
        // Trigger event-driven dashboard sync
        await DashboardManager.sync();
        
        return newMetadata;
    }
}
