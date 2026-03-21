import { join } from 'path';
import { tmpdir } from 'os';
import { writeFileSync, unlinkSync, existsSync } from 'fs';
import { memorySeedCommand, getDatabase, closeDatabase, initializeSchema } from '../../src/api';
import { DatabaseConnection } from '../../src/database/connection';

describe('memorySeedCommand', () => {
    const testDbPath = join(tmpdir(), `test-seed-${Date.now()}-${Math.random().toString(36)}.db`);
    const tempSeedPath = join(tmpdir(), `test-seed-${Date.now()}.json`);
    let db: DatabaseConnection;

    beforeAll(() => {
        // We need to bypass the singleton instance in getDatabase for thorough testing,
        // but memorySeedCommand calls storeKnowledge which calls getDatabase().
        // So we'll force the database path via environment or just hope getDatabase respects the first set path.
        // Actually, getDatabase takes options.
        db = getDatabase({ dbPath: testDbPath });
    });

    afterAll(() => {
        closeDatabase();
        try {
            if (existsSync(testDbPath)) unlinkSync(testDbPath);
            if (existsSync(testDbPath + '-wal')) unlinkSync(testDbPath + '-wal');
            if (existsSync(testDbPath + '-shm')) unlinkSync(testDbPath + '-shm');
            if (existsSync(tempSeedPath)) unlinkSync(tempSeedPath);
        } catch { }
    });

    beforeEach(() => {
        const currentDb = getDatabase({ dbPath: testDbPath });
        currentDb.execute('DELETE FROM knowledge');
    });

    const mockSeedData = {
        name: "Test Seed",
        version: "1.0",
        description: "Test description",
        entries: [
            {
                title: "Test Entry 1: This is a long enough title",
                content: "This is test content 1 that is also long enough to pass validation.",
                tags: ["test1"],
                scope: "global"
            },
            {
                title: "Test Entry 2: Another long enough title",
                content: "This is test content 2 that is also long enough to pass validation.",
                tags: ["test2"],
                scope: "project:test"
            }
        ]
    };

    it('should seed data from a valid JSON file', () => {
        writeFileSync(tempSeedPath, JSON.stringify(mockSeedData));
        
        const result = memorySeedCommand({ filePath: tempSeedPath });
        
        expect(result.success).toBe(true);
        expect(result.total).toBe(2);
        expect(result.imported).toBe(2);
        expect(result.errors.length).toBe(0);

        const freshDb = getDatabase({ dbPath: testDbPath });
        const count = freshDb.queryOne<{ count: number }>('SELECT count(*) as count FROM knowledge');
        expect(count?.count).toBe(2);
    });

    it('should handle missing seed file', () => {
        expect(() => memorySeedCommand({ filePath: 'non-existent.json' })).toThrow(/Seed file not found/);
    });

    it('should report errors for invalid entries in seed file', () => {
        const invalidSeedData = {
            ...mockSeedData,
            entries: [
                ...mockSeedData.entries,
                {
                    title: "Short",
                    content: "Too short",
                }
            ]
        };
        writeFileSync(tempSeedPath, JSON.stringify(invalidSeedData));

        const result = memorySeedCommand({ filePath: tempSeedPath });

        expect(result.total).toBe(3);
        expect(result.imported).toBe(2);
        expect(result.skipped).toBe(1);
        expect(result.errors.length).toBe(1);
        expect(result.errors[0]).toMatch(/Error importing "Short"/);
    });
});
