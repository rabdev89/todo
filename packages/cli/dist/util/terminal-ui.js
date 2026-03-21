"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ui = void 0;
const chalk_1 = __importDefault(require("chalk"));
const ora_1 = __importDefault(require("ora"));
/**
 * Sanitize message to prevent terminal injection
 * Removes ANSI escape codes from user-provided strings
 */
const sanitize = (message) => {
    // eslint-disable-next-line no-control-regex
    return message.replace(/\x1b\[[0-9;]*m/g, '');
};
/**
 * Terminal UI utility for consistent message formatting across CLI commands
 *
 * @example
 * ```typescript
 * import { ui } from '../util/terminal-ui';
 *
 * // Display messages
 * ui.info('Initializing project...');
 * ui.success('Project initialized successfully!');
 * ui.warning('Configuration file not found, using defaults');
 * ui.error('Failed to create directory');
 *
 * // Use spinner for async operations
 * const spinner = ui.spinner('Cloning repository...');
 * spinner.start();
 * try {
 *   await cloneRepo();
 *   spinner.succeed('Repository cloned successfully');
 * } catch (error) {
 *   spinner.fail('Failed to clone repository');
 *   ui.error(error.message);
 * }
 * ```
 */
exports.ui = {
    /**
     * Display a text line
     * @param text - The text to display
     */
    text: (text, { breakline = false } = { breakline: false }) => {
        console.log(`${breakline ? '\n' : ''}${text}${breakline ? '\n' : ''}`);
    },
    /**
     * Display a break line
     */
    breakline: () => {
        console.log('\n');
    },
    /**
     * Display informational message (blue)
     * @param message - The message to display
     */
    info: (message) => {
        console.log(chalk_1.default.blue('ℹ'), sanitize(message));
    },
    /**
     * Display success message (green)
     * @param message - The message to display
     */
    success: (message) => {
        console.log(chalk_1.default.green('✔'), sanitize(message));
    },
    /**
     * Display warning message (yellow)
     * @param message - The message to display
     */
    warning: (message) => {
        console.log(chalk_1.default.yellow('⚠'), sanitize(message));
    },
    /**
     * Display error message (red)
     * @param message - The message to display
     */
    error: (message) => {
        console.error(chalk_1.default.red('✖'), sanitize(message));
    },
    /**
     * Create a spinner for async operations
     * @param text - The text to display with the spinner
     * @returns Ora spinner instance with start/succeed/fail/warn/stop methods
     */
    spinner: (text) => {
        return (0, ora_1.default)({
            text: sanitize(text),
            color: 'cyan',
        });
    },
    /**
     * Display a formatted table with headers and rows
     * @param options - Table configuration
     * @example
     * ```typescript
     * ui.table({
     *   headers: ['Name', 'Status', 'Type'],
     *   rows: [
     *     ['skill-1', 'active', 'frontend'],
     *     ['skill-2', 'inactive', 'backend']
     *   ],
     *   columnStyles: [chalk.cyan, chalk.green, chalk.dim]
     * });
     * ```
     */
    table: (options) => {
        const { headers, rows, columnStyles = [], indent = '  ' } = options;
        const columnWidths = headers.map((header, i) => {
            const maxDataWidth = Math.max(...rows.map(row => (row[i] || '').length));
            return Math.max(header.length, maxDataWidth);
        });
        const headerRow = headers.map((header, i) => {
            const style = columnStyles[i] || chalk_1.default.bold;
            return style(header.padEnd(columnWidths[i] + 2));
        }).join('');
        console.log(chalk_1.default.dim(indent) + headerRow);
        const totalWidth = columnWidths.reduce((sum, width) => sum + width + 2, 0);
        console.log(chalk_1.default.dim(indent + '─'.repeat(totalWidth)));
        rows.forEach(row => {
            const formattedRow = row.map((cell, i) => {
                const style = columnStyles[i] || ((text) => text);
                return style((cell || '').padEnd(columnWidths[i] + 2));
            }).join('');
            console.log(indent + formattedRow);
        });
    },
    /**
     * Display a summary section with title and items
     * @param options - Summary configuration
     * @example
     * ```typescript
     * ui.summary({
     *   title: 'Update Summary',
     *   items: [
     *     { type: 'success', count: 5, label: 'updated' },
     *     { type: 'warning', count: 2, label: 'skipped' },
     *     { type: 'error', count: 1, label: 'failed' }
     *   ],
     *   details: {
     *     title: 'Errors',
     *     items: [
     *       { message: 'Failed to update registry-1', tip: 'Check network connection' }
     *     ]
     *   }
     * });
     * ```
     */
    summary: (options) => {
        const { title = 'Summary', items, details } = options;
        console.log(chalk_1.default.bold(`\n\n${title}:`));
        items.forEach(item => {
            if (item.count > 0) {
                const symbol = item.type === 'success' ? '✓' :
                    item.type === 'warning' ? '⊘' :
                        item.type === 'error' ? '✗' : 'ℹ';
                const color = item.type === 'success' ? chalk_1.default.green :
                    item.type === 'warning' ? chalk_1.default.yellow :
                        item.type === 'error' ? chalk_1.default.red : chalk_1.default.blue;
                console.log(color(`  ${symbol} ${item.count} ${item.label}`));
            }
        });
        if (details && details.items.length > 0) {
            console.log(chalk_1.default.bold(`\n\n${details.title}:`));
            details.items.forEach(item => {
                console.log(chalk_1.default.red(`  • ${item.message}`));
                if (item.tip) {
                    console.log(chalk_1.default.dim(`    Tip: ${item.tip}`));
                }
            });
        }
    },
};
//# sourceMappingURL=terminal-ui.js.map