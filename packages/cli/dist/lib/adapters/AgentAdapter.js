"use strict";
/**
 * Agent Adapter Interface
 *
 * Defines the contract for detecting and managing different types of AI agents.
 * Each adapter is responsible for detecting agents of a specific type (e.g., Claude Code).
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.STATUS_CONFIG = exports.AgentStatus = void 0;
/**
 * Current status of an agent
 */
var AgentStatus;
(function (AgentStatus) {
    AgentStatus["RUNNING"] = "running";
    AgentStatus["WAITING"] = "waiting";
    AgentStatus["IDLE"] = "idle";
    AgentStatus["UNKNOWN"] = "unknown";
})(AgentStatus || (exports.AgentStatus = AgentStatus = {}));
/**
 * Status configuration map
 */
exports.STATUS_CONFIG = {
    [AgentStatus.RUNNING]: { emoji: '🟢', label: 'running', color: 'green' },
    [AgentStatus.WAITING]: { emoji: '🟡', label: 'waiting', color: 'yellow' },
    [AgentStatus.IDLE]: { emoji: '⚪', label: 'idle', color: 'dim' },
    [AgentStatus.UNKNOWN]: { emoji: '❓', label: 'unknown', color: 'gray' },
};
//# sourceMappingURL=AgentAdapter.js.map