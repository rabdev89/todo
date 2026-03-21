"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnvironmentSelector = void 0;
const inquirer_1 = __importDefault(require("inquirer"));
const env_1 = require("../util/env");
class EnvironmentSelector {
    async selectEnvironments() {
        const environments = (0, env_1.getAllEnvironments)();
        const choices = environments.map((env) => ({
            name: env.name,
            value: env.code,
            short: env.name,
        }));
        const answers = await inquirer_1.default.prompt([
            {
                type: "checkbox",
                name: "environments",
                message: "Select AI environments to set up (use space to select, enter to confirm):",
                choices,
                pageSize: 10,
                validate: (input) => {
                    if (input.length === 0) {
                        return "Please select at least one environment.";
                    }
                    return true;
                },
            },
        ]);
        return answers.environments;
    }
    async confirmOverride(conflicts) {
        if (conflicts.length === 0) {
            return true;
        }
        const conflictNames = conflicts.map((id) => (0, env_1.getEnvironmentDisplayName)(id));
        const answers = await inquirer_1.default.prompt([
            {
                type: "confirm",
                name: "proceed",
                message: `The following environments are already set up and will be overwritten:\n  ${conflictNames.join(", ")}\n\nDo you want to continue?`,
                default: false,
            },
        ]);
        return answers.proceed;
    }
    displaySelectionSummary(selected) {
        if (selected.length === 0) {
            console.log("No environments selected.");
            return;
        }
        console.log("\nSelected environments:");
        selected.forEach((envId) => {
            console.log(`  ${(0, env_1.getEnvironmentDisplayName)(envId)}`);
        });
        console.log("");
    }
    async selectGlobalEnvironments() {
        const globalCapableEnvs = (0, env_1.getGlobalCapableEnvironments)();
        if (globalCapableEnvs.length === 0) {
            console.log("No environments support global setup.");
            return [];
        }
        const choices = globalCapableEnvs.map((env) => ({
            name: env.name,
            value: env.code,
            short: env.name,
        }));
        const answers = await inquirer_1.default.prompt([
            {
                type: "checkbox",
                name: "environments",
                message: "Select AI environments for global setup (use space to select, enter to confirm):",
                choices,
                pageSize: 10,
                validate: (input) => {
                    if (input.length === 0) {
                        return "Please select at least one environment.";
                    }
                    return true;
                },
            },
        ]);
        return answers.environments;
    }
    async selectSkillEnvironments() {
        const skillCapableEnvs = (0, env_1.getSkillCapableEnvironments)();
        if (skillCapableEnvs.length === 0) {
            console.log("No environments support skills.");
            return [];
        }
        const choices = skillCapableEnvs.map((env) => ({
            name: env.name,
            value: env.code,
            short: env.name,
        }));
        const answers = await inquirer_1.default.prompt([
            {
                type: "checkbox",
                name: "environments",
                message: "Select AI environments for skill installation (use space to select, enter to confirm):",
                choices,
                pageSize: 10,
                validate: (input) => {
                    if (input.length === 0) {
                        return "Please select at least one environment.";
                    }
                    return true;
                },
            },
        ]);
        return answers.environments;
    }
}
exports.EnvironmentSelector = EnvironmentSelector;
//# sourceMappingURL=EnvironmentSelector.js.map