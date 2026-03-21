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
        return _connection.DEFAULT_DB_PATH;
    },
    get DatabaseConnection () {
        return _connection.DatabaseConnection;
    },
    get closeDatabase () {
        return _connection.closeDatabase;
    },
    get getDatabase () {
        return _connection.getDatabase;
    },
    get getSchemaVersion () {
        return _schema.getSchemaVersion;
    },
    get initializeSchema () {
        return _schema.initializeSchema;
    },
    get resetSchema () {
        return _schema.resetSchema;
    }
});
const _connection = require("./connection");
const _schema = require("./schema");

//# sourceMappingURL=index.js.map