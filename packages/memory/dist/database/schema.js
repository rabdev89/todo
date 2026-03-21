"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: Object.getOwnPropertyDescriptor(all, name).get
    });
}
_export(exports, {
    get getPendingMigrations () {
        return getPendingMigrations;
    },
    get getSchemaVersion () {
        return getSchemaVersion;
    },
    get initializeSchema () {
        return initializeSchema;
    },
    get resetSchema () {
        return resetSchema;
    }
});
const _fs = require("fs");
const _path = require("path");
function getSchemaVersion(db) {
    const result = db.instance.pragma('user_version');
    return result[0]?.user_version ?? 0;
}
function setSchemaVersion(db, version) {
    db.instance.pragma(`user_version = ${version}`);
}
function getMigrationsDir() {
    // In production, migrations are in dist/database/migrations
    // In development/testing, they are in src/database/migrations
    const distPath = (0, _path.join)(__dirname, 'migrations');
    return distPath;
}
function getMigrationFiles() {
    const migrationsDir = getMigrationsDir();
    let files;
    try {
        files = (0, _fs.readdirSync)(migrationsDir).filter((f)=>f.endsWith('.sql')).sort();
    } catch  {
        return [];
    }
    return files.map((file)=>{
        const match = file.match(/^(\d+)_(.+)\.sql$/);
        if (!match || !match[1] || !match[2]) {
            throw new Error(`Invalid migration filename: ${file}. Expected format: 001_name.sql`);
        }
        return {
            version: parseInt(match[1], 10),
            name: match[2],
            path: (0, _path.join)(migrationsDir, file)
        };
    });
}
function initializeSchema(db) {
    const currentVersion = getSchemaVersion(db);
    const migrations = getMigrationFiles();
    const pendingMigrations = migrations.filter((m)=>m.version > currentVersion);
    if (pendingMigrations.length === 0) {
        return;
    }
    for (const migration of pendingMigrations){
        const sql = (0, _fs.readFileSync)(migration.path, 'utf-8');
        db.transaction(()=>{
            db.instance.exec(sql);
            setSchemaVersion(db, migration.version);
        });
    }
}
function resetSchema(db) {
    db.transaction(()=>{
        db.execute('DROP TABLE IF EXISTS knowledge_fts');
        db.execute('DROP TABLE IF EXISTS knowledge');
        setSchemaVersion(db, 0);
    });
    initializeSchema(db);
}
function getPendingMigrations(db) {
    const currentVersion = getSchemaVersion(db);
    const migrations = getMigrationFiles();
    return migrations.filter((m)=>m.version > currentVersion).map((m)=>`${m.version}_${m.name}`);
}

//# sourceMappingURL=schema.js.map