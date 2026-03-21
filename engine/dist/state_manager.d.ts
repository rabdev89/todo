import { TicketMetadata } from './schemas/ticket_schema';
export { TicketMetadata };
export declare class StateManager {
    /**
     * Finds the absolute path to a ticket's metadata.json
     */
    static getTicketPath(ticketId: string): Promise<string | null>;
    /**
     * Finds the absolute path to a ticket's directory
     */
    static getTicketDirPath(ticketId: string): Promise<string | null>;
    /**
     * Reads and validates the metadata for a given ticket
     */
    static getMetadata(ticketId: string): Promise<TicketMetadata>;
    /**
     * Updates the metadata for a given ticket with validation
     */
    static updateMetadata(ticketId: string, updates: Partial<TicketMetadata>): Promise<TicketMetadata>;
}
//# sourceMappingURL=state_manager.d.ts.map