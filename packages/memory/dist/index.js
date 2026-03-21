#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
const _server = require("./server");
_export_star(require("./api"), exports);
function _export_star(from, to) {
    Object.keys(from).forEach(function(k) {
        if (k !== "default" && !Object.prototype.hasOwnProperty.call(to, k)) {
            Object.defineProperty(to, k, {
                enumerable: true,
                get: function() {
                    return from[k];
                }
            });
        }
    });
    return from;
}
// Only start MCP server when this file is run directly as a binary
// Not when imported as a library (e.g., by CLI commands)
if (require.main === module) {
    (0, _server.runServer)().catch((error)=>{
        console.error('Failed to start server:', error);
        process.exit(1);
    });
}

//# sourceMappingURL=index.js.map