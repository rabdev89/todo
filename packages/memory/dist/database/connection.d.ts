import Database from 'better-sqlite3';
/**
 * Default database path: ~/.ai-devkit/memory.db
 */
export declare const DEFAULT_DB_PATH: string;
export interface DatabaseOptions {
    dbPath?: string;
    verbose?: boolean;
    readonly?: boolean;
}
export declare class DatabaseConnection {
    private db;
    private readonly dbPath;
    constructor(options?: DatabaseOptions);
    private configure;
    get instance(): Database.Database;
    get path(): string;
    get isOpen(): boolean;
    query<T>(sql: string, params?: unknown[]): T[];
    queryOne<T>(sql: string, params?: unknown[]): T | undefined;
    execute(sql: string, params?: unknown[]): Database.RunResult;
    transaction<T>(fn: () => T): T;
    close(): void;
}
export declare function getDatabase(options?: DatabaseOptions): DatabaseConnection;
export declare function closeDatabase(): void;
//# sourceMappingURL=connection.d.ts.map