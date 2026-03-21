/**
 * Bob Action Handlers Index
 *
 * Registry of all action handlers for the Bob workflow engine.
 * Imports and exports all handlers from specific modules.
 */
import type { ActionHandler } from '../types';
/**
 * Action handler registry
 * Maps action names to handler functions
 */
export declare const ActionHandlers: Record<string, ActionHandler>;
/**
 * Get handler for an action
 */
export declare function getHandler(action: string): ActionHandler | null;
/**
 * Check if handler exists
 */
export declare function hasHandler(action: string): boolean;
//# sourceMappingURL=index.d.ts.map