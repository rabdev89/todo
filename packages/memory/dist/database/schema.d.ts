import type { DatabaseConnection } from './connection';
export declare function getSchemaVersion(db: DatabaseConnection): number;
export declare function initializeSchema(db: DatabaseConnection): void;
export declare function resetSchema(db: DatabaseConnection): void;
export declare function getPendingMigrations(db: DatabaseConnection): string[];
//# sourceMappingURL=schema.d.ts.map