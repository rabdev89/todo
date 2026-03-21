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
export declare const ui: {
    /**
     * Display a text line
     * @param text - The text to display
     */
    text: (text: string, { breakline }?: {
        breakline?: boolean;
    }) => void;
    /**
     * Display a break line
     */
    breakline: () => void;
    /**
     * Display informational message (blue)
     * @param message - The message to display
     */
    info: (message: string) => void;
    /**
     * Display success message (green)
     * @param message - The message to display
     */
    success: (message: string) => void;
    /**
     * Display warning message (yellow)
     * @param message - The message to display
     */
    warning: (message: string) => void;
    /**
     * Display error message (red)
     * @param message - The message to display
     */
    error: (message: string) => void;
    /**
     * Create a spinner for async operations
     * @param text - The text to display with the spinner
     * @returns Ora spinner instance with start/succeed/fail/warn/stop methods
     */
    spinner: (text: string) => import("ora").Ora;
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
    table: (options: {
        headers: string[];
        rows: string[][];
        columnStyles?: Array<(text: string) => string>;
        indent?: string;
    }) => void;
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
    summary: (options: {
        title?: string;
        items: Array<{
            type: "success" | "warning" | "error" | "info";
            count: number;
            label: string;
        }>;
        details?: {
            title: string;
            items: Array<{
                message: string;
                tip?: string;
            }>;
        };
    }) => void;
};
