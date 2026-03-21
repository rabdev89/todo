import fs from 'fs-extra';
import path from 'path';
import { BobConfig } from '../shared/config';
import { BobStateManager } from '../bob/state_manager';
import { StateManager as TicketStateManager } from '../state_manager';

export interface HealthCheckResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validates the core framework status and current ticket metadata.
 * This is a pre-flight check to prevent engine crashes.
 */
export async function validateSystemState(): Promise<HealthCheckResult> {
  const result: HealthCheckResult = {
    valid: true,
    errors: [],
    warnings: []
  };

  const config = BobConfig.getInstance();
  const rootDir = config.getRootDir();

  // 1. Check bob.config.json
  const configPath = path.join(rootDir, 'bob.config.json');
  if (!await fs.pathExists(configPath)) {
    result.warnings.push(`bob.config.json not found at workspace root. Using default fallback paths.`);
  }

  try {
    // 2. Check framework_status.json
    const status = await BobStateManager.loadStatus().catch(() => null);
    if (!status) {
      result.valid = false;
      result.errors.push('framework_status.json is missing or corrupt.');
      return result; // Cannot continue without status
    }

    // 3. Check current ticket metadata if one is selected
    if (status.current_ticket_id) {
      const ticketMetadataPath = await TicketStateManager.getTicketPath(status.current_ticket_id);
      if (!ticketMetadataPath || !await fs.pathExists(ticketMetadataPath)) {
        result.valid = false;
        result.errors.push(`Metadata for current ticket ${status.current_ticket_id} is missing.`);
      } else {
        try {
          await TicketStateManager.getMetadata(status.current_ticket_id);
        } catch (e: any) {
          result.valid = false;
          result.errors.push(`Invalid metadata for ticket ${status.current_ticket_id}: ${e.message}`);
        }
      }
    }

    // 4. Check for project-management folder existence
    /*
    const pmDir = path.join(rootDir, config.getDirectory('project_management'));
    if (!await fs.pathExists(pmDir)) {
      result.valid = false;
      result.errors.push(`Project management directory not found at: ${pmDir}`);
    }
    */

  } catch (error: any) {
    result.valid = false;
    result.errors.push(`Critical health check error: ${error.message}`);
  }

  return result;
}
