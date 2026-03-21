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
    get createServer () {
        return createServer;
    },
    get runServer () {
        return runServer;
    }
});
const _index = require("@modelcontextprotocol/sdk/server/index.js");
const _stdio = require("@modelcontextprotocol/sdk/server/stdio.js");
const _types = require("@modelcontextprotocol/sdk/types.js");
const _store = require("./handlers/store");
const _search = require("./handlers/search");
const _errors = require("./utils/errors");
const SERVER_NAME = 'ai-devkit-memory';
const SERVER_VERSION = '0.1.0';
const STORE_TOOL = {
    name: 'memory.storeKnowledge',
    description: 'Store a new knowledge item. Use this to save actionable guidelines, rules, or patterns for future reference.',
    inputSchema: {
        type: 'object',
        properties: {
            title: {
                type: 'string',
                description: 'Short, explicit description of the rule (5-12 words, 10-100 chars)'
            },
            content: {
                type: 'string',
                description: 'Detailed explanation in markdown format. Supports code blocks and examples. (50-5000 chars)'
            },
            tags: {
                type: 'array',
                items: {
                    type: 'string'
                },
                description: 'Optional domain keywords (e.g., ["api", "backend"]). Max 10 tags.'
            },
            scope: {
                type: 'string',
                description: 'Optional scope: "global", "project:<name>", or "repo:<name>". Default: "global"'
            }
        },
        required: [
            'title',
            'content'
        ]
    }
};
const SEARCH_TOOL = {
    name: 'memory.searchKnowledge',
    description: 'Search for relevant knowledge based on a task description. Returns ranked results.',
    inputSchema: {
        type: 'object',
        properties: {
            query: {
                type: 'string',
                description: 'Natural language task description to search for relevant knowledge (3-500 chars)'
            },
            contextTags: {
                type: 'array',
                items: {
                    type: 'string'
                },
                description: 'Optional tags to boost matching results (e.g., ["api", "backend"])'
            },
            scope: {
                type: 'string',
                description: 'Optional project/repo scope filter. Results from this scope are prioritized.'
            },
            limit: {
                type: 'number',
                description: 'Maximum number of results to return (1-20, default: 5)'
            }
        },
        required: [
            'query'
        ]
    }
};
function createServer() {
    const server = new _index.Server({
        name: SERVER_NAME,
        version: SERVER_VERSION
    }, {
        capabilities: {
            tools: {}
        }
    });
    // List available tools
    server.setRequestHandler(_types.ListToolsRequestSchema, async ()=>{
        return {
            tools: [
                STORE_TOOL,
                SEARCH_TOOL
            ]
        };
    });
    // Handle tool calls
    server.setRequestHandler(_types.CallToolRequestSchema, async (request)=>{
        const { name, arguments: args } = request.params;
        try {
            if (name === 'memory.storeKnowledge') {
                const input = args;
                const result = (0, _store.storeKnowledge)(input);
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(result, null, 2)
                        }
                    ]
                };
            }
            if (name === 'memory.searchKnowledge') {
                const input = args;
                const result = (0, _search.searchKnowledge)(input);
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(result, null, 2)
                        }
                    ]
                };
            }
            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify({
                            error: 'UNKNOWN_TOOL',
                            message: `Unknown tool: ${name}`
                        })
                    }
                ],
                isError: true
            };
        } catch (error) {
            const errorResponse = error instanceof _errors.KnowledgeMemoryError ? error.toJSON() : {
                error: 'INTERNAL_ERROR',
                message: error instanceof Error ? error.message : String(error)
            };
            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify(errorResponse, null, 2)
                    }
                ],
                isError: true
            };
        }
    });
    return server;
}
async function runServer() {
    const server = createServer();
    const transport = new _stdio.StdioServerTransport();
    await server.connect(transport);
}

//# sourceMappingURL=server.js.map