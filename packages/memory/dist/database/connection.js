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
    get DEFAULT_DB_PATH () {
        return DEFAULT_DB_PATH;
    },
    get DatabaseConnection () {
        return DatabaseConnection;
    },
    get closeDatabase () {
        return closeDatabase;
    },
    get getDatabase () {
        return getDatabase;
    }
});
const _bettersqlite3 = /*#__PURE__*/ _interop_require_default(require("better-sqlite3"));
const _fs = require("fs");
const _path = require("path");
const _os = require("os");
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
const DEFAULT_DB_PATH = (0, _path.join)((0, _os.homedir)(), '.ai-devkit', 'memory.db');
let DatabaseConnection = class DatabaseConnection {
    db;
    dbPath;
    constructor(options = {}){
        this.dbPath = options.dbPath ?? DEFAULT_DB_PATH;
        const dir = (0, _path.dirname)(this.dbPath);
        (0, _fs.mkdirSync)(dir, {
            recursive: true
        });
        this.db = new _bettersqlite3.default(this.dbPath, {
            readonly: options.readonly ?? false,
            verbose: options.verbose ? console.log : undefined
        });
        this.configure();
    }
    configure() {
        this.db.pragma('journal_mode = WAL');
        this.db.pragma('foreign_keys = ON');
        this.db.pragma('synchronous = NORMAL');
        this.db.pragma('busy_timeout = 5000');
        this.db.pragma('mmap_size = 268435456');
    }
    get instance() {
        return this.db;
    }
    get path() {
        return this.dbPath;
    }
    get isOpen() {
        return this.db.open;
    }
    query(sql, params = []) {
        return this.db.prepare(sql).all(...params);
    }
    queryOne(sql, params = []) {
        return this.db.prepare(sql).get(...params);
    }
    execute(sql, params = []) {
        return this.db.prepare(sql).run(...params);
    }
    transaction(fn) {
        return this.db.transaction(fn)();
    }
    close() {
        if (this.db.open) {
            this.db.close();
        }
    }
};
let instance = null;
let schemaInitialized = false;
function getDatabase(options) {
    if (!instance) {
        instance = new DatabaseConnection(options);
    }
    // Auto-run migrations on first access
    if (!schemaInitialized) {
        // Lazy import to avoid circular dependency
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const { initializeSchema } = require('./schema');
        initializeSchema(instance);
        schemaInitialized = true;
    }
    return instance;
}
function closeDatabase() {
    if (instance) {
        instance.close();
        instance = null;
        schemaInitialized = false;
    }
}

//# sourceMappingURL=connection.js.map